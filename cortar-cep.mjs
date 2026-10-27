import sharp from "sharp";
const S = "C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/0b2ec765-a5cc-41ae-b075-0647959ed8f9/scratchpad/";
const f = "C:/Users/Propietario/Downloads/Cepillo Gemini Catalogo.jpeg";
await sharp(f).extract({ left: 44, top: 36, width: 424, height: 100 })
  .resize({ width: 948, kernel: "lanczos3" })
  .toFile(S + "cep-corte.png");
console.log("listo");
