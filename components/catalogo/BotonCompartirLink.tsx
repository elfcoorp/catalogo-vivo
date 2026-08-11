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
    let url = "";
    if (typeof window !== "undefined") {
      const actual = new URL(window.location.href);
      // Se comparte la liga limpia (sin el ?v= del vendedor referido), pero
      // si es la versión para técnicos (?modo=tecnico) esa sí se conserva.
      url = actual.searchParams.get("modo") === "tecnico"
        ? `${actual.origin}${actual.pathname}?modo=tecnico`
        : `${actual.origin}${actual.pathname}`;
    }
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
