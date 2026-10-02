/* ============================================================
   BTS · Popup "¿Cómo hicimos este análisis?" (footer)
   El botón .box-metodologia abre un popup con el texto completo de
   metodología; se cierra con el overlay, el botón de cerrar o Escape.
   ============================================================ */
(function () {
  "use strict";

  var btn = document.getElementById("btnMetodologia");
  var ctn = document.getElementById("ctnMetodologiaPopup");
  if (!btn || !ctn) return;

  var overlay = document.getElementById("metodologiaPopupOverlay");
  var btnClose = document.getElementById("metodologiaPopupClose");

  function abrir() {
    ctn.hidden = false;
    ctn.setAttribute("aria-hidden", "false");
    document.body.classList.add("metodologia-popup-abierto");
  }

  function cerrar() {
    ctn.hidden = true;
    ctn.setAttribute("aria-hidden", "true");
    document.body.classList.remove("metodologia-popup-abierto");
  }

  btn.addEventListener("click", abrir);
  if (overlay) overlay.addEventListener("click", cerrar);
  if (btnClose) btnClose.addEventListener("click", cerrar);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !ctn.hidden) cerrar();
  });
})();
