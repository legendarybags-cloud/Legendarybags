const CONNECTION_COOKIE = "la_meta_connection";
const STATE_COOKIE = "la_meta_state";
const CONNECTION_MAX_AGE = 60 * 60 * 24 * 30;
const STATE_MAX_AGE = 60 * 10;
const SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "pages_manage_engagement"
];

export async function onRequest(context) {
  const request = context.request;
  const action = routeAction(context.params);

  if (request.method === "GET" && (!action || action === "status")) return handleStatus(context);
  if (request.method === "GET" && action === "login") return handleLogin(context);
  if (request.method === "GET" && action === "callback") return handleCallback(context);
  if (request.method === "POST" && action === "post") return handlePost(context);
  if (request.method === "POST" && action === "disconnect") return handleDisconnect(context);

  return jsonResponse({ error: "Meta route not found." }, 404);
}

async function handleStatus(context) {
  const config = metaConfig(context);
  const connection = config.cookieSecret ? await readConnection(context.request, config.cookieSecret) : null;
  return jsonResponse({
    configured: config.configured,
    connected: Boolean(connection?.page?.accessToken),
    page: connection?.page ? { id: connection.page.id, name: connection.page.name } : null,
    pageCount: connection?.pageCount || 0,
    graphVersion: config.graphVersion,
    message: config.configured
      ? connection?.page?.accessToken
        ? "Facebook Page is connected."
        : "Ready to connect your Facebook Page."
      : "Add META_APP_ID, META_APP_SECRET, and META_COOKIE_SECRET in Cloudflare Pages settings."
  });
}

async function handleLogin(context) {
  const config = metaConfig(context);
  if (!config.configured) {
    return htmlResponse("Meta setup needed", "Add META_APP_ID, META_APP_SECRET, and META_COOKIE_SECRET in Cloudflare Pages settings before connecting Facebook.");
  }

  const state = randomToken(24);
  const authUrl = new URL(`https://www.facebook.com/${config.graphVersion}/dialog/oauth`);
  authUrl.searchParams.set("client_id", config.appId);
  authUrl.searchParams.set("redirect_uri", config.redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", SCOPES.join(","));
  authUrl.searchParams.set("response_type", "code");

  const headers = new Headers({ Location: authUrl.toString() });
  headers.append("Set-Cookie", serializeCookie(STATE_COOKIE, state, { maxAge: STATE_MAX_AGE, httpOnly: true }));
  return new Response(null, { status: 302, headers });
}

async function handleCallback(context) {
  const config = metaConfig(context);
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error_description") || url.searchParams.get("error");
  const cookies = parseCookies(context.request.headers.get("Cookie"));

  if (!config.configured) return htmlResponse("Meta setup needed", "Cloudflare Meta settings are missing.");
  if (error) return redirectWithState(context.request, "error");
  if (!code || !state || cookies[STATE_COOKIE] !== state) return redirectWithState(context.request, "error");

  try {
    const shortToken = await graphGet(config, "oauth/access_token", {
      client_id: config.appId,
      client_secret: config.appSecret,
      redirect_uri: config.redirectUri,
      code
    });
    const longToken = await graphGet(config, "oauth/access_token", {
      grant_type: "fb_exchange_token",
      client_id: config.appId,
      client_secret: config.appSecret,
      fb_exchange_token: shortToken.access_token
    });
    const userToken = longToken.access_token || shortToken.access_token;
    const accounts = await graphGet(config, "me/accounts", {
      fields: "id,name,access_token,tasks",
      access_token: userToken
    });
    const pages = Array.isArray(accounts.data) ? accounts.data : [];
    const page = pages.find((item) => item.access_token && hasPostingTask(item.tasks)) || pages.find((item) => item.access_token);
    if (!page) {
      return htmlResponse("No Facebook Page found", "Your Facebook account did not return a Page access token. Check that your account has access to manage the Page, then try again.");
    }

    const connection = {
      connectedAt: new Date().toISOString(),
      graphVersion: config.graphVersion,
      pageCount: pages.length,
      page: {
        id: page.id,
        name: page.name,
        tasks: Array.isArray(page.tasks) ? page.tasks : [],
        accessToken: page.access_token
      }
    };
    const encrypted = await encryptJson(connection, config.cookieSecret);
    const headers = new Headers({ Location: `${new URL(context.request.url).origin}/?facebook=connected` });
    headers.append("Set-Cookie", serializeCookie(CONNECTION_COOKIE, encrypted, { maxAge: CONNECTION_MAX_AGE, httpOnly: true }));
    headers.append("Set-Cookie", serializeCookie(STATE_COOKIE, "", { maxAge: 0, httpOnly: true }));
    return new Response(null, { status: 302, headers });
  } catch (error) {
    return redirectWithState(context.request, "error");
  }
}

async function handlePost(context) {
  const config = metaConfig(context);
  if (!config.configured) return jsonResponse({ error: "Meta app is not configured in Cloudflare." }, 400);

  const connection = await readConnection(context.request, config.cookieSecret);
  if (!connection?.page?.accessToken) return jsonResponse({ error: "Facebook Page is not connected." }, 401);

  let body = {};
  try {
    body = await context.request.json();
  } catch (error) {
    return jsonResponse({ error: "Post body must be JSON." }, 400);
  }
  const message = cleanText(body.message);
  if (!message) return jsonResponse({ error: "Post message is empty." }, 400);
  if (message.length > 5000) return jsonResponse({ error: "Post message is too long." }, 400);

  const result = await graphPost(config, `${connection.page.id}/feed`, {
    message,
    access_token: connection.page.accessToken
  });
  return jsonResponse({
    ok: true,
    page: { id: connection.page.id, name: connection.page.name },
    postId: result.id || ""
  });
}

async function handleDisconnect(context) {
  const headers = new Headers({ "Content-Type": "application/json; charset=utf-8" });
  headers.append("Set-Cookie", serializeCookie(CONNECTION_COOKIE, "", { maxAge: 0, httpOnly: true }));
  return new Response(JSON.stringify({ ok: true }), { headers });
}

function metaConfig(context) {
  const requestUrl = new URL(context.request.url);
  const env = context.env || {};
  const appId = env.META_APP_ID || "";
  const appSecret = env.META_APP_SECRET || "";
  const cookieSecret = env.META_COOKIE_SECRET || "";
  const graphVersion = env.META_GRAPH_VERSION || "v24.0";
  const redirectUri = env.META_REDIRECT_URI || `${requestUrl.origin}/api/meta/callback`;
  return {
    appId,
    appSecret,
    cookieSecret,
    graphVersion,
    redirectUri,
    configured: Boolean(appId && appSecret && cookieSecret)
  };
}

function routeAction(params = {}) {
  const raw = params.path;
  if (Array.isArray(raw)) return raw[0] || "";
  return String(raw || "").split("/").filter(Boolean)[0] || "";
}

async function graphGet(config, path, params) {
  const url = new URL(`https://graph.facebook.com/${config.graphVersion}/${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error?.message || "Meta API request failed.");
  return data;
}

async function graphPost(config, path, params) {
  const response = await fetch(`https://graph.facebook.com/${config.graphVersion}/${path}`, {
    method: "POST",
    body: new URLSearchParams(params)
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error?.message || "Meta API post failed.");
  return data;
}

function hasPostingTask(tasks) {
  return Array.isArray(tasks) && (tasks.includes("CREATE_CONTENT") || tasks.includes("MANAGE"));
}

async function readConnection(request, secret) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const value = cookies[CONNECTION_COOKIE];
  if (!value) return null;
  try {
    return await decryptJson(value, secret);
  } catch (error) {
    return null;
  }
}

async function encryptJson(value, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(secret);
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return `${base64Url(iv)}.${base64Url(new Uint8Array(encrypted))}`;
}

async function decryptJson(value, secret) {
  const [ivPart, dataPart] = String(value || "").split(".");
  if (!ivPart || !dataPart) return null;
  const key = await deriveKey(secret);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64Url(ivPart) },
    key,
    fromBase64Url(dataPart)
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}

async function deriveKey(secret) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

function parseCookies(header) {
  return String(header || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf("=");
      if (index < 0) return cookies;
      cookies[part.slice(0, index)] = decodeURIComponent(part.slice(index + 1));
      return cookies;
    }, {});
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "SameSite=Lax", "Secure"];
  if (options.httpOnly) parts.push("HttpOnly");
  if (Number.isFinite(options.maxAge)) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join("; ");
}

function randomToken(bytes) {
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return base64Url(data);
}

function base64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const padded = String(value).replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function cleanText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function redirectWithState(request, state) {
  return new Response(null, {
    status: 302,
    headers: { Location: `${new URL(request.url).origin}/?facebook=${state}` }
  });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function htmlResponse(title, message) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body><main style="font-family:Arial,sans-serif;max-width:640px;margin:40px auto;padding:20px;line-height:1.5"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><p><a href="/">Back to Lead Assistant</a></p></main></body></html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    }
  );
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
