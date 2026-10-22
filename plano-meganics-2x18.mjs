/**
 * Plano de planta (largo y ancho) de la Meganics 2 líneas x 18 salidas, con
 * las medidas que dio Osvaldo, el técnico (21-oct-2026) y lo que dijo Eduardo
 * (22-oct): salidas a cada 22½", alternadas a los dos lados.
 *
 *   node plano-meganics-2x18.mjs  → public/planos/meganics-2x18-plano.png (+ .pdf con planos-a-pdf.mjs)
 */
import sharp from "sharp";

/* medidas en metros */
const SING = { largo: 2.1, ancho: 0.914 };
const CLAS = { largo: 13.1, ancho: 0.914 };
const SALIDAS = 18, PASO_SALIDA = 0.5715; // 22½"
const SALIDA_FONDO = 0.75; // lo que sobresale cada caída a cada lado (aprox., para el dibujo)
const TOTAL = SING.largo + CLAS.largo;

/* escala: 1 m = 110 px */
const S = 110, M = 90; // margen
const W = Math.round(TOTAL * S + M * 2), H = Math.round((CLAS.ancho + SALIDA_FONDO * 2) * S + M * 2 + 120);
const ox = M, oy = M + 60 + SALIDA_FONDO * S; // esquina superior izquierda del cuerpo
const px = (m) => (m * S).toFixed(1);

const verde = "#1B5E20", gris = "#333", claro = "#eef5ef";
let g = "";
const rect = (x, y, w, h, fill, stroke = gris) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const txt = (x, y, t, size = 15, anchor = "middle", weight = 400, color = gris) => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${color}">${t}</text>`;
const cota = (x1, x2, y, label) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${verde}" stroke-width="1.5"/><line x1="${x1}" y1="${y - 6}" x2="${x1}" y2="${y + 6}" stroke="${verde}" stroke-width="1.5"/><line x1="${x2}" y1="${y - 6}" x2="${x2}" y2="${y + 6}" stroke="${verde}" stroke-width="1.5"/>` + txt((x1 + x2) / 2, y - 8, label, 15, "middle", 700, verde);
const cotaV = (x, y1, y2, label) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${verde}" stroke-width="1.5"/><line x1="${x - 6}" y1="${y1}" x2="${x + 6}" y2="${y1}" stroke="${verde}" stroke-width="1.5"/><line x1="${x - 6}" y1="${y2}" x2="${x + 6}" y2="${y2}" stroke="${verde}" stroke-width="1.5"/>` + `<text x="${x + 10}" y="${(y1 + y2) / 2 + 5}" font-family="Arial" font-size="15" font-weight="700" fill="${verde}">${label}</text>`;

/* singulador */
g += rect(ox, oy, px(SING.largo), px(SING.ancho), claro);
g += txt(ox + SING.largo * S / 2, oy + SING.ancho * S / 2 - 6, "SINGULADOR", 14, "middle", 700);
g += txt(ox + SING.largo * S / 2, oy + SING.ancho * S / 2 + 12, "bandas en V · 2 líneas", 12);
/* clasificadora */
const cx = ox + SING.largo * S;
g += rect(cx, oy, px(CLAS.largo), px(CLAS.ancho), "#ffffff");
g += txt(cx + CLAS.largo * S / 2, oy + CLAS.ancho * S / 2 - 6, "CLASIFICADORA ELECTRÓNICA · 2 LÍNEAS x 18 SALIDAS", 15, "middle", 700);
g += txt(cx + CLAS.largo * S / 2, oy + CLAS.ancho * S / 2 + 12, "rodillos paso 3¾\" · cámaras · 12 frutos/s por línea", 12);
/* las dos líneas */
for (const f of [0.38, 0.62]) g += `<line x1="${cx + 8}" y1="${oy + CLAS.ancho * S * f}" x2="${cx + CLAS.largo * S - 8}" y2="${oy + CLAS.ancho * S * f}" stroke="#999" stroke-width="1" stroke-dasharray="6 4"/>`;
/* salidas alternadas: empiezan después del tramo de cámaras (aprox. 2.4 m) */
const inicioSalidas = cx + 2.4 * S;
for (let i = 0; i < SALIDAS; i++) {
  const x = inicioSalidas + i * PASO_SALIDA * S;
  const arriba = i % 2 === 0;
  const y = arriba ? oy - SALIDA_FONDO * S : oy + CLAS.ancho * S;
  g += rect(x, y, px(PASO_SALIDA), px(SALIDA_FONDO), "#dfe9e2");
  g += txt(x + PASO_SALIDA * S / 2, y + SALIDA_FONDO * S / 2 + 5, String(i + 1), 12, "middle", 700);
}
/* cotas */
const yCota = oy + CLAS.ancho * S + SALIDA_FONDO * S + 40;
g += cota(ox, cx, yCota, "2.10 m");
g += cota(cx, cx + CLAS.largo * S, yCota, "13.10 m");
g += cota(ox, cx + CLAS.largo * S, yCota + 40, `${TOTAL.toFixed(2)} m en total`);
g += cotaV(cx + CLAS.largo * S + 40, oy, oy + CLAS.ancho * S, "0.914 m (3')");
g += cotaV(cx + CLAS.largo * S + 40, oy - SALIDA_FONDO * S, oy + CLAS.ancho * S + SALIDA_FONDO * S, "");
g += txt(cx + CLAS.largo * S + 52, oy - SALIDA_FONDO * S + 18, "con caídas:", 13, "start", 400, verde);
g += txt(cx + CLAS.largo * S + 52, oy - SALIDA_FONDO * S + 36, `~${(CLAS.ancho + SALIDA_FONDO * 2).toFixed(2)} m`, 15, "start", 700, verde);
g += cota(inicioSalidas, inicioSalidas + PASO_SALIDA * S * 2, oy - SALIDA_FONDO * S - 16, "22½\" entre salidas, alternadas");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W + 160}" height="${H + 40}" viewBox="0 0 ${W + 160} ${H + 40}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  ${txt(M, 40, "Clasificadora Meganics · 2 líneas x 18 salidas · vista de planta", 22, "start", 700, verde)}
  ${txt(M, 64, "Medidas del técnico (21-oct-2026). Alto de la clasificadora: 1.5 m. Banda de retorno aparte, a un costado. La profundidad de las caídas es aproximada.", 13, "start")}
  ${g}
  ${txt(W + 150, H + 25, "ELFCO · catálogo-vivo-kappa.vercel.app", 12, "end")}
</svg>`;
await sharp(Buffer.from(svg)).png().toFile("public/planos/meganics-2x18-plano.png");
const m = await sharp("public/planos/meganics-2x18-plano.png").metadata();
console.log("meganics-2x18-plano.png", m.width + "x" + m.height);
