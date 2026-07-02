/*
  LavaggioMaterassi cookie notice banner
  File path: /assets/js/cookie-consent.js

  Purpose:
  - Show a lightweight informational cookie/tracking notice.
  - Do not block GA4 or Google Ads tracking.
  - Do not set analytics/ad consent to denied.
  - Remove old restrictive consent storage keys if present.
*/

(function () {
  "use strict";

  var OLD_STORAGE_KEYS = [
    "lavaggiomaterassi_cookie_consent_v1",
    "lavaggiodivani_cookie_consent_v1"
  ];

  var NOTICE_STORAGE_KEY = "lavaggiomaterassi_cookie_notice_seen_v1";

  OLD_STORAGE_KEYS.forEach(function (key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {}
  });

  function injectStyles() {
    if (document.getElementById("lm-cookie-notice-styles")) return;

    var style = document.createElement("style");
    style.id = "lm-cookie-notice-styles";
    style.textContent = [
      ".lm-cookie-notice{position:fixed;left:16px;right:16px;bottom:16px;z-index:120;max-width:920px;margin:0 auto;padding:16px 18px;border-radius:18px;background:#0E282E;color:#fff;box-shadow:0 18px 50px rgba(18,52,59,.28);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif}",
      ".lm-cookie-notice__inner{display:flex;gap:14px;align-items:center;justify-content:space-between}",
      ".lm-cookie-notice p{margin:0;font-size:14px;line-height:1.45;color:rgba(255,255,255,.9)}",
      ".lm-cookie-notice strong{color:#fff}",
      ".lm-cookie-notice button{appearance:none;border:0;border-radius:999px;background:#fff;color:#0E282E;font-weight:800;padding:11px 18px;cursor:pointer;white-space:nowrap}",
      "@media(max-width:680px){.lm-cookie-notice__inner{display:block}.lm-cookie-notice button{margin-top:12px;width:100%}}"
    ].join("");
    document.head.appendChild(style);
  }

  function hasSeenNotice() {
    try {
      return localStorage.getItem(NOTICE_STORAGE_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function markNoticeSeen() {
    try {
      localStorage.setItem(NOTICE_STORAGE_KEY, "1");
    } catch (error) {}
  }

  function buildNotice() {
    var wrapper = document.createElement("div");
    wrapper.className = "lm-cookie-notice";
    wrapper.setAttribute("role", "status");
    wrapper.setAttribute("aria-live", "polite");

    wrapper.innerHTML =
      '<div class="lm-cookie-notice__inner">' +
        '<p><strong>Informativa cookie.</strong> Usiamo cookie e strumenti di misurazione per analizzare visite, richieste WhatsApp, chiamate e migliorare il servizio.</p>' +
        '<button type="button">Ho capito</button>' +
      '</div>';

    var button = wrapper.querySelector("button");
    button.addEventListener("click", function () {
      markNoticeSeen();
      wrapper.remove();
    });

    return wrapper;
  }

  function init() {
    if (hasSeenNotice()) return;
    injectStyles();
    document.body.appendChild(buildNotice());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
