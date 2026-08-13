/**
 * Dibujos de máquinas generados a la medida, vistos desde arriba.
 *
 * No son recortes de los planos: se dibujan a partir de lo que pide el
 * cliente (paso de copita, número de líneas, salidas, de qué lado). Así los
 * anchos coinciden entre máquinas que van en línea, cada pieza trae su
 * nombre, y no se cuelan monitos, frutas ni números de referencia del plano.
 *
 * La forma está sacada de los planos reales de ELFCO (los layouts en PDF).
 */

export type TipoCopita = "charola" | "clip" | "rodillo";
export type Lado = "izquierda" | "derecha" | "ambos";

export interface ClasificadoraParams {
  lineas: number;
  /** Salidas por lado. */
  salidas: number;
  /** Separación de centro a centro entre salidas, en pulgadas. */
  pasoSalidas: number;
  lado: Lado;
  tipoCopita: TipoCopita;
  /** Medida de la copita, para la etiqueta (ej. "3¾"" o "6""). */
  medidaCopita: string;
  conPeso: boolean;
}

const PULGADA = 0.0254;

/** Ancho que ocupa cada línea de copitas, incluyendo su estructura. */
const ANCHO_POR_LINEA = 0.72;
/** Lo que se lleva la entrada de fruta y la descarga al final. */
const ENTRADA = 2.2;
const DESCARGA = 2.2;

/** Huella real de la clasificadora, en metros. */
export function medidaClasificadora(p: ClasificadoraParams): { largo: number; ancho: number } {
  const largo = +(p.salidas * p.pasoSalidas * PULGADA + ENTRADA + DESCARGA).toFixed(2);
  const ancho = +(p.lineas * ANCHO_POR_LINEA).toFixed(2);
  return { largo, ancho };
}

export function nombreClasificadora(p: ClasificadoraParams): string {
  const copita =
    p.tipoCopita === "charola" ? "Charola" : p.tipoCopita === "clip" ? "Clip" : "Rodillo";
  const salidas = p.lado === "ambos" ? `${p.salidas * 2} salidas` : `${p.salidas} salidas`;
  // El lado va en el nombre: es lo primero que se pregunta al cotizar.
  const lado =
    p.lado === "ambos" ? "a los dos lados" : p.lado === "izquierda" ? "al lado izquierdo" : "al lado derecho";
  return `Clasificadora ${copita} ${p.medidaCopita} · ${p.lineas} líneas x ${salidas} ${lado}${p.conPeso ? " · con peso" : ""}`;
}

/**
 * SVG de la clasificadora vista desde arriba. El viewBox va en centímetros
 * para no pelearse con decimales; el contenedor lo estira a la huella real.
 */
export function svgClasificadora(p: ClasificadoraParams): string {
  const { largo, ancho } = medidaClasificadora(p);
  const W = Math.round(largo * 100);
  const H = Math.round(ancho * 100);
  const pasoCm = p.pasoSalidas * PULGADA * 100;
  const entradaCm = ENTRADA * 100;

  const trazo = "#1f6f5c";
  const trazoFino = "#7cc0ad";
  const partes: string[] = [];

  // Cuerpo de la máquina
  partes.push(`<rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="#fff" stroke="${trazo}" stroke-width="4"/>`);

  // Las líneas de copitas, a lo largo
  const altoLinea = (H - 8) / p.lineas;
  for (let i = 0; i < p.lineas; i++) {
    const y = 4 + i * altoLinea;
    partes.push(
      `<rect x="${entradaCm * 0.5}" y="${y + altoLinea * 0.18}" width="${W - entradaCm}" height="${altoLinea * 0.64}" fill="none" stroke="${trazoFino}" stroke-width="2"/>`
    );
    // Las copitas: cambian de figura según el tipo
    const paso = 34;
    for (let x = entradaCm * 0.5 + paso / 2; x < W - entradaCm * 0.4; x += paso) {
      const cy = y + altoLinea / 2;
      if (p.tipoCopita === "rodillo") {
        partes.push(`<circle cx="${x}" cy="${cy}" r="${altoLinea * 0.2}" fill="none" stroke="${trazoFino}" stroke-width="2"/>`);
      } else if (p.tipoCopita === "clip") {
        partes.push(
          `<path d="M ${x - altoLinea * 0.2} ${cy - altoLinea * 0.18} L ${x - altoLinea * 0.2} ${cy + altoLinea * 0.18} M ${x + altoLinea * 0.2} ${cy - altoLinea * 0.18} L ${x + altoLinea * 0.2} ${cy + altoLinea * 0.18}" stroke="${trazoFino}" stroke-width="2" fill="none"/>`
        );
      } else {
        partes.push(
          `<rect x="${x - altoLinea * 0.22}" y="${cy - altoLinea * 0.22}" width="${altoLinea * 0.44}" height="${altoLinea * 0.44}" fill="none" stroke="${trazoFino}" stroke-width="2"/>`
        );
      }
    }
  }

  // Las salidas, del lado que se pidió
  const ladosDibujar: ("arriba" | "abajo")[] =
    p.lado === "ambos" ? ["arriba", "abajo"] : p.lado === "izquierda" ? ["arriba"] : ["abajo"];
  const largoSalida = Math.min(60, H * 0.22);

  for (const donde of ladosDibujar) {
    for (let i = 0; i < p.salidas; i++) {
      const x = entradaCm + i * pasoCm;
      const w = pasoCm * 0.82;
      if (donde === "arriba") {
        partes.push(
          `<rect x="${x}" y="${-largoSalida + 4}" width="${w}" height="${largoSalida}" fill="#fff" stroke="${trazo}" stroke-width="3"/>`
        );
      } else {
        partes.push(
          `<rect x="${x}" y="${H - 4}" width="${w}" height="${largoSalida}" fill="#fff" stroke="${trazo}" stroke-width="3"/>`
        );
      }
    }
  }

  // El tablero de control, al final
  partes.push(
    `<rect x="${W - entradaCm * 0.75}" y="${H * 0.3}" width="${entradaCm * 0.45}" height="${H * 0.4}" fill="none" stroke="${trazo}" stroke-width="3"/>`
  );

  const margen = largoSalida + 6;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-2} ${-margen} ${W + 4} ${H + margen * 2}" preserveAspectRatio="none">${partes.join("")}</svg>`;
}

/* ---------- Módulos que van en línea ---------- */

/**
 * Anchos típicos, en metros. Se comparten entre cepilladora, mesa de
 * selección, tolva y bandas: por eso las máquinas de una misma línea quedan
 * alineadas en vez de cada una con su ancho.
 */
export const ANCHOS_EN_LINEA = [0.6, 0.9, 1.2, 1.8];

export type TipoMesa = "guia-central" | "guias-laterales" | "banda-superior";

export const TIPOS_MESA: { valor: TipoMesa; etiqueta: string }[] = [
  { valor: "guia-central", etiqueta: "Guía central" },
  { valor: "guias-laterales", etiqueta: "Guías laterales" },
  { valor: "banda-superior", etiqueta: "Banda superior" },
];

const TRAZO = "#1f6f5c";
const FINO = "#7cc0ad";

function envoltura(W: number, H: number, cuerpo: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="#fff" stroke="${TRAZO}" stroke-width="4"/>${cuerpo}</svg>`;
}

/** Cepilladora vista desde arriba: sus cepillos cruzados a lo ancho. */
export function svgCepilladora(largo: number, ancho: number, cepillos = 10): string {
  const W = Math.round(largo * 100);
  const H = Math.round(ancho * 100);
  const partes: string[] = [];
  const paso = (W - 24) / cepillos;
  for (let i = 0; i < cepillos; i++) {
    const x = 12 + i * paso + paso / 2;
    partes.push(`<line x1="${x}" y1="10" x2="${x}" y2="${H - 10}" stroke="${FINO}" stroke-width="6"/>`);
  }
  // Los bastidores de los lados
  partes.push(`<line x1="8" y1="10" x2="${W - 8}" y2="10" stroke="${TRAZO}" stroke-width="3"/>`);
  partes.push(`<line x1="8" y1="${H - 10}" x2="${W - 8}" y2="${H - 10}" stroke="${TRAZO}" stroke-width="3"/>`);
  return envoltura(W, H, partes.join(""));
}

/** Mesa de selección manual, con la guía que se haya pedido. */
export function svgMesaSeleccion(largo: number, ancho: number, tipo: TipoMesa): string {
  const W = Math.round(largo * 100);
  const H = Math.round(ancho * 100);
  const partes: string[] = [];

  // La banda que corre a lo largo
  partes.push(`<rect x="10" y="${H * 0.12}" width="${W - 20}" height="${H * 0.76}" fill="none" stroke="${FINO}" stroke-width="3"/>`);

  if (tipo === "guia-central") {
    partes.push(`<line x1="14" y1="${H / 2}" x2="${W - 14}" y2="${H / 2}" stroke="${TRAZO}" stroke-width="5"/>`);
  } else if (tipo === "guias-laterales") {
    partes.push(`<line x1="14" y1="${H * 0.28}" x2="${W - 14}" y2="${H * 0.28}" stroke="${TRAZO}" stroke-width="5"/>`);
    partes.push(`<line x1="14" y1="${H * 0.72}" x2="${W - 14}" y2="${H * 0.72}" stroke="${TRAZO}" stroke-width="5"/>`);
  } else {
    // Banda superior: se dibuja encimada, más angosta y punteada
    partes.push(
      `<rect x="${W * 0.1}" y="${H * 0.3}" width="${W * 0.8}" height="${H * 0.4}" fill="none" stroke="${TRAZO}" stroke-width="4" stroke-dasharray="14 8"/>`
    );
  }

  // Los travesaños de la banda
  for (let x = 24; x < W - 24; x += 26) {
    partes.push(`<line x1="${x}" y1="${H * 0.14}" x2="${x}" y2="${H * 0.86}" stroke="${FINO}" stroke-width="1.5"/>`);
  }
  return envoltura(W, H, partes.join(""));
}

/** Tolva de recepción: el cajón y su boca de descarga. */
export function svgTolva(largo: number, ancho: number, salidas = 6): string {
  const W = Math.round(largo * 100);
  const H = Math.round(ancho * 100);
  const partes: string[] = [];
  // Las paredes inclinadas que embudan la fruta
  partes.push(`<line x1="12" y1="12" x2="${W * 0.14}" y2="${H / 2}" stroke="${FINO}" stroke-width="3"/>`);
  partes.push(`<line x1="12" y1="${H - 12}" x2="${W * 0.14}" y2="${H / 2}" stroke="${FINO}" stroke-width="3"/>`);
  // Las bocas de salida repartidas a lo largo
  const paso = (W - 40) / salidas;
  for (let i = 0; i < salidas; i++) {
    const x = 20 + i * paso;
    partes.push(
      `<rect x="${x}" y="${H * 0.32}" width="${paso * 0.7}" height="${H * 0.36}" fill="none" stroke="${TRAZO}" stroke-width="3"/>`
    );
  }
  return envoltura(W, H, partes.join(""));
}

/** Banda transportadora: los rodillos a lo largo. */
export function svgBanda(largo: number, ancho: number): string {
  const W = Math.round(largo * 100);
  const H = Math.round(ancho * 100);
  const partes: string[] = [];
  for (let x = 16; x < W - 12; x += 22) {
    partes.push(`<line x1="${x}" y1="10" x2="${x}" y2="${H - 10}" stroke="${FINO}" stroke-width="2"/>`);
  }
  return envoltura(W, H, partes.join(""));
}

/** El SVG listo para usarse como fondo o como <img src>. */
export function comoDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
