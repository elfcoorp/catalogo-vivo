/**
 * Además del rodillo, cada producto del catálogo trae un cuadrito con el
 * acercamiento a la fibra. Eso es lo que se saca aquí: sirve para enseñar
 * la textura de cerca.
 */
import * as mupdf from "mupdf";
import { readFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const ESCALA = 4;
const DESTINO = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/cepillos/";
mkdirSync(DESTINO, { recursive: true });

const doc = mupdf.Document.openDocument(
  readFileSync("C:/Users/Propietario/Downloads/CATALOGO DE CEPILLOS.pdf"),
  "application/pdf",
);

const HOJAS = {
  2: { arriba: "marfil" },
  3: { arriba: "azul", abajo: "mezclado" },
  4: { arriba: "pelo-sintetico", abajo: "marfil-suave" },
  5: { arriba: "beige", abajo: "verde" },
  6: { arriba: "rojo" },
};

for (const [hoja, quienes] of Object.entries(HOJAS)) {
  const p = Number(hoja);
  const pagina = doc.loadPage(p - 1);
  const caja = pagina.getBounds();
  const mitad = caja[1] + (caja[3] - caja[1]) / 2;

  const cuadros = [];
  pagina.toStructuredText("preserve-images").walk({
    onImageBlock(bbox) {
      const w = bbox[2] - bbox[0], h = bbox[3] - bbox[1];
      if (w < 40 || h < 40 || w / h > 3) return;
      cuadros.push({ bbox, area: w * h, medioY: (bbox[1] + bbox[3]) / 2 });
    },
  });

  const pix = pagina.toPixmap(mupdf.Matrix.scale(ESCALA, ESCALA), mupdf.ColorSpace.DeviceRGB, false, true);
  const render = Buffer.from(pix.asPNG());

  const recortar = async (c, nombre) => {
    const M = 4;
    const left = Math.max(0, Math.round((c.bbox[0] - caja[0]) * ESCALA) + M);
    const top = Math.max(0, Math.round((c.bbox[1] - caja[1]) * ESCALA) + M);
    const width = Math.round((c.bbox[2] - c.bbox[0]) * ESCALA) - M * 2;
    const height = Math.round((c.bbox[3] - c.bbox[1]) * ESCALA) - M * 2;
    await sharp(render).extract({ left, top, width, height }).png().toFile(DESTINO + nombre + ".png");
    console.log("  " + nombre.padEnd(22) + width + "x" + height);
  };

  console.log("hoja", p);
  for (const [donde, nombre] of Object.entries(quienes)) {
    const grupo = cuadros
      .filter((c) => (donde === "arriba" ? c.medioY < mitad : c.medioY >= mitad))
      .sort((a, b) => b.area - a.area);
    if (grupo[1]) await recortar(grupo[1], nombre + "-fibra"); // el segundo es el cuadrito
  }
}
console.log("\nlisto");
