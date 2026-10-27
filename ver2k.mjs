import sharp from "sharp";
const S = "C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/0b2ec765-a5cc-41ae-b075-0647959ed8f9/scratchpad/";
const f = "C:/Users/Propietario/Downloads/Resolucion 2K.jpeg";
const { data, info } = await sharp(f).greyscale().raw().toBuffer({ resolveWithObject: true });
const mov = [];
for (let y = 0; y < info.height; y++) {
  const r = data.slice(y * info.width, (y + 1) * info.width);
  const medio = [...r].sort((a, b) => a - b)[r.length >> 1];
  let d = 0; for (const v of r) if (Math.abs(v - medio) > 25) d++;
  mov.push(d / info.width);
}
let ar = 0; while (ar < info.height && mov[ar] < 0.12) ar++;
let ab = info.height - 1; while (ab > ar && mov[ab] < 0.12) ab--;
console.log("la foto de verdad:", info.width + "x" + (ab - ar + 1), " (renglones", ar, "a", ab + ")");
await sharp(f).extract({ left: 0, top: ar, width: info.width, height: ab - ar + 1 }).toFile(S + "cep2k-limpia.png");
// acercamiento a la tapa del tercer cepillo
const alto = ab - ar + 1;
await sharp(S + "cep2k-limpia.png")
  .extract({ left: Math.round(info.width*0.56), top: Math.round(alto*0.42), width: Math.round(info.width*0.22), height: Math.round(alto*0.42) })
  .resize({ width: 760 }).toFile(S + "zoom-tapa2k.png");
console.log("listo");
