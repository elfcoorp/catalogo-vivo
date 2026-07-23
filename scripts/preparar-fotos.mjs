// @ts-nocheck
/**
 * Prepara tus fotos para el catálogo: las deja todas del mismo tamaño y
 * cuadradas, para que se vean parejas y profesionales.
 *
 * Cómo se usa:
 *   1) Pon tus fotos en la carpeta  fotos-crudas/
 *   2) Corre:  npm run fotos
 *   3) Aparecerán limpias y cuadradas en  public/productos/
 *
 * ⚠️ Esto empareja tamaño, encuadre y peso. Para QUITAR EL FONDO o MEJORAR LA
 *    LUZ con inteligencia artificial, pídeselo a tu Claude Code (lee CLAUDE.md):
 *    "quítale el fondo a las fotos de fotos-crudas y déjalas en public/productos".
 */
import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ENTRADA = "fotos-crudas";
const SALIDA = path.join("public", "productos");
const LADO = 1200; // px, cuadrado
const EXTENSIONES = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".avif"]);

async function main() {
  if (!existsSync(ENTRADA)) {
    console.log(`No encontré la carpeta "${ENTRADA}/". Créala y mete tus fotos ahí.`);
    return;
  }
  await mkdir(SALIDA, { recursive: true });

  const archivos = (await readdir(ENTRADA)).filter((f) =>
    EXTENSIONES.has(path.extname(f).toLowerCase())
  );

  if (archivos.length === 0) {
    console.log(`La carpeta "${ENTRADA}/" está vacía. Mete tus fotos y vuelve a correr.`);
    return;
  }

  let ok = 0;
  for (const archivo of archivos) {
    const base = path.parse(archivo).name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const destino = path.join(SALIDA, `${base}.jpg`);
    try {
      await sharp(path.join(ENTRADA, archivo))
        .rotate() // respeta la orientación de la cámara
        .resize(LADO, LADO, { fit: "cover", position: "attention" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(destino);
      console.log(`✓ ${archivo}  →  public/productos/${base}.jpg`);
      ok++;
    } catch (err) {
      console.error(`✗ No pude con ${archivo}: ${err.message}`);
    }
  }
  console.log(`\nListo: ${ok} de ${archivos.length} fotos preparadas en public/productos/.`);
  console.log(`Ahora usa esos nombres en lib/productos.ts (ej. imagen: "/productos/${"tu-foto"}.jpg").`);
}

main();
