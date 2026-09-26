/* ============================================================
   BTS · Selector interactivo de perfiles ("los protagonistas")
   Al presionar un rostro se actualiza la ficha con su información.
   ============================================================ */
(function () {
  "use strict";

  var MEMBERS = {
    rm: {
      nombre: "RM",
      nombreReal: "Kim Nam-joon",
      edad: "32 años",
      nacimiento: "12 sep 1994 (Virgo)",
      avatar: "./img/avatar-rm-cluster.png",
      foto: "./img/perfiles/bg-perfil-rm.jpg",
      rol: "Líder, rapero principal y compositor",
      idiomas: "Coreano, inglés fluido y nociones de japonés",
      solosLabel: "Álbumes de estudio oficiales en solitario",
      solos: "Indigo (2022), Right Place, Wrong Person (2024)",
      origen: "Con raíces en Ilsan y forjado en el rap subterráneo de Seúl, fue el pilar fundacional sobre el que Big Hit construyó el proyecto de la banda.",
      sello: "Mente analítica y curador cultural; es el portavoz global del grupo y quien marca el tono discursivo ante los medios internacionales.",
      hito: "Portavoz del histórico discurso ante la ONU en 2018 para la campaña global Love Myself de BTS y UNICEF contra la violencia juvenil.",
      headline: "Más acústico, menos intenso",
      metrics: [
        { label: "Acousticness", before: "0,23", after: "0,37" },
        { label: "Energy", before: "0,63", after: "0,55" }
      ],
      quote: "“Con un coeficiente intelectual de 148 y entre los mejores estudiantes del país, para RM el hip-hop no fue rebeldía, sino el salvavidas frente a la asfixiante presión académica.”"
    },
    suga: {
      nombre: "SUGA",
      nombreReal: "Min Yoongi",
      edad: "33 años",
      nacimiento: "9 mar 1993 (Piscis)",
      avatar: "./img/avatar-suga-cluster.png",
      foto: "./img/perfiles/bg-perfil-suga.jpg",
      rol: "Rapero, productor y compositor",
      idiomas: "Coreano, japonés y nociones de inglés",
      solosLabel: "Solos",
      solos: "Trilogía Agust D: Agust D (2016), D-2 (2020) y D-DAY (2023)",
      origen: "Surgió del hip-hop independiente de Daegu y trabajó como repartidor durante sus difíciles años de aprendiz en Seúl antes del éxito.",
      sello: "Multiinstrumentista (piano y guitarra) con una pluma cruda y directa que aborda la salud mental sin concesiones.",
      hito: "Primer miembro en encabezar una gira solista global en arenas con localidades agotadas con su Agust D TOUR.",
      headline: "El mayor giro hacia lo acústico",
      metrics: [
        { label: "Acousticness", before: "0,10", after: "0,30" },
        { label: "Valence musical", before: "0,34", after: "0,52" }
      ],
      quote: "“Bajo su fachada reservada, los miembros coinciden en que es el más atento: cuida del grupo con gestos silenciosos y sin buscar reconocimiento.”"
    },
    "j-hope": {
      nombre: "j-hope",
      nombreReal: "Jung Ho-seok",
      edad: "32 años",
      nacimiento: "18 feb 1994 (Acuario)",
      avatar: "./img/avatar-j-hope-cluster.png",
      foto: "./img/perfiles/bg-perfil-j-hope.jpg",
      rol: "Bailarín principal, rapero, compositor y productor (miembro pleno de KOMCA)",
      idiomas: "Coreano, japonés y nociones de inglés",
      solosLabel: "Solos",
      solos: "Hope World (2018), Jack in the Box (2022), Hope on the Street Vol. 1 (2024)",
      origen: "Forjado en la danza urbana de Gwangju junto al grupo callejero Neuron, labró su reputación en batallas de street dance.",
      sello: "Disciplina técnica absoluta. Es el director coreográfico en los ensayos, equilibrando exigencia férrea con carisma expansivo.",
      hito: "Primer artista surcoreano en encabezar el escenario principal de un gran festival estadounidense (Lollapalooza Chicago 2022).",
      headline: "El sonido se vuelve todavía más luminoso",
      metrics: [
        { label: "Valence musical", before: "0,46", after: "0,65" }
      ],
      quote: "“El arquitecto de la sincronía de BTS: desde los días de aprendices lideró cada extenuante sesión de práctica para forjar la precisión escénica del grupo.”"
    },
    jin: {
      nombre: "Jin",
      nombreReal: "Kim Seok-jin",
      edad: "33 años",
      nacimiento: "4 dic 1992 (Sagitario)",
      avatar: "./img/avatar-jin-cluster.png",
      foto: "./img/perfiles/bg-perfil-jin.jpg",
      rol: "Vocalista y miembro mayor",
      idiomas: "Coreano y japonés",
      solosLabel: "Solos",
      solos: "The Astronaut (2022), Happy (2024)",
      origen: "Estudiaba actuación en la Universidad Konkuk cuando fue reclutado en la calle; construyó su técnica de canto y baile desde cero con extenuante dedicación.",
      sello: "Voz tenor de timbre limpio y agudos estables (silver voice), combinada con una aguda inteligencia emocional y un humor desarmante para cohesionar al grupo.",
      hito: "Primer integrante de BTS en completar el servicio militar obligatorio y portador oficial de la antorcha en los Juegos Olímpicos de París 2024.",
      headline: "El que reúne los dos extremos",
      metrics: [
        { label: "Running Wild", after: "+0,48" },
        { label: "Don't Say You Love Me", after: "−0,46" }
      ],
      quote: "“El ancla serena de BTS: ejerce su rol de hermano mayor sin jerarquías rígidas, usando la risa y el humor ligero para aliviar la presión de sus compañeros en momentos críticos.”"
    },
    jimin: {
      nombre: "Jimin",
      nombreReal: "Park Ji-min",
      edad: "30 años",
      nacimiento: "13 oct 1995 (Libra)",
      avatar: "./img/avatar-jimin-cluster.png",
      foto: "./img/perfiles/bg-perfil-jimin.jpg",
      rol: "Bailarín principal y vocalista",
      idiomas: "Coreano, nociones de japonés e inglés",
      solosLabel: "Solos",
      solos: "FACE (2023), MUSE (2024), además de los exitosos sencillos en solitario Promise y Set Me Free Pt.2",
      origen: "Mejor estudiante de ingreso en danza moderna en la prestigiosa Busan High School of Arts, antes de trasladarse a Seúl con el período de entrenamiento más corto del grupo.",
      sello: "Estilo interpretativo grácil y teatral; fusiona líneas fluidas de danza contemporánea con potencia escénica y un registro vocal agudo inconfundible.",
      hito: "Primer solista surcoreano en alcanzar simultáneamente el número 1 del Billboard Hot 100 (Like Crazy) y del Billboard Artist 100 en la historia.",
      headline: "De lo acústico hacia un sonido más expansivo",
      metrics: [
        { label: "Acousticness", before: "0,51", after: "0,16" },
        { label: "Energy", before: "0,51", after: "0,71" }
      ],
      nota: "La muestra anterior a 2023 es reducida; debe interpretarse con cautela.",
      quote: "“Su nivel de autoexigencia extrema y noches en vela casi le cuestan la salud como aprendiz; hoy su base lírica y contemporánea es el pilar de la expresividad visual de BTS.”"
    },
    v: {
      nombre: "V",
      nombreReal: "Kim Tae-hyung",
      edad: "30 años",
      nacimiento: "30 dic 1995 (Capricornio)",
      avatar: "./img/avatar-v-cluster.png",
      foto: "./img/perfiles/bg-perfil-v.jpg",
      rol: "Vocalista, bailarín y visual",
      idiomas: "Coreano, nociones de japonés e inglés",
      solosLabel: "Solos",
      solos: "Layover (2023), además de aclamadas bandas sonoras como Christmas Tree y Sweet Night, y sencillos como Fri(end)s",
      origen: "Creció en Geochang y Daegu; acompañó a un amigo a la audición de Big Hit solo para apoyarlo, pero los reclutadores lo animaron a presentarse y fue el único seleccionado de la jornada.",
      sello: "Inusual registro de barítono cálido y profundo dentro del pop coreano, marcada devoción por el jazz y el soul clásico, y un magnetismo interpretativo de referencia en la moda y el arte visual.",
      hito: "Su álbum debut Layover rompió el récord de ventas históricas en su primer día para un solista en Hanteo (más de 1,67 millones de copias) y superó los mil millones de reproducciones en Spotify con una propuesta puramente neo-soul y R&B.",
      headline: "El perfil que menos cambia en valence",
      metrics: [
        { label: "Valence musical", before: "0,33", after: "0,35" },
        { label: "Acousticness", before: "0,44", after: "0,52" }
      ],
      quote: "“Inspirado por la elegancia clásica de su padre, construyó una firma estética y musical retro inconfundible, además de haber acuñado la frase y concepto de amor eterno del fandom: 'I Purple You' (Borahae).”"
    },
    jungkook: {
      nombre: "Jung Kook",
      nombreReal: "Jeon Jung-kook",
      edad: "29 años",
      nacimiento: "1 sep 1997 (Virgo)",
      avatar: "./img/avatar-jungkook-cluster.png",
      foto: "./img/perfiles/bg-perfil-jungkook.jpg",
      rol: "Vocalista principal, centro, bailarín principal y miembro menor (maknae)",
      idiomas: "Coreano, nociones de inglés y japonés",
      solosLabel: "Solos",
      solos: "GOLDEN (2023), además del himno mundialista Dreamers y sencillos récord como Seven y 3D",
      origen: "Con apenas 13 años audicionó en Superstar K3; pese a no clasificar, recibió ofertas de siete agencias de la industria antes de decantarse por Big Hit deslumbrado por el rap de RM.",
      sello: "Reconocido como el &ldquo;Golden Maknae&rdquo; por su capacidad de ejecutar con excelencia atlética el canto pop, el baile de alta dificultad, la producción y el carisma de centro de escenario.",
      hito: "Su sencillo Seven se convirtió en la canción que más rápido alcanzó los mil millones de reproducciones en la historia global de Spotify (108 días), además de actuar en la ceremonia de apertura de la Copa Mundial de la FIFA Catar 2022.",
      headline: "El mayor salto en positividad sonora",
      metrics: [
        { label: "Valence musical", before: "0,38", after: "0,69" }
      ],
      quote: "“Creció literalmente bajo la tutela y el cuidado de sus seis compañeros: ingresó al proyecto con 13 años y terminó forjándose como el engranaje vocal y motor escénico más completo de BTS.”"
    }
  };

  var ORDER = ["rm", "suga", "j-hope", "v", "jin", "jimin", "jungkook"];

  var card = document.getElementById("perfilCard");
  var avataresWrap = document.getElementById("perfilesAvatares");
  if (!card || !avataresWrap) return;

  function metricRow(m) {
    if (m.before) {
      return (
        '<div class="perfil-metric">' +
        '<span class="perfil-metric-label">' + m.label + "</span>" +
        '<div class="perfil-metric-bar">' +
        '<span class="perfil-metric-value">' + m.before + "</span>" +
        '<span class="perfil-metric-dot perfil-metric-dot--start"></span>' +
        '<span class="perfil-metric-line"></span>' +
        '<span class="perfil-metric-dot perfil-metric-dot--end"></span>' +
        '<span class="perfil-metric-value">' + m.after + "</span>" +
        "</div>" +
        "</div>"
      );
    }
    return (
      '<div class="perfil-metric perfil-metric--single">' +
      '<span class="perfil-metric-label">' + m.label + "</span>" +
      '<div class="perfil-metric-bar">' +
      '<span class="perfil-metric-line"></span>' +
      '<span class="perfil-metric-dot perfil-metric-dot--end"></span>' +
      '<span class="perfil-metric-value">' + m.after + "</span>" +
      "</div>" +
      "</div>"
    );
  }

  function render(id) {
    var d = MEMBERS[id];
    if (!d) return;

    card.innerHTML =
      '<div class="perfil-foto">' +
      '<img src="' + d.foto + '" alt="' + d.nombre + '" loading="lazy">' +
      "</div>" +
      '<div class="perfil-info">' +
      '<div class="perfil-cabecera">' +
      '<span class="perfil-nombre">' + d.nombre + "</span>" +
      '<span class="perfil-nombre-real">' + d.nombreReal + "</span>" +
      '<span class="perfil-fecha">' + d.edad + " · " + d.nacimiento + "</span>" +
      "</div>" +
      '<ul class="perfil-ficha">' +
      '<li><img src="./img/perfiles/icon-rol.png" alt=""><p><b>Rol:</b> ' + d.rol + "</p></li>" +
      '<li><img src="./img/perfiles/icon-idiomas.png" alt=""><p><b>Idiomas:</b> ' + d.idiomas + "</p></li>" +
      '<li><img src="./img/perfiles/icon-albumes.png" alt=""><p><b>' + d.solosLabel + ':</b> ' + d.solos + "</p></li>" +
      '<li><img src="./img/perfiles/icon-origen.png" alt=""><p><b>Origen:</b> ' + d.origen + "</p></li>" +
      '<li><img src="./img/perfiles/icon-sello.png" alt=""><p><b>Sello y talento:</b> ' + d.sello + "</p></li>" +
      '<li><img src="./img/perfiles/icon-hito.png" alt=""><p><b>Hito:</b> ' + d.hito + "</p></li>" +
      "</ul>" +
      "</div>" +
      '<div class="perfil-stats">' +
      '<p class="perfil-headline">' + d.headline + "</p>" +
      '<div class="perfil-metrics">' +
      d.metrics.map(metricRow).join("") +
      (d.nota ? '<p class="perfil-nota">* ' + d.nota + "</p>" : "") +
      "</div>" +
      '<blockquote class="perfil-quote">' + d.quote + "</blockquote>" +
      "</div>";
  }

  avataresWrap.addEventListener("click", function (e) {
    var btn = e.target.closest(".perfil-avatar-btn");
    if (!btn) return;

    var id = btn.getAttribute("data-id");
    if (!id || !MEMBERS[id]) return;

    avataresWrap
      .querySelectorAll(".perfil-avatar-btn")
      .forEach(function (b) {
        b.classList.remove("is-active");
      });
    btn.classList.add("is-active");

    render(id);
  });

  render("rm");
})();
