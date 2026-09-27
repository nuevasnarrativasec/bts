/* ============================================================
   BTS · "¿Cómo lo medimos?" (ul.medida)
   - En escritorio el CSS ya muestra los 3 ítems en línea y las
     flechas quedan ocultas (no hacen falta).
   - En móvil (≤560px) se vuelve un carrusel de a un ítem: este
     script mueve el scroll con las flechas (misma lógica que las
     flechas de carrusel-discos.js). El arrastre con el dedo/mouse
     ya lo cubre cronologia-drag.js vía la clase "js-drag-scroll".
   ============================================================ */
(function () {
  "use strict";

  const wrapper = document.getElementById("scrollMedida");
  if (!wrapper) return;

  const carrusel = wrapper.closest(".carousel-medida");
  const arrowPrev = carrusel && carrusel.querySelector(".carousel-arrow--prev");
  const arrowNext = carrusel && carrusel.querySelector(".carousel-arrow--next");
  if (!arrowPrev && !arrowNext) return;

  function items() {
    return Array.from(wrapper.children).filter((el) => el.tagName === "LI");
  }

  // Determina qué ítem está actualmente más visible según el scroll actual.
  function indiceActual() {
    const els = items();
    if (!els.length) return 0;
    const centro = wrapper.scrollLeft + wrapper.clientWidth / 2;
    let idx = 0;
    els.forEach((el, i) => {
      if (el.offsetLeft <= centro) idx = i;
    });
    return idx;
  }

  function irAIndice(idx) {
    const els = items();
    if (!els.length) return;
    const clamped = Math.max(0, Math.min(idx, els.length - 1));
    wrapper.scrollTo({ left: els[clamped].offsetLeft, behavior: "smooth" });
  }

  // Deshabilita/oculta las flechas cuando ya no hay más hacia dónde ir
  // (o si el carrusel no está activo, por ejemplo en escritorio donde
  // los 3 ítems entran sin necesidad de scroll).
  function actualizarFlechas() {
    const els = items();
    const sinScrollNecesario = wrapper.scrollWidth <= wrapper.clientWidth + 1;

    if (arrowPrev) arrowPrev.hidden = els.length <= 1 || sinScrollNecesario;
    if (arrowNext) arrowNext.hidden = els.length <= 1 || sinScrollNecesario;
    if (sinScrollNecesario) return;

    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth - 1;
    if (arrowPrev) arrowPrev.disabled = wrapper.scrollLeft <= 0;
    if (arrowNext) arrowNext.disabled = wrapper.scrollLeft >= maxScroll;
  }

  if (arrowPrev) {
    arrowPrev.addEventListener("click", () => irAIndice(indiceActual() - 1));
  }
  if (arrowNext) {
    arrowNext.addEventListener("click", () => irAIndice(indiceActual() + 1));
  }

  let raf = null;
  wrapper.addEventListener("scroll", () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      actualizarFlechas();
      raf = null;
    });
  });
  window.addEventListener("resize", actualizarFlechas);

  actualizarFlechas();
})();
