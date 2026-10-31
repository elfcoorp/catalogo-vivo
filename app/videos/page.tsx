import type { Metadata } from "next";
import { FeedVideos } from "@/components/catalogo/FeedVideos";
import { slidesDeVideo } from "@/lib/feed";
import { esModoTecnico } from "@/lib/modo";

export const metadata: Metadata = {
  title: "Máquinas en video · ELFCO",
  description: "Las máquinas del catálogo funcionando, una por pantalla. Desliza para ver la siguiente.",
};

/**
 * El catálogo en video: /videos. Respeta ?v=<vendedor> (los botones "Lo quiero"
 * abren el WhatsApp de ese vendedor) y ?modo=tecnico (sin WhatsApp).
 */
export default async function PaginaVideos({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; modo?: string }>;
}) {
  const { v, modo } = await searchParams;
  return <FeedVideos slides={slidesDeVideo()} vendedorSlug={v ?? null} modoTecnico={esModoTecnico(modo)} />;
}
