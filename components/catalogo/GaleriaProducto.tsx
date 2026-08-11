"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { FotoProducto } from "@/components/catalogo/FotoProducto";
import { urlIncrustadaYoutube } from "@/lib/youtube";

interface GaleriaProductoProps {
  imagen?: string;
  galeria?: string[];
  video?: string;
  videoYoutube?: string;
  alt: string;
  className?: string;
}

/**
 * Foto principal + miniaturas (fotos extra y video) de la ficha del producto.
 * Si no hay fotos extra ni video, se comporta igual que una FotoProducto sola.
 */
export function GaleriaProducto({ imagen, galeria, video, videoYoutube, alt, className }: GaleriaProductoProps) {
  const fotos = [imagen, ...(galeria ?? [])].filter((f): f is string => Boolean(f));
  const youtubeEmbed = videoYoutube ? urlIncrustadaYoutube(videoYoutube) : null;
  const items = [
    ...fotos.map((src) => ({ tipo: "foto" as const, src })),
    ...(youtubeEmbed ? [{ tipo: "youtube" as const, src: youtubeEmbed }] : []),
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
        ) : actual.tipo === "youtube" ? (
          <iframe
            src={actual.src}
            title={`Video de ${alt}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
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
              aria-label={item.tipo === "foto" ? `Ver foto ${i + 1}` : "Ver video"}
            >
              {item.tipo === "foto" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.src} alt="" className="h-full w-full object-cover" />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {fotos[0] && <img src={fotos[0]} alt="" className="h-full w-full object-cover" />}
                  <span className="absolute inset-0 grid place-items-center bg-black/40">
                    <Icon name="lucide:play" size={18} className="text-white" />
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
