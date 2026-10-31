import { PRODUCTOS } from "./productos";
import { idDeYoutube } from "./youtube";
import type { Producto } from "./tipos";

/**
 * EL CATÁLOGO EN VIDEO (la portada): un scroll vertical tipo TikTok, una
 * máquina por pantalla, con el video de la máquina funcionando y abajo los
 * botones de ficha, plano, fotos y "Lo quiero".
 *
 * Lo pidió Eduardo el 31 de octubre de 2026: "el público no está acostumbrado
 * a leer y buscar; quieren la información rápida. Que el catálogo sea un
 * scroll: primera máquina en venta, segunda, tercera… y abajo una barrita".
 *
 * DOS TIPOS DE VIDEO, y el orden importa:
 *  1. `video` (archivo .mp4 en /public/videos): arranca solo, sin logo ni
 *     botón de YouTube, en cualquier teléfono. Es el bueno. Eduardo lo pidió el
 *     31-oct al ver que en su iPhone YouTube ponía el botón rojo y "Mirar en
 *     YouTube" en vez de correr el video.
 *  2. `videoYoutube`: se usa solo si el producto NO tiene archivo propio.
 * Si un producto trae varios videos, salen varias pantallas seguidas.
 * Los productos sin video no salen aquí (siguen en /catalogo).
 */
export interface SlideVideo {
  producto: Producto;
  /** Archivo .mp4 propio (ruta en /public). Si viene, manda sobre YouTube. */
  mp4?: string;
  /** ID del video de YouTube (cuando no hay archivo propio). */
  videoId?: string;
  /** Si el producto trae varios videos: 1 de 2, 2 de 2. */
  numeroDeVideo: number;
  totalDeVideos: number;
}

export function slidesDeVideo(): SlideVideo[] {
  const slides: SlideVideo[] = [];
  /* primero las disponibles, luego las apartadas */
  const orden = [...PRODUCTOS].sort((a, b) => (a.estatus === "apartada" ? 1 : 0) - (b.estatus === "apartada" ? 1 : 0));
  for (const producto of orden) {
    const propios = producto.video ? (Array.isArray(producto.video) ? producto.video : [producto.video]) : [];
    if (propios.length) {
      propios.forEach((mp4, i) => slides.push({ producto, mp4, numeroDeVideo: i + 1, totalDeVideos: propios.length }));
      continue;
    }
    if (!producto.videoYoutube) continue;
    const ligas = Array.isArray(producto.videoYoutube) ? producto.videoYoutube : [producto.videoYoutube];
    const ids = ligas.map(idDeYoutube).filter((id): id is string => !!id);
    ids.forEach((videoId, i) => slides.push({ producto, videoId, numeroDeVideo: i + 1, totalDeVideos: ids.length }));
  }
  return slides;
}
