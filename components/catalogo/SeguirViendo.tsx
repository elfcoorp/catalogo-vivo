"use client";
/**
 * SIGUE DONDE TE QUEDASTE.
 *
 * La franja que sale hasta arriba de la portada con las máquinas que esa
 * persona ya había abierto, la última primero. Si nunca ha abierto ninguna,
 * no sale nada: ni hueco ni título.
 *
 * Eduardo lo pidió el 22 de septiembre de 2026. Se eligió esto en lugar de
 * barajar el catálogo al azar, y por una razón: barajar hace que el que ayer
 * estaba viendo la 4x12 hoy ya no la encuentre. Eso resta. Esto suma.
 *
 * Se dibuja después de cargar la página (por eso el useEffect), porque lo que
 * cada quien vio vive en SU navegador y el servidor no lo sabe.
 */
import { useEffect, useState } from "react";
import { ProductoCard } from "./ProductoCard";
import { PRODUCTOS } from "@/lib/productos";
import { leerVistos } from "@/lib/loQueVio";
import { useLang } from "@/lib/i18n";
import type { Producto } from "@/lib/tipos";

interface SeguirViendoProps {
  vendedorSlug?: string | null;
  modoTecnico?: boolean;
}

export function SeguirViendo({ vendedorSlug, modoTecnico }: SeguirViendoProps) {
  const { lang } = useLang();
  const [vistos, setVistos] = useState<Producto[]>([]);

  useEffect(() => {
    const slugs = leerVistos();
    /* Se respeta el orden en que los vio: el último que abrió va primero. */
    const encontrados = slugs
      .map((s) => PRODUCTOS.find((p) => p.slug === s))
      .filter((p): p is Producto => Boolean(p));
    setVistos(encontrados.slice(0, 4));
  }, []);

  if (vistos.length === 0) return null;

  const titulo = lang === "en" ? "Pick up where you left off" : "Sigue donde te quedaste";

  return (
    <section className="mx-auto max-w-6xl px-5 pt-8 no-print">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl font-semibold">{titulo}</h2>
      </div>
      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {vistos.map((p) => (
          <ProductoCard key={p.slug} producto={p} vendedorSlug={vendedorSlug} modoTecnico={modoTecnico} />
        ))}
      </div>
      <div className="mt-10 border-t" style={{ borderColor: "var(--line-strong)" }} />
    </section>
  );
}
