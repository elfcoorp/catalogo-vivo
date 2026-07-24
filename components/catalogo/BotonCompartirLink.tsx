"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface BotonCompartirLinkProps {
  etiqueta: string;
  className?: string;
}

/** Comparte (o copia) el link de la página actual — el catálogo completo o una ficha de producto. */
export function BotonCompartirLink({ etiqueta, className }: BotonCompartirLinkProps) {
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
    <button onClick={compartir} className={className ?? "btn-marca"}>
      <Icon name={copiado ? "lucide:check" : "lucide:share-2"} size={18} />
      {copiado ? "¡Liga copiada!" : etiqueta}
    </button>
  );
}
