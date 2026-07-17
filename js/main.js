/* ============================================================
   BTS · Born to Sing — animaciones de scroll (GSAP + ScrollTrigger)
   Línea de tiempo calcada del previo, con timing pensado para scroll.
   ============================================================ */
(function () {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vh = () => window.innerHeight;

  /* ---------- Progreso + hint ---------- */
  const progressBar = document.getElementById("progressBar");
  const scrollHint = document.getElementById("scrollHint");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      progressBar.style.width = (self.progress * 100).toFixed(2) + "%";
      scrollHint.style.opacity = self.progress > 0.02 ? "0" : "0.75";
    },
  });

  /* ---------- Corazones flotantes ---------- */
  const heartsWrap = document.getElementById("hearts");
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    s.textContent = "💜";
    s.style.left = 22 + Math.random() * 56 + "%";
    s.style.top = 22 + Math.random() * 48 + "%";
    s.style.fontSize = 14 + Math.random() * 22 + "px";
    heartsWrap.appendChild(s);
  }

  /* ---------- Matrices de puntos ---------- */
  document.querySelectorAll(".dot-matrix").forEach((m) => {
    const n = parseInt(m.dataset.dots || "60", 10);
    for (let i = 0; i < n; i++) m.appendChild(document.createElement("span"));
  });

  /* ---------- Ondas festoneadas (SVG) ---------- */
  (function buildWaves() {
    const wrap = document.getElementById("waves");
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    const R = 600;
    svg.setAttribute("viewBox", `${-R} ${-R} ${R * 2} ${R * 2}`);
    svg.setAttribute("width", R * 2);
    svg.setAttribute("height", R * 2);

    const petals = 22;
    for (let r = 70; r <= 580; r += 30) {
      const amp = r * 0.045;
      let d = "";
      for (let a = 0; a <= 360; a += 2) {
        const rad = (a * Math.PI) / 180;
        const rr = r + amp * Math.sin(petals * rad);
        const x = (rr * Math.cos(rad)).toFixed(1);
        const y = (rr * Math.sin(rad)).toFixed(1);
        d += (a === 0 ? "M" : "L") + x + " " + y + " ";
      }
      d += "Z";
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.style.opacity = (0.25 + 0.5 * (1 - r / 600)).toFixed(2);
      svg.appendChild(p);
    }
    wrap.appendChild(svg);
  })();

  /* ============================================================
     ESCENA 1 · HERO
     ============================================================ */
  const btsLetters = document.querySelectorAll(".bts-logo span");
  const tags = document.querySelectorAll(".tag");
  const heroSubtitle = document.getElementById("heroSubtitle");

  gsap.set(heroSubtitle, { autoAlpha: 0 });

  if (!prefersReduced) {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".masthead", { y: -40, autoAlpha: 0, duration: 0.7 })
      .from(btsLetters, { yPercent: 120, opacity: 0, duration: 0.9, stagger: 0.08 }, "-=0.3")
      .from(tags, { scale: 0, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.4");
  }

  // Flotación continua de etiquetas (usa yPercent para NO chocar con la dispersión, que usa y)
  tags.forEach((t, i) => {
    gsap.to(t, { yPercent: "+=10", duration: 2 + i * 0.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
  });

  // Salida del hero (zoom + dispersión) controlada por scroll
  const W = () => window.innerWidth;
  gsap.timeline({
    scrollTrigger: { trigger: "#hero", start: "top top", end: "+=100%", scrub: true, pin: true, invalidateOnRefresh: true },
  })
    .to(".masthead", { yPercent: -100, ease: "power1.in", immediateRender: false }, 0)
    // Las letras se DISPERSAN (sin zoom ni fade): B y T hacia arriba, S hacia la esquina superior derecha.
    // Salen de cuadro solo por el desplazamiento; la escena (overflow:hidden) recorta lo que sobra.
    .to(".bts-logo__b", { y: () => -vh() * 1.3, x: () => -W() * 0.06, rotation: -12, ease: "power2.in", duration: 0.85, immediateRender: false }, 0)
    .to(".bts-logo__t", { y: () => -vh() * 1.4, x: () => W() * 0.04, ease: "power2.in", duration: 0.85, immediateRender: false }, 0)
    .to(".bts-logo__s", { x: () => W() * 0.75, y: () => -vh() * 1.1, rotation: "-=50", ease: "power2.in", duration: 0.85, immediateRender: false }, 0)
    // Los tags también se dispersan hacia afuera (sin fade); vuelven al hacer scroll inverso
    .to(".tag--trivias", { y: () => -vh() * 1.05, x: () => W() * 0.05, rotation: -18, ease: "power2.in", duration: 0.85, immediateRender: false }, 0)
    .to(".tag--data", { x: () => -W() * 0.35, y: () => vh() * 0.7, rotation: -24, ease: "power2.in", duration: 0.85, immediateRender: false }, 0)
    .to(".tag--army", { x: () => W() * 0.55, y: () => vh() * 0.3, rotation: 24, ease: "power2.in", duration: 0.85, immediateRender: false }, 0);
  // Nota: el hero__subtitle ya NO se muestra solo en el hero; la frase aparece junto
  // con la ballena (whale__text) entrando de izquierda a derecha.

  /* ============================================================
     ESCENA 2 · BALLENA (oscura → cósmica) + ARMY
     ============================================================ */
  // Centrado base con xPercent/yPercent -50. La ballena oscura entra baja desde la
  // IZQUIERDA (cabeza primero), sube al centro y sale por la esquina INFERIOR DERECHA.
  gsap.set("#whaleDark", { xPercent: -178, yPercent: -22, scale: 0.9, autoAlpha: 0 });
  // El texto arranca cerca de la boca de la ballena (abajo-izquierda respecto a su
  // posición final arriba-derecha) y viajará en diagonal hacia arriba-derecha.
  gsap.set("#whaleText", { autoAlpha: 0, x: () => -W() * 0.52, y: () => vh() * 0.44, rotation: -7 });
  // Ballena cósmica: entra desde la esquina INFERIOR DERECHA (fuera de cuadro).
  gsap.set("#whaleFigure", { xPercent: 72, yPercent: 54, scale: 0.92, autoAlpha: 0 });
  // La ARMY parte desplazada a la DERECHA (respecto a su sitio sobre la ballena).
  gsap.set("#whaleArmy", { autoAlpha: 0, x: 280, y: -20, scale: 0.9 });

  gsap.timeline({
    scrollTrigger: { trigger: "#whale", start: "top top", end: "+=360%", scrub: true, pin: true, invalidateOnRefresh: true },
  })
    // 1er tiempo · ENTRA: aparece la cabeza por la izquierda-abajo
    .to("#whaleDark", { autoAlpha: 1, duration: 0.15 }, 0)
    // sube y avanza hasta verse completa en el centro
    .to("#whaleDark", { xPercent: -50, yPercent: -50, scale: 1, ease: "power1.out", duration: 0.7 }, 0)
    // SALE hacia la esquina inferior derecha (en el sentido de su cabeza)
    .to("#whaleDark", { xPercent: 78, yPercent: 42, scale: 1.06, ease: "power1.in", duration: 0.75 }, 0.78)
    .to("#whaleDark", { autoAlpha: 0, duration: 0.25 }, 1.3)
    // Texto VIAJA en diagonal: desde la boca de la ballena (abajo-izq) hasta arriba-derecha
    .fromTo("#whaleText",
      { autoAlpha: 0, x: () => -W() * 0.52, y: () => vh() * 0.44, rotation: -7 },
      { autoAlpha: 1, x: 0, y: 0, rotation: 0, ease: "power1.out", duration: 1.0 }, 0.15)
    // ...y luego SALE del viewport hacia la derecha (como la ballena)
    .to("#whaleText", { x: () => W() * 0.55, y: () => -vh() * 0.08, ease: "power1.in", duration: 0.55 }, 1.15)
    .to("#whaleText", { autoAlpha: 0, duration: 0.2 }, 1.55)
    // 2º tiempo · ballena cósmica ENTRA desde la esquina inferior derecha hacia el centro
    .to("#whaleFigure", { xPercent: 0, yPercent: 0, scale: 1, autoAlpha: 1, ease: "power2.out", duration: 0.95 }, 1.8)
    // La ARMY llega desde la DERECHA y se encuentra con la ballena en el centro
    .to("#whaleArmy", { autoAlpha: 1, x: 0, y: 0, scale: 1, ease: "power2.out", duration: 0.75 }, 2.15)
    // Corazones flotando
    .to("#hearts span", {
      autoAlpha: 1, y: -120, duration: 1,
      stagger: { each: 0.05, from: "random" }, ease: "power1.out",
    }, 2.5)
    // Permanencia en el centro y luego AMBOS (ballena + ARMY) SALEN por completo por la IZQUIERDA
    .to("#whaleFigure", { xPercent: -165, ease: "power1.in", duration: 1.1 }, 3.15)
    .to("#hearts", { autoAlpha: 0, duration: 0.4 }, 3.2);

  /* ============================================================
     ESCENA 3 · CAÍDA + ONDAS DE SONIDO
     ============================================================ */
  // Una sola ARMY hace toda la caída. Entra desde ARRIBA del viewport (después de que la
  // ballena cósmica ya salió por completo en la escena anterior).
  gsap.set("#fallArmy", { y: () => -vh() * 0.2, rotation: 0 });
  gsap.set("#waves", { scale: 0, autoAlpha: 0, rotation: -12 });

  gsap.timeline({
    scrollTrigger: { trigger: "#fall", start: "top top", end: "+=320%", scrub: true, pin: true, invalidateOnRefresh: true },
  })
    // Fondo blanco → azul
    .fromTo("#fallBg", { opacity: 0 }, { opacity: 1, ease: "power1.in", duration: 1.0 }, 0.15)
    // 1) Cae desde arriba del viewport hacia abajo
    .fromTo("#fallArmy",
      { y: () => -vh() * 0.2, rotation: 0 },
      { y: () => vh() * 0.6, rotation: 200, ease: "power1.in", duration: 0.85 }, 0.15)
    // 2) Vuelve a subir al top
    .to("#fallArmy", { y: () => -vh() * 0.06, rotation: 320, ease: "power1.inOut", duration: 0.85 }, 1.0)
    // 3) Baja de nuevo hasta el centro, donde la reciben las ondas
    .to("#fallArmy", { y: () => vh() * 0.42, rotation: 480, ease: "power1.out", duration: 0.9 }, 1.85)
    // Ondas festoneadas que crecen alrededor de la ARMY (se quedan para empatar con la escena siguiente)
    .fromTo("#waves",
      { scale: 0, autoAlpha: 0, rotation: -12 },
      { scale: 1, autoAlpha: 0.95, rotation: 8, ease: "power1.out", duration: 1.0 }, 1.95);

  /* ============================================================
     ESCENA 4 · CÍRCULO BLANCO
     ============================================================ */
  gsap.timeline({
    scrollTrigger: { trigger: "#reveal", start: "top top", end: "+=130%", scrub: true, pin: true },
  })
    .to("#revealCircle", { scale: 3.4, ease: "power2.inOut", duration: 1.4 }, 0)
    .fromTo("#revealTitle", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.7);

  /* ---------- Contenido: entradas al hacer scroll ---------- */
  gsap.utils.toArray(".block").forEach((block) => {
    gsap.from(block, {
      y: 60, opacity: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: block, start: "top 82%" },
    });
  });
  gsap.utils.toArray(".dot-matrix").forEach((m) => {
    gsap.to(m.querySelectorAll("span"), {
      scale: 1, duration: 0.5, ease: "back.out(2)",
      stagger: { each: 0.012, from: "start", grid: "auto" },
      scrollTrigger: { trigger: m, start: "top 85%" },
    });
  });
  gsap.utils.toArray(".disco__card").forEach((card, i) => {
    gsap.from(card, {
      y: 40, opacity: 0, duration: 0.6, delay: i * 0.08, ease: "power2.out",
      scrollTrigger: { trigger: "#blockDisco", start: "top 75%" },
    });
  });

  /* ============================================================
     ESCENA 5 · LOGO BTS + CAÍDA AL REVÉS
     ============================================================ */
  gsap.set("#logoArmy", { y: () => -vh() * 0.15 });

  gsap.timeline({
    scrollTrigger: { trigger: "#logoScene", start: "top top", end: "+=150%", scrub: true, pin: true, invalidateOnRefresh: true },
  })
    .fromTo("#btsMark", { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 0.6, scale: 1, duration: 1 }, 0)
    .to("#logoArmy", { y: () => vh() * 0.9, ease: "none", duration: 2 }, 0)
    .to("#btsMark", { scale: 1.06, duration: 1 }, 0.6);

  /* ============================================================
     ESCENA 6 · FINAL — entrada + lluvia morada
     ============================================================ */
  gsap.from("#finaleMark", {
    autoAlpha: 0, scale: 0.9, duration: 1.2, ease: "power2.out",
    scrollTrigger: { trigger: "#finale", start: "top 65%" },
  });
  gsap.from("#finaleArmy", {
    scale: 0.8, autoAlpha: 0, y: 40, duration: 1, ease: "power3.out",
    scrollTrigger: { trigger: "#finale", start: "top 60%" },
  });
  gsap.from(".finale__text", {
    autoAlpha: 0, y: 30, duration: 0.9, delay: 0.3, ease: "power2.out",
    scrollTrigger: { trigger: "#finale", start: "top 55%" },
  });
  gsap.from(".credits", {
    autoAlpha: 0, y: 20, duration: 0.8, ease: "power2.out",
    scrollTrigger: { trigger: ".credits", start: "top 90%" },
  });

  /* ---------- Lluvia morada (canvas) ---------- */
  const canvas = document.getElementById("rain");
  const ctx = canvas.getContext("2d");
  let drops = [], rainActive = false, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function makeDrops() {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    drops = Array.from({ length: Math.floor(w / 5) }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      len: 8 + Math.random() * 18, speed: 2 + Math.random() * 5,
      alpha: 0.15 + Math.random() * 0.5,
      r: Math.random() < 0.12, size: 2 + Math.random() * 3,
    }));
  }
  function drawRain() {
    if (!rainActive) return;
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);
    for (const d of drops) {
      ctx.globalAlpha = d.alpha;
      if (d.r) {
        ctx.fillStyle = "#c9b6ff";
        ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = "rgba(233,224,255,0.9)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + 0.6, d.y + d.len); ctx.stroke();
      }
      d.y += d.speed;
      if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawRain);
  }
  ScrollTrigger.create({
    trigger: "#finale", start: "top 80%", end: "bottom top",
    onEnter: () => { if (!rainActive) { sizeCanvas(); makeDrops(); rainActive = true; drawRain(); } },
    onEnterBack: () => { if (!rainActive) { sizeCanvas(); makeDrops(); rainActive = true; drawRain(); } },
    onLeaveBack: () => { rainActive = false; ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight); },
  });

  /* ---------- Refresh ---------- */
  window.addEventListener("load", () => ScrollTrigger.refresh());
  window.addEventListener("resize", () => { if (rainActive) { sizeCanvas(); makeDrops(); } });
})();
