/*
  LavaggioMaterassi cookie consent banner
  File path: /assets/js/cookie-consent.js

  Purpose:
  - Show a lightweight cookie consent banner.
  - Keep analytics and marketing denied by default.
  - Update Google Consent Mode through /assets/js/tracking.js helpers when available.
  - Avoid editing every HTML page when tracking IDs change.

  This file injects its own minimal styles to avoid touching cleaning-landing.css.
*/

(function () {
  "use strict";

  var STORAGE_KEY = "lavaggiomaterassi_cookie_consent_v1";

  function safeParse(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  function getSavedConsent() {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  }

  function saveConsent(consent) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      analytics: !!consent.analytics,
      marketing: !!consent.marketing,
      updatedAt: new Date().toISOString()
    }));
  }

  function buildGoogleConsent(consent) {
    return {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied"
    };
  }

  function applyConsent(consent) {
    saveConsent(consent);

    if (
      window.LavaggioMaterassiTracking &&
      typeof window.LavaggioMaterassiTracking.updateConsent === "function"
    ) {
      window.LavaggioMaterassiTracking.updateConsent(buildGoogleConsent(consent));
    }

    window.dispatchEvent(new CustomEvent("lavaggiomaterassi:cookie-consent-updated", {
      detail: {
        analytics: !!consent.analytics,
        marketing: !!consent.marketing
      }
    }));
  }

  function injectStyles() {
    if (document.getElementById("lm-cookie-consent-styles")) return;

    var style = document.createElement("style");
    style.id = "lm-cookie-consent-styles";
    style.textContent = [
      ".ld-cookie-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:120;max-width:960px;margin:0 auto;padding:18px;border:1px solid rgba(255,255,255,.18);border-radius:20px;background:#0E282E;color:#fff;box-shadow:0 18px 50px rgba(18,52,59,.28);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif}",
      ".ld-cookie-consent[hidden]{display:none}",
      ".ld-cookie-consent__grid{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center}",
      ".ld-cookie-consent h2{margin:0 0 6px;color:#fff;font-size:1.02rem;line-height:1.2;letter-spacing:-.02em}",
      ".ld-cookie-consent p{margin:0;color:rgba(255,255,255,.78);font-size:.92rem;line-height:1.45}",
      ".ld-cookie-consent a{color:#F4B942;text-decoration:none;font-weight:800}",
      ".ld-cookie-consent__actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end}",
      ".ld-cookie-consent button{min-height:42px;padding:0 15px;border:0;border-radius:999px;font-weight:850;cursor:pointer;font-family:inherit}",
      ".ld-cookie-consent__accept{background:#F4B942;color:#172124}",
      ".ld-cookie-consent__reject{background:#fff;color:#12343B}",
      ".ld-cookie-consent__prefs{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.28)!important}",
      ".ld-cookie-consent__panel{display:none;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.16)}",
      ".ld-cookie-consent.is-open .ld-cookie-consent__panel{display:block}",
      ".ld-cookie-consent__options{display:grid;gap:10px;margin:12px 0}",
      ".ld-cookie-consent__option{display:flex;gap:10px;align-items:flex-start;color:rgba(255,255,255,.86);font-size:.92rem}",
      ".ld-cookie-consent__option input{margin-top:4px}",
      ".ld-cookie-consent__save{background:#1FA6A0;color:#fff}",
      "@media(max-width:760px){.ld-cookie-consent{left:12px;right:12px;bottom:78px;padding:16px}.ld-cookie-consent__grid{grid-template-columns:1fr}.ld-cookie-consent__actions{justify-content:flex-start}.ld-cookie-consent button{flex:1 1 auto}}"
    ].join("");

    document.head.appendChild(style);
  }

  function createBanner() {
    var banner = document.createElement("section");
    banner.className = "ld-cookie-consent";
    banner.setAttribute("aria-label", "Preferenze cookie");
    banner.innerHTML = [
      '<div class="ld-cookie-consent__grid">',
        '<div>',
          '<h2>Cookie e misurazione</h2>',
          '<p>Usiamo cookie tecnici necessari. Con il tuo consenso potremo usare strumenti di misurazione e marketing per migliorare il sito e le campagne. Puoi rifiutare senza perdere l’accesso al sito. <a href="/pages/legal/cookie-policy.html">Leggi la Cookie Policy</a>.</p>',
        '</div>',
        '<div class="ld-cookie-consent__actions">',
          '<button class="ld-cookie-consent__reject" type="button" data-ld-cookie-action="reject">Rifiuta</button>',
          '<button class="ld-cookie-consent__prefs" type="button" data-ld-cookie-action="prefs">Preferenze</button>',
          '<button class="ld-cookie-consent__accept" type="button" data-ld-cookie-action="accept">Accetta</button>',
        '</div>',
      '</div>',
      '<div class="ld-cookie-consent__panel">',
        '<div class="ld-cookie-consent__options">',
          '<label class="ld-cookie-consent__option"><input type="checkbox" checked disabled> <span><strong>Cookie tecnici</strong><br>Necessari per navigazione, sicurezza e funzionamento del sito.</span></label>',
          '<label class="ld-cookie-consent__option"><input type="checkbox" data-ld-cookie-analytics> <span><strong>Analytics</strong><br>Misurazione anonima o aggregata delle visite e delle interazioni.</span></label>',
          '<label class="ld-cookie-consent__option"><input type="checkbox" data-ld-cookie-marketing> <span><strong>Marketing</strong><br>Google Ads, Meta Pixel, remarketing e misurazione campagne, se configurati.</span></label>',
        '</div>',
        '<div class="ld-cookie-consent__actions">',
          '<button class="ld-cookie-consent__save" type="button" data-ld-cookie-action="save">Salva preferenze</button>',
        '</div>',
      '</div>'
    ].join("");

    document.body.appendChild(banner);
    return banner;
  }

  function hideBanner(banner) {
    banner.setAttribute("hidden", "hidden");
  }

  function init() {
    var saved = getSavedConsent();

    if (saved) {
      applyConsent(saved);
      return;
    }

    injectStyles();

    var banner = createBanner();
    var analyticsInput = banner.querySelector("[data-ld-cookie-analytics]");
    var marketingInput = banner.querySelector("[data-ld-cookie-marketing]");

    banner.addEventListener("click", function (event) {
      var button = event.target.closest("[data-ld-cookie-action]");
      if (!button) return;

      var action = button.getAttribute("data-ld-cookie-action");

      if (action === "accept") {
        applyConsent({ analytics: true, marketing: true });
        hideBanner(banner);
      }

      if (action === "reject") {
        applyConsent({ analytics: false, marketing: false });
        hideBanner(banner);
      }

      if (action === "prefs") {
        banner.classList.toggle("is-open");
      }

      if (action === "save") {
        applyConsent({
          analytics: analyticsInput ? analyticsInput.checked : false,
          marketing: marketingInput ? marketingInput.checked : false
        });
        hideBanner(banner);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
