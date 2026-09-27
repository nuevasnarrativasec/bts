/* ============================================================
   BTS · Trivia "Tu memoria ARMY"
   8 preguntas de opción múltiple; al terminar, el puntaje define
   un nivel de fanático (Baby ARMY / Whalien 52 / Magic Shop / Borahae).
   ============================================================ */
(function () {
  "use strict";

  const preguntas = [
    {
      texto: '¿Cuál es la primera maqueta grabada en septiembre de 2010 por la formación preliminar BPB donde se pronuncia por primera vez el nombre "Bangtan Sonyeondan"?',
      opciones: ["Rap Monster Demo", "We Are Bulletproof Pt.1", "Hook Gayo", "School of Tears"],
      correcta: 2,
    },
    {
      texto: "¿Qué integrante de BTS firmó su contrato como trainee con Big Hit en abril de 2010, pero no se mudó al dormitorio de Seúl hasta la víspera de Navidad de ese año?",
      opciones: ["RM", "Suga", "j-hope", "Jin"],
      correcta: 2,
    },
    {
      texto: 'Antes de adoptar definitivamente "Bangtan Sonyeondan", ¿cuáles fueron dos de los nombres comerciales preliminares propuestos por Bang Si-hyuk para el grupo?',
      opciones: ["Big Kidz y Young Nation", "Apex y Bullet Boyz", "Hit Nation y Underground Kings", "The Rookies y Seoul Vibe"],
      correcta: 0,
    },
    {
      texto: 'En mayo de 2010, antes de debutar en BTS, Suga produjo la pista "518-062" bajo el alias Gloss con el colectivo D-Town. ¿A qué hace referencia directa este título?',
      opciones: [
        "Al cumpleaños de su madre y el número de su primera residencia en Daegu.",
        "A la fecha de la Masacre de Gwangju (18 de mayo) y su prefijo de discado telefónico (062).",
        "A la clave de su estudio de grabación y el código postal de Seúl.",
        "A los días que pasó trabajando como repartidor motorizado antes de su audición.",
      ],
      correcta: 1,
    },
    {
      texto: 'Durante las etapas de grabación en estudio, los temas "134340" y "Paradise" fueron registrados y desarrollados bajo títulos de trabajo temporales. ¿Cuáles eran?',
      opciones: [
        "Call Me Pluto (para 134340) y Dummy's Race (para Paradise)",
        "Lonely Planet (para 134340) y No Goal (para Paradise)",
        "Neptune Key (para 134340) y Marathon (para Paradise)",
        "Space Oddity (para 134340) y Stop Running (para Paradise)",
      ],
      correcta: 0,
    },
    {
      texto: "En 2012, durante una emisión del programa M! Countdown, integrantes del predebut de BTS actuaron como bailarines de apoyo para la idol virtual SeeU y el grupo GLAM. ¿Quiénes eran?",
      opciones: ["RM, Jin, V y Jungkook", "j-hope, Jimin, V y RM", "Suga, j-hope, Jimin y Jungkook", "Suga, RM, Jin y Jimin"],
      correcta: 2,
    },
    {
      texto: '¿Qué película británica inspiró a V para escribir la lírica en inglés de su tema solista "Winter Bear" (2019)?',
      opciones: ["About Time (Cuestión de tiempo)", "Notting Hill", "Love Actually", "Me Before You"],
      correcta: 0,
    },
    {
      texto: 'Durante las sesiones de estudio con el productor británico Mura Masa para la banda sonora de BTS World, ¿qué título en clave le asignaron a la pista "A Brand New Day"?',
      opciones: ["Geum", "Soul Flute", "Bamboo Beat", "Daegeum"],
      correcta: 3,
    },
  ];

  const niveles = [
    { min: 0, max: 2, nombre: "Baby ARMY", subtitulo: "Descubriendo la puerta mágica", img: "bg-baby-army.png" },
    { min: 3, max: 4, nombre: "Whalien 52", subtitulo: "Sintonizando la frecuencia correcta", img: "bg-whalien-52.png" },
    { min: 5, max: 6, nombre: "Magic Shop", subtitulo: "Dueño de la llave del refugio", img: "bg-magic-shop.png" },
    { min: 7, max: 8, nombre: "Borahae", subtitulo: "Lealtad y memoria histórica absoluta", img: "bg-borahae.png" },
  ];

  const app = document.getElementById("triviaApp");
  if (!app) return;

  const pantallaPregunta = document.getElementById("triviaPantallaPregunta");
  const pantallaResultado = document.getElementById("triviaPantallaResultado");
  const elNum = document.getElementById("triviaNum");
  const elTexto = document.getElementById("triviaTexto");
  const elOpciones = document.getElementById("triviaOpciones");
  const btnContinuar = document.getElementById("triviaContinuar");
  const btnJugar = document.getElementById("triviaJugar");
  const elNivelNombre = document.getElementById("triviaNivelNombre");
  const elNivelImg = document.getElementById("triviaNivelImg");
  const elNivelSubtitulo = document.getElementById("triviaNivelSubtitulo");

  let actual = 0;
  let aciertos = 0;
  let seleccion = null;

  function renderPregunta() {
    const p = preguntas[actual];
    seleccion = null;
    btnContinuar.disabled = true;

    elNum.textContent = actual + 1;
    elTexto.textContent = p.texto;
    elOpciones.innerHTML = "";

    p.opciones.forEach((texto, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "trivia-opcion";
      btn.dataset.index = String(i);
      btn.innerHTML =
        '<span class="trivia-opcion-num">' + (i + 1) + "<i>.</i></span>" +
        '<span class="trivia-opcion-texto">' + texto + "</span>";
      btn.addEventListener("click", function () {
        seleccionar(i);
      });
      elOpciones.appendChild(btn);
    });
  }

  function seleccionar(i) {
    seleccion = i;
    btnContinuar.disabled = false;
    Array.prototype.forEach.call(elOpciones.children, function (btn, idx) {
      btn.classList.toggle("is-selected", idx === i);
    });
  }

  function siguiente() {
    if (seleccion === null) return;
    if (seleccion === preguntas[actual].correcta) aciertos++;

    actual++;
    if (actual < preguntas.length) {
      renderPregunta();
    } else {
      mostrarResultado();
    }
  }

  function mostrarResultado() {
    const nivel =
      niveles.find(function (n) {
        return aciertos >= n.min && aciertos <= n.max;
      }) || niveles[0];

    elNivelNombre.textContent = nivel.nombre;
    elNivelSubtitulo.textContent = nivel.subtitulo;
    elNivelImg.src = "./img/trivia/" + nivel.img;
    elNivelImg.alt = "Eres " + nivel.nombre;

    pantallaPregunta.hidden = true;
    pantallaResultado.hidden = false;
  }

  function reiniciar() {
    actual = 0;
    aciertos = 0;
    seleccion = null;
    pantallaResultado.hidden = true;
    pantallaPregunta.hidden = false;
    renderPregunta();
  }

  btnContinuar.addEventListener("click", siguiente);
  btnJugar.addEventListener("click", reiniciar);

  renderPregunta();
})();
