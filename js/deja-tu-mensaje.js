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

  var ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbzeXjA7wraTY4E9bhauHfNdub-wI_kuVWxdXHy4fowPu-naUon99F7cenXVgzzGW2XLjw/exec";

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

  /* --- Mural de mensajes aprobados ---
     Apps Script es lento respondiendo (1-3s en frío, a veces más),
     así que para que "Ver mensajes" se sienta instantáneo:
     1) precargamos en segundo plano apenas carga la página, y
     2) guardamos el resultado en localStorage (5 min) para que
        una segunda visita/click muestre los mensajes al toque
        mientras se revalida en segundo plano.
  */
  var CACHE_KEY = "btsMensajesAprobados";
  var CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

  var mensajes = [];
  var indice = 0;
  var cargando = false;

  function leerCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.mensajes)) return null;
      return parsed;
    } catch (err) {
      return null;
    }
  }

  function guardarCache(lista) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ mensajes: lista, ts: Date.now() }));
    } catch (err) {
      // localStorage puede fallar (modo privado, cuota, etc.): no es crítico.
    }
  }

  function mostrarMensaje(i) {
    if (!mensajes.length) return;
    var m = mensajes[i];
    cartaTexto.textContent = "“" + m.mensaje + "”";
    cartaAutor.textContent = m.nombre + (m.ciudad ? " de " + m.ciudad : "");
  }

  function mostrarSinMensajes(texto) {
    mensajes = [];
    indice = 0;
    cartaTexto.textContent = texto;
    cartaAutor.textContent = "";
  }

  // fondo = true: no pisar lo que ya se está viendo si la petición falla
  // ni mostrar "Cargando…" (se usa para la precarga silenciosa al inicio).
  function cargarMensajes(fondo) {
    if (!endpointListo()) {
      if (!fondo) mostrarSinMensajes("Aún no hay mensajes publicados.");
      return;
    }
    if (cargando) return;
    cargando = true;

    if (!fondo && !mensajes.length) {
      cartaTexto.textContent = "Cargando mensajes de ARMY…";
      cartaAutor.textContent = "";
    }

    fetch(ENDPOINT_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var lista = Array.isArray(data) ? data : [];
        guardarCache(lista);
        mensajes = lista;
        indice = 0;
        if (!mensajes.length) {
          mostrarSinMensajes("Aún no hay mensajes publicados.");
          return;
        }
        mostrarMensaje(indice);
      })
      .catch(function () {
        if (!mensajes.length) mostrarSinMensajes("No se pudieron cargar los mensajes.");
      })
      .finally(function () {
        cargando = false;
      });
  }

  // Precarga silenciosa al cargar la página: si hay caché reciente la
  // usamos de inmediato (para que "Ver mensajes" se sienta instantáneo)
  // y de todas formas revalidamos contra el endpoint en segundo plano.
  (function precargar() {
    var cache = leerCache();
    if (cache && cache.mensajes.length && Date.now() - cache.ts < CACHE_TTL_MS) {
      mensajes = cache.mensajes;
      indice = 0;
      mostrarMensaje(indice);
    }
    cargarMensajes(true);
  })();

  if (verBtn) {
    // Solo muestra el mural y hace scroll suave hacia él; no lo oculta
    // de nuevo ni cambia el texto del botón a "Ocultar mensajes".
    verBtn.addEventListener("click", function () {
      mural.hidden = false;
      if (!mensajes.length) cargarMensajes(false);
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
