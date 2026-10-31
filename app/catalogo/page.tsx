import { MarcaHeader } from "@/components/catalogo/MarcaHeader";
import { CatalogoGrid } from "@/components/catalogo/CatalogoGrid";
import { Pie } from "@/components/catalogo/Pie";
import { esModoTecnico, esModoDueno } from "@/lib/modo";

/**
 * El catálogo clásico, en tarjetas: /catalogo.
 *
 * Desde el 31 de octubre de 2026 la portada (/) es el catálogo en video, tipo
 * TikTok (pedido de Eduardo: "la gente no lee, quiere ver"). Esta página sigue
 * siendo la lista completa con filtros, y es a donde llevan los botones
 * "Catálogo" del scroll de videos y el logo de la barra.
 *
 * Si la liga trae ?v=<vendedor>, todos los botones "Lo quiero" abren el
 * WhatsApp de ese vendedor. Si trae ?modo=tecnico, no se muestra ningún botón
 * ni liga de WhatsApp (versión para técnicos aliados).
 */
export default async function Catalogo({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; modo?: string }>;
}) {
  const { v, modo } = await searchParams;
  const modoTecnico = esModoTecnico(modo);
  /* el menú de herramientas solo se ve con la liga privada ?modo=dueno */
  const modoDueno = esModoDueno(modo);
  return (
    <main className="min-h-screen">
      <MarcaHeader />
      <CatalogoGrid vendedorSlug={v ?? null} modoTecnico={modoTecnico} modoDueno={modoDueno} />
      <Pie modoTecnico={modoTecnico} />
    </main>
  );
}
