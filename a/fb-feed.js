/* AIX Outdoors — Direction A Facebook Page Plugin mock + mobile placements.
   Swap data-href when a real Page exists. See HTML comment inside pluginMarkup(). */
(function () {
  var PAGE_URL = "https://www.facebook.com/AIXOutdoors";
  var STORAGE_KEY = "aix-a-mobile-feed";
  var MARK =
    '<svg class="fb-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="3" fill="#6b7c3a"/><path d="M8 30 L20 8 L32 30" fill="none" stroke="#f3f1ea" stroke-width="2.4"/><path d="M14 30h12" stroke="#e85d04" stroke-width="2.4"/><circle cx="20" cy="22" r="2.2" fill="#e85d04"/></svg>';

  var POSTS = [
    {
      time: "SAMPLE · 2d",
      text: "Clearing job, Des Moines County. Hedge and locust off a fence line so the next pass can be a plot — not a jungle. Finish photos go in the closeout packet.",
      img: "img/midwest-oak-timber.jpg",
      alt: "Oak timber edge — company post, Unsplash illustrative"
    },
    {
      time: "SAMPLE · 5d",
      text: "Trail cut through oak timber on a southeast Iowa farm. Hunter-width corridor, first stone down, quiet enough to walk without flagging. GPS of the line is in the job folder.",
      img: "img/gravel-rural-lane.jpg",
      alt: "Gravel lane standing in for trail work — company post, Unsplash"
    },
    {
      time: "SAMPLE · 1w",
      text: "Food plot in on a corn/soy edge. Sized to the farm, not the seed-bag photo. Soil work, lime, and a mix that will still be standing after first frost.",
      img: "img/iowa-corn-mason-city.jpg",
      alt: "Mason City Iowa corn standing in for a feeding plot — company post, Unsplash"
    },
    {
      time: "SAMPLE · 2w",
      text: "Driveway resurfacing: re-crown, ditch, fresh stone. The lane has to carry the trailer in April, not just look clean in July.",
      img: "img/gravel-rural-lane.jpg",
      alt: "Rural gravel lane — company post, Unsplash"
    },
    {
      time: "SAMPLE · 3w",
      text: "Seasonal mowing on a CRP-style field. Edges held, setbacks cut, timber line left as cover. Opening-day access without a hay crop in the way.",
      img: "img/farm-rows.jpg",
      alt: "Farm rows standing in for seasonal mowing — company post, Unsplash"
    }
  ];

  function pluginMarkup() {
    var posts = POSTS.map(function (p) {
      return (
        '<article class="fb-post">' +
          '<header class="fb-post-hd">' + MARK +
            '<div><strong>AIX Outdoors</strong><span>' + p.time + '</span></div>' +
          "</header>" +
          "<p>" + p.text + "</p>" +
          '<div class="fb-post-img"><img src="' + p.img + '" alt="' + p.alt + '"></div>' +
          '<div class="fb-post-actions" aria-hidden="true"><span>Like</span><span>Comment</span><span>Share</span></div>' +
        "</article>"
      );
    }).join("");

    return (
      "<!--\n" +
      "  Facebook Page Plugin (timeline) — visual mock until a real Page URL exists.\n" +
      "  Official plugin: https://developers.facebook.com/docs/plugins/page-plugin/\n" +
      "  Public Page required. Width 180–500px. tabs=timeline.\n" +
      "  Optional: data-show-posts=\"true\" if the timeline spinner never settles.\n" +
      "  hide facepile: brand page — no faces of random likers.\n" +
      "  Placeholder Page URL (swap later): https://www.facebook.com/AIXOutdoors\n" +
      "  When live: load https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v21.0\n" +
      "  then replace this mock with:\n" +
      "  <div class=\"fb-page\" data-href=\"PAGE_URL\" data-tabs=\"timeline\"\n" +
      "       data-width=\"340\" data-height=\"500\" data-small-header=\"true\"\n" +
      "       data-adapt-container-width=\"true\" data-hide-cover=\"false\"\n" +
      "       data-show-facepile=\"false\"></div>\n" +
      "-->\n" +
      '<div class="fb-page-mock" data-href="' + PAGE_URL + '" data-tabs="timeline" data-width="340" data-height="500" data-small-header="true" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="false">' +
        '<p class="fb-sample-flag">SAMPLE</p>' +
        '<div class="fb-chrome" role="region" aria-label="Facebook Page plugin mock — AIX Outdoors timeline">' +
          '<div class="fb-cover" style="background-image:url(\'img/iowa-green-field.jpg\')"></div>' +
          '<div class="fb-page-hd">' +
            '<div class="fb-avatar">' + MARK + "</div>" +
            "<div>" +
              '<p class="fb-page-name">AIX Outdoors</p>' +
              '<p class="fb-page-meta">Land · Trails · Plots · Burlington, IA</p>' +
            "</div>" +
          "</div>" +
          '<div class="fb-btns">' +
            '<button type="button" class="fb-like" disabled title="Disabled in this sample">Like</button>' +
            '<button type="button" class="fb-follow" disabled title="Disabled in this sample">Follow</button>' +
          "</div>" +
          '<div class="fb-tabs"><span class="on">Posts</span></div>' +
          '<div class="fb-timeline">' + posts + "</div>" +
        "</div>" +
        '<p class="fb-chrome-caption">Facebook keeps its own chrome. Live embed is an iframe; this is a SAMPLE stand-in.</p>' +
      "</div>"
    );
  }

  function getMode() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "hero" || stored === "sheet") return stored;
    } catch (e) {}
    return "sheet";
  }

  function setMode(mode) {
    if (mode !== "hero" && mode !== "sheet") mode = "sheet";
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
      '<a href="#fb-feed-sheet" data-feed-mode="sheet">Bottom sheet</a>' +
      '<span class="feed-toggle-sep"> | </span>' +
      '<a href="#fb-feed-hero" data-feed-mode="hero">After hero</a>' +
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
    var html = pluginMarkup();
    document.querySelectorAll(".fb-rail, .fb-after-hero, .fb-sheet-body").forEach(function (el) {
      if (!el.innerHTML.trim()) el.innerHTML = html;
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
        '<span class="fb-chip-dot" aria-hidden="true"></span> Latest from the field' +
      "</button>" +
      '<div class="fb-sheet" id="fb-sheet" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="fb-sheet-title">' +
        '<div class="fb-sheet-backdrop" data-fb-close></div>' +
        '<div class="fb-sheet-panel">' +
          '<header class="fb-sheet-hd">' +
            '<h2 id="fb-sheet-title">Latest from the field</h2>' +
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
    enhanceBanner();
    ensureSheet();
    fillMounts();
    setMode(getMode());
  });
})();
