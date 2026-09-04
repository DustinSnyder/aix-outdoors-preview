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
    var body = lines.join("\n");
    if (body.length > 1200) body = body.slice(0, 1190) + "…";
    return body;
  }

  function smsUrl(body) {
    var encoded = encodeURIComponent(body);
    var isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    // iOS: sms:number&body=  Android: sms:number?body=
    if (isIOS) return "sms:" + TO + "&body=" + encoded;
    return "sms:" + TO + "?body=" + encoded;
  }

  function openSms(url) {
    // Stay on this page — do NOT set window.location (that navigates away).
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

    // Never allow a real navigation POST (blocks cached FormSubmit actions too once JS runs)
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
        } catch (err) {
          // still show confirmation; offer manual sms link below
        }
        showOk(form, ok);
      },
      true
    );
  }

  wireForm("quote-form", "quote-ok");
  wireForm("estimate-form-el", "estimate-sent");
})();
