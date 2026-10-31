import { PRODUCTOS } from "./productos";
import { idDeYoutube } from "./youtube";
import type { Producto } from "./tipos";

/**
 * EL CATÁLOGO EN VIDEO (/videos): un scroll vertical tipo TikTok, una máquina
 * por pantalla, con el video de la máquina funcionando y abajo los botones
 * de ficha, plano, fotos y "Lo quiero".
 *
 * Lo pidió Eduardo el 31 de octubre de 2026: "el público no está acostumbrado
 * a leer y buscar; quieren la información rápida. Que el catálogo sea un
 * scroll: primera máquina en venta, segunda, tercera… y abajo una barrita".
 *
 * Aquí solo se arma la lista. Cada video de YouTube que tenga un producto es
 * una pantalla; si un producto trae dos videos, salen dos pantallas seguidas.
 * Los productos sin video no salen aquí (siguen en el catálogo normal).
 */
export interface SlideVideo {
  producto: Producto;
  /** ID del video de YouTube. */
  videoId: string;
  /** Si el producto trae varios videos: 1 de 2, 2 de 2. */
  numeroDeVideo: number;
  totalDeVideos: number;
}

export function slidesDeVideo(): SlideVideo[] {
  const slides: SlideVideo[] = [];
  /* primero las disponibles, luego las apartadas */
  const orden = [...PRODUCTOS].sort((a, b) => (a.estatus === "apartada" ? 1 : 0) - (b.estatus === "apartada" ? 1 : 0));
  for (const producto of orden) {
    if (!producto.videoYoutube) continue;
    const ligas = Array.isArray(producto.videoYoutube) ? producto.videoYoutube : [producto.videoYoutube];
    const ids = ligas.map(idDeYoutube).filter((id): id is string => !!id);
    ids.forEach((videoId, i) => slides.push({ producto, videoId, numeroDeVideo: i + 1, totalDeVideos: ids.length }));
  }
  return slides;
}
