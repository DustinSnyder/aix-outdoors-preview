/* AIX Outdoors — Facebook Follow card on landing page. */
(function () {
  var SHARE_URL = "https://www.facebook.com/share/1PLyJxJ2rQ/";
  var STORAGE_KEY = "aix-a-mobile-feed";

  function pluginMarkup() {
    return (
      '<div class="fb-live-wrap">' +
        '<div class="fb-promo">' +
          '<div class="fb-promo-top">' +
            '<img class="fb-promo-mark" src="img/brand/logo-circle-dark.jpg" width="56" height="56" alt="AIX Outdoors">' +
            "<div>" +
              '<p class="fb-promo-kicker">On Facebook</p>' +
              '<p class="fb-promo-name">AIX Outdoors LLC</p>' +
              '<p class="fb-promo-meta">Land Clearing • Hauling • Grading · Burlington, IA</p>' +
            "</div>" +
          "</div>" +
          '<p class="fb-promo-copy">Job photos and updates from the field. Follow the Page to see what we are working on.</p>' +
          '<a class="btn fb-promo-btn" href="' + SHARE_URL + '" target="_blank" rel="noopener noreferrer">Open / Follow on Facebook</a>' +
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
    ensureSheet();
    fillMounts();
    setMode(getMode());
  });
})();
