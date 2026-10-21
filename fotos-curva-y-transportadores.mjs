/**
 * Fotos de la curva de banda termoplástica y de los transportadores de rodillos
 * (21-oct-2026), y la imagen "para qué sirve" sacada del layout: se recorta el
 * cuadro de datos y el logo del fabricante, se agranda y se le ponen letreros
 * señalando dónde van las curvas y los transportadores.
 */
import sharp from "sharp";
import { statSync } from "node:fs";

const D = "C:/Users/Propietario/Downloads/WhatsApp Image 2026-10-21 at ";
const Z = "C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/911a6a12-46c4-4afd-9598-40551dbbb1fd/scratchpad/bandas-oct21/zip/WhatsApp Image 2026-10-21 at ";

const FOTOS = [
  ["9.29.25 AM.jpeg", "curva-termoplastica-1.jpg", "curva de lado, con su motorreductor"],
  ["9.29.25 AM (1).jpeg", "curva-termoplastica-2.jpg", "curva completa, vista del lado largo"],
  ["9.29.25 AM (2).jpeg", "curva-termoplastica-3.jpg", "banda termoplástica de cerca"],
  ["9.22.49 AM.jpeg", "transportador-rodillos-1.jpg", "los transportadores de rodillos, guardados"],
];
for (const [src, out, que] of FOTOS) {
  const salida = "public/productos/" + out;
  await sharp(D + src).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .modulate({ brightness: 1.04, saturation: 1.06 }).linear(1.05, -5).sharpen({ sigma: 0.8 })
    .jpeg({ quality: 82, mozjpeg: true }).toFile(salida);
  const m = await sharp(salida).metadata();
  console.log(out, m.width + "x" + m.height, Math.round(statSync(salida).size / 1024) + " KB ·", que);
}

/* --- la imagen de "para qué sirve": el layout sin el cuadro de datos ni el logo --- */
const plano = Z + "10.00.05 AM.jpeg";
const { width: W, height: H } = await sharp(plano).metadata(); // 700 x 1280
const left = 80; // fuera: la franja izquierda con "DATOS DEL PROYECTO" y el logo
const recorte = { left, top: 40, width: W - left - 10, height: H - 80 };
const K = 2; // se agranda al doble
const w = recorte.width * K, h = recorte.height * K;
const base = await sharp(plano).extract(recorte).resize(w, h, { kernel: "lanczos3" }).toBuffer();

/* coordenadas en la imagen recortada y agrandada (x2) */
const txt = (x, y, t, anchor = "start") => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#0b5d2a" text-anchor="${anchor}" stroke="#ffffff" stroke-width="7" paint-order="stroke">${t}</text>`;
const flecha = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0b5d2a" stroke-width="5" marker-end="url(#p)"/>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><marker id="p" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#0b5d2a"/></marker></defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="none"/>
  ${flecha(560, 290, 700, 190)}
  ${txt(300, 300, "CURVAS DE BANDA TERMOPLÁSTICA 90°")}
  ${txt(300, 334, "unen dos tramos en esquina, sin golpear la fruta")}
  ${flecha(700, 480, 560, 560)}
  ${txt(720, 470, "otra curva", "start")}
  ${flecha(300, 1110, 420, 1180)}
  ${txt(60, 1100, "TRANSPORTADORES DE RODILLOS")}
  ${txt(60, 1134, "llevan la caja de una máquina a otra")}
  ${txt(w - 20, h - 24, "Ejemplo de layout de un empaque de tomate · ELFCO", "end")}
</svg>`;
await sharp(base).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).jpeg({ quality: 85, mozjpeg: true }).toFile("public/productos/curva-termoplastica-layout.jpg");
const m = await sharp("public/productos/curva-termoplastica-layout.jpg").metadata();
console.log("curva-termoplastica-layout.jpg", m.width + "x" + m.height, Math.round(statSync("public/productos/curva-termoplastica-layout.jpg").size / 1024) + " KB");
