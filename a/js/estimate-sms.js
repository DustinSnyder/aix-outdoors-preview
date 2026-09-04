(function () {
  var TO = "+13197501530";

  function field(form, name) {
    var el = form.elements.namedItem(name);
    if (!el) return "";
    return String(el.value || "").trim();
  }

  function buildBody(form) {
    var lines = [
      "AIX Outdoors estimate request",
      "Name: " + field(form, "name"),
      "Phone: " + field(form, "phone"),
      "Email: " + field(form, "email"),
      "Address: " + field(form, "address"),
    ];
    var acres = field(form, "acres");
    if (acres) lines.push("Acres: " + acres);
    var job = field(form, "job_type");
    if (job) lines.push("Job: " + job);
    var notes = field(form, "notes");
    if (notes) lines.push("Notes: " + notes);
    lines.push("Photos: attach in this text thread if you have them.");
    return lines.join("\n");
  }

  function smsUrl(body) {
    var encoded = encodeURIComponent(body);
    // iOS prefers sms:number&body= ; Android often wants sms:number?body=
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) return "sms:" + TO + "&body=" + encoded;
    return "sms:" + TO + "?body=" + encoded;
  }

  function wireForm(formId, okId) {
    var form = document.getElementById(formId);
    if (!form) return;
    form.setAttribute("action", "#");
    form.removeAttribute("enctype");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var body = buildBody(form);
      // SMS body length soft limit — keep under ~1200 chars for reliability
      if (body.length > 1200) body = body.slice(0, 1190) + "…";
      var url = smsUrl(body);
      window.location.href = url;
      var ok = okId ? document.getElementById(okId) : null;
      if (ok) {
        form.hidden = true;
        ok.hidden = false;
        ok.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  wireForm("quote-form", "quote-ok");
  wireForm("estimate-form-el", "estimate-sent");
})();
