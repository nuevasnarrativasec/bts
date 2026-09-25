/* ============================================================
   BTS · Carrusel horizontal de discos con embeds de Spotify
   - Un solo audio reproduciéndose a la vez (no se solapan).
   - Si el usuario sale de la sección (viewport), se pausa el audio activo.
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

  const items = Array.from(wrapper.querySelectorAll(".disco-item"));
  let activeItem = null;

  function detener(item) {
    if (!item) return;
    const embedBox = item.querySelector(".disco-embed");
    const btn = item.querySelector(".btn-play");

    // Quitar el iframe por completo es la forma más segura de cortar el audio
    // (no todos los reproductores embebidos responden a postMessage/pause).
    embedBox.innerHTML = "";
    embedBox.classList.remove("is-active");

    btn.classList.remove("is-playing");
    btn.setAttribute("aria-label", "Reproducir");

    if (activeItem === item) activeItem = null;
  }

  function reproducir(item) {
    const src = item.dataset.embed;
    if (!src) return;

    // Si hay otro disco sonando, se detiene primero (nunca se solapan).
    if (activeItem && activeItem !== item) detener(activeItem);

    const embedBox = item.querySelector(".disco-embed");
    const btn = item.querySelector(".btn-play");

    const iframe = document.createElement("iframe");
    iframe.src = src + (src.includes("?") ? "&" : "?") + "autoplay=1";
    iframe.height = "152";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.loading = "lazy";
    iframe.title = "Reproductor de Spotify";

    embedBox.innerHTML = "";
    embedBox.appendChild(iframe);
    embedBox.classList.add("is-active");

    btn.classList.add("is-playing");
    btn.setAttribute("aria-label", "Pausar");

    activeItem = item;
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
