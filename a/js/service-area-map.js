(function () {
  var cfg = window.AIX_COVERAGE || {};
  var CENTER = cfg.center || { lat: 40.8551, lon: -91.111, radiusMiles: 100 };
  var RADIUS_M = (CENTER.radiusMiles || 100) * 1609.344;
  var ZIP_URL = cfg.zipUrl || "data/service-zips.json";

  var zipDb = null;
  var form = document.getElementById("zip-form");
  var input = document.getElementById("zip-input");
  var result = document.getElementById("zip-result");
  var leadForm = document.getElementById("estimate-form-el");
  var leadSent = document.getElementById("estimate-sent");
  var mapEl = document.getElementById("coverage-map");

  var map, radiusCircle, pinMarker;

  var FILL_NEUTRAL = { color: "#204ebc", weight: 2, fillColor: "#204ebc", fillOpacity: 0.08 };
  var FILL_IN = { color: "#2f9e5d", weight: 2, fillColor: "#7dcea0", fillOpacity: 0.28 };
  var FILL_OUT = { color: "#c45c3a", weight: 2, fillColor: "#e6a08a", fillOpacity: 0.28 };

  function showSent() {
    if (!leadForm || !leadSent) return;
    leadForm.hidden = true;
    leadSent.hidden = false;
    leadSent.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (new URLSearchParams(window.location.search).get("sent") === "1") {
    showSent();
  }

  function haversineMiles(lat1, lon1, lat2, lon2) {
    var R = 3958.7613;
    var toRad = Math.PI / 180;
    var dLat = (lat2 - lat1) * toRad;
    var dLon = (lon2 - lon1) * toRad;
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function loadZips() {
    if (zipDb) return Promise.resolve(zipDb);
    return fetch(ZIP_URL, { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("zip db missing");
        return r.json();
      })
      .then(function (data) {
        zipDb = data;
        return data;
      });
  }

  function render(html, cls) {
    if (!result) return;
    result.hidden = false;
    result.className = "zip-result " + (cls || "");
    result.innerHTML = html;
  }

  function setCircleStyle(mode) {
    if (!radiusCircle) return;
    if (mode === "in") radiusCircle.setStyle(FILL_IN);
    else if (mode === "out") radiusCircle.setStyle(FILL_OUT);
    else radiusCircle.setStyle(FILL_NEUTRAL);
  }

  function placePin(lat, lon, inside) {
    if (!map) return;
    var color = inside ? "#2f9e5d" : "#c45c3a";
    if (pinMarker) map.removeLayer(pinMarker);
    pinMarker = L.circleMarker([lat, lon], {
      radius: 9,
      color: "#fff",
      weight: 2,
      fillColor: color,
      fillOpacity: 1,
    }).addTo(map);
    map.panTo([lat, lon]);
  }

  function applyPoint(lat, lon, meta) {
    var miles = haversineMiles(CENTER.lat, CENTER.lon, lat, lon);
    var inside = miles <= (CENTER.radiusMiles || 100);
    setCircleStyle(inside ? "in" : "out");
    placePin(lat, lon, inside);
    meta = meta || {};
    var where = meta.label || (meta.city ? meta.city + ", " + meta.state : lat.toFixed(4) + ", " + lon.toFixed(4));
    if (inside) {
      var edge = miles >= 90;
      render(
        "<p class=\"zip-status\"><strong>" +
          (edge ? "On the edge — still inside" : "Inside our service area") +
          "</strong></p>" +
          "<p>" +
          where +
          " · about <strong>" +
          miles.toFixed(1) +
          " miles</strong> from Burlington 52601.</p>" +
          '<p style="margin-top:12px"><a class="btn" href="#estimate-form">Request a free estimate</a> ' +
          '<a class="btn" href="tel:+13197501530">Call 319-750-1530</a></p>',
        edge ? "zip-edge" : "zip-yes"
      );
      var addr = document.getElementById("est-address");
      if (addr && !addr.value && meta.zip) {
        addr.value = (meta.city || "") + ", " + (meta.state || "") + " " + meta.zip;
      }
    } else {
      render(
        "<p class=\"zip-status\"><strong>Outside the 100-mile ring</strong></p>" +
          "<p>" +
          where +
          " · about <strong>" +
          miles.toFixed(1) +
          " miles</strong> from Burlington 52601.</p>" +
          '<p style="margin-top:12px"><a class="btn" href="tel:+13197501530">Call 319-750-1530</a> — we will still say yes or no up front.</p>',
        "zip-no"
      );
    }
  }

  function checkZip(raw) {
    var zip = String(raw || "").replace(/\D/g, "").slice(0, 5);
    if (zip.length !== 5) {
      render("<p><strong>Enter a 5-digit ZIP.</strong></p>", "zip-bad");
      return;
    }
    render("<p class=\"muted\">Checking…</p>", "");
    loadZips()
      .then(function (db) {
        var hit = db.zips && db.zips[zip];
        if (hit) {
          applyPoint(hit.lat, hit.lon, {
            zip: zip,
            city: hit.city,
            state: hit.state,
            label: zip + " · " + hit.city + ", " + hit.state,
          });
        } else {
          // Not in IA/MO/IL coverage DB — still try to place if we only know it's outside list
          setCircleStyle("out");
          if (pinMarker) map.removeLayer(pinMarker);
          render(
            "<p class=\"zip-status\"><strong>Outside our listed IA / MO / IL radius</strong></p>" +
              "<p>" +
              zip +
              " is not in the 100-mile ZIP database around 52601. Click the map near your property to measure, or call.</p>" +
              '<p style="margin-top:12px"><a class="btn" href="tel:+13197501530">Call 319-750-1530</a></p>',
            "zip-no"
          );
        }
      })
      .catch(function () {
        render(
          "<p><strong>Could not load the ZIP list.</strong> Call <a href=\"tel:+13197501530\">319-750-1530</a>.</p>",
          "zip-bad"
        );
      });
  }

  function initMap() {
    if (!mapEl) return;
    if (typeof L === "undefined") {
      var fb = document.getElementById("map-fallback");
      if (fb) fb.textContent = "Map library failed to load. Try a hard refresh, or call 319-750-1530.";
      return;
    }
    var fallback = document.getElementById("map-fallback");
    if (fallback) fallback.remove();
    if (L.Icon && L.Icon.Default) {
      L.Icon.Default.mergeOptions({
        iconUrl: "vendor/leaflet/images/marker-icon.png",
        iconRetinaUrl: "vendor/leaflet/images/marker-icon-2x.png",
        shadowUrl: "vendor/leaflet/images/marker-shadow.png",
      });
    }
    map = L.map(mapEl, { scrollWheelZoom: true, attributionControl: true }).setView(
      [CENTER.lat, CENTER.lon],
      8
    );
    // Esri World Street Map — no API key, no Carto watermark
    var tileUrl = (cfg.tileUrl) || "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution:
        'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom',
    }).addTo(map);

    radiusCircle = L.circle([CENTER.lat, CENTER.lon], Object.assign({
      radius: RADIUS_M
    }, FILL_NEUTRAL)).addTo(map);

    L.circleMarker([CENTER.lat, CENTER.lon], {
      radius: 6,
      color: "#fff",
      weight: 2,
      fillColor: "#204ebc",
      fillOpacity: 1,
    })
      .addTo(map)
      .bindTooltip("Burlington, IA 52601", { permanent: false });

    map.fitBounds(radiusCircle.getBounds(), { padding: [24, 24] });
    setTimeout(function () { map.invalidateSize(); }, 100);
    setTimeout(function () { map.invalidateSize(); }, 500);

    map.on("click", function (e) {
      applyPoint(e.latlng.lat, e.latlng.lng, {
        label: e.latlng.lat.toFixed(4) + ", " + e.latlng.lng.toFixed(4) + " (map pin)",
      });
    });
  }

  if (form && input) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      checkZip(input.value);
    });
    var q = new URLSearchParams(window.location.search).get("zip");
    if (q) {
      input.value = q.replace(/\D/g, "").slice(0, 5);
      // wait for map
      setTimeout(function () {
        checkZip(input.value);
      }, 400);
    }
  }

  initMap();
  loadZips().catch(function () {});
})();
