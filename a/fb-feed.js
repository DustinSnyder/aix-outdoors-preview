/* AIX Outdoors — Facebook on landing page.
   Meta's Page Plugin is unreliable (login walls / blank iframes), so we show
   a native "Recent posts" panel that always works, plus a Follow CTA. */
(function () {
  var PAGE_URL = "https://www.facebook.com/people/AIX-Outdoors-LLC/61593250985679/";
  var SHARE_URL = "https://www.facebook.com/share/1PLyJxJ2rQ/";
  var STORAGE_KEY = "aix-a-mobile-feed";

  // Curated mirrors of public Page posts — update when new FB posts go up.
  var POSTS = [
    {
      title: "Forestry mulching & brush clearing",
      body: "Invasive brush and timber-edge thickets mulched in place so you can walk, plant, or maintain again.",
      img: "media/mulching/forestry-mulching-02.jpg",
      alt: "Track loader mulching brush along a field edge",
      href: SHARE_URL
    },
    {
      title: "Driveway transformation — still mowing your driveway?",
      body: "Ruts, potholes, and grass through the rock. We grade and resurface your lane so it drives smooth.",
      img: "media/gravel/gravel-01.jpg",
      alt: "Skid steer grading a long gravel farm driveway",
      href: SHARE_URL
    }
  ];

  function postCards() {
    return POSTS.map(function (p) {
      return (
        '<a class="fb-native-post" href="' + p.href + '" target="_blank" rel="noopener noreferrer">' +
          '<img class="fb-native-img" src="' + p.img + '" alt="' + p.alt + '" loading="lazy" width="640" height="360">' +
          '<div class="fb-native-body">' +
            '<p class="fb-native-from">AIX Outdoors LLC · Facebook</p>' +
            "<h3>" + p.title + "</h3>" +
            "<p>" + p.body + "</p>" +
            '<span class="fb-native-open">View on Facebook →</span>' +
          "</div>" +
        "</a>"
      );
    }).join("");
  }

  function pluginMarkup() {
    return (
      '<div class="fb-live-wrap">' +
        '<div class="fb-promo">' +
          '<div class="fb-promo-top">' +
            '<img class="fb-promo-mark" src="img/brand/logo-circle-dark.jpg" width="56" height="56" alt="AIX Outdoors">' +
            "<div>" +
              '<p class="fb-promo-kicker">Latest on Facebook</p>' +
              '<p class="fb-promo-name">AIX Outdoors LLC</p>' +
              '<p class="fb-promo-meta">Land Clearing • Hauling • Grading · Burlington, IA</p>' +
            "</div>" +
          "</div>" +
          '<p class="fb-promo-copy">Job photos and updates from the field — same posts as the Facebook Page, shown here so you do not need a Facebook login.</p>' +
          '<a class="btn fb-promo-btn" href="' + SHARE_URL + '" target="_blank" rel="noopener noreferrer">Open / Follow on Facebook</a>' +
        "</div>" +
        '<div class="fb-native-feed" aria-label="Recent Facebook posts">' +
          '<p class="fb-embed-label">Recent posts</p>' +
          postCards() +
        "</div>" +
      "</div>"
    );
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
      if (!el.innerHTML.trim()) el.innerHTML = pluginMarkup();
    });
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
