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

/**
 * Solo hay dos familias: clip y charola. "Rodillo" es la otra forma de
 * nombrar al clip; se usa más la palabra clip, así que esa es la que sale.
 */
export type TipoCopita = "charola" | "clip";
export type Lado = "izquierda" | "derecha" | "ambos";

/**
 * Los pasos de copita y, para cada uno, a cada cuánto pueden ir las salidas.
 * Sale tal cual de "Salidas para CCO de rodillos" y "…de charolas" de ELFCO,
 * así que el vendedor no teclea medidas ni arma combinaciones que no existen.
 */
export const COPITAS: {
  etiqueta: string;
  tipo: TipoCopita;
  medida: string;
  /** Separación posible entre salidas, en pulgadas. */
  salidas: number[];
}[] = [
  { etiqueta: 'Clip 1¼"', tipo: "clip", medida: '1¼"', salidas: [12.5, 15, 18.75, 22.5, 25] },
  { etiqueta: 'Clip 2¼"', tipo: "clip", medida: '2¼"', salidas: [18, 22.5, 27, 36] },
  { etiqueta: 'Clip 3"', tipo: "clip", medida: '3"', salidas: [18, 21, 24, 27, 30, 36] },
  { etiqueta: 'Clip 3¾"', tipo: "clip", medida: '3¾"', salidas: [22.5, 30, 37.5, 45, 48.75, 60] },
  { etiqueta: 'Clip 4½"', tipo: "clip", medida: '4½"', salidas: [22.5, 27, 36, 45, 54] },
  { etiqueta: 'Charola 6"', tipo: "charola", medida: '6"', salidas: [22.5, 30, 37.5, 45] },
  { etiqueta: 'Charola 7½"', tipo: "charola", medida: '7½"', salidas: [24, 30, 36, 42, 48] },
  { etiqueta: 'Charola 9"', tipo: "charola", medida: '9"', salidas: [27, 36, 45, 54] },
];

/** Cómo se escribe una medida en pulgadas (22.5 → 22½"). */
export function enPulgadas(v: number): string {
  const entero = Math.floor(v);
  const resto = +(v - entero).toFixed(2);
  const fraccion = resto === 0.5 ? "½" : resto === 0.25 ? "¼" : resto === 0.75 ? "¾" : "";
  return `${entero}${fraccion}"`;
}

/** Cuántas líneas se arman normalmente. */
export const LINEAS_TIPICAS = [2, 4, 6, 8];

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
  /**
   * Ancho del cuerpo de la clasificadora, en metros. Se teclea porque todavía
   * no se tiene la tabla real por líneas y por copita.
   */
  anchoManual?: number;
}

const PULGADA = 0.0254;

/**
 * Ancho del cuerpo de la clasificadora, en metros. Sale de la cota de 1343 mm
 * del plano "LINEA CHAROLAS 6 x 12+1" — la de 4349 mm abarca la máquina CON
 * sus tolvas de los dos lados, por eso daba de más.
 *
 * Es el mismo para todas por ahora: el fabricante no comparte medidas de
 * fabricación, así que no hay tabla por líneas y por copita. En la pantalla se
 * puede teclear otro si se conoce el de una máquina en concreto.
 */
export const ANCHO_CUERPO_CLASIFICADORA = 1.343;

/**
 * Ancho que ocupa cada línea de copitas, incluyendo su estructura. El clip
 * arma la máquina más angosta que la charola, y así sale de los planos:
 *  - charola: "LINEA CHAROLAS 6 x 12+1" mide 4.35 m para 6 líneas → 0.725 m
 *  - clip:    "LINEA 4x12" mide 2.60 m para 4 líneas → 0.65 m
 * Todavía no cambia con el paso de la copita: solo hay esos dos planos.
 */
const ANCHO_POR_LINEA: Record<TipoCopita, number> = { clip: 0.65, charola: 0.725 };

/**
 * Ancho de los equipos que van en fila con la clasificadora (cepilladoras,
 * mesas, tolvas). Sale de los mismos dos planos: en la línea de clip todo
 * mide 0.90 m de ancho y en la de charolas todo mide 1.20 m.
 */
/**
 * Ancho ÚTIL (por donde pasa la fruta) que le toca a la línea según cuántas
 * líneas trae la clasificadora. Medidas de ELFCO, para clip; por ahora se usan
 * las mismas para charola — si algún día cambian, se ajusta aquí nada más.
 *
 * Esto es lo que hace que la cepilladora, la mesa y las bandas queden del
 * mismo ancho que la línea escogida, en vez de cada una por su lado.
 */
export const ANCHO_UTIL_POR_LINEAS: Record<number, number> = {
  2: 0.6,
  4: 0.9,
  6: 1.2,
  8: 1.8,
};

/**
 * Hasta cuántas líneas alcanza un ancho útil dado. Sirve para el momento de la
 * venta: hay clientes que pusieron la cepilladora de 1.20 m con clasificadora
 * de 2 líneas justo pensando en crecer después — esa cepilladora ya les sirve
 * para 6 y no hay que cambiarla. Devuelve null si no alcanza ni para 2.
 */
export function lineasQueAlcanza(anchoUtil: number): number | null {
  const holgura = 0.01;
  const alcanzan = Object.entries(ANCHO_UTIL_POR_LINEAS)
    .filter(([, ancho]) => ancho <= anchoUtil + holgura)
    .map(([lineas]) => Number(lineas));
  return alcanzan.length > 0 ? Math.max(...alcanzan) : null;
}

export function anchoDeLinea(lineas: number): number {
  if (ANCHO_UTIL_POR_LINEAS[lineas]) return ANCHO_UTIL_POR_LINEAS[lineas];
  // Si alguien pide un número de líneas fuera de la tabla, se toma el más
  // cercano hacia abajo en vez de inventar una medida.
  const conocidos = Object.keys(ANCHO_UTIL_POR_LINEAS).map(Number).sort((a, b) => a - b);
  const menor = conocidos.filter((n) => n <= lineas).pop() ?? conocidos[0];
  return ANCHO_UTIL_POR_LINEAS[menor];
}

/** Lo que se lleva la entrada de fruta y la descarga al final. */
const ENTRADA = 2.2;
const DESCARGA = 2.2;

/**
 * Huella de la clasificadora, en metros.
 *
 * OJO con el ancho: la clasificadora NO mide lo mismo que los módulos de
 * atrás. Los 0.60 / 0.90 / 1.20 / 1.80 son el ancho útil de las cepilladoras
 * y mesas; el cuerpo de la clasificadora es más ancho, y encima le cuelgan
 * las tolvas de salida. La medida exacta por número de líneas y por tipo de
 * copita TODAVÍA NO SE TIENE — se la pide a CIU, que es quien las fabrica.
 *
 * Mientras tanto el ancho se teclea a mano (`anchoManual`) y la pantalla avisa
 * que está por confirmar, en vez de inventar un número que acabaría en una
 * cotización.
 */
export function medidaClasificadora(p: ClasificadoraParams): { largo: number; ancho: number } {
  const largo = +(p.salidas * p.pasoSalidas * PULGADA + ENTRADA + DESCARGA).toFixed(2);
  return { largo, ancho: p.anchoManual ?? ANCHO_CUERPO_CLASIFICADORA };
}

export function nombreClasificadora(p: ClasificadoraParams): string {
  const copita = p.tipoCopita === "charola" ? "Charola" : "Clip";
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

  // Las líneas, como carriles limpios a lo largo. NO se dibuja copita por
  // copita: a escala se veían como puntitos y parecían empacadores. Aquí solo
  // van los carriles y las tolvas de salida.
  const altoLinea = (H - 8) / p.lineas;
  for (let i = 0; i < p.lineas; i++) {
    const y = 4 + i * altoLinea;
    partes.push(
      `<rect x="${entradaCm * 0.5}" y="${y + altoLinea * 0.18}" width="${W - entradaCm}" height="${altoLinea * 0.64}" fill="none" stroke="${trazoFino}" stroke-width="2"/>`
    );
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

/**
 * Los tres tipos de mesa de selección manual que maneja ELFCO. Ya no se
 * preguntan aparte: cada uno es su propio botón, así el vendedor escoge el
 * que está viendo y no tiene que llenar otro campo.
 */
export type TipoMesa = "guia-central" | "banda-superior" | "banda-inferior-chutes";

/** Los tres descanicadores. El de malla no lleva rodillos, lleva malla. */
export type TipoDescanicador = "fijo" | "ajustable" | "malla";

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

/** Mesa de selección manual, con la guía o la banda que le toque. */
export function svgMesaSeleccion(largo: number, ancho: number, tipo: TipoMesa): string {
  const W = Math.round(largo * 100);
  const H = Math.round(ancho * 100);
  const partes: string[] = [];

  // La banda que corre a lo largo
  partes.push(`<rect x="10" y="${H * 0.12}" width="${W - 20}" height="${H * 0.76}" fill="none" stroke="${FINO}" stroke-width="3"/>`);

  if (tipo === "guia-central") {
    partes.push(`<line x1="14" y1="${H / 2}" x2="${W - 14}" y2="${H / 2}" stroke="${TRAZO}" stroke-width="5"/>`);
  } else if (tipo === "banda-superior") {
    // Va encimada, más angosta: por eso punteada, se ve que está arriba.
    partes.push(
      `<rect x="${W * 0.1}" y="${H * 0.3}" width="${W * 0.8}" height="${H * 0.4}" fill="none" stroke="${TRAZO}" stroke-width="4" stroke-dasharray="14 8"/>`
    );
  } else {
    // Banda inferior con chutes: la banda va abajo y por los lados salen las
    // bocas por donde se tira la fruta que se aparta.
    partes.push(
      `<rect x="${W * 0.08}" y="${H * 0.34}" width="${W * 0.84}" height="${H * 0.32}" fill="none" stroke="${TRAZO}" stroke-width="4"/>`
    );
    const cuantos = Math.max(2, Math.floor(W / 90));
    const paso = (W - 40) / cuantos;
    for (let i = 0; i < cuantos; i++) {
      const x = 20 + i * paso + paso * 0.2;
      const w = paso * 0.6;
      partes.push(
        `<path d="M ${x} ${H * 0.12} L ${x + w} ${H * 0.12} L ${x + w * 0.75} ${H * 0.3} L ${x + w * 0.25} ${H * 0.3} Z" fill="none" stroke="${TRAZO}" stroke-width="3"/>`
      );
      partes.push(
        `<path d="M ${x} ${H * 0.88} L ${x + w} ${H * 0.88} L ${x + w * 0.75} ${H * 0.7} L ${x + w * 0.25} ${H * 0.7} Z" fill="none" stroke="${TRAZO}" stroke-width="3"/>`
      );
    }
    return envoltura(W, H, partes.join(""));
  }

  // Los travesaños de la banda
  for (let x = 24; x < W - 24; x += 26) {
    partes.push(`<line x1="${x}" y1="${H * 0.14}" x2="${x}" y2="${H * 0.86}" stroke="${FINO}" stroke-width="1.5"/>`);
  }
  return envoltura(W, H, partes.join(""));
}

/**
 * Descanicador: saca la fruta muy chiquita antes de que se gaste en lavarla.
 * El fijo trae los rodillos a una separación de fábrica; el ajustable trae el
 * mecanismo para abrirlos o cerrarlos; el de malla no lleva rodillos.
 */
export function svgDescanicador(largo: number, ancho: number, tipo: TipoDescanicador): string {
  const W = Math.round(largo * 100);
  const H = Math.round(ancho * 100);
  const partes: string[] = [];

  if (tipo === "malla") {
    // Cuadrícula: es malla, no rodillos.
    for (let x = 16; x < W - 12; x += 20) {
      partes.push(`<line x1="${x}" y1="12" x2="${x}" y2="${H - 12}" stroke="${FINO}" stroke-width="1.5"/>`);
    }
    for (let y = 16; y < H - 12; y += 20) {
      partes.push(`<line x1="12" y1="${y}" x2="${W - 12}" y2="${y}" stroke="${FINO}" stroke-width="1.5"/>`);
    }
    return envoltura(W, H, partes.join(""));
  }

  // Los rodillos, cruzados a lo ancho
  for (let x = 16; x < W - 12; x += 18) {
    partes.push(`<line x1="${x}" y1="12" x2="${x}" y2="${H - 12}" stroke="${FINO}" stroke-width="5"/>`);
  }
  if (tipo === "ajustable") {
    // La barra de ajuste a un costado, con sus flechas de apriete.
    partes.push(`<line x1="14" y1="${H * 0.5}" x2="${W - 14}" y2="${H * 0.5}" stroke="${TRAZO}" stroke-width="4" stroke-dasharray="12 7"/>`);
    partes.push(
      `<path d="M ${W * 0.5 - 26} ${H * 0.5 - 16} L ${W * 0.5 - 10} ${H * 0.5} L ${W * 0.5 - 26} ${H * 0.5 + 16} M ${W * 0.5 + 26} ${H * 0.5 - 16} L ${W * 0.5 + 10} ${H * 0.5} L ${W * 0.5 + 26} ${H * 0.5 + 16}" fill="none" stroke="${TRAZO}" stroke-width="4"/>`
    );
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

/**
 * Caseta de control: no es máquina, es el cuartito donde se para el operador.
 * Se dibuja como cuarto con su puerta para que no se confunda con un equipo.
 */
export function svgCaseta(largo: number, ancho: number): string {
  const W = Math.round(largo * 100);
  const H = Math.round(ancho * 100);
  const partes: string[] = [];
  // Pared doble: así se lee como cuarto y no como bloque de máquina.
  partes.push(
    `<rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="${TRAZO}" stroke-width="3"/>`
  );
  // La puerta, en el lado largo de abajo
  partes.push(`<line x1="${W * 0.6}" y1="${H - 2}" x2="${W * 0.6}" y2="${H - 14}" stroke="#fff" stroke-width="8"/>`);
  partes.push(
    `<path d="M ${W * 0.6} ${H - 8} A ${W * 0.22} ${W * 0.22} 0 0 0 ${W * 0.82} ${H - 8 - W * 0.22}" fill="none" stroke="${FINO}" stroke-width="3"/>`
  );
  // La mesa de control pegada a la pared de arriba
  partes.push(
    `<rect x="${W * 0.12}" y="26" width="${W * 0.35}" height="${H * 0.22}" fill="none" stroke="${FINO}" stroke-width="3"/>`
  );
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
