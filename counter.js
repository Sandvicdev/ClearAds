let blocked = 0;

const selectors = [
  "iframe[src*='ads']",
  "iframe[src*='doubleclick']",
  "iframe[src*='googlesyndication']",
  "[id^='ad-']",
  "[class^='ad-']",
  "[class*=' ads']",
  "[class*='advert']",
  "[aria-label*='advertisement']"
];

function removeAds() {
  let found = 0;

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (el.dataset.clearads) return;

      el.dataset.clearads = "1";
      found++;

      el.style.display = "none";
      el.style.height = "0";
      el.style.margin = "0";
      el.style.padding = "0";
    });
  });

  if (found > 0) {
    blocked += found;

    // 🔒 GÜVENLİ GÖNDERİM
    if (typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.sendMessage) {

      chrome.runtime.sendMessage({
        type: "adsFound",
        count: found
      });
    }
  }
}

// İlk çalıştırma
removeAds();

// Dinamik reklamlar
const observer = new MutationObserver(() => {
  removeAds();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
