/* ============================================================
   BTS · Deja tu mensaje (mural ARMY)
   - El formulario envía nombre (apellidos y nombres) / mensaje (para
     el mural público) y además DNI / celular / correo (datos de
     contacto para un sorteo posterior, nunca expuestos en el mural) a
     un Google Apps Script Web App, que guarda todo en una misma fila
     del Google Sheet, con una columna "aprobado" para moderación
     editorial del mensaje.
   - El botón "Ver mensajes" trae del mismo endpoint solo nombre y
     mensaje de los registros marcados como aprobados (el endpoint
     nunca devuelve DNI/correo/celular) y los muestra en un mini
     carrusel con flechas.

   ⚠️ CONFIGURACIÓN NECESARIA (una sola vez):
   Reemplaza ENDPOINT_URL por la URL de tu Web App de Apps
   Script (ver instrucciones que te compartí aparte).
   ============================================================ */
(function () {
  "use strict";

  var ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbw06J1KV_72elekLd2VZST8TrYZWxmTZNG1kH6JKBtPukiEWu-sOEJTX6Q5Zx_2_J4fcg/exec";

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

  var DNI_RE = /^[0-9]{8}$/;
  var CELULAR_RE = /^[0-9]{9}$/;
  var CORREO_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    var mensaje = form.mensaje.value.trim();
    var dni = form.dni.value.trim();
    var correo = form.correo.value.trim();
    var celular = form.celular.value.trim();

    if (!nombre || !mensaje || !dni || !correo || !celular) {
      estado.textContent = "Completa todos los campos antes de enviar.";
      estado.classList.add("is-error");
      return;
    }
    if (!DNI_RE.test(dni)) {
      estado.textContent = "El DNI debe tener 8 dígitos.";
      estado.classList.add("is-error");
      return;
    }
    if (!CORREO_RE.test(correo)) {
      estado.textContent = "Ingresa un correo válido.";
      estado.classList.add("is-error");
      return;
    }
    if (!CELULAR_RE.test(celular)) {
      estado.textContent = "El celular debe tener 9 dígitos.";
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
      body: JSON.stringify({
        nombre: nombre,
        mensaje: mensaje,
        dni: dni,
        correo: correo,
        celular: celular,
      }),
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
    cartaAutor.textContent = m.nombre;
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

  /* --- Botón "i" del mural: qué es BT21 ---
     El hover ya muestra el tooltip en escritorio (ver .mural-info en
     css/styles.css); este click suma soporte táctil para que también
     se pueda abrir/cerrar con un tap en celular. */
  var muralInfo = mural ? mural.querySelector(".mural-info") : null;
  if (muralInfo) {
    muralInfo.addEventListener("click", function (evt) {
      evt.stopPropagation();
      muralInfo.classList.toggle("is-open");
    });
    document.addEventListener("click", function () {
      muralInfo.classList.remove("is-open");
    });
  }
})();
