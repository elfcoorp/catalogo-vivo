"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CONFIG } from "@/lib/config";
import { linkWhatsApp } from "@/lib/whatsapp";
import {
  ANCHOS_EN_LINEA,
  COPITAS,
  LINEAS_TIPICAS,
  TIPOS_MESA,
  comoDataUri,
  medidaClasificadora,
  nombreClasificadora,
  svgBanda,
  svgCepilladora,
  svgClasificadora,
  svgMesaSeleccion,
  svgTolva,
  type ClasificadoraParams,
  type Lado,
  type TipoMesa,
} from "@/lib/dibujos";
import {
  CATALOGO_MODULOS,
  ORIGENES,
  POSTE,
  areaOcupada,
  buscarHueco,
  colorDeOrigen,
  modulosConProblema,
  pegarAOtros,
  puedeVoltearse,
  resumenLevantamiento,
  type Espacio,
  type Modulo,
  type ModuloCatalogo,
  type Origen,
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

/** Dibujo del módulo, girado y/o volteado dentro de su huella. */
function DibujoModulo({ m }: { m: Modulo }) {
  if (!m.imagen) return null;
  // Al girar 90/270 la huella intercambia lados, así que el dibujo se mide
  // contra la huella ORIGINAL y luego se gira sobre su centro.
  const deLado = m.rotacion === 90 || m.rotacion === 270;
  const anchoPct = deLado ? (m.ancho / m.largo) * 100 : 100;
  const altoPct = deLado ? (m.largo / m.ancho) * 100 : 100;

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2"
      style={{
        width: `${anchoPct}%`,
        height: `${altoPct}%`,
        transform: `translate(-50%, -50%) rotate(${m.rotacion}deg) scaleX(${m.espejo ? -1 : 1})`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={m.imagen} alt={m.tipo} draggable={false} className="h-full w-full" style={{ objectFit: "fill" }} />
    </div>
  );
}

/**
 * Las distancias del módulo elegido a las cuatro paredes. Es lo que el
 * vendedor necesita ver mientras arrastra: "queda a dos metros de la pared".
 * Se quedan puestas al soltar, para poder comparar con la siguiente pieza.
 */
function Separaciones({ m, espacio }: { m: Modulo; espacio: Espacio }) {
  const izq = m.x;
  const der = espacio.largo - (m.x + m.largo);
  const arr = m.y;
  const aba = espacio.ancho - (m.y + m.ancho);

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
  const etiqueta =
    "absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded px-1 py-0.5 text-[10px] font-bold text-white whitespace-nowrap";
  const fondo = { background: "#f7c530", color: "#3d2f00" };
  const raya = "absolute z-10 border-dashed border-[#f7c530]";

  return (
    <>
      {/* Izquierda */}
      <div
        className={`${raya} border-t-2`}
        style={{ left: 0, width: pct(izq, espacio.largo), top: pct(m.y + m.ancho / 2, espacio.ancho) }}
      />
      <div
        className={etiqueta}
        style={{ ...fondo, left: pct(izq / 2, espacio.largo), top: pct(m.y + m.ancho / 2, espacio.ancho) }}
      >
        {izq.toFixed(2)}
      </div>

      {/* Derecha */}
      <div
        className={`${raya} border-t-2`}
        style={{
          left: pct(m.x + m.largo, espacio.largo),
          width: pct(der, espacio.largo),
          top: pct(m.y + m.ancho / 2, espacio.ancho),
        }}
      />
      <div
        className={etiqueta}
        style={{
          ...fondo,
          left: pct(m.x + m.largo + der / 2, espacio.largo),
          top: pct(m.y + m.ancho / 2, espacio.ancho),
        }}
      >
        {der.toFixed(2)}
      </div>

      {/* Arriba */}
      <div
        className={`${raya} border-l-2`}
        style={{ top: 0, height: pct(arr, espacio.ancho), left: pct(m.x + m.largo / 2, espacio.largo) }}
      />
      <div
        className={etiqueta}
        style={{ ...fondo, top: pct(arr / 2, espacio.ancho), left: pct(m.x + m.largo / 2, espacio.largo) }}
      >
        {arr.toFixed(2)}
      </div>

      {/* Abajo */}
      <div
        className={`${raya} border-l-2`}
        style={{
          top: pct(m.y + m.ancho, espacio.ancho),
          height: pct(aba, espacio.ancho),
          left: pct(m.x + m.largo / 2, espacio.largo),
        }}
      />
      <div
        className={etiqueta}
        style={{
          ...fondo,
          top: pct(m.y + m.ancho + aba / 2, espacio.ancho),
          left: pct(m.x + m.largo / 2, espacio.largo),
        }}
      >
        {aba.toFixed(2)}
      </div>
    </>
  );
}

export function Planeador() {
  // Arranque de un empaque típico; el vendedor lo cambia con lo que mida.
  const [espacio, setEspacio] = useState<Espacio>({ largo: 25, ancho: 13 });
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [notas, setNotas] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  // Ancho compartido: lo que hace que la línea quede alineada.
  const [anchoLinea, setAnchoLinea] = useState(1.2);
  const [largoLinea, setLargoLinea] = useState(3);
  const [tipoMesa, setTipoMesa] = useState<TipoMesa>("guia-central");
  const [cuantosPostes, setCuantosPostes] = useState(0);
  const [clasif, setClasif] = useState<ClasificadoraParams>({
    lineas: 6,
    salidas: 12,
    pasoSalidas: 36,
    lado: "derecha",
    tipoCopita: "charola",
    medidaCopita: '6"',
    conPeso: false,
  });

  const lienzoRef = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ id: string; dx: number; dy: number } | null>(null);

  // Todo se posiciona en PORCENTAJES del lienzo, no en pixeles: así el dibujo
  // se reescala solo al girar el teléfono o cambiar de pantalla.
  const pctX = (metros: number) => `${(metros / espacio.largo) * 100}%`;
  const pctY = (metros: number) => `${(metros / espacio.ancho) * 100}%`;

  const conProblema = modulosConProblema(modulos, espacio);
  const maquinas = modulos.filter((m) => !m.esPoste);
  // Los postes, de izquierda a derecha, para poder medir entre uno y otro.
  const postes = modulos.filter((m) => m.esPoste).sort((a, b) => a.x - b.x);
  const cabe = maquinas.length > 0 && conProblema.size === 0;
  const ocupado = areaOcupada(modulos);
  const areaEspacio = espacio.largo * espacio.ancho;

  // El id se genera FUERA del actualizador: React puede correr el actualizador
  // dos veces, y entonces el módulo se quedaba con un id y la selección con
  // otro — el panel de ajustes nunca abría.
  function agregar(mod: ModuloCatalogo) {
    const id = nuevoId();
    setModulos((prev) => {
      const { x, y } = buscarHueco(prev, espacio, mod.largo, mod.ancho);
      return [
        ...prev,
        {
          id,
          tipo: mod.tipo,
          largo: mod.largo,
          ancho: mod.ancho,
          x,
          y,
          origen: "nueva" as Origen,
          imagen: mod.imagen,
          rotacion: 0 as const,
          espejo: false,
        },
      ];
    });
    setSeleccionado(id);
  }

  /** Mete al dibujo la clasificadora armada con lo que se pidió arriba. */
  function agregarClasificadora() {
    const id = nuevoId();
    const { largo, ancho } = medidaClasificadora(clasif);
    const imagen = comoDataUri(svgClasificadora(clasif));
    const tipo = nombreClasificadora(clasif);
    setModulos((prev) => {
      const { x, y } = buscarHueco(prev, espacio, largo, ancho);
      return [
        ...prev,
        { id, tipo, largo, ancho, x, y, origen: "nueva" as Origen, imagen, rotacion: 0 as const, espejo: false },
      ];
    });
    setSeleccionado(id);
  }

  /** Los módulos que van en línea, todos con el mismo ancho para que alineen. */
  function agregarEnLinea(que: "cepilladora" | "mesa" | "tolva" | "banda") {
    const id = nuevoId();
    const largo = largoLinea;
    const ancho = anchoLinea;
    const { tipo, svg } =
      que === "cepilladora"
        ? { tipo: `Cepilladora ${ancho.toFixed(2)} m`, svg: svgCepilladora(largo, ancho) }
        : que === "mesa"
          ? {
              tipo: `Selección manual · ${TIPOS_MESA.find((t) => t.valor === tipoMesa)?.etiqueta}`,
              svg: svgMesaSeleccion(largo, ancho, tipoMesa),
            }
          : que === "tolva"
            ? { tipo: `Tolva ${ancho.toFixed(2)} m`, svg: svgTolva(largo, ancho) }
            : { tipo: `Banda ${ancho.toFixed(2)} m`, svg: svgBanda(largo, ancho) };

    setModulos((prev) => {
      const { x, y } = buscarHueco(prev, espacio, largo, ancho);
      return [
        ...prev,
        {
          id,
          tipo,
          largo,
          ancho,
          x,
          y,
          origen: "nueva" as Origen,
          imagen: comoDataUri(svg),
          rotacion: 0 as const,
          espejo: false,
        },
      ];
    });
    setSeleccionado(id);
  }

  /** Pone de golpe los postes de la nave, repartidos parejo a lo largo. */
  function ponerPostes(cuantos: number) {
    setModulos((prev) => {
      const sinPostes = prev.filter((m) => !m.esPoste);
      if (cuantos <= 0) return sinPostes;
      const separacion = espacio.largo / (cuantos + 1);
      const nuevos: Modulo[] = [];
      for (let i = 1; i <= cuantos; i++) {
        nuevos.push({
          id: nuevoId(),
          tipo: "Poste",
          largo: POSTE,
          ancho: POSTE,
          x: +(separacion * i - POSTE / 2).toFixed(2),
          y: +(espacio.ancho / 2 - POSTE / 2).toFixed(2),
          origen: "cliente" as Origen,
          rotacion: 0 as const,
          espejo: false,
          esPoste: true,
        });
      }
      return [...sinPostes, ...nuevos];
    });
    setSeleccionado(null);
  }

  function actualizar(id: string, cambios: Partial<Modulo>) {
    setModulos((prev) => prev.map((m) => (m.id === id ? { ...m, ...cambios } : m)));
  }

  function girar(m: Modulo) {
    const siguiente = (((m.rotacion + 90) % 360) as 0 | 90 | 180 | 270);
    // La huella gira con el dibujo: lo que era largo pasa a ser ancho.
    actualizar(m.id, { rotacion: siguiente, largo: m.ancho, ancho: m.largo });
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
    const m = modulos.find((x) => x.id === a.id);
    if (!m) return;
    // Se pega solo a las orillas de las otras piezas: alinear al centímetro
    // con el dedo en un teléfono no se puede.
    const pegado = pegarAOtros(m, modulos, espacio, redondea(p.x - a.dx), redondea(p.y - a.dy));
    actualizar(a.id, pegado);
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
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-ink-mute">
            ¿Cuántos postes hay?
            <input
              type="number"
              min={0}
              max={30}
              value={cuantosPostes}
              onChange={(e) => {
                const n = Math.max(0, Math.min(30, Number(e.target.value) || 0));
                setCuantosPostes(n);
                ponerPostes(n);
              }}
              className="w-24 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-base text-ink outline-none focus:border-marca"
            />
          </label>
          {postes.length > 0 && (
            <p className="pb-2.5 text-sm text-ink-mute">
              Quedan a {(espacio.largo / (postes.length + 1)).toFixed(2)} m uno del otro. Arrástralos a donde estén de
              verdad.
            </p>
          )}
        </div>
        <p className="text-xs text-ink-mute">
          Los postes salen repartidos parejo; muévelos a su lugar real. Nada puede quedar encima de uno, y abajo del
          dibujo te digo a qué distancia quedó cada uno.
        </p>
      </div>

      {/* 2. La clasificadora a la medida — es el corazón de la venta */}
      <div className="card flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-ink">2. Arma la clasificadora que necesita</p>
          <p className="text-sm text-ink-mute">
            Queda de {medidaClasificadora(clasif).largo.toFixed(2)} x {medidaClasificadora(clasif).ancho.toFixed(2)} m
          </p>
        </div>

        {/* Copita: de un toque, sin teclear medidas */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">Copita</p>
          <div className="flex flex-wrap gap-2">
            {COPITAS.map((c) => {
              const elegida = clasif.tipoCopita === c.tipo && clasif.medidaCopita === c.medida;
              return (
                <button
                  key={c.etiqueta}
                  type="button"
                  onClick={() =>
                    setClasif((s) => ({ ...s, tipoCopita: c.tipo, medidaCopita: c.medida, conPeso: c.conPeso }))
                  }
                  className="rounded-full border px-3.5 py-2 text-sm font-medium transition"
                  style={
                    elegida
                      ? { background: "var(--marca)", color: "#fff", borderColor: "var(--marca)" }
                      : { borderColor: "var(--line-strong)", color: "var(--ink-soft)" }
                  }
                >
                  {c.etiqueta}
                </button>
              );
            })}
          </div>
        </div>

        {/* Líneas */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">Líneas</p>
          <div className="flex flex-wrap gap-2">
            {LINEAS_TIPICAS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setClasif((s) => ({ ...s, lineas: n }))}
                className="rounded-full border px-4 py-2 text-sm font-medium transition"
                style={
                  clasif.lineas === n
                    ? { background: "var(--marca)", color: "#fff", borderColor: "var(--marca)" }
                    : { borderColor: "var(--line-strong)", color: "var(--ink-soft)" }
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Lado de las salidas */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">Salidas hacia</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { v: "izquierda", t: "Lado izquierdo" },
                { v: "derecha", t: "Lado derecho" },
                { v: "ambos", t: "Los dos lados" },
              ] as { v: Lado; t: string }[]
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setClasif((s) => ({ ...s, lado: o.v }))}
                className="rounded-full border px-3.5 py-2 text-sm font-medium transition"
                style={
                  clasif.lado === o.v
                    ? { background: "var(--marca)", color: "#fff", borderColor: "var(--marca)" }
                    : { borderColor: "var(--line-strong)", color: "var(--ink-soft)" }
                }
              >
                {o.t}
              </button>
            ))}
          </div>
        </div>

        {/* Lo fino se queda guardado: casi nunca se toca */}
        <details className="text-sm text-ink-soft">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-ink-mute">
            Salidas y separación
          </summary>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs text-ink-mute">
              Salidas por lado
              <input
                type="number"
                min={1}
                max={40}
                value={clasif.salidas}
                onChange={(e) => setClasif((c) => ({ ...c, salidas: Math.max(1, Number(e.target.value) || 1) }))}
                className="w-24 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-base text-ink outline-none focus:border-marca"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-mute">
              Cada cuántas pulgadas
              <input
                type="number"
                min={6}
                max={72}
                value={clasif.pasoSalidas}
                onChange={(e) => setClasif((c) => ({ ...c, pasoSalidas: Math.max(6, Number(e.target.value) || 6) }))}
                className="w-24 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-base text-ink outline-none focus:border-marca"
              />
            </label>
          </div>
        </details>

        {/* Vista previa: se ve antes de meterla al dibujo */}
        <div className="overflow-hidden rounded-xl border border-line bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={comoDataUri(svgClasificadora(clasif))}
            alt={nombreClasificadora(clasif)}
            className="mx-auto block w-full"
            style={{ maxHeight: 260, objectFit: "contain" }}
          />
        </div>
        <p className="text-center text-xs text-ink-mute">{nombreClasificadora(clasif)}</p>

        <button type="button" onClick={agregarClasificadora} className="btn-marca self-start">
          <Icon name="lucide:plus" size={18} /> Meterla al dibujo
        </button>
      </div>

      {/* 3. Lo demás de la línea */}
      <div className="card flex flex-col gap-4 p-5">
        <p className="text-sm font-semibold text-ink">3. Agrega lo demás de la línea</p>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-ink-mute">
            Ancho de la línea (m)
            <select
              value={anchoLinea}
              onChange={(e) => setAnchoLinea(Number(e.target.value))}
              className="rounded-xl border border-line-strong bg-bg-2 p-2.5 text-sm text-ink outline-none focus:border-marca"
            >
              {ANCHOS_EN_LINEA.map((a) => (
                <option key={a} value={a}>
                  {a.toFixed(2)} m
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-mute">
            Largo (m)
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={largoLinea}
              onChange={(e) => setLargoLinea(Math.max(0.5, Number(e.target.value) || 0.5))}
              className="w-24 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-sm text-ink outline-none focus:border-marca"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-mute">
            Guía de la mesa
            <select
              value={tipoMesa}
              onChange={(e) => setTipoMesa(e.target.value as TipoMesa)}
              className="rounded-xl border border-line-strong bg-bg-2 p-2.5 text-sm text-ink outline-none focus:border-marca"
            >
              {TIPOS_MESA.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => agregarEnLinea("cepilladora")} className="btn-ghost !py-2 !text-sm">
            + Cepilladora
          </button>
          <button type="button" onClick={() => agregarEnLinea("mesa")} className="btn-ghost !py-2 !text-sm">
            + Mesa de selección
          </button>
          <button type="button" onClick={() => agregarEnLinea("tolva")} className="btn-ghost !py-2 !text-sm">
            + Tolva
          </button>
          <button type="button" onClick={() => agregarEnLinea("banda")} className="btn-ghost !py-2 !text-sm">
            + Banda
          </button>
        </div>

        <p className="text-xs text-ink-mute">
          Todas entran con el mismo ancho de línea, así se alinean con la clasificadora. Las tolvas típicas van a 0.90,
          1.20 y 1.80 m.
        </p>

        <details className="text-sm text-ink-soft">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-ink-mute">
            Otros módulos
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATALOGO_MODULOS.filter((m) => !m.imagen).map((mod) => (
              <button
                key={mod.tipo}
                type="button"
                onClick={() => agregar(mod)}
                className="rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-marca hover:text-marca"
              >
                + {mod.tipo}
                <span className="ml-1 text-ink-mute">
                  {mod.largo.toFixed(2)}×{mod.ancho.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </details>
      </div>

      {/* 4. El dibujo */}
      <div className="card flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink">3. Acomódalos arrastrando con el dedo</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-mute">
            {ORIGENES.map((o) => (
              <span key={o.valor} className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded" style={{ background: o.color }} /> {o.etiqueta}
              </span>
            ))}
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

          {/* Las distancias a las paredes del que está elegido */}
          {activo && !activo.esPoste && <Separaciones m={activo} espacio={espacio} />}

          {modulos.map((m) => {
            const malo = conProblema.has(m.id);
            const elegido = m.id === seleccionado;
            const color = malo ? "#c92a2a" : m.esPoste ? "#495057" : colorDeOrigen(m.origen);
            return (
              <div
                key={m.id}
                onPointerDown={(e) => alBajarDedo(e, m)}
                className="absolute flex cursor-grab select-none items-center justify-center overflow-hidden rounded-md text-center text-white active:cursor-grabbing"
                style={{
                  left: pctX(m.x),
                  top: pctY(m.y),
                  width: pctX(m.largo),
                  height: pctY(m.ancho),
                  background: m.imagen ? "#fff" : color,
                  // Con dibujo, el color va en el borde para no tapar la línea.
                  border: m.imagen ? `3px solid ${color}` : "none",
                  outline: elegido ? "3px solid #f7c530" : "none",
                  outlineOffset: "-1px",
                  touchAction: "none",
                }}
                title={`${m.tipo} — ${m.largo.toFixed(2)} x ${m.ancho.toFixed(2)} m`}
              >
                <DibujoModulo m={m} />
                {/* El nombre va SIEMPRE encima: si no, dos bloques chicos se
                    ven iguales y no se sabe cuál es cuál. */}
                {!m.esPoste && (
                  <span
                    className="pointer-events-none absolute left-0 top-0 max-w-full truncate rounded-br px-1 text-[9px] font-bold leading-[1.4]"
                    style={{ background: color, color: "#fff" }}
                  >
                    {m.tipo}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-ink-mute">
          A escala: {espacio.largo.toFixed(2)} m de largo x {espacio.ancho.toFixed(2)} m de ancho, visto desde arriba. En{" "}
          <span style={{ color: "#c92a2a" }}>rojo</span> lo que se encima o se sale.
        </p>

        {/* Las distancias entre postes: eso decide qué cabe entre uno y otro */}
        {postes.length > 0 && (
          <div className="rounded-xl border border-line bg-bg-2 p-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-mute">Claro entre postes</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
              <span>
                Pared → poste 1: <b>{postes[0].x.toFixed(2)} m</b>
              </span>
              {postes.slice(1).map((p, i) => (
                <span key={p.id}>
                  Poste {i + 1} → {i + 2}:{" "}
                  <b>{(p.x - (postes[i].x + postes[i].largo)).toFixed(2)} m</b>
                </span>
              ))}
              <span>
                Poste {postes.length} → pared:{" "}
                <b>{(espacio.largo - (postes[postes.length - 1].x + postes[postes.length - 1].largo)).toFixed(2)} m</b>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Ajustes del módulo elegido */}
      {activo && (
        <div className="card flex flex-col gap-4 p-5">
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

          {/* Vista grande: para confirmar que es la máquina correcta */}
          {activo.imagen && (
            <div className="overflow-hidden rounded-xl border border-line bg-white p-2">
              <div
                className="relative mx-auto"
                style={{ width: "100%", aspectRatio: `${activo.largo} / ${activo.ancho}` }}
              >
                <DibujoModulo m={activo} />
              </div>
            </div>
          )}

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
            <button type="button" onClick={() => girar(activo)} className="btn-ghost !py-2 !text-sm">
              <Icon name="lucide:rotate-cw" size={15} /> Girar 90° ({activo.rotacion}°)
            </button>
          </div>

          {!activo.esPoste && (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">¿De dónde sale?</p>
                <div className="flex flex-wrap gap-2">
                  {ORIGENES.map((o) => {
                    const elegido = activo.origen === o.valor;
                    return (
                      <button
                        key={o.valor}
                        type="button"
                        onClick={() =>
                          actualizar(activo.id, {
                            origen: o.valor,
                            // Si deja de ser fabricada nueva, el espejo ya no aplica.
                            espejo: o.espejo ? activo.espejo : false,
                          })
                        }
                        className="rounded-full border px-3 py-1.5 text-xs font-medium transition"
                        style={
                          elegido
                            ? { background: o.color, color: "#fff", borderColor: o.color }
                            : { borderColor: "var(--line-strong)", color: "var(--ink-soft)" }
                        }
                      >
                        {o.etiqueta}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={!puedeVoltearse(activo.origen)}
                  onClick={() => actualizar(activo.id, { espejo: !activo.espejo })}
                  className="btn-ghost self-start !py-2 !text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon name="lucide:flip-horizontal" size={15} />
                  {activo.espejo ? "Quitar espejo" : "Voltear en espejo (salidas al otro lado)"}
                </button>
                {!puedeVoltearse(activo.origen) && (
                  <p className="text-xs text-ink-mute">
                    Esta máquina ya está construida, así que sus salidas no se pueden cambiar de lado. Solo las{" "}
                    <b>nuevas a fabricar</b> se pueden pedir en espejo.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* 5. ¿Cabe? */}
      <div
        className="rounded-2xl border p-5"
        style={{
          borderColor: maquinas.length === 0 ? "var(--line)" : cabe ? "#2f9e44" : "#c92a2a",
          background:
            maquinas.length === 0
              ? "transparent"
              : cabe
                ? "color-mix(in srgb, #2f9e44 12%, transparent)"
                : "color-mix(in srgb, #c92a2a 12%, transparent)",
        }}
      >
        {maquinas.length === 0 ? (
          <p className="text-sm text-ink-mute">Agrega módulos para saber si cabe.</p>
        ) : (
          <>
            <p className="font-display text-2xl font-semibold">{cabe ? "Sí cabe 👍" : "Todavía no cabe"}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {cabe
                ? `Las ${maquinas.length} máquinas entran en el espacio, sin encimarse ni chocar con los postes.`
                : "Hay módulos en rojo: se enciman, chocan con un poste o se salen del espacio."}
            </p>
            <p className="mt-2 text-sm text-ink-mute">
              Ocupado: {ocupado.toFixed(1)} m² de {areaEspacio.toFixed(1)} m² (
              {Math.round((ocupado / areaEspacio) * 100)}%)
            </p>
          </>
        )}
      </div>

      {/* 6. Mandarlo */}
      <div className="card flex flex-col gap-4 p-5">
        <p className="text-sm font-semibold text-ink">4. Mándalo para cotizar</p>
        <label className="flex flex-col gap-2 text-sm text-ink-soft">
          ¿Algo más que debamos saber? (fruta, capacidad, desniveles, altura del techo)
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
