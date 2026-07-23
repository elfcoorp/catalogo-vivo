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
 * La ficha que vende: sigue la anatomía (foto → para quién → beneficio →
 * 3 datos → prueba → precio con ancla → bono → una acción "Lo quiero").
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
        <h3 className="font-display text-2xl leading-tight">{producto.nombre}</h3>

        {/* Para quién es (el "trabajo" que resuelve) */}
        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-ink">Para</span> {quitarPara(producto.paraQuien)}
        </p>

        {/* El beneficio, en resultado */}
        <p className="text-[15px] leading-snug text-ink">{producto.beneficio}</p>

        {/* Las 3 que importan */}
        <ul className="mt-1 flex flex-col gap-1.5">
          {producto.caracteristicas.slice(0, 3).map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-ink-soft">
              <Icon name="lucide:check" size={16} className="mt-0.5 shrink-0 text-marca" />
              {c}
            </li>
          ))}
        </ul>

        {/* La prueba */}
        {producto.prueba && (
          <p className="text-sm text-ink-soft">{producto.prueba}</p>
        )}

        {/* El bono / lo que incluye */}
        {producto.bono && (
          <div
            className="rounded-xl border px-3 py-2 text-sm"
            style={{
              background: "color-mix(in srgb, var(--marca-2) 12%, transparent)",
              borderColor: "color-mix(in srgb, var(--marca-2) 30%, transparent)",
            }}
          >
            <span className="font-semibold">Además te llevas:</span> {producto.bono}
          </div>
        )}

        {/* La garantía: quita el miedo a comprar */}
        {producto.garantia && (
          <p className="flex items-start gap-1.5 text-sm text-ink-soft">
            <Icon name="lucide:shield-check" size={15} className="mt-0.5 shrink-0 text-marca" />
            {producto.garantia}
          </p>
        )}

        {/* Precio con ancla + facilidades */}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-2">
          {producto.precioAntes && (
            <span className="text-sm text-ink-mute line-through">{producto.precioAntes}</span>
          )}
          <span className="font-display text-3xl font-semibold text-ink">{producto.precio}</span>
          {producto.facilidades && (
            <span className="text-sm text-ink-soft">· {producto.facilidades}</span>
          )}
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

/** Evita "Para Para..." si el texto ya empieza con "Para". */
function quitarPara(texto: string): string {
  return texto.replace(/^para\s+/i, "");
}
