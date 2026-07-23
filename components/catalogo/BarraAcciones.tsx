"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

/** Barra bajo el encabezado: compartir el catálogo y descargarlo en PDF. */
export function BarraAcciones() {
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const url = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch {
        /* el usuario canceló: seguimos y copiamos */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sin portapapeles disponible */
    }
  }

  return (
    <div className="mx-auto mb-4 flex max-w-6xl flex-wrap items-center justify-center gap-3 px-5 no-print">
      <button onClick={compartir} className="btn-marca">
        <Icon name={copiado ? "lucide:check" : "lucide:share-2"} size={18} />
        {copiado ? "¡Liga copiada!" : "Compartir catálogo"}
      </button>
      <button onClick={() => window.print()} className="btn-ghost">
        <Icon name="lucide:download" size={18} /> Descargar en PDF
      </button>
      <Link href="/configurar" className="btn-ghost">
        <Icon name="lucide:settings-2" size={18} /> Es mío: configurarlo
      </Link>
    </div>
  );
}
