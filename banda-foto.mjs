import sharp from "sharp";
const D = "C:/Users/Propietario/Desktop/ERP ELFCO/fichas/imagenes/";
import { mkdirSync } from "node:fs";
mkdirSync(D, { recursive: true });
const f = "C:/Users/Propietario/Downloads/Banda PVC Azul .jpeg";
const m = await sharp(f).metadata();
console.log("original:", m.width + "x" + m.height);
/* se deja a lo ancho, que es como va en la tarjeta, y se le sube un poco la luz */
await sharp(f)
  .rotate()
  .resize({ width: 1600, withoutEnlargement: false, kernel: "lanczos3" })
  .modulate({ brightness: 1.04, saturation: 1.05 })
  .sharpen({ sigma: 0.6 })
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(D + "banda-azul.jpg");
const n = await sharp(D + "banda-azul.jpg").metadata();
console.log("lista:", n.width + "x" + n.height);
