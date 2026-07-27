"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { FotoProducto } from "@/components/catalogo/FotoProducto";

interface GaleriaProductoProps {
  imagen?: string;
  galeria?: string[];
  video?: string;
  alt: string;
  className?: string;
}

/**
 * Foto principal + miniaturas (fotos extra y video) de la ficha del producto.
 * Si no hay fotos extra ni video, se comporta igual que una FotoProducto sola.
 */
export function GaleriaProducto({ imagen, galeria, video, alt, className }: GaleriaProductoProps) {
  const fotos = [imagen, ...(galeria ?? [])].filter((f): f is string => Boolean(f));
  const items = [
    ...fotos.map((src) => ({ tipo: "foto" as const, src })),
    ...(video ? [{ tipo: "video" as const, src: video }] : []),
  ];
  const [activo, setActivo] = useState(0);

  if (items.length === 0) {
    return <FotoProducto alt={alt} className={className} />;
  }

  const actual = items[activo];

  return (
    <div className="flex flex-col gap-3">
      <div className={`relative overflow-hidden ${className ?? ""}`}>
        {actual.tipo === "video" ? (
          <video
            src={actual.src}
            controls
            className="h-full w-full object-cover"
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={actual.src} alt={alt} className="h-full w-full object-contain" />
        )}
      </div>

      {items.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <button
              key={item.src + i}
              onClick={() => setActivo(i)}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-opacity"
              style={{
                borderColor: i === activo ? "var(--marca)" : "transparent",
                opacity: i === activo ? 1 : 0.7,
              }}
              aria-label={item.tipo === "video" ? "Ver video" : `Ver foto ${i + 1}`}
            >
              {item.tipo === "video" ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fotos[0]} alt="" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 grid place-items-center bg-black/40">
                    <Icon name="lucide:play" size={18} className="text-white" />
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.src} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
