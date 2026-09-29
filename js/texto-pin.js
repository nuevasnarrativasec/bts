/* ============================================================
   BTS · videos con letra en tablet / móvil (≤ 1024px)
   Secciones: ballena (animacion-video 2), playa (3) y cuarto (4).
   - CSS: position: sticky mantiene el video fijo (pin) dentro de
     .fila-pin, que es alta a propósito (ver styles.css).
   - JS: con el scroll calcula el avance del pin (0 → 1) y escribe
     --texto-p (0 → 1, con ease-out) en cada .fila-pin. La caja
     blanca del texto lo usa como opacity / translateY.
   En desktop no hace nada (limpia la variable).
   ============================================================ */
(function () {
  "use strict";

  const filas = Array.prototype.slice.call(document.querySelectorAll(".fila-pin"));
  if (!filas.length) return;

  const mq = window.matchMedia("(max-width: 1024px)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Tramo del pin en el que ocurre el fade (0 = inicio del pin, 1 = fin).
  const FADE_INICIO = 0.18;
  const FADE_FIN = 0.5;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  let ticking = false;

  function actualizar() {
    ticking = false;

    if (!mq.matches || reduce.matches) {
      filas.forEach((fila) => fila.style.removeProperty("--texto-p"));
      return;
    }

    const vh = window.innerHeight;

    filas.forEach((fila) => {
      const rect = fila.getBoundingClientRect();
      if (rect.bottom < -vh || rect.top > vh * 2) return; // lejos de la pantalla

      const capa = fila.querySelector(".texto-pin");
      const alturaPin = capa ? capa.offsetHeight : vh;
      const recorrido = rect.height - alturaPin;
      if (recorrido <= 0) return;

      const avance = clamp(-rect.top / recorrido, 0, 1);
      const t = clamp((avance - FADE_INICIO) / (FADE_FIN - FADE_INICIO), 0, 1);
      fila.style.setProperty("--texto-p", easeOutCubic(t).toFixed(3));
    });
  }

  function pedirActualizacion() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(actualizar);
  }

  window.addEventListener("scroll", pedirActualizacion, { passive: true });
  window.addEventListener("resize", pedirActualizacion);
  window.addEventListener("orientationchange", pedirActualizacion);
  if (mq.addEventListener) {
    mq.addEventListener("change", pedirActualizacion);
    reduce.addEventListener("change", pedirActualizacion);
  }

  actualizar();
})();
