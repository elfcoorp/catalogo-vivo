/**
 * Fotos de la línea CIU 2x7 de Ramón (Yucatán), 14-oct-2026: se enderezan,
 * se achican a 1600 de ancho, un toque de luz y nitidez, y salen como
 * /productos/ciu-2x7-N.jpg. El orden es el de la galería.
 */
import sharp from "sharp";
import { statSync } from "node:fs";

const ORIGEN = "C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/911a6a12-46c4-4afd-9598-40551dbbb1fd/scratchpad/ramon/fotos/WhatsApp Image 2026-10-14 at ";
const FOTOS = [
  ["4.49.50 PM (4).jpeg", "salidas con tomate, de frente"],       // 1 portada
  ["4.49.51 PM (1).jpeg", "clasificadora completa, de lado"],      // 2
  ["4.49.51 PM (2).jpeg", "rodillos y cadena, en perspectiva"],    // 3
  ["4.49.50 PM (5).jpeg", "salidas con tomate, de cerca"],         // 4
  ["4.49.50 PM (3).jpeg", "salidas con tomate, vertical"],         // 5
  ["4.49.51 PM (4).jpeg", "elevador, cepilladora y mesa"],         // 6
  ["4.49.45 PM (2).jpeg", "elevador y cepilladora con tablero"],   // 7
  ["4.49.51 PM (3).jpeg", "caseta de control y entrada CIU"],      // 8
  ["4.49.50 PM (1).jpeg", "cajón de visión con la cámara"],        // 9
  ["4.49.50 PM (2).jpeg", "rodillos dentro del cajón de visión"],  // 10
  ["4.49.46 PM.jpeg", "tablero con variadores"],                   // 11
  ["4.49.45 PM (3).jpeg", "tablero abierto"],                      // 12
];

for (let i = 0; i < FOTOS.length; i++) {
  const [f, que] = FOTOS[i];
  const salida = `public/productos/ciu-2x7-${i + 1}.jpg`;
  await sharp(ORIGEN + f)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .modulate({ brightness: 1.04, saturation: 1.08 })
    .linear(1.06, -6)
    .sharpen({ sigma: 0.8 })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(salida);
  const m = await sharp(salida).metadata();
  console.log(`${i + 1}. ${m.width}x${m.height} ${Math.round(statSync(salida).size / 1024)} KB · ${que}`);
}
