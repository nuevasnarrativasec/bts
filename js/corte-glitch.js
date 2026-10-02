/* ============================================================
   BTS · .corte-glitch (bloque cortador entre main-animacion-5 y
   main-deja-tu-mensaje)
   Apenas el bloque entra en el viewport, se dispara el efecto
   glitch (clase "is-glitching", animación CSS) y, al terminar, se
   colapsa (clase "is-collapsed") para desaparecer del todo. Ocurre
   una sola vez.
   ============================================================ */
(function () {
  "use strict";

  var el = document.getElementById("corteGlitch");
  if (!el) return;

  var DURACION_GLITCH_MS = 1800; // debe coincidir con la animación "corte-glitch-jitter"
  var yaDisparado = false;

  var prefiereMenosMovimiento =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function desaparecer() {
    if (yaDisparado) return;
    yaDisparado = true;

    if (prefiereMenosMovimiento) {
      el.classList.add("is-collapsed");
      return;
    }

    el.classList.add("is-glitching");
    window.setTimeout(function () {
      el.classList.add("is-collapsed");
    }, DURACION_GLITCH_MS);
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) desaparecer();
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
  } else {
    desaparecer();
  }
})();
