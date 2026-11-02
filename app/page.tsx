import { MarcaHeader } from "@/components/catalogo/MarcaHeader";
import { CatalogoGrid } from "@/components/catalogo/CatalogoGrid";
import { Pie } from "@/components/catalogo/Pie";
import { esModoTecnico, esModoDueno } from "@/lib/modo";

/**
 * El catálogo vivo. Si la liga trae ?v=<vendedor>, todos los botones
 * "Lo quiero" abren el WhatsApp de ese vendedor. Si trae ?modo=tecnico,
 * no se muestra ningún botón ni liga de WhatsApp (versión para técnicos aliados).
 */
export default async function Home({
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
