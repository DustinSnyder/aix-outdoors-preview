/* AIX Outdoors — Facebook on landing page (live timeline + follow CTA). */
(function () {
  var PAGE_URL = "https://www.facebook.com/people/AIX-Outdoors-LLC/61593250985679/";
  var SHARE_URL = "https://www.facebook.com/share/1PLyJxJ2rQ/";
  var STORAGE_KEY = "aix-a-mobile-feed";

  function promoCard() {
    return (
      '<div class="fb-promo">' +
        '<div class="fb-promo-top">' +
          '<img class="fb-promo-mark" src="img/brand/logo-circle-dark.jpg" width="56" height="56" alt="AIX Outdoors">' +
          "<div>" +
            '<p class="fb-promo-kicker">Latest on Facebook</p>' +
            '<p class="fb-promo-name">AIX Outdoors LLC</p>' +
            '<p class="fb-promo-meta">Land Clearing • Hauling • Grading · Burlington, IA</p>' +
          "</div>" +
        "</div>" +
        '<p class="fb-promo-copy">Job photos and updates from the field. Follow the Page, or scroll the live feed below.</p>' +
        '<a class="btn fb-promo-btn" href="' + SHARE_URL + '" target="_blank" rel="noopener noreferrer">Open / Follow on Facebook</a>' +
      "</div>"
    );
  }

  function pluginMarkup(width, height) {
    width = width || 340;
    height = height || 620;
    // Timeline visible by default so visitors see real posts without an extra click.
    return (
      '<div class="fb-live-wrap">' +
        promoCard() +
        '<div class="fb-embed-panel" aria-label="Facebook Page timeline">' +
          '<p class="fb-embed-label">Recent posts</p>' +
          '<div class="fb-page" data-href="' + PAGE_URL + '" data-tabs="timeline" data-width="' + width + '" data-height="' + height + '" data-small-header="true" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="false">' +
            '<blockquote cite="' + PAGE_URL + '" class="fb-xfbml-parse-ignore">' +
              '<a href="' + SHARE_URL + '">AIX Outdoors LLC on Facebook</a>' +
            "</blockquote>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function loadSdk(cb) {
    if (window.FB) {
      cb();
      return;
    }
    if (document.getElementById("facebook-jssdk")) {
      var tries = 0;
      var t = setInterval(function () {
        tries += 1;
        if (window.FB || tries > 40) {
          clearInterval(t);
          if (window.FB) cb();
        }
      }, 100);
      return;
    }
    if (!document.getElementById("fb-root")) {
      var root = document.createElement("div");
      root.id = "fb-root";
      document.body.insertBefore(root, document.body.firstChild);
    }
    window.fbAsyncInit = function () {
      window.FB.init({ xfbml: true, version: "v21.0" });
      cb();
    };
    var js = document.createElement("script");
    js.id = "facebook-jssdk";
    js.async = true;
    js.defer = true;
    js.crossOrigin = "anonymous";
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    document.head.appendChild(js);
  }

  function parseXfbml() {
    loadSdk(function () {
      try {
        if (window.FB && window.FB.XFBML) window.FB.XFBML.parse();
      } catch (e) {}
    });
  }

  function getMode() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "hero" || stored === "sheet") return stored;
    } catch (e) {}
    return "hero";
  }

  function setMode(mode) {
    if (mode !== "hero" && mode !== "sheet") mode = "hero";
    document.body.setAttribute("data-mobile-feed", mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {}
    syncToggle(mode);
    if (mode !== "sheet") closeSheet();
    parseXfbml();
  }

  function syncToggle(mode) {
    document.querySelectorAll("[data-feed-mode]").forEach(function (a) {
      a.classList.toggle("on", a.getAttribute("data-feed-mode") === mode);
    });
  }

  function enhanceBanner() {
    var banner = document.querySelector(".sample-banner");
    if (!banner || banner.querySelector(".feed-toggle")) return;
    var sw = banner.querySelector(".ab-switch");
    var tools = document.createElement("div");
    tools.className = "sample-banner-tools";
    var toggle = document.createElement("nav");
    toggle.className = "feed-toggle";
    toggle.setAttribute("aria-label", "Mobile Facebook feed placement");
    toggle.innerHTML =
      '<span class="feed-toggle-label">Mobile feed:</span> ' +
      '<a href="#fb-feed-hero" data-feed-mode="hero">After hero</a>' +
      '<span class="feed-toggle-sep"> | </span>' +
      '<a href="#fb-feed-sheet" data-feed-mode="sheet">Bottom sheet</a>' +
      '<span class="feed-toggle-desk">desktop uses right rail</span>';
    if (sw) {
      sw.parentNode.insertBefore(tools, sw);
      tools.appendChild(toggle);
      tools.appendChild(sw);
    } else {
      banner.appendChild(tools);
      tools.appendChild(toggle);
    }
    toggle.addEventListener("click", function (e) {
      var a = e.target.closest("[data-feed-mode]");
      if (!a) return;
      e.preventDefault();
      setMode(a.getAttribute("data-feed-mode"));
    });
  }

  function fillMounts() {
    document.querySelectorAll(".fb-rail, .fb-after-hero, .fb-sheet-body").forEach(function (el) {
      if (!el.innerHTML.trim()) {
        var isRail = el.classList.contains("fb-rail");
        var w = isRail ? 340 : Math.min(500, Math.max(280, el.clientWidth || 340));
        var h = isRail ? 680 : 560;
        el.innerHTML = pluginMarkup(w, h);
      }
    });
    parseXfbml();
  }

  function closeSheet() {
    var sheet = document.getElementById("fb-sheet");
    var chip = document.getElementById("fb-chip");
    if (sheet) {
      sheet.hidden = true;
      sheet.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("fb-sheet-open");
    if (chip) chip.setAttribute("aria-expanded", "false");
  }

  function openSheet() {
    var sheet = document.getElementById("fb-sheet");
    var chip = document.getElementById("fb-chip");
    if (!sheet) return;
    sheet.hidden = false;
    sheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("fb-sheet-open");
    if (chip) chip.setAttribute("aria-expanded", "true");
    var closeBtn = sheet.querySelector(".fb-sheet-close");
    if (closeBtn) closeBtn.focus();
    parseXfbml();
  }

  function ensureSheet() {
    if (document.getElementById("fb-sheet")) return;
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<button type="button" class="fb-chip" id="fb-chip" aria-controls="fb-sheet" aria-expanded="false">' +
        '<span class="fb-chip-dot" aria-hidden="true"></span> Facebook' +
      "</button>" +
      '<div class="fb-sheet" id="fb-sheet" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="fb-sheet-title">' +
        '<div class="fb-sheet-backdrop" data-fb-close></div>' +
        '<div class="fb-sheet-panel">' +
          '<header class="fb-sheet-hd">' +
            '<h2 id="fb-sheet-title">AIX on Facebook</h2>' +
            '<button type="button" class="fb-sheet-close" data-fb-close>Close</button>' +
          "</header>" +
          '<div class="fb-sheet-body"></div>' +
        "</div>" +
      "</div>";
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

    document.getElementById("fb-chip").addEventListener("click", openSheet);
    document.getElementById("fb-sheet").addEventListener("click", function (e) {
      if (e.target.hasAttribute("data-fb-close") || e.target.closest("[data-fb-close]")) closeSheet();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSheet();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "sheet") {
        localStorage.setItem(STORAGE_KEY, "hero");
      }
    } catch (e) {}
    enhanceBanner();
    ensureSheet();
    fillMounts();
    setMode(getMode());
  });
})();
