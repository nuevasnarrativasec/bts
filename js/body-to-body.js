/* ============================================================
   BTS · ctn-body-to-body ("Body to body")
   - El botón verde solo controla la reproducción de audio, vía la
     Spotify iFrame API (misma API que main-animacion-1 /
     main-animacion-2 / el carrusel de discos; comparten el mismo
     <script id="spotify-iframe-api">, así que no se carga dos veces).
   - La letra de cada estrofa se pinta entera desde que carga la
     página, en un color suave/translúcido (cada letra queda en su
     propio <span class="k-char">). La revelación (letra "iluminándose"
     letra por letra como en un karaoke, primero la estrofa 1 y, al
     terminar, la estrofa 2 — en paralelo a los 3 elementos gráficos
     cayendo desde arriba, clase "is-visible" en cada
     [data-bodytobody-item]) ya NO depende del botón: se dispara sola
     apenas la sección entra en el viewport (IntersectionObserver) y
     ocurre una sola vez, sin relación con reproducir/pausar el audio.
   ============================================================ */
(function () {
  "use strict";

  const seccion = document.getElementById("ctnBodyToBody");
  if (!seccion) return;

  const btn = document.getElementById("bodyToBodyPlayBtn");
  const hint = document.getElementById("bodyToBodyHint");
  const embedEl = document.getElementById("bodyToBodyEmbed");
  const items = Array.from(seccion.querySelectorAll("[data-bodytobody-item]"));
  const lyric2 = document.getElementById("bodyToBodyLyric1");
  const lyric1 = document.getElementById("bodyToBodyLyric2");

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

  /* --- Efecto karaoke: separa el texto en <span class="k-char">
     (uno por carácter) ya visibles en un color suave; "pintarKaraoke"
     solo va agregando la clase "is-lit" letra por letra, y el color
     pleno de esa letra se anima por transición CSS. --- */
  function prepararKaraoke(el) {
    if (!el) return [];
    const texto = el.dataset.texto || "";
    el.textContent = "";

    const spans = [];
    for (let i = 0; i < texto.length; i += 1) {
      const span = document.createElement("span");
      span.className = "k-char";
      span.textContent = texto[i];
      el.appendChild(span);
      spans.push(span);
    }
    return spans;
  }

  function pintarKaraoke(spans, msPorLetra, alTerminar) {
    if (!spans.length) {
      if (typeof alTerminar === "function") alTerminar();
      return;
    }

    let i = 0;
    const intervalo = window.setInterval(() => {
      spans[i].classList.add("is-lit");
      i += 1;
      if (i >= spans.length) {
        window.clearInterval(intervalo);
        if (typeof alTerminar === "function") alTerminar();
      }
    }, msPorLetra);
  }

  // El texto en su color suave se prepara ya, al cargar la página (no
  // hay que esperar al play para que se vea la letra completa).
  const lyric1Spans = prepararKaraoke(lyric1);
  const lyric2Spans = prepararKaraoke(lyric2);

  function revelar() {
    if (yaRevelado) return;
    yaRevelado = true;

    // Los elementos gráficos caen uno tras otro (no todos de golpe):
    // cada uno se revela con su propio setTimeout, apenas empieza a
    // pintarse la letra.
    const RETRASO_ENTRE_ITEMS = 550; // ms entre la caída de un elemento y el siguiente
    items.forEach((item, i) => {
      window.setTimeout(() => {
        item.classList.add("is-visible");
      }, i * RETRASO_ENTRE_ITEMS);
    });

    pintarKaraoke(lyric1Spans, 30, () => {
      pintarKaraoke(lyric2Spans, 30);
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
    if (hint) hint.classList.add("is-hidden");

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

  // La revelación (letra + gráficos) ya no depende del click en play:
  // se dispara sola apenas la sección entra en pantalla ("yaRevelado"
  // en revelar() asegura que ocurra una sola vez). En el mismo observer
  // se sigue pausando el track si la sección sale del viewport.
  if ("IntersectionObserver" in window) {
    const seccionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revelar();
          } else if (controller && !isPaused) {
            controller.pause();
          }
        });
      },
      { threshold: 0.2 }
    );
    seccionObserver.observe(seccion);
  } else {
    revelar();
  }
})();
