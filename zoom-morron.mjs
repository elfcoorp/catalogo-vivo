import sharp from "sharp";
const S = "C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/0b2ec765-a5cc-41ae-b075-0647959ed8f9/scratchpad/";
const f = S + "morrones/WhatsApp Image 2026-09-01 at 4.24.19 PM.jpeg";
const m = await sharp(f).metadata();
console.log("tamano:", m.width, "x", m.height);
// el morron partido de color cafe, a media derecha
await sharp(f).extract({ left: Math.round(m.width*0.60), top: Math.round(m.height*0.39), width: Math.round(m.width*0.28), height: Math.round(m.height*0.16) })
  .resize({ width: 900 }).toFile(S + "zoom-danio.png");
console.log("listo");
