import { MarcaHeader } from "@/components/catalogo/MarcaHeader";
import { BarraAcciones } from "@/components/catalogo/BarraAcciones";
import { CatalogoGrid } from "@/components/catalogo/CatalogoGrid";
import { Pie } from "@/components/catalogo/Pie";

/**
 * El catálogo vivo. Si la liga trae ?v=<vendedor>, todos los botones
 * "Lo quiero" abren el WhatsApp de ese vendedor.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  return (
    <main className="min-h-screen">
      <MarcaHeader />
      <BarraAcciones />
      <CatalogoGrid vendedorSlug={v ?? null} />
      <Pie />
    </main>
  );
}
