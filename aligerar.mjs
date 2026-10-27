/**
 * Las fotos de los cepillos salieron del PDF en grande y pesan mucho.
 * Aquí se dejan del tamaño en que de veras se ven, para que el PDF que se
 * manda por WhatsApp no pese un ojo de la cara.
 */
import sharp from "sharp";
import { readdirSync, statSync, unlinkSync } from "node:fs";

const D = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/cepillos/";
const ANCHO = 460;

let antes = 0, despues = 0;
for (const n of readdirSync(D).filter((x) => x.endsWith(".png"))) {
  antes += statSync(D + n).size;
  const salida = D + n.replace(/\.png$/, ".jpg");
  await sharp(D + n)
    .resize({ width: ANCHO, withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(salida);
  despues += statSync(salida).size;
  unlinkSync(D + n);
}
console.log("antes:", Math.round(antes / 1024), "kB   ahora:", Math.round(despues / 1024), "kB");
