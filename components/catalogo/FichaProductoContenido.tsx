"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { GaleriaProducto } from "@/components/catalogo/GaleriaProducto";
import { BotonPdf } from "@/components/catalogo/BotonPdf";
import { BotonCompartirLink } from "@/components/catalogo/BotonCompartirLink";
import { FichaTecnica } from "@/components/catalogo/FichaTecnica";
import { ProductoCard } from "@/components/catalogo/ProductoCard";
import { LogoChico } from "@/components/catalogo/LogoChico";
import { useLang } from "@/lib/i18n";
import { traducirProducto, traducirCategoria } from "@/lib/traducciones";
import { linkLoQuiero } from "@/lib/whatsapp";
import { CONFIG } from "@/lib/config";
import type { Producto } from "@/lib/tipos";

interface FichaProductoContenidoProps {
  producto: Producto;
  relacionados: Producto[];
  v: string | null;
  modoTecnico: boolean;
}

export function FichaProductoContenido({ producto: productoOriginal, relacionados, v, modoTecnico }: FichaProductoContenidoProps) {
  const { t, lang } = useLang();
  const producto = traducirProducto(productoOriginal, lang);
  const href = linkLoQuiero(CONFIG, productoOriginal, v ?? null);
  const volver = modoTecnico ? "/?modo=tecnico" : v ? `/?v=${v}` : "/";

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href={volver} className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-marca">
          <Icon name="lucide:arrow-left" size={16} /> {t("volverAlCatalogo")}
        </Link>
        <LogoChico className="h-10 w-10 shrink-0 rounded-full object-cover" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Foto */}
        <div className="relative">
          <GaleriaProducto
            imagen={producto.imagen}
            galeria={producto.galeria}
            video={producto.video}
            videoYoutube={producto.videoYoutube}
            alt={producto.nombre}
            className="aspect-square rounded-3xl border border-line"
          />
          {producto.escasez && (
            <span className="chip chip-escasez absolute left-4 top-4">
              <Icon
                name={producto.escasez.tipo === "tiempo" ? "fluent-emoji-flat:alarm-clock" : "fluent-emoji-flat:fire"}
                size={14}
              />
              {producto.escasez.tipo === "tiempo" ? "Solo " : "Quedan "}
              {producto.escasez.valor}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-marca">{traducirCategoria(producto.categoria, lang)}</p>
          <h1 className="font-display text-4xl font-semibold uppercase leading-tight sm:text-5xl">{producto.nombre}</h1>

          <div className="flex flex-col gap-1 pt-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {producto.precioAntes && <span className="text-lg text-ink-mute line-through">{producto.precioAntes}</span>}
              <span className="font-display text-4xl font-semibold">{producto.precio}</span>
            </div>
            <span className="text-sm text-ink-mute">{t("precioSujeto")}</span>
          </div>

          {producto.zona && (
            <p className="flex items-center gap-1.5 text-sm text-ink-soft">
              <Icon name="lucide:map-pin" size={15} /> {producto.zona} · {t("fleteNota")}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {!modoTecnico && (
              <a href={href} target="_blank" rel="noopener noreferrer" className="btn-marca btn-wa mt-2 w-full sm:w-auto">
                <MessageCircle size={22} /> {t("loQuiero")}
              </a>
            )}
            <BotonCompartirLink etiqueta={t("compartirLiga")} className="btn-ghost mt-2 w-full sm:w-auto" />
            <BotonPdf
              productos={[productoOriginal]}
              etiqueta={t("compartirPdf")}
              nombreArchivo={`${producto.slug}.pdf`}
              className="btn-ghost mt-2 w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {producto.fichaTecnica && <FichaTecnica datos={producto.fichaTecnica} />}

      {producto.plano && (
        <section className="mt-16">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">{t("planoDeLaMaquina")}</h2>
            <a href={producto.plano} download className="btn-ghost inline-flex items-center gap-2 text-sm">
              <Icon name="lucide:download" size={16} /> {t("descargarPlano")}
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <img src={producto.plano} alt={`Plano ELFCO de ${producto.nombre}`} className="w-full" />
          </div>
          <p className="mt-2 text-sm text-ink-mute">{t("planoNota")}</p>
        </section>
      )}

      {producto.garantia && (
        <section
          className="mt-16 rounded-2xl border border-line p-6 sm:p-7"
          style={{ background: "color-mix(in srgb, var(--marca-2) 8%, transparent)" }}
        >
          <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold">
            <Icon name="lucide:shield-check" size={22} className="text-marca" /> {t("garantia")}
          </h2>
          <p className="text-ink-soft">{producto.garantia}</p>
        </section>
      )}

      {/* Relacionados */}
      {relacionados.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-semibold">{t("tambienTePuedeGustar")}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relacionados.map((p) => (
              <ProductoCard key={p.slug} producto={p} vendedorSlug={v ?? null} modoTecnico={modoTecnico} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
