import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { CONFIG } from "@/lib/config";
import { PRODUCTOS } from "@/lib/productos";
import { BotonPdf } from "@/components/catalogo/BotonPdf";
import { BotonCompartirLink } from "@/components/catalogo/BotonCompartirLink";

/** Barra bajo el encabezado: compartir el catálogo y descargarlo en PDF. */
export function BarraAcciones() {
  return (
    <div className="mx-auto mb-4 flex max-w-6xl flex-wrap items-center justify-center gap-3 px-5 no-print">
      <BotonCompartirLink etiqueta="Compartir catálogo" />
      <BotonPdf
        productos={PRODUCTOS}
        etiqueta="Descargar en PDF"
        nombreArchivo={`catalogo-${CONFIG.marca.negocio}.pdf`}
      />
      <Link href="/configurar" className="btn-ghost">
        <Icon name="lucide:settings-2" size={18} /> Es mío: configurarlo
      </Link>
    </div>
  );
}
