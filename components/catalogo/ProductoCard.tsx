"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FotoProducto } from "./FotoProducto";
import { useLang } from "@/lib/i18n";
import { traducirProducto, traducirFruta } from "@/lib/traducciones";
import type { Producto } from "@/lib/tipos";

interface ProductoCardProps {
  producto: Producto;
  /** Vendedor referido (?v=slug), para que la ficha y "Lo quiero" abran con su liga. */
  vendedorSlug?: string | null;
  modoTecnico?: boolean;
}

const EMOJI_FRUTA: Record<string, string> = {
  tomate: "🍅",
  "chile morrón": "🫑",
  pepino: "🥒",
  cítricos: "🍋",
  mango: "🥭",
  aguacate: "🥑",
  cebolla: "🧅",
  papa: "🥔",
  "chile jalapeño": "🌶️",
  "chile rojo": "🌶️",
};

/**
 * Tarjeta chica y práctica: foto → marca + nombre → iconos de fruta → una
 * línea técnica → "Ver ficha completa". El precio y "Lo quiero" van en el
 * detalle (nadie pide sin ver antes la ficha técnica).
 */
export function ProductoCard({ producto: productoOriginal, vendedorSlug, modoTecnico }: ProductoCardProps) {
  const { t, lang } = useLang();
  const producto = traducirProducto(productoOriginal, lang);
  const apartada = producto.estatus === "apartada";
  const params = new URLSearchParams();
  if (modoTecnico) params.set("modo", "tecnico");
  else if (vendedorSlug) params.set("v", vendedorSlug);
  const query = params.toString();

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
        <FotoProducto src={producto.imagen} alt={producto.nombre} className="aspect-[4/3]" />
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-1">
            {producto.destacado && (
              <span className="chip chip-destacado no-print !text-[11px]">
                <Icon name="fluent-emoji-flat:star" size={12} /> {t("elMasPedido")}
              </span>
            )}
            {producto.verificada && (
              <span className="chip chip-verificada no-print !text-[11px]">
                <Icon name="lucide:badge-check" size={12} /> {t("verificada")}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {apartada && (
              <span className="chip chip-apartada no-print !text-[11px]">{t("apartada")}</span>
            )}
            {producto.escasez && (
              <span className="chip chip-escasez no-print !text-[11px]">
                <Icon
                  name={
                    producto.escasez.tipo === "tiempo"
                      ? "fluent-emoji-flat:alarm-clock"
                      : "fluent-emoji-flat:fire"
                  }
                  size={12}
                />
                {producto.escasez.tipo === "tiempo" ? "Solo " : "Quedan "}
                {producto.escasez.valor}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cuerpo de la ficha */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {producto.marcaFabricante && (
          <span className="text-[11px] font-bold uppercase tracking-wide text-marca">{producto.marcaFabricante}</span>
        )}
        <h3 className="text-base font-bold leading-snug text-ink">{producto.nombreCorto ?? producto.nombre}</h3>

        {producto.pasoCopita && <p className="text-[13px] leading-snug text-ink-soft">{producto.pasoCopita}</p>}

        {producto.frutas && producto.frutas.length > 0 && (
          <div className="flex flex-wrap gap-1 text-lg" aria-label={producto.frutas.map((f) => traducirFruta(f, lang)).join(", ")}>
            {producto.frutas.map((f) => (
              <span key={f} title={traducirFruta(f, lang)}>
                {EMOJI_FRUTA[f] ?? "🍃"}
              </span>
            ))}
          </div>
        )}

        {/* Una sola acción: ver la ficha completa (ahí está "Lo quiero" y el precio) */}
        <Link
          href={query ? `/producto/${producto.slug}?${query}` : `/producto/${producto.slug}`}
          className="btn-ghost mt-3 !py-2 !text-sm no-print"
        >
          {t("verFichaCompleta")} <Icon name="lucide:arrow-right" size={14} />
        </Link>
      </div>
    </motion.article>
  );
}
