/* ============================================================
   BTS · Carrusel horizontal de discos con embeds de Spotify
   - Un solo audio reproduciéndose a la vez (no se solapan).
   - Si el usuario sale de la sección (viewport), se pausa el audio activo.
   - Usa la Spotify iFrame API para que el botón verde reproduzca
     la canción automáticamente al presionarlo (el parámetro de URL
     "autoplay=1" no es fiable y Spotify suele ignorarlo).
   ============================================================ */
(function () {
  "use strict";

  const wrapper = document.getElementById("scrollDiscos");
  if (!wrapper) return;

  const porPagina = parseInt(wrapper.dataset.perPage || "6", 10);

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

  // --- Carga perezosa (una sola vez) de la Spotify iFrame API ---
  // https://developer.spotify.com/documentation/embeds/references/iframe-api
  // Si por lo que sea no llega a cargar (bloqueador de anuncios, extensión
  // de privacidad, sin conexión al dominio de Spotify, etc.) la promesa se
  // rechaza para que reproducir() pueda caer al iframe clásico y el
  // reproductor no se quede vacío.
  let spotifyApiPromise = null;
  function cargarSpotifyIframeApi() {
    if (spotifyApiPromise) return spotifyApiPromise;

    spotifyApiPromise = new Promise((resolve, reject) => {
      if (window.__spotifyIFrameAPI) {
        resolve(window.__spotifyIFrameAPI);
        return;
      }

      let resuelto = false;
      const listoAntes = window.onSpotifyIframeApiReady;
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        resuelto = true;
        window.__spotifyIFrameAPI = IFrameAPI;
        if (typeof listoAntes === "function") listoAntes(IFrameAPI);
        resolve(IFrameAPI);
      };

      if (!document.querySelector('script[src*="open.spotify.com/embed/iframe-api"]')) {
        const script = document.createElement("script");
        script.src = "https://open.spotify.com/embed/iframe-api/v1";
        script.async = true;
        script.onerror = () => {
          if (!resuelto) reject(new Error("No se pudo cargar la Spotify iFrame API"));
        };
        document.head.appendChild(script);
      }

      // Si en unos segundos no respondió (bloqueada, red lenta, etc.),
      // no dejamos el botón colgado: se cae al iframe clásico.
      window.setTimeout(() => {
        if (!resuelto) reject(new Error("Timeout cargando la Spotify iFrame API"));
      }, 4000);
    });

    return spotifyApiPromise;
  }

  // Respaldo: iframe clásico de Spotify (el que había antes), por si la
  // iFrame API no está disponible. No garantiza autoplay en todos los
  // navegadores, pero al menos muestra el reproductor.
  function crearIframeClasico(target, src) {
    const iframe = document.createElement("iframe");
    iframe.src = src + (src.includes("?") ? "&" : "?") + "autoplay=1";
    iframe.height = "152";
    iframe.allow =
      "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.loading = "lazy";
    iframe.title = "Reproductor de Spotify";
    target.innerHTML = "";
    target.appendChild(iframe);
  }

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
    const target = embedBox.querySelector(".disco-embed-target");

    if (item._spotifyController) {
      item._spotifyController.pause();
    } else if (target) {
      // Modo de respaldo (iframe clásico): quitarlo es la forma más segura
      // de cortar el audio, ya que no todos los reproductores embebidos
      // responden a postMessage/pause.
      target.innerHTML = "";
    }

    embedBox.classList.remove("is-active");
    btn.classList.remove("is-playing");
    btn.setAttribute("aria-label", "Reproducir");

    if (activeItem === item) activeItem = null;
  }

  function reproducir(item) {
    const src = item.dataset.embed;
    const uri = embedUrlAUri(src);

    // Si hay otro disco sonando, se detiene primero (nunca se solapan).
    if (activeItem && activeItem !== item) detener(activeItem);

    const embedBox = item.querySelector(".disco-embed");
    const btn = item.querySelector(".btn-play");

    embedBox.classList.add("is-active");
    btn.classList.add("is-playing");
    btn.setAttribute("aria-label", "Pausar");
    activeItem = item;

    // Si ya existe el controlador (se reprodujo antes), solo hay que
    // reanudar: esto sí cuenta como reproducción inmediata.
    if (item._spotifyController) {
      item._spotifyController.play();
      return;
    }

    let target = embedBox.querySelector(".disco-embed-target");
    if (!target) {
      target = document.createElement("div");
      target.className = "disco-embed-target";
      embedBox.appendChild(target);
    }

    if (!uri || !src) return;

    cargarSpotifyIframeApi()
      .then((IFrameAPI) => {
        // El usuario pudo haber pausado o cambiado de disco mientras
        // cargaba la API: no reproducir algo que ya no corresponde.
        if (activeItem !== item) return;

        IFrameAPI.createController(
          target,
          { uri: uri, width: "100%", height: "152" },
          (EmbedController) => {
            item._spotifyController = EmbedController;
            if (activeItem === item) EmbedController.play();
          }
        );
      })
      .catch(() => {
        // La API de Spotify no cargó (bloqueada, sin red, etc.): al menos
        // dejamos el reproductor clásico visible en vez de nada.
        if (activeItem !== item) return;
        crearIframeClasico(target, src);
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
