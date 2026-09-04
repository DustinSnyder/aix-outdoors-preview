(function () {
  var TO = "+13197501530";
  // iOS sms: URLs truncate aggressively; keep body short and put address first.
  var MAX_BODY = 700;

  function field(form, name) {
    var el = form.elements.namedItem(name);
    if (!el) return "";
    return String(el.value || "").trim();
  }

  function fullAddress(form) {
    var street = field(form, "street") || field(form, "address");
    var city = field(form, "city");
    var state = field(form, "state");
    var zip = field(form, "zip");
    var parts = [];
    if (street) parts.push(street);
    var cityLine = [city, state].filter(Boolean).join(", ");
    if (cityLine && zip) cityLine += " " + zip;
    else if (zip) cityLine = zip;
    if (cityLine) parts.push(cityLine);
    return parts.join(", ");
  }

  function mapsLinks(addr) {
    if (!addr) return [];
    var q = encodeURIComponent(addr);
    return [
      "Maps: https://maps.apple.com/?q=" + q,
      "Google: https://www.google.com/maps/search/?api=1&query=" + q,
    ];
  }

  function buildBody(form) {
    var addr = fullAddress(form);
    var core = [
      "AIX estimate",
      "Name: " + field(form, "name"),
      "Phone: " + field(form, "phone"),
      "Address: " + (addr || "(missing)"),
    ];
    core = core.concat(mapsLinks(addr));
    core.push("Email: " + field(form, "email"));

    var extras = [];
    var acres = field(form, "acres");
    if (acres) extras.push("Acres: " + acres);
    var job = field(form, "job_type");
    if (job) extras.push("Job: " + job);
    var notes = field(form, "notes");
    if (notes) extras.push("Notes: " + notes);

    var body = core.concat(extras).join("\n");
    if (body.length <= MAX_BODY) return body;

    // Never cut the address / maps lines — trim notes first, then job/acres.
    while (body.length > MAX_BODY && extras.length) {
      extras.pop();
      body = core.concat(extras).join("\n");
    }
    if (body.length > MAX_BODY) body = body.slice(0, MAX_BODY - 1) + "…";
    return body;
  }

  function smsUrl(body) {
    var encoded = encodeURIComponent(body);
    var isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) return "sms:" + TO + "&body=" + encoded;
    return "sms:" + TO + "?body=" + encoded;
  }

  function openSms(url) {
    var a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 500);
  }

  function showOk(form, ok) {
    if (!ok) return;
    form.hidden = true;
    ok.hidden = false;
    ok.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function wireForm(formId, okId) {
    var form = document.getElementById(formId);
    var ok = okId ? document.getElementById(okId) : null;
    if (!form) return;

    form.setAttribute("action", "javascript:void(0)");
    form.setAttribute("method", "post");
    form.removeAttribute("enctype");

    form.addEventListener(
      "submit",
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
        if (!form.reportValidity()) return;

        var body = buildBody(form);
        try {
          openSms(smsUrl(body));
        } catch (err) {}
        showOk(form, ok);
      },
      true
    );
  }

  wireForm("quote-form", "quote-ok");
  wireForm("estimate-form-el", "estimate-sent");
})();
