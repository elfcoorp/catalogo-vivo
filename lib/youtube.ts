/** Saca el ID del video de una URL de YouTube (shorts, youtu.be o watch?v=). */
export function idDeYoutube(url: string): string | null {
  const patrones = [/youtube\.com\/shorts\/([\w-]+)/, /youtu\.be\/([\w-]+)/, /[?&]v=([\w-]+)/];
  for (const patron of patrones) {
    const m = url.match(patron);
    if (m) return m[1];
  }
  return null;
}

/** URL para incrustar (iframe) un video de YouTube dado su liga normal. */
export function urlIncrustadaYoutube(url: string): string | null {
  const id = idDeYoutube(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
