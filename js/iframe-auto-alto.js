/* ============================================================
   BTS · Altura dinámica para iframes de cuadros-mayte
   Los iframes marcados con el atributo "data-auto-height" (por ahora,
   el de bts_clustering.html) traen un height fijo en el style inline
   solo como valor de arranque, para que no se vea un salto mientras
   carga. En cuanto el iframe termina de cargar, este script mide el
   alto real de SU documento (son same-origin: viven en la misma
   carpeta del proyecto) y ajusta el iframe a ese alto exacto, así no
   queda espacio en blanco de más ni contenido cortado.

   También vuelve a medir con un ResizeObserver sobre el <body> del
   iframe, por si su contenido cambia después de cargar (filtros,
   tooltips, animaciones de entrada del propio gráfico, etc.), y en
   el resize de la ventana, por si el iframe es responsivo.

   Para sumar otro iframe a este comportamiento, solo hay que
   agregarle el atributo data-auto-height en el HTML.
   ============================================================ */
(function () {
  "use strict";

  const iframes = document.querySelectorAll("iframe[data-auto-height]");
  if (!iframes.length) return;

  function medirDocumento(iframe) {
    try {
      const doc = iframe.contentWindow && iframe.contentWindow.document;
      if (!doc || !doc.body) return 0;
      return Math.max(
        doc.body.scrollHeight,
        doc.documentElement ? doc.documentElement.scrollHeight : 0
      );
    } catch (err) {
      // Si por algo el iframe no fuera same-origin, el navegador bloquea
      // el acceso a su documento: no hay forma de medirlo, se deja la
      // altura fija que trae el HTML.
      return 0;
    }
  }

  function ajustarAltura(iframe) {
    const alto = medirDocumento(iframe);
    if (alto > 0) iframe.style.height = alto + "px";
  }

  iframes.forEach((iframe) => {
    let observador = null;

    function iniciar() {
      ajustarAltura(iframe);

      // Se vuelve a medir varias veces durante los primeros segundos: el
      // "load" del iframe no siempre coincide con el momento en que su
      // propio gráfico terminó de dibujarse (fuentes, imágenes, JS interno
      // con un pequeño delay).
      [50, 200, 500, 1000, 2000].forEach((ms) => {
        window.setTimeout(() => ajustarAltura(iframe), ms);
      });

      if ("ResizeObserver" in window && !observador) {
        try {
          const doc = iframe.contentWindow.document;
          observador = new ResizeObserver(() => ajustarAltura(iframe));
          observador.observe(doc.body);
        } catch (err) {
          // same-origin no disponible: sin ResizeObserver, se queda con
          // las mediciones puntuales de arriba.
        }
      }
    }

    let listo = false;
    try {
      listo = iframe.contentWindow.document.readyState === "complete";
    } catch (err) {}

    if (listo) {
      iniciar();
    } else {
      iframe.addEventListener("load", iniciar);
    }
  });

  window.addEventListener("resize", () => {
    iframes.forEach((iframe) => ajustarAltura(iframe));
  });
})();
