/**
 * Plano de planta de la Meganics 2 líneas x 18 salidas, ARMADO CON LOS BLOQUES
 * DE DON GUS DE CLASIFICADORA DE RODILLOS PASO 3¾" (entregados 26-oct-2026,
 * ERP: datos/gus/clasificadora-rodillos-3-3-4-2-lineas/CLASIFICADORA 2L.dxf).
 *
 * Bloques: INICIAL (banda, singulador y cajón de cámaras), ADICIONAL (módulo de
 * salida, una salida por línea) y TRANSMISION. Las 18 salidas van a cada 22½"
 * (571.5 mm), alternadas: 9 de un lado y 9 del otro (Osvaldo / Eduardo, 22-oct).
 * Gus dibujó su módulo para 30"; aquí se recorta a 571.5 mm y en cada salida se
 * deja solo el equipo del lado que le toca. Los rieles siguen corridos.
 *
 * Las medidas reales de la máquina son las del técnico (Osvaldo, 21-oct-2026);
 * el dibujo es de la familia de clasificadoras de rodillos 3¾" de ELFCO, así que
 * el largo del dibujo no es el de la Meganics. Por eso las medidas van en la nota
 * y en el dibujo solo se acota lo que sí es igual (las 18 salidas a 22½").
 *
 *   node plano-meganics-2x18.mjs && node planos-a-pdf.mjs
 */
import sharp from "sharp";
import { parejas, leer, aplanar } from "file:///C:/Users/Propietario/Desktop/ERP%20ELFCO/erp-elfco/herramientas/dxf.mjs";

const SALIDA_PNG = process.argv[2] || "public/planos/meganics-2x18-plano.png";
const F = "C:/Users/Propietario/Desktop/ERP ELFCO/erp-elfco/datos/gus/clasificadora-rodillos-3-3-4-2-lineas/CLASIFICADORA 2L.dxf";
const { bloques } = leer(parejas(F));
const blo = (n, T) => aplanar(bloques.get(n), bloques, T);
const T0 = { x: 0, y: 0, ex: 1, ey: 1, r: 0 };

const PASO = 571.5, N = 18;   // 22½" entre salidas
const MITAD = 384;            // y que separa la línea de arriba de la de abajo en el módulo de Gus
const BANDA = 740;            // arriba de esto va la banda del costado (se deja corrida)

/* la entrada termina en x = 0; las salidas empiezan ahí */
let segs = blo("INICIAL", T0);

/* singulador de bandas en V (archivo suelto de Gus, 3.3 m): pegado a la entrada de rodillos, sin hueco */
const FS = F.replace("CLASIFICADORA 2L", "SINGULADOR 2L");
const SG = leer(parejas(FS));
const X_SING = -4487 - 3110, Y_SING = 49; // pegado: el marco del singulador (termina en x 3110) toca el de la clasificadora (empieza en -4487); las caídas entran sobre los rodillos. Centros: singulador y 335, rodillos y 384
segs = segs.concat(aplanar(SG.dibujo, SG.bloques, { x: X_SING, y: Y_SING, ex: 1, ey: 1, r: 0 }));

/* recorta un segmento al tramo x0..x1 */
function recorta([a, b], x0, x1) {
  if (Math.max(a[0], b[0]) < x0 || Math.min(a[0], b[0]) > x1) return null;
  const y = (x) => (b[0] === a[0] ? a[1] : a[1] + (b[1] - a[1]) * ((x - a[0]) / (b[0] - a[0])));
  const xa = Math.min(Math.max(a[0], x0), x1), xb = Math.min(Math.max(b[0], x0), x1);
  return [[xa, b[0] === a[0] ? a[1] : y(xa)], [xb, b[0] === a[0] ? b[1] : y(xb)]];
}
const esRiel = ([a, b]) => Math.abs(a[1] - b[1]) < 0.5 && Math.abs(a[0] - b[0]) >= 200;

const MOD = blo("ADICIONAL", T0);
for (let i = 0; i < N; i++) {
  const arriba = i % 2 === 0;
  for (const s of MOD) {
    const c = recorta(s, 0, PASO);
    if (!c) continue;
    const yc = (s[0][1] + s[1][1]) / 2;
    const va = esRiel(s) || yc > BANDA || (arriba ? yc > MITAD : yc <= MITAD);
    if (va) segs.push([[c[0][0] + i * PASO, c[0][1]], [c[1][0] + i * PASO, c[1][1]]]);
  }
}
const X_TRANS = N * PASO;
segs = segs.concat(blo("TRANSMISION", { x: X_TRANS, y: 0, ex: 1, ey: 1, r: 0 }));

/* --- a SVG --- */
let mx0 = Infinity, my0 = Infinity, mx1 = -Infinity, my1 = -Infinity;
for (const [a, b] of segs) for (const [x, y] of [a, b]) { mx0 = Math.min(mx0, x); mx1 = Math.max(mx1, x); my0 = Math.min(my0, y); my1 = Math.max(my1, y); }
const S = 0.13; // px por mm
const M = 90, TOP = 190, BOT = 150;
const W = Math.round((mx1 - mx0) * S + M * 2), H = Math.round((my1 - my0) * S + TOP + BOT);
const X = (x) => M + (x - mx0) * S, Y = (y) => TOP + (my1 - y) * S; // y hacia arriba, como en AutoCAD
const verde = "#1B5E20", azul = "#1E4E8C";
let lineas = "";
for (const [a, b] of segs) lineas += `<line x1="${X(a[0]).toFixed(1)}" y1="${Y(a[1]).toFixed(1)}" x2="${X(b[0]).toFixed(1)}" y2="${Y(b[1]).toFixed(1)}"/>`;
const T = (x, y, t, s = 15, a = "middle", w = 400, c = "#222") => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${s}" font-weight="${w}" text-anchor="${a}" fill="${c}">${t}</text>`;
const cota = (x1, x2, y, label) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${azul}" stroke-width="1.2"/><line x1="${x1}" y1="${y - 7}" x2="${x1}" y2="${y + 7}" stroke="${azul}" stroke-width="1.2"/><line x1="${x2}" y1="${y - 7}" x2="${x2}" y2="${y + 7}" stroke="${azul}" stroke-width="1.2"/><path d="M ${x1} ${y} l 9 -4 l 0 8 z M ${x2} ${y} l -9 -4 l 0 8 z" fill="${azul}"/>` + T((x1 + x2) / 2, y - 9, label, 16, "middle", 700, azul);

/* números de salida: las de arriba arriba del dibujo, las de abajo abajo */
let nums = "";
for (let i = 0; i < N; i++) {
  const xc = X(i * PASO + 300);
  nums += i % 2 === 0 ? T(xc, Y(1190) - 8, String(i + 1), 13, "middle", 700, verde) : T(xc, Y(my0) + 20, String(i + 1), 13, "middle", 700, verde);
}
const rot = (x, y, t) => T(x, y, t, 13, "middle", 700, "#444");
nums += rot(X(X_SING + 1650), Y(my0) + 20, "SINGULADOR · bandas en V") + rot(X(-3300), Y(my0) + 20, "RODILLOS DE ENTRADA") + rot(X(-1200), Y(my0) + 20, "CÁMARAS") + rot(X(X_TRANS + 1270), Y(my0) + 20, "TRANSMISIÓN");

const yC = Y(my0) + 62;
let cotas = cota(X(0), X(N * PASO), yC, `18 salidas a cada 22½" (571.5 mm) · alternadas, 9 por lado · ${(N * PASO / 1000).toFixed(2)} m`);
cotas += cota(X(0), X(PASO * 2), Y(1190) - 34, "22½\" + 22½\"");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#fff"/>
  ${T(M, 42, "Clasificadora Meganics · 2 líneas x 18 salidas · paso 3¾\" · vista de planta", 24, "start", 700, verde)}
  ${T(M, 68, "Medidas reales (técnico, 21-oct-2026): singulador 2.1 m x 0.914 m · clasificadora 13.1 m largo x 0.914 m ancho x 1.5 m alto · 18 salidas a cada 22½\", alternadas · caídas a ambos lados.", 13, "start")}
  ${T(M, 88, "Dibujo de planta armado con los bloques de clasificadora de rodillos 3¾\" de ELFCO; la proporción de entrada y transmisión es representativa. Las medidas se confirman en sitio.", 12, "start", 400, "#666")}
  <g stroke="#222" stroke-width="0.6" fill="none" stroke-linecap="round">${lineas}</g>
  ${cotas}${nums}
  ${T(W - 20, H - 14, "ELFCO · catalogo-vivo-kappa.vercel.app", 12, "end")}
</svg>`;
await sharp(Buffer.from(svg), { limitInputPixels: false }).png().toFile(SALIDA_PNG);
const m = await sharp(SALIDA_PNG).metadata();
console.log(SALIDA_PNG, m.width + "x" + m.height, "segmentos:", segs.length);
