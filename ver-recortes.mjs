import sharp from "sharp";
import { readdirSync } from "node:fs";
const D = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/cepillos/";
const S = "C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/0b2ec765-a5cc-41ae-b075-0647959ed8f9/scratchpad/";
const f = readdirSync(D).filter(n => n.endsWith(".png")).sort();
const LADO = 230, COLS = 4, R = 24;
const piezas = [];
for (let i = 0; i < f.length; i++) {
  const x = (i % COLS) * LADO, y = Math.floor(i / COLS) * (LADO + R);
  piezas.push({ input: await sharp(D + f[i]).resize(LADO - 8, LADO - 8, { fit: "contain", background: "#fff" }).png().toBuffer(), left: x + 4, top: y + 4 });
  piezas.push({ input: Buffer.from(`<svg width="${LADO}" height="${R}"><text x="6" y="16" font-family="monospace" font-size="14" fill="#111">${f[i].replace(".png","")}</text></svg>`), left: x, top: y + LADO });
}
await sharp({ create: { width: COLS * LADO, height: Math.ceil(f.length / COLS) * (LADO + R), channels: 3, background: "#fff" } })
  .composite(piezas).png().toFile(S + "recortes.png");
console.log("listo", f.length);
