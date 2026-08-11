"use client";

import { useState } from "react";
import { ProductoCard } from "./ProductoCard";
import { FiltrosLaterales, FILTROS_VACIOS, type FiltrosSeleccion } from "./FiltrosLaterales";
import { BarraSuperior } from "./BarraSuperior";
import { FormularioEmpaque } from "./FormularioEmpaque";
import { Icon } from "@/components/ui/Icon";
import { CONFIG } from "@/lib/config";
import { PRODUCTOS } from "@/lib/productos";
import { linkWhatsApp } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n";
import { traducirCategoria } from "@/lib/traducciones";

interface CatalogoGridProps {
  vendedorSlug?: string | null;
  modoTecnico?: boolean;
}

const TABS = ["usadas", "nuevas", "personalizadas"] as const;
type Tab = (typeof TABS)[number];

function normaliza(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

function cumpleBusqueda(p: (typeof PRODUCTOS)[number], busqueda: string) {
  const q = normaliza(busqueda.trim());
  if (!q) return true;
  const campos = [p.nombre, p.nombreCorto, p.marcaFabricante, p.categoria, ...(p.frutas ?? [])].filter(
    (v): v is string => Boolean(v)
  );
  return campos.some((v) => normaliza(v).includes(q));
}

function cumpleFiltros(p: (typeof PRODUCTOS)[number], f: FiltrosSeleccion) {
  if (f.frutas.length > 0 && !f.frutas.some((fr) => p.frutas?.includes(fr))) return false;
  if (f.tipoCopita.length > 0 && !(p.tipoCopita && f.tipoCopita.includes(p.tipoCopita))) return false;
  if (f.clasificaPor.length > 0 && !f.clasificaPor.some((c) => p.clasificaPor?.includes(c as "peso" | "diametro" | "color"))) return false;
  if (f.estatus.length > 0 && !f.estatus.includes(p.estatus ?? "disponible")) return false;
  return true;
}

export function CatalogoGrid({ vendedorSlug, modoTecnico }: CatalogoGridProps) {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<Tab>("usadas");
  const [filtro, setFiltro] = useState<string>("Todas");
  const [filtrosLaterales, setFiltrosLaterales] = useState<FiltrosSeleccion>(FILTROS_VACIOS);
  const [busqueda, setBusqueda] = useState("");

  // Solo categorías que de verdad tienen productos — una categoría vacía
  // (ej. "Servicios" sin nada cargado todavía) no sirve como filtro.
  const categoriasReales = Array.from(new Set(PRODUCTOS.map((p) => p.categoria))).sort(
    (a, b) => CONFIG.categorias.indexOf(a) - CONFIG.categorias.indexOf(b)
  );
  const categorias = ["Todas", ...categoriasReales];
  const visibles = filtro === "Todas" ? categoriasReales : [filtro];
  const mostrarFiltro = categoriasReales.length > 1;
  const productosFiltrados = PRODUCTOS.filter((p) => cumpleFiltros(p, filtrosLaterales) && cumpleBusqueda(p, busqueda));

  return (
    <>
      <BarraSuperior busqueda={busqueda} onBusquedaChange={setBusqueda} modoTecnico={modoTecnico} />

      <div className="mx-auto max-w-6xl px-5 pt-8 no-print">
        <div className="flex flex-wrap justify-center gap-2 md:justify-start">
          {TABS.map((valor) => {
            const activo = tab === valor;
            const etiqueta = valor === "usadas" ? t("tabUsadas") : valor === "nuevas" ? t("tabNuevas") : t("tabPersonalizadas");
            return (
              <button
                key={valor}
                onClick={() => setTab(valor)}
                className="rounded-full border px-4 py-2 text-sm font-semibold transition"
                style={
                  activo
                    ? { background: "var(--marca)", color: "#fff", borderColor: "var(--marca)" }
                    : { borderColor: "var(--line-strong)", color: "var(--ink-soft)" }
                }
              >
                {etiqueta}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "nuevas" && (
        <section className="mx-auto max-w-3xl px-5 pb-24 pt-10 text-center">
          <span className="chip mb-4">
            <Icon name="fluent-emoji-flat:hammer-and-wrench" size={16} /> {t("tabNuevas")}
          </span>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t("nuevasTitulo")}</h2>
          <p className="mt-3 text-lg text-ink-soft">{t("nuevasSubtitulo")}</p>
          <p className="mt-6 text-ink-soft">{t("nuevasTexto")}</p>
          {!modoTecnico && (
            <a
              href={linkWhatsApp(CONFIG.marca.whatsappPrincipal, "Hola, me interesa armar una línea nueva a pedido con fabricantes aliados.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-marca btn-wa mt-6"
            >
              <Icon name="logos:whatsapp-icon" size={20} /> {t("nuevasBoton")}
            </a>
          )}
        </section>
      )}

      {tab === "personalizadas" && (
        <section className="mx-auto max-w-2xl px-5 pb-24 pt-10">
          <div className="mb-8 text-center">
            <span className="chip mb-4">
              <Icon name="fluent-emoji-flat:triangular-ruler" size={16} /> {t("tabPersonalizadas")}
            </span>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t("personalizadasTitulo")}</h2>
            <p className="mt-3 text-lg text-ink-soft">{t("personalizadasSubtitulo")}</p>
          </div>
          <FormularioEmpaque modoTecnico={modoTecnico} />
        </section>
      )}

      {tab === "usadas" && (
      <section className="mx-auto max-w-6xl px-5 pb-24 pt-8">
      <div className="md:grid md:grid-cols-[220px_1fr] md:items-start md:gap-10">
        <FiltrosLaterales productos={PRODUCTOS} seleccion={filtrosLaterales} onChange={setFiltrosLaterales} />

        <div>
          {/* Filtro por categoría (solo si hay más de una con productos) */}
          {mostrarFiltro && (
            <div className="mb-10 flex flex-wrap justify-center gap-2 no-print md:justify-start">
              {categorias.map((cat) => {
                const activa = filtro === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFiltro(cat)}
                    className="rounded-full border px-4 py-2 text-sm font-medium transition"
                    style={
                      activa
                        ? { background: "var(--marca)", color: "#fff", borderColor: "var(--marca)" }
                        : { borderColor: "var(--line-strong)", color: "var(--ink-soft)" }
                    }
                  >
                    {cat === "Todas" ? t("todas") : traducirCategoria(cat, lang)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Secciones por categoría */}
          <div className="flex flex-col gap-14">
            {visibles.map((cat) => {
              const items = productosFiltrados
                .filter((p) => p.categoria === cat)
                .sort((a, b) => Number(b.destacado ?? false) - Number(a.destacado ?? false));
              if (items.length === 0) return null;

              return (
                <div key={cat}>
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <h2 className="font-display text-3xl font-semibold">{traducirCategoria(cat, lang)}</h2>
                    <span className="text-sm text-ink-mute">{items.length} {t("opciones")}</span>
                  </div>

                  <div className="print-grid grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((p) => (
                      <ProductoCard key={p.slug} producto={p} vendedorSlug={vendedorSlug} modoTecnico={modoTecnico} />
                    ))}
                  </div>
                </div>
              );
            })}
            {productosFiltrados.length === 0 && (
              <p className="py-16 text-center text-ink-mute">{t("noHayMaquinas")}</p>
            )}
          </div>
        </div>
      </div>
      </section>
      )}
    </>
  );
}
