/* ============================================================
   BTS · main-animacion-3
   Mismo patrón que animacion-1.js / animacion-2.js:
   - El video se reproduce solo al entrar en el viewport y se
     pausa al salir.
   ============================================================ */
(function () {
  "use strict";

  const seccion = document.getElementById("mainAnimacion3");
  if (!seccion) return;

  const videos = seccion.querySelectorAll(".animacion-video");
  if (!videos.length) return;

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.4 }
    );
    videos.forEach((video) => videoObserver.observe(video));
  } else {
    // Sin soporte de IntersectionObserver: al menos que intenten reproducir.
    videos.forEach((video) => video.play().catch(() => {}));
  }
})();
