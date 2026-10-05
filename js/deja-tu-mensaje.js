/* ============================================================
   BTS · Deja tu mensaje (mural ARMY)
   - El formulario envía nombre (apellidos y nombres), país o ciudad y
     mensaje a un Google Apps Script Web App, que guarda todo en una
     fila del Google Sheet, con una columna "aprobado" para moderación
     editorial del mensaje.
   - El botón "Ver mensajes" trae del mismo endpoint los registros
     marcados como aprobados (nombre, país/ciudad y mensaje) y los
     muestra en una lista vertical con scroll propio, el más reciente
     primero.

   ⚠️ CONFIGURACIÓN NECESARIA (una sola vez):
   Reemplaza ENDPOINT_URL por la URL de tu Web App de Apps
   Script (ver instrucciones que te compartí aparte).
   ============================================================ */
(function () {
  "use strict";

  var ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbwoFZEGu6Uh2RtNcsLtHFlVO3QUuk84sfCUjmKJRGZ9daD4SyaGo155L0CYHvMhfbPOrA/exec";

  var form = document.getElementById("mensajeForm");
  if (!form) return;

  var estado = document.getElementById("mensajeEstado");
  var enviarBtn = document.getElementById("mensajeEnviarBtn");
  var verBtn = document.getElementById("mensajeVerBtn");
  var mural = document.getElementById("mensajeMural");
  var lista = document.getElementById("mensajeLista");
  var scrollTip = document.getElementById("mensajeScrollTip");
  var linkComercio = document.getElementById("mensajeComercioLink");
  var btnAclaracion = document.getElementById("mensajeAclaracion");
  var ctnAclaracionPopup = document.getElementById("ctnAclaracionPopup");
  var aclaracionOverlay = document.getElementById("aclaracionPopupOverlay");
  var aclaracionClose = document.getElementById("aclaracionPopupClose");

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
    var pais = form.pais.value.trim();
    var mensaje = form.mensaje.value.trim();

    if (!nombre || !pais || !mensaje) {
      estado.textContent = "Completa todos los campos antes de enviar.";
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
        pais: pais,
        mensaje: mensaje,
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
  var cargando = false;
  var scrollTipOculto = false;

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

  function guardarCache(listaMensajes) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ mensajes: listaMensajes, ts: Date.now() }));
    } catch (err) {
      // localStorage puede fallar (modo privado, cuota, etc.): no es crítico.
    }
  }

  // El aviso "Desliza para ver más mensajes" solo tiene sentido si la
  // lista realmente desborda su alto visible, y se oculta para siempre
  // en esta sesión en cuanto el usuario hace scroll una vez.
  function actualizarScrollTip() {
    if (!scrollTip) return;
    if (scrollTipOculto) {
      scrollTip.classList.add("is-oculto");
      return;
    }
    var hayOverflow = lista.scrollHeight > lista.clientHeight + 4;
    scrollTip.classList.toggle("is-oculto", !hayOverflow);
  }

  if (lista) {
    lista.addEventListener("scroll", function () {
      if (scrollTipOculto) return;
      scrollTipOculto = true;
      actualizarScrollTip();
    });
  }

  function renderMensajes() {
    if (!lista) return;
    lista.innerHTML = "";
    var frag = document.createDocumentFragment();
    mensajes.forEach(function (m) {
      var carta = document.createElement("div");
      carta.className = "mensaje-carta";

      var texto = document.createElement("p");
      texto.className = "mensaje-carta-texto";
      texto.textContent = "“" + m.mensaje + "”";

      var autor = document.createElement("p");
      autor.className = "mensaje-carta-autor";
      autor.textContent = m.nombre + (m.pais ? " de " + m.pais : "");

      carta.appendChild(texto);
      carta.appendChild(autor);
      frag.appendChild(carta);
    });
    lista.appendChild(frag);
    lista.scrollTop = 0;
    actualizarScrollTip();
  }

  function mostrarSinMensajes(texto) {
    mensajes = [];
    if (!lista) return;
    lista.innerHTML = "";
    var p = document.createElement("p");
    p.className = "mensaje-carta-texto";
    p.textContent = texto;
    lista.appendChild(p);
    if (scrollTip) scrollTip.classList.add("is-oculto");
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
      mostrarSinMensajes("Cargando mensajes de ARMY…");
    }

    fetch(ENDPOINT_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        // El endpoint devuelve los mensajes en orden de llegada (el más
        // antiguo primero, tal cual se van agregando filas al Sheet);
        // los invertimos para mostrar siempre el más reciente primero.
        var nuevaLista = Array.isArray(data) ? data.slice().reverse() : [];
        guardarCache(nuevaLista);
        mensajes = nuevaLista;
        if (!mensajes.length) {
          mostrarSinMensajes("Aún no hay mensajes publicados.");
          return;
        }
        renderMensajes();
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
      renderMensajes();
    }
    cargarMensajes(true);
  })();

  if (verBtn) {
    // Solo muestra el mural y hace scroll suave hacia él; no lo oculta
    // de nuevo ni cambia el texto del botón a "Ocultar mensajes".
    verBtn.addEventListener("click", function () {
      mural.hidden = false;
      if (!mensajes.length) cargarMensajes(false);
      actualizarScrollTip();
      mural.scrollIntoView({ behavior: "smooth", block: "start" });
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

  /* --- "El Comercio*" (en el h4) y "*Aclaración" (debajo del form) ---
     El link del h4 hace scroll suave hasta el botón "*Aclaración"; ese
     botón, a su vez, abre un popup con el texto legal (lo que antes
     era el desplegable "Disclaimer"). */
  if (linkComercio && btnAclaracion) {
    linkComercio.addEventListener("click", function (evt) {
      evt.preventDefault();
      btnAclaracion.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function abrirAclaracion() {
    if (!ctnAclaracionPopup) return;
    ctnAclaracionPopup.hidden = false;
    ctnAclaracionPopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("aclaracion-popup-abierto");
  }

  function cerrarAclaracion() {
    if (!ctnAclaracionPopup) return;
    ctnAclaracionPopup.hidden = true;
    ctnAclaracionPopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("aclaracion-popup-abierto");
  }

  if (btnAclaracion) btnAclaracion.addEventListener("click", abrirAclaracion);
  if (aclaracionOverlay) aclaracionOverlay.addEventListener("click", cerrarAclaracion);
  if (aclaracionClose) aclaracionClose.addEventListener("click", cerrarAclaracion);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && ctnAclaracionPopup && !ctnAclaracionPopup.hidden) cerrarAclaracion();
  });
})();
