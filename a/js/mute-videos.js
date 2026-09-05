(function () {
  function silence(v) {
    try {
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute("muted", "");
      v.volume = 0;
    } catch (e) {}
  }

  function ensureWrap(v) {
    var parent = v.parentElement;
    if (parent && parent.classList.contains("job-video-player")) return parent;
    var wrap = document.createElement("div");
    wrap.className = "job-video-player";
    parent.insertBefore(wrap, v);
    wrap.appendChild(v);
    return wrap;
  }

  function ensureOverlay(wrap) {
    var btn = wrap.querySelector(".job-video-playbtn");
    if (btn) return btn;
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "job-video-playbtn";
    btn.setAttribute("aria-label", "Play video");
    btn.innerHTML = '<span class="job-video-playbtn-icon" aria-hidden="true"></span>';
    wrap.appendChild(btn);
    return btn;
  }

  function setPlaying(wrap, playing) {
    wrap.classList.toggle("is-playing", playing);
    var btn = wrap.querySelector(".job-video-playbtn");
    if (btn) btn.setAttribute("aria-label", playing ? "Pause video" : "Play video");
  }

  function pauseOthers(except) {
    document.querySelectorAll("video").forEach(function (v) {
      if (v !== except && !v.paused) {
        try { v.pause(); } catch (e) {}
      }
    });
  }

  function wire(v) {
    silence(v);
    v.removeAttribute("controls");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.disablePictureInPicture = true;
    try { v.setAttribute("controlslist", "nodownload nofullscreen noremoteplayback"); } catch (e) {}

    var wrap = ensureWrap(v);
    var btn = ensureOverlay(wrap);

    function toggle() {
      silence(v);
      if (v.paused) {
        pauseOthers(v);
        var p = v.play();
        if (p && typeof p.catch === "function") p.catch(function () {});
      } else {
        v.pause();
      }
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });
    v.addEventListener("click", function (e) {
      e.preventDefault();
      toggle();
    });
    v.addEventListener("play", function () { silence(v); setPlaying(wrap, true); });
    v.addEventListener("pause", function () { setPlaying(wrap, false); });
    v.addEventListener("ended", function () { setPlaying(wrap, false); });
    setPlaying(wrap, !v.paused);
  }

  function init() {
    document.querySelectorAll("video").forEach(wire);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
