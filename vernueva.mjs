import sharp from "sharp";
const S = "C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/0b2ec765-a5cc-41ae-b075-0647959ed8f9/scratchpad/";
const f = "C:/Users/Propietario/Downloads/Nueva foto para Catalogo .jpeg";
const m = await sharp(f).metadata();
console.log("tamaño:", m.width + "x" + m.height);
// acercamiento a la tapa cuadrada, el tercer cepillo
await sharp(f)
  .extract({ left: Math.round(m.width*0.55), top: Math.round(m.height*0.53), width: Math.round(m.width*0.20), height: Math.round(m.height*0.18) })
  .resize({ width: 700, kernel: "nearest" })
  .toFile(S + "zoom-tapa.png");
console.log("listo");
