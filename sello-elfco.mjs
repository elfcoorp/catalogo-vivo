/**
 * El "circulito" que quiere Eduardo es el sello redondo del catálogo:
 * el logo completo dentro de un disco blanco con aro verde.
 * Aquí se arma limpio, con fondo transparente, para ponerlo sobre la foto.
 */
import sharp from "sharp";

const ORIGEN = "C:/Users/Propietario/Desktop/Catalogo Claude/public/logo.png";
const SALIDA = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/sello-elfco.png";

const LADO = 512;

/* El logo del catálogo YA trae su aro. Solo se recorta y se escala:
   no se le pone otro encima, que fue el error de la primera vuelta. */
const dentro = await sharp(ORIGEN)
  .trim({ threshold: 6 })
  .resize({ width: LADO, height: LADO, fit: "contain", background: { r:0,g:0,b:0,alpha:0 } })
  .png()
  .toBuffer();

/* Nada más el relleno blanco por dentro, para que no se transparente la foto */
const disco = Buffer.from(
  `<svg width="${LADO}" height="${LADO}">
     <circle cx="${LADO / 2}" cy="${LADO / 2}" r="${LADO / 2 - 3}" fill="#ffffff"/>
   </svg>`,
);

await sharp(await sharp(disco).png().toBuffer())
  .composite([{ input: dentro, gravity: "center" }])
  .png()
  .toFile(SALIDA);

const m = await sharp(SALIDA).metadata();
console.log("sello-elfco.png listo:", m.width + "x" + m.height);
