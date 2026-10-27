import sharp from "sharp";
const f = "C:/Users/Propietario/Downloads/WhatsApp Image 2026-09-02 at 10.58.18 AM.jpeg";
const m = await sharp(f).metadata();
console.log("tamaño:", m.width + "x" + m.height);
