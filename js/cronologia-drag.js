/* ============================================================
   BTS · Cronología horizontal — arrastrar con el mouse para scrollear
   (además del swipe táctil y el scroll nativo, que siguen funcionando).
   ============================================================ */
(function () {
  "use strict";

  const wrap = document.getElementById("cronoWrap");
  if (!wrap) return;

  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;

  function onPointerDown(e) {
    // Solo botón izquierdo del mouse (los dedos táctiles ya funcionan con scroll nativo)
    if (e.pointerType === "mouse" && e.button !== 0) return;

    isDown = true;
    moved = false;
    startX = e.clientX;
    startScroll = wrap.scrollLeft;
    wrap.classList.add("is-dragging");
    wrap.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) moved = true;
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

  // Evita que un arrastre termine disparando un click no deseado
  // sobre algún elemento interno (por ahora no hay enlaces, pero es defensivo).
  wrap.addEventListener(
    "click",
    (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );
})();
