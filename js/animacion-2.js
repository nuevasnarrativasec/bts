/* ============================================================
   BTS · main-animacion-2 (Magic Shop)
   Mismo patrón que animacion-1.js:
   - Los videos se reproducen solos al entrar en el viewport y se
     pausan al salir.
   - El CTA de Spotify usa la Spotify iFrame API oficial para poder
     mandarle play()/pause() de verdad al reproductor embebido.
   ============================================================ */
(function () {
  "use strict";

  const seccion = document.getElementById("mainAnimacion2");
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

  /* --- CTA de Spotify (Spotify iFrame API) --- */
  const cta = document.getElementById("animacionCta2");
  if (!cta) return;

  const btn = cta.querySelector(".animacion-cta-play");
  const embedEl = document.getElementById("animacionCta2Embed");
  const iconPlay = cta.querySelector(".icon-play");
  const iconPause = cta.querySelector(".icon-pause");
  const uri = cta.dataset.spotifyUri;

  let controller = null;
  let isPaused = true;
  let pendingPlay = false; // si dieron click antes de que la API terminara de cargar

  function actualizarIcono() {
    btn.classList.toggle("is-playing", !isPaused);
    btn.setAttribute("aria-label", isPaused ? "Reproducir Magic Shop" : "Pausar Magic Shop");
    if (iconPlay) iconPlay.hidden = !isPaused;
    if (iconPause) iconPause.hidden = isPaused;
  }

  function crearController() {
    if (!window.SpotifyIframeApi || controller || !uri) return;

    window.SpotifyIframeApi.createController(
      embedEl,
      { uri: uri, width: "100%", height: "80" },
      (EmbedController) => {
        controller = EmbedController;

        controller.addListener("playback_update", (e) => {
          isPaused = !!(e && e.data && e.data.isPaused);
          actualizarIcono();
        });

        controller.addListener("ready", () => {
          if (pendingPlay) {
            controller.play();
            pendingPlay = false;
          }
        });
      }
    );
  }

  // Carga el script oficial de la Spotify iFrame API (compartido con
  // main-animacion-1: si ya está cargado/cargándose, no lo duplica).
  function cargarSpotifyApi() {
    if (window.SpotifyIframeApi) {
      crearController();
      return;
    }
    if (document.getElementById("spotify-iframe-api")) {
      // Ya lo está cargando otra sección (animacion-1.js): engánchate
      // al mismo callback sin pisar el que ya haya registrado.
      const anterior = window.onSpotifyIframeApiReady;
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        window.SpotifyIframeApi = IFrameAPI;
        if (typeof anterior === "function") anterior(IFrameAPI);
        crearController();
      };
      return;
    }

    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      window.SpotifyIframeApi = IFrameAPI;
      crearController();
    };

    const script = document.createElement("script");
    script.id = "spotify-iframe-api";
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.head.appendChild(script);
  }

  cargarSpotifyApi();

  btn.addEventListener("click", () => {
    if (!controller) {
      pendingPlay = true;
      isPaused = false;
      actualizarIcono();
      return;
    }
    if (isPaused) {
      controller.play();
    } else {
      controller.pause();
    }
  });

  // Pausa el track si la sección sale del viewport.
  if ("IntersectionObserver" in window) {
    const seccionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && controller && !isPaused) {
            controller.pause();
          }
        });
      },
      { threshold: 0 }
    );
    seccionObserver.observe(seccion);
  }
})();
