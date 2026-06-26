(function () {
  const STORAGE_KEY = "lead-assistant-v2";
  const OLD_STORAGE_KEY = "lead-assistant-v1";
  const DB_NAME = "lead-assistant-store";
  const DB_VERSION = 1;
  const DB_STORE = "state";
  const DB_STATE_KEY = "current";

  const pricing = {
    bundleDiscount: 20,
    mobilePlans: [
      {
        id: "",
        name: "No mobile",
        shortName: "No mobile",
        bundleEligible: false,
        tabletPrice: null,
        data: "",
        hotspot: "",
        prices: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      },
      {
        id: "senior-1gb",
        name: "Senior 1GB Plan",
        shortName: "Senior",
        bundleEligible: false,
        tabletPrice: null,
        data: "1GB data",
        hotspot: "No hotspot listed",
        prices: { 1: 35, 2: 35, 3: 35, 4: 35, 5: 35 }
      },
      {
        id: "super-saver-5gb",
        name: "Super Saver 5GB Plan",
        shortName: "Super Saver",
        bundleEligible: false,
        tabletPrice: null,
        data: "5GB data",
        hotspot: "No hotspot listed",
        prices: { 1: 50, 2: 50, 3: 50, 4: 50, 5: 50 }
      },
      {
        id: "basic",
        name: "Basic",
        shortName: "Basic",
        bundleEligible: true,
        tabletPrice: 25,
        data: "22GB",
        hotspot: "No hotspot",
        prices: { 1: 80, 2: 70, 3: 60, 4: 50, 5: 50 }
      },
      {
        id: "preferred",
        name: "Preferred",
        shortName: "Preferred",
        bundleEligible: true,
        tabletPrice: 50,
        data: "50GB",
        hotspot: "15GB hotspot",
        prices: { 1: 90, 2: 80, 3: 70, 4: 60, 5: 60 }
      },
      {
        id: "freedom",
        name: "Freedom",
        shortName: "Freedom",
        bundleEligible: true,
        tabletPrice: null,
        data: "100GB",
        hotspot: "30GB hotspot",
        prices: { 1: 100, 2: 90, 3: 80, 4: 70, 5: 70 }
      }
    ],
    internetPlans: [
      { id: "", name: "No internet", speed: "", price: 0, bundleRank: 0, wifi: "" },
      { id: "250", name: "250 Mbps", speed: "250 Mbps", price: 39.99, bundleRank: 1, wifi: "" },
      { id: "500", name: "500 Mbps", speed: "500 Mbps", price: 54.99, bundleRank: 2, wifi: "" },
      { id: "1gig", name: "1 Gig", speed: "1 Gig", price: 69.99, bundleRank: 3, wifi: "Smart Wi-Fi 6 included" },
      { id: "2gig", name: "2 Gig", speed: "2 Gig", price: 99.99, bundleRank: 4, wifi: "Smart Wi-Fi 6 included" },
      { id: "3gig", name: "3 Gig", speed: "3 Gig", price: 129.99, bundleRank: 5, wifi: "Smart Wi-Fi 6 included" }
    ]
  };

  const marketingDefaults = {
    pageUrl: "",
    defaultArea: "",
    lastObjective: "address-check",
    monthlyPromo: "",
    monthlyPromoUpdatedAt: "",
    monthlyPromoMonth: "",
    promoSuggestions: [],
    lastPromoFetchAt: "",
    promoFetchError: "",
    groupsText: "",
    generatedDrafts: [],
    selectedDraftIndex: 0,
    posts: []
  };

  const textingDefaults = {
    importText: "",
    importedContacts: [],
    queueAudience: "due",
    queueTemplate: "",
    queue: [],
    selectedQueueId: "",
    lastImportAt: ""
  };

  const contactDefaults = {
    repName: "Nick Williams",
    businessName: "Zirrus",
    replyPhone: "336-986-6691",
    replyEmail: "nick.williams@zirrus.com"
  };

  const marketingCampaigns = {
    "address-check": {
      label: "Check address availability",
      interest: "internet",
      tags: "#Zirrus #FiberInternet #CheckAvailability",
      offer: "a quick Zirrus address check for available internet speeds and pricing",
      hook: "Zirrus checks service by address because available speeds and pricing can vary by location.",
      question: "Want me to check what Zirrus can offer at your address?",
      proof: "Address-specific speed and pricing check",
      disclosure: "Availability and pricing can vary by address."
    },
    "fiber-speed": {
      label: "Fiber internet speed",
      interest: "internet",
      tags: "#Zirrus #FiberInternet #FastInternet",
      offer: "fiber internet options from 250 Mbps to 3 Gig, with 1 Gig listed at $69.99/mo",
      hook: "Fiber helps when your home has streaming, gaming, work-from-home, cameras, or several connected devices.",
      question: "Would faster home internet make the biggest difference for you?",
      proof: "Zirrus fiber speed options and local availability check",
      disclosure: "Speeds, pricing, and installation options can vary by address."
    },
    "smart-wifi": {
      label: "Smart Wi-Fi 6",
      interest: "internet",
      tags: "#Zirrus #SmartWiFi #FiberInternet",
      offer: "Smart Wi-Fi 6 included on Zirrus internet speeds of 1 Gig or higher",
      hook: "A strong plan still needs Wi-Fi that reaches the rooms where people actually use it.",
      question: "Do you have rooms where the Wi-Fi drops or slows down?",
      proof: "Smart Wi-Fi 6 for 1 Gig or higher plans",
      disclosure: "Wi-Fi performance depends on home layout, devices, and selected plan."
    },
    bundle: {
      label: "Internet + mobile bundle",
      interest: "bundle",
      tags: "#Zirrus #FiberInternet #MobilePlans",
      offer: "1 Gig or higher internet plus an eligible Basic, Preferred, or Freedom mobile plan can save $20/mo",
      hook: "The bundle discount is worth checking if you need both home internet and mobile service.",
      question: "Want me to price internet and mobile together?",
      proof: "$20/mo bundle savings on eligible combinations",
      disclosure: "Bundle savings require 1 Gig or higher internet and an eligible mobile plan; Senior and Super Saver are not bundle eligible."
    },
    "mobile-autopay": {
      label: "Mobile AutoPay savings",
      interest: "mobile",
      tags: "#ZirrusMobile #MobilePlans #LocalService",
      offer: "Zirrus mobile plans starting at $35/mo, with a $5/mo per-line paperless billing and AutoPay discount where applicable",
      hook: "Line count changes the best recommendation, so a quick quote helps avoid guessing.",
      question: "How many mobile lines do you need me to price?",
      proof: "Nationwide 5G, unlimited talk and text plans, and local support",
      disclosure: "Plan pricing, eligibility, and discounts can vary by plan and setup."
    },
    "iphone-trade": {
      label: "iPhone/trade-in offer",
      interest: "mobile",
      tags: "#ZirrusMobile #iPhone #PhoneDeals",
      offer: "current Zirrus iPhone and trade-in offers, including qualified-customer bill-credit promos",
      hook: "If you are due for an upgrade, it is worth checking current phone promos before you buy elsewhere.",
      question: "Want me to check the current iPhone or trade-in offer for you?",
      proof: "Qualified-customer trade-in and bill-credit offers",
      disclosure: "Device offers can require qualified customers, trade-in eligibility, store details, and active promo terms."
    },
    "local-service": {
      label: "Local Zirrus service",
      interest: "bundle",
      tags: "#Zirrus #LocalService #NorthCarolina",
      offer: "local Zirrus help for internet, mobile, phone, and service questions",
      hook: "You can work with a local person instead of trying to figure out packages alone.",
      question: "Want a local quote instead of guessing online?",
      proof: "Local stores, local support, and address-based recommendations",
      disclosure: "A quick check is needed before quoting final availability and setup details."
    },
    business: {
      label: "Business internet/phone",
      interest: "internet",
      tags: "#ZirrusBusiness #BusinessInternet #FiberInternet",
      offer: "Zirrus business fiber internet, Wi-Fi coverage, phone, and mobile options",
      hook: "Reliable internet and phones help keep payments, calls, and customers moving.",
      question: "Does your business need a better internet or phone setup?",
      proof: "Business fiber, Wi-Fi, Ethernet, phone, and mobile options",
      disclosure: "Business recommendations depend on location, users, devices, and service needs."
    }
  };

  const legacyMarketingObjectives = {
    fiber: "fiber-speed",
    mobile: "mobile-autopay",
    availability: "address-check",
    switcher: "local-service"
  };

  const defaults = {
    settings: {
      repName: contactDefaults.repName,
      businessName: contactDefaults.businessName,
      replyPhone: contactDefaults.replyPhone,
      replyEmail: contactDefaults.replyEmail,
      businessAddress: ""
    },
    templates: {
      smsInitial:
        "Hi {{firstName}}, this is {{repName}} with {{businessName}}. I put together this quote for you: {{quoteSummarySms}}. Call or text me at {{replyPhone}} and I can help get it set up. Reply STOP to opt out.",
      emailInitial:
        "Hi {{firstName}},\n\nThis is {{repName}} with {{businessName}}. I put together this quote based on what you asked about:\n\n{{quoteSummary}}\n\nI can help check availability, compare options, and get everything set up.\n\nYou can reply here or call/text me at {{replyPhone}}.\n\n{{businessName}}\n{{businessAddress}}\nTo opt out, reply with unsubscribe.",
      smsFollowUp:
        "Hi {{firstName}}, this is {{repName}} with {{businessName}} following up on your quote: {{quoteSummarySms}}. Do you still want me to check options for you? Reply STOP to opt out.",
      emailFollowUp:
        "Hi {{firstName}},\n\nI wanted to follow up on your Zirrus quote:\n\n{{quoteSummary}}\n\nYou can reply here or reach me at {{replyPhone}}.\n\n{{businessName}}\n{{businessAddress}}\nTo opt out, reply with unsubscribe.",
      smsAppointment:
        "Hi {{firstName}}, this is {{repName}} with {{businessName}} confirming your appointment for {{appointmentDateTime}}. If you need to change it, call or text me at {{replyPhone}}. Reply STOP to opt out.",
      emailAppointment:
        "Hi {{firstName}},\n\nThis is {{repName}} with {{businessName}} confirming your appointment for {{appointmentDateTime}}.\n\nYour current quote:\n{{quoteSummary}}\n\nIf you need to change anything, reply here or call/text me at {{replyPhone}}.\n\n{{businessName}}\n{{businessAddress}}\nTo opt out, reply with unsubscribe."
    },
    leads: [],
    marketing: clone(marketingDefaults),
    texting: clone(textingDefaults),
    dailyReviewAt: "",
    lastBackupAt: "",
    lastSavedAt: ""
  };

  let state = loadState();
  let deferredInstallPrompt = null;
  let durableSaveTimer = null;
  const durableStatus = {
    supported: "indexedDB" in window,
    persisted: false,
    lastSavedAt: "",
    error: ""
  };

  const el = {
    leadEntryPanel: document.getElementById("leadEntryPanel"),
    leadForm: document.getElementById("leadForm"),
    formTitle: document.getElementById("formTitle"),
    formSubtitle: document.getElementById("formSubtitle"),
    editingLeadId: document.getElementById("editingLeadId"),
    saveLeadButton: document.getElementById("saveLeadButton"),
    cancelEditButton: document.getElementById("cancelEditButton"),
    quickPaste: document.getElementById("quickPaste"),
    leadPhotoInput: document.getElementById("leadPhotoInput"),
    leadFileInput: document.getElementById("leadFileInput"),
    ocrPreview: document.getElementById("ocrPreview"),
    ocrStatus: document.getElementById("ocrStatus"),
    ocrText: document.getElementById("ocrText"),
    useOcrTextButton: document.getElementById("useOcrTextButton"),
    readClipboardButton: document.getElementById("readClipboardButton"),
    parsePasteButton: document.getElementById("parsePasteButton"),
    leadInterest: document.getElementById("leadInterest"),
    leadMobilePlan: document.getElementById("leadMobilePlan"),
    leadMobileLines: document.getElementById("leadMobileLines"),
    leadInternetSpeed: document.getElementById("leadInternetSpeed"),
    leadTabletCount: document.getElementById("leadTabletCount"),
    leadQuoteSummary: document.getElementById("leadQuoteSummary"),
    appointmentStatus: document.getElementById("appointmentStatus"),
    copyLeadQuoteButton: document.getElementById("copyLeadQuoteButton"),
    quoteMobilePlan: document.getElementById("quoteMobilePlan"),
    quoteMobileLines: document.getElementById("quoteMobileLines"),
    quoteInternetSpeed: document.getElementById("quoteInternetSpeed"),
    quoteTabletCount: document.getElementById("quoteTabletCount"),
    quickQuoteSummary: document.getElementById("quickQuoteSummary"),
    copyQuickQuoteButton: document.getElementById("copyQuickQuoteButton"),
    applyQuickQuoteButton: document.getElementById("applyQuickQuoteButton"),
    marketingForm: document.getElementById("marketingForm"),
    marketingObjective: document.getElementById("marketingObjective"),
    marketingTone: document.getElementById("marketingTone"),
    marketingAudience: document.getElementById("marketingAudience"),
    marketingChannel: document.getElementById("marketingChannel"),
    marketingOffer: document.getElementById("marketingOffer"),
    marketingHook: document.getElementById("marketingHook"),
    marketingMonthlyPromo: document.getElementById("marketingMonthlyPromo"),
    marketingPostDate: document.getElementById("marketingPostDate"),
    marketingPageUrl: document.getElementById("marketingPageUrl"),
    generateMarketingButton: document.getElementById("generateMarketingButton"),
    saveMarketingPostButton: document.getElementById("saveMarketingPostButton"),
    copyMarketingDraftButton: document.getElementById("copyMarketingDraftButton"),
    saveMarketingPromoButton: document.getElementById("saveMarketingPromoButton"),
    refreshMarketingPromosButton: document.getElementById("refreshMarketingPromosButton"),
    marketingPromoStatus: document.getElementById("marketingPromoStatus"),
    marketingPromoSuggestions: document.getElementById("marketingPromoSuggestions"),
    connectMetaButton: document.getElementById("connectMetaButton"),
    refreshMetaStatusButton: document.getElementById("refreshMetaStatusButton"),
    postSelectedToMetaButton: document.getElementById("postSelectedToMetaButton"),
    disconnectMetaButton: document.getElementById("disconnectMetaButton"),
    metaConnectionStatus: document.getElementById("metaConnectionStatus"),
    metaConnectionPill: document.getElementById("metaConnectionPill"),
    openBusinessSuiteButton: document.getElementById("openBusinessSuiteButton"),
    openBusinessSuiteQuickButton: document.getElementById("openBusinessSuiteQuickButton"),
    openMetaPlannerButton: document.getElementById("openMetaPlannerButton"),
    generatedPosts: document.getElementById("generatedPosts"),
    marketingQueue: document.getElementById("marketingQueue"),
    marketingStats: document.getElementById("marketingStats"),
    marketingGroupsText: document.getElementById("marketingGroupsText"),
    saveMarketingGroupsButton: document.getElementById("saveMarketingGroupsButton"),
    textPhotoInput: document.getElementById("textPhotoInput"),
    textFileInput: document.getElementById("textFileInput"),
    textOcrPreview: document.getElementById("textOcrPreview"),
    textOcrStatus: document.getElementById("textOcrStatus"),
    textImportText: document.getElementById("textImportText"),
    scanTextsButton: document.getElementById("scanTextsButton"),
    clearTextImportButton: document.getElementById("clearTextImportButton"),
    textImportResults: document.getElementById("textImportResults"),
    textAudience: document.getElementById("textAudience"),
    textQueueTemplate: document.getElementById("textQueueTemplate"),
    buildTextQueueButton: document.getElementById("buildTextQueueButton"),
    openNextTextButton: document.getElementById("openNextTextButton"),
    copySelectedTextButton: document.getElementById("copySelectedTextButton"),
    textQueueList: document.getElementById("textQueueList"),
    textContactList: document.getElementById("textContactList"),
    textingStats: document.getElementById("textingStats"),
    pricingTables: document.getElementById("pricingTables"),
    leadList: document.getElementById("leadList"),
    todayQueueList: document.getElementById("todayQueueList"),
    dueLeadList: document.getElementById("dueLeadList"),
    appointmentLeadList: document.getElementById("appointmentLeadList"),
    hotLeadList: document.getElementById("hotLeadList"),
    dailyCloseout: document.getElementById("dailyCloseout"),
    productivityStats: document.getElementById("productivityStats"),
    statsGrid: document.getElementById("statsGrid"),
    saveStatus: document.getElementById("saveStatus"),
    searchInput: document.getElementById("searchInput"),
    statusFilter: document.getElementById("statusFilter"),
    smsInitialTemplate: document.getElementById("smsInitialTemplate"),
    emailInitialTemplate: document.getElementById("emailInitialTemplate"),
    smsFollowUpTemplate: document.getElementById("smsFollowUpTemplate"),
    emailFollowUpTemplate: document.getElementById("emailFollowUpTemplate"),
    smsAppointmentTemplate: document.getElementById("smsAppointmentTemplate"),
    emailAppointmentTemplate: document.getElementById("emailAppointmentTemplate"),
    saveTemplatesButton: document.getElementById("saveTemplatesButton"),
    resetTemplatesButton: document.getElementById("resetTemplatesButton"),
    settingsForm: document.getElementById("settingsForm"),
    exportJsonButton: document.getElementById("exportJsonButton"),
    downloadBackupButton: document.getElementById("downloadBackupButton"),
    shareBackupButton: document.getElementById("shareBackupButton"),
    copyBackupButton: document.getElementById("copyBackupButton"),
    importBackupInput: document.getElementById("importBackupInput"),
    exportCsvButton: document.getElementById("exportCsvButton"),
    clearClosedButton: document.getElementById("clearClosedButton"),
    enableAlertsButton: document.getElementById("enableAlertsButton"),
    installButton: document.getElementById("installButton"),
    markDailyReviewButton: document.getElementById("markDailyReviewButton"),
    workNextButton: document.getElementById("workNextButton"),
    workNextPanel: document.getElementById("workNextPanel"),
    unifiedInboxList: document.getElementById("unifiedInboxList"),
    automationRulesList: document.getElementById("automationRulesList"),
    openCaptureButton: document.getElementById("openCaptureButton"),
    toast: document.getElementById("toast")
  };

  let metaConnection = {
    configured: false,
    connected: false,
    loading: true,
    pageName: "",
    message: "Checking Facebook Page connection..."
  };

  init();

  function init() {
    populateQuoteSelects();
    fillEditors();
    handleIncomingShare();
    renderPricingTables();
    renderQuoteSummaries();
    renderAll();
    wireEvents();
    handleMetaReturn();
    loadMetaConnectionStatus({ quiet: true });
    setupInstallSupport();
    requestPersistentStorage();
    restoreDurableStateIfNeeded();
    maybeRefreshMarketingPromos();
    setInterval(checkReminderAlerts, 60000);
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY));
      if (!saved || typeof saved !== "object") return clone(defaults);
      return normalizeState(saved);
    } catch (error) {
      return clone(defaults);
    }
  }

  function saveState() {
    state.lastSavedAt = new Date().toISOString();
    const serialized = JSON.stringify(state);
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
      durableStatus.error = "";
    } catch (error) {
      durableStatus.error = "Browser storage is full. Export a backup now.";
    }
    scheduleDurableSave(serialized, state.lastSavedAt);
    renderSaveStatus();
  }

  function normalizeState(source) {
    const imported = source && typeof source === "object" ? source : {};
    const leads = Array.isArray(imported.leads) ? imported.leads.map(normalizeLead) : [];
    return {
      ...clone(defaults),
      ...imported,
      settings: normalizeSettings({ ...defaults.settings, ...(imported.settings || {}) }),
      templates: { ...defaults.templates, ...(imported.templates || {}) },
      marketing: normalizeMarketing(imported.marketing),
      texting: normalizeTexting(imported.texting),
      leads,
      lastBackupAt: imported.lastBackupAt || "",
      lastSavedAt: imported.lastSavedAt || latestSavedAt(imported, leads)
    };
  }

  function latestSavedAt(source, leads) {
    const leadDates = leads.flatMap((lead) => [lead.updatedAt, lead.createdAt, lead.lastTouchAt]);
    const latest = [source.lastBackupAt, source.dailyReviewAt, ...leadDates]
      .map(dateValue)
      .filter(Boolean)
      .sort((a, b) => b - a)[0];
    return latest ? new Date(latest).toISOString() : "";
  }

  function normalizeSettings(settings) {
    const normalized = { ...settings };
    const oldDefaultPhones = new Set(["", "336.463.5075", "336-463-5075", "336.463.5022", "336-463-5022"]);
    if (!String(normalized.repName || "").trim()) normalized.repName = contactDefaults.repName;
    if (!String(normalized.businessName || "").trim()) normalized.businessName = contactDefaults.businessName;
    if (!String(normalized.replyEmail || "").trim()) normalized.replyEmail = contactDefaults.replyEmail;
    if (oldDefaultPhones.has(String(normalized.replyPhone || "").trim())) normalized.replyPhone = contactDefaults.replyPhone;
    return normalized;
  }

  async function requestPersistentStorage() {
    if (!navigator.storage || !navigator.storage.persisted) {
      renderSaveStatus();
      return;
    }
    try {
      durableStatus.persisted = await navigator.storage.persisted();
      if (!durableStatus.persisted && navigator.storage.persist) {
        durableStatus.persisted = await navigator.storage.persist();
      }
    } catch (error) {
      durableStatus.persisted = false;
    }
    renderSaveStatus();
  }

  function scheduleDurableSave(serialized, savedAt) {
    if (!durableStatus.supported) {
      renderSaveStatus();
      return;
    }
    clearTimeout(durableSaveTimer);
    durableSaveTimer = window.setTimeout(() => {
      saveDurableState(serialized, savedAt).catch(() => {
        durableStatus.error = "Phone backup mirror failed. Export a backup.";
        renderSaveStatus();
      });
    }, 200);
  }

  async function saveDurableState(serialized, savedAt) {
    const db = await openDurableDb();
    await putDurableRecord(db, {
      id: DB_STATE_KEY,
      savedAt,
      payload: serialized
    });
    db.close();
    durableStatus.lastSavedAt = savedAt;
    durableStatus.error = "";
    renderSaveStatus();
  }

  async function restoreDurableStateIfNeeded() {
    if (!durableStatus.supported) {
      renderSaveStatus();
      return;
    }
    try {
      const db = await openDurableDb();
      const record = await getDurableRecord(db);
      db.close();
      if (!record || !record.payload) {
        if (state.leads.length || state.lastSavedAt) scheduleDurableSave(JSON.stringify(state), state.lastSavedAt || new Date().toISOString());
        renderSaveStatus();
        return;
      }
      durableStatus.lastSavedAt = record.savedAt || "";
      const durableState = normalizeState(JSON.parse(record.payload));
      const durableTime = dateValue(durableState.lastSavedAt || record.savedAt);
      const currentTime = dateValue(state.lastSavedAt);
      const shouldRestore = durableTime > currentTime || (!state.leads.length && durableState.leads.length);
      if (shouldRestore) {
        state = durableState;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        fillEditors();
        renderQuoteSummaries();
        renderAll();
        toast("Restored saved phone data.");
      } else {
        scheduleDurableSave(JSON.stringify(state), state.lastSavedAt || new Date().toISOString());
      }
      renderSaveStatus();
    } catch (error) {
      durableStatus.error = "Could not check phone backup mirror.";
      renderSaveStatus();
    }
  }

  function openDurableDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function putDurableRecord(db, record) {
    return new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE, "readwrite").objectStore(DB_STORE).put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  function getDurableRecord(db) {
    return new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).get(DB_STATE_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  function wireEvents() {
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.addEventListener("click", () => switchView(button.dataset.view));
    });
    document.querySelectorAll("[data-jump-view]").forEach((button) => {
      button.addEventListener("click", () => switchView(button.dataset.jumpView));
    });
    document.querySelectorAll("[data-scroll-target]").forEach((button) => {
      button.addEventListener("click", () => scrollToId(button.dataset.scrollTarget));
    });

    el.leadForm.addEventListener("submit", saveLeadFromForm);
    el.cancelEditButton.addEventListener("click", () => {
      resetLeadForm();
      closeCapturePanel();
    });
    el.openCaptureButton.addEventListener("click", () => openCapturePanel("name"));
    el.leadPhotoInput.addEventListener("change", handlePhotoSelected);
    el.leadFileInput.addEventListener("change", handleFileSelected);
    el.useOcrTextButton.addEventListener("click", fillLeadFromOcrText);
    el.readClipboardButton.addEventListener("click", readClipboardIntoPasteBox);
    el.parsePasteButton.addEventListener("click", fillLeadFromPaste);
    el.copyLeadQuoteButton.addEventListener("click", () => copyText(quoteSummaryText(readLeadQuote(), { sms: false })));
    el.copyQuickQuoteButton.addEventListener("click", () => copyText(quoteSummaryText(readQuickQuote(), { sms: false })));
    el.applyQuickQuoteButton.addEventListener("click", applyQuickQuoteToLeadForm);
    el.generateMarketingButton.addEventListener("click", generateMarketingDrafts);
    el.marketingForm.addEventListener("submit", saveMarketingPost);
    el.copyMarketingDraftButton.addEventListener("click", copySelectedMarketingDraft);
    el.saveMarketingPromoButton.addEventListener("click", saveMarketingPromo);
    el.refreshMarketingPromosButton.addEventListener("click", () => refreshMarketingPromos({ applyTop: true }));
    el.connectMetaButton.addEventListener("click", connectMetaPage);
    el.refreshMetaStatusButton.addEventListener("click", () => loadMetaConnectionStatus({ quiet: false }));
    el.postSelectedToMetaButton.addEventListener("click", postSelectedDraftToMeta);
    el.disconnectMetaButton.addEventListener("click", disconnectMetaPage);
    el.openBusinessSuiteButton.addEventListener("click", openBusinessSuite);
    el.openBusinessSuiteQuickButton.addEventListener("click", openBusinessSuite);
    el.openMetaPlannerButton.addEventListener("click", openBusinessSuite);
    el.saveMarketingGroupsButton.addEventListener("click", saveMarketingGroups);
    el.textPhotoInput.addEventListener("change", (event) => handleTextFileSelected(event, "photo"));
    el.textFileInput.addEventListener("change", (event) => handleTextFileSelected(event, "file"));
    el.scanTextsButton.addEventListener("click", () => scanTextImport({ quiet: false }));
    el.clearTextImportButton.addEventListener("click", clearTextImport);
    el.buildTextQueueButton.addEventListener("click", buildTextQueue);
    el.openNextTextButton.addEventListener("click", openNextQueuedText);
    el.copySelectedTextButton.addEventListener("click", copySelectedQueuedText);
    el.textAudience.addEventListener("change", () => {
      state.texting.queueAudience = el.textAudience.value;
      saveState();
    });
    el.textQueueTemplate.addEventListener("input", () => {
      state.texting.queueTemplate = el.textQueueTemplate.value;
      saveState();
    });
    document.querySelectorAll("[data-quote-input]").forEach((input) => {
      input.addEventListener("change", renderQuoteSummaries);
      input.addEventListener("input", renderQuoteSummaries);
    });
    document.querySelectorAll("[data-form-follow]").forEach((button) => {
      button.addEventListener("click", () => setFormFollowUp(button.dataset.formFollow));
    });
    document.querySelectorAll("[data-form-appointment]").forEach((button) => {
      button.addEventListener("click", () => setFormAppointment(button.dataset.formAppointment));
    });
    el.searchInput.addEventListener("input", renderLeads);
    el.statusFilter.addEventListener("change", renderLeads);
    el.saveTemplatesButton.addEventListener("click", saveTemplates);
    el.resetTemplatesButton.addEventListener("click", resetTemplates);
    el.settingsForm.addEventListener("submit", saveSettings);
    el.exportJsonButton.addEventListener("click", downloadBackup);
    el.downloadBackupButton.addEventListener("click", downloadBackup);
    el.shareBackupButton.addEventListener("click", shareBackup);
    el.copyBackupButton.addEventListener("click", copyBackup);
    el.importBackupInput.addEventListener("change", importBackup);
    el.exportCsvButton.addEventListener("click", exportCsv);
    el.clearClosedButton.addEventListener("click", clearClosed);
    el.enableAlertsButton.addEventListener("click", enableAlerts);
    el.installButton.addEventListener("click", installApp);
    el.markDailyReviewButton.addEventListener("click", markDailyReview);
    el.workNextButton.addEventListener("click", focusWorkNext);
  }

  function setupInstallSupport() {
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      el.installButton.hidden = false;
    });

    if (isIos() && !isStandalone()) {
      el.installButton.hidden = false;
      el.installButton.textContent = "Install help";
    }
  }

  async function installApp() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice.catch(() => null);
      deferredInstallPrompt = null;
      el.installButton.hidden = true;
      return;
    }
    if (isIos()) {
      toast("On iPhone: Share, then Add to Home Screen.");
      return;
    }
    toast("Install needs Chrome/Edge from an HTTPS or localhost page.");
  }

  function switchView(viewName) {
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.view === viewName);
    });
    document.querySelectorAll(".view").forEach((view) => {
      view.classList.toggle("active-view", view.id === `${viewName}View`);
    });
  }

  function openCapturePanel(focusTarget) {
    if (el.leadEntryPanel) el.leadEntryPanel.open = true;
    const target = {
      name: document.getElementById("leadName"),
      paste: el.quickPaste
    }[focusTarget];
    window.setTimeout(() => {
      el.leadEntryPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
      target?.focus();
    }, 50);
  }

  function closeCapturePanel() {
    if (el.leadEntryPanel && !el.editingLeadId.value) el.leadEntryPanel.open = false;
  }

  function populateQuoteSelects() {
    [el.leadMobilePlan, el.quoteMobilePlan].forEach((select) => {
      select.innerHTML = pricing.mobilePlans
        .map((plan) => `<option value="${escapeHtml(plan.id)}">${escapeHtml(plan.name)}</option>`)
        .join("");
    });
    [el.leadInternetSpeed, el.quoteInternetSpeed].forEach((select) => {
      select.innerHTML = pricing.internetPlans
        .map((plan) => {
          const label = plan.id ? `${plan.name} - ${formatMoney(plan.price)}/mo` : plan.name;
          return `<option value="${escapeHtml(plan.id)}">${escapeHtml(label)}</option>`;
        })
        .join("");
    });
  }

  function fillEditors() {
    el.smsInitialTemplate.value = state.templates.smsInitial;
    el.emailInitialTemplate.value = state.templates.emailInitial;
    el.smsFollowUpTemplate.value = state.templates.smsFollowUp;
    el.emailFollowUpTemplate.value = state.templates.emailFollowUp;
    el.smsAppointmentTemplate.value = state.templates.smsAppointment;
    el.emailAppointmentTemplate.value = state.templates.emailAppointment;
    for (const [key, value] of Object.entries(state.settings)) {
      const input = document.getElementById(key);
    if (input) input.value = value;
    }
    if (el.marketingObjective) {
      el.marketingObjective.value = normalizeMarketingObjective(
        state.marketing.lastObjective || state.marketing.generatedDrafts?.[0]?.objective || "address-check"
      );
    }
    if (el.marketingAudience) el.marketingAudience.value = state.marketing.defaultArea || "";
    if (el.marketingMonthlyPromo) el.marketingMonthlyPromo.value = state.marketing.monthlyPromo || "";
    if (el.marketingPageUrl) el.marketingPageUrl.value = state.marketing.pageUrl || "";
    if (el.marketingPostDate && !el.marketingPostDate.value) el.marketingPostDate.value = toLocalDatetimeValue(tomorrowMarketingTime());
    if (el.marketingGroupsText) el.marketingGroupsText.value = state.marketing.groupsText || "";
    if (el.textImportText) el.textImportText.value = state.texting.importText || "";
    if (el.textAudience) el.textAudience.value = state.texting.queueAudience || "due";
    if (el.textQueueTemplate) el.textQueueTemplate.value = state.texting.queueTemplate || defaultTextQueueTemplate();
  }

  function renderAll() {
    renderSaveStatus();
    renderStats();
    renderWorkNextPanel();
    renderUnifiedInbox();
    renderAutomationRules();
    renderTodayQueue();
    renderDueLeads();
    renderAppointments();
    renderHotLeads();
    renderDailyCloseout();
    renderProductivityStats();
    renderMarketing();
    renderLeads();
    renderTextOrganizer();
  }

  function renderSaveStatus() {
    if (!el.saveStatus) return;
    const localSaved = state.lastSavedAt ? formatDateTime(state.lastSavedAt) : "Not saved yet";
    const phoneMirror = durableStatus.supported
      ? durableStatus.lastSavedAt
        ? `Phone backup ${formatDateTime(durableStatus.lastSavedAt)}`
        : "Phone backup pending"
      : "Phone backup unavailable";
    const storageProtection = durableStatus.persisted ? "Protected storage on" : "Protected storage requested";
    const backupAge = state.lastBackupAt ? Date.now() - dateValue(state.lastBackupAt) : Infinity;
    const backupNeeded = backupAge > 7 * 24 * 60 * 60 * 1000;
    const backupText = state.lastBackupAt ? `Exported ${formatDateTime(state.lastBackupAt)}` : "No export yet";
    const warning = durableStatus.error || (backupNeeded ? "Share or download a backup before changing phones." : "Backups look current.");

    el.saveStatus.innerHTML = `
      <div>
        <strong>Saved on this phone</strong>
        <span>${escapeHtml(localSaved)}</span>
      </div>
      <div>
        <strong>Extra phone copy</strong>
        <span>${escapeHtml(`${phoneMirror} | ${storageProtection}`)}</span>
      </div>
      <div class="${backupNeeded || durableStatus.error ? "save-warning" : ""}">
        <strong>External backup</strong>
        <span>${escapeHtml(`${backupText}. ${warning}`)}</span>
      </div>
    `;
  }

  function renderQuoteSummaries() {
    el.leadQuoteSummary.innerHTML = quoteSummaryHtml(readLeadQuote());
    el.quickQuoteSummary.innerHTML = quoteSummaryHtml(readQuickQuote());
    updateInterestFromLeadQuote();
  }

  function renderStats() {
    const now = new Date();
    const due = state.leads.filter((lead) => isDue(lead, now));
    const open = state.leads.filter((lead) => !["won", "lost"].includes(lead.status));
    const appointmentsToday = state.leads.filter((lead) => isAppointmentToday(lead, now));
    const hot = state.leads.filter((lead) => lead.priority === "hot" && !["won", "lost"].includes(lead.status));

    const stats = [
      ["Open leads", open.length],
      ["Due now", due.length],
      ["Appts today", appointmentsToday.length],
      ["Hot leads", hot.length]
    ];

    el.statsGrid.innerHTML = stats
      .map(([label, value]) => `<div class="stat-card"><strong>${value}</strong><span>${escapeHtml(label)}</span></div>`)
      .join("");
  }

  function renderWorkNextPanel() {
    if (!el.workNextPanel) return;
    const item = buildWorkQueue()[0];
    if (!item) {
      el.workNextPanel.innerHTML = `<div class="empty-state">Nothing urgent. Add a lead, refresh promos, or review tomorrow's appointments.</div>`;
      return;
    }
    el.workNextPanel.innerHTML = renderWorkItemCard(item, true);
    bindAutopilotActions(el.workNextPanel);
  }

  function renderUnifiedInbox() {
    if (!el.unifiedInboxList) return;
    const items = buildWorkQueue().slice(0, 12);
    el.unifiedInboxList.innerHTML = items.length
      ? `<div class="inbox-list">${items.map((item) => renderWorkItemCard(item, false)).join("")}</div>`
      : `<div class="empty-state">Inbox is clear. New texts, due follow-ups, missing reminders, and queued posts will show here.</div>`;
    bindAutopilotActions(el.unifiedInboxList);
  }

  function renderAutomationRules() {
    if (!el.automationRulesList) return;
    const rules = [
      ["Call opened", "sets a 2 hour follow-up unless an outcome overrides it"],
      ["Text opened", "sets tomorrow morning follow-up and logs the touch"],
      ["Email opened", "sets a 3 day follow-up"],
      ["No answer", "sets a 2 hour follow-up"],
      ["Interested", "marks hot and follows up in 2 hours"],
      ["Appointment missed", "marks hot and follows up in 30 minutes"]
    ];
    el.automationRulesList.innerHTML = `
      <div class="rule-list">
        ${rules.map(([title, detail]) => `<div class="rule-row"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></div>`).join("")}
      </div>
    `;
  }

  function buildWorkQueue() {
    const now = new Date();
    const items = [];
    state.leads
      .filter((lead) => !["won", "lost"].includes(lead.status))
      .forEach((lead) => {
        const missingFollowUp = !lead.followUpAt && lead.status !== "new";
        const untouchedNew = lead.status === "new" && !lead.lastTouchAt;
        let reason = "";
        let score = leadUrgencyScore(lead, now);
        if (isAppointmentSoon(lead, now)) {
          reason = "Appointment within 1 hour";
          score += 150;
        } else if (isAppointmentToday(lead, now)) {
          reason = "Appointment today";
          score += 125;
        } else if (isDue(lead, now)) {
          reason = "Due follow-up";
          score += 115;
        } else if (lead.priority === "hot") {
          reason = missingFollowUp ? "Hot lead needs a follow-up time" : "Hot lead";
          score += 85;
        } else if (untouchedNew) {
          reason = "New lead untouched";
          score += 70;
        } else if (missingFollowUp) {
          reason = "Missing follow-up";
          score += 55;
        }
        if (!reason) return;
        items.push({
          type: "lead",
          id: lead.id,
          title: lead.name || lead.phone || "Unnamed lead",
          subtitle: formatContact(lead) || labelStatus(lead.status),
          detail: lead.followUpAt ? `Follow-up ${formatDateTime(lead.followUpAt)}` : quoteSummaryText(lead.quote, { sms: true }),
          reason,
          score,
          lead
        });
      });

    state.texting.importedContacts
      .filter((contact) => contact.phone && !contact.linkedLeadId && !findLeadByPhone(contact.phone))
      .forEach((contact) => {
        const due = contact.followUpAt && dateValue(contact.followUpAt) <= now.getTime();
        items.push({
          type: "text",
          id: contact.id,
          title: contact.name || formatPhoneDisplay(contact.phone) || "Unsaved text contact",
          subtitle: formatPhoneDisplay(contact.phone),
          detail: contact.snippet || "Imported text contact",
          reason: due ? "Text follow-up due" : "Unsaved text contact",
          score: due ? 105 : 62,
          contact
        });
      });

    (state.marketing.posts || [])
      .filter((post) => post.status === "planned" && post.scheduledAt && dateValue(post.scheduledAt) <= now.getTime())
      .forEach((post) => {
        items.push({
          type: "marketing",
          id: post.id,
          title: labelMarketingObjective(post.objective),
          subtitle: labelMarketingChannel(post.channel),
          detail: post.text || post.offer || "",
          reason: "Facebook post due",
          score: 48,
          post
        });
      });

    return items.sort((a, b) => b.score - a.score || String(a.title).localeCompare(String(b.title)));
  }

  function renderWorkItemCard(item, featured) {
    const lead = item.lead;
    const contact = item.contact;
    const post = item.post;
    const typeClass = item.type === "lead" ? "lead" : item.type === "text" ? "text" : "marketing";
    const actions =
      item.type === "lead"
        ? `
          <button class="secondary-button" data-auto-action="call" type="button" ${lead.phone ? "" : "disabled"}>Call</button>
          <button class="secondary-button" data-auto-action="text" type="button" ${lead.phone && lead.smsConsent ? "" : "disabled"}>Text</button>
          <button class="secondary-button" data-auto-action="noAnswer" type="button">No answer</button>
          <button class="secondary-button" data-auto-action="interested" type="button">Interested</button>
          <button class="primary-button" data-auto-action="edit" type="button">Open</button>
        `
        : item.type === "text"
          ? `
            <button class="secondary-button" data-auto-action="textContact" type="button">Text</button>
            <button class="secondary-button" data-auto-action="followContactTomorrow" type="button">Tomorrow</button>
            <button class="primary-button" data-auto-action="createLead" type="button">Create lead</button>
          `
          : `
            <button class="secondary-button" data-auto-action="copyPost" type="button">Copy</button>
            <button class="secondary-button" data-auto-action="openFacebook" type="button">Open</button>
            <button class="primary-button" data-auto-action="posted" type="button">Posted</button>
          `;
    return `
      <article class="work-card ${featured ? "featured" : ""} ${typeClass}" data-work-type="${escapeHtml(item.type)}" data-work-id="${escapeHtml(item.id)}">
        <div>
          <span class="summary-kicker">${escapeHtml(item.reason)}</span>
          <h3 class="lead-name">${escapeHtml(item.title)}</h3>
          ${item.subtitle ? `<p class="lead-meta">${escapeHtml(item.subtitle)}</p>` : ""}
          ${item.detail ? `<p class="lead-meta quote-line">${escapeHtml(String(item.detail).slice(0, featured ? 220 : 140))}</p>` : ""}
        </div>
        <div class="lead-actions primary-lead-actions">${actions}</div>
      </article>
    `;
  }

  function bindAutopilotActions(container) {
    container.querySelectorAll("[data-auto-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const card = event.target.closest("[data-work-type]");
        if (!card) return;
        handleAutopilotAction(card.dataset.workType, card.dataset.workId, button.dataset.autoAction);
      });
    });
  }

  function handleAutopilotAction(type, id, action) {
    if (type === "lead") {
      if (action === "edit") {
        const lead = state.leads.find((item) => item.id === id);
        if (lead) loadLeadIntoForm(lead);
        return;
      }
      if (action === "call") return handleLeadAction(id, "call");
      if (action === "text") return handleLeadAction(id, "smsInitial");
      if (action === "noAnswer") return handleLeadAction(id, "outcomeNoAnswer");
      if (action === "interested") return handleLeadAction(id, "outcomeInterested");
      return;
    }

    if (type === "text") {
      if (action === "createLead") return createLeadFromTextContact(id);
      if (action === "textContact") return openTextContact(id);
      if (action === "followContactTomorrow") return scheduleTextContactFollowUp(id, "tomorrow");
      return;
    }

    if (type === "marketing") {
      if (action === "copyPost") return handleMarketingAction(id, "copy");
      if (action === "openFacebook") return openBusinessSuite();
      if (action === "posted") return handleMarketingAction(id, "posted");
    }
  }

  function focusWorkNext() {
    const item = buildWorkQueue()[0];
    if (!item) {
      toast("Nothing urgent right now.");
      return;
    }
    scrollToId("workNextPanel");
  }

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderTodayQueue() {
    const now = new Date();
    const queue = state.leads
      .filter((lead) => !["won", "lost"].includes(lead.status))
      .sort((a, b) => {
        const scoreDifference = leadUrgencyScore(b, now) - leadUrgencyScore(a, now);
        if (scoreDifference) return scoreDifference;
        return dateValue(a.followUpAt || a.appointmentAt || a.updatedAt) - dateValue(b.followUpAt || b.appointmentAt || b.updatedAt);
      })
      .slice(0, 10);

    el.todayQueueList.innerHTML = queue.length
      ? queue.map((lead) => renderLeadCard(lead, true)).join("")
      : `<div class="empty-state">No open leads in the queue.</div>`;
    bindLeadActions(el.todayQueueList);
  }

  function renderDueLeads() {
    const due = state.leads
      .filter((lead) => isDue(lead, new Date()))
      .sort((a, b) => dateValue(a.followUpAt) - dateValue(b.followUpAt));
    el.dueLeadList.innerHTML = due.length
      ? due.map((lead) => renderLeadCard(lead, true)).join("")
      : `<div class="empty-state">No due follow-ups right now.</div>`;
    bindLeadActions(el.dueLeadList);
  }

  function renderAppointments() {
    const now = new Date();
    const appointments = state.leads
      .filter((lead) => hasOpenAppointment(lead, now))
      .sort((a, b) => dateValue(a.appointmentAt) - dateValue(b.appointmentAt))
      .slice(0, 8);
    el.appointmentLeadList.innerHTML = appointments.length
      ? appointments.map((lead) => renderLeadCard(lead, true)).join("")
      : `<div class="empty-state">No upcoming appointments.</div>`;
    bindLeadActions(el.appointmentLeadList);
  }

  function renderHotLeads() {
    const hotLeads = state.leads
      .filter((lead) => lead.priority === "hot" && !["won", "lost"].includes(lead.status))
      .sort((a, b) => dateValue(a.followUpAt || a.updatedAt) - dateValue(b.followUpAt || b.updatedAt))
      .slice(0, 8);
    el.hotLeadList.innerHTML = hotLeads.length
      ? hotLeads.map((lead) => renderLeadCard(lead, true)).join("")
      : `<div class="empty-state">No hot leads marked.</div>`;
    bindLeadActions(el.hotLeadList);
  }

  function renderDailyCloseout() {
    const now = new Date();
    const open = state.leads.filter((lead) => !["won", "lost"].includes(lead.status));
    const contactedToday = state.leads.filter((lead) => isSameDay(lead.lastTouchAt, now)).length;
    const untouchedOpen = open.filter((lead) => !lead.lastTouchAt).length;
    const overdue = open.filter((lead) => isDue(lead, now)).length;
    const hotOpen = open.filter((lead) => lead.priority === "hot").length;
    const tomorrowAppointments = open.filter((lead) => isTomorrow(lead.appointmentAt, now)).length;
    const lastBackup = state.lastBackupAt ? formatDateTime(state.lastBackupAt) : "Not yet";
    const lastReview = state.dailyReviewAt ? formatDateTime(state.dailyReviewAt) : "Not yet";

    const items = [
      ["Contacted today", contactedToday],
      ["Untouched open", untouchedOpen],
      ["Overdue follow-ups", overdue],
      ["Hot open leads", hotOpen],
      ["Tomorrow appts", tomorrowAppointments],
      ["Last backup", lastBackup],
      ["Last review", lastReview]
    ];

    el.dailyCloseout.innerHTML = `
      <div class="closeout-grid">
        ${items
          .map(([label, value]) => `<div class="mini-stat"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`)
          .join("")}
      </div>
    `;
  }

  function renderProductivityStats() {
    const now = new Date();
    const logsToday = state.leads.flatMap((lead) =>
      (lead.contactLog || []).filter((entry) => isSameDay(entry.at, now)).map((entry) => ({ ...entry, lead }))
    );
    const addedToday = state.leads.filter((lead) => isSameDay(lead.createdAt, now)).length;
    const appointmentsSet = state.leads.filter((lead) => isSameDay(lead.appointmentAt, now)).length;
    const won = state.leads.filter((lead) => lead.status === "won").length;
    const lost = state.leads.filter((lead) => lead.status === "lost").length;
    const calls = logsToday.filter((entry) => entry.type === "Call").length;
    const texts = logsToday.filter((entry) => entry.type === "Text").length;
    const emails = logsToday.filter((entry) => entry.type === "Email").length;
    const outcomes = logsToday.filter((entry) => entry.type === "Outcome" || entry.type === "Appointment").length;
    const sourceRows = sourceBreakdown()
      .slice(0, 5)
      .map(([source, count]) => `<li><span>${escapeHtml(source)}</span><strong>${count}</strong></li>`)
      .join("");

    const stats = [
      ["New today", addedToday],
      ["Calls today", calls],
      ["Texts today", texts],
      ["Emails today", emails],
      ["Outcomes today", outcomes],
      ["Appointments today", appointmentsSet],
      ["Won total", won],
      ["Lost total", lost]
    ];

    el.productivityStats.innerHTML = `
      <div class="productivity-grid">
        ${stats
          .map(([label, value]) => `<div class="mini-stat"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`)
          .join("")}
      </div>
      <ul class="source-list">${sourceRows || "<li><span>No lead sources yet</span><strong>0</strong></li>"}</ul>
    `;
  }

  function renderMarketing() {
    if (!el.marketingStats) return;
    renderMarketingStats();
    renderMetaConnection();
    renderMarketingPromoSuggestions();
    renderGeneratedMarketingDrafts();
    renderMarketingQueue();
    if (el.marketingGroupsText && el.marketingGroupsText.value !== state.marketing.groupsText) {
      el.marketingGroupsText.value = state.marketing.groupsText || "";
    }
    if (el.marketingMonthlyPromo && el.marketingMonthlyPromo.value !== state.marketing.monthlyPromo) {
      el.marketingMonthlyPromo.value = state.marketing.monthlyPromo || "";
    }
  }

  function renderMetaConnection() {
    if (!el.metaConnectionStatus || !el.metaConnectionPill) return;
    const configured = Boolean(metaConnection.configured);
    const connected = Boolean(metaConnection.connected);
    const pageName = metaConnection.pageName || "your Facebook Page";
    const status = metaConnection.loading
      ? "Checking Facebook Page connection..."
      : connected
        ? `Connected to ${pageName}. You can post the selected draft to your Page.`
        : configured
          ? "Simple mode is ready. Advanced direct posting is available if you connect your Page."
          : "Simple mode is ready: copy the selected draft and open Facebook. Advanced direct posting can be set up later.";
    el.metaConnectionStatus.textContent = status;
    el.metaConnectionPill.textContent = connected ? "Connected" : "Simple mode";
    el.metaConnectionPill.className = `pill ${connected ? "closed" : ""}`;
    if (el.connectMetaButton) el.connectMetaButton.disabled = !configured || connected || metaConnection.loading;
    if (el.refreshMetaStatusButton) el.refreshMetaStatusButton.disabled = metaConnection.loading;
    if (el.postSelectedToMetaButton) {
      el.postSelectedToMetaButton.disabled = metaConnection.loading;
      el.postSelectedToMetaButton.textContent = connected ? "Post selected to Page" : "Copy + open Facebook";
    }
    if (el.disconnectMetaButton) el.disconnectMetaButton.disabled = !connected || metaConnection.loading;
  }

  function renderMarketingPromoSuggestions() {
    if (!el.marketingPromoStatus || !el.marketingPromoSuggestions) return;
    const suggestions = state.marketing.promoSuggestions || [];
    const status = [];
    if (state.marketing.monthlyPromo) {
      status.push(shouldRotateMonthlyPromo() ? "Saved promo is from an older month" : "Monthly promo is current");
    }
    if (state.marketing.lastPromoFetchAt) status.push(`Last checked ${formatDateTime(state.marketing.lastPromoFetchAt)}`);
    if (state.marketing.promoFetchError) status.push(state.marketing.promoFetchError);
    if (!status.length) status.push("Use refresh to check public Zirrus promo pages.");
    el.marketingPromoStatus.textContent = status.join(" | ");
    el.marketingPromoSuggestions.innerHTML = suggestions.length
      ? suggestions
          .slice(0, 5)
          .map(
            (promo, index) => `
              <article class="promo-suggestion-card">
                <div>
                  <strong>${escapeHtml(promo.title || "Zirrus promo")}</strong>
                  <p>${escapeHtml(promo.text)}</p>
                  <small>${escapeHtml(sourceLabel(promo.source))}</small>
                </div>
                <button class="secondary-button" data-promo-index="${index}" type="button">Use</button>
              </article>
            `
          )
          .join("")
      : "";
    el.marketingPromoSuggestions.querySelectorAll("[data-promo-index]").forEach((button) => {
      button.addEventListener("click", () => useMarketingPromoSuggestion(Number(button.dataset.promoIndex) || 0));
    });
  }

  function renderMarketingStats() {
    const now = new Date();
    const posts = state.marketing.posts || [];
    const due = posts.filter((post) => post.status === "planned" && post.scheduledAt && new Date(post.scheduledAt).getTime() <= now.getTime()).length;
    const planned = posts.filter((post) => post.status === "planned").length;
    const postedThisWeek = posts.filter((post) => post.status === "posted" && isWithinDays(post.postedAt || post.updatedAt, now, 7)).length;
    const responses = posts.reduce((sum, post) => sum + Number(post.responses || 0), 0);
    const leads = posts.reduce((sum, post) => sum + Number(post.leads || 0), 0);
    const stats = [
      ["Planned", planned],
      ["Due now", due],
      ["Posted 7 days", postedThisWeek],
      ["Responses", responses],
      ["Leads", leads]
    ];
    el.marketingStats.innerHTML = stats
      .map(([label, value]) => `<div class="mini-stat"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`)
      .join("");
  }

  function renderGeneratedMarketingDrafts() {
    const drafts = state.marketing.generatedDrafts || [];
    if (!drafts.length) {
      el.generatedPosts.innerHTML = `<div class="empty-state">Generate drafts to get three ready-to-copy post options.</div>`;
      return;
    }
    el.generatedPosts.innerHTML = drafts
      .map(
        (draft, index) => `
          <label class="draft-card">
            <input type="radio" name="marketingDraft" data-draft-index="${index}" ${index === state.marketing.selectedDraftIndex ? "checked" : ""} />
            <span>
              <strong>${escapeHtml(draft.title)}</strong>
              <small>${escapeHtml(draft.angle)}</small>
              <textarea readonly rows="7">${escapeHtml(draft.text)}</textarea>
            </span>
          </label>
        `
      )
      .join("");
    el.generatedPosts.querySelectorAll("[data-draft-index]").forEach((input) => {
      input.addEventListener("change", () => {
        state.marketing.selectedDraftIndex = Number(input.dataset.draftIndex) || 0;
        saveState();
      });
    });
  }

  function renderMarketingQueue() {
    const posts = [...(state.marketing.posts || [])].sort((a, b) => dateValue(a.scheduledAt || a.createdAt) - dateValue(b.scheduledAt || b.createdAt));
    el.marketingQueue.innerHTML = posts.length
      ? posts.map(renderMarketingPostCard).join("")
      : `<div class="empty-state">No marketing posts queued yet.</div>`;
    bindMarketingActions();
  }

  function renderMarketingPostCard(post) {
    const due = post.status === "planned" && post.scheduledAt && new Date(post.scheduledAt).getTime() <= Date.now();
    const statusClass = post.status === "posted" ? "closed" : due ? "warning" : "";
    return `
      <article class="marketing-card${due ? " due" : ""}" data-id="${escapeHtml(post.id)}">
        <div class="lead-topline">
          <div>
            <h3 class="lead-name">${escapeHtml(labelMarketingObjective(post.objective))}</h3>
            <p class="lead-meta">${escapeHtml(`${labelMarketingChannel(post.channel)} | ${post.audience || "Local area"} | ${post.scheduledAt ? formatDateTime(post.scheduledAt) : "No time set"}`)}</p>
            <p class="lead-meta quote-line">${escapeHtml(post.offer || "Zirrus internet and mobile")}</p>
          </div>
          <span class="pill ${statusClass}">${escapeHtml(labelMarketingStatus(post.status))}</span>
        </div>
        <textarea class="post-preview" readonly rows="6">${escapeHtml(post.text)}</textarea>
        <div class="marketing-metrics">
          <span>Responses: <strong>${Number(post.responses || 0)}</strong></span>
          <span>Leads: <strong>${Number(post.leads || 0)}</strong></span>
        </div>
        <div class="lead-actions primary-lead-actions">
          <button class="secondary-button" data-marketing-action="copy" type="button">Copy</button>
          <button class="primary-button" data-marketing-action="posted" type="button">Posted</button>
          <button class="secondary-button" data-marketing-action="response" type="button">+Response</button>
          <button class="secondary-button" data-marketing-action="lead" type="button">+Lead</button>
        </div>
        <details class="lead-more-actions">
          <summary>More</summary>
          <div class="lead-actions">
            <button class="secondary-button" data-marketing-action="tomorrow" type="button">Tomorrow</button>
            <button class="secondary-button" data-marketing-action="page" type="button">Open Page</button>
            <button class="danger-button" data-marketing-action="delete" type="button">Delete</button>
          </div>
        </details>
      </article>
    `;
  }

  function bindMarketingActions() {
    el.marketingQueue.querySelectorAll("[data-marketing-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const card = event.target.closest(".marketing-card");
        if (!card) return;
        handleMarketingAction(card.dataset.id, event.target.dataset.marketingAction);
      });
    });
  }

  function generateMarketingDrafts() {
    const brief = readMarketingBrief();
    state.marketing.defaultArea = brief.audience;
    state.marketing.pageUrl = brief.pageUrl;
    state.marketing.lastObjective = brief.objective;
    state.marketing.monthlyPromo = brief.monthlyPromo;
    state.marketing.monthlyPromoUpdatedAt = brief.monthlyPromo ? new Date().toISOString() : state.marketing.monthlyPromoUpdatedAt || "";
    state.marketing.monthlyPromoMonth = brief.monthlyPromo ? currentMonthKey() : state.marketing.monthlyPromoMonth || "";
    state.marketing.generatedDrafts = buildMarketingDrafts(brief);
    state.marketing.selectedDraftIndex = 0;
    el.marketingObjective.value = brief.objective;
    saveState();
    renderMarketing();
    toast("Marketing drafts generated.");
  }

  function saveMarketingPost(event) {
    event.preventDefault();
    const brief = readMarketingBrief();
    if (!state.marketing.generatedDrafts.length) {
      generateMarketingDrafts();
    }
    let draft = selectedMarketingDraft();
    if (
      draft &&
      (draft.objective && normalizeMarketingObjective(draft.objective) !== brief.objective ||
        cleanMarketingText(draft.monthlyPromo) !== brief.monthlyPromo)
    ) {
      state.marketing.generatedDrafts = buildMarketingDrafts(brief);
      state.marketing.selectedDraftIndex = 0;
      draft = selectedMarketingDraft();
    }
    if (!draft) {
      toast("Generate a draft first.");
      return;
    }
    const now = new Date().toISOString();
    const post = normalizeMarketingPost({
      id: newId(),
      createdAt: now,
      updatedAt: now,
      status: "planned",
      scheduledAt: brief.postDate || toLocalDatetimeValue(tomorrowMarketingTime()),
      channel: brief.channel,
      objective: brief.objective,
      tone: brief.tone,
      audience: brief.audience,
      offer: brief.offer,
      hook: brief.hook,
      monthlyPromo: brief.monthlyPromo,
      text: draft.text,
      responses: 0,
      leads: 0
    });
    state.marketing.pageUrl = brief.pageUrl;
    state.marketing.defaultArea = brief.audience;
    state.marketing.lastObjective = brief.objective;
    state.marketing.monthlyPromo = brief.monthlyPromo;
    state.marketing.monthlyPromoUpdatedAt = brief.monthlyPromo ? new Date().toISOString() : state.marketing.monthlyPromoUpdatedAt || "";
    state.marketing.monthlyPromoMonth = brief.monthlyPromo ? currentMonthKey() : state.marketing.monthlyPromoMonth || "";
    el.marketingObjective.value = brief.objective;
    state.marketing.posts.unshift(post);
    saveState();
    renderMarketing();
    toast("Post saved to queue.");
  }

  function copySelectedMarketingDraft() {
    const draft = selectedMarketingDraft();
    if (!draft) {
      toast("Generate a draft first.");
      return;
    }
    copyText(draft.text);
  }

  function handleMetaReturn() {
    const params = new URLSearchParams(window.location.search);
    const facebook = params.get("facebook");
    if (!facebook) return;
    switchView("marketing");
    if (facebook === "connected") toast("Facebook Page connected.");
    if (facebook === "error") toast("Facebook connection failed.");
    params.delete("facebook");
    const query = params.toString();
    const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  function connectMetaPage() {
    window.location.href = "/api/meta/login";
  }

  async function loadMetaConnectionStatus(options = {}) {
    const quiet = Boolean(options.quiet);
    metaConnection = { ...metaConnection, loading: true };
    renderMetaConnection();
    try {
      const data = await fetchJson("/api/meta/status");
      metaConnection = {
        configured: Boolean(data.configured),
        connected: Boolean(data.connected),
        loading: false,
        pageName: data.page?.name || "",
        message: data.message || ""
      };
      renderMetaConnection();
      if (!quiet && metaConnection.connected) toast("Facebook Page connection checked.");
      if (!quiet && !metaConnection.connected) toast("Simple mode is ready. Generate a draft, then copy and open Facebook.");
    } catch (error) {
      metaConnection = {
        configured: false,
        connected: false,
        loading: false,
        pageName: "",
        message: "Could not check Facebook connection."
      };
      renderMetaConnection();
      if (!quiet) toast("Could not check Facebook connection.");
    }
  }

  async function postSelectedDraftToMeta() {
    const draft = selectedMarketingDraft();
    if (!draft) {
      toast("Generate a draft first.");
      return;
    }
    if (!metaConnection.connected) {
      await copySelectedDraftAndOpenFacebook(draft);
      return;
    }
    const pageName = metaConnection.pageName || "your Facebook Page";
    const ok = confirm(`Post the selected draft to ${pageName}?`);
    if (!ok) return;
    el.postSelectedToMetaButton.disabled = true;
    el.postSelectedToMetaButton.textContent = "Posting...";
    try {
      const result = await fetchJson("/api/meta/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: draft.text })
      });
      toast(result.postId ? "Posted to Facebook Page." : "Facebook post request completed.");
    } catch (error) {
      toast(error.message || "Facebook post failed.");
      loadMetaConnectionStatus({ quiet: true });
    } finally {
      el.postSelectedToMetaButton.textContent = "Post selected to Page";
      renderMetaConnection();
    }
  }

  async function copySelectedDraftAndOpenFacebook(draft) {
    const text = draft?.text || "";
    if (!text) {
      toast("Generate a draft first.");
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast("Copied. Opening Facebook.");
      } else {
        copyText(text);
      }
    } catch (error) {
      copyText(text);
    }
    window.setTimeout(openBusinessSuite, 250);
  }

  async function disconnectMetaPage() {
    const ok = confirm("Disconnect this Facebook Page from Lead Assistant?");
    if (!ok) return;
    try {
      await fetchJson("/api/meta/disconnect", { method: "POST" });
      metaConnection = {
        configured: metaConnection.configured,
        connected: false,
        loading: false,
        pageName: "",
        message: "Facebook Page disconnected."
      };
      renderMetaConnection();
      toast("Facebook Page disconnected.");
    } catch (error) {
      toast("Could not disconnect Facebook Page.");
    }
  }

  function saveMarketingPromo() {
    state.marketing.monthlyPromo = cleanMarketingText(el.marketingMonthlyPromo.value);
    state.marketing.monthlyPromoUpdatedAt = state.marketing.monthlyPromo ? new Date().toISOString() : "";
    state.marketing.monthlyPromoMonth = state.marketing.monthlyPromo ? currentMonthKey() : "";
    saveState();
    renderMarketing();
    toast(state.marketing.monthlyPromo ? "Monthly promo saved." : "Monthly promo cleared.");
  }

  async function maybeRefreshMarketingPromos() {
    if (!window.fetch || !navigator.onLine) return;
    const lastFetch = dateValue(state.marketing.lastPromoFetchAt);
    if (lastFetch && Date.now() - lastFetch < 24 * 60 * 60 * 1000) return;
    await refreshMarketingPromos({ applyTop: shouldRotateMonthlyPromo(), quiet: true, regenerateDrafts: true });
  }

  async function refreshMarketingPromos(options = {}) {
    const applyTop = Boolean(options.applyTop);
    const quiet = Boolean(options.quiet);
    const regenerateDrafts = Boolean(options.regenerateDrafts);
    if (!window.fetch) {
      state.marketing.promoFetchError = "Promo refresh is not available in this browser.";
      renderMarketing();
      return;
    }
    state.marketing.promoFetchError = "";
    if (el.refreshMarketingPromosButton) {
      el.refreshMarketingPromosButton.disabled = true;
      el.refreshMarketingPromosButton.textContent = "Checking Zirrus...";
    }
    renderMarketingPromoSuggestions();
    try {
      const response = await fetch(`/api/promos?ts=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Promo refresh failed: ${response.status}`);
      const data = await response.json();
      const suggestions = normalizePromoSuggestions(data.promos);
      state.marketing.promoSuggestions = suggestions;
      state.marketing.lastPromoFetchAt = data.updatedAt || new Date().toISOString();
      if (!suggestions.length) throw new Error("No promo suggestions found");
      if (applyTop) {
        applyMarketingPromoSuggestion(suggestions[0]);
        if (!quiet) {
          generateMarketingDrafts();
        } else if (regenerateDrafts && state.marketing.generatedDrafts.length) {
          const brief = readMarketingBrief();
          state.marketing.generatedDrafts = buildMarketingDrafts(brief);
          state.marketing.selectedDraftIndex = 0;
        }
      }
      saveState();
      renderMarketing();
      if (!quiet) toast(applyTop ? "Zirrus promo loaded." : "Zirrus promos refreshed.");
    } catch (error) {
      state.marketing.promoFetchError = "Could not refresh promos automatically. Paste the official Zirrus promo manually.";
      saveState();
      renderMarketing();
      if (!quiet) toast("Promo refresh failed. Paste the promo manually.");
    } finally {
      if (el.refreshMarketingPromosButton) {
        el.refreshMarketingPromosButton.disabled = false;
        el.refreshMarketingPromosButton.textContent = "Refresh from Zirrus";
      }
    }
  }

  function useMarketingPromoSuggestion(index) {
    const promo = (state.marketing.promoSuggestions || [])[index];
    if (!promo) return;
    applyMarketingPromoSuggestion(promo);
    generateMarketingDrafts();
    toast("Promo applied to drafts.");
  }

  function applyMarketingPromoSuggestion(promo) {
    const text = cleanMarketingText(promo.text);
    if (!text) return;
    const objective = inferMarketingObjectiveFromPromo(text, promo.objective || state.marketing.lastObjective);
    state.marketing.monthlyPromo = text;
    state.marketing.monthlyPromoUpdatedAt = new Date().toISOString();
    state.marketing.monthlyPromoMonth = currentMonthKey();
    state.marketing.lastObjective = objective;
    if (el.marketingMonthlyPromo) el.marketingMonthlyPromo.value = text;
    if (el.marketingObjective) el.marketingObjective.value = objective;
  }

  function saveMarketingGroups() {
    state.marketing.groupsText = el.marketingGroupsText.value.trim();
    saveState();
    toast("Group tracker saved.");
  }

  function handleMarketingAction(id, action) {
    const post = state.marketing.posts.find((item) => item.id === id);
    if (!post) return;
    if (action === "copy") {
      copyText(post.text);
      return;
    }
    if (action === "posted") {
      post.status = "posted";
      post.postedAt = new Date().toISOString();
      post.updatedAt = post.postedAt;
      saveState();
      renderMarketing();
      toast("Post marked posted.");
      return;
    }
    if (action === "response") {
      post.responses = Number(post.responses || 0) + 1;
      post.updatedAt = new Date().toISOString();
      saveState();
      renderMarketing();
      toast("Response tracked.");
      return;
    }
    if (action === "lead") {
      post.leads = Number(post.leads || 0) + 1;
      post.updatedAt = new Date().toISOString();
      saveState();
      renderMarketing();
      prefillLeadFromMarketing(post);
      toast("Lead count tracked. Lead form prefilled.");
      return;
    }
    if (action === "tomorrow") {
      post.status = "planned";
      post.scheduledAt = toLocalDatetimeValue(tomorrowMarketingTime());
      post.updatedAt = new Date().toISOString();
      saveState();
      renderMarketing();
      toast("Post moved to tomorrow.");
      return;
    }
    if (action === "page") {
      openBusinessPage();
      return;
    }
    if (action === "delete") {
      const ok = confirm("Delete this marketing post?");
      if (!ok) return;
      state.marketing.posts = state.marketing.posts.filter((item) => item.id !== id);
      saveState();
      renderMarketing();
      toast("Marketing post deleted.");
    }
  }

  function readMarketingBrief() {
    const monthlyPromo = cleanMarketingText(el.marketingMonthlyPromo.value || state.marketing.monthlyPromo || "");
    const selectedObjective = normalizeMarketingObjective(el.marketingObjective.value);
    const objective = monthlyPromo ? inferMarketingObjectiveFromPromo(monthlyPromo, selectedObjective) : selectedObjective;
    const customHook = el.marketingHook.value.trim();
    return {
      objective,
      tone: el.marketingTone.value,
      audience: el.marketingAudience.value.trim() || "our local area",
      channel: el.marketingChannel.value,
      offer: el.marketingOffer.value.trim() || defaultMarketingOffer(objective),
      hook: customHook || (monthlyPromo ? defaultMonthlyPromoHook(objective) : defaultMarketingHook(objective)),
      monthlyPromo,
      postDate: el.marketingPostDate.value,
      pageUrl: el.marketingPageUrl.value.trim()
    };
  }

  function selectedMarketingDraft() {
    return (state.marketing.generatedDrafts || [])[state.marketing.selectedDraftIndex || 0];
  }

  function buildMarketingDrafts(brief) {
    const campaign = getMarketingCampaign(brief.objective);
    const rep = state.settings.repName || contactDefaults.repName;
    const phone = state.settings.replyPhone || contactDefaults.replyPhone;
    const email = state.settings.replyEmail || contactDefaults.replyEmail;
    const business = state.settings.businessName || contactDefaults.businessName;
    const area = brief.audience || "our local area";
    const offer = brief.offer || campaign.offer;
    const hook = brief.hook || campaign.hook;
    const monthlyPromo = cleanMarketingText(brief.monthlyPromo);
    const promoLine = monthlyPromo || offer;
    const promoIntro = monthlyPromo
      ? `Zirrus promo I am quoting this month: ${promoLine}`
      : `This month's focus: ${promoLine}`;
    const promoLineSentence = marketingSentence(promoLine);
    const promoIntroSentence = marketingSentence(promoIntro);
    const cta = marketingCta(brief.channel, { rep, phone, email });
    const tags = campaign.tags || "#Zirrus #FiberInternet #MobilePlans";
    const disclosure = campaign.disclosure || "Availability and pricing can vary. Message me for a quick check.";

    const openings = {
      neighbor: `Quick heads up for ${area}:`,
      direct: `${area}, I am quoting this ${business} promo this week.`,
      helpful: `If you have been meaning to compare internet or mobile in ${area},`,
      urgent: `I am making my ${business} promo check list for ${area} this week.`
    };
    const opener = openings[brief.tone] || openings.neighbor;

    return [
      {
        objective: brief.objective,
        monthlyPromo,
        title: "Friendly local",
        angle: `${campaign.label} | sounds like a real local post`,
        text: `${opener}\n\n${promoIntroSentence}\n\n${hook}\n\nIf you want me to see if it fits your home or phone setup, send me your address and what you have now. I will price it out and tell you what actually makes sense.\n\n${cta}\n\n${disclosure}\n${tags}`
      },
      {
        objective: brief.objective,
        monthlyPromo,
        title: "Simple offer",
        angle: "Best when you want people to message you",
        text: `Keeping this simple for ${area}:\n\n${promoLineSentence}\n\nIf your internet bill or phone bill has been creeping up, it may be worth a quick check. I can look at availability, bundle options, setup details, and the real monthly number before you make any decision.\n\n${cta}\n\n${disclosure}`
      },
      {
        objective: brief.objective,
        monthlyPromo,
        title: "Comment starter",
        angle: "Best for comments and quick replies",
        text: `${area}, want me to check this for you?\n\n${promoLineSentence}\n\nI can check the address, compare the package, and let you know whether the promo fits. No pressure if it does not make sense for you.\n\n${cta}\n\n${disclosure}`
      }
    ];
  }

  function cleanMarketingText(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function marketingSentence(text) {
    const value = cleanMarketingText(text);
    if (!value) return "";
    return /[.!?]$/.test(value) ? value : `${value}.`;
  }

  function defaultMarketingOffer(objective) {
    return getMarketingCampaign(objective).offer;
  }

  function defaultMarketingHook(objective) {
    return getMarketingCampaign(objective).hook;
  }

  function defaultMonthlyPromoHook(objective) {
    const campaign = getMarketingCampaign(objective);
    if (objective === "bundle") return "I can check the address, mobile lines, bundle fit, and what the monthly total would actually look like.";
    if (campaign.interest === "internet") return "I can check what speeds are available at the address and help compare the monthly options.";
    if (campaign.interest === "mobile") return "I can check line count, phone options, eligibility, and what the monthly number would look like.";
    return "I can check whether the promo fits your home, phone lines, or business setup before you decide.";
  }

  function shouldRotateMonthlyPromo() {
    if (!state.marketing.monthlyPromo) return true;
    const promoMonth = state.marketing.monthlyPromoMonth || monthKeyFromDate(state.marketing.monthlyPromoUpdatedAt);
    return promoMonth !== currentMonthKey();
  }

  function marketingCta(channel, contact) {
    const details = typeof contact === "string"
      ? { rep: contactDefaults.repName, phone: contact, email: contactDefaults.replyEmail }
      : contact;
    const rep = details.rep || contactDefaults.repName;
    const phone = details.phone || contactDefaults.replyPhone;
    const email = details.email || contactDefaults.replyEmail;
    if (channel === "ad") return `Use the form, or reach ${rep} directly at ${phone} or ${email}.`;
    if (channel === "story") return `Reply CHECK or text ${phone} and I will check it for you. Email works too: ${email}.`;
    return `Comment CHECK, message me here, or call/text ${phone}. Email works too: ${email}.`;
  }

  function prefillLeadFromMarketing(post) {
    const campaign = getMarketingCampaign(post.objective);
    resetLeadForm();
    setFieldValue("leadSource", "Facebook");
    setFieldValue("leadInterest", campaign.interest || "bundle");
    setFieldValue("leadPriority", "warm");
    setFieldValue("leadNextStep", "call");
    setFieldValue("leadNotes", `Facebook marketing response\nCampaign: ${labelMarketingObjective(post.objective)}\nPost: ${post.text}`);
    switchView("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getMarketingCampaign(objective) {
    return marketingCampaigns[normalizeMarketingObjective(objective)] || marketingCampaigns["address-check"];
  }

  function normalizeMarketingObjective(objective) {
    return legacyMarketingObjectives[objective] || (marketingCampaigns[objective] ? objective : "address-check");
  }

  function inferMarketingObjectiveFromPromo(text, fallbackObjective) {
    const value = cleanMarketingText(text).toLowerCase();
    if (!value) return normalizeMarketingObjective(fallbackObjective);
    if (/\b(business|commercial|office|shop)\b/.test(value)) return "business";
    if (/\b(iphone|trade[- ]?in|device|phone upgrade|bill credit|bill-credit)\b/.test(value)) return "iphone-trade";
    if (/\b(bundle|mobile and|get.*line|per line|1 gig|2 gig|3 gig|free months?)\b/.test(value) && /\b(mobile|line|phone|internet|gig)\b/.test(value)) return "bundle";
    if (/\b(wi[- ]?fi|wifi|smart wi[- ]?fi)\b/.test(value)) return "smart-wifi";
    if (/\b(fiber|internet|gig|mbps|speed)\b/.test(value)) return "fiber-speed";
    if (/\b(mobile|lines?|autopay|talk|text|data)\b/.test(value)) return "mobile-autopay";
    return normalizeMarketingObjective(fallbackObjective);
  }

  function sourceLabel(source) {
    const value = String(source || "");
    if (!value) return "Public Zirrus source";
    if (value.includes("/pages/discounts")) return "Zirrus discounts page";
    if (value.includes("/pages/mobile-plans")) return "Zirrus mobile plans page";
    if (value.includes("/pages/fiber-internet")) return "Zirrus fiber internet page";
    if (value.includes("zirrus.com")) return "Zirrus website";
    return value;
  }

  function openBusinessSuite() {
    location.href = "https://business.facebook.com/latest/composer";
  }

  function openBusinessPage() {
    const url = state.marketing.pageUrl || el.marketingPageUrl.value.trim() || "https://business.facebook.com/";
    location.href = url;
  }

  function handleIncomingShare() {
    const params = new URLSearchParams(window.location.search);
    const sharedText = [params.get("shareTitle"), params.get("shareText"), params.get("shareUrl")]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join("\n");
    if (!sharedText) return;
    state.texting.importText = [state.texting.importText, sharedText].filter(Boolean).join("\n\n");
    state.texting.lastImportAt = new Date().toISOString();
    scanTextImport({ quiet: true });
    switchView("texts");
    params.delete("shareTitle");
    params.delete("shareText");
    params.delete("shareUrl");
    const query = params.toString();
    const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  function renderTextOrganizer() {
    if (!el.textingStats) return;
    renderTextingStats();
    renderTextImportResults();
    renderTextQueue();
    renderTextContacts();
    if (el.textImportText && el.textImportText.value !== state.texting.importText) el.textImportText.value = state.texting.importText || "";
    if (el.textAudience && el.textAudience.value !== state.texting.queueAudience) el.textAudience.value = state.texting.queueAudience || "due";
    if (el.textQueueTemplate && el.textQueueTemplate.value !== state.texting.queueTemplate) {
      el.textQueueTemplate.value = state.texting.queueTemplate || defaultTextQueueTemplate();
    }
  }

  function renderTextingStats() {
    const now = new Date();
    const textOk = state.leads.filter((lead) => lead.phone && lead.smsConsent && !["won", "lost"].includes(lead.status)).length;
    const due = state.leads.filter((lead) => lead.phone && lead.smsConsent && isDue(lead, now)).length;
    const imported = state.texting.importedContacts.length;
    const unsaved = state.texting.importedContacts.filter((contact) => contact.phone && !contact.linkedLeadId && !findLeadByPhone(contact.phone)).length;
    const contactFollowUps = state.texting.importedContacts.filter((contact) => contact.followUpAt && dateValue(contact.followUpAt) <= now.getTime()).length;
    el.textingStats.innerHTML = [
      ["Text OK", textOk],
      ["Due texts", due],
      ["Imported", imported],
      ["Unsaved", unsaved],
      ["Text follow-ups", contactFollowUps]
    ]
      .map(([label, value]) => `<div class="mini-stat"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`)
      .join("");
  }

  function renderTextImportResults() {
    const contacts = state.texting.importedContacts.slice(0, 5);
    el.textImportResults.innerHTML = contacts.length
      ? contacts.map((contact) => renderTextContactCard(contact, true)).join("")
      : `<div class="empty-state">Paste or share copied texts, then scan to find customer names and numbers.</div>`;
    bindTextOrganizerActions(el.textImportResults);
  }

  function renderTextContacts() {
    const contacts = state.texting.importedContacts;
    el.textContactList.innerHTML = contacts.length
      ? contacts.map((contact) => renderTextContactCard(contact, false)).join("")
      : `<div class="empty-state">No imported text contacts yet.</div>`;
    bindTextOrganizerActions(el.textContactList);
  }

  function renderTextContactCard(contact, compact) {
    const linkedLead = contact.linkedLeadId ? state.leads.find((lead) => lead.id === contact.linkedLeadId) : findLeadByPhone(contact.phone);
    const linkedLabel = linkedLead ? `Linked: ${linkedLead.name || linkedLead.phone}` : "Not linked";
    const followUpLine = contact.followUpAt ? `Text follow-up: ${formatDateTime(contact.followUpAt)}` : "";
    const actionLine = contact.lastAction ? `Last: ${contact.lastAction}${contact.lastActionAt ? ` ${formatDateTime(contact.lastActionAt)}` : ""}` : "";
    const note = compact
      ? contact.snippet
      : [contact.snippet, followUpLine, actionLine, contact.lastImportedAt ? `Imported ${formatDateTime(contact.lastImportedAt)}` : ""].filter(Boolean).join(" | ");
    return `
      <article class="text-card" data-contact-id="${escapeHtml(contact.id)}">
        <div class="lead-topline">
          <div>
            <h3 class="lead-name">${escapeHtml(contact.name || "Unknown contact")}</h3>
            <p class="lead-meta">${escapeHtml([formatPhoneDisplay(contact.phone), contact.email].filter(Boolean).join(" | "))}</p>
            <p class="lead-meta">${escapeHtml(linkedLabel)}</p>
            ${note ? `<p class="lead-meta quote-line">${escapeHtml(note)}</p>` : ""}
          </div>
          <span class="pill ${linkedLead ? "closed" : contact.followUpAt ? "warning" : ""}">${escapeHtml(linkedLead ? "Customer" : labelTextContactStage(contact.stage))}</span>
        </div>
        ${
          !compact && contact.conversation
            ? `<details class="lead-note-details text-conversation">
                <summary>Conversation</summary>
                <p class="lead-note">${escapeHtml(contact.conversation)}</p>
              </details>`
            : ""
        }
        <div class="lead-actions primary-lead-actions">
          <button class="secondary-button" data-text-action="createLead" type="button">${linkedLead ? "Update lead" : "Create lead"}</button>
          <button class="secondary-button" data-text-action="textContact" type="button">Text</button>
          <button class="secondary-button" data-text-action="followContact30m" type="button">30 min</button>
          <button class="secondary-button" data-text-action="followContactTomorrow" type="button">Tomorrow</button>
        </div>
      </article>
    `;
  }

  function renderTextQueue() {
    const queue = state.texting.queue || [];
    el.textQueueList.innerHTML = queue.length
      ? queue.map(renderTextQueueCard).join("")
      : `<div class="empty-state">Build a queue from due follow-ups, hot leads, appointments, or imported contacts.</div>`;
    bindTextOrganizerActions(el.textQueueList);
  }

  function renderTextQueueCard(item) {
    const checked = item.id === state.texting.selectedQueueId ? " checked" : "";
    return `
      <label class="draft-card text-queue-card" data-queue-id="${escapeHtml(item.id)}">
        <input type="radio" name="textQueueItem" data-text-action="selectQueue" ${checked} />
        <span>
          <strong>${escapeHtml(item.name || item.phone)}</strong>
          <small>${escapeHtml([formatPhoneDisplay(item.phone), item.reason, item.status === "opened" ? "Opened" : ""].filter(Boolean).join(" | "))}</small>
          <textarea readonly rows="5">${escapeHtml(item.message)}</textarea>
          <span class="text-card-actions">
            <button class="secondary-button" data-text-action="openQueuedText" type="button">Open SMS</button>
            <button class="secondary-button" data-text-action="copyQueuedText" type="button">Copy</button>
          </span>
        </span>
      </label>
    `;
  }

  function bindTextOrganizerActions(container) {
    container.querySelectorAll("[data-text-action]").forEach((control) => {
      control.addEventListener("click", (event) => {
        const action = control.dataset.textAction;
        const contactCard = control.closest("[data-contact-id]");
        const queueCard = control.closest("[data-queue-id]");
        if (action === "createLead" && contactCard) createLeadFromTextContact(contactCard.dataset.contactId);
        if (action === "textContact" && contactCard) openTextContact(contactCard.dataset.contactId);
        if (action === "followContact30m" && contactCard) scheduleTextContactFollowUp(contactCard.dataset.contactId, "30m");
        if (action === "followContactTomorrow" && contactCard) scheduleTextContactFollowUp(contactCard.dataset.contactId, "tomorrow");
        if (action === "selectQueue" && queueCard) selectQueuedText(queueCard.dataset.queueId);
        if (action === "openQueuedText" && queueCard) {
          event.preventDefault();
          openQueuedText(queueCard.dataset.queueId);
        }
        if (action === "copyQueuedText" && queueCard) {
          event.preventDefault();
          copyQueuedText(queueCard.dataset.queueId);
        }
      });
    });
  }

  async function handleTextFileSelected(event, sourceType) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    await processTextImportFile(file, sourceType);
    event.target.value = "";
  }

  async function processTextImportFile(file, sourceType) {
    if (isTextFile(file)) {
      updateTextOcrStatus("Reading uploaded text...");
      try {
        const text = normalizeOcrText(await file.text());
        const smsContacts = isXmlTextFile(file) ? extractSmsBackupContacts(text) : [];
        if (smsContacts.length) {
          state.texting.importedContacts = mergeTextContacts(state.texting.importedContacts, smsContacts);
          state.texting.lastImportAt = new Date().toISOString();
          saveState();
          renderTextOrganizer();
          updateTextOcrStatus(`SMS backup loaded: ${smsContacts.length} contact${smsContacts.length === 1 ? "" : "s"}`);
          toast(`Imported ${smsContacts.length} text conversation${smsContacts.length === 1 ? "" : "s"}.`);
          return;
        }
        appendTextImport(text);
        updateTextOcrStatus(text ? "File text loaded" : "No text found");
        if (text) scanTextImport({ quiet: false });
      } catch (error) {
        updateTextOcrStatus("Could not read that file.");
        toast("Upload an image, TXT, CSV, MD, or SMS backup XML file.");
      }
      return;
    }

    if (!file.type.startsWith("image/")) {
      updateTextOcrStatus("Unsupported file. Upload an image, TXT, CSV, or MD file.");
      toast("That file type is not supported yet.");
      return;
    }

    el.textOcrPreview.src = URL.createObjectURL(file);
    el.textOcrPreview.hidden = false;
    updateTextOcrStatus(sourceType === "photo" ? "Preparing photo..." : "Preparing screenshot...");

    const ocrEngine = getOcrEngine();
    if (!ocrEngine || typeof ocrEngine.createWorker !== "function") {
      updateTextOcrStatus("OCR did not load. Use Android text selection or Lens, then paste here.");
      toast("OCR library is not available.");
      return;
    }

    try {
      const imageForOcr = await preprocessImage(file);
      const worker = await ocrEngine.createWorker("eng", 1, {
        logger: (message) => updateTextOcrProgress(message)
      });
      updateTextOcrStatus("Reading conversation...");
      const result = await worker.recognize(imageForOcr);
      await worker.terminate();
      const text = normalizeOcrText(result.data.text || "");
      appendTextImport(text);
      updateTextOcrStatus(text ? "Conversation text loaded" : "No text found");
      if (text) scanTextImport({ quiet: false });
    } catch (error) {
      updateTextOcrStatus("OCR failed. Try a sharper screenshot.");
      toast("Could not read that image.");
    }
  }

  function appendTextImport(text) {
    const cleanText = normalizeOcrText(text);
    if (!cleanText) return;
    state.texting.importText = [state.texting.importText, cleanText].filter(Boolean).join("\n\n");
    if (el.textImportText) el.textImportText.value = state.texting.importText;
  }

  function updateTextOcrStatus(message) {
    if (el.textOcrStatus) el.textOcrStatus.textContent = message;
  }

  function updateTextOcrProgress(message) {
    if (!message || !message.status) return;
    if (message.progress != null) {
      updateTextOcrStatus(`${message.status} ${Math.round(message.progress * 100)}%`);
      return;
    }
    updateTextOcrStatus(message.status);
  }

  function scanTextImport(options = {}) {
    const text = normalizeOcrText(el.textImportText?.value || state.texting.importText || "");
    state.texting.importText = text;
    const contacts = extractTextContacts(text);
    if (!contacts.length) {
      saveState();
      renderTextOrganizer();
      if (!options.quiet) toast("No phone numbers found in pasted texts.");
      return;
    }
    state.texting.importedContacts = mergeTextContacts(state.texting.importedContacts, contacts);
    state.texting.lastImportAt = new Date().toISOString();
    saveState();
    renderTextOrganizer();
    if (!options.quiet) toast(`Found ${contacts.length} text contact${contacts.length === 1 ? "" : "s"}.`);
  }

  function clearTextImport() {
    state.texting.importText = "";
    if (el.textImportText) el.textImportText.value = "";
    if (el.textOcrPreview) {
      el.textOcrPreview.removeAttribute("src");
      el.textOcrPreview.hidden = true;
    }
    updateTextOcrStatus("Text import ready");
    saveState();
    renderTextOrganizer();
    toast("Text import cleared.");
  }

  function buildTextQueue() {
    state.texting.queueAudience = el.textAudience.value;
    state.texting.queueTemplate = el.textQueueTemplate.value.trim() || defaultTextQueueTemplate();
    const contacts = contactsForTextAudience(state.texting.queueAudience);
    state.texting.queue = contacts.map((contact) => ({
      id: newId(),
      leadId: contact.leadId || "",
      contactId: contact.contactId || "",
      name: contact.name || "",
      phone: contact.phone || "",
      message: renderTextQueueMessage(contact),
      reason: contact.reason || labelTextAudience(state.texting.queueAudience),
      status: "ready",
      createdAt: new Date().toISOString()
    }));
    state.texting.selectedQueueId = state.texting.queue[0]?.id || "";
    saveState();
    renderTextOrganizer();
    toast(state.texting.queue.length ? `Text queue ready: ${state.texting.queue.length}` : "No eligible contacts for that queue.");
  }

  function contactsForTextAudience(audience) {
    const now = new Date();
    const openLeads = state.leads.filter((lead) => lead.phone && !["won", "lost"].includes(lead.status));
    const leadContacts = (leads, reason) =>
      leads
        .filter((lead) => lead.smsConsent)
        .map((lead) => ({
          leadId: lead.id,
          name: lead.name || lead.phone,
          phone: lead.phone,
          reason,
          lead
        }));
    const importedContacts = state.texting.importedContacts
      .filter((contact) => contact.phone)
      .map((contact) => ({
        contactId: contact.id,
        leadId: contact.linkedLeadId || findLeadByPhone(contact.phone)?.id || "",
        name: contact.name || contact.phone,
        phone: contact.phone,
        reason: "Imported text contact",
        contact,
        lead: contact.linkedLeadId ? state.leads.find((lead) => lead.id === contact.linkedLeadId) : findLeadByPhone(contact.phone)
      }));
    if (audience === "due") {
      return [
        ...leadContacts(openLeads.filter((lead) => isDue(lead, now)), "Due follow-up"),
        ...importedContacts.filter((contact) => contact.contact?.followUpAt && dateValue(contact.contact.followUpAt) <= now.getTime())
      ];
    }
    if (audience === "hot") return leadContacts(openLeads.filter((lead) => lead.priority === "hot"), "Hot lead");
    if (audience === "appointments") return leadContacts(openLeads.filter((lead) => isAppointmentToday(lead, now) || isTomorrow(lead.appointmentAt, now)), "Appointment");
    if (audience === "new") return leadContacts(openLeads.filter((lead) => lead.status === "new"), "New lead");
    if (audience === "all") return leadContacts(openLeads, "Text OK customer");
    return importedContacts;
  }

  function renderTextQueueMessage(contact) {
    const lead = contact.lead || findLeadByPhone(contact.phone);
    if (lead) return renderTemplate(state.texting.queueTemplate || defaultTextQueueTemplate(), lead);
    const data = {
      firstName: firstName(contact.name),
      name: contact.name || "",
      repName: state.settings.repName || contactDefaults.repName,
      businessName: state.settings.businessName || contactDefaults.businessName,
      replyPhone: state.settings.replyPhone || contactDefaults.replyPhone
    };
    return applyTemplateTokens(state.texting.queueTemplate || defaultTextQueueTemplate(), data);
  }

  function openNextQueuedText() {
    const item = selectedQueuedText() || state.texting.queue.find((queued) => queued.status !== "opened") || state.texting.queue[0];
    if (!item) {
      toast("Build a text queue first.");
      return;
    }
    openQueuedText(item.id);
  }

  function copySelectedQueuedText() {
    const item = selectedQueuedText();
    if (!item) {
      toast("Select a queued text first.");
      return;
    }
    copyQueuedText(item.id);
  }

  function selectQueuedText(id) {
    state.texting.selectedQueueId = id;
    saveState();
    renderTextQueue();
  }

  function selectedQueuedText() {
    return state.texting.queue.find((item) => item.id === state.texting.selectedQueueId);
  }

  function openQueuedText(id) {
    const item = state.texting.queue.find((queued) => queued.id === id);
    if (!item) return;
    item.status = "opened";
    state.texting.selectedQueueId = item.id;
    const lead = item.leadId ? state.leads.find((leadItem) => leadItem.id === item.leadId) : findLeadByPhone(item.phone);
    const contact = item.contactId ? state.texting.importedContacts.find((contactItem) => contactItem.id === item.contactId) : null;
    if (lead) {
      addLog(lead.id, "Text", `Opened text queue: ${item.reason}`);
      updateLead(lead.id, contactAutoPatch(lead, "text", ""), false);
    }
    if (contact) {
      contact.stage = "waiting";
      contact.lastAction = `Opened queued text: ${item.reason}`;
      contact.lastActionAt = new Date().toISOString();
    }
    saveState();
    renderAll();
    location.href = `sms:${cleanPhone(item.phone)}?body=${encodeURIComponent(item.message)}`;
  }

  function copyQueuedText(id) {
    const item = state.texting.queue.find((queued) => queued.id === id);
    if (!item) return;
    state.texting.selectedQueueId = item.id;
    saveState();
    renderTextOrganizer();
    copyText(item.message);
  }

  function scheduleTextContactFollowUp(contactId, preset) {
    const contact = state.texting.importedContacts.find((item) => item.id === contactId);
    if (!contact?.phone) return;
    const followUpAt = toLocalDatetimeValue(dateForPreset(preset));
    const linkedLead = contact.linkedLeadId ? state.leads.find((lead) => lead.id === contact.linkedLeadId) : findLeadByPhone(contact.phone);
    contact.followUpAt = followUpAt;
    contact.stage = "follow-up";
    contact.lastAction = `Follow-up set for ${formatDateTime(followUpAt)}`;
    contact.lastActionAt = new Date().toISOString();

    if (linkedLead) {
      contact.linkedLeadId = linkedLead.id;
      updateLead(
        linkedLead.id,
        {
          status: "follow-up",
          nextStep: "text",
          followUpAt
        },
        false
      );
      addLog(linkedLead.id, "Text follow-up", `Scheduled from text organizer: ${contact.snippet || contact.phone}`);
    } else {
      saveState();
      renderAll();
    }
    toast("Text follow-up scheduled.");
  }

  function createLeadFromTextContact(contactId) {
    const contact = state.texting.importedContacts.find((item) => item.id === contactId);
    if (!contact) return;
    const existing = findLeadByPhone(contact.phone);
    if (existing) {
      contact.linkedLeadId = existing.id;
      const patch = {
        source: existing.source || "Text import",
        notes: appendNote(existing.notes, `Text import: ${contact.snippet || contact.phone}`)
      };
      if (contact.followUpAt && (!existing.followUpAt || dateValue(contact.followUpAt) <= dateValue(existing.followUpAt))) {
        patch.status = "follow-up";
        patch.nextStep = "text";
        patch.followUpAt = contact.followUpAt;
      }
      updateLead(
        existing.id,
        patch,
        false
      );
      addLog(existing.id, "Text import", "Linked imported text contact");
      contact.stage = "linked";
      contact.lastAction = "Updated saved lead";
      contact.lastActionAt = new Date().toISOString();
      saveState();
      renderAll();
      toast("Text contact linked to existing lead.");
      return;
    }
    const now = new Date().toISOString();
    const lead = normalizeLead({
      id: newId(),
      createdAt: now,
      updatedAt: now,
      name: contact.name || "",
      source: "Text import",
      phone: contact.phone,
      email: contact.email || "",
      interest: inferInterestFromText(contact.snippet),
      priority: guessPriority(contact.snippet) || "warm",
      nextStep: "text",
      notes: `Imported from text organizer\n${contact.snippet || ""}`,
      smsConsent: false,
      emailConsent: false,
      status: contact.followUpAt ? "follow-up" : "new",
      followUpAt: contact.followUpAt || "",
      quote: normalizeQuote(guessQuoteFromText(contact.snippet, 0) || {}),
      contactLog: [{ at: now, type: "Text import", note: "Created from pasted text" }]
    });
    contact.linkedLeadId = lead.id;
    contact.stage = "linked";
    contact.lastAction = "Created saved lead";
    contact.lastActionAt = now;
    state.leads.unshift(lead);
    saveState();
    renderAll();
    toast("Lead created from text.");
  }

  function openTextContact(contactId) {
    const contact = state.texting.importedContacts.find((item) => item.id === contactId);
    if (!contact?.phone) return;
    const message = renderTextQueueMessage({ ...contact, contactId: contact.id });
    contact.stage = "waiting";
    contact.lastAction = "Opened text";
    contact.lastActionAt = new Date().toISOString();
    const linkedLead = contact.linkedLeadId ? state.leads.find((lead) => lead.id === contact.linkedLeadId) : findLeadByPhone(contact.phone);
    if (linkedLead) {
      contact.linkedLeadId = linkedLead.id;
      updateLead(linkedLead.id, { status: "contacted", nextStep: "waiting", lastTouchAt: new Date().toISOString() }, false);
      addLog(linkedLead.id, "Text", "Opened from text organizer");
    } else {
      saveState();
      renderAll();
    }
    location.href = `sms:${cleanPhone(contact.phone)}?body=${encodeURIComponent(message)}`;
  }

  function extractTextContacts(text) {
    const normalized = normalizeOcrText(text);
    const lines = cleanLeadLines(normalized);
    const phones = [...new Set((normalized.match(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/g) || []).map((phone) => phone.trim()))];
    return phones.map((phone) => {
      const existing = findLeadByPhone(phone);
      const lineIndex = lines.findIndex((line) => comparablePhone(line).includes(comparablePhone(phone)));
      const nearby = lineIndex >= 0 ? lines.slice(Math.max(0, lineIndex - 2), lineIndex + 4) : lines.slice(0, 5);
      const conversation = nearby.join("\n").slice(0, 1200);
      const snippet = nearby.join(" | ").slice(0, 220);
      const followUpAt = inferTextFollowUpFromSnippet(conversation);
      const name = existing?.name || guessNameNearPhone(nearby, phone) || "";
      const email = nearby.join(" ").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
      return {
        id: newId(),
        name,
        phone,
        email,
        snippet,
        conversation,
        stage: existing ? "linked" : followUpAt ? "follow-up" : "needs-review",
        followUpAt,
        lastAction: followUpAt ? "Follow-up inferred" : "",
        lastActionAt: followUpAt ? new Date().toISOString() : "",
        lastImportedAt: new Date().toISOString(),
        linkedLeadId: existing?.id || ""
      };
    });
  }

  function extractSmsBackupContacts(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    if (doc.querySelector("parsererror")) return [];
    const smsNodes = Array.from(doc.querySelectorAll("sms,mms"));
    const byPhone = new Map();
    smsNodes.forEach((node) => {
      const address = node.getAttribute("address") || node.getAttribute("contact_number") || "";
      const phone = comparablePhone(address);
      if (!phone) return;
      const body = normalizeOcrText(node.getAttribute("body") || node.textContent || "");
      const dateMs = Number(node.getAttribute("date")) || 0;
      const date = dateMs ? new Date(dateMs).toISOString() : "";
      const contactName = normalizeSmsContactName(node.getAttribute("contact_name") || "");
      const type = node.getAttribute("type") === "2" ? "Me" : "Customer";
      const line = [date ? formatDateTime(date) : "", `${type}: ${body}`].filter(Boolean).join(" - ");
      const existing = byPhone.get(phone) || {
        id: newId(),
        name: "",
        phone: address,
        email: "",
        messages: [],
        lastImportedAt: "",
        linkedLeadId: findLeadByPhone(phone)?.id || ""
      };
      if (contactName && !existing.name) existing.name = contactName;
      if (body) existing.messages.push({ body, line, dateMs });
      existing.lastImportedAt = date || existing.lastImportedAt || new Date().toISOString();
      byPhone.set(phone, existing);
    });

    return [...byPhone.values()]
      .map((contact) => {
        const sortedMessages = contact.messages.sort((a, b) => b.dateMs - a.dateMs);
        const conversation = sortedMessages.map((message) => message.line || message.body).join("\n").slice(0, 2000);
        const snippet = sortedMessages.map((message) => message.body).filter(Boolean).join(" | ").slice(0, 260);
        const followUpAt = inferTextFollowUpFromSnippet(conversation);
        return {
          id: contact.id,
          name: contact.name || findLeadByPhone(contact.phone)?.name || "",
          phone: contact.phone,
          email: "",
          snippet,
          conversation,
          stage: contact.linkedLeadId ? "linked" : followUpAt ? "follow-up" : "needs-review",
          followUpAt,
          lastAction: followUpAt ? "Follow-up inferred" : "",
          lastActionAt: followUpAt ? new Date().toISOString() : "",
          lastImportedAt: contact.lastImportedAt,
          linkedLeadId: contact.linkedLeadId
        };
      })
      .filter((contact) => contact.phone && contact.snippet)
      .sort((a, b) => dateValue(b.lastImportedAt) - dateValue(a.lastImportedAt))
      .slice(0, 500);
  }

  function normalizeSmsContactName(name) {
    const value = String(name || "").trim();
    if (!value || /^null$/i.test(value) || /^\(unknown\)$/i.test(value)) return "";
    return value;
  }

  function mergeTextContacts(existingContacts, newContacts) {
    const byPhone = new Map((existingContacts || []).map((contact) => [comparablePhone(contact.phone), contact]));
    newContacts.forEach((contact) => {
      const key = comparablePhone(contact.phone);
      if (!key) return;
      const existing = byPhone.get(key);
      byPhone.set(key, {
        ...(existing || {}),
        ...contact,
        id: existing?.id || contact.id,
        name: contact.name || existing?.name || "",
        linkedLeadId: existing?.linkedLeadId || contact.linkedLeadId || "",
        conversation: mergeConversation(existing?.conversation, contact.conversation || contact.snippet),
        stage: existing?.stage === "linked" || contact.linkedLeadId ? "linked" : contact.stage || existing?.stage || "needs-review",
        followUpAt: existing?.followUpAt || contact.followUpAt || "",
        lastAction: existing?.lastAction || contact.lastAction || "",
        lastActionAt: existing?.lastActionAt || contact.lastActionAt || "",
        lastImportedAt: contact.lastImportedAt
      });
    });
    return [...byPhone.values()].sort((a, b) => dateValue(b.lastImportedAt) - dateValue(a.lastImportedAt)).slice(0, 200);
  }

  function mergeConversation(existing, incoming) {
    const current = String(existing || "").trim();
    const next = String(incoming || "").trim();
    if (!current) return next.slice(0, 2000);
    if (!next || current.includes(next)) return current.slice(0, 2000);
    return `${next}\n\n${current}`.slice(0, 2000);
  }

  function guessNameNearPhone(lines, phone) {
    const digits = comparablePhone(phone);
    const directLine = lines.find((line) => comparablePhone(line).includes(digits)) || "";
    const withoutPhone = directLine.replace(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/g, "").replace(/\b(phone|mobile|cell|text)\b\s*[:\-]?/gi, "").trim();
    const directName = guessNameLine([withoutPhone]);
    return directName || guessNameLine(lines);
  }

  function findLeadByPhone(phone) {
    const key = comparablePhone(phone);
    if (!key) return null;
    return state.leads.find((lead) => comparablePhone(lead.phone) === key) || null;
  }

  function inferInterestFromText(text) {
    const lower = String(text || "").toLowerCase();
    if (/bundle|internet.*mobile|mobile.*internet/.test(lower)) return "bundle";
    if (/internet|fiber|gig|mbps|wifi|wi-fi/.test(lower)) return "internet";
    if (/mobile|phone|line|iphone|android/.test(lower)) return "mobile";
    return "";
  }

  function inferTextFollowUpFromSnippet(text) {
    const lower = String(text || "").toLowerCase();
    if (!/\b(follow|later|tomorrow|next week|call back|text back|remind|appointment|appt)\b/.test(lower)) return "";
    if (/\b(30|thirty)\s*(min|minute)/.test(lower)) return toLocalDatetimeValue(minutesFromNow(30));
    if (/\b(1|one)\s*(hour|hr)\b/.test(lower)) return toLocalDatetimeValue(hoursFromNow(1));
    if (/\b(2|two)\s*(hour|hr)\b/.test(lower)) return toLocalDatetimeValue(hoursFromNow(2));
    if (/\btomorrow\b/.test(lower)) return toLocalDatetimeValue(tomorrowMorning());
    if (/\bnext week\b/.test(lower)) return toLocalDatetimeValue(daysFromNow(7));
    if (/\blater\b|\bfollow\b|\bcall back\b|\btext back\b|\bremind\b/.test(lower)) return toLocalDatetimeValue(hoursFromNow(2));
    return "";
  }

  function appendNote(existing, note) {
    const value = String(note || "").trim();
    if (!value) return existing || "";
    if (String(existing || "").includes(value)) return existing || "";
    return [existing, value].filter(Boolean).join("\n");
  }

  function defaultTextQueueTemplate() {
    return "Hi {{firstName}}, this is {{repName}} with {{businessName}}. I wanted to follow up and see if you still want me to check options for you. Reply STOP to opt out.";
  }

  function labelTextAudience(value) {
    return {
      due: "Due follow-up",
      hot: "Hot lead",
      appointments: "Appointment",
      new: "New lead",
      imported: "Imported text contact",
      all: "Text OK customer"
    }[value] || "Text queue";
  }

  function labelTextContactStage(stage) {
    return {
      "needs-review": "Review",
      "follow-up": "Follow-up",
      waiting: "Waiting",
      linked: "Customer"
    }[normalizeTextContactStage(stage)] || "Review";
  }

  function formatPhoneDisplay(phone) {
    const digits = comparablePhone(phone);
    if (digits.length !== 10) return phone || "";
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function renderLeads() {
    const query = el.searchInput.value.trim().toLowerCase();
    const status = el.statusFilter.value;
    const leads = state.leads
      .filter((lead) => (status === "all" ? true : lead.status === status))
      .filter((lead) => {
        if (!query) return true;
        return [
          lead.name,
          lead.phone,
          lead.email,
          lead.source,
          lead.address,
          lead.bestTime,
          lead.appointmentAt,
          lead.appointmentStatus,
          lead.priority,
          lead.nextStep,
          lead.notes,
          quoteTitle(lead.quote),
          quoteSummaryText(lead.quote, { sms: true })
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => dateValue(b.updatedAt) - dateValue(a.updatedAt));

    el.leadList.innerHTML = leads.length
      ? leads.map((lead) => renderLeadCard(lead, false)).join("")
      : `<div class="empty-state">No leads match this view.</div>`;
    bindLeadActions(el.leadList);
  }

  function renderLeadCard(lead, compact) {
    const due = isDue(lead, new Date());
    const quote = calculateQuote(lead.quote);
    const consent = [
      lead.smsConsent ? "Text OK" : "No text consent",
      lead.emailConsent ? "Email OK" : "No email consent"
    ].join(" | ");
    const statusClass = lead.status === "won" ? "closed" : lead.status === "lost" ? "lost" : due ? "warning" : "";
    const compactClass = compact ? " compact-card" : "";
    const quoteLine = quote.total > 0 ? quoteSummaryText(lead.quote, { sms: true }) : "No quote selected";
    const appointmentLine = lead.appointmentAt ? `Appointment: ${formatDateTime(lead.appointmentAt)}` : "";
    const appointmentStatusLine = lead.appointmentStatus ? `Appointment status: ${labelAppointmentStatus(lead.appointmentStatus)}` : "";
    const workflowLine = `${labelPriority(lead.priority)} priority | Next: ${labelNextStep(lead.nextStep)}`;
    return `
      <article class="lead-card${due ? " due" : ""}${compactClass}" data-id="${escapeHtml(lead.id)}">
        <div class="lead-topline">
          <div>
            <h3 class="lead-name">${escapeHtml(lead.name || "Unnamed lead")}</h3>
            <p class="lead-meta">${escapeHtml(formatContact(lead))}</p>
            ${lead.address ? `<p class="lead-meta">${escapeHtml(lead.address)}</p>` : ""}
            <p class="lead-meta quote-line">${escapeHtml(quoteLine)}</p>
            <p class="lead-meta">${escapeHtml(workflowLine)}</p>
            ${appointmentLine ? `<p class="lead-meta">${escapeHtml(appointmentLine)}</p>` : ""}
            ${appointmentStatusLine ? `<p class="lead-meta">${escapeHtml(appointmentStatusLine)}</p>` : ""}
            <p class="lead-meta">${escapeHtml(lead.followUpAt ? `Follow-up: ${formatDateTime(lead.followUpAt)}` : "No follow-up set")}</p>
          </div>
          <div>
            <span class="pill ${statusClass}">${escapeHtml(labelStatus(lead.status))}</span>
            <select class="status-select" data-action="status" aria-label="Change status">
              ${["new", "contacted", "follow-up", "won", "lost"]
                .map((status) => `<option value="${status}"${lead.status === status ? " selected" : ""}>${labelStatus(status)}</option>`)
                .join("")}
            </select>
          </div>
        </div>
        ${lead.bestTime ? `<p class="lead-meta">${escapeHtml(`Best time: ${lead.bestTime}`)}</p>` : ""}
        ${
          lead.notes
            ? `<details class="lead-note-details">
                <summary>Notes</summary>
                <p class="lead-note">${escapeHtml(lead.notes)}</p>
              </details>`
            : ""
        }
        <p class="lead-meta">${escapeHtml(consent)}</p>
        <div class="lead-actions primary-lead-actions">
          <button class="secondary-button" data-action="edit" type="button">Edit</button>
          <button class="secondary-button" data-action="call" ${lead.phone ? "" : "disabled"} type="button">Call</button>
          <button class="secondary-button" data-action="smsInitial" ${lead.phone && lead.smsConsent ? "" : "disabled"} type="button">Text</button>
          <button class="secondary-button" data-action="emailInitial" ${lead.email && lead.emailConsent ? "" : "disabled"} type="button">Email</button>
        </div>
        <details class="lead-more-actions">
          <summary>More actions</summary>
          <div class="lead-actions">
            <button class="secondary-button" data-action="smsAppointment" ${lead.phone && lead.smsConsent && lead.appointmentAt ? "" : "disabled"} type="button">Appt text</button>
            <button class="secondary-button" data-action="emailAppointment" ${lead.email && lead.emailConsent && lead.appointmentAt ? "" : "disabled"} type="button">Appt email</button>
            <button class="secondary-button" data-action="map" ${lead.address ? "" : "disabled"} type="button">Map</button>
            <button class="secondary-button" data-action="calendar" ${lead.appointmentAt ? "" : "disabled"} type="button">Calendar</button>
            <button class="secondary-button" data-action="copyQuote" type="button">Quote</button>
            <button class="secondary-button" data-action="copySummary" type="button">Copy</button>
            <button class="danger-button" data-action="delete" type="button">Delete</button>
          </div>
          <p class="action-group-label">Schedule</p>
          <div class="quick-schedule">
            <button class="secondary-button" data-action="follow30m" type="button">30 min</button>
            <button class="secondary-button" data-action="follow2h" type="button">2 hr</button>
            <button class="secondary-button" data-action="followTomorrow" type="button">Tomorrow</button>
            <button class="secondary-button" data-action="follow3d" type="button">3 days</button>
            <button class="secondary-button" data-action="follow7d" type="button">7 days</button>
            <button class="secondary-button" data-action="followBeforeAppointment" ${lead.appointmentAt ? "" : "disabled"} type="button">1 hr before appt</button>
            <button class="secondary-button" data-action="logNoAnswer" type="button">No answer</button>
          </div>
          <p class="action-group-label">Outcome</p>
          <div class="outcome-actions">
            <button class="secondary-button" data-action="outcomeNoAnswer" type="button">No answer</button>
            <button class="secondary-button" data-action="outcomeLeftVm" type="button">Left VM</button>
            <button class="secondary-button" data-action="outcomeTexted" type="button">Texted</button>
            <button class="secondary-button" data-action="outcomeInterested" type="button">Interested</button>
            <button class="secondary-button" data-action="outcomeNeedsApproval" type="button">Needs approval</button>
            <button class="secondary-button" data-action="outcomePriceObjection" type="button">Price issue</button>
            <button class="secondary-button" data-action="outcomeBadNumber" type="button">Bad #</button>
            <button class="secondary-button" data-action="appointmentConfirmed" ${lead.appointmentAt ? "" : "disabled"} type="button">Appt confirmed</button>
            <button class="secondary-button" data-action="appointmentCompleted" ${lead.appointmentAt ? "" : "disabled"} type="button">Appt done</button>
            <button class="secondary-button" data-action="appointmentMissed" ${lead.appointmentAt ? "" : "disabled"} type="button">Appt missed</button>
            <button class="secondary-button" data-action="appointmentReschedule" ${lead.appointmentAt ? "" : "disabled"} type="button">Reschedule</button>
            <button class="primary-button" data-action="outcomeSold" type="button">Sold</button>
            <button class="danger-button" data-action="outcomeNotInterested" type="button">Not interested</button>
          </div>
        </details>
        ${renderLeadTimeline(lead, compact)}
      </article>
    `;
  }

  function renderLeadTimeline(lead, compact) {
    const entries = [
      { at: lead.createdAt, type: "Created", note: lead.source ? `Source: ${lead.source}` : "Lead saved" },
      ...(lead.contactLog || [])
    ];
    if (lead.followUpAt) entries.push({ at: lead.followUpAt, type: "Next follow-up", note: labelNextStep(lead.nextStep) });
    if (lead.appointmentAt) entries.push({ at: lead.appointmentAt, type: "Appointment", note: labelAppointmentStatus(lead.appointmentStatus) });
    const rows = entries
      .filter((entry) => entry.at)
      .sort((a, b) => dateValue(b.at) - dateValue(a.at))
      .slice(0, compact ? 4 : 10)
      .map((entry) => `<p class="log-line">${escapeHtml(formatDateTime(entry.at))}: ${escapeHtml(entry.type)} - ${escapeHtml(entry.note || "")}</p>`)
      .join("");
    if (!rows) return "";
    return `<details class="lead-log"><summary>Timeline</summary><div class="log-list">${rows}</div></details>`;
  }

  function bindLeadActions(container) {
    container.querySelectorAll("[data-action]").forEach((control) => {
      if (control.tagName === "SELECT") {
        control.addEventListener("change", (event) => {
          const card = event.target.closest(".lead-card");
          if (!card) return;
          updateLead(card.dataset.id, { status: event.target.value });
          addLog(card.dataset.id, "Status", labelStatus(event.target.value));
        });
        return;
      }

      control.addEventListener("click", (event) => {
        const card = event.target.closest(".lead-card");
        if (!card) return;
        handleLeadAction(card.dataset.id, event.target.dataset.action);
      });
    });
  }

  function handleLeadAction(id, action) {
    const lead = state.leads.find((item) => item.id === id);
    if (!lead) return;

    if (action === "edit") {
      loadLeadIntoForm(lead);
      return;
    }

    if (action === "call") {
      addLog(id, "Call", "Started call");
      applyContactAutoFollowUp(id, "call");
      location.href = `tel:${cleanPhone(lead.phone)}`;
      return;
    }

    if (action === "smsInitial") {
      openSms(lead, "smsInitial");
      return;
    }

    if (action === "emailInitial") {
      openEmail(lead, "emailInitial");
      return;
    }

    if (action === "smsAppointment") {
      openSms(lead, "smsAppointment");
      return;
    }

    if (action === "emailAppointment") {
      openEmail(lead, "emailAppointment");
      return;
    }

    if (action === "map") {
      addLog(id, "Map", "Opened address map");
      location.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`;
      return;
    }

    if (action === "calendar") {
      downloadAppointmentIcs(lead);
      addLog(id, "Calendar", "Downloaded appointment event");
      return;
    }

    if (action === "copyQuote") {
      copyText(quoteSummaryText(lead.quote, { sms: false }));
      addLog(id, "Copy", "Copied quote");
      return;
    }

    if (action === "copySummary") {
      copyText(leadSummary(lead));
      addLog(id, "Copy", "Copied lead summary");
      return;
    }

    if (action === "follow30m") {
      scheduleFollowUp(id, minutesFromNow(30), "Scheduled 30 minute follow-up");
      return;
    }

    if (action === "follow2h") {
      scheduleFollowUp(id, hoursFromNow(2), "Scheduled 2 hour follow-up");
      return;
    }

    if (action === "followTomorrow") {
      scheduleFollowUp(id, tomorrowMorning(), "Scheduled tomorrow follow-up");
      return;
    }

    if (action === "follow3d") {
      scheduleFollowUp(id, daysFromNow(3), "Scheduled 3 day follow-up");
      return;
    }

    if (action === "follow7d") {
      scheduleFollowUp(id, daysFromNow(7), "Scheduled 7 day follow-up");
      return;
    }

    if (action === "followBeforeAppointment") {
      if (!lead.appointmentAt) {
        toast("Set an appointment first.");
        return;
      }
      scheduleFollowUp(id, beforeDate(lead.appointmentAt, 60), "Scheduled 1 hour before appointment");
      return;
    }

    if (action === "logNoAnswer") {
      addLog(id, "Call", "No answer");
      scheduleFollowUp(id, hoursFromNow(2), "No answer, follow-up set");
      return;
    }

    if (action.startsWith("outcome")) {
      applyOutcome(id, action);
      return;
    }

    if (action.startsWith("appointment")) {
      applyAppointmentOutcome(id, action);
      return;
    }

    if (action === "delete") {
      const ok = confirm(`Delete ${lead.name || "this lead"}?`);
      if (!ok) return;
      state.leads = state.leads.filter((item) => item.id !== id);
      saveState();
      renderAll();
      toast("Lead deleted.");
    }
  }

  function saveLeadFromForm(event) {
    event.preventDefault();
    const editingId = el.editingLeadId.value;
    const existingLead = editingId ? state.leads.find((item) => item.id === editingId) : null;
    const lead = buildLeadFromForm(existingLead);
    const duplicate = findDuplicateLead(lead, editingId);

    if (duplicate) {
      const ok = confirm(`Possible duplicate: ${duplicate.name || duplicate.phone || duplicate.email}. Save anyway?`);
      if (!ok) return;
    }

    if (existingLead) {
      lead.contactLog = existingLead.contactLog || [];
      lead.contactLog.push({ at: new Date().toISOString(), type: "Edit", note: "Updated lead" });
      state.leads = state.leads.map((item) => (item.id === existingLead.id ? lead : item));
      saveState();
      resetLeadForm();
      closeCapturePanel();
      renderAll();
      switchView("leads");
      toast("Lead updated.");
      return;
    }

    state.leads.unshift(lead);
    saveState();
    resetLeadForm();
    closeCapturePanel();
    renderAll();
    switchView("leads");
    toast("Lead saved.");
  }

  function buildLeadFromForm(existingLead) {
    const formData = new FormData(el.leadForm);
    const now = new Date().toISOString();
    const quote = readLeadQuote();
    const appointmentAt = String(formData.get("appointmentAt") || "");
    const appointmentStatus = appointmentAt ? String(formData.get("appointmentStatus") || existingLead?.appointmentStatus || "set") : "";
    return {
      id: existingLead?.id || newId(),
      createdAt: existingLead?.createdAt || now,
      updatedAt: now,
      lastTouchAt: existingLead?.lastTouchAt || "",
      lastAlertAt: existingLead?.lastAlertAt || "",
      lastAppointmentAlertAt: existingLead?.lastAppointmentAlertAt || "",
      status: existingLead?.status || "new",
      name: String(formData.get("name") || "").trim(),
      source: String(formData.get("source") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      interest: String(formData.get("interest") || inferInterest(quote)),
      budget: String(formData.get("budget") || "").trim(),
      currentProvider: String(formData.get("currentProvider") || "").trim(),
      bestTime: String(formData.get("bestTime") || "").trim(),
      priority: String(formData.get("priority") || "normal"),
      nextStep: String(formData.get("nextStep") || "call"),
      notes: String(formData.get("notes") || "").trim(),
      smsConsent: Boolean(formData.get("smsConsent")),
      emailConsent: Boolean(formData.get("emailConsent")),
      followUpAt: String(formData.get("followUpAt") || ""),
      appointmentAt,
      appointmentStatus,
      quote,
      contactLog: existingLead?.contactLog || []
    };
  }

  function resetLeadForm() {
    el.leadForm.reset();
    el.editingLeadId.value = "";
    el.quickPaste.value = "";
    el.ocrText.value = "";
    resetOcrPreview();
    document.getElementById("leadPriority").value = "normal";
    document.getElementById("leadNextStep").value = "call";
    el.appointmentStatus.value = "";
    el.formTitle.textContent = "Add lead";
    el.formSubtitle.textContent = "Paste a monday lead, upload a screenshot, or type the customer once.";
    el.saveLeadButton.textContent = "Save lead";
    el.cancelEditButton.hidden = true;
    renderQuoteSummaries();
  }

  function loadLeadIntoForm(lead) {
    el.editingLeadId.value = lead.id;
    el.formTitle.textContent = "Edit lead";
    el.formSubtitle.textContent = lead.name ? `Updating ${lead.name}` : "Updating saved lead";
    el.saveLeadButton.textContent = "Update lead";
    el.cancelEditButton.hidden = false;
    openCapturePanel("name");

    setFieldValue("leadName", lead.name);
    setFieldValue("leadSource", lead.source);
    setFieldValue("leadPhone", lead.phone);
    setFieldValue("leadEmail", lead.email);
    setFieldValue("leadAddress", lead.address);
    setFieldValue("leadBudget", lead.budget);
    setFieldValue("leadProvider", lead.currentProvider);
    setFieldValue("leadBestTime", lead.bestTime);
    setFieldValue("leadInterest", lead.interest);
    setFieldValue("leadPriority", lead.priority || "normal");
    setFieldValue("leadNextStep", lead.nextStep || "call");
    setFieldValue("leadNotes", lead.notes);
    setFieldValue("followUpAt", lead.followUpAt);
    setFieldValue("appointmentAt", lead.appointmentAt);
    setFieldValue("appointmentStatus", lead.appointmentStatus);
    document.getElementById("smsConsent").checked = Boolean(lead.smsConsent);
    document.getElementById("emailConsent").checked = Boolean(lead.emailConsent);

    const quote = normalizeQuote(lead.quote || {});
    el.leadMobilePlan.value = quote.mobilePlan;
    el.leadMobileLines.value = String(quote.mobileLines);
    el.leadInternetSpeed.value = quote.internetSpeed;
    el.leadTabletCount.value = String(quote.tabletCount);
    el.quickPaste.value = "";
    el.ocrText.value = "";
    resetOcrPreview();
    renderQuoteSummaries();
    switchView("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function readClipboardIntoPasteBox() {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      toast("Clipboard paste is not available here.");
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast("Clipboard is empty.");
        return;
      }
      el.quickPaste.value = text;
      fillLeadFromPaste();
    } catch (error) {
      toast("Your browser blocked clipboard access. Paste manually.");
    }
  }

  function fillLeadFromPaste() {
    const text = el.quickPaste.value.trim();
    if (!text) {
      toast("Paste lead text first.");
      return;
    }

    applyParsedLeadText(text);
    toast("Filled what I could find.");
  }

  function fillLeadFromOcrText() {
    const text = el.ocrText.value.trim();
    if (!text) {
      toast("Run OCR or paste OCR text first.");
      return;
    }
    el.quickPaste.value = text;
    applyParsedLeadText(text);
    toast("Filled from OCR text.");
  }

  async function handlePhotoSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    await processLeadFile(file, "photo");
    event.target.value = "";
  }

  async function handleFileSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    await processLeadFile(file, "file");
    event.target.value = "";
  }

  async function processLeadFile(file, sourceType) {
    if (isTextFile(file)) {
      updateOcrStatus("Reading uploaded text...");
      try {
        const text = normalizeOcrText(await file.text());
        el.ocrPreview.hidden = true;
        el.ocrText.value = text;
        el.quickPaste.value = text;
        updateOcrStatus(text ? "File text loaded" : "No text found");
        if (text) applyParsedLeadText(text);
      } catch (error) {
        updateOcrStatus("Could not read that file.");
        toast("Upload an image, TXT, CSV, or MD file.");
      }
      return;
    }

    if (!file.type.startsWith("image/")) {
      updateOcrStatus("Unsupported file. Upload an image, TXT, CSV, or MD file.");
      toast("That file type is not supported yet.");
      return;
    }

    el.ocrPreview.src = URL.createObjectURL(file);
    el.ocrPreview.hidden = false;
    el.ocrText.value = "";
    updateOcrStatus(sourceType === "photo" ? "Preparing photo..." : "Preparing uploaded image...");

    const ocrEngine = getOcrEngine();
    if (!ocrEngine || typeof ocrEngine.createWorker !== "function") {
      updateOcrStatus("OCR did not load. Use phone Live Text/Google Lens, then paste text.");
      toast("OCR library is not available.");
      return;
    }

    try {
      const imageForOcr = await preprocessImage(file);
      const worker = await ocrEngine.createWorker("eng", 1, {
        logger: (message) => updateOcrProgress(message)
      });
      updateOcrStatus("Reading text...");
      const result = await worker.recognize(imageForOcr);
      await worker.terminate();
      const text = normalizeOcrText(result.data.text || "");
      el.ocrText.value = text;
      el.quickPaste.value = text;
      updateOcrStatus(text ? "OCR complete" : "No text found");
      if (text) applyParsedLeadText(text);
    } catch (error) {
      updateOcrStatus("OCR failed. Try a closer, sharper photo.");
      toast("Could not read that photo.");
    }
  }

  function applyParsedLeadText(text) {
    const parsed = parseLeadText(text);

    setIfFound("leadName", parsed.name);
    setIfFound("leadPhone", parsed.phone);
    setIfFound("leadEmail", parsed.email);
    setIfFound("leadAddress", parsed.address);
    setIfFound("leadBestTime", parsed.bestTime);
    setIfFound("leadSource", parsed.source);
    setIfFound("leadBudget", parsed.budget);
    setIfFound("leadProvider", parsed.currentProvider);
    setIfFound("appointmentAt", parsed.appointmentAt);
    if (parsed.appointmentAt) el.appointmentStatus.value = "set";
    if (parsed.priority) document.getElementById("leadPriority").value = parsed.priority;
    if (parsed.nextStep) document.getElementById("leadNextStep").value = parsed.nextStep;
    setQuoteHints(parsed.quote);

    const existingNotes = document.getElementById("leadNotes").value.trim();
    document.getElementById("leadNotes").value = existingNotes ? `${existingNotes}\n\n${text}` : text;
  }

  function parseLeadText(text) {
    const lines = cleanLeadLines(text);
    const phone = text.match(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/)?.[0] || "";
    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
    const name =
      valueAfterLabel(text, ["contact name", "customer name", "full name", "name", "customer", "lead"]) ||
      guessNameLine(lines);
    const address =
      valueAfterLabel(text, ["service address", "address", "location", "store address"]) ||
      lines.find((line) => /\b(st|street|rd|road|ave|avenue|dr|drive|ln|lane|ct|court|blvd|way|hwy|highway)\b/i.test(line)) ||
      "";
    const bestTime =
      valueAfterLabel(text, ["best time", "call time", "appointment date", "appointment", "availability", "last interaction date"]) ||
      "";
    const source = valueAfterLabel(text, ["lead source", "source", "how heard", "heard by", "referred by"]) || "";
    const budget = valueAfterLabel(text, ["budget", "monthly budget", "price range"]) || "";
    const currentProvider = valueAfterLabel(text, ["current provider", "provider", "company prospect", "existing provider"]) || "";
    const mobileLines = Number(valueAfterLabel(text, ["number of lines", "number of lines total", "lines", "mobile lines"])) || "";
    const appointmentText = valueAfterLabel(text, ["appointment date", "appointment", "appointment time", "appt date", "appt time"]) || "";

    return {
      name,
      phone,
      email,
      address,
      bestTime,
      source,
      budget,
      currentProvider,
      appointmentAt: parseLooseDateTime(appointmentText),
      priority: guessPriority(text),
      nextStep: guessNextStep(text),
      quote: guessQuoteFromText(text, mobileLines)
    };
  }

  function setQuoteHints(quote) {
    if (!quote) return;
    if (quote.mobilePlan) el.leadMobilePlan.value = quote.mobilePlan;
    if (quote.mobileLines) el.leadMobileLines.value = String(quote.mobileLines);
    if (quote.internetSpeed) el.leadInternetSpeed.value = quote.internetSpeed;
    renderQuoteSummaries();
  }

  function isTextFile(file) {
    const name = file.name.toLowerCase();
    return file.type.startsWith("text/") || isXmlTextFile(file) || name.endsWith(".txt") || name.endsWith(".csv") || name.endsWith(".md");
  }

  function isXmlTextFile(file) {
    const name = String(file.name || "").toLowerCase();
    return name.endsWith(".xml") || file.type.includes("xml");
  }

  function parseLooseDateTime(value) {
    const cleaned = normalizeOcrText(value);
    if (!cleaned) return "";
    const parsed = new Date(cleaned);
    if (Number.isNaN(parsed.getTime())) return "";
    return toLocalDatetimeValue(parsed);
  }

  function guessPriority(text) {
    const lower = text.toLowerCase();
    if (/\b(hot|urgent|asap|today|ready now|call now)\b/.test(lower)) return "hot";
    if (/\b(warm|interested|follow up|callback)\b/.test(lower)) return "warm";
    if (/\b(cold|not interested|later)\b/.test(lower)) return "cold";
    return "";
  }

  function guessNextStep(text) {
    const lower = text.toLowerCase();
    if (/\bappointment|appt\b/.test(lower)) return "appointment";
    if (/\bcheck availability|availability|service address\b/.test(lower)) return "check-availability";
    if (/\bemail\b/.test(lower)) return "email";
    if (/\btext|sms\b/.test(lower)) return "text";
    if (/\bwaiting|pending\b/.test(lower)) return "waiting";
    if (/\bcall|phone\b/.test(lower)) return "call";
    return "";
  }

  function setIfFound(id, value) {
    if (value) document.getElementById(id).value = value;
  }

  function setFieldValue(id, value) {
    const field = document.getElementById(id);
    if (field) field.value = value || "";
  }

  function findDuplicateLead(lead, excludeId) {
    const phone = comparablePhone(lead.phone);
    const email = String(lead.email || "").trim().toLowerCase();
    return state.leads.find((item) => {
      if (item.id === excludeId) return false;
      const itemPhone = comparablePhone(item.phone);
      const itemEmail = String(item.email || "").trim().toLowerCase();
      return Boolean((phone && itemPhone && phone === itemPhone) || (email && itemEmail && email === itemEmail));
    });
  }

  function comparablePhone(phone) {
    const digits = cleanPhone(phone).replace(/\D/g, "");
    if (digits.length >= 10) return digits.slice(-10);
    return digits;
  }

  function saveTemplates() {
    state.templates = {
      smsInitial: el.smsInitialTemplate.value.trim(),
      emailInitial: el.emailInitialTemplate.value.trim(),
      smsFollowUp: el.smsFollowUpTemplate.value.trim(),
      emailFollowUp: el.emailFollowUpTemplate.value.trim(),
      smsAppointment: el.smsAppointmentTemplate.value.trim(),
      emailAppointment: el.emailAppointmentTemplate.value.trim()
    };
    saveState();
    toast("Templates saved.");
  }

  function resetTemplates() {
    state.templates = clone(defaults.templates);
    saveState();
    fillEditors();
    toast("Templates reset.");
  }

  function saveSettings(event) {
    event.preventDefault();
    const formData = new FormData(el.settingsForm);
    state.settings = {
      repName: String(formData.get("repName") || "").trim(),
      businessName: String(formData.get("businessName") || "").trim(),
      replyPhone: String(formData.get("replyPhone") || "").trim(),
      replyEmail: String(formData.get("replyEmail") || "").trim(),
      businessAddress: String(formData.get("businessAddress") || "").trim()
    };
    saveState();
    toast("Settings saved.");
  }

  function openSms(lead, templateKey) {
    if (!lead.smsConsent) {
      toast("SMS permission is required before texting.");
      return;
    }
    const body = renderTemplate(state.templates[templateKey], lead);
    addLog(lead.id, "Text", logLabelForTemplate(templateKey, "text"));
    updateLead(lead.id, contactAutoPatch(lead, "text", templateKey), false);
    location.href = `sms:${cleanPhone(lead.phone)}?body=${encodeURIComponent(body)}`;
  }

  function openEmail(lead, templateKey) {
    if (!lead.emailConsent) {
      toast("Email permission is required before emailing.");
      return;
    }
    const body = renderTemplate(state.templates[templateKey], lead);
    const subject =
      templateKey === "emailAppointment"
        ? `${state.settings.businessName || "Zirrus"} appointment reminder`
        : `${state.settings.businessName || "Zirrus"} quote: ${quoteTitle(lead.quote)}`;
    addLog(lead.id, "Email", logLabelForTemplate(templateKey, "email"));
    updateLead(lead.id, contactAutoPatch(lead, "email", templateKey), false);
    location.href = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function applyContactAutoFollowUp(id, channel) {
    const lead = state.leads.find((item) => item.id === id);
    if (!lead || ["won", "lost"].includes(lead.status)) return;
    updateLead(id, contactAutoPatch(lead, channel, ""), false);
  }

  function contactAutoPatch(lead, channel, templateKey) {
    const now = new Date().toISOString();
    const patch = { status: "contacted", lastTouchAt: now };
    if (["won", "lost"].includes(lead.status)) return { lastTouchAt: now };
    if (templateKey && templateKey.toLowerCase().includes("appointment")) {
      patch.nextStep = "appointment";
      return patch;
    }
    const hasUsefulFutureFollowUp = lead.followUpAt && dateValue(lead.followUpAt) > Date.now() + 10 * 60 * 1000;
    if (hasUsefulFutureFollowUp) return patch;
    if (channel === "call") {
      patch.status = "follow-up";
      patch.nextStep = "call";
      patch.followUpAt = toLocalDatetimeValue(hoursFromNow(2));
    } else if (channel === "text") {
      patch.nextStep = "waiting";
      patch.followUpAt = toLocalDatetimeValue(tomorrowMorning());
    } else if (channel === "email") {
      patch.nextStep = "waiting";
      patch.followUpAt = toLocalDatetimeValue(daysFromNow(3));
    }
    return patch;
  }

  function renderTemplate(template, lead) {
    const quote = calculateQuote(lead.quote);
    const appointment = lead.appointmentAt ? new Date(lead.appointmentAt) : null;
    const data = {
      firstName: firstName(lead.name),
      name: lead.name || "",
      quoteTitle: quoteTitle(lead.quote),
      quoteSummary: quoteSummaryText(lead.quote, { sms: false }),
      quoteSummarySms: quoteSummaryText(lead.quote, { sms: true }),
      quoteTotal: quote.total ? `${formatMoney(quote.total)}/mo` : "",
      bundleDiscount: quote.discount ? `${formatMoney(quote.discount)}/mo` : "",
      packageName: quoteTitle(lead.quote),
      packagePrice: quote.total ? `${formatMoney(quote.total)}/mo` : "",
      packageDetails: quoteSummaryText(lead.quote, { sms: true }),
      packageSummary: quoteSummaryText(lead.quote, { sms: false }),
      appointmentDateTime: lead.appointmentAt ? formatDateTime(lead.appointmentAt) : "your appointment time",
      appointmentDate: appointment ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(appointment) : "",
      appointmentTime: appointment ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(appointment) : "",
      priority: labelPriority(lead.priority),
      nextStep: labelNextStep(lead.nextStep),
      repName: state.settings.repName || "your rep",
      businessName: state.settings.businessName || "Zirrus",
      replyPhone: state.settings.replyPhone || "",
      replyEmail: state.settings.replyEmail || "",
      businessAddress: state.settings.businessAddress || ""
    };

    return applyTemplateTokens(template, data);
  }

  function applyTemplateTokens(template, data) {
    return String(template || "").replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || "");
  }

  function logLabelForTemplate(templateKey, channel) {
    const labels = {
      smsInitial: "Opened initial text",
      emailInitial: "Opened initial email",
      smsFollowUp: "Opened follow-up text",
      emailFollowUp: "Opened follow-up email",
      smsAppointment: "Opened appointment reminder text",
      emailAppointment: "Opened appointment reminder email"
    };
    return labels[templateKey] || `Opened ${channel}`;
  }

  function scheduleFollowUp(id, date, note) {
    updateLead(id, { status: "follow-up", followUpAt: toLocalDatetimeValue(date) }, false);
    addLog(id, "Follow-up", note);
    toast("Follow-up scheduled.");
  }

  function applyOutcome(id, action) {
    const lead = state.leads.find((item) => item.id === id);
    if (!lead) return;
    const now = new Date().toISOString();
    const plans = {
      outcomeNoAnswer: {
        type: "Call",
        note: "No answer",
        patch: { status: "follow-up", nextStep: "call", followUpAt: toLocalDatetimeValue(hoursFromNow(2)) }
      },
      outcomeLeftVm: {
        type: "Call",
        note: "Left voicemail",
        patch: { status: "follow-up", nextStep: "call", followUpAt: toLocalDatetimeValue(tomorrowMorning()), lastTouchAt: now }
      },
      outcomeTexted: {
        type: "Text",
        note: "Texted customer",
        patch: { status: "contacted", nextStep: "waiting", followUpAt: toLocalDatetimeValue(tomorrowMorning()), lastTouchAt: now }
      },
      outcomeInterested: {
        type: "Outcome",
        note: "Interested",
        patch: { priority: "hot", status: "follow-up", nextStep: "check-availability", followUpAt: toLocalDatetimeValue(hoursFromNow(2)) }
      },
      outcomeNeedsApproval: {
        type: "Outcome",
        note: "Needs approval",
        patch: { priority: "warm", status: "follow-up", nextStep: "waiting", followUpAt: toLocalDatetimeValue(daysFromNow(3)) }
      },
      outcomePriceObjection: {
        type: "Outcome",
        note: "Price issue",
        patch: { priority: "warm", status: "follow-up", nextStep: "call", followUpAt: toLocalDatetimeValue(daysFromNow(3)) }
      },
      outcomeBadNumber: {
        type: "Outcome",
        note: "Bad number",
        patch: { status: "lost", nextStep: "close", followUpAt: "" }
      },
      outcomeSold: {
        type: "Outcome",
        note: "Sold",
        patch: { status: "won", nextStep: "close", followUpAt: "" }
      },
      outcomeNotInterested: {
        type: "Outcome",
        note: "Not interested",
        patch: { status: "lost", nextStep: "close", followUpAt: "" }
      }
    };
    const plan = plans[action];
    if (!plan) return;
    patchLeadWithLog(lead, plan.patch, plan.type, plan.note);
    toast(plan.note);
  }

  function applyAppointmentOutcome(id, action) {
    const lead = state.leads.find((item) => item.id === id);
    if (!lead) return;
    const plans = {
      appointmentConfirmed: {
        note: "Appointment confirmed",
        patch: {
          appointmentStatus: "confirmed",
          nextStep: "appointment",
          followUpAt: lead.appointmentAt ? toLocalDatetimeValue(beforeDate(lead.appointmentAt, 60)) : lead.followUpAt
        }
      },
      appointmentCompleted: {
        note: "Appointment completed",
        patch: { appointmentStatus: "completed", status: "follow-up", nextStep: "close", followUpAt: toLocalDatetimeValue(tomorrowMorning()) }
      },
      appointmentMissed: {
        note: "Appointment missed",
        patch: { appointmentStatus: "missed", priority: "hot", status: "follow-up", nextStep: "appointment", followUpAt: toLocalDatetimeValue(minutesFromNow(30)) }
      },
      appointmentReschedule: {
        note: "Needs reschedule",
        patch: { appointmentStatus: "reschedule", priority: "hot", status: "follow-up", nextStep: "appointment", followUpAt: toLocalDatetimeValue(minutesFromNow(30)) }
      }
    };
    const plan = plans[action];
    if (!plan) return;
    patchLeadWithLog(lead, plan.patch, "Appointment", plan.note);
    toast(plan.note);
  }

  function patchLeadWithLog(lead, patch, type, note) {
    Object.assign(lead, patch, { updatedAt: new Date().toISOString() });
    lead.contactLog = lead.contactLog || [];
    lead.contactLog.push({ at: new Date().toISOString(), type, note });
    if (["Call", "Text", "Email"].includes(type) && !patch.lastTouchAt) {
      lead.lastTouchAt = new Date().toISOString();
    }
    saveState();
    renderAll();
  }

  function setFormFollowUp(preset) {
    const date = dateForPreset(preset);
    document.getElementById("followUpAt").value = toLocalDatetimeValue(date);
    toast("Follow-up time set.");
  }

  function setFormAppointment(preset) {
    const date = appointmentDateForPreset(preset);
    document.getElementById("appointmentAt").value = toLocalDatetimeValue(date);
    el.appointmentStatus.value = "set";
    document.getElementById("leadNextStep").value = "appointment";
    toast("Appointment time set.");
  }

  function addLog(id, type, note) {
    const lead = state.leads.find((item) => item.id === id);
    if (!lead) return;
    lead.contactLog = lead.contactLog || [];
    lead.contactLog.push({ at: new Date().toISOString(), type, note });
    lead.updatedAt = new Date().toISOString();
    if (["Call", "Text", "Email"].includes(type)) {
      lead.lastTouchAt = new Date().toISOString();
    }
    saveState();
    renderAll();
  }

  function updateLead(id, patch, shouldRender = true) {
    const lead = state.leads.find((item) => item.id === id);
    if (!lead) return;
    Object.assign(lead, patch, { updatedAt: new Date().toISOString() });
    saveState();
    if (shouldRender) renderAll();
  }

  function downloadBackup() {
    downloadFile(`lead-assistant-backup-${dateStamp()}.json`, getBackupJson(), "application/json");
    markBackup();
    toast("Backup downloaded.");
  }

  async function shareBackup() {
    const file = new File([getBackupJson()], `lead-assistant-backup-${dateStamp()}.json`, { type: "application/json" });
    if (!navigator.share || !navigator.canShare || !navigator.canShare({ files: [file] })) {
      downloadBackup();
      toast("Sharing is not supported here, so a backup was downloaded.");
      return;
    }
    try {
      await navigator.share({
        title: "Lead Assistant backup",
        text: "Lead Assistant backup file",
        files: [file]
      });
      markBackup();
      toast("Backup shared.");
    } catch (error) {
      toast("Backup share canceled.");
    }
  }

  function copyBackup() {
    copyText(getBackupJson());
    markBackup();
  }

  function getBackupJson() {
    return JSON.stringify(state, null, 2);
  }

  function markBackup() {
    state.lastBackupAt = new Date().toISOString();
    saveState();
    renderDailyCloseout();
  }

  function downloadAppointmentIcs(lead) {
    if (!lead.appointmentAt) {
      toast("Set an appointment first.");
      return;
    }
    const start = new Date(lead.appointmentAt);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Lead Assistant//Zirrus//EN",
      "BEGIN:VEVENT",
      `UID:${lead.id}@lead-assistant`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${icsText(`Zirrus appointment - ${lead.name || "Lead"}`)}`,
      `DESCRIPTION:${icsText(leadSummary(lead))}`,
      lead.address ? `LOCATION:${icsText(lead.address)}` : "",
      "END:VEVENT",
      "END:VCALENDAR"
    ].filter(Boolean);
    downloadFile(`appointment-${slugifyFile(lead.name || "lead")}.ics`, lines.join("\r\n"), "text/calendar");
  }

  function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        state = normalizeState(imported);
        saveState();
        fillEditors();
        renderQuoteSummaries();
        renderAll();
        toast("Backup imported.");
      } catch (error) {
        toast("Could not import that backup.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function exportCsv() {
    const headers = [
      "name",
      "phone",
      "email",
      "address",
      "source",
      "status",
      "priority",
      "nextStep",
      "interest",
      "quote",
      "budget",
      "currentProvider",
      "bestTime",
      "smsConsent",
      "emailConsent",
      "followUpAt",
      "appointmentAt",
      "appointmentStatus",
      "notes"
    ];
    const rows = state.leads.map((lead) => [
      lead.name,
      lead.phone,
      lead.email,
      lead.address,
      lead.source,
      lead.status,
      lead.priority,
      lead.nextStep,
      lead.interest,
      quoteSummaryText(lead.quote, { sms: true }),
      lead.budget,
      lead.currentProvider,
      lead.bestTime,
      lead.smsConsent ? "yes" : "no",
      lead.emailConsent ? "yes" : "no",
      lead.followUpAt,
      lead.appointmentAt,
      lead.appointmentStatus,
      lead.notes
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    downloadFile(`leads-${dateStamp()}.csv`, csv, "text/csv");
  }

  function clearClosed() {
    const closedCount = state.leads.filter((lead) => ["won", "lost"].includes(lead.status)).length;
    if (!closedCount) {
      toast("No won/lost leads to clear.");
      return;
    }
    const ok = confirm(`Clear ${closedCount} won/lost leads? Export a backup first if you need records.`);
    if (!ok) return;
    state.leads = state.leads.filter((lead) => !["won", "lost"].includes(lead.status));
    saveState();
    renderAll();
    toast("Closed leads cleared.");
  }

  function enableAlerts() {
    if (!("Notification" in window)) {
      toast("This browser does not support notifications.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      toast(permission === "granted" ? "Reminder alerts enabled while app is open." : "Reminder alerts were not enabled.");
    });
  }

  function checkReminderAlerts() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const now = new Date();
    state.leads
      .filter((lead) => isDue(lead, now) && lead.lastAlertAt !== lead.followUpAt)
      .slice(0, 3)
      .forEach((lead) => {
        new Notification(`Follow up: ${lead.name}`, {
          body: `${quoteTitle(lead.quote)} - ${formatContact(lead)}`
        });
        lead.lastAlertAt = lead.followUpAt;
      });
    state.leads
      .filter((lead) => isAppointmentSoon(lead, now) && lead.lastAppointmentAlertAt !== lead.appointmentAt)
      .slice(0, 3)
      .forEach((lead) => {
        new Notification(`Appointment: ${lead.name}`, {
          body: `${formatDateTime(lead.appointmentAt)} - ${formatContact(lead)}`
        });
        lead.lastAppointmentAlertAt = lead.appointmentAt;
      });
    saveState();
  }

  function markDailyReview() {
    state.dailyReviewAt = new Date().toISOString();
    saveState();
    toast("Daily review marked.");
  }

  function renderPricingTables() {
    const mobileRows = pricing.mobilePlans
      .filter((plan) => plan.id)
      .map((plan) => {
        const prices = [1, 2, 3, 4, 5].map((line) => `${line}: ${formatMoney(plan.prices[line])}`).join(" | ");
        const bundle = plan.bundleEligible ? "Bundle eligible" : "No bundle discount";
        const tablet = plan.tabletPrice == null ? "Tablet/iPad N/A" : `Tablet/iPad ${formatMoney(plan.tabletPrice)}/mo`;
        return `
          <article class="price-card">
            <h3>${escapeHtml(plan.name)}</h3>
            <p>${escapeHtml(prices)}</p>
            <p>${escapeHtml(`${plan.data}${plan.hotspot ? `, ${plan.hotspot}` : ""}`)}</p>
            <p>${escapeHtml(`${bundle}. ${tablet}.`)}</p>
          </article>
        `;
      })
      .join("");

    const internetRows = pricing.internetPlans
      .filter((plan) => plan.id)
      .map((plan) => `
        <article class="price-card">
          <h3>${escapeHtml(plan.name)}</h3>
          <p>${escapeHtml(`${formatMoney(plan.price)}/mo`)}</p>
          <p>${escapeHtml(plan.wifi || "Smart Wi-Fi 6 not included")}</p>
        </article>
      `)
      .join("");

    el.pricingTables.innerHTML = `
      <div class="pricing-note">Bundle rule: subtract ${formatMoney(pricing.bundleDiscount)}/mo when the customer has 1 Gig or higher internet plus Basic, Preferred, or Freedom mobile.</div>
      <h3 class="pricing-title">Mobile</h3>
      <div class="price-grid">${mobileRows}</div>
      <h3 class="pricing-title">Internet</h3>
      <div class="price-grid">${internetRows}</div>
    `;
  }

  function readLeadQuote() {
    return normalizeQuote({
      mobilePlan: el.leadMobilePlan.value,
      mobileLines: el.leadMobileLines.value,
      internetSpeed: el.leadInternetSpeed.value,
      tabletCount: el.leadTabletCount.value
    });
  }

  function readQuickQuote() {
    return normalizeQuote({
      mobilePlan: el.quoteMobilePlan.value,
      mobileLines: el.quoteMobileLines.value,
      internetSpeed: el.quoteInternetSpeed.value,
      tabletCount: el.quoteTabletCount.value
    });
  }

  function applyQuickQuoteToLeadForm() {
    const quote = readQuickQuote();
    el.leadMobilePlan.value = quote.mobilePlan;
    el.leadMobileLines.value = String(quote.mobileLines);
    el.leadInternetSpeed.value = quote.internetSpeed;
    el.leadTabletCount.value = String(quote.tabletCount);
    renderQuoteSummaries();
    switchView("dashboard");
    openCapturePanel("name");
    toast("Quote copied to lead form.");
  }

  function updateInterestFromLeadQuote() {
    const quote = readLeadQuote();
    const inferred = inferInterest(quote);
    if (inferred) el.leadInterest.value = inferred;
  }

  function normalizeLead(lead) {
    const normalized = {
      id: lead.id || newId(),
      createdAt: lead.createdAt || new Date().toISOString(),
      updatedAt: lead.updatedAt || new Date().toISOString(),
      lastTouchAt: lead.lastTouchAt || "",
      status: lead.status || "new",
      name: lead.name || "",
      source: lead.source || "",
      phone: lead.phone || "",
      email: lead.email || "",
      address: lead.address || "",
      interest: lead.interest || "",
      budget: lead.budget || "",
      currentProvider: lead.currentProvider || "",
      bestTime: lead.bestTime || "",
      priority: lead.priority || "normal",
      nextStep: lead.nextStep || "call",
      notes: lead.notes || "",
    smsConsent: Boolean(lead.smsConsent),
      emailConsent: Boolean(lead.emailConsent),
      followUpAt: lead.followUpAt || "",
      appointmentAt: lead.appointmentAt || "",
      appointmentStatus: lead.appointmentStatus || (lead.appointmentAt ? "set" : ""),
      quote: normalizeQuote(lead.quote || legacyQuoteFromInterest(lead.interest)),
      contactLog: Array.isArray(lead.contactLog) ? lead.contactLog : []
    };
    if (!normalized.interest) normalized.interest = inferInterest(normalized.quote);
    return normalized;
  }

  function normalizeMarketing(marketing) {
    const source = marketing && typeof marketing === "object" ? marketing : {};
    return {
      ...clone(marketingDefaults),
      ...source,
      lastObjective: normalizeMarketingObjective(source.lastObjective || source.generatedDrafts?.[0]?.objective || source.posts?.[0]?.objective || "address-check"),
      monthlyPromo: cleanMarketingText(source.monthlyPromo || ""),
      monthlyPromoUpdatedAt: source.monthlyPromoUpdatedAt || "",
      monthlyPromoMonth: source.monthlyPromoMonth || monthKeyFromDate(source.monthlyPromoUpdatedAt),
      promoSuggestions: normalizePromoSuggestions(source.promoSuggestions),
      lastPromoFetchAt: source.lastPromoFetchAt || "",
      promoFetchError: source.promoFetchError || "",
      generatedDrafts: Array.isArray(source.generatedDrafts) ? source.generatedDrafts.map(normalizeMarketingDraft) : [],
      selectedDraftIndex: clampNumber(source.selectedDraftIndex, 0, 2, 0),
      posts: Array.isArray(source.posts) ? source.posts.map(normalizeMarketingPost) : []
    };
  }

  function normalizeTexting(texting) {
    const source = texting && typeof texting === "object" ? texting : {};
    const queueAudience = ["due", "hot", "appointments", "new", "imported", "all"].includes(source.queueAudience)
      ? source.queueAudience
      : textingDefaults.queueAudience;
    const queue = Array.isArray(source.queue) ? source.queue.map(normalizeTextQueueItem).filter((item) => item.phone) : [];
    const selectedQueueId = queue.some((item) => item.id === source.selectedQueueId) ? source.selectedQueueId : queue[0]?.id || "";
    return {
      ...clone(textingDefaults),
      ...source,
      importText: normalizeOcrText(source.importText || ""),
      importedContacts: Array.isArray(source.importedContacts) ? source.importedContacts.map(normalizeTextContact).filter((contact) => contact.phone) : [],
      queueAudience,
      queueTemplate: String(source.queueTemplate || ""),
      queue,
      selectedQueueId,
      lastImportAt: source.lastImportAt || ""
    };
  }

  function normalizeTextContact(contact) {
    const phone = contact?.phone || "";
    return {
      id: contact?.id || newId(),
      name: String(contact?.name || "").trim(),
      phone,
      email: String(contact?.email || "").trim(),
      snippet: normalizeOcrText(contact?.snippet || "").slice(0, 500),
      conversation: normalizeOcrText(contact?.conversation || contact?.snippet || "").slice(0, 2200),
      stage: normalizeTextContactStage(contact?.stage || (contact?.linkedLeadId ? "linked" : "needs-review")),
      followUpAt: contact?.followUpAt || "",
      lastAction: String(contact?.lastAction || ""),
      lastActionAt: contact?.lastActionAt || "",
      lastImportedAt: contact?.lastImportedAt || contact?.createdAt || "",
      linkedLeadId: contact?.linkedLeadId || ""
    };
  }

  function normalizeTextQueueItem(item) {
    return {
      id: item?.id || newId(),
      leadId: item?.leadId || "",
      contactId: item?.contactId || "",
      name: String(item?.name || ""),
      phone: String(item?.phone || ""),
      message: String(item?.message || ""),
      reason: String(item?.reason || ""),
      status: item?.status === "opened" ? "opened" : "ready",
      createdAt: item?.createdAt || new Date().toISOString()
    };
  }

  function normalizeTextContactStage(stage) {
    return ["needs-review", "follow-up", "waiting", "linked"].includes(stage) ? stage : "needs-review";
  }

  function normalizePromoSuggestions(promos) {
    if (!Array.isArray(promos)) return [];
    const seen = new Set();
    return promos
      .map((promo) => ({
        title: cleanMarketingText(promo?.title || "Zirrus promo"),
        text: cleanMarketingText(promo?.text || ""),
        source: cleanMarketingText(promo?.source || ""),
        objective: normalizeMarketingObjective(promo?.objective || "")
      }))
      .filter((promo) => {
        if (!promo.text || seen.has(promo.text.toLowerCase())) return false;
        seen.add(promo.text.toLowerCase());
        return true;
      })
      .slice(0, 8);
  }

  function normalizeMarketingDraft(draft) {
    return {
      objective: draft?.objective ? normalizeMarketingObjective(draft.objective) : "",
      monthlyPromo: cleanMarketingText(draft?.monthlyPromo || ""),
      title: draft?.title || "Draft",
      angle: draft?.angle || "",
      text: draft?.text || ""
    };
  }

  function normalizeMarketingPost(post) {
    return {
      id: post.id || newId(),
      createdAt: post.createdAt || new Date().toISOString(),
      updatedAt: post.updatedAt || new Date().toISOString(),
      postedAt: post.postedAt || "",
      status: post.status || "planned",
      scheduledAt: post.scheduledAt || "",
      channel: post.channel || "page",
      objective: normalizeMarketingObjective(post.objective || "address-check"),
      tone: post.tone || "neighbor",
      audience: post.audience || "",
      offer: post.offer || "",
      hook: post.hook || "",
      monthlyPromo: cleanMarketingText(post.monthlyPromo || ""),
      text: post.text || "",
      responses: clampNumber(post.responses, 0, 9999, 0),
      leads: clampNumber(post.leads, 0, 9999, 0)
    };
  }

  function normalizeQuote(quote) {
    const mobilePlan = getMobilePlan(quote?.mobilePlan || "") ? quote?.mobilePlan || "" : "";
    const internetSpeed = getInternetPlan(quote?.internetSpeed || "") ? quote?.internetSpeed || "" : "";
    return {
      mobilePlan,
      mobileLines: clampNumber(quote?.mobileLines, 1, 5, 1),
      internetSpeed,
      tabletCount: clampNumber(quote?.tabletCount, 0, 2, 0)
    };
  }

  function legacyQuoteFromInterest(interest) {
    if (interest === "home-internet") return { internetSpeed: "1gig" };
    if (interest === "phone-internet-bundle") return { mobilePlan: "basic", internetSpeed: "1gig" };
    if (interest === "mobile-starter") return { mobilePlan: "senior-1gb" };
    if (interest === "mobile-unlimited") return { mobilePlan: "basic" };
    return {};
  }

  function calculateQuote(quoteInput) {
    const quote = normalizeQuote(quoteInput);
    const mobilePlan = getMobilePlan(quote.mobilePlan);
    const internetPlan = getInternetPlan(quote.internetSpeed);
    const linePrice = mobilePlan ? mobilePlan.prices[quote.mobileLines] || 0 : 0;
    const mobileTotal = linePrice * quote.mobileLines;
    const tabletAllowed = mobilePlan && mobilePlan.tabletPrice != null;
    const tabletTotal = tabletAllowed ? mobilePlan.tabletPrice * quote.tabletCount : 0;
    const internetTotal = internetPlan ? internetPlan.price : 0;
    const discount =
      mobilePlan && internetPlan && mobilePlan.bundleEligible && internetPlan.bundleRank >= 3 ? pricing.bundleDiscount : 0;
    const total = Math.max(0, mobileTotal + tabletTotal + internetTotal - discount);
    const warnings = [];

    if (quote.tabletCount > 0 && mobilePlan && mobilePlan.tabletPrice == null) {
      warnings.push(`${mobilePlan.shortName} does not list a tablet/iPad add-on.`);
    }

    return {
      quote,
      mobilePlan,
      internetPlan,
      linePrice,
      mobileTotal,
      tabletAllowed,
      tabletTotal,
      internetTotal,
      discount,
      total,
      warnings
    };
  }

  function quoteSummaryHtml(quoteInput) {
    const quote = calculateQuote(quoteInput);
    if (!hasMobile(quote) && !hasInternet(quote)) {
      return `<div class="quote-total">No quote selected</div><p>Choose mobile, internet, or both.</p>`;
    }
    const rows = quoteRows(quote)
      .map((row) => `<div class="quote-row"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong></div>`)
      .join("");
    const warnings = quote.warnings.map((warning) => `<p class="quote-warning">${escapeHtml(warning)}</p>`).join("");
    return `
      ${rows}
      <div class="quote-total"><span>Estimated monthly</span><strong>${escapeHtml(formatMoney(quote.total))}/mo</strong></div>
      ${warnings}
    `;
  }

  function quoteRows(quote) {
    const rows = [];
    if (quote.mobilePlan && quote.mobilePlan.id) {
      rows.push({
        label: `${quote.mobilePlan.name}, ${quote.quote.mobileLines} line${quote.quote.mobileLines === 1 ? "" : "s"}`,
        value: `${formatMoney(quote.linePrice)}/line`
      });
      rows.push({
        label: "Mobile subtotal",
        value: `${formatMoney(quote.mobileTotal)}/mo`
      });
      rows.push({
        label: "Data",
        value: [quote.mobilePlan.data, quote.mobilePlan.hotspot].filter(Boolean).join(", ")
      });
    }
    if (quote.tabletTotal > 0) {
      rows.push({
        label: `${quote.quote.tabletCount} tablet/iPad add-on${quote.quote.tabletCount === 1 ? "" : "s"}`,
        value: `${formatMoney(quote.tabletTotal)}/mo`
      });
    }
    if (quote.internetPlan && quote.internetPlan.id) {
      rows.push({
        label: `${quote.internetPlan.name} internet`,
        value: `${formatMoney(quote.internetTotal)}/mo`
      });
      if (quote.internetPlan.wifi) rows.push({ label: "Included", value: quote.internetPlan.wifi });
    }
    if (quote.discount > 0) {
      rows.push({
        label: "Bundle savings",
        value: `-${formatMoney(quote.discount)}/mo`
      });
    }
    return rows;
  }

  function quoteSummaryText(quoteInput, options = {}) {
    const quote = calculateQuote(quoteInput);
    if (!hasMobile(quote) && !hasInternet(quote)) return "No quote selected";

    if (options.sms) {
      const parts = [];
      if (hasMobile(quote)) {
        parts.push(`${quote.mobilePlan.shortName} ${quote.quote.mobileLines} line${quote.quote.mobileLines === 1 ? "" : "s"} at ${formatMoney(quote.linePrice)}/line`);
      }
      if (hasInternet(quote)) {
        parts.push(`${quote.internetPlan.name} internet at ${formatMoney(quote.internetTotal)}/mo`);
      }
      if (quote.discount > 0) parts.push(`${formatMoney(quote.discount)} bundle savings`);
      parts.push(`estimated total ${formatMoney(quote.total)}/mo`);
      return parts.join(", ");
    }

    const lines = quoteRows(quote).map((row) => `${row.label}: ${row.value}`);
    lines.push(`Estimated monthly total: ${formatMoney(quote.total)}/mo`);
    return lines.join("\n");
  }

  function quoteTitle(quoteInput) {
    const quote = calculateQuote(quoteInput);
    if (hasMobile(quote) && hasInternet(quote)) return "Mobile + Internet Bundle";
    if (hasMobile(quote)) return `${quote.mobilePlan.name} Mobile`;
    if (hasInternet(quote)) return `${quote.internetPlan.name} Internet`;
    return "Zirrus options";
  }

  function hasMobile(calculatedQuote) {
    return Boolean(calculatedQuote.mobilePlan && calculatedQuote.mobilePlan.id);
  }

  function hasInternet(calculatedQuote) {
    return Boolean(calculatedQuote.internetPlan && calculatedQuote.internetPlan.id);
  }

  function inferInterest(quoteInput) {
    const quote = normalizeQuote(quoteInput);
    if (quote.mobilePlan && quote.internetSpeed) return "bundle";
    if (quote.mobilePlan) return "mobile";
    if (quote.internetSpeed) return "internet";
    return "";
  }

  function getMobilePlan(id) {
    return pricing.mobilePlans.find((plan) => plan.id === id);
  }

  function getInternetPlan(id) {
    return pricing.internetPlans.find((plan) => plan.id === id);
  }

  function leadSummary(lead) {
    return [
      `Name: ${lead.name || ""}`,
      `Phone: ${lead.phone || ""}`,
      `Email: ${lead.email || ""}`,
      `Address: ${lead.address || ""}`,
      `Source: ${lead.source || ""}`,
      `Status: ${labelStatus(lead.status)}`,
      `Priority: ${labelPriority(lead.priority)}`,
      `Next step: ${labelNextStep(lead.nextStep)}`,
      `Interest: ${lead.interest || ""}`,
      `Quote:\n${quoteSummaryText(lead.quote, { sms: false })}`,
      `Budget: ${lead.budget || ""}`,
      `Current provider: ${lead.currentProvider || ""}`,
      `Best time: ${lead.bestTime || ""}`,
      `Follow-up: ${lead.followUpAt ? formatDateTime(lead.followUpAt) : ""}`,
      `Appointment: ${lead.appointmentAt ? formatDateTime(lead.appointmentAt) : ""}`,
      `Appointment status: ${lead.appointmentStatus ? labelAppointmentStatus(lead.appointmentStatus) : ""}`,
      `Notes: ${lead.notes || ""}`
    ].join("\n");
  }

  function formatContact(lead) {
    return [lead.phone, lead.email, lead.source ? `Source: ${lead.source}` : ""].filter(Boolean).join(" | ");
  }

  function labelStatus(status) {
    return {
      new: "New",
      contacted: "Contacted",
      "follow-up": "Follow-up",
      won: "Won",
      lost: "Lost"
    }[status] || "New";
  }

  function labelPriority(priority) {
    return {
      hot: "Hot",
      warm: "Warm",
      cold: "Cold",
      normal: "Normal"
    }[priority] || "Normal";
  }

  function labelNextStep(nextStep) {
    return {
      call: "Call",
      text: "Text",
      email: "Email",
      "check-availability": "Check availability",
      appointment: "Appointment",
      waiting: "Waiting",
      close: "Close"
    }[nextStep] || "Call";
  }

  function labelAppointmentStatus(status) {
    return {
      set: "Set",
      confirmed: "Confirmed",
      completed: "Completed",
      missed: "Missed",
      reschedule: "Needs reschedule"
    }[status] || "No appointment";
  }

  function labelMarketingObjective(objective) {
    return getMarketingCampaign(objective).label || "Marketing post";
  }

  function labelMarketingChannel(channel) {
    return {
      page: "Business Page",
      "group-manual": "Local group/manual",
      story: "Story/Reel caption",
      ad: "Lead ad idea"
    }[channel] || "Business Page";
  }

  function labelMarketingStatus(status) {
    return {
      planned: "Planned",
      posted: "Posted",
      paused: "Paused"
    }[status] || "Planned";
  }

  function firstName(name) {
    return String(name || "").trim().split(/\s+/)[0] || "there";
  }

  function cleanPhone(phone) {
    return String(phone || "").replace(/[^\d+]/g, "");
  }

  function valueAfterLabel(text, labels) {
    const normalized = normalizeOcrText(text);
    const lines = cleanLeadLines(normalized);
    for (const label of labels) {
      const escaped = escapeRegExp(label);
      const regex = new RegExp(`\\b${escaped}\\b\\s*(?:[:\\-\\|]|is)?\\s*([^\\n\\r]+)`, "i");
      const match = normalized.match(regex);
      if (match) return match[1].trim();

      const lineIndex = lines.findIndex((line) => new RegExp(`^${escaped}$`, "i").test(line) || new RegExp(`^${escaped}\\b`, "i").test(line));
      if (lineIndex >= 0) {
        const inline = lines[lineIndex].replace(new RegExp(`^${escaped}\\s*[:\\-\\|]?\\s*`, "i"), "").trim();
        if (inline && inline.toLowerCase() !== label.toLowerCase()) return inline;
        const next = lines.slice(lineIndex + 1).find((line) => !looksLikeLabelOnly(line));
        if (next) return next;
      }
    }
    return "";
  }

  function guessNameLine(lines) {
    const blacklist = /\b(update|updates|reply|like|status|source|email|phone|number|date|appointment|calendar|activity|files|comment|monday|contact|tracking|sales|type|order|open|closed|button|submitted)\b/i;
    return (
      lines.find((line) => {
        if (line.includes("@") || /\d{3}/.test(line) || line.length > 60 || blacklist.test(line)) return false;
        return /^[A-Z][a-zA-Z'.-]+(?:\s+[A-Z][a-zA-Z'.-]+){1,3}$/.test(line);
      }) ||
      lines.find((line) => !line.includes("@") && !/\d{3}/.test(line) && line.length <= 60 && !blacklist.test(line)) ||
      ""
    );
  }

  function guessQuoteFromText(text, mobileLines) {
    const lower = text.toLowerCase();
    const quote = {};

    if (/\bfreedom\b/.test(lower)) quote.mobilePlan = "freedom";
    else if (/\bpreferred\b/.test(lower)) quote.mobilePlan = "preferred";
    else if (/\bbasic\b/.test(lower)) quote.mobilePlan = "basic";
    else if (/super\s*saver|5gb\s*plan/.test(lower)) quote.mobilePlan = "super-saver-5gb";
    else if (/senior|1gb\s*plan/.test(lower)) quote.mobilePlan = "senior-1gb";
    else if (/mobile|phone|new line|number of lines/.test(lower)) quote.mobilePlan = "basic";

    if (mobileLines) quote.mobileLines = clampNumber(mobileLines, 1, 5, 1);

    if (/3\s* gig|3gig|3000\s*mbps/.test(lower)) quote.internetSpeed = "3gig";
    else if (/2\s* gig|2gig|2000\s*mbps/.test(lower)) quote.internetSpeed = "2gig";
    else if (/1\s* gig|1gig|gigabit|1000\s*mbps/.test(lower)) quote.internetSpeed = "1gig";
    else if (/500\s*mbps/.test(lower)) quote.internetSpeed = "500";
    else if (/250\s*mbps/.test(lower)) quote.internetSpeed = "250";
    else if (/internet|fiber/.test(lower)) quote.internetSpeed = "1gig";

    return Object.keys(quote).length ? quote : null;
  }

  function cleanLeadLines(text) {
    return normalizeOcrText(text)
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  function normalizeOcrText(text) {
    return String(text || "")
      .replace(/[|]+/g, " ")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .trim();
  }

  function looksLikeLabelOnly(line) {
    return /^(name|phone|email|address|source|status|date|type|comments?|notes?|budget|provider)$/i.test(line.trim());
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  async function preprocessImage(file) {
    const image = await loadImageElement(file);
    const maxWidth = 2200;
    const scale = Math.min(1, maxWidth / image.naturalWidth);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let index = 0; index < data.length; index += 4) {
      const gray = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
      const boosted = gray > 160 ? Math.min(255, gray + 35) : Math.max(0, gray - 25);
      data[index] = boosted;
      data[index + 1] = boosted;
      data[index + 2] = boosted;
    }
    context.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob || file), "image/png", 0.95);
    });
  }

  function loadImageElement(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not load image"));
      };
      image.src = url;
    });
  }

  function updateOcrProgress(message) {
    if (!message || !message.status) return;
    if (typeof message.progress === "number" && message.progress > 0) {
      updateOcrStatus(`${message.status} ${Math.round(message.progress * 100)}%`);
      return;
    }
    updateOcrStatus(message.status);
  }

  function updateOcrStatus(message) {
    el.ocrStatus.textContent = message;
  }

  function resetOcrPreview() {
    el.ocrPreview.removeAttribute("src");
    el.ocrPreview.hidden = true;
    updateOcrStatus("Photo OCR ready");
  }

  function getOcrEngine() {
    if (typeof window !== "undefined" && window.Tesseract) return window.Tesseract;
    if (typeof globalThis !== "undefined" && globalThis.Tesseract) return globalThis.Tesseract;
    if (typeof self !== "undefined" && self.Tesseract) return self.Tesseract;
    return null;
  }

  function leadUrgencyScore(lead, now) {
    let score = 0;
    if (lead.priority === "hot") score += 50;
    if (lead.priority === "warm") score += 20;
    if (isDue(lead, now)) score += 45;
    if (isAppointmentToday(lead, now)) score += 35;
    if (isAppointmentSoon(lead, now)) score += 25;
    if (!lead.lastTouchAt) score += 20;
    if (lead.nextStep === "appointment") score += 15;
    if (lead.nextStep === "check-availability") score += 10;
    if (lead.status === "new") score += 10;
    if (lead.appointmentStatus === "missed" || lead.appointmentStatus === "reschedule") score += 25;
    return score;
  }

  function sourceBreakdown() {
    const counts = new Map();
    state.leads.forEach((lead) => {
      const source = lead.source ? lead.source.trim() : "Unknown";
      counts.set(source, (counts.get(source) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }

  function isDue(lead, now) {
    if (!lead.followUpAt || ["won", "lost"].includes(lead.status)) return false;
    return new Date(lead.followUpAt).getTime() <= now.getTime();
  }

  function hasOpenAppointment(lead, now) {
    if (!lead.appointmentAt || ["won", "lost"].includes(lead.status)) return false;
    const appointmentTime = new Date(lead.appointmentAt).getTime();
    return appointmentTime >= startOfDay(now).getTime();
  }

  function isAppointmentToday(lead, now) {
    return Boolean(lead.appointmentAt && !["won", "lost"].includes(lead.status) && isSameDay(lead.appointmentAt, now));
  }

  function isAppointmentSoon(lead, now) {
    if (!lead.appointmentAt || ["won", "lost"].includes(lead.status)) return false;
    const appointmentTime = new Date(lead.appointmentAt).getTime();
    const nowTime = now.getTime();
    return appointmentTime >= nowTime && appointmentTime <= nowTime + 60 * 60 * 1000;
  }

  function isSameDay(value, date) {
    if (!value) return false;
    const compare = new Date(value);
    return compare.getFullYear() === date.getFullYear() && compare.getMonth() === date.getMonth() && compare.getDate() === date.getDate();
  }

  function isTomorrow(value, now) {
    if (!value) return false;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDay(value, tomorrow);
  }

  function isWithinDays(value, now, days) {
    if (!value) return false;
    const time = new Date(value).getTime();
    return time >= now.getTime() - days * 24 * 60 * 60 * 1000 && time <= now.getTime();
  }

  function dateValue(value) {
    return value ? new Date(value).getTime() : 0;
  }

  function dateForPreset(preset) {
    if (preset === "30m") return minutesFromNow(30);
    if (preset === "2h") return hoursFromNow(2);
    if (preset === "tomorrow") return tomorrowMorning();
    if (preset === "3d") return daysFromNow(3);
    if (preset === "7d") return daysFromNow(7);
    return hoursFromNow(2);
  }

  function appointmentDateForPreset(preset) {
    const date = new Date();
    if (preset === "tomorrow9" || preset === "tomorrow5") date.setDate(date.getDate() + 1);
    if (preset === "today5" || preset === "tomorrow5") date.setHours(17, 0, 0, 0);
    else date.setHours(9, 0, 0, 0);
    return date;
  }

  function beforeDate(value, minutes) {
    const date = new Date(value);
    date.setMinutes(date.getMinutes() - minutes);
    return date;
  }

  function startOfDay(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function minutesFromNow(minutes) {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  }

  function hoursFromNow(hours) {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date;
  }

  function daysFromNow(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  function tomorrowMorning() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
    return date;
  }

  function tomorrowMarketingTime() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(10, 0, 0, 0);
    return date;
  }

  function toLocalDatetimeValue(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatDateTime(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function formatMoney(value) {
    const fixed = Number(value || 0).toFixed(2);
    return fixed.endsWith(".00") ? `$${fixed.slice(0, -3)}` : `$${fixed}`;
  }

  function dateStamp() {
    return new Date().toISOString().slice(0, 10);
  }

  function currentMonthKey() {
    return monthKeyFromDate(new Date());
  }

  function monthKeyFromDate(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        data = { message: text };
      }
    }
    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed: ${response.status}`);
    }
    return data;
  }

  function icsDate(date) {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }

  function icsText(value) {
    return String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");
  }

  function slugifyFile(value) {
    return String(value || "lead")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => toast("Copied."));
      return;
    }
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    toast("Copied.");
  }

  function csvCell(value) {
    return `"${String(value || "").replace(/"/g, '""')}"`;
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, Math.round(number)));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function newId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function toast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.toast.classList.remove("show"), 2600);
  }
})();
