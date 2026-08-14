"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import { CONFIG } from "@/lib/config";
import { enPulgadas, medidaClasificadora, type ClasificadoraParams } from "@/lib/dibujos";
import { ORIGENES, colorDeOrigen, type Espacio, type Modulo } from "@/lib/planeador";

/**
 * El layout final que ve el CLIENTE. Es otra cosa que la pantalla del
 * vendedor: aquella es herramienta de trabajo y puede verse tosca; ésta
 * decide la venta, así que va limpia, a escala, acotada y con la marca.
 *
 * Se dibuja en UN SOLO SVG en metros, no con recuadros de HTML como el
 * lienzo que se arrastra: así las cotas, las flechas y el texto salen
 * parejos en pantalla y en el PDF, sin importar el tamaño de la hoja.
 */

/** Punta de flecha de las cotas, del tamaño que le toque al plano. */
function Flechas({ u }: { u: number }) {
  const p = `0 0, ${u * 9} ${u * 3}, 0 ${u * 6}`;
  return (
    <defs>
      <marker id="flecha-ini" markerWidth={u * 9} markerHeight={u * 6} refX={0} refY={u * 3} orient="auto" markerUnits="userSpaceOnUse">
        <polygon points={`${u * 9} 0, 0 ${u * 3}, ${u * 9} ${u * 6}`} fill="#111" />
      </marker>
      <marker id="flecha-fin" markerWidth={u * 9} markerHeight={u * 6} refX={u * 9} refY={u * 3} orient="auto" markerUnits="userSpaceOnUse">
        <polygon points={p} fill="#111" />
      </marker>
    </defs>
  );
}

/** Una cota: la raya con sus dos flechas y el número encima. */
function Cota({
  x1,
  y1,
  x2,
  y2,
  texto,
  u,
  txt,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  texto: string;
  u: number;
  txt: number;
}) {
  const horizontal = Math.abs(y2 - y1) < 1e-6;
  // El número va SIEMPRE derecho: una cota de canto no se lee en un teléfono.
  const tx = horizontal ? (x1 + x2) / 2 : x1 + txt * 0.4;
  const ty = horizontal ? y1 - txt * 0.35 : (y1 + y2) / 2;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#111"
        strokeWidth={u}
        markerStart="url(#flecha-ini)"
        markerEnd="url(#flecha-fin)"
      />
      {/* Fondo blanco detrás del número, para que no se encime con la raya */}
      <text
        x={tx}
        y={ty}
        fontSize={txt}
        textAnchor={horizontal ? "middle" : "start"}
        dominantBaseline={horizontal ? "auto" : "middle"}
        fill="#111"
        stroke="#fff"
        strokeWidth={txt * 0.28}
        paintOrder="stroke"
        fontWeight={700}
      >
        {texto}
      </text>
    </g>
  );
}

/** El plano en planta, a escala, acotado a las paredes. */
function PlanoFinal({ espacio, modulos }: { espacio: Espacio; modulos: Modulo[] }) {
  const tam = Math.max(espacio.largo, espacio.ancho);
  const u = tam / 500; // grosor base de raya
  // La letra va en metros del plano, no en píxeles: así se ve igual de grande
  // en la hoja impresa que en el teléfono, sin importar a qué tamaño salga.
  const txt = tam / 44;
  const margen = Math.max(1.8, tam * 0.13);
  const r = tam / 40; // radio del globito del número

  return (
    <svg
      viewBox={`${-margen} ${-margen} ${espacio.largo + margen * 2} ${espacio.ancho + margen * 2}`}
      className="block w-full"
      style={{ background: "#fff" }}
    >
      <Flechas u={u} />

      {/* El piso del empaque */}
      <rect x={0} y={0} width={espacio.largo} height={espacio.ancho} fill="#fff" stroke="#111" strokeWidth={u * 2.2} />

      {/* Las máquinas, cada una con su dibujo girado como quedó */}
      {modulos.map((m, i) => {
        const color = colorDeOrigen(m.origen);
        const deLado = m.rotacion === 90 || m.rotacion === 270;
        const w0 = deLado ? m.ancho : m.largo;
        const h0 = deLado ? m.largo : m.ancho;
        const cx = m.x + m.largo / 2;
        const cy = m.y + m.ancho / 2;

        // El globito va ARRIBA de la pieza; si no cabe arriba, va abajo.
        const arriba = m.y - r * 1.9 > -margen * 0.75;
        const gy = arriba ? m.y - r * 1.6 : m.y + m.ancho + r * 1.6;

        return (
          <g key={m.id}>
            <rect x={m.x} y={m.y} width={m.largo} height={m.ancho} fill="#fff" stroke={color} strokeWidth={u * 1.6} />
            {m.imagen && (
              <g
                transform={`translate(${cx} ${cy}) rotate(${m.rotacion}) scale(${m.espejo ? -1 : 1} 1) translate(${-w0 / 2} ${-h0 / 2})`}
                opacity={0.92}
              >
                <image href={m.imagen} x={0} y={0} width={w0} height={h0} preserveAspectRatio="none" />
              </g>
            )}
            {/* Guía del globito a la pieza */}
            <line x1={cx} y1={gy} x2={cx} y2={arriba ? m.y : m.y + m.ancho} stroke="#111" strokeWidth={u * 0.7} />
            <circle cx={cx} cy={gy} r={r} fill="#fff" stroke="#111" strokeWidth={u * 1.2} />
            <text x={cx} y={gy} fontSize={r * 1.25} textAnchor="middle" dominantBaseline="central" fill="#111" fontWeight={700}>
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* Cota de cada máquina a su pared más cercana, a lo largo y a lo ancho.
          Si ya está pegada a la pared no se acota: no hay nada que medir. */}
      {modulos.map((m) => {
        const izq = m.x;
        const der = espacio.largo - (m.x + m.largo);
        const arr = m.y;
        const aba = espacio.ancho - (m.y + m.ancho);
        const cy = m.y + m.ancho / 2;
        const cx = m.x + m.largo / 2;
        const minimo = 0.06; // pegada a la pared: no se acota

        const cotas = [];
        if (Math.min(izq, der) > minimo) {
          const aLaIzquierda = izq <= der;
          cotas.push(
            <Cota
              key={`${m.id}-x`}
              x1={aLaIzquierda ? 0 : m.x + m.largo}
              y1={cy}
              x2={aLaIzquierda ? m.x : espacio.largo}
              y2={cy}
              texto={(aLaIzquierda ? izq : der).toFixed(2)}
              u={u}
              txt={txt}
            />
          );
        }
        if (Math.min(arr, aba) > minimo) {
          const arribita = arr <= aba;
          cotas.push(
            <Cota
              key={`${m.id}-y`}
              x1={cx}
              y1={arribita ? 0 : m.y + m.ancho}
              x2={cx}
              y2={arribita ? m.y : espacio.ancho}
              texto={(arribita ? arr : aba).toFixed(2)}
              u={u}
              txt={txt}
            />
          );
        }
        return cotas;
      })}

      {/* Las medidas del empaque completo */}
      <Cota
        x1={0}
        y1={espacio.ancho + margen * 0.45}
        x2={espacio.largo}
        y2={espacio.ancho + margen * 0.45}
        texto={`${espacio.largo.toFixed(2)} m`}
        u={u}
        txt={txt * 1.15}
      />
      <Cota
        x1={-margen * 0.45}
        y1={0}
        x2={-margen * 0.45}
        y2={espacio.ancho}
        texto={`${espacio.ancho.toFixed(2)} m`}
        u={u}
        txt={txt * 1.15}
      />

      {/* Barra de escala: vale aunque la hoja se imprima de cualquier tamaño */}
      {(() => {
        const paso = tam > 30 ? 5 : tam > 12 ? 2 : 1;
        const alto = txt * 0.5;
        const y = espacio.ancho + margen * 0.78;
        const tramos = [0, 1, 2, 3];
        return (
          <g>
            {tramos.map((t) => (
              <rect
                key={t}
                x={t * paso}
                y={y}
                width={paso}
                height={alto}
                fill={t % 2 === 0 ? "#111" : "#fff"}
                stroke="#111"
                strokeWidth={u * 0.8}
              />
            ))}
            <text x={0} y={y + alto + txt} fontSize={txt * 0.85} fill="#111">
              0
            </text>
            <text x={paso * 4} y={y + alto + txt} fontSize={txt * 0.85} textAnchor="middle" fill="#111">
              {paso * 4} m
            </text>
          </g>
        );
      })()}

      <text x={espacio.largo} y={-margen * 0.45} fontSize={txt} textAnchor="end" fill="#555">
        Visto desde arriba · medidas en metros
      </text>
    </svg>
  );
}

export function LayoutFinal({
  espacio,
  modulos,
  nombres,
  clasif,
  fruta,
  cabe,
  sinMedir,
  onCerrar,
}: {
  espacio: Espacio;
  modulos: Modulo[];
  nombres: Record<string, string>;
  clasif: ClasificadoraParams;
  fruta: string;
  cabe: boolean;
  sinMedir: string[];
  onCerrar: () => void;
}) {
  const [cliente, setCliente] = useState("");
  const hayClasificadora = modulos.some((m) => m.tipo.startsWith("Clasificadora"));
  const medidaClasif = medidaClasificadora(clasif);
  const fecha = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  const usados = ORIGENES.filter((o) => modulos.some((m) => m.origen === o.valor));

  /**
   * Se cuelga del `body`, no del planeador, y le pone una marca mientras está
   * abierta. Así al guardar el PDF sale SOLO la hoja: si se queda dentro del
   * planeador, la pantalla del vendedor se imprime también, debajo.
   */
  useEffect(() => {
    document.body.classList.add("con-layout-final");
    return () => document.body.classList.remove("con-layout-final");
  }, []);

  return createPortal(
    <div className="capa-layout fixed inset-0 z-50 overflow-y-auto" style={{ background: "#f4f4f4" }}>
      {/* Los controles no salen en el PDF */}
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-black/10 bg-white px-4 py-3">
        <button onClick={onCerrar} className="inline-flex items-center gap-2 text-sm font-semibold text-black/70 hover:text-black">
          <Icon name="lucide:arrow-left" size={16} /> Volver a acomodar
        </button>
        <input
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="¿De quién es el empaque?"
          className="min-w-[12rem] flex-1 rounded-lg border border-black/20 bg-white p-2 text-sm text-black outline-none"
        />
        <button onClick={() => window.print()} className="btn-marca !py-2 !text-sm">
          <Icon name="lucide:printer" size={16} /> Guardar en PDF
        </button>
      </div>

      {/* Avisos para el vendedor, nunca para el cliente */}
      {(!cabe || sinMedir.length > 0) && (
        <div className="no-print mx-auto max-w-[1100px] px-4 pt-4">
          <div className="rounded-xl border border-amber-500/40 bg-amber-50 p-3 text-sm text-amber-900">
            {!cabe && <p>Ojo: con este acomodo todavía hay piezas encimadas o fuera del espacio.</p>}
            {sinMedir.length > 0 && <p>Falta ponerle el largo a: {sinMedir.join(", ")}.</p>}
          </div>
        </div>
      )}

      {/* LA HOJA */}
      <div className="hoja-layout mx-auto my-4 max-w-[1100px] bg-white p-6 shadow-lg print:my-0 print:max-w-none print:shadow-none">
        {/* Encabezado con la marca */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            {CONFIG.marca.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={CONFIG.marca.logo} alt={CONFIG.marca.negocio} className="h-14 w-14 rounded-full object-cover" />
            )}
            <div>
              <p className="font-display text-2xl font-semibold leading-none text-black">{CONFIG.marca.negocio}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-black/60">Layout de línea de empaque</p>
            </div>
          </div>
          <div className="text-right text-xs leading-relaxed text-black/70">
            {cliente && (
              <p>
                <b className="text-black">Cliente:</b> {cliente}
              </p>
            )}
            {fruta && (
              <p>
                <b className="text-black">Fruta:</b> {fruta}
              </p>
            )}
            <p>
              <b className="text-black">Piso:</b> {espacio.largo.toFixed(2)} × {espacio.ancho.toFixed(2)} m
            </p>
            <p>{fecha}</p>
          </div>
        </div>

        {/* El plano */}
        <div className="my-4 border border-black/15 p-2">
          <PlanoFinal espacio={espacio} modulos={modulos} />
        </div>

        {/* La ficha de la clasificadora: es el corazón de la cotización */}
        {hayClasificadora && (
          <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2 border border-black/20 p-3 text-sm text-black sm:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-black/50">Copita</p>
              <p className="font-semibold">
                {clasif.tipoCopita === "charola" ? "Charola" : "Clip"} {clasif.medidaCopita}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-black/50">Salidas a cada</p>
              <p className="font-semibold">{enPulgadas(clasif.pasoSalidas)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-black/50">Líneas y salidas</p>
              <p className="font-semibold">
                {clasif.lineas} líneas × {clasif.salidas} salidas
                {clasif.lado === "ambos" ? " a los dos lados" : clasif.lado === "izquierda" ? " al lado izquierdo" : " al lado derecho"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-black/50">Mide</p>
              <p className="font-semibold">
                {medidaClasif.largo.toFixed(2)} × {medidaClasif.ancho.toFixed(2)} m
              </p>
            </div>
          </div>
        )}

        {/* La lista numerada, igual que en sus planos */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-1 text-[13px] leading-snug text-black sm:grid-cols-2">
          {modulos.map((m, i) => (
            <div key={m.id} className="flex gap-2 border-b border-black/10 py-1">
              <span className="w-5 shrink-0 text-right font-bold">{i + 1}.</span>
              <span
                className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: colorDeOrigen(m.origen) }}
                aria-hidden
              />
              <span className="flex-1">
                {nombres[m.id]}
                <span className="text-black/60">
                  {" "}
                  — {m.largo.toFixed(2)} m de largo × {m.ancho.toFixed(2)} m de ancho útil
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Qué quiere decir cada color */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-black/20 pt-3 text-xs text-black/70">
          {usados.map((o) => (
            <span key={o.valor} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: o.color }} /> {o.etiqueta}
            </span>
          ))}
          <span className="ml-auto">
            {CONFIG.marca.negocio} · {CONFIG.marca.ciudad} · WhatsApp {CONFIG.marca.whatsappPrincipal}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
