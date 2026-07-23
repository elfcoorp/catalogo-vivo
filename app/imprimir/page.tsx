"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FotoProducto } from "@/components/catalogo/FotoProducto";
import { CONFIG } from "@/lib/config";
import { PRODUCTOS } from "@/lib/productos";

/** Catálogo en formato hoja para guardar como PDF (botón → window.print()). */
export default function Imprimir() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 no-print">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-marca">
          <Icon name="lucide:arrow-left" size={16} /> Volver al catálogo
        </Link>
        <button onClick={() => window.print()} className="btn-marca">
          <Icon name="lucide:printer" size={18} /> Imprimir / Guardar PDF
        </button>
      </div>

      {/* Encabezado del PDF */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-semibold text-gradient-marca">{CONFIG.marca.negocio}</h1>
        <p className="mt-1 text-ink-soft">{CONFIG.marca.descripcion}</p>
        {CONFIG.marca.enlace && <p className="mt-1 text-sm text-ink-mute">{CONFIG.marca.enlace}</p>}
      </div>

      {/* Productos en hoja */}
      <div className="print-grid grid grid-cols-1 gap-5 sm:grid-cols-2">
        {PRODUCTOS.map((p) => (
          <article key={p.slug} className="card flex gap-4 p-4">
            <FotoProducto src={p.imagen} alt={p.nombre} className="h-28 w-28 shrink-0 rounded-xl" />
            <div className="flex min-w-0 flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-marca">{p.categoria}</p>
              <h3 className="font-display text-lg leading-tight">{p.nombre}</h3>
              <p className="mt-1 text-xs text-ink-soft line-clamp-2">{p.beneficio}</p>
              <div className="mt-auto flex items-baseline gap-2 pt-2">
                {p.precioAntes && <span className="text-xs text-ink-mute line-through">{p.precioAntes}</span>}
                <span className="font-display text-xl font-semibold">{p.precio}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-ink-mute">
        Pide por WhatsApp: {CONFIG.marca.whatsappPrincipal} · {CONFIG.marca.ciudad}
      </p>
    </main>
  );
}
