const SOURCES = [
  {
    url: "https://zirrus.com/pages/discounts",
    name: "Zirrus discounts page"
  },
  {
    url: "https://zirrus.com/pages/mobile-plans",
    name: "Zirrus mobile plans page"
  },
  {
    url: "https://zirrus.com/pages/fiber-internet",
    name: "Zirrus fiber internet page"
  },
  {
    url: "https://zirrus.com/",
    name: "Zirrus home page"
  }
];

export async function onRequestGet() {
  const pages = await Promise.all(SOURCES.map(fetchSource));
  const promos = buildPromos(pages);
  return jsonResponse(
    {
      updatedAt: new Date().toISOString(),
      sources: pages.map((page) => ({
        name: page.name,
        url: page.url,
        ok: page.ok
      })),
      promos
    },
    {
      "Cache-Control": "public, max-age=1800"
    }
  );
}

async function fetchSource(source) {
  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "LeadAssistantPromoChecker/1.0"
      }
    });
    const html = await response.text();
    return {
      ...source,
      ok: response.ok,
      text: normalizeText(htmlToText(html))
    };
  } catch (error) {
    return {
      ...source,
      ok: false,
      text: ""
    };
  }
}

function buildPromos(pages) {
  const promos = [];
  const byUrl = Object.fromEntries(pages.map((page) => [page.url, page]));
  const discounts = byUrl["https://zirrus.com/pages/discounts"] || {};
  const mobile = byUrl["https://zirrus.com/pages/mobile-plans"] || {};
  const fiber = byUrl["https://zirrus.com/pages/fiber-internet"] || {};
  const home = byUrl["https://zirrus.com/"] || {};

  addPromo(promos, {
    title: "Internet + mobile bundle",
    objective: "bundle",
    source: discounts.url,
    requiredText: discounts.text,
    match: /additional discounts available.*bundle our internet and mobile services/i,
    text: "Additional discounts may be available for eligible customers who bundle Zirrus internet and mobile services."
  });

  addPromo(promos, {
    title: "Smart Wi-Fi with 1 Gig or higher",
    objective: "smart-wifi",
    source: discounts.url,
    requiredText: discounts.text,
    match: /smart wi-?fi is included on all fiber internet plans 1 gig or more/i,
    text: "Zirrus Smart Wi-Fi is included on Fiber Internet plans of 1 Gig or more."
  });

  addPromo(promos, {
    title: "Mobile AutoPay savings",
    objective: "mobile-autopay",
    source: mobile.url,
    requiredText: mobile.text,
    match: /\$5\/mo\.? discount.*paperless billing and autopay/i,
    text: "Zirrus mobile plan pricing can include a $5/mo per-line discount with paperless billing and AutoPay."
  });

  addPromo(promos, {
    title: "Mobile phone deals",
    objective: "iphone-trade",
    source: mobile.url,
    requiredText: mobile.text,
    match: /big deals|trade and save|no trade required|qualified customers/i,
    text: "Zirrus mobile has phone deals for qualified customers, including upgrade, trade-in, and no-trade-required offers."
  });

  addPromo(promos, {
    title: "Check address availability",
    objective: "address-check",
    source: fiber.url,
    requiredText: fiber.text,
    match: /check your address for available internet speeds and pricing/i,
    text: "Zirrus checks your address for available internet speeds and pricing."
  });

  addPromo(promos, {
    title: "Fiber internet benefits",
    objective: "fiber-speed",
    source: fiber.url,
    requiredText: fiber.text,
    match: /100% fiber to home|upload speeds as fast as download|fastest speeds available/i,
    text: "Zirrus Fiber Internet offers 100% fiber to the home with upload speeds as fast as download."
  });

  addPromo(promos, {
    title: "Business fiber and phone",
    objective: "business",
    source: home.url,
    requiredText: home.text,
    match: /100% fiber internet up to 6 gig|wi-fi 6 campus wide coverage|ethernet/i,
    text: "Zirrus business service includes 100% fiber internet up to 6 Gig, Wi-Fi 6 coverage, Ethernet options, and phone support."
  });

  return promos.slice(0, 8);
}

function addPromo(promos, promo) {
  if (!promo.requiredText || !promo.match.test(promo.requiredText)) return;
  if (promos.some((item) => item.text.toLowerCase() === promo.text.toLowerCase())) return;
  promos.push({
    title: promo.title,
    text: promo.text,
    objective: promo.objective,
    source: promo.source
  });
}

function htmlToText(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&ndash;|&mdash;/gi, "-");
}

function normalizeText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function jsonResponse(body, headers = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}
