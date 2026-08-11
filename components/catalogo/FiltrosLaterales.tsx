"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useLang } from "@/lib/i18n";
import { traducirFruta } from "@/lib/traducciones";
import type { Producto } from "@/lib/tipos";

export interface FiltrosSeleccion {
  frutas: string[];
  tipoCopita: string[];
  clasificaPor: string[];
  estatus: string[];
}

export const FILTROS_VACIOS: FiltrosSeleccion = {
  frutas: [],
  tipoCopita: [],
  clasificaPor: [],
  estatus: [],
};

const FRUTAS = ["tomate", "chile morrón", "pepino", "cítricos", "mango", "aguacate", "cebolla", "papa"];

/** ¿Cuántos productos calzan con esta opción, dado lo que ya tiene el producto? */
function contarFruta(productos: Producto[], fruta: string) {
  return productos.filter((p) => p.frutas?.includes(fruta)).length;
}
function contarTipoCopita(productos: Producto[], valor: string) {
  return productos.filter((p) => p.tipoCopita === valor).length;
}
function contarClasificaPor(productos: Producto[], valor: string) {
  return productos.filter((p) => p.clasificaPor?.includes(valor as "peso" | "diametro" | "color")).length;
}
function contarEstatus(productos: Producto[], valor: string) {
  return productos.filter((p) => (p.estatus ?? "disponible") === valor).length;
}

function alternar(lista: string[], valor: string): string[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

interface GrupoProps {
  titulo: string;
  opciones: { valor: string; etiqueta: string; cantidad: number }[];
  seleccion: string[];
  onToggle: (valor: string) => void;
}

function Grupo({ titulo, opciones, seleccion, onToggle }: GrupoProps) {
  const conProductos = opciones.filter((o) => o.cantidad > 0);
  if (conProductos.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">{titulo}</p>
      <div className="flex flex-col gap-1.5">
        {conProductos.map((o) => (
          <label key={o.valor} className="flex cursor-pointer items-center justify-between gap-2 text-sm text-ink-soft">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={seleccion.includes(o.valor)}
                onChange={() => onToggle(o.valor)}
                className="h-4 w-4 accent-[var(--marca)]"
              />
              {o.etiqueta}
            </span>
            <span className="text-xs text-ink-mute">{o.cantidad}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

interface FiltrosLateralesProps {
  productos: Producto[];
  seleccion: FiltrosSeleccion;
  onChange: (seleccion: FiltrosSeleccion) => void;
}

/** Filtros laterales: por fruta, tipo de copita, cómo clasifica y estatus. */
export function FiltrosLaterales({ productos, seleccion, onChange }: FiltrosLateralesProps) {
  const [abierto, setAbierto] = useState(false);
  const { t, lang } = useLang();
  const totalActivos =
    seleccion.frutas.length + seleccion.tipoCopita.length + seleccion.clasificaPor.length + seleccion.estatus.length;

  const tipoCopita = [
    { valor: "rodillo-clip", etiqueta: t("rodilloClip") },
    { valor: "charola", etiqueta: t("charola") },
  ];
  const clasificaPor = [
    { valor: "peso", etiqueta: t("peso") },
    { valor: "diametro", etiqueta: t("diametro") },
    { valor: "color", etiqueta: t("color") },
  ];
  const estatusOpciones = [
    { valor: "disponible", etiqueta: t("disponible") },
    { valor: "apartada", etiqueta: t("apartada") },
  ];

  const contenido = (
    <div className="flex flex-col gap-6">
      {totalActivos > 0 && (
        <button onClick={() => onChange(FILTROS_VACIOS)} className="self-start text-xs font-semibold text-marca hover:underline">
          {t("quitarFiltros")} ({totalActivos})
        </button>
      )}
      <Grupo
        titulo={t("porTuFruta")}
        opciones={FRUTAS.map((f) => ({ valor: f, etiqueta: traducirFruta(f, lang), cantidad: contarFruta(productos, f) }))}
        seleccion={seleccion.frutas}
        onToggle={(v) => onChange({ ...seleccion, frutas: alternar(seleccion.frutas, v) })}
      />
      <Grupo
        titulo={t("tipoDeCopita")}
        opciones={tipoCopita.map((o) => ({ ...o, cantidad: contarTipoCopita(productos, o.valor) }))}
        seleccion={seleccion.tipoCopita}
        onToggle={(v) => onChange({ ...seleccion, tipoCopita: alternar(seleccion.tipoCopita, v) })}
      />
      <Grupo
        titulo={t("clasificaPor")}
        opciones={clasificaPor.map((o) => ({ ...o, cantidad: contarClasificaPor(productos, o.valor) }))}
        seleccion={seleccion.clasificaPor}
        onToggle={(v) => onChange({ ...seleccion, clasificaPor: alternar(seleccion.clasificaPor, v) })}
      />
      <Grupo
        titulo={t("estatus")}
        opciones={estatusOpciones.map((o) => ({ ...o, cantidad: contarEstatus(productos, o.valor) }))}
        seleccion={seleccion.estatus}
        onToggle={(v) => onChange({ ...seleccion, estatus: alternar(seleccion.estatus, v) })}
      />
    </div>
  );

  return (
    <div className="no-print">
      {/* Botón para abrir en pantallas chicas (celular) */}
      <div className="md:hidden">
        <button
          onClick={() => setAbierto(true)}
          className="btn-ghost mb-6 w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Icon name="lucide:sliders-horizontal" size={16} /> {t("filtros")}
          </span>
          {totalActivos > 0 && (
            <span className="chip !py-0.5 !px-2">{totalActivos}</span>
          )}
        </button>
      </div>

      {/* Panel fijo en pantallas grandes */}
      <aside className="hidden md:block">{contenido}</aside>

      {/* Panel deslizable en celular */}
      {abierto && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex-1 bg-black/40" onClick={() => setAbierto(false)} />
          <div className="card flex w-[85%] max-w-sm flex-col gap-6 overflow-y-auto rounded-none rounded-l-3xl p-6">
            <div className="flex items-center justify-between">
              <p className="font-display text-xl font-semibold">{t("filtros")}</p>
              <button onClick={() => setAbierto(false)} className="btn-ghost !p-2" aria-label={t("cerrarFiltros")}>
                <Icon name="lucide:x" size={18} />
              </button>
            </div>
            {contenido}
            <button onClick={() => setAbierto(false)} className="btn-marca mt-auto">
              {t("verResultados")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
