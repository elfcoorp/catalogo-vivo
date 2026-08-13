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
  return `Clasificadora ${copita} ${p.medidaCopita} · ${p.lineas} líneas x ${salidas}${p.conPeso ? " · con peso" : ""}`;
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

/** El SVG listo para usarse como fondo o como <img src>. */
export function comoDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
