import { FeedVideos } from "@/components/catalogo/FeedVideos";
import { slidesDeVideo } from "@/lib/feed";
import { PRODUCTOS } from "@/lib/productos";
import { esModoTecnico } from "@/lib/modo";

/**
 * LA PORTADA ES EL CATÁLOGO EN VIDEO (desde el 31 de octubre de 2026).
 *
 * Un scroll vertical tipo TikTok: una máquina por pantalla, con su video
 * corriendo, y abajo los botones de ficha, plano, fotos y "Lo quiero". Al
 * final, una pantalla que lleva al catálogo completo en tarjetas (/catalogo),
 * donde están también las máquinas que todavía no tienen video.
 *
 * Pedido de Eduardo: "Que el catálogo sea un scroll: primera máquina en venta,
 * segunda, tercera… y abajo una barrita". Respeta ?v=<vendedor> (los botones
 * "Lo quiero" abren el WhatsApp de ese vendedor) y ?modo=tecnico (sin WhatsApp).
 */
export default async function Home({
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
