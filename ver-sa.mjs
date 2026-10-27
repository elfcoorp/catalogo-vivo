import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
const D = "C:/Users/Propietario/Desktop/ERP ELFCO/san-antonio/";
const S = "C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/0b2ec765-a5cc-41ae-b075-0647959ed8f9/scratchpad/";

for (const carpeta of ["fotos", "planos"]) {
  const arch = readdirSync(D + carpeta).filter(n => /\.(jpe?g|png)$/i.test(n));
  console.log("\n=== " + carpeta.toUpperCase() + " ===");
  const piezas = [];
  const LADO = 300, COLS = 4, R = 26;
  for (let i = 0; i < arch.length; i++) {
    const r = D + carpeta + "/" + arch[i];
    const m = await sharp(r).metadata();
    console.log("  " + arch[i].padEnd(28) + m.width + "x" + m.height + "  " + Math.round(statSync(r).size/1024) + " kB");
    const x = (i % COLS) * LADO, y = Math.floor(i / COLS) * (LADO + R);
    piezas.push({ input: await sharp(r).resize(LADO-8, LADO-8, {fit:"contain", background:"#fff"}).png().toBuffer(), left:x+4, top:y+4 });
    piezas.push({ input: Buffer.from(`<svg width="${LADO}" height="${R}"><text x="6" y="17" font-family="monospace" font-size="13" fill="#111">${i+1}. ${m.width}x${m.height}</text></svg>`), left:x, top:y+LADO });
  }
  await sharp({create:{width:COLS*LADO, height:Math.ceil(arch.length/COLS)*(LADO+R), channels:3, background:"#fff"}})
    .composite(piezas).png().toFile(S + "sa-" + carpeta + ".png");
}
console.log("\nhojas de contacto listas");
