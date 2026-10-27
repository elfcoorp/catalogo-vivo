import sharp from "sharp";
const D = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/";
await sharp("C:/Users/Propietario/Downloads/Cepillo Gemini Catalogo.jpeg")
  .extract({ left: 52, top: 36, width: 408, height: 100 })
  .resize({ width: 1224, kernel: "lanczos3" })   // al doble, para que no se pixelee
  .jpeg({ quality: 94, mozjpeg: true })
  .toFile(D + "cepillo-para-medir.jpg");
const m = await sharp(D + "cepillo-para-medir.jpg").metadata();
console.log("cepillo-para-medir.jpg:", m.width + "x" + m.height);
