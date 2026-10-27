/**
 * Saca de la hoja, ya renderizada en grande, la foto de cada cepillo.
 * Se recorta por el recuadro que el propio PDF le da a cada imagen, así que
 * no se anda adivinando dónde está.
 *
 * Qué cepillo es cuál se sacó leyendo el catálogo hoja por hoja:
 * cada hoja trae uno o dos productos, el de arriba y el de abajo.
 */
import * as mupdf from "mupdf";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const ESCALA = 4;
const DESTINO = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/cepillos/";
mkdirSync(DESTINO, { recursive: true });

const doc = mupdf.Document.openDocument(
  readFileSync("C:/Users/Propietario/Downloads/CATALOGO DE CEPILLOS.pdf"),
  "application/pdf",
);

/* Lo que trae cada hoja: arriba y abajo. Verificado a ojo, hoja por hoja. */
const HOJAS = {
  2: { arriba: "marfil" },
  3: { arriba: "azul", abajo: "mezclado" },
  4: { arriba: "pelo-sintetico", abajo: "marfil-suave" },
  5: { arriba: "beige", abajo: "verde" },
  6: { arriba: "rojo", abajo: "mechudos" },
  9: { arriba: "dulona-rollos" },
};

for (const [hoja, quienes] of Object.entries(HOJAS)) {
  const p = Number(hoja);
  const pagina = doc.loadPage(p - 1);
  const caja = pagina.getBounds(); // [x0,y0,x1,y1]
  const altoPagina = caja[3] - caja[1];

  /* Dónde cae cada imagen dentro de la hoja */
  const cuadros = [];
  pagina.toStructuredText("preserve-images").walk({
    onImageBlock(bbox, m, img) {
      const w = bbox[2] - bbox[0], h = bbox[3] - bbox[1];
      if (w < 40 || h < 40) return;        // los adornitos de fruta, fuera
      if (w / h > 3) return;               // los letreros de titulo son muy alargados, fuera
      cuadros.push({ bbox, area: w * h, medioY: (bbox[1] + bbox[3]) / 2 });
    },
  });

  /* La hoja en grande */
  const pix = pagina.toPixmap(mupdf.Matrix.scale(ESCALA, ESCALA), mupdf.ColorSpace.DeviceRGB, false, true);
  const renderizada = Buffer.from(pix.asPNG());
  const anchoR = pix.getWidth(), altoR = pix.getHeight();

  const recortar = async (c, nombre) => {
    const M = 6; // un respiro alrededor
    const left = Math.max(0, Math.round((c.bbox[0] - caja[0]) * ESCALA) - M);
    const top = Math.max(0, Math.round((c.bbox[1] - caja[1]) * ESCALA) - M);
    const width = Math.min(anchoR - left, Math.round((c.bbox[2] - c.bbox[0]) * ESCALA) + M * 2);
    const height = Math.min(altoR - top, Math.round((c.bbox[3] - c.bbox[1]) * ESCALA) + M * 2);
    await sharp(renderizada).extract({ left, top, width, height })
      .png().toFile(DESTINO + nombre + ".png");
    console.log("  " + nombre.padEnd(16) + width + "x" + height);
  };

  const mitad = caja[1] + altoPagina / 2;
  console.log("hoja", p);

  if (quienes.abajo) {
    const arriba = cuadros.filter((c) => c.medioY < mitad).sort((a, b) => b.area - a.area);
    const abajo = cuadros.filter((c) => c.medioY >= mitad).sort((a, b) => b.area - a.area);
    if (arriba[0]) await recortar(arriba[0], quienes.arriba);
    if (quienes.abajo === "mechudos") {
      // aquí van los dos, uno verde y uno café, del mismo tamaño
      for (let i = 0; i < Math.min(2, abajo.length); i++) await recortar(abajo[i], "mechudo-" + (i + 1));
    } else if (abajo[0]) {
      await recortar(abajo[0], quienes.abajo);
    }
  } else if (quienes.arriba === "dulona-rollos") {
    const rollos = cuadros.filter((c) => c.medioY < mitad).sort((a, b) => a.bbox[0] - b.bbox[0]);
    if (rollos[0]) await recortar(rollos[0], "dulona-verde");
    if (rollos[1]) await recortar(rollos[1], "dulona-azul");
  } else {
    const todos = cuadros.sort((a, b) => b.area - a.area);
    if (todos[0]) await recortar(todos[0], quienes.arriba);
  }
}
console.log("\nlisto ->", DESTINO);
