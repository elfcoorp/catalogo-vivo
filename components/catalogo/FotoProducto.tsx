"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface FotoProductoProps {
  src?: string;
  alt: string;
  className?: string;
}

/**
 * Foto del producto con respaldo elegante: si todavía no subes la imagen
 * (o falla al cargar), muestra un recuadro con la marca en vez de un roto.
 * Así el catálogo se ve bien desde el primer minuto.
 */
export function FotoProducto({ src, alt, className }: FotoProductoProps) {
  const [error, setError] = useState(false);
  const mostrarFoto = src && !error;

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {mostrarFoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setError(true)}
        />
      ) : (
        <div className="foto-placeholder grid h-full w-full place-items-center">
          <div className="flex flex-col items-center gap-2 text-ink-mute">
            <Icon name="fluent-emoji-flat:framed-picture" size={44} />
            <span className="text-xs">Aquí va tu foto</span>
          </div>
        </div>
      )}
    </div>
  );
}
