"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FotoProducto } from "./FotoProducto";
import { CONFIG } from "@/lib/config";
import { linkLoQuiero } from "@/lib/whatsapp";
import type { Producto } from "@/lib/tipos";

interface ProductoCardProps {
  producto: Producto;
  /** Vendedor referido (?v=slug), para que "Lo quiero" abra su WhatsApp. */
  vendedorSlug?: string | null;
}

/**
 * Tarjeta limpia y profesional: foto → nombre (en mayúsculas) →
 * precio → una acción "Lo quiero". La ficha técnica va en el detalle.
 */
export function ProductoCard({ producto, vendedorSlug }: ProductoCardProps) {
  const href = linkLoQuiero(CONFIG, producto, vendedorSlug);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="card card-hover flex flex-col overflow-hidden"
    >
      {/* Foto + etiquetas */}
      <div className="relative">
        <FotoProducto src={producto.imagen} alt={producto.nombre} className="aspect-square" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {producto.destacado && (
            <span className="chip chip-destacado no-print">
              <Icon name="fluent-emoji-flat:star" size={14} /> El más pedido
            </span>
          )}
          {producto.escasez && (
            <span className="chip chip-escasez ml-auto no-print">
              <Icon
                name={
                  producto.escasez.tipo === "tiempo"
                    ? "fluent-emoji-flat:alarm-clock"
                    : "fluent-emoji-flat:fire"
                }
                size={14}
              />
              {producto.escasez.tipo === "tiempo" ? "Solo " : "Quedan "}
              {producto.escasez.valor}
            </span>
          )}
        </div>
      </div>

      {/* Cuerpo de la ficha */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-marca">{producto.categoria}</p>
        <h3 className="font-display text-2xl uppercase leading-tight">{producto.nombre}</h3>

        {/* Precio con ancla */}
        <div className="mt-auto flex flex-col gap-0.5 pt-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {producto.precioAntes && (
              <span className="text-sm text-ink-mute line-through">{producto.precioAntes}</span>
            )}
            <span className="font-display text-3xl font-semibold text-ink">{producto.precio}</span>
          </div>
          <span className="text-xs text-ink-mute">Precio sujeto a cambios sin previo aviso.</span>
        </div>

        {/* Una sola acción */}
        <div className="mt-2 flex items-center gap-2 no-print">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-marca btn-wa flex-1"
          >
            <MessageCircle size={20} /> Lo quiero
          </a>
          <Link
            href={vendedorSlug ? `/producto/${producto.slug}?v=${encodeURIComponent(vendedorSlug)}` : `/producto/${producto.slug}`}
            className="btn-ghost px-4"
            aria-label={`Ver ficha de ${producto.nombre}`}
          >
            <Icon name="lucide:arrow-right" size={18} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
