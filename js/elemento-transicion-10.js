/* ============================================================
   BTS · .elemento-transicion-10 (adorno sobre main-deja-tu-mensaje)
   Apenas el elemento entra en el viewport, se le suma la clase
   "en-vista" para que caiga suavemente a su posición (ver la
   transition en css/styles.css). Ocurre una sola vez.
   ============================================================ */
(function () {
  "use strict";

  var el = document.querySelector(".elemento-transicion-10");
  if (!el) return;

  function caer() {
    el.classList.add("en-vista");
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            caer();
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
  } else {
    caer();
  }
})();
