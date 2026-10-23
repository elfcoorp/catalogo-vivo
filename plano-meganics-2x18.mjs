/**
 * Plano de planta de la Meganics 2 líneas x 18 salidas, ARMADO CON LOS BLOQUES
 * DE DON GUS (datos/gus/tomate-grape-2-lineas/: singulador, salida @22½" y
 * transmisión de 2 líneas), acomodados a las medidas que dio Osvaldo, el
 * técnico (21-oct-2026): singulador 2.1 m, clasificadora 13.1 m x 0.914 m,
 * 18 salidas a cada 22½" alternadas a los dos lados (Eduardo, 22-oct).
 *
 * Los bloques de Gus son de la familia CIU paso 1¼"; aquí se usan como dibujo
 * representativo de una clasificadora de 2 líneas, con las medidas de la
 * Meganics. Así lo dice la nota del plano.
 *
 *   node plano-meganics-2x18.mjs && node planos-a-pdf.mjs
 */
import sharp from "sharp";
import { parejas, leer, aplanar } from "file:///C:/Users/Propietario/Desktop/ERP%20ELFCO/erp-elfco/herramientas/dxf.mjs";

const G = "C:/Users/Propietario/Desktop/ERP ELFCO/erp-elfco/datos/gus/tomate-grape-2-lineas/";
const carga = (f) => { const { bloques, dibujo } = leer(parejas(G + f)); const ins = dibujo.find((e) => e.tipo === "INSERT"); const nombre = (ins.d[2] || "").trim(); return { ents: bloques.get(nombre), bloques }; };
const SING = carga("SINGULADOR 2L 1¼.dxf");
const SAL = carga("SALIDA 2L 1¼@22½IN.dxf");
const TRANS = carga("TRANSMISION 2L 1¼.dxf");

/* --- medidas de la Meganics (mm) --- */
const L_SING = 2100, L_CLAS = 13100, ANCHO = 914, PASO_SAL = 571.5, N_SAL = 18;
const L_TRANS = 2049; // el bloque de transmisión de Gus
const x0Sal = L_SING + 760; // tramo de cámaras antes de la primera salida
const L_TOTAL = L_SING + L_CLAS;

/* --- cada bloque se coloca con su eje de cadena en y = 0 (hacia abajo en el dibujo) --- */
let segs = [];
const pon = (b, T) => { segs = segs.concat(aplanar(b.ents, b.bloques, T)); };
/* singulador: Gus lo dibujó de 3,258; se acorta a 2,100 (escala en x) y se centra */
pon(SING, { x: 42 * (L_SING / 3258), y: -443, ex: L_SING / 3258, ey: 1, r: 0 });
/* salidas alternadas: pares arriba (espejo), nones abajo */
for (let i = 0; i < N_SAL; i++) {
  const x = x0Sal + i * PASO_SAL - 30; // el bloque empieza en x local 30
  const arriba = i % 2 === 0;
  pon(SAL, arriba ? { x, y: 520, ex: 1, ey: -1, r: 0 } : { x, y: -520, ex: 1, ey: 1, r: 0 });
}
/* transmisión al final */
pon(TRANS, { x: L_TOTAL - 563, y: -600, ex: 1, ey: 1, r: 0 });

/* --- caja de la clasificadora (cuerpo) y cajón de cámaras, dibujados aquí --- */
const extra = [];
const caja = (x1, y1, x2, y2) => { extra.push([[x1, y1], [x2, y1]], [[x2, y1], [x2, y2]], [[x2, y2], [x1, y2]], [[x1, y2], [x1, y1]]); };
caja(L_SING, -ANCHO / 2, L_TOTAL, ANCHO / 2);           // cuerpo 13.1 x 0.914
caja(L_SING + 60, -ANCHO / 2 + 40, x0Sal - 60, ANCHO / 2 - 40); // cajón de cámaras
/* las dos líneas de rodillos a lo largo de la clasificadora */
for (const y of [-41, -10, 10, 41]) extra.push([[x0Sal, y], [L_TOTAL - L_TRANS + 563, y]]);
segs = segs.concat(extra);

/* --- a SVG con escala y cotas --- */
let mx0 = Infinity, my0 = Infinity, mx1 = -Infinity, my1 = -Infinity;
for (const [a, b] of segs) for (const [x, y] of [a, b]) { mx0 = Math.min(mx0, x); mx1 = Math.max(mx1, x); my0 = Math.min(my0, y); my1 = Math.max(my1, y); }
const S = 0.14; // px por mm
const M = 110, TOP = 165, BOT = 190;
const W = Math.round((mx1 - mx0) * S + M * 2 + 220), H = Math.round((my1 - my0) * S + TOP + BOT);
const X = (x) => M + (x - mx0) * S, Y = (y) => TOP + (y - my0) * S;
const verde = "#1B5E20", azul = "#1E4E8C";
let lineas = "";
for (const [a, b] of segs) lineas += `<line x1="${X(a[0]).toFixed(1)}" y1="${Y(a[1]).toFixed(1)}" x2="${X(b[0]).toFixed(1)}" y2="${Y(b[1]).toFixed(1)}"/>`;
const T = (x, y, t, s = 15, a = "middle", w = 400, c = "#222") => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${s}" font-weight="${w}" text-anchor="${a}" fill="${c}">${t}</text>`;
const cota = (x1, x2, y, label) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${azul}" stroke-width="1.2"/><line x1="${x1}" y1="${y - 7}" x2="${x1}" y2="${y + 7}" stroke="${azul}" stroke-width="1.2"/><line x1="${x2}" y1="${y - 7}" x2="${x2}" y2="${y + 7}" stroke="${azul}" stroke-width="1.2"/><path d="M ${x1} ${y} l 9 -4 l 0 8 z M ${x2} ${y} l -9 -4 l 0 8 z" fill="${azul}"/>` + T((x1 + x2) / 2, y - 9, label, 16, "middle", 700, azul);
const cotaV = (x, y1, y2, label) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${azul}" stroke-width="1.2"/><line x1="${x - 7}" y1="${y1}" x2="${x + 7}" y2="${y1}" stroke="${azul}" stroke-width="1.2"/><line x1="${x - 7}" y1="${y2}" x2="${x + 7}" y2="${y2}" stroke="${azul}" stroke-width="1.2"/><path d="M ${x} ${y1} l -4 9 l 8 0 z M ${x} ${y2} l -4 -9 l 8 0 z" fill="${azul}"/>` + `<text x="${x + 12}" y="${(y1 + y2) / 2 + 6}" font-family="Arial" font-size="16" font-weight="700" fill="${azul}">${label}</text>`;

const yC = Y(my1) + 46;
let cotas = cota(X(0), X(L_SING), yC, "2.10 m") + cota(X(L_SING), X(L_TOTAL), yC, "13.10 m") + cota(X(0), X(L_TOTAL), yC + 44, `${(L_TOTAL / 1000).toFixed(2)} m en total`);
cotas += cotaV(X(L_TOTAL) + 60, Y(-ANCHO / 2), Y(ANCHO / 2), "0.914 m (3')");
cotas += cotaV(X(L_TOTAL) + 150, Y(my0), Y(my1), `${((my1 - my0) / 1000).toFixed(2)} m con caídas`);
cotas += cota(X(x0Sal), X(x0Sal + PASO_SAL * 2), Y(my0) - 18, "22½\" entre salidas · alternadas");
/* números de salida */
let nums = ""; for (let i = 0; i < N_SAL; i++) { const xc = X(x0Sal + i * PASO_SAL + PASO_SAL / 2); const yc = i % 2 === 0 ? Y(my0) + 18 : Y(my1) - 8; nums += T(xc, yc, String(i + 1), 12, "middle", 700, verde); }
const rot = (x, y, t) => T(x, y, t, 13, "middle", 700, "#444");
nums += rot(X(L_SING / 2), Y(ANCHO / 2) + 24, "SINGULADOR · bandas en V") + rot(X((L_SING + x0Sal) / 2), Y(-ANCHO / 2) - 10, "cámaras") + rot(X(L_TOTAL - L_TRANS / 2), Y(ANCHO / 2) + 24, "TRANSMISIÓN");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#fff"/>
  ${T(M, 44, "Clasificadora Meganics · 2 líneas x 18 salidas · vista de planta", 24, "start", 700, verde)}
  ${T(M, 70, "Medidas del técnico (21-oct-2026): singulador 2.1 m, clasificadora 13.1 m x 0.914 m, alto 1.5 m. 18 salidas a cada 22½\", alternadas. Banda de retorno aparte, a un costado.", 13, "start")}
  ${T(M, 90, "Dibujo representativo armado con bloques de clasificadora de 2 líneas; las medidas son las de la Meganics. Se confirma en sitio.", 12, "start", 400, "#666")}
  <g stroke="#222" stroke-width="0.7" fill="none" stroke-linecap="round">${lineas}</g>
  ${cotas}${nums}
  ${T(W - 20, H - 16, "ELFCO · catalogo-vivo-kappa.vercel.app", 12, "end")}
</svg>`;
await sharp(Buffer.from(svg)).png().toFile("public/planos/meganics-2x18-plano.png");
const m = await sharp("public/planos/meganics-2x18-plano.png").metadata();
console.log("meganics-2x18-plano.png", m.width + "x" + m.height, "segmentos:", segs.length);
