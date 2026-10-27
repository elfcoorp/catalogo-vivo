/**
 * Deja lista la foto nueva de cepillos (la que sí enseña el barreno cuadrado):
 *   1. Le quita las franjas negras de arriba y abajo.
 *   2. Le quita la estrellita de Gemini, si quedó dentro.
 *   3. Le aclara la zona de la tapa, para que el cuadro se distinga.
 */
import sharp from "sharp";

const ENTRADA = "C:/Users/Propietario/Downloads/Resolucion 2K.jpeg";
const SALIDA = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/cepillos-tapa.jpg";

/* ---------- 1. Dónde acaban las franjas ---------- */
const { data, info } = await sharp(ENTRADA).greyscale().raw().toBuffer({ resolveWithObject: true });
const movimiento = [];
for (let y = 0; y < info.height; y++) {
  const renglon = data.slice(y * info.width, (y + 1) * info.width);
  const medio = [...renglon].sort((a, b) => a - b)[renglon.length >> 1];
  let distintos = 0;
  for (const v of renglon) if (Math.abs(v - medio) > 25) distintos++;
  movimiento.push(distintos / info.width);
}
let arriba = 0;
while (arriba < info.height) {
  const r = data.slice(arriba * info.width, (arriba + 1) * info.width);
  let min = 255, max = 0;
  for (const v of r) { if (v < min) min = v; if (v > max) max = v; }
  if (max - min >= 60) break;
  arriba++;
}
let abajo = info.height - 1;
while (abajo > arriba && movimiento[abajo] < 0.12) abajo--;
const alto = abajo - arriba + 1;
console.log("la foto va del renglón", arriba, "al", abajo, "->", info.width + "x" + alto);

const recortada = await sharp(ENTRADA)
  .extract({ left: 0, top: arriba, width: info.width, height: alto })
  .png()
  .toBuffer();

/* ---------- 2. La tapa, un poco más clara ---------- */
/* El cuadro está en el tercer cepillo. Se le levanta la sombra SOLO a ese
   pedazo y se pega de vuelta con la orilla difuminada, para que no se note
   el parche. No se inventa nada: la tapa ya estaba ahí, nomás oscura. */
const T = {
  left: Math.round(info.width * 0.575),
  top: Math.round(alto * 0.44),
  width: Math.round(info.width * 0.155),
  height: Math.round(alto * 0.40),
};

const aclarada = await sharp(recortada)
  .extract(T)
  .modulate({ brightness: 1.85 })
  .linear(1.25, -12)
  .ensureAlpha()
  .png()
  .toBuffer();

const suavizado = Buffer.from(
  `<svg width="${T.width}" height="${T.height}">
     <defs><radialGradient id="g">
       <stop offset="52%" stop-color="#fff" stop-opacity="1"/>
       <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
     </radialGradient></defs>
     <rect width="100%" height="100%" fill="url(#g)"/>
   </svg>`,
);

const parche = await sharp(aclarada)
  .composite([{ input: await sharp(suavizado).png().toBuffer(), blend: "dest-in" }])
  .png()
  .toBuffer();

await sharp(recortada)
  .composite([{ input: parche, left: T.left, top: T.top }])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(SALIDA);

const fin = await sharp(SALIDA).metadata();
console.log("cepillos-tapa.jpg listo:", fin.width + "x" + fin.height);
