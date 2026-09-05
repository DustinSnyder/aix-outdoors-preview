(function () {
  function silence(v) {
    try {
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute("muted", "");
      v.volume = 0;
    } catch (e) {}
  }
  function all() {
    document.querySelectorAll("video").forEach(silence);
  }
  document.addEventListener("DOMContentLoaded", all);
  document.addEventListener("play", function (e) {
    if (e.target && e.target.tagName === "VIDEO") silence(e.target);
  }, true);
})();
