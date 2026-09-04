(function () {
  var ZIP_URL = "data/service-zips.json";
  var zipDb = null;
  var form = document.getElementById("zip-form");
  var input = document.getElementById("zip-input");
  var result = document.getElementById("zip-result");
  var leadForm = document.getElementById("lead-form-el");
  var leadSent = document.getElementById("lead-sent");

  function showSent() {
    if (!leadForm || !leadSent) return;
    leadForm.hidden = true;
    leadSent.hidden = false;
    leadSent.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (new URLSearchParams(window.location.search).get("sent") === "1") {
    showSent();
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
    result.hidden = false;
    result.className = "zip-result " + (cls || "");
    result.innerHTML = html;
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
          var miles = Number(hit.miles);
          var edge = miles >= 90;
          var label = edge ? "On the edge of our radius" : "Yes — inside our service area";
          var cls = edge ? "zip-edge" : "zip-yes";
          render(
            "<p class=\"zip-status\"><strong>" +
              label +
              "</strong></p>" +
              "<p>" +
              zip +
              " · " +
              (hit.city || "") +
              ", " +
              (hit.state || "") +
              " · about <strong>" +
              miles.toFixed(1) +
              " miles</strong> from Burlington 52601.</p>" +
              '<p style="margin-top:12px"><a class="btn" href="#lead-form">Request a free estimate</a> ' +
              '<a class="btn btn-ghost" href="tel:+13197501530">Call 319-750-1530</a></p>',
            cls
          );
          var addr = document.getElementById("lead-address");
          if (addr && !addr.value) {
            addr.value = (hit.city || "") + ", " + (hit.state || "") + " " + zip;
          }
        } else {
          render(
            "<p class=\"zip-status\"><strong>Outside our listed IA / MO / IL radius</strong></p>" +
              "<p>" +
              zip +
              " is not in the 100-mile ZIP list around 52601. If you are close and think we missed you, call anyway — we will say yes or no up front.</p>" +
              '<p style="margin-top:12px"><a class="btn" href="tel:+13197501530">Call 319-750-1530</a></p>',
            "zip-no"
          );
        }
      })
      .catch(function () {
        render(
          "<p><strong>Could not load the ZIP list.</strong> Call or text <a href=\"tel:+13197501530\">319-750-1530</a> and we will check coverage for you.</p>",
          "zip-bad"
        );
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
      checkZip(input.value);
    }
  }

  // Prefetch zip db
  loadZips().catch(function () {});
})();
