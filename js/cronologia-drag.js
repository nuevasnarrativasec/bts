/* ============================================================
   BTS · Secciones horizontales — arrastrar con el mouse para scrollear
   (además del swipe táctil y el scroll nativo, que siguen funcionando).
   Se engancha a cualquier elemento con la clase "js-drag-scroll"
   (por ejemplo #cronoWrap y #momentosWrap).
   ============================================================ */
(function () {
  "use strict";

  const wraps = document.querySelectorAll(".js-drag-scroll");
  if (!wraps.length) return;

  const DRAG_THRESHOLD = 8; // px de tolerancia antes de considerarlo "arrastre" real

  wraps.forEach((wrap) => {
    let isDown = false;
    let isDragScroll = false; // solo true si el wrap realmente tiene overflow que scrollear
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    function canScroll() {
      // Si el contenido no desborda, no hay nada que arrastrar: dejamos
      // pasar el click normal (por ejemplo, los perfil-avatar-btn) sin
      // activar la lógica de "arrastre", que de lo contrario podría
      // bloquear el click por un mínimo jitter del mouse.
      return wrap.scrollWidth > wrap.clientWidth + 1;
    }

    function onPointerDown(e) {
      // Solo botón izquierdo del mouse (los dedos táctiles ya funcionan con scroll nativo)
      if (e.pointerType === "mouse" && e.button !== 0) return;

      // Si el gesto arranca sobre un control interactivo (por ejemplo el
      // .btn-play de un disco, o el CTA de Spotify), el drag-scroll ni
      // siquiera se activa para este gesto: así un click/tap sobre ese
      // control nunca puede confundirse con un arrastre ni quedar
      // bloqueado por el listener de "click" de más abajo. El drag sigue
      // funcionando normalmente si el gesto arranca en cualquier otro
      // punto del carrusel (la portada, el espacio vacío, etc.).
      if (e.target.closest("button, a, input, textarea, select, [data-no-drag]")) return;

      isDragScroll = canScroll();
      if (!isDragScroll) return;

      isDown = true;
      moved = false;
      startX = e.clientX;
      startScroll = wrap.scrollLeft;
      wrap.classList.add("is-dragging");
      wrap.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e) {
      if (!isDown || !isDragScroll) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > DRAG_THRESHOLD) moved = true;
      wrap.scrollLeft = startScroll - dx;
    }

    function onPointerUp(e) {
      if (!isDown) return;
      isDown = false;
      wrap.classList.remove("is-dragging");
      try {
        wrap.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerup", onPointerUp);
    wrap.addEventListener("pointerleave", onPointerUp);
    wrap.addEventListener("pointercancel", onPointerUp);

    // Evita que un arrastre real termine disparando un click no deseado
    // sobre algún elemento interno (por ejemplo, los perfil-avatar-btn).
    // Solo bloquea el click cuando efectivamente hubo un arrastre con
    // desplazamiento (isDragScroll + moved); un click normal nunca llega
    // a activar esta rama.
    wrap.addEventListener(
      "click",
      (e) => {
        if (isDragScroll && moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );
  });

  /* --- Mascotas (box-cronologia, box-comunidad, ...): entran deslizando
     de izquierda a derecha (ease) cada vez que su sección aparece en
     pantalla, y se revierten (vuelven a su posición inicial) si el
     usuario sale de la sección, para que la animación se repita al
     volver a entrar. --- */
  const mascotas = document.querySelectorAll(".crono-mascota");
  if (mascotas.length) {
    if ("IntersectionObserver" in window) {
      mascotas.forEach((mascota) => {
        const mascotaObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              mascota.classList.toggle("is-visible", entry.isIntersecting);
            });
          },
          { threshold: 0.3 }
        );
        mascotaObserver.observe(mascota.parentElement || mascota);
      });
    } else {
      mascotas.forEach((mascota) => mascota.classList.add("is-visible"));
    }
  }
})();
