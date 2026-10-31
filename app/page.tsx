import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
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
      {/* El catálogo en video (scroll tipo TikTok), pedido por Eduardo el 31-oct-2026 */}
      <div className="no-print -mt-4 mb-6 flex justify-center px-5">
        <Link
          href={`/videos${v ? `?v=${v}` : modoTecnico ? "?modo=tecnico" : ""}`}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg"
          style={{ background: "var(--marca)" }}
        >
          <Icon name="lucide:play-circle" size={18} /> Ver las máquinas en video
        </Link>
      </div>
      <CatalogoGrid vendedorSlug={v ?? null} modoTecnico={modoTecnico} modoDueno={modoDueno} />
      <Pie modoTecnico={modoTecnico} />
    </main>
  );
}
