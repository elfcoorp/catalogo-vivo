"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CONFIG } from "@/lib/config";
import { linkWhatsApp } from "@/lib/whatsapp";
import {
  ANCHO_INICIAL,
  LARGO_INICIAL,
  TIPOS_MODULO,
  areaOcupada,
  buscarHueco,
  modulosConProblema,
  resumenLevantamiento,
  type Espacio,
  type Modulo,
} from "@/lib/planeador";

/** Se redondea a 5 cm: mover al centímetro con el dedo es imposible. */
const PASO = 0.05;

function redondea(v: number) {
  return Math.round(v / PASO) * PASO;
}

let contador = 0;
function nuevoId() {
  contador += 1;
  return `m${contador}`;
}

export function Planeador() {
  const [espacio, setEspacio] = useState<Espacio>({ largo: 12, ancho: 6 });
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [notas, setNotas] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const lienzoRef = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ id: string; dx: number; dy: number } | null>(null);

  // Todo se posiciona en PORCENTAJES del lienzo, no en pixeles: así el dibujo
  // se reescala solo al girar el teléfono o cambiar de pantalla, sin medir
  // nada con JavaScript.
  const pctX = (metros: number) => `${(metros / espacio.largo) * 100}%`;
  const pctY = (metros: number) => `${(metros / espacio.ancho) * 100}%`;

  const conProblema = modulosConProblema(modulos, espacio);
  const cabe = modulos.length > 0 && conProblema.size === 0;
  const ocupado = areaOcupada(modulos);
  const areaEspacio = espacio.largo * espacio.ancho;

  function agregar(tipo: string) {
    setModulos((prev) => {
      const id = nuevoId();
      // Nace en el primer hueco libre, no encima de los demás.
      const { x, y } = buscarHueco(prev, espacio, LARGO_INICIAL, ANCHO_INICIAL);
      setSeleccionado(id);
      return [...prev, { id, tipo, largo: LARGO_INICIAL, ancho: ANCHO_INICIAL, x, y, yaLoTiene: false }];
    });
  }

  function actualizar(id: string, cambios: Partial<Modulo>) {
    setModulos((prev) => prev.map((m) => (m.id === id ? { ...m, ...cambios } : m)));
  }

  function borrar(id: string) {
    setModulos((prev) => prev.filter((m) => m.id !== id));
    setSeleccionado((s) => (s === id ? null : s));
  }

  /** Convierte la posición del dedo en metros, midiendo el lienzo al momento. */
  function aMetros(e: { clientX: number; clientY: number }) {
    const caja = lienzoRef.current?.getBoundingClientRect();
    if (!caja || caja.width === 0 || caja.height === 0) return null;
    return {
      x: ((e.clientX - caja.left) / caja.width) * espacio.largo,
      y: ((e.clientY - caja.top) / caja.height) * espacio.ancho,
    };
  }

  function alBajarDedo(e: React.PointerEvent, m: Modulo) {
    const p = aMetros(e);
    if (!p) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastre.current = { id: m.id, dx: p.x - m.x, dy: p.y - m.y };
    setSeleccionado(m.id);
  }

  function alMoverDedo(e: React.PointerEvent) {
    const a = arrastre.current;
    if (!a) return;
    const p = aMetros(e);
    if (!p) return;
    actualizar(a.id, { x: redondea(p.x - a.dx), y: redondea(p.y - a.dy) });
  }

  function alSoltarDedo() {
    arrastre.current = null;
  }

  const activo = modulos.find((m) => m.id === seleccionado) ?? null;
  const mensaje = resumenLevantamiento(espacio, modulos, cabe, notas, whatsapp);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. El espacio disponible */}
      <div className="card flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-ink">1. ¿De qué tamaño es el espacio disponible?</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-ink-mute">
            Largo (metros)
            <input
              type="number"
              min={1}
              step={0.5}
              value={espacio.largo}
              onChange={(e) => setEspacio((s) => ({ ...s, largo: Math.max(1, Number(e.target.value) || 0) }))}
              className="w-28 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-base text-ink outline-none focus:border-marca"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-mute">
            Ancho (metros)
            <input
              type="number"
              min={1}
              step={0.5}
              value={espacio.ancho}
              onChange={(e) => setEspacio((s) => ({ ...s, ancho: Math.max(1, Number(e.target.value) || 0) }))}
              className="w-28 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-base text-ink outline-none focus:border-marca"
            />
          </label>
          <p className="pb-2.5 text-sm text-ink-mute">{areaEspacio.toFixed(1)} m² de piso</p>
        </div>
      </div>

      {/* 2. Agregar módulos */}
      <div className="card flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-ink">2. Agrega lo que hay y lo que se necesita</p>
        <div className="flex flex-wrap gap-2">
          {TIPOS_MODULO.map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => agregar(tipo)}
              className="rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-marca hover:text-marca"
            >
              + {tipo}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-mute">
          Cada módulo entra con una medida de arranque de {LARGO_INICIAL.toFixed(2)} x {ANCHO_INICIAL.toFixed(2)} m.
          <b> Corrígela con la medida real</b> que traiga el cliente: tócalo en el dibujo y ajústala abajo.
        </p>
      </div>

      {/* 3. El dibujo */}
      <div className="card flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink">3. Acomódalos arrastrando con el dedo</p>
          <div className="flex items-center gap-3 text-xs text-ink-mute">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded" style={{ background: "#2f9e44" }} /> Ya lo tiene
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded" style={{ background: "var(--marca)" }} /> A cotizar
            </span>
          </div>
        </div>

        <div
          ref={lienzoRef}
          onPointerMove={alMoverDedo}
          onPointerUp={alSoltarDedo}
          onPointerCancel={alSoltarDedo}
          className="relative w-full overflow-hidden rounded-xl border-2 border-dashed border-line-strong bg-bg-2"
          style={{ aspectRatio: `${espacio.largo} / ${espacio.ancho}`, touchAction: "none" }}
        >
          {modulos.length === 0 && (
            <p className="absolute inset-0 grid place-items-center px-4 text-center text-sm text-ink-mute">
              Agrega módulos arriba y aparecerán aquí, a escala.
            </p>
          )}

          {modulos.map((m) => {
              const malo = conProblema.has(m.id);
              const elegido = m.id === seleccionado;
              return (
                <div
                  key={m.id}
                  onPointerDown={(e) => alBajarDedo(e, m)}
                  className="absolute flex cursor-grab select-none items-center justify-center overflow-hidden rounded-md p-1 text-center text-white active:cursor-grabbing"
                  style={{
                    left: pctX(m.x),
                    top: pctY(m.y),
                    width: pctX(m.largo),
                    height: pctY(m.ancho),
                    background: malo ? "#c92a2a" : m.yaLoTiene ? "#2f9e44" : "var(--marca)",
                    outline: elegido ? "3px solid #f7c530" : "none",
                    outlineOffset: "-1px",
                    touchAction: "none",
                  }}
                  title={`${m.tipo} — ${m.largo.toFixed(2)} x ${m.ancho.toFixed(2)} m`}
                >
                  <span className="text-[10px] font-semibold leading-tight drop-shadow">
                    {m.tipo.replace("Mesa de selección · ", "")}
                    <br />
                    {m.largo.toFixed(2)}×{m.ancho.toFixed(2)}
                  </span>
                </div>
              );
            })}
        </div>

        <p className="text-xs text-ink-mute">
          El dibujo está a escala: {espacio.largo.toFixed(2)} m de largo x {espacio.ancho.toFixed(2)} m de ancho, visto
          desde arriba. En <span style={{ color: "#c92a2a" }}>rojo</span> lo que se encima o se sale.
        </p>
      </div>

      {/* 4. Ajustes del módulo elegido */}
      {activo && (
        <div className="card flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">{activo.tipo}</p>
            <button
              type="button"
              onClick={() => borrar(activo.id)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-mute hover:text-ink"
            >
              <Icon name="lucide:trash-2" size={14} /> Quitar
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-ink-mute">
              Largo (m)
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={activo.largo}
                onChange={(e) => actualizar(activo.id, { largo: Math.max(0.1, Number(e.target.value) || 0) })}
                className="w-24 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-base text-ink outline-none focus:border-marca"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-mute">
              Ancho (m)
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={activo.ancho}
                onChange={(e) => actualizar(activo.id, { ancho: Math.max(0.1, Number(e.target.value) || 0) })}
                className="w-24 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-base text-ink outline-none focus:border-marca"
              />
            </label>
            <button
              type="button"
              onClick={() => actualizar(activo.id, { largo: activo.ancho, ancho: activo.largo })}
              className="btn-ghost !py-2 !text-sm"
            >
              <Icon name="lucide:rotate-cw" size={15} /> Girar
            </button>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={activo.yaLoTiene}
              onChange={(e) => actualizar(activo.id, { yaLoTiene: e.target.checked })}
              className="h-4 w-4 accent-[#2f9e44]"
            />
            El cliente ya tiene este módulo (no se cotiza)
          </label>
        </div>
      )}

      {/* 5. ¿Cabe? */}
      <div
        className="rounded-2xl border p-5"
        style={{
          borderColor: modulos.length === 0 ? "var(--line)" : cabe ? "#2f9e44" : "#c92a2a",
          background:
            modulos.length === 0
              ? "transparent"
              : cabe
                ? "color-mix(in srgb, #2f9e44 12%, transparent)"
                : "color-mix(in srgb, #c92a2a 12%, transparent)",
        }}
      >
        {modulos.length === 0 ? (
          <p className="text-sm text-ink-mute">Agrega módulos para saber si cabe.</p>
        ) : (
          <>
            <p className="font-display text-2xl font-semibold">
              {cabe ? "Sí cabe 👍" : "Todavía no cabe"}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {cabe
                ? `Los ${modulos.length} módulos entran en el espacio, sin encimarse.`
                : "Hay módulos en rojo: se enciman entre sí o se salen del espacio. Muévelos o ajusta las medidas."}
            </p>
            <p className="mt-2 text-sm text-ink-mute">
              Ocupado: {ocupado.toFixed(1)} m² de {areaEspacio.toFixed(1)} m² ({Math.round((ocupado / areaEspacio) * 100)}%)
            </p>
          </>
        )}
      </div>

      {/* 6. Mandarlo */}
      <div className="card flex flex-col gap-4 p-5">
        <p className="text-sm font-semibold text-ink">4. Mándalo para cotizar</p>
        <label className="flex flex-col gap-2 text-sm text-ink-soft">
          ¿Algo más que debamos saber? (fruta, capacidad, postes, desniveles)
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            className="rounded-xl border border-line-strong bg-bg-2 p-3 text-base text-ink outline-none focus:border-marca"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ink-soft">
          Tu WhatsApp
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Ej. 644 123 4567"
            className="rounded-xl border border-line-strong bg-bg-2 p-3 text-base text-ink outline-none focus:border-marca"
          />
        </label>
        <p className="text-xs text-ink-mute">
          Toma una captura del dibujo y mándala junto con el mensaje: así vemos el acomodo tal como quedó.
        </p>
        <a
          href={linkWhatsApp(CONFIG.marca.whatsappPrincipal, mensaje)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-marca btn-wa"
        >
          <Icon name="logos:whatsapp-icon" size={20} /> Mandar mi levantamiento
        </a>
      </div>
    </div>
  );
}
