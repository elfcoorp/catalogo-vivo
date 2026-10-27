import sharp from "sharp";
const D = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/";
/* Quedaron dos rayitas grises verticales: son las líneas de cota que traía
   el dibujo del proveedor. Se tapan con blanco arriba y abajo de la flecha. */
const parche = (w, h) => ({
  input: { create: { width: w, height: h, channels: 3, background: "#ffffff" } },
});
await sharp(D + "cepillo-para-medir.jpg")
  .composite([
    { ...parche(20, 76), left: 53, top: 0 },
    { ...parche(20, 78), left: 53, top: 222 },
    { ...parche(20, 76), left: 1149, top: 0 },
    { ...parche(20, 78), left: 1149, top: 222 },
  ])
  .jpeg({ quality: 94, mozjpeg: true })
  .toFile(D + "cepillo-para-medir-limpio.jpg");
console.log("rayitas tapadas");
