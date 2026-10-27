/**
 * Dice qué foto va con qué nombre, midiendo cuál título le queda más cerca
 * a cada foto dentro de la hoja. Así no se adivina.
 */
import * as mupdf from "mupdf";
import { readFileSync } from "node:fs";

const doc = mupdf.Document.openDocument(
  readFileSync("C:/Users/Propietario/Downloads/CATALOGO DE CEPILLOS.pdf"),
  "application/pdf",
);

const centro = (b) => ({ x: (b[0] + b[2]) / 2, y: (b[1] + b[3]) / 2 });

for (let p = 1; p <= doc.countPages(); p++) {
  const pagina = doc.loadPage(p - 1);
  const st = pagina.toStructuredText("preserve-images");

  const fotos = [];
  const titulos = [];
  let n = 0;

  st.walk({
    onImageBlock(bbox, m, img) {
      const pix = img.toPixmap();
      if (pix.getWidth() < 90 || pix.getHeight() < 90) return;
      fotos.push({ nombre: "h" + p + "-" + ++n, c: centro(bbox), bbox });
    },
  });

  const datos = JSON.parse(st.asJSON());
  for (const b of datos.blocks) {
    for (const l of b.lines || []) {
      const t = (l.text || "").trim();
      // los títulos del catálogo van en MAYÚSCULAS
      if (t.length > 3 && t === t.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(t)) {
        titulos.push({ t, c: centro([l.bbox.x, l.bbox.y, l.bbox.x + l.bbox.w, l.bbox.y + l.bbox.h]) });
      }
    }
  }

  if (!fotos.length || !titulos.length) continue;
  console.log("\n=== HOJA " + p);
  for (const f of fotos) {
    let mejor = null, dist = 1e9;
    for (const t of titulos) {
      const d = Math.hypot(f.c.x - t.c.x, f.c.y - t.c.y);
      if (d < dist) { dist = d; mejor = t.t; }
    }
    console.log("  " + f.nombre.padEnd(8) + " -> " + mejor + "   (a " + Math.round(dist) + " pts)");
  }
}
