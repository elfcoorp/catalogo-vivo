/**
 * Le pone a la foto de la banda (DUL-01) un medallón redondo abajo a la derecha,
 * con el acercamiento al corte del morrón. Es el círculo que pidió Eduardo:
 * la banda de lejos, y en la burbuja el daño de cerca.
 */
import sharp from "sharp";

const FONDO = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/DUL-01.jpg";
const MORRON = "C:/Users/Propietario/Downloads/WhatsApp Image 2026-09-01 at 4.24.26 PM.jpeg";
const SALIDA = "C:/Users/Propietario/Desktop/ERP ELFCO/capsulas/imagenes/DUL-01-con-medallon.jpg";

/* Dónde está el corte en la foto del morrón (cuadro alrededor del daño) */
const CORTE = { left: 300, top: 515, width: 260, height: 260 };

const base = sharp(FONDO);
const { width: ancho, height: alto } = await base.metadata();

const D = Math.round(ancho * 0.30);   // qué tan grande el medallón
const MARGEN = Math.round(ancho * 0.035);
const X = ancho - D - MARGEN;
const Y = alto - D - MARGEN;

/* 1. El recorte del corte, ya redondo */
const redondo = Buffer.from(
  `<svg width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="#fff"/></svg>`,
);
const burbuja = await sharp(MORRON)
  .extract(CORTE)
  .resize(D, D)
  .composite([{ input: await sharp(redondo).png().toBuffer(), blend: "dest-in" }])
  .png()
  .toBuffer();

/* 2. El aro blanco de afuera */
const GRUESO = Math.max(3, Math.round(D * 0.022));
const aro = Buffer.from(
  `<svg width="${D}" height="${D}">
     <circle cx="${D / 2}" cy="${D / 2}" r="${D / 2 - GRUESO / 2}"
             fill="none" stroke="#ffffff" stroke-width="${GRUESO}"/>
   </svg>`,
);

/* 3. Se pegan los dos sobre la foto */
await base
  .composite([
    { input: burbuja, left: X, top: Y },
    { input: await sharp(aro).png().toBuffer(), left: X, top: Y },
  ])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(SALIDA);

console.log("medallón puesto:", ancho + "x" + alto, "· burbuja de", D, "px");
