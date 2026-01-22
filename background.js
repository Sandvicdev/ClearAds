chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: true,
    blockedCount: 0,
    perSite: {}
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  // 🔔 Content script'ten reklam bildirimi
  if (msg.type === "adsFound" && sender.tab?.url) {
    let domain = "unknown";

    try {
      const url = new URL(sender.tab.url);
      domain = url.hostname.replace(/^www\./, "");
    } catch (e) {}

    chrome.storage.local.get(["blockedCount", "perSite"], data => {
      const total = (data.blockedCount || 0) + (msg.count || 1);
      const perSite = data.perSite || {};

      perSite[domain] = (perSite[domain] || 0) + (msg.count || 1);

      chrome.storage.local.set({
        blockedCount: total,
        perSite
      });
    });
  }

  // 📊 Popup durum sorgusu
  if (msg.type === "getStatus") {
    chrome.storage.local.get(
      ["enabled", "blockedCount", "perSite"],
      data => sendResponse({
        enabled: data.enabled ?? true,
        blockedCount: data.blockedCount ?? 0,
        perSite: data.perSite ?? {}
      })
    );
    return true; // async response
  }

  // 🔘 Aç / Kapat
  if (msg.type === "toggle") {
    chrome.storage.local.set({ enabled: msg.enabled });
  }
});
