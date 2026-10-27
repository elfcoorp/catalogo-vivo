/**
 * Deja lista la foto de los cepillos para la cápsula:
 *   1. Le quita las franjas negras de arriba y abajo (ahí iba una estrellita).
 *   2. Le tapa la otra estrellita, la que quedó dentro de la foto.
 * El fondo en ese punto ya está desenfocado, así que el parche es un pedazo
 * del mismo fondo, más borroso todavía y con la orilla suavizada. No se nota.
 */
import sharp from "sharp";

const ENTRADA = "C:/Users/Propietario/Downloads/Tomate Cepillos Catalogp .jpeg";
const SALIDA = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/CEP-01.jpg";

/* ---------- 1. Dónde empiezan y terminan las franjas negras ---------- */
const { data, info } = await sharp(ENTRADA).greyscale().raw().toBuffer({ resolveWithObject: true });
/* Una franja negra es lisa: casi todos sus pixeles valen lo mismo. Se mide
   qué tanto de cada renglón se sale de su propio valor de en medio. Así la
   estrellita, que ocupa muy poquito del renglón, no alcanza a engañar. */
const movimiento = [];
for (let y = 0; y < info.height; y++) {
  const renglon = data.slice(y * info.width, (y + 1) * info.width);
  const medio = [...renglon].sort((a, b) => a - b)[renglon.length >> 1];
  let distintos = 0;
  for (const v of renglon) if (Math.abs(v - medio) > 25) distintos++;
  movimiento.push(distintos / info.width);
}
const HAY_FOTO = 0.12; // 12% del renglón moviéndose ya es foto, no franja

/* Arriba la foto empieza con pared oscura, que casi no se mueve. Ahí se busca
   distinto: basta con que el renglón tenga algo de claro y algo de oscuro. */
let arriba = 0;
while (arriba < info.height) {
  const renglon = data.slice(arriba * info.width, (arriba + 1) * info.width);
  let min = 255, max = 0;
  for (const v of renglon) { if (v < min) min = v; if (v > max) max = v; }
  if (max - min >= 60) break;
  arriba++;
}

/* Abajo sí hay estrellita metida en la franja, y por eso se usa el otro modo. */
let abajo = info.height - 1;
while (abajo > arriba && movimiento[abajo] < HAY_FOTO) abajo--;
const alto = abajo - arriba + 1;
console.log("La foto de verdad va del renglón", arriba, "al", abajo, "->", info.width + "x" + alto);

/* ---------- 2. El parche que tapa la estrellita ---------- */
const CAJA = { left: 893, top: 687, width: 84, height: 80 }; // alrededor de la estrella

const parche = await sharp(ENTRADA).extract(CAJA).blur(16).ensureAlpha().toBuffer();

const difuminado = Buffer.from(
  `<svg width="${CAJA.width}" height="${CAJA.height}">
     <defs>
       <radialGradient id="g">
         <stop offset="55%" stop-color="#fff" stop-opacity="1"/>
         <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
       </radialGradient>
     </defs>
     <rect width="100%" height="100%" fill="url(#g)"/>
   </svg>`,
);

const parcheSuave = await sharp(parche)
  .composite([{ input: await sharp(difuminado).png().toBuffer(), blend: "dest-in" }])
  .png()
  .toBuffer();

/* ---------- 3. Se pega el parche y se recorta ---------- */
const tapada = await sharp(ENTRADA)
  .composite([{ input: parcheSuave, left: CAJA.left, top: CAJA.top }])
  .toBuffer();

await sharp(tapada)
  .extract({ left: 0, top: arriba, width: info.width, height: alto })
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(SALIDA);

const fin = await sharp(SALIDA).metadata();
console.log("CEP-01.jpg listo:", fin.width + "x" + fin.height);
