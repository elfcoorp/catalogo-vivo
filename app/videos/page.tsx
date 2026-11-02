import type { Metadata } from "next";
import { FeedVideos } from "@/components/catalogo/FeedVideos";
import { slidesDeVideo } from "@/lib/feed";
import { PRODUCTOS } from "@/lib/productos";
import { esModoTecnico } from "@/lib/modo";

export const metadata: Metadata = {
  title: "Máquinas en video · ELFCO",
  description: "Las máquinas del catálogo funcionando, una por pantalla. Desliza para ver la siguiente.",
};

/**
 * El catálogo en video (/videos): scroll vertical tipo TikTok. Fue la portada
 * del 31-oct al 2-nov de 2026; Eduardo pidió regresar la portada de tarjetas,
 * así que esta página queda aquí, sin botón que lleve a ella, para probarla
 * cuando haya videos propios (.mp4) sin YouTube.
 * Respeta ?v=<vendedor>, ?modo=tecnico, ?m=<máquina> y ?f=<fruta>.
 */
export default async function PaginaVideos({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; modo?: string }>;
}) {
  const { v, modo } = await searchParams;
  const disponibles = PRODUCTOS.filter((p) => p.estatus !== "apartada").length;
  return (
    <FeedVideos
      slides={slidesDeVideo()}
      vendedorSlug={v ?? null}
      modoTecnico={esModoTecnico(modo)}
      totalMaquinas={disponibles}
    />
  );
}
