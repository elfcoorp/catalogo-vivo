/**
 * Saca todas las fotos que trae dentro el catálogo de cepillos del proveedor,
 * y arma una hoja de contactos para verlas todas juntas de un jalón.
 */
import * as mupdf from "mupdf";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const S = "C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/0b2ec765-a5cc-41ae-b075-0647959ed8f9/scratchpad/";
const DESTINO = S + "cepillos-proveedor/";
mkdirSync(DESTINO, { recursive: true });

const doc = mupdf.Document.openDocument(readFileSync("C:/Users/Propietario/Downloads/CATALOGO DE CEPILLOS.pdf"), "application/pdf");

const encontradas = [];
for (let p = 0; p < doc.countPages(); p++) {
  const pagina = doc.loadPage(p);
  let n = 0;
  pagina.toStructuredText("preserve-images").walk({
    onImageBlock(bbox, matriz, imagen) {
      try {
        const pix = imagen.toPixmap();
        const w = pix.getWidth(), h = pix.getHeight();
        if (w < 90 || h < 90) return; // los adornitos de fruta no interesan
        const nombre = "h" + (p + 1) + "-" + (++n) + ".png";
        writeFileSync(DESTINO + nombre, pix.asPNG());
        encontradas.push({ nombre, w, h, hoja: p + 1 });
      } catch (e) { /* alguna no se deja, ni modo */ }
    },
  });
}

console.log("fotos sacadas:", encontradas.length);
for (const f of encontradas) console.log("  hoja", f.hoja, f.nombre, f.w + "x" + f.h);

/* La hoja de contactos: todas en cuadritos, con su nombre debajo */
const LADO = 190, COLS = 6, ALTO_ROTULO = 22;
const filas = Math.ceil(encontradas.length / COLS);
const piezas = [];
for (let i = 0; i < encontradas.length; i++) {
  const f = encontradas[i];
  const x = (i % COLS) * LADO, y = Math.floor(i / COLS) * (LADO + ALTO_ROTULO);
  piezas.push({
    input: await sharp(DESTINO + f.nombre)
      .resize(LADO - 10, LADO - 10, { fit: "contain", background: "#ffffff" })
      .png().toBuffer(),
    left: x + 5, top: y + 5,
  });
  piezas.push({
    input: Buffer.from(
      `<svg width="${LADO}" height="${ALTO_ROTULO}"><text x="6" y="15" font-family="monospace" font-size="13" fill="#222">${f.nombre} ${f.w}x${f.h}</text></svg>`,
    ),
    left: x, top: y + LADO,
  });
}
await sharp({ create: { width: COLS * LADO, height: filas * (LADO + ALTO_ROTULO), channels: 3, background: "#ffffff" } })
  .composite(piezas).png().toFile(S + "hoja-de-contactos.png");
console.log("hoja de contactos lista");
