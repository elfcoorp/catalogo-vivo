"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { LayoutFinal } from "@/components/catalogo/LayoutFinal";
import { CONFIG } from "@/lib/config";
import { linkWhatsApp } from "@/lib/whatsapp";
import {
  COPITAS,
  LINEAS_TIPICAS,
  anchoDeLinea,
  lineasQueAlcanza,
  largoPegadoALaClasificadora,
  enPulgadas,
  comoDataUri,
  medidaClasificadora,
  nombreClasificadora,
  svgBanda,
  svgCaseta,
  svgCepilladora,
  svgClasificadora,
  svgDescanicador,
  svgVaciado,
  svgMesaSeleccion,
  svgTolva,
  type ClasificadoraParams,
  type Lado,
  type TipoMesa,
} from "@/lib/dibujos";
import {
  EQUIPOS,
  FRUTAS_LINEA,
  GRUPOS_DEL_RECORRIDO,
  GRUPO_LINEA,
  ORIGENES,
  areaOcupada,
  buscarHueco,
  juntoALaClasificadora,
  colorDeOrigen,
  modulosConProblema,
  acomodarEnOrden,
  conNumero,
  numerosDeModulo,
  pegarAOtros,
  puedeVoltearse,
  resumenLevantamiento,
  type Dibujo,
  type Equipo,
  type Espacio,
  type FrutaLinea,
  type Modulo,
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

/**
 * La figura que le toca a cada equipo, dibujada a la medida que tenga en ese
 * momento. Se vuelve a generar cuando el vendedor teclea la medida buena: si
 * no, el dibujo se quedaba estirado y los cepillos salían deformes.
 */
function svgDe(dibujo: Dibujo | undefined, largo: number, ancho: number, variante?: string): string | undefined {
  switch (dibujo) {
    case "cepilladora":
      return svgCepilladora(largo, ancho);
    case "mesa":
      return svgMesaSeleccion(largo, ancho, (variante as TipoMesa) ?? "guia-central");
    case "descanicador":
      return svgDescanicador(largo, ancho);
    case "vaciado":
      return svgVaciado(largo, ancho);
    case "tolva":
      return svgTolva(largo, ancho);
    case "banda":
      return svgBanda(largo, ancho);
    case "caseta":
      return svgCaseta(largo, ancho);
    default:
      return undefined;
  }
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
  // Se guardan como texto para poder BORRAR el campo y teclear otra medida.
  // Con número, al borrar quedaba "1" pegado y ya no se podía escribir "5".
  const [largoTxt, setLargoTxt] = useState("25");
  const [anchoTxt, setAnchoTxt] = useState("13");
  const espacio: Espacio = {
    largo: Math.max(1, Number(largoTxt) || 1),
    ancho: Math.max(1, Number(anchoTxt) || 1),
  };
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [notas, setNotas] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  /**
   * Lo que se va tecleando en los campos de medida, guardado como TEXTO y
   * aparte del módulo. Si se guarda como número con Math.max(), al borrar el
   * campo queda un "1" pegado que ya no se puede quitar. La clave es
   * `<id>-largo` / `<id>-ancho`.
   */
  const [medidas, setMedidas] = useState<Record<string, string>>({});
  const [fruta, setFruta] = useState("");
  // Al empezar el vendedor va marcando lo que YA HAY parado en el empaque.
  const [poniendo, setPoniendo] = useState<Origen>("cliente");
  // Lo que va con la clasificadora arranca como cotizado, pero sus bancos y
  // descansadores se pueden reaprovechar: por eso lleva su propio botón.
  const [poniendoLinea, setPoniendoLinea] = useState<Origen>("nueva");
  // La hoja limpia que se le enseña al cliente, aparte de esta pantalla.
  const [verLayout, setVerLayout] = useState(false);
  // En cuanto mueve una pieza con el dedo, se deja de reacomodar solo.
  const [acomodadoAMano, setAcomodadoAMano] = useState(false);
  // Arrastrar el grupo completo, para correr la línea ya formada sin
  // desalinearla. Se apaga para ajustar pieza por pieza.
  const [moverTodo, setMoverTodo] = useState(false);
  // Como texto, para poder borrarlo y teclear otra cantidad.
  const [salidasTxt, setSalidasTxt] = useState("12");
  // Vacío = se usa el ancho de los módulos, que es solo una aproximación.
  const [anchoClasifTxt, setAnchoClasifTxt] = useState("");
  const [clasif, setClasif] = useState<ClasificadoraParams>({
    lineas: 6,
    salidas: 12,
    pasoSalidas: 22.5,
    lado: "derecha",
    tipoCopita: "charola",
    medidaCopita: '6"',
    conPeso: false,
  });

  const lienzoRef = useRef<HTMLDivElement>(null);
  // Para poder llevarlo al dibujo cuando mete la clasificadora: el botón está
  // muy arriba y en el teléfono no se alcanza a ver que pasó algo.
  const cardDibujoRef = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ id: string; dx: number; dy: number } | null>(null);

  // Todo se posiciona en PORCENTAJES del lienzo, no en pixeles: así el dibujo
  // se reescala solo al girar el teléfono o cambiar de pantalla.
  const pctX = (metros: number) => `${(metros / espacio.largo) * 100}%`;
  const pctY = (metros: number) => `${(metros / espacio.ancho) * 100}%`;

  // Las salidas se teclean, así que se leen aparte del resto de la config.
  const clasifFinal: ClasificadoraParams = {
    ...clasif,
    salidas: Math.max(1, Number(salidasTxt) || 1),
    anchoManual: Number(anchoClasifTxt) > 0 ? Number(anchoClasifTxt) : undefined,
  };

  const conProblema = modulosConProblema(modulos, espacio);
  const maquinas = modulos;
  const cabe = maquinas.length > 0 && conProblema.size === 0;
  const ocupado = areaOcupada(modulos);
  const areaEspacio = espacio.largo * espacio.ancho;
  const numeros = numerosDeModulo(modulos);
  /** "3. Cepilladora lavadora", como se lee en las listas y en los avisos. */
  const nombreDe = (m: Modulo) => conNumero(numeros[m.id], m.tipo);
  // La fruta manda la copita. Si él ya la escogió, solo se enseña esa familia:
  // si el tomate va con clip, no tiene caso enseñar los botones de charola.
  const frutaInfo = FRUTAS_LINEA.find((f) => f.nombre === fruta);
  const familiasDeCopita: ("clip" | "charola")[] = frutaInfo?.copita ? [frutaInfo.copita] : ["clip", "charola"];

  // Las etapas que ya tienen piezas puestas, en el orden del recorrido. La
  // clasificadora no trae etapa, así que se le pone la suya al final.
  const etapasConPiezas = [...GRUPOS_DEL_RECORRIDO, GRUPO_LINEA, "La clasificadora"].filter((etapa) =>
    modulos.some((m) => (m.etapa ?? "La clasificadora") === etapa)
  );

  /** Qué números traen las clasificadoras que ya están puestas. */
  const clasificadorasPuestas = modulos.filter((m) => m.tipo.startsWith("Clasificadora")).map((m) => numeros[m.id]);

  /**
   * Mete la pieza nueva y, si el vendedor todavía no ha movido nada con el
   * dedo, vuelve a acomodar TODO en orden numérico. En cuanto arrastra algo
   * se deja de reacomodar solo: si no, le desbarataría lo que ya puso.
   */
  function ponerModulo(nuevo: Modulo) {
    setModulos((prev) => {
      // Lo que va CON la clasificadora cae pegado a ella, siempre. Aunque él
      // ya haya acomodado a mano: las tolvas de la clasificadora van a un
      // ladito de la clasificadora, no revueltas del otro lado del empaque.
      if (nuevo.etapa === GRUPO_LINEA) {
        const cerca = juntoALaClasificadora(prev, espacio, nuevo.largo, nuevo.ancho);
        if (cerca) return [...prev, { ...nuevo, ...cerca }];
      }
      if (acomodadoAMano) {
        const { x, y } = buscarHueco(prev, espacio, nuevo.largo, nuevo.ancho);
        return [...prev, { ...nuevo, x, y }];
      }
      return acomodarEnOrden([...prev, nuevo], espacio);
    });
    setSeleccionado(nuevo.id);
  }

  /**
   * Los botones de equipo, agrupados. Se usa dos veces: en el paso 3 con lo
   * que se va viendo al recorrer el empaque, y en el paso 4 con lo que va
   * junto a la clasificadora que se le propone.
   */
  function paleta(grupos: string[], origen: Origen) {
    return grupos.map((grupo) => (
      <div key={grupo} className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">{grupo}</p>
        <div className="flex flex-wrap gap-2">
          {EQUIPOS.filter((e) => e.grupo === grupo).map((eq) => {
            // Los números que ya se le asignaron a este equipo. Antes salía
            // cuántos había y todos marcaban "1", que no decía nada.
            const suyos = modulos.filter((m) => m.tipo === eq.tipo && m.etapa === eq.grupo).map((m) => numeros[m.id]);
            return (
              <button
                key={`${eq.grupo}-${eq.tipo}`}
                type="button"
                onClick={() => agregarEquipo(eq, origen)}
                className="rounded-full border px-3.5 py-2 text-sm font-medium transition"
                style={{ borderColor: "var(--line-strong)", color: "var(--ink-soft)" }}
              >
                {eq.tipo}
                {suyos.length > 0 && (
                  <span
                    className="ml-1.5 inline-block rounded-full px-1.5 text-xs font-bold text-white"
                    style={{ background: "var(--marca)" }}
                  >
                    {suyos.join("·")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    ));
  }

  /** Los dos botones de "ya lo tiene" / "se lo ponemos". */
  function botonesOrigen(valor: Origen, cambiar: (o: Origen) => void) {
    return (
      <div className="flex flex-wrap gap-2">
        {(["cliente", "nueva"] as Origen[]).map((o) => {
          const info = ORIGENES.find((x) => x.valor === o)!;
          const puesto = valor === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => cambiar(o)}
              className="flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition"
              style={
                puesto
                  ? { background: info.color, color: "#fff", borderColor: info.color }
                  : { borderColor: "var(--line-strong)", color: "var(--ink-soft)" }
              }
            >
              {o === "cliente" ? "Ya los tiene" : "Se los cotizamos"}
            </button>
          );
        })}
      </div>
    );
  }

  /**
   * Al escoger la fruta se define sola la copita que le toca: el tomate va
   * con clip 3¾", el morrón con charola 6", el grape con clip 1¼"… Así ya no
   * se le enseñan los botones de la familia que no aplica.
   */
  function escogerFruta(f: FrutaLinea | null) {
    setFruta(f ? f.nombre : "");
    if (!f?.copita) return;
    const dela = COPITAS.filter((c) => c.tipo === f.copita);
    const escogida = dela.find((c) => c.medida === f.medida) ?? dela[0];
    if (!escogida) return;
    setClasif((s) => ({
      ...s,
      tipoCopita: escogida.tipo,
      medidaCopita: escogida.medida,
      pasoSalidas: escogida.salidas.includes(s.pasoSalidas) ? s.pasoSalidas : escogida.salidas[0],
    }));
  }

  /** Quita la última pieza que se puso: para el dedo que se resbaló. */
  function deshacer() {
    setModulos((prev) => prev.slice(0, -1));
    setSeleccionado(null);
  }

  /** Vuelve a formarlos 1, 2, 3… en medio del empaque. */
  function ordenarPorNumero() {
    setModulos((prev) => acomodarEnOrden(prev, espacio));
    setAcomodadoAMano(false);
  }

  // El ancho útil de los equipos que van en fila lo mandan las LÍNEAS de la
  // clasificadora: 2→0.60, 4→0.90, 6→1.20, 8→1.80 m. Así la cepilladora, la
  // mesa y las bandas quedan del mismo ancho que la línea escogida.
  const anchoLinea = anchoDeLinea(clasif.lineas);

  // El id se genera FUERA del actualizador: React puede correr el actualizador
  // dos veces, y entonces el módulo se quedaba con un id y la selección con
  // otro — el panel de ajustes nunca abría.

  /** Mete al dibujo la clasificadora armada con lo que se pidió arriba. */
  function agregarClasificadora() {
    const id = nuevoId();
    const { largo, ancho } = medidaClasificadora(clasifFinal);
    const imagen = comoDataUri(svgClasificadora(clasifFinal));
    const tipo = nombreClasificadora(clasifFinal);
    ponerModulo({
      id,
      tipo,
      largo,
      ancho,
      x: 0,
      y: 0,
      origen: "nueva",
      imagen,
      rotacion: 0,
      espejo: false,
    });
    // Y se le baja al dibujo, para que vea que sí pasó algo.
    requestAnimationFrame(() => cardDibujoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  /**
   * Mete un equipo al dibujo con su medida típica y ya. Las medidas buenas se
   * preguntan después, con todo puesto: el vendedor primero ve alrededor y va
   * marcando lo que hay, sin detenerse a medir cada cosa.
   * Se puede tocar el mismo botón varias veces: cada toque es otra máquina.
   */
  function agregarEquipo(eq: Equipo, origen: Origen) {
    // Lo que corre pegado a la clasificadora saca su largo de las salidas.
    const auto = largoPegadoALaClasificadora(eq.tipo, clasifFinal);
    const largo = auto ?? eq.largo;
    const ancho = eq.ancho ?? anchoLinea;
    const svg = svgDe(eq.dibujo, largo, ancho, eq.variante);

    const id = nuevoId();
    ponerModulo({
      id,
      tipo: eq.tipo,
      largo,
      ancho,
      x: 0,
      y: 0,
      origen,
      imagen: svg ? comoDataUri(svg) : undefined,
      dibujo: eq.dibujo,
      variante: eq.variante,
      etapa: eq.grupo,
      // Si no trae ancho propio, su ancho lo manda la línea: a ésas sí les
      // aplica el aviso de "alcanza hasta N líneas".
      sigueLinea: eq.ancho === undefined,
      largoAutomatico: auto !== null,
      rotacion: 0,
      espejo: false,
    });
  }

  function actualizar(id: string, cambios: Partial<Modulo>) {
    setModulos((prev) => prev.map((m) => (m.id === id ? { ...m, ...cambios } : m)));
  }

  /**
   * Guarda lo tecleado y, si es un número que sirve, cambia la medida y vuelve
   * a dibujar la figura con la proporción nueva. Si el campo queda vacío se
   * respeta: se deja escribir, y la medida anterior aguanta mientras tanto.
   */
  function tecleaMedida(m: Modulo, cual: "largo" | "ancho", texto: string) {
    setMedidas((prev) => ({ ...prev, [`${m.id}-${cual}`]: texto }));
    const valor = Number(texto);
    if (!(valor > 0)) return;
    const largo = cual === "largo" ? valor : m.largo;
    const ancho = cual === "ancho" ? valor : m.ancho;
    const svg = figuraDe(m, largo, ancho);
    actualizar(m.id, { largo, ancho, imagen: svg ?? m.imagen });
  }

  /**
   * La figura del módulo a la medida nueva. Si está girada, se dibuja en su
   * orientación original: el dibujo se gira aparte, encima de la huella, y si
   * no se hace así los cepillos y rodillos salen atravesados.
   */
  function figuraDe(m: Modulo, largo: number, ancho: number): string | undefined {
    const deLado = m.rotacion === 90 || m.rotacion === 270;
    const svg = svgDe(m.dibujo, deLado ? ancho : largo, deLado ? largo : ancho, m.variante);
    return svg ? comoDataUri(svg) : undefined;
  }

  /** Lo que se muestra en el campo: lo tecleado, o la medida que trae. */
  /**
   * El LARGO arranca vacío: hay cepilladoras de muchos largos distintos y no
   * se vale inventarle una medida a algo que después se va a cotizar. El
   * ancho sí trae el de la línea, porque ese lo manda la clasificadora.
   */
  function textoMedida(m: Modulo, cual: "largo" | "ancho"): string {
    const tecleado = medidas[`${m.id}-${cual}`];
    if (tecleado !== undefined) return tecleado;
    if (cual === "largo") return "";
    return String(+m[cual].toFixed(2));
  }

  /** Cuántas piezas son, cuando lo que importa es la cantidad (básculas). */
  function textoCantidad(m: Modulo): string {
    return medidas[`${m.id}-cantidad`] ?? (m.cantidad ? String(m.cantidad) : "");
  }

  function tecleaCantidad(m: Modulo, texto: string) {
    setMedidas((prev) => ({ ...prev, [`${m.id}-cantidad`]: texto }));
    const valor = Number(texto);
    if (valor > 0) actualizar(m.id, { cantidad: Math.round(valor) });
  }

  /** ¿A esta pieza todavía no le han puesto el largo real? */
  function faltaMedirla(m: Modulo): boolean {
    if (m.tipo.startsWith("Clasificadora")) return false; // el suyo se calcula
    if (m.tipo.startsWith("Básculas")) return false; // de ésas se pide cuántas
    if (m.largoAutomatico) return false; // el suyo sale de las salidas
    const t = medidas[`${m.id}-largo`];
    return t === undefined || !(Number(t) > 0);
  }

  function girar(m: Modulo) {
    const siguiente = (((m.rotacion + 90) % 360) as 0 | 90 | 180 | 270);
    // La huella gira con el dibujo: lo que era largo pasa a ser ancho.
    actualizar(m.id, { rotacion: siguiente, largo: m.ancho, ancho: m.largo });
    // Lo tecleado se limpia: si no, los campos seguirían mostrando lo de antes.
    setMedidas((prev) => {
      const copia = { ...prev };
      delete copia[`${m.id}-largo`];
      delete copia[`${m.id}-ancho`];
      return copia;
    });
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
    // Con "mover todo junto" se arrastra el grupo completo, sin desalinearlo:
    // es lo que se necesita para correr la línea ya formada hacia una pared.
    if (moverTodo) {
      const dx = redondea(p.x - a.dx) - m.x;
      const dy = redondea(p.y - a.dy) - m.y;
      if (dx === 0 && dy === 0) return;
      setModulos((prev) => prev.map((o) => ({ ...o, x: +(o.x + dx).toFixed(2), y: +(o.y + dy).toFixed(2) })));
      return;
    }
    const pegado = pegarAOtros(m, modulos, espacio, redondea(p.x - a.dx), redondea(p.y - a.dy));
    // Ya lo está acomodando él: de aquí en adelante nada se mueve solo.
    if (pegado.x !== m.x || pegado.y !== m.y) setAcomodadoAMano(true);
    actualizar(a.id, pegado);
  }

  function alSoltarDedo() {
    arrastre.current = null;
  }

  const activo = modulos.find((m) => m.id === seleccionado) ?? null;
  const mensaje = resumenLevantamiento(espacio, modulos, cabe, notas, whatsapp, fruta);

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
              inputMode="decimal"
              step={0.5}
              value={largoTxt}
              onChange={(e) => setLargoTxt(e.target.value)}
              className="w-28 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-base text-ink outline-none focus:border-marca"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-mute">
            Ancho (metros)
            <input
              type="number"
              inputMode="decimal"
              step={0.5}
              value={anchoTxt}
              onChange={(e) => setAnchoTxt(e.target.value)}
              className="w-28 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-base text-ink outline-none focus:border-marca"
            />
          </label>
          <p className="pb-2.5 text-sm text-ink-mute">{areaEspacio.toFixed(1)} m² de piso</p>
        </div>
      </div>

      {/* 2. La fruta: de ahí se desprende todo lo demás */}
      <div className="card flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-ink">2. ¿Qué fruta trabaja?</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {FRUTAS_LINEA.map((f) => {
            const elegida = fruta === f.nombre;
            return (
              <button
                key={f.nombre}
                type="button"
                onClick={() => escogerFruta(elegida ? null : f)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 text-xs font-semibold transition"
                style={
                  elegida
                    ? { background: "var(--marca)", color: "#fff", borderColor: "var(--marca)" }
                    : { borderColor: "var(--line-strong)", color: "var(--ink-soft)" }
                }
              >
                {f.foto ? (
                  // Círculo blanco: las fotos traen fondo blanco CUADRADO, y en
                  // un recuadro las esquinas se cortaban y la fruta se veía
                  // mordisqueada. En círculo, con aire alrededor, queda limpia.
                  <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-white p-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.foto} alt={f.nombre} className="h-full w-full" style={{ objectFit: "contain" }} />
                  </span>
                ) : (
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-bg-2 text-2xl">🍃</span>
                )}
                {f.nombre}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Ve alrededor y ve marcando todo lo que hay, sin medir todavía */}
      <div className="card flex flex-col gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-ink">3. Toca todo lo que veas en el empaque</p>
          <p className="mt-1 text-xs text-ink-mute">
            No te detengas a medir: aparece en el dibujo con su medida típica y más abajo te preguntamos de cuánto es
            cada uno. Toca el mismo botón otra vez si hay dos iguales.
          </p>
        </div>

        {/* Primero se marca todo lo que YA HAY; después lo que se le pone. */}
        <div className="flex flex-wrap gap-2">
          {(["cliente", "nueva"] as Origen[]).map((o) => {
            const info = ORIGENES.find((x) => x.valor === o)!;
            const puesto = poniendo === o;
            return (
              <button
                key={o}
                type="button"
                onClick={() => setPoniendo(o)}
                className="flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition"
                style={
                  puesto
                    ? { background: info.color, color: "#fff", borderColor: info.color }
                    : { borderColor: "var(--line-strong)", color: "var(--ink-soft)" }
                }
              >
                {o === "cliente" ? "Lo que ya hay" : "Lo que le ponemos"}
              </button>
            );
          })}
        </div>

        {paleta(GRUPOS_DEL_RECORRIDO, poniendo)}

        {/* También aquí, para no tener que bajar al dibujo cuando el dedo se
            resbaló y puso una de más. */}
        {modulos.length > 0 && (
          <button type="button" onClick={deshacer} className="btn-ghost self-start !py-2 !text-sm">
            <Icon name="lucide:undo-2" size={15} /> Quitar la última que puse
          </button>
        )}
      </div>

      {/* El dibujo: aquí van cayendo y aquí se acomodan */}
      <div ref={cardDibujoRef} className="card flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink">Acomódalos arrastrando con el dedo</p>
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
          {/* Los puntos cardinales, para saber cómo está parado el empaque. */}
          {(
            [
              { l: "N", pos: "left-1/2 top-1 -translate-x-1/2" },
              { l: "S", pos: "bottom-1 left-1/2 -translate-x-1/2" },
              { l: "O", pos: "left-1 top-1/2 -translate-y-1/2" },
              { l: "E", pos: "right-1 top-1/2 -translate-y-1/2" },
            ] as const
          ).map((c) => (
            <span
              key={c.l}
              className={`pointer-events-none absolute ${c.pos} z-10 text-[11px] font-black text-ink-mute`}
            >
              {c.l}
            </span>
          ))}

          {modulos.length === 0 && (
            <p className="absolute inset-0 grid place-items-center px-4 text-center text-sm text-ink-mute">
              Toca arriba lo que veas en el empaque y aparecerá aquí, a escala.
            </p>
          )}

          {/* Las distancias a las cuatro paredes del que está elegido: es lo
              que decide qué máquina cabe entre una cosa y otra. */}
          {activo && <Separaciones m={activo} espacio={espacio} />}

          {modulos.map((m) => {
            const malo = conProblema.has(m.id);
            const elegido = m.id === seleccionado;
            const color = malo ? "#c92a2a" : colorDeOrigen(m.origen);
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
                  border: m.imagen ? `4px solid ${color}` : "none",
                  outline: elegido ? "4px solid #f7c530" : "none",
                  outlineOffset: "-1px",
                  boxShadow: elegido ? "0 0 0 3px rgba(247,197,48,0.35)" : "0 1px 4px rgba(0,0,0,0.35)",
                  touchAction: "none",
                }}
                title={`${nombreDe(m)} — ${m.largo.toFixed(2)} x ${m.ancho.toFixed(2)} m`}
              >
                <DibujoModulo m={m} />
              </div>
            );
          })}

          {/* Los números van en su PROPIA capa, encima de todo. Dentro de la
              pieza no servían: una banda de 1.20 m en un empaque de 20 m mide
              nueve píxeles de alto y el número salía cortado. Aquí siempre se
              ven del mismo tamaño, sin importar qué tan chica sea la pieza.
              Los nombres se quitaron a propósito: estorbaban al número. */}
          {modulos.map((m) => {
            const malo = conProblema.has(m.id);
            const elegido = m.id === seleccionado;
            const color = malo ? "#c92a2a" : colorDeOrigen(m.origen);
            return (
              <span
                key={`num-${m.id}`}
                onPointerDown={(e) => alBajarDedo(e, m)}
                // El número ES la manija: mide 40 px, o sea como dos
                // centímetros de dedo. La pieza puede ser una rayita de nueve
                // píxeles de alto y aun así se agarra y se arrastra de aquí.
                className="absolute z-30 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-grab select-none place-items-center rounded-full text-[15px] font-black leading-none active:cursor-grabbing"
                style={{
                  left: pctX(m.x + m.largo / 2),
                  top: pctY(m.y + m.ancho / 2),
                  background: "#fff",
                  color,
                  boxShadow: elegido
                    ? `0 0 0 3px #f7c530, 0 2px 6px rgba(0,0,0,0.5)`
                    : `0 0 0 2px ${color}, 0 1px 4px rgba(0,0,0,0.45)`,
                  touchAction: "none",
                }}
              >
                {numeros[m.id]}
              </span>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex-1 text-xs text-ink-mute">
            A escala: {espacio.largo.toFixed(2)} m de largo x {espacio.ancho.toFixed(2)} m de ancho, visto desde arriba.
            En <span style={{ color: "#c92a2a" }}>rojo</span> lo que se encima o se sale.
          </p>
          {modulos.length > 0 && (
            <button type="button" onClick={deshacer} className="btn-ghost !py-2 !text-sm">
              <Icon name="lucide:undo-2" size={15} /> Quitar la última
            </button>
          )}
          {/* Correr la línea ya formada, toda junta, sin desalinearla. */}
          {modulos.length > 1 && (
            <button
              type="button"
              onClick={() => setMoverTodo((v) => !v)}
              className="btn-ghost !py-2 !text-sm"
              style={moverTodo ? { background: "var(--marca)", color: "#fff", borderColor: "var(--marca)" } : undefined}
            >
              <Icon name="lucide:move" size={15} /> {moverTodo ? "Moviendo todo junto" : "Mover todo junto"}
            </button>
          )}
          {/* Para volver a formarlos si ya los movió y se le revolvieron. */}
          {modulos.length > 1 && (
            <button type="button" onClick={ordenarPorNumero} className="btn-ghost !py-2 !text-sm">
              <Icon name="lucide:list-ordered" size={15} /> Formarlos 1, 2, 3…
            </button>
          )}
        </div>
      </div>

      {/* 4. La clasificadora que se le propone. Va HASTA AQUÍ, no al principio:
          el vendedor recorre el empaque midiendo lo que el cliente ya tiene, y
          hasta que vio todo decide qué clasificadora le conviene proponer. */}
      <div className="card flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-ink">4. Ahora sí, ¿qué clasificadora le proponemos?</p>
          <p className="text-sm text-ink-mute">
            Queda de {medidaClasificadora(clasifFinal).largo.toFixed(2)} x {medidaClasificadora(clasifFinal).ancho.toFixed(2)} m
          </p>
        </div>

        {/* Copita: de un toque, sin teclear medidas. Clip y charola van en
            bloques APARTE — revueltos en una sola tira no se distinguían. */}
        {familiasDeCopita.map((familia) => (
          <div key={familia} className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">
              {familia === "clip" ? "Clip" : "Charola"}
            </p>
            <div className="flex flex-wrap gap-2">
              {COPITAS.filter((c) => c.tipo === familia).map((c) => {
                const elegida = clasif.tipoCopita === c.tipo && clasif.medidaCopita === c.medida;
                return (
                  <button
                    key={c.etiqueta}
                    type="button"
                    onClick={() =>
                      setClasif((s) => ({
                        ...s,
                        tipoCopita: c.tipo,
                        medidaCopita: c.medida,
                        // Se ajusta el paso al primero válido de esa copita.
                        pasoSalidas: c.salidas.includes(s.pasoSalidas) ? s.pasoSalidas : c.salidas[0],
                      }))
                    }
                    className="rounded-full border px-3.5 py-2 text-sm font-medium transition"
                    style={
                      elegida
                        ? { background: "var(--marca)", color: "#fff", borderColor: "var(--marca)" }
                        : { borderColor: "var(--line-strong)", color: "var(--ink-soft)" }
                    }
                  >
                    {/* La familia ya va en el título, aquí basta la medida. */}
                    {c.medida}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

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

        {/* Cuántas salidas — va ANTES del lado: primero se dice cuántas y
            luego para dónde caen. Son las mismas aunque caigan a los dos
            lados: en la salida 1 sale chico de los dos, en la 2 mediano… */}
        <label className="flex flex-col gap-1 text-xs text-ink-mute">
          ¿Cuántas salidas?
          <input
            type="number"
            inputMode="numeric"
            value={salidasTxt}
            onChange={(e) => setSalidasTxt(e.target.value)}
            className="w-24 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-base text-ink outline-none focus:border-marca"
          />
        </label>

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

        {/* Salidas a cada: SOLO las que existen para esa copita */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">Salidas a cada</p>
          <div className="flex flex-wrap gap-2">
            {(COPITAS.find((c) => c.tipo === clasif.tipoCopita && c.medida === clasif.medidaCopita)?.salidas ?? []).map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setClasif((c) => ({ ...c, pasoSalidas: s }))}
                  className="rounded-full border px-3.5 py-2 text-sm font-medium transition"
                  style={
                    clasif.pasoSalidas === s
                      ? { background: "var(--marca)", color: "#fff", borderColor: "var(--marca)" }
                      : { borderColor: "var(--line-strong)", color: "var(--ink-soft)" }
                  }
                >
                  {enPulgadas(s)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Qué tan ancho es el cuerpo */}
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-xs text-ink-mute">
            Ancho del cuerpo (m)
            <input
              type="number"
              inputMode="decimal"
              step={0.1}
              value={anchoClasifTxt}
              onChange={(e) => setAnchoClasifTxt(e.target.value)}
              className="w-24 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-base text-ink outline-none focus:border-marca"
            />
          </label>
        </div>
        <p className="rounded-xl p-2.5 text-xs" style={{ background: "color-mix(in srgb, #f7c530 14%, transparent)" }}>
          <b>Por confirmar:</b> la clasificadora <b>no</b> mide lo mismo que las cepilladoras y mesas. Los 0.60 / 0.90 /
          1.20 / 1.80 m son el ancho de esos módulos. Falta la medida real del cuerpo de la clasificadora por número de
          líneas y por copita — pídesela a CIU, que es quien las fabrica. Mientras, tecléala aquí.
        </p>

        {/* Vista previa: se ve antes de meterla al dibujo */}
        <div className="overflow-hidden rounded-xl border border-line bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={comoDataUri(svgClasificadora(clasifFinal))}
            alt={nombreClasificadora(clasifFinal)}
            className="mx-auto block w-full"
            style={{ maxHeight: 260, objectFit: "contain" }}
          />
        </div>
        <p className="text-center text-xs text-ink-mute">{nombreClasificadora(clasifFinal)}</p>

        <button type="button" onClick={agregarClasificadora} className="btn-marca self-start">
          <Icon name="lucide:plus" size={18} />
          {clasificadorasPuestas.length === 0 ? "Ponerla en el empaque" : "Poner otra clasificadora"}
        </button>

        {/* Sin esto se picaba el botón y no se veía que hubiera pasado nada:
            el dibujo queda muy abajo, fuera de la pantalla del teléfono. */}
        {clasificadorasPuestas.length > 0 && (
          <p
            className="rounded-xl p-3 text-sm"
            style={{ background: "color-mix(in srgb, #2f9e44 16%, transparent)", color: "var(--ink)" }}
          >
            <Icon name="lucide:check" size={15} /> Ya quedó en el empaque como la{" "}
            <b>{clasificadorasPuestas.map((n) => `#${n}`).join(" y la ")}</b>. Arriba la ves en el dibujo.
          </p>
        )}

        {/* Lo que va junto con la clasificadora. Cuántas tolvas, bancos y
            básculas hacen falta depende de las salidas, por eso se arma aquí
            y no allá arriba con lo que se ve al recorrer el empaque. */}
        <div className="mt-2 flex flex-col gap-3 border-t border-line pt-4">
          <div>
            <p className="text-sm font-semibold text-ink">Lo que va con la clasificadora</p>
            <p className="mt-1 text-xs text-ink-mute">
              Al meter una clasificadora se quita la banda que tenía, pero sus <b>bancos</b> y sus{" "}
              <b>descansadores de caja llena</b> se reaprovechan. Marca cuáles ya tiene para que no se le coticen.
            </p>
          </div>
          {botonesOrigen(poniendoLinea, setPoniendoLinea)}
          {paleta([GRUPO_LINEA], poniendoLinea)}
          {modulos.length > 0 && (
            <button type="button" onClick={deshacer} className="btn-ghost self-start !py-2 !text-sm">
              <Icon name="lucide:undo-2" size={15} /> Quitar la última que puse
            </button>
          )}
        </div>
      </div>

      {/* 5. Ya con todo puesto, ahora sí las medidas de cada uno */}
      {modulos.length > 0 && (
        <div className="card flex flex-col gap-4 p-5">
          <div>
            <p className="text-sm font-semibold text-ink">5. Ahora sí, ¿de cuánto es cada uno?</p>
            <p className="mt-1 text-xs text-ink-mute">
              Del ancho solo nos interesa el <b>ancho útil</b>: por donde pasa la fruta. Hay máquinas muy robustas cuyo
              ancho total no tiene nada que ver con el paso de la fruta.
            </p>
          </div>

          {/* Separadas por etapa, en el mismo orden del recorrido: así se ve
              de un golpe qué falta medir de cada parte del empaque. */}
          {etapasConPiezas.map((etapa) => (
            <div key={etapa} className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">{etapa}</p>
              <div className="flex flex-col divide-y divide-line">
                {modulos
                  .filter((m) => (m.etapa ?? "La clasificadora") === etapa)
                  .map((m) => {
                    const elegido = m.id === seleccionado;
                    const esClasificadora = m.tipo.startsWith("Clasificadora");
                    const porCantidad = m.tipo.startsWith("Básculas");
                    return (
                      <div
                        key={m.id}
                        onFocus={() => setSeleccionado(m.id)}
                        className="flex flex-col gap-1.5 rounded-lg px-1.5 py-2.5"
                        // Se resalta el mismo que está elegido en el dibujo,
                        // para no perderse entre quince renglones.
                        style={elegido ? { background: "color-mix(in srgb, #f7c530 14%, transparent)" } : undefined}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black"
                            style={{ background: colorDeOrigen(m.origen), color: "#fff" }}
                          >
                            {numeros[m.id]}
                          </span>
                          <span className="flex-1 text-sm text-ink">{m.tipo}</span>
                          <button
                            type="button"
                            onClick={() => borrar(m.id)}
                            className="rounded-lg p-2 text-ink-mute hover:text-ink"
                            aria-label={`Quitar ${nombreDe(m)} del dibujo`}
                            title="Quitarla del dibujo"
                          >
                            <Icon name="lucide:trash-2" size={16} />
                          </button>
                        </div>

                        {/* La clasificadora NO se pregunta: su medida sale
                            sola de la copita, las líneas y las salidas. */}
                        {esClasificadora ? (
                          <p className="pl-8 text-xs text-ink-mute">
                            Mide {m.largo.toFixed(2)} × {m.ancho.toFixed(2)} m. Sale sola de lo que escogiste arriba.
                          </p>
                        ) : porCantidad ? (
                          <label className="flex items-center gap-1.5 pl-8 text-xs text-ink-mute">
                            ¿Cuántas?
                            <input
                              type="number"
                              inputMode="numeric"
                              value={textoCantidad(m)}
                              onChange={(e) => tecleaCantidad(m, e.target.value)}
                              className="w-20 rounded-lg border border-line-strong bg-bg-2 p-2 text-sm text-ink outline-none focus:border-marca"
                              aria-label={`Cuántas básculas, la ${numeros[m.id]}`}
                            />
                          </label>
                        ) : (
                          // Largo y ancho van EN EL MISMO RENGLÓN: separados,
                          // en el teléfono el largo se iba muy arriba.
                          <div className="flex flex-wrap items-center gap-2 pl-8">
                            {m.largoAutomatico ? (
                              // El largo ya salió de las salidas: no se teclea.
                              <span className="text-xs text-ink-mute">
                                Largo <b className="text-ink">{m.largo.toFixed(2)} m</b> (de las salidas)
                              </span>
                            ) : (
                              <label className="flex items-center gap-1.5 text-xs text-ink-mute">
                                Largo
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  step={0.5}
                                  value={textoMedida(m, "largo")}
                                  onChange={(e) => tecleaMedida(m, "largo", e.target.value)}
                                  className="w-20 rounded-lg border border-line-strong bg-bg-2 p-2 text-sm text-ink outline-none focus:border-marca"
                                  aria-label={`Largo de ${nombreDe(m)}, en metros`}
                                />
                              </label>
                            )}
                            <label className="flex items-center gap-1.5 text-xs text-ink-mute">
                              Ancho útil
                              <input
                                type="number"
                                inputMode="decimal"
                                step={0.1}
                                value={textoMedida(m, "ancho")}
                                onChange={(e) => tecleaMedida(m, "ancho", e.target.value)}
                                className="w-20 rounded-lg border border-line-strong bg-bg-2 p-2 text-sm text-ink outline-none focus:border-marca"
                                aria-label={`Ancho útil de ${nombreDe(m)}, en metros`}
                              />
                            </label>
                          </div>
                        )}

                        {/* El aviso de la venta, SOLO para lo que va en fila
                            con la clasificadora. Una banda de segunda calidad
                            puede ser de 20 cm y está perfecta: ahí no hay nada
                            que avisar. */}
                        {(() => {
                          if (esClasificadora || porCantidad) return null;
                          if (faltaMedirla(m)) {
                            return (
                              <p className="pl-8 text-xs" style={{ color: "#f7c530" }}>
                                Falta ponerle el largo.
                              </p>
                            );
                          }
                          if (!m.sigueLinea) return null;
                          const alcanza = lineasQueAlcanza(m.ancho);
                          if (alcanza === null) return null;
                          if (alcanza >= clasif.lineas) {
                            return (
                              <p className="pl-8 text-xs" style={{ color: "#2f9e44" }}>
                                Alcanza hasta {alcanza} líneas
                                {alcanza > clasif.lineas && " — le sobra, no hay que cambiarla"}.
                              </p>
                            );
                          }
                          return (
                            <p className="pl-8 text-xs" style={{ color: "#c92a2a" }}>
                              Se queda corta: alcanza para {alcanza} líneas y se está armando de {clasif.lineas}.
                            </p>
                          );
                        })()}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}

          <p className="text-xs text-ink-mute">
            Las medidas van en metros. El bote de basura <b>quita esa pieza del dibujo</b>. Ya que las tengas, sube y
            acomódalas.
          </p>
        </div>
      )}

      {/* Ajustes del módulo elegido */}
      {activo && (
        <div className="card flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">{nombreDe(activo)}</p>
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
            <div className="grid place-items-center overflow-hidden rounded-xl border border-line bg-white p-2">
              {/* Se muestra CONTENIDO, no estirado: si no, una pieza muy
                  angosta se hacía larguísima y tapaba toda la pantalla. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activo.imagen}
                alt={nombreDe(activo)}
                style={{
                  maxHeight: 180,
                  maxWidth: "100%",
                  objectFit: "contain",
                  transform: `rotate(${activo.rotacion}deg) scaleX(${activo.espejo ? -1 : 1})`,
                }}
              />
            </div>
          )}

          {/* Las medidas se teclean arriba, en la lista: aquí solo se acomoda.
              Así el mismo campo no aparece en dos lugares. */}
          <p className="text-sm text-ink-soft">
            Mide {activo.largo.toFixed(2)} m de largo x {activo.ancho.toFixed(2)} m de ancho útil.
          </p>

          <button type="button" onClick={() => girar(activo)} className="btn-ghost self-start !py-2 !text-sm">
            <Icon name="lucide:rotate-cw" size={15} /> Girar 90° ({activo.rotacion}°)
          </button>

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
          <p className="text-sm text-ink-mute">Toca lo que veas en el empaque para saber si cabe.</p>
        ) : (
          <>
            <p className="font-display text-2xl font-semibold">{cabe ? "Sí cabe 👍" : "Todavía no cabe"}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {cabe
                ? `Las ${maquinas.length} máquinas entran en el espacio, sin encimarse.`
                : "Hay módulos en rojo: se enciman o se salen del espacio."}
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
        <p className="text-sm font-semibold text-ink">6. Mándalo para cotizar</p>
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
        {/* Aviso antes de mandar: una pieza sin largo no se puede cotizar. */}
        {(() => {
          const sinMedir = modulos.filter(faltaMedirla);
          if (sinMedir.length === 0) return null;
          return (
            <p
              className="rounded-xl p-3 text-sm"
              style={{ background: "color-mix(in srgb, #f7c530 16%, transparent)", color: "var(--ink)" }}
            >
              Falta ponerle el largo a {sinMedir.length}{" "}
              {sinMedir.length === 1 ? "pieza" : "piezas"}: {sinMedir.map(nombreDe).join(", ")}.
            </p>
          );
        })()}

        <a
          href={linkWhatsApp(CONFIG.marca.whatsappPrincipal, mensaje)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-marca btn-wa"
        >
          <Icon name="logos:whatsapp-icon" size={20} /> Mandar mi levantamiento
        </a>
      </div>

      {/* 7. La hoja limpia para el cliente. Esta pantalla es la herramienta
          del vendedor; el layout es lo que decide la venta, y va aparte. */}
      {modulos.length > 0 && (
        <div className="card flex flex-col gap-3 p-5">
          <p className="text-sm font-semibold text-ink">7. Enséñaselo al cliente</p>
          <p className="text-xs text-ink-mute">
            La hoja sale limpia y a escala, con las cotas de cada máquina a su pared, la ficha de la clasificadora y la
            lista de todo. Se guarda en PDF para mandarla.
          </p>
          <button type="button" onClick={() => setVerLayout(true)} className="btn-marca self-start">
            <Icon name="lucide:file-text" size={18} /> Ver el layout para el cliente
          </button>
        </div>
      )}

      {verLayout && (
        <LayoutFinal
          espacio={espacio}
          modulos={modulos}
          numeros={numeros}
          clasif={clasifFinal}
          fruta={fruta}
          cabe={cabe}
          sinMedir={modulos.filter(faltaMedirla).map(nombreDe)}
          onCerrar={() => setVerLayout(false)}
        />
      )}
    </div>
  );
}
