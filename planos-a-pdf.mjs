/**
 * Convierte cada plano PNG de public/planos/ en un PDF del mismo nombre.
 * Por qué: el botón "Descargar plano" apuntaba al PNG con `download`, y en el
 * teléfono (sobre todo abriendo el catálogo desde WhatsApp) eso no descarga
 * nada. Un PDF se abre en cualquier teléfono con su botón de guardar/compartir.
 *
 *   node planos-a-pdf.mjs
 */
import { jsPDF } from "jspdf";
import sharp from "sharp";
import { readdirSync, writeFileSync } from "node:fs";

const DIR = "public/planos/";
for (const f of readdirSync(DIR).filter((f) => f.endsWith(".png"))) {
  const img = sharp(DIR + f);
  const { width, height } = await img.metadata();
  /* la hoja toma la forma de la imagen, en pulgadas, con 11 o 17 de lado largo */
  const apaisado = width >= height;
  const largo = 17, corto = (largo * Math.min(width, height)) / Math.max(width, height);
  const w = apaisado ? largo : corto, h = apaisado ? corto : largo;
  const jpg = await img.jpeg({ quality: 88 }).toBuffer();
  const pdf = new jsPDF({ unit: "in", format: [w, h], orientation: apaisado ? "landscape" : "portrait" });
  pdf.addImage("data:image/jpeg;base64," + jpg.toString("base64"), "JPEG", 0, 0, w, h);
  pdf.setProperties({ title: "Plano ELFCO · " + f.replace(/-plano\.png$/, "").replace(/-/g, " "), creator: "ELFCO" });
  const salida = DIR + f.replace(/\.png$/, ".pdf");
  writeFileSync(salida, Buffer.from(pdf.output("arraybuffer")));
  console.log(salida, Math.round(Buffer.byteLength(pdf.output("arraybuffer")) / 1024) + " KB", w.toFixed(1) + " x " + h.toFixed(1) + " in");
}
