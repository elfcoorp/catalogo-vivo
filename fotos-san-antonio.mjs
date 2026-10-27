/**
 * Deja presentables las fotos de la máquina de San Antonio, para el catálogo.
 *
 * Qué se les hace:
 *   1. Se les empareja la luz. Están tomadas en bodega, salen apagadas.
 *   2. Se recortan a 4:3 acostado, que es como se ven en el catálogo.
 *      Vienen en 900x1600 parado, o sea del celular.
 *   3. Se les pone el sello de elfco en la esquina, para que si alguien las
 *      toma prestadas se sepa de quién son.
 *
 * NO se les inventa nada. Es la misma foto, nada más pareja de luz.
 */
import sharp from "sharp";
import { readdirSync, mkdirSync } from "node:fs";

const ORIGEN = "C:/Users/Propietario/Desktop/ERP ELFCO/san-antonio/fotos/";
const DESTINO = "C:/Users/Propietario/Desktop/ERP ELFCO/san-antonio/fotos-listas/";
const SELLO = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/sello-elfco.png";

mkdirSync(DESTINO, { recursive: true });

const ANCHO = 1400, ALTO = 1050;   // 4:3 acostado
const SELLO_LADO = 132;

/* El sello, con un velo suave detrás para que se lea sobre cualquier foto */
const sello = await sharp(SELLO)
  .resize(SELLO_LADO, SELLO_LADO, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .composite([{
    input: Buffer.from(
      `<svg width="${SELLO_LADO}" height="${SELLO_LADO}">
         <circle cx="${SELLO_LADO/2}" cy="${SELLO_LADO/2}" r="${SELLO_LADO/2 - 1}"
                 fill="none" stroke="#ffffff" stroke-width="2" opacity=".55"/>
       </svg>`),
    blend: "over",
  }])
  .png()
  .toBuffer();

const archivos = readdirSync(ORIGEN).filter((n) => /\.(jpe?g|png)$/i.test(n)).sort();

let i = 0;
for (const n of archivos) {
  i++;
  const salida = DESTINO + "san-antonio-" + String(i).padStart(2, "0") + ".jpg";

  const base = await sharp(ORIGEN + n)
    .rotate()                              // respeta cómo la tomó el teléfono
    .resize(ANCHO, ALTO, { fit: "cover", position: "attention" })
    .modulate({ brightness: 1.12, saturation: 1.06 })
    .linear(1.06, -6)                      // un poco más de contraste
    .sharpen({ sigma: 0.7 })
    .toBuffer();

  await sharp(base)
    .composite([{ input: sello, gravity: "southeast", top: undefined, left: undefined }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(salida);

  console.log("lista:", salida.split("/").pop());
}
console.log("\nfotos listas:", i);
