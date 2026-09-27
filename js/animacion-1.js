/* ============================================================
   BTS · main-animacion-1 (Whalien 52)
   - Los dos videos se reproducen solos al entrar en el viewport
     y se pausan al salir.
   - El CTA de Spotify reproduce/pausa solo ese track (embed) y se
     detiene automáticamente si la sección sale del viewport.
   ============================================================ */
(function () {
  "use strict";

  const seccion = document.getElementById("mainAnimacion1");
  if (!seccion) return;

  /* --- Videos: play/pause automático según viewport --- */
  const videos = seccion.querySelectorAll(".animacion-video");

  if ("IntersectionObserver" in window && videos.length) {
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

  /* --- CTA de Spotify (mismo patrón que el carrusel de discos) --- */
  const cta = document.getElementById("animacionCta1");
  if (!cta) return;

  const btn = cta.querySelector(".animacion-cta-play");
  const embedBox = cta.querySelector(".animacion-cta-embed");
  const iconPlay = cta.querySelector(".icon-play");
  const iconPause = cta.querySelector(".icon-pause");
  const src = cta.dataset.embed;

  let activo = false;

  function reproducir() {
    if (!src || activo) return;

    const iframe = document.createElement("iframe");
    iframe.src = src + (src.includes("?") ? "&" : "?") + "autoplay=1";
    iframe.height = "80";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.loading = "lazy";
    iframe.title = "Reproductor de Spotify — Whalien 52";

    embedBox.innerHTML = "";
    embedBox.appendChild(iframe);
    embedBox.classList.add("is-active");

    btn.classList.add("is-playing");
    btn.setAttribute("aria-label", "Pausar Whalien 52");
    if (iconPlay) iconPlay.hidden = true;
    if (iconPause) iconPause.hidden = false;

    activo = true;
  }

  function pausar() {
    if (!activo) return;

    // Quitar el iframe es la forma más segura de cortar el audio.
    embedBox.innerHTML = "";
    embedBox.classList.remove("is-active");

    btn.classList.remove("is-playing");
    btn.setAttribute("aria-label", "Reproducir Whalien 52");
    if (iconPlay) iconPlay.hidden = false;
    if (iconPause) iconPause.hidden = true;

    activo = false;
  }

  btn.addEventListener("click", () => {
    if (activo) {
      pausar();
    } else {
      reproducir();
    }
  });

  // Pausa el track si la sección sale del viewport.
  if ("IntersectionObserver" in window) {
    const seccionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) pausar();
        });
      },
      { threshold: 0 }
    );
    seccionObserver.observe(seccion);
  }
})();
