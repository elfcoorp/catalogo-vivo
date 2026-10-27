import sharp from "sharp";
const S = "C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/0b2ec765-a5cc-41ae-b075-0647959ed8f9/scratchpad/";
const f = "C:/Users/Propietario/Downloads/WhatsApp Image 2026-09-01 at 4.24.26 PM.jpeg";
const m = await sharp(f).metadata();
console.log("tamano:", m.width, "x", m.height);
// el hombro del morron, donde se ve la rayada
await sharp(f).extract({ left: Math.round(m.width*0.19), top: Math.round(m.height*0.35), width: Math.round(m.width*0.30), height: Math.round(m.height*0.16) })
  .resize({ width: 1000 }).toFile(S + "zoom-corte.png");
console.log("listo");
