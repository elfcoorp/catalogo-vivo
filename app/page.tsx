import { MarcaHeader } from "@/components/catalogo/MarcaHeader";
import { CatalogoGrid } from "@/components/catalogo/CatalogoGrid";
import { Pie } from "@/components/catalogo/Pie";
import { esModoTecnico } from "@/lib/modo";

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
  return (
    <main className="min-h-screen">
      <MarcaHeader />
      <CatalogoGrid vendedorSlug={v ?? null} modoTecnico={modoTecnico} />
      <Pie modoTecnico={modoTecnico} />
    </main>
  );
}
