import sharp from "sharp";
import { readdirSync, renameSync, unlinkSync } from "node:fs";
const D = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/cepillos/";
for (const n of readdirSync(D).filter((x) => x.endsWith(".jpg"))) {
  const tmp = D + "_" + n;
  const antes = await sharp(D + n).metadata();
  await sharp(D + n).trim({ threshold: 12 }).jpeg({ quality: 86, mozjpeg: true }).toFile(tmp);
  const desp = await sharp(tmp).metadata();
  unlinkSync(D + n);
  renameSync(tmp, D + n);
  console.log(n.padEnd(24), antes.width + "x" + antes.height, "->", desp.width + "x" + desp.height);
}
