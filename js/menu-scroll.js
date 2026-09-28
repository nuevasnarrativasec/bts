/* ============================================================
   BTS · Menú superior — scroll suave a las secciones
   data -> #main-canciones
   deja tu mensaje -> #ctn-box-deja-tu-mensaje
   trivia -> #main-trivia
   ============================================================ */
(function () {
  "use strict";

  const links = document.querySelectorAll(".menu a.js-menu-link");
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId.charAt(0) !== "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
