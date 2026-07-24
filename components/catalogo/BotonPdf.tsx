"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CONFIG } from "@/lib/config";
import { generarCatalogoPdf } from "@/lib/generarPdf";
import type { Producto } from "@/lib/tipos";

interface BotonPdfProps {
  productos: Producto[];
  etiqueta: string;
  nombreArchivo: string;
  className?: string;
}

/** Genera un PDF (del catálogo completo o de un solo producto) y lo comparte o descarga. */
export function BotonPdf({ productos, etiqueta, nombreArchivo, className }: BotonPdfProps) {
  const [generando, setGenerando] = useState(false);

  async function descargarPdf() {
    if (generando) return;
    setGenerando(true);
    try {
      const archivo = await generarCatalogoPdf(CONFIG, productos, nombreArchivo);
      if (navigator.canShare?.({ files: [archivo] })) {
        await navigator.share({ files: [archivo], title: etiqueta });
      } else {
        const url = URL.createObjectURL(archivo);
        const a = document.createElement("a");
        a.href = url;
        a.download = archivo.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      /* el usuario canceló compartir, o algo falló: no interrumpimos con un error */
    } finally {
      setGenerando(false);
    }
  }

  return (
    <button onClick={descargarPdf} disabled={generando} className={className ?? "btn-ghost"}>
      <Icon name={generando ? "lucide:loader-2" : "lucide:download"} size={18} className={generando ? "animate-spin" : ""} />
      {generando ? "Generando…" : etiqueta}
    </button>
  );
}
