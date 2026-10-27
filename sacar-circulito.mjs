/**
 * Del logo de elfco saca SOLO el circulito de la hojita (la "o" del final),
 * que es como lo quiere Eduardo. Deja dos versiones:
 *   logo-circulo.png        -> con sus colores, fondo transparente
 *   logo-circulo-blanco.png -> todo blanco, para poner sobre foto oscura
 */
import sharp from "sharp";

const ORIGEN = "C:/Users/Propietario/Desktop/Catalogo Claude/public/logo-perfil.png";
const DESTINO = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/";

/* La "o" con la hoja está en la parte de abajo a la derecha de la palabra.
   Se toma con holgura y luego se recorta solo lo que tiene tinta. */
const m = await sharp(ORIGEN).metadata();
const caja = {
  left: Math.round(m.width * 0.615),
  top: Math.round(m.height * 0.405),
  width: Math.round(m.width * 0.175),
  height: Math.round(m.height * 0.200),
};

const pedazo = await sharp(ORIGEN).extract(caja).png().toBuffer();

/* El blanco del fondo se vuelve transparente, pixel por pixel */
const { data, info } = await sharp(pedazo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const conAlfa = Buffer.from(data);
const blanco = Buffer.from(data);
for (let i = 0; i < conAlfa.length; i += 4) {
  const r = conAlfa[i], g = conAlfa[i + 1], b = conAlfa[i + 2];
  const claro = Math.min(r, g, b);
  /* entre más claro el pixel, más transparente queda */
  const alfa = claro > 238 ? 0 : claro < 200 ? 255 : Math.round(255 * (238 - claro) / 38);
  conAlfa[i + 3] = alfa;
  blanco[i] = 255; blanco[i + 1] = 255; blanco[i + 2] = 255; blanco[i + 3] = alfa;
}

const cortar = async (buf, nombre) => {
  const recortado = await sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png().toBuffer();
  const info2 = await sharp(recortado).trim({ threshold: 1 }).png().toFile(DESTINO + nombre);
  console.log(nombre, "->", info2.width + "x" + info2.height);
};

await cortar(conAlfa, "logo-circulo.png");
await cortar(blanco, "logo-circulo-blanco.png");
