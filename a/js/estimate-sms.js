(function () {
  var TO = "+13197501530";
  var MAX_BODY = 700;
  var MAX_PHOTOS = 6;
  var MAX_PHOTO_BYTES = 8 * 1024 * 1024; // skip huge originals for share reliability

  function field(form, name) {
    var el = form.elements.namedItem(name);
    if (!el) return "";
    return String(el.value || "").trim();
  }

  function photoInput(form) {
    return form.querySelector('input[type="file"][name="photos"]');
  }

  function selectedFiles(form) {
    var input = photoInput(form);
    if (!input || !input.files || !input.files.length) return [];
    var list = Array.prototype.slice.call(input.files, 0, MAX_PHOTOS);
    return list.filter(function (f) {
      return f && f.type && f.type.indexOf("image/") === 0 && f.size <= MAX_PHOTO_BYTES;
    });
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

  function buildBody(form, fileCount) {
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
    if (fileCount > 0) extras.push("Photos attached: " + fileCount);

    var body = core.concat(extras).join("\n");
    if (body.length <= MAX_BODY) return body;
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

  function canShareFiles(files) {
    if (!navigator.share || !navigator.canShare) return false;
    try {
      return navigator.canShare({ files: files });
    } catch (e) {
      return false;
    }
  }

  function sendRequest(form) {
    var files = selectedFiles(form);
    var body = buildBody(form, files.length);
    var shareData = { text: body, title: "AIX Outdoors estimate" };

    // Best path on phones: one share sheet with text + photos → Messages
    if (files.length && canShareFiles(files)) {
      shareData.files = files;
      return navigator.share(shareData).then(function () {
        return "shared";
      });
    }

    if (navigator.share) {
      return navigator
        .share(shareData)
        .then(function () {
          return "shared-text";
        })
        .catch(function () {
          openSms(smsUrl(body));
          return "sms";
        });
    }

    openSms(smsUrl(body));
    return Promise.resolve("sms");
  }

  function showOk(form, ok) {
    if (!ok) return;
    form.hidden = true;
    ok.hidden = false;
    ok.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function wirePhotoPreview(form) {
    var input = photoInput(form);
    var preview = form.querySelector(".photo-preview");
    if (!input || !preview) return;
    input.addEventListener("change", function () {
      preview.innerHTML = "";
      var files = selectedFiles(form);
      if (!files.length) {
        preview.hidden = true;
        return;
      }
      preview.hidden = false;
      files.forEach(function (file) {
        var fig = document.createElement("figure");
        var img = document.createElement("img");
        img.alt = file.name;
        img.src = URL.createObjectURL(file);
        img.onload = function () {
          URL.revokeObjectURL(img.src);
        };
        var cap = document.createElement("figcaption");
        cap.textContent = file.name;
        fig.appendChild(img);
        fig.appendChild(cap);
        preview.appendChild(fig);
      });
    });
  }

  function wireForm(formId, okId) {
    var form = document.getElementById(formId);
    var ok = okId ? document.getElementById(okId) : null;
    if (!form) return;

    form.setAttribute("action", "javascript:void(0)");
    form.setAttribute("method", "post");
    form.removeAttribute("enctype");
    wirePhotoPreview(form);

    form.addEventListener(
      "submit",
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
        if (!form.reportValidity()) return;

        var btn = form.querySelector('button[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Opening…";
        }

        sendRequest(form)
          .then(function () {
            showOk(form, ok);
          })
          .catch(function (err) {
            // User canceled share sheet — stay on form so they can try again
            if (err && (err.name === "AbortError" || err.name === "NotAllowedError")) {
              if (btn) {
                btn.disabled = false;
                btn.textContent = "Request free estimate";
              }
              return;
            }
            // Other failure — still fall back to SMS draft
            try {
              openSms(smsUrl(buildBody(form, selectedFiles(form).length)));
            } catch (e2) {}
            showOk(form, ok);
          });
      },
      true
    );
  }

  wireForm("quote-form", "quote-ok");
  wireForm("estimate-form-el", "estimate-sent");
})();
