import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
const D = "C:/Users/Propietario/Downloads/";
const recientes = readdirSync(D)
  .filter(n => /\.(jpe?g|png|webp)$/i.test(n))
  .map(n => ({ n, t: statSync(D + n).mtimeMs }))
  .sort((a, b) => b.t - a.t).slice(0, 3);
for (const r of recientes) {
  const m = await sharp(D + r.n).metadata();
  console.log(m.width + "x" + m.height, " ", r.n);
}
