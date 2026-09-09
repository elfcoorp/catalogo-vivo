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
  /*
   * rel=0 hace que los videos sugeridos al final sean del MISMO canal, o sea
   * las otras máquinas de ELFCO, y no de cualquiera.
   *
   * Los logos y las caritas que YouTube pone abajo NO se pueden quitar:
   * modestbranding dejó de funcionar en agosto de 2023. Si algún día se
   * quiere el video sin nada de YouTube, hay que subir el archivo al
   * catálogo y usar el campo `video` en lugar de `videoYoutube`.
   */
  return id ? `https://www.youtube.com/embed/${id}?rel=0&playsinline=1` : null;
}
