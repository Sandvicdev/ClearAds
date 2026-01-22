document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  // HTML'de var olan elementler
  const toggle = $("toggle");
  const statusText = $("status");
  const currentDomainEl = $("current-domain");
  const siteCountEl = $("site-count");
  const totalCountEl = $("total-count");

  // Güvenli varsayılan veri
  let data = {
    enabled: true,
    totalBlocked: 0,
    perSite: {}
  };

  // Storage'dan yükle
  chrome.storage.local.get(
    ["enabled", "blockedCount", "perSite"],
    res => {
      data.enabled = res.enabled ?? true;
      data.totalBlocked = res.blockedCount ?? 0;
      data.perSite = res.perSite ?? {};

      toggle.checked = data.enabled;
      statusText.textContent = data.enabled ? "Aktif" : "Pasif";
      totalCountEl.textContent = data.totalBlocked;
    }
  );

  // Aktif sekmenin domain'ini al
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]?.url) {
      currentDomainEl.textContent = "Bilinmeyen";
      siteCountEl.textContent = "0";
      return;
    }

    const url = tabs[0].url;

    if (
      url.startsWith("chrome://") ||
      url.startsWith("edge://") ||
      url.startsWith("about:")
    ) {
      currentDomainEl.textContent = "Desteklenmeyen";
      siteCountEl.textContent = "0";
      return;
    }

    try {
      const domain = new URL(url).hostname.replace(/^www\./, "");
      currentDomainEl.textContent = domain;
      siteCountEl.textContent = data.perSite[domain] || 0;
    } catch {
      currentDomainEl.textContent = "Bilinmeyen";
      siteCountEl.textContent = "0";
    }
  });

  // Aç / Kapat
  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    statusText.textContent = enabled ? "Aktif" : "Pasif";

    chrome.storage.local.set({ enabled });

    chrome.runtime.sendMessage({
      type: "toggle",
      enabled
    });
  });

  // Background'dan gelen güncelleme
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type !== "adsFound") return;

    totalCountEl.textContent = msg.total || 0;

    const domain = currentDomainEl.textContent;
    if (msg.domain === domain) {
      siteCountEl.textContent = msg.site || 0;
    }
  });
});
