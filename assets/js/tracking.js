/*
  LavaggioMaterassi central tracking loader
  File path: /assets/js/tracking.js

  Purpose:
  - Load tracking IDs from /data/tracking.config.json.
  - Keep tracking centralized so pages do not need manual edits.
  - Default to privacy-safe behavior: no external tracking loads while trackingEnabled is false.
  - Support Google Consent Mode defaults before loading Google scripts.

  Operational rule:
  - Add this file once to every approved template/page:
    <script src="/assets/js/tracking.js" defer></script>
*/

(function () {
  "use strict";

  var CONFIG_PATH = "/data/tracking.config.json";
  var state = {
    config: null,
    loaded: {
      gtm: false,
      gtag: false,
      meta: false
    }
  };

  function log() {
    if (!state.config || !state.config.debug) return;
    try {
      console.log.apply(console, ["[LavaggioMaterassi tracking]"].concat(Array.prototype.slice.call(arguments)));
    } catch (error) {}
  }

  function warn() {
    if (!state.config || !state.config.debug) return;
    try {
      console.warn.apply(console, ["[LavaggioMaterassi tracking]"].concat(Array.prototype.slice.call(arguments)));
    } catch (error) {}
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function injectScript(src, attrs) {
    var script = document.createElement("script");
    script.async = true;
    script.src = src;

    if (attrs && typeof attrs === "object") {
      Object.keys(attrs).forEach(function (key) {
        script.setAttribute(key, attrs[key]);
      });
    }

    var firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }

  function setupDataLayerAndConsent(config) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    if (!config.consent || !config.consent.consentModeEnabled) {
      return;
    }

    var defaultState = config.consent.defaultState || {};
    var consentPayload = {
      ad_storage: defaultState.ad_storage || "denied",
      ad_user_data: defaultState.ad_user_data || "denied",
      ad_personalization: defaultState.ad_personalization || "denied",
      analytics_storage: defaultState.analytics_storage || "denied",
      functionality_storage: defaultState.functionality_storage || "granted",
      security_storage: defaultState.security_storage || "granted"
    };

    if (typeof config.consent.waitForUpdateMilliseconds === "number") {
      consentPayload.wait_for_update = config.consent.waitForUpdateMilliseconds;
    }

    if (Array.isArray(config.consent.region) && config.consent.region.length > 0) {
      consentPayload.region = config.consent.region;
    }

    window.gtag("consent", "default", consentPayload);
    log("Consent default applied", consentPayload);
  }

  function loadGoogleTagManager(config) {
    var gtm = config.googleTagManager || {};
    if (!gtm.enabled || !isNonEmptyString(gtm.containerId)) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js"
    });

    injectScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(gtm.containerId.trim()));
    state.loaded.gtm = true;
    log("GTM loaded", gtm.containerId);
  }

  function loadGoogleTag(config) {
    var ga4 = config.googleAnalytics4 || {};
    var ads = config.googleAds || {};

    var ga4Enabled = ga4.enabled && isNonEmptyString(ga4.measurementId);
    var adsEnabled = ads.enabled && isNonEmptyString(ads.conversionId);

    if (!ga4Enabled && !adsEnabled) {
      return;
    }

    var primaryId = ga4Enabled ? ga4.measurementId.trim() : ads.conversionId.trim();

    injectScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(primaryId));
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());

    if (ga4Enabled) {
      window.gtag("config", ga4.measurementId.trim(), {
        send_page_view: true
      });
      log("GA4 loaded", ga4.measurementId);
    }

    if (adsEnabled) {
      window.gtag("config", ads.conversionId.trim());
      log("Google Ads tag loaded", ads.conversionId);
    }

    state.loaded.gtag = true;
  }

  function loadMetaPixel(config) {
    var meta = config.metaPixel || {};
    if (!meta.enabled || !isNonEmptyString(meta.pixelId)) {
      return;
    }

    if (window.fbq) {
      return;
    }

    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", meta.pixelId.trim());
    window.fbq("track", "PageView");
    state.loaded.meta = true;
    log("Meta Pixel loaded", meta.pixelId);
  }

  function pushEvent(eventName, params) {
    params = params || {};

    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(Object.assign({ event: eventName }, params));
    }

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }

    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", eventName, params);
    }

    log("Event pushed", eventName, params);
  }

  function setupClickTracking(config) {
    var events = config.events || {};
    if (!events.trackPhoneClicks && !events.trackWhatsappClicks && !events.trackEmailClicks) {
      return;
    }

    document.addEventListener("click", function (event) {
      var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
      if (!link) return;

      var href = link.getAttribute("href") || "";
      var text = (link.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120);

      if (events.trackPhoneClicks && href.indexOf("tel:") === 0) {
        pushEvent(events.phoneEventName || "phone_click", {
          link_url: href,
          link_text: text
        });
      }

      if (events.trackWhatsappClicks && (href.indexOf("https://wa.me/") === 0 || href.indexOf("https://api.whatsapp.com/") === 0)) {
        pushEvent(events.whatsappEventName || "whatsapp_click", {
          link_url: href,
          link_text: text
        });
      }

      if (events.trackEmailClicks && href.indexOf("mailto:") === 0) {
        pushEvent(events.emailEventName || "email_click", {
          link_url: href,
          link_text: text
        });
      }
    });
  }

  function exposeConsentHelpers() {
    window.LavaggioMaterassiTracking = window.LavaggioMaterassiTracking || {};

    window.LavaggioMaterassiTracking.updateConsent = function (consentUpdate) {
      if (typeof window.gtag !== "function") {
        warn("gtag not available; consent update skipped");
        return;
      }

      window.gtag("consent", "update", consentUpdate || {});
      log("Consent updated", consentUpdate);
    };

    window.LavaggioMaterassiTracking.grantAnalyticsOnly = function () {
      window.LavaggioMaterassiTracking.updateConsent({
        analytics_storage: "granted"
      });
    };

    window.LavaggioMaterassiTracking.grantAllConsent = function () {
      window.LavaggioMaterassiTracking.updateConsent({
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted"
      });
    };

    window.LavaggioMaterassiTracking.denyAllConsent = function () {
      window.LavaggioMaterassiTracking.updateConsent({
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied"
      });
    };

    window.LavaggioMaterassiTracking.pushEvent = pushEvent;
  }

  function init(config) {
    state.config = config || {};
    exposeConsentHelpers();

    if (!state.config.trackingEnabled) {
      log("Tracking disabled by config");
      return;
    }

    setupDataLayerAndConsent(state.config);

    var hasGtm = state.config.googleTagManager &&
      state.config.googleTagManager.enabled &&
      isNonEmptyString(state.config.googleTagManager.containerId);

    if (hasGtm) {
      loadGoogleTagManager(state.config);
    } else {
      loadGoogleTag(state.config);
      loadMetaPixel(state.config);
    }

    setupClickTracking(state.config);
  }

  function loadConfig() {
    fetch(CONFIG_PATH, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Unable to load " + CONFIG_PATH + " (" + response.status + ")");
        }
        return response.json();
      })
      .then(init)
      .catch(function (error) {
        state.config = { debug: false };
        try {
          console.warn("[LavaggioMaterassi tracking] Tracking config not loaded:", error.message);
        } catch (ignore) {}
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadConfig);
  } else {
    loadConfig();
  }
})();
