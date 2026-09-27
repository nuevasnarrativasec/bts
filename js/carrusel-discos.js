/* ============================================================
   BTS · Carrusel horizontal de discos con embeds de Spotify
   - Un solo audio reproduciéndose a la vez (no se solapan).
   - Si el usuario sale de la sección (viewport), se pausa el audio activo.
   - Usa la Spotify iFrame API (misma que animacion-1.js / animacion-2.js,
     comparte el mismo <script id="spotify-iframe-api">) para que el botón
     verde reproduzca de una la canción al presionarlo.
     Dos detalles importantes para que el autoplay funcione de verdad:
       1) La API se pide ya mismo, al cargar la página, NO recién en el
          primer click. Si se pide en el click, el play() llega mucho
          después de terminado el gesto del usuario y el navegador lo
          ignora (por eso el CTA de "Whalien 52" sí funciona: esa API
          arranca a cargar desde el inicio).
       2) El play() se dispara en el evento "ready" del controlador, no
          apenas se crea (crearlo no significa que ya esté listo).
     Docs: https://developer.spotify.com/documentation/embeds/tutorials/using-the-iframe-api
   ============================================================ */
(function () {
  "use strict";

  const wrapper = document.getElementById("scrollDiscos");
  if (!wrapper) return;

  // En móvil (mismo corte que el CSS: max-width 560px) cada "página" trae
  // un solo disco, para que cada swipe / click de flecha muestre una sola
  // portada a la vez, en vez de varias apretadas en una fila.
  const esMobile =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 560px)").matches;
  const porPagina = esMobile ? 1 : parseInt(wrapper.dataset.perPage || "6", 10);

  // Agrupa los .disco-item (tal como se van duplicando en el HTML) en
  // bloques de "porPagina" dentro de .discos-page, para que el scroll
  // horizontal avance de grupo en grupo en vez de disco por disco.
  function agruparEnPaginas() {
    const sueltos = Array.from(wrapper.children).filter((el) =>
      el.classList.contains("disco-item")
    );
    if (!sueltos.length) return;

    const paginas = [];
    for (let i = 0; i < sueltos.length; i += porPagina) {
      const pagina = document.createElement("div");
      pagina.className = "discos-page";
      sueltos.slice(i, i + porPagina).forEach((item) => pagina.appendChild(item));
      paginas.push(pagina);
    }

    wrapper.innerHTML = "";
    paginas.forEach((pagina) => wrapper.appendChild(pagina));
  }

  agruparEnPaginas();

  // --- Navegación con flechas laterales ---
  const arrowPrev = document.querySelector(".carousel-arrow--prev");
  const arrowNext = document.querySelector(".carousel-arrow--next");

  function paginas() {
    return Array.from(wrapper.querySelectorAll(".discos-page"));
  }

  // Determina qué página está actualmente visible según el scroll actual.
  function paginaActualIndex() {
    const pages = paginas();
    if (!pages.length) return 0;
    const centro = wrapper.scrollLeft + wrapper.clientWidth / 2;
    let idx = 0;
    pages.forEach((pagina, i) => {
      if (pagina.offsetLeft <= centro) idx = i;
    });
    return idx;
  }

  function irAPagina(idx) {
    const pages = paginas();
    if (!pages.length) return;
    const clamped = Math.max(0, Math.min(idx, pages.length - 1));
    wrapper.scrollTo({ left: pages[clamped].offsetLeft, behavior: "smooth" });
  }

  // Deshabilita/oculta las flechas cuando ya no hay más hacia dónde ir.
  function actualizarFlechas() {
    if (!arrowPrev && !arrowNext) return;
    const pages = paginas();
    const soloUnaPagina = pages.length <= 1;

    if (arrowPrev) arrowPrev.hidden = soloUnaPagina;
    if (arrowNext) arrowNext.hidden = soloUnaPagina;
    if (soloUnaPagina) return;

    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth - 1;
    if (arrowPrev) arrowPrev.disabled = wrapper.scrollLeft <= 0;
    if (arrowNext) arrowNext.disabled = wrapper.scrollLeft >= maxScroll;
  }

  if (arrowPrev) {
    arrowPrev.addEventListener("click", () => irAPagina(paginaActualIndex() - 1));
  }
  if (arrowNext) {
    arrowNext.addEventListener("click", () => irAPagina(paginaActualIndex() + 1));
  }

  let flechaRaf = null;
  wrapper.addEventListener("scroll", () => {
    if (flechaRaf) return;
    flechaRaf = requestAnimationFrame(() => {
      actualizarFlechas();
      flechaRaf = null;
    });
  });
  window.addEventListener("resize", actualizarFlechas);

  actualizarFlechas();

  // --- Spotify iFrame API: compartida con animacion-1.js / animacion-2.js
  // (mismo <script id="spotify-iframe-api">, para no cargarla dos veces). ---
  function suscribirseASpotifyApi(callback) {
    if (window.SpotifyIframeApi) {
      callback(window.SpotifyIframeApi);
      return;
    }

    const anterior = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      window.SpotifyIframeApi = IFrameAPI;
      if (typeof anterior === "function") anterior(IFrameAPI);
      callback(IFrameAPI);
    };

    if (!document.getElementById("spotify-iframe-api")) {
      const script = document.createElement("script");
      script.id = "spotify-iframe-api";
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      document.head.appendChild(script);
    }
  }

  // La pedimos ya, apenas corre este script (no en el primer click): así,
  // para cuando el usuario llegue a hacer click, la API casi siempre ya
  // está lista y el play() sale al toque.
  suscribirseASpotifyApi(function () {});

  // Convierte la URL de embed (https://open.spotify.com/embed/album/ID?...)
  // en un URI de Spotify (spotify:album:ID) que acepta createController.
  function embedUrlAUri(src) {
    const match = /open\.spotify\.com\/embed\/([a-z]+)\/([a-zA-Z0-9]+)/.exec(src || "");
    if (!match) return null;
    return "spotify:" + match[1] + ":" + match[2];
  }

  const items = Array.from(wrapper.querySelectorAll(".disco-item"));
  let activeItem = null;

  function detener(item) {
    if (!item) return;
    const embedBox = item.querySelector(".disco-embed");
    const btn = item.querySelector(".btn-play");

    item._pendingPlay = false;

    if (item._spotifyController) {
      item._spotifyController.pause();
    }

    embedBox.classList.remove("is-active");
    btn.classList.remove("is-playing");
    btn.setAttribute("aria-label", "Reproducir");

    if (activeItem === item) activeItem = null;
  }

  function reproducir(item) {
    const uri = embedUrlAUri(item.dataset.embed);
    if (!uri) return;

    // Si hay otro disco sonando, se detiene primero (nunca se solapan).
    if (activeItem && activeItem !== item) detener(activeItem);

    const embedBox = item.querySelector(".disco-embed");
    const btn = item.querySelector(".btn-play");

    embedBox.classList.add("is-active");
    btn.classList.add("is-playing");
    btn.setAttribute("aria-label", "Pausar");
    activeItem = item;
    item._pendingPlay = true;

    // Si ya existe el controlador (se reprodujo antes), solo hay que
    // reanudar: esto sí cuenta como reproducción inmediata.
    if (item._spotifyController) {
      item._spotifyController.play();
      return;
    }

    // El controller ya se pidió antes (p. ej. el usuario dio doble click
    // rápido); no volver a pedirlo, con marcar _pendingPlay alcanza.
    if (item._creandoController) return;
    item._creandoController = true;

    let target = embedBox.querySelector(".disco-embed-target");
    if (!target) {
      target = document.createElement("div");
      target.className = "disco-embed-target";
      embedBox.appendChild(target);
    }

    suscribirseASpotifyApi((IFrameAPI) => {
      IFrameAPI.createController(
        target,
        { uri: uri, width: "100%", height: "152" },
        (EmbedController) => {
          item._spotifyController = EmbedController;

          // Crear el controller no significa que ya esté listo para
          // recibir play(): hay que esperar a "ready".
          EmbedController.addListener("ready", () => {
            if (item._pendingPlay) EmbedController.play();
          });

          // Mantiene el ícono sincronizado si el usuario pausa/reanuda
          // desde los controles propios del reproductor de Spotify.
          EmbedController.addListener("playback_update", (e) => {
            const pausado = !!(e && e.data && e.data.isPaused);
            btn.classList.toggle("is-playing", !pausado);
            btn.setAttribute("aria-label", pausado ? "Reproducir" : "Pausar");
          });
        }
      );
    });
  }

  items.forEach((item) => {
    const btn = item.querySelector(".btn-play");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (activeItem === item) {
        detener(item);
      } else {
        reproducir(item);
      }
    });
  });

  // Pausa el audio activo si la sección de discos sale del viewport.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && activeItem) {
            detener(activeItem);
          }
        });
      },
      { threshold: 0 }
    );
    observer.observe(wrapper);
  }
})();
