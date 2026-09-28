/* ============================================================
   BTS · ctn-body-to-body ("Body to body")
   - El botón verde usa la Spotify iFrame API (misma API que
     main-animacion-1 / main-animacion-2 / el carrusel de discos;
     comparten el mismo <script id="spotify-iframe-api">, así que
     no se carga dos veces).
   - Al primer click (además de reproducir/pausar el track):
       1) los 3 elementos gráficos caen desde arriba y se acomodan
          (clase "is-visible" en cada [data-bodytobody-item]).
       2) la letra aparece con efecto máquina de escribir, primero
          la estrofa 1 y, al terminar, la estrofa 2.
     Esta revelación ocurre una sola vez: pausar y volver a darle
     play no la repite ni la deshace.
   ============================================================ */
(function () {
  "use strict";

  const seccion = document.getElementById("ctnBodyToBody");
  if (!seccion) return;

  const btn = document.getElementById("bodyToBodyPlayBtn");
  const hint = document.getElementById("bodyToBodyHint");
  const embedEl = document.getElementById("bodyToBodyEmbed");
  const items = Array.from(seccion.querySelectorAll("[data-bodytobody-item]"));
  const lyric1 = document.getElementById("bodyToBodyLyric1");
  const lyric2 = document.getElementById("bodyToBodyLyric2");

  if (!btn || !embedEl) return;

  const iconPlay = btn.querySelector(".icon-play");
  const iconPause = btn.querySelector(".icon-pause");
  const uri = btn.dataset.spotifyUri;

  let controller = null;
  let isPaused = true;
  let pendingPlay = false; // si dieron click antes de que la API terminara de cargar
  let yaRevelado = false; // la caída de gráficos + la letra solo se disparan una vez

  function actualizarIcono() {
    btn.classList.toggle("is-playing", !isPaused);
    btn.setAttribute("aria-label", isPaused ? "Reproducir Body to body" : "Pausar Body to body");
    if (iconPlay) iconPlay.hidden = !isPaused;
    if (iconPause) iconPause.hidden = isPaused;
  }

  /* --- Efecto máquina de escribir --- */
  function escribirTexto(el, texto, msPorLetra, alTerminar) {
    if (!el) {
      if (typeof alTerminar === "function") alTerminar();
      return;
    }
    el.textContent = "";
    el.classList.add("is-typing");

    let i = 0;
    const intervalo = window.setInterval(() => {
      i += 1;
      el.textContent = texto.slice(0, i);
      if (i >= texto.length) {
        window.clearInterval(intervalo);
        el.classList.remove("is-typing");
        if (typeof alTerminar === "function") alTerminar();
      }
    }, msPorLetra);
  }

  function revelar() {
    if (yaRevelado) return;
    yaRevelado = true;

    if (hint) hint.classList.add("is-hidden");

    // Los elementos gráficos caen apenas empieza a aparecer la letra
    // (cada uno con su propio transition-delay definido en el CSS).
    items.forEach((item) => item.classList.add("is-visible"));

    const texto1 = (lyric1 && lyric1.dataset.texto) || "";
    const texto2 = (lyric2 && lyric2.dataset.texto) || "";

    escribirTexto(lyric1, texto1, 30, () => {
      escribirTexto(lyric2, texto2, 30);
    });
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

  // Carga el script oficial de la Spotify iFrame API (compartido con las
  // demás secciones: si ya está cargado o cargándose, no lo duplica, solo
  // se engancha al mismo callback).
  function cargarSpotifyApi() {
    if (window.SpotifyIframeApi) {
      crearController();
      return;
    }
    if (document.getElementById("spotify-iframe-api")) {
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
    // La revelación (letra + gráficos) se dispara siempre en el primer
    // click, sin depender de que Spotify ya haya terminado de cargar.
    revelar();

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
