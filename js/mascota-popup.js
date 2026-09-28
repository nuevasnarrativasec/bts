(function () {
  "use strict";

  var mascotas = document.querySelectorAll(".crono-mascota[data-dato-texto]");
  var ctn = document.getElementById("ctnMascotaPopup");
  if (!mascotas.length || !ctn) return;

  var overlay = document.getElementById("mascotaPopupOverlay");
  var btnClose = document.getElementById("mascotaPopupClose");
  var imgMascota = document.getElementById("mascotaPopupImg");
  var elTitulo = document.getElementById("mascotaPopupTitulo");
  var elCuerpo = document.getElementById("mascotaPopupCuerpo");

  var ultimoFoco = null;

  function abrir(mascotaEl) {
    imgMascota.src = mascotaEl.getAttribute("src");
    imgMascota.alt = mascotaEl.getAttribute("data-dato-titulo") || "";
    elTitulo.textContent = mascotaEl.getAttribute("data-dato-titulo") || "";
    elCuerpo.textContent = " " + (mascotaEl.getAttribute("data-dato-texto") || "");

    ultimoFoco = document.activeElement;
    ctn.hidden = false;
    ctn.setAttribute("aria-hidden", "false");
    document.body.classList.add("mascota-popup-abierto");
    btnClose.focus();
  }

  function cerrar() {
    ctn.hidden = true;
    ctn.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mascota-popup-abierto");
    if (ultimoFoco && typeof ultimoFoco.focus === "function") {
      ultimoFoco.focus();
    }
  }

  mascotas.forEach(function (mascota) {
    mascota.style.cursor = "pointer";
    mascota.setAttribute("role", "button");
    mascota.setAttribute("tabindex", "0");
    mascota.addEventListener("click", function () {
      abrir(mascota);
    });
    mascota.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir(mascota);
      }
    });
  });

  if (overlay) overlay.addEventListener("click", cerrar);
  if (btnClose) btnClose.addEventListener("click", cerrar);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !ctn.hidden) cerrar();
  });
})();
