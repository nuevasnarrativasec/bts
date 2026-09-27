/* ============================================================
   BTS · Deja tu mensaje (mural ARMY)
   - El formulario envía nombre / ciudad / mensaje a un Google
     Apps Script Web App, que los guarda en un Google Sheet con
     una columna "aprobado" para moderación editorial.
   - El botón "Ver mensajes" trae del mismo endpoint solo los
     mensajes marcados como aprobados y los muestra en un
     mini carrusel con flechas.

   ⚠️ CONFIGURACIÓN NECESARIA (una sola vez):
   Reemplaza ENDPOINT_URL por la URL de tu Web App de Apps
   Script (ver instrucciones que te compartí aparte).
   ============================================================ */
(function () {
  "use strict";

  var ENDPOINT_URL = "PEGA_AQUI_LA_URL_DE_TU_APPS_SCRIPT";

  var form = document.getElementById("mensajeForm");
  if (!form) return;

  var estado = document.getElementById("mensajeEstado");
  var enviarBtn = document.getElementById("mensajeEnviarBtn");
  var verBtn = document.getElementById("mensajeVerBtn");
  var mural = document.getElementById("mensajeMural");
  var cartaTexto = document.getElementById("mensajeCartaTexto");
  var cartaAutor = document.getElementById("mensajeCartaAutor");
  var flechaPrev = document.getElementById("mensajeFlechaPrev");
  var flechaNext = document.getElementById("mensajeFlechaNext");

  function endpointListo() {
    return ENDPOINT_URL && ENDPOINT_URL.indexOf("PEGA_AQUI") === -1;
  }

  /* --- Envío del formulario --- */
  form.addEventListener("submit", function (evt) {
    evt.preventDefault();

    estado.classList.remove("is-error");

    if (!endpointListo()) {
      estado.textContent = "Falta configurar el endpoint del formulario (revisa js/deja-tu-mensaje.js).";
      estado.classList.add("is-error");
      return;
    }

    var nombre = form.nombre.value.trim();
    var ciudad = form.ciudad.value.trim();
    var mensaje = form.mensaje.value.trim();

    if (!nombre || !ciudad || !mensaje) {
      estado.textContent = "Completa los tres campos antes de enviar.";
      estado.classList.add("is-error");
      return;
    }

    enviarBtn.disabled = true;
    enviarBtn.textContent = "Enviando…";
    estado.textContent = "";

    // Apps Script + fetch cross-origin: usamos "no-cors" y Content-Type
    // text/plain para evitar el preflight; no podemos leer la respuesta,
    // pero el POST sí llega y queda registrado en la hoja de cálculo.
    fetch(ENDPOINT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ nombre: nombre, ciudad: ciudad, mensaje: mensaje }),
    })
      .then(function () {
        form.reset();
        estado.textContent = "¡Gracias! Tu mensaje quedó registrado y será revisado antes de publicarse.";
      })
      .catch(function () {
        estado.textContent = "No se pudo enviar tu mensaje. Intenta de nuevo en unos minutos.";
        estado.classList.add("is-error");
      })
      .finally(function () {
        enviarBtn.disabled = false;
        enviarBtn.textContent = "Envía tu mensaje";
      });
  });

  /* --- Mural de mensajes aprobados --- */
  var mensajes = [];
  var indice = 0;

  function mostrarMensaje(i) {
    if (!mensajes.length) return;
    var m = mensajes[i];
    cartaTexto.textContent = "“" + m.mensaje + "”";
    cartaAutor.textContent = m.nombre + (m.ciudad ? " de " + m.ciudad : "");
  }

  function cargarMensajes() {
    if (!endpointListo()) {
      cartaTexto.textContent = "Aún no hay mensajes publicados.";
      cartaAutor.textContent = "";
      return;
    }
    cartaTexto.textContent = "Cargando mensajes de ARMY…";
    cartaAutor.textContent = "";

    fetch(ENDPOINT_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        mensajes = Array.isArray(data) ? data : [];
        indice = 0;
        if (!mensajes.length) {
          cartaTexto.textContent = "Aún no hay mensajes publicados.";
          cartaAutor.textContent = "";
          return;
        }
        mostrarMensaje(indice);
      })
      .catch(function () {
        cartaTexto.textContent = "No se pudieron cargar los mensajes.";
        cartaAutor.textContent = "";
      });
  }

  if (verBtn) {
    verBtn.addEventListener("click", function () {
      var abierto = !mural.hidden;
      if (abierto) {
        mural.hidden = true;
        verBtn.textContent = "Ver mensajes";
        return;
      }
      mural.hidden = false;
      verBtn.textContent = "Ocultar mensajes";
      if (!mensajes.length) cargarMensajes();
      mural.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (flechaPrev) {
    flechaPrev.addEventListener("click", function () {
      if (!mensajes.length) return;
      indice = (indice - 1 + mensajes.length) % mensajes.length;
      mostrarMensaje(indice);
    });
  }
  if (flechaNext) {
    flechaNext.addEventListener("click", function () {
      if (!mensajes.length) return;
      indice = (indice + 1) % mensajes.length;
      mostrarMensaje(indice);
    });
  }
})();
