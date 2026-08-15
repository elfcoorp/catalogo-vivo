/**
 * Planeador de layout: el vendedor dibuja el espacio del cliente visto desde
 * arriba y acomoda módulos a escala para responder UNA pregunta — ¿cabe?
 * El plano a detalle es otra fase (después del anticipo, con ingeniero).
 */

/**
 * De dónde sale cada módulo. Importa para el espejo: una máquina que ya está
 * construida trae sus salidas del lado que las trae y no se puede voltear;
 * una que se va a fabricar sí se puede pedir con las salidas del otro lado.
 */
export type Origen = "cliente" | "usada" | "nueva";

export const ORIGENES: { valor: Origen; etiqueta: string; color: string; espejo: boolean }[] = [
  { valor: "cliente", etiqueta: "Ya lo tiene el cliente", color: "#2f9e44", espejo: false },
  { valor: "usada", etiqueta: "Usada de ELFCO", color: "#1c7ed6", espejo: false },
  { valor: "nueva", etiqueta: "Nueva a fabricar", color: "#0f766e", espejo: true },
];

export function puedeVoltearse(origen: Origen): boolean {
  return ORIGENES.find((o) => o.valor === origen)?.espejo ?? false;
}

export function colorDeOrigen(origen: Origen): string {
  return ORIGENES.find((o) => o.valor === origen)?.color ?? "#0f766e";
}

/** Un módulo que se puede acomodar en el piso del empaque. */
export interface Modulo {
  id: string;
  tipo: string;
  /** Metros, YA girados: es la huella real que ocupa en el piso. */
  largo: number;
  /**
   * SOLO el ancho ÚTIL: por donde pasa la fruta. Hay máquinas muy robustas
   * cuyo ancho total no tiene que ver con el paso de la fruta, y si con el
   * puro ancho útil no cabe, no cabe.
   */
  ancho: number;
  /** Posición de la esquina superior izquierda, en metros. */
  x: number;
  y: number;
  origen: Origen;
  /** Dibujo en planta generado a la medida. Si no hay, se ve como bloque. */
  imagen?: string;
  /** Qué figura le toca, para volver a dibujarla si cambian las medidas. */
  dibujo?: Dibujo;
  /** Cuál variante de esa figura (guía de la mesa, tipo de descanicador). */
  variante?: string;
  /**
   * En qué etapa del proceso lo puso el vendedor: recepción, rezaga, lavado,
   * clasificación de segunda. La misma mesa de selección manual se usa en
   * varias etapas, y en el layout del cliente hay que poder distinguirlas.
   */
  etapa?: string;
  /**
   * Si su ancho lo manda la línea (cepilladoras, mesas, tolvas). SOLO a
   * éstas se les avisa "alcanza hasta N líneas": una banda de segunda
   * calidad puede ser de 20 cm y está bien, no hay nada que avisar.
   */
  sigueLinea?: boolean;
  /**
   * Cuántas piezas son, cuando lo que importa es la cantidad y no la
   * huella — el caso de las básculas.
   */
  cantidad?: number;
  /**
   * Su largo lo manda la clasificadora, no el vendedor. Si él ya dijo
   * cuántas salidas van y a cada cuánto, el largo ya está dado: pedírselo
   * otra vez sería preguntarle dos veces lo mismo.
   */
  largoAutomatico?: boolean;
  /** Giro del dibujo en grados. */
  rotacion: 0 | 90 | 180 | 270;
  /** Voltea el dibujo como espejo: las salidas cambian de lado. */
  espejo: boolean;
}

export interface Espacio {
  largo: number;
  ancho: number;
}

/** Qué dibujo le toca a cada equipo de la línea. */
export type Dibujo =
  | "cepilladora"
  | "mesa"
  | "tolva"
  | "banda"
  | "caseta"
  | "descanicador"
  | "vaciado"
  | "ninguno";

export interface Equipo {
  tipo: string;
  /** Dónde sale en la lista, para no dejar 20 botones en una sola tira. */
  grupo: string;
  /**
   * Cuál de las variantes del dibujo le toca: la guía de la mesa, o si el
   * descanicador es fijo, ajustable o de malla.
   */
  variante?: string;
  /** Largo típico en metros, sacado de los planos. El vendedor lo corrige. */
  largo: number;
  /**
   * Ancho útil típico en metros. Si va en fila con la clasificadora se deja
   * sin poner: toma el ancho de la línea (0.90 m con clip, 1.20 m con charola).
   */
  ancho?: number;
  dibujo: Dibujo;
}

/**
 * Todo lo que el vendedor puede ver parado en un empaque. Las medidas salen
 * de las listas de partes de los planos de ELFCO, no están inventadas:
 *  - "LINEA CHAROLAS 6 x 12+1"  → elevador, cepilladoras, selección, bandas
 *  - "LINEA 4x12"               → descanicador, singulador
 *  - "Layout Linea de Tomate"   → tina, mesa de rodillos, cangilones, cajas
 *  - "LINEA DE 6X12+1"          → caseta de control
 * Las dos marcadas PROVISIONAL no vienen en ningún plano: son un punto de
 * partida para que el vendedor teclee la medida buena en el empaque.
 */
/**
 * El grupo que NO se toca al recorrer el empaque: se arma junto con la
 * clasificadora que se le propone, porque cuántas tolvas, bancos y básculas
 * hacen falta depende de las salidas que lleve.
 */
export const GRUPO_LINEA = "Lo que va con la clasificadora";

export const EQUIPOS: Equipo[] = [
  // 1. RECEPCIÓN — cómo se vacía la fruta que llega: en bins, en cajas o a
  // mano. Y por dónde entra a la línea: a una tina o a una banda.
  { tipo: "Volteadora de bins", grupo: "Recepción", largo: 8, ancho: 3.7, dibujo: "ninguno" },
  // PROVISIONAL: no vienen con medida en los planos.
  { tipo: "Volteadora de cajas", grupo: "Recepción", largo: 2, dibujo: "ninguno" },
  // No es máquina: es gente vaciando cajas. Por eso lleva monitos de dibujo,
  // para que en el layout se entienda de un golpe.
  { tipo: "Vaciado manual", grupo: "Recepción", largo: 3, dibujo: "vaciado" },
  { tipo: "Tina de lavado", grupo: "Recepción", largo: 4, dibujo: "banda" },
  { tipo: "Banda de PVC", grupo: "Recepción", largo: 3, ancho: 1.8, dibujo: "banda" },

  // 2. REZAGA O DESECHO — va ANTES del lavado, y no al revés. Razón de
  // Eduardo: el descanicador saca la fruta muy chiquita, y no tiene caso
  // lavarla, secarla ni encerarla si de todos modos no tiene costo.
  // Cada tipo de mesa es su propio botón: así se escoge la que se está
  // viendo, en vez de tocarla y luego tener que llenar otro campo aparte.
  {
    tipo: "Selección manual con guía central",
    grupo: "Rezaga o desecho",
    largo: 3.4,
    dibujo: "mesa",
    variante: "guia-central",
  },
  {
    tipo: "Selección manual con banda superior",
    grupo: "Rezaga o desecho",
    largo: 3.4,
    dibujo: "mesa",
    variante: "banda-superior",
  },
  {
    tipo: "Selección manual con chutes",
    grupo: "Rezaga o desecho",
    largo: 3.4,
    dibujo: "mesa",
    variante: "banda-inferior-chutes",
  },
  // Uno solo, sin apellido: de él lo único que importa es el ancho y el
  // largo. El largo de 2 m lo dictó Eduardo.
  { tipo: "Descanicador", grupo: "Rezaga o desecho", largo: 2, dibujo: "descanicador" },

  // 3. LAVADO — nada más las tres cepilladoras. Si el empaque no cepilla, no
  // se toca nada de aquí.
  { tipo: "Cepilladora lavadora", grupo: "Lavado", largo: 2.27, dibujo: "cepilladora" },
  { tipo: "Cepilladora secadora", grupo: "Lavado", largo: 2.27, dibujo: "cepilladora" },
  { tipo: "Cepilladora enceradora", grupo: "Lavado", largo: 2.27, dibujo: "cepilladora" },

  // 4. CLASIFICACIÓN DE SEGUNDA CALIDAD — las mismas tres mesas otra vez,
  // porque la segunda calidad se vuelve a revisar a mano. Van repetidas a
  // propósito: cada pieza guarda su etapa, así el layout las distingue.
  {
    tipo: "Selección manual con guía central",
    grupo: "Clasificación de segunda calidad",
    largo: 3.4,
    dibujo: "mesa",
    variante: "guia-central",
  },
  {
    tipo: "Selección manual con banda superior",
    grupo: "Clasificación de segunda calidad",
    largo: 3.4,
    dibujo: "mesa",
    variante: "banda-superior",
  },
  {
    tipo: "Selección manual con chutes",
    grupo: "Clasificación de segunda calidad",
    largo: 3.4,
    dibujo: "mesa",
    variante: "banda-inferior-chutes",
  },
  // La segunda calidad o se va a un bin (cuando se vende a proceso) o se
  // vuelve a clasificar en una bandita. Por eso de ésta hay que medir el
  // ancho Y el largo: PROVISIONAL, no viene en los planos.
  {
    tipo: "Banda de segunda calidad",
    grupo: "Clasificación de segunda calidad",
    largo: 3,
    ancho: 0.6,
    dibujo: "banda",
  },

  // 5. LO QUE VA CON LA CLASIFICADORA. Esto NO se toca al recorrer el
  // empaque: se arma junto con la línea que se le propone, porque cuántas
  // tolvas, bancos y básculas se necesitan depende de las salidas.
  //
  // Cada uno puede ir en verde: al meter una clasificadora se quita la banda
  // que el cliente tenía, pero sus bancos y sus descansadores de caja llena
  // se reaprovechan. Por eso lleva "ya los tiene / se los cotizamos".
  { tipo: "Tolvas", grupo: GRUPO_LINEA, largo: 6, dibujo: "tolva" },
  // Medida de su cotización de tomate grape: "BANCO PARA LLENADO DE CAJA
  // 0.30 M DE ANCHO X 0.45 M DE LONGITUD".
  { tipo: "Bancos", grupo: GRUPO_LINEA, largo: 0.45, ancho: 0.3, dibujo: "ninguno" },
  // PROVISIONAL: la báscula no viene con medida en los planos.
  { tipo: "Básculas", grupo: GRUPO_LINEA, largo: 0.6, ancho: 0.6, dibujo: "ninguno" },
  // Transporte de CAJA, no de fruta. Los largos y el ancho de 16" (0.41 m)
  // salen de "Layout Linea de Tomate".
  { tipo: "Transportador motorizado", grupo: GRUPO_LINEA, largo: 20, ancho: 0.41, dibujo: "banda" },
  // De gravedad: rodillos libres, la caja corre empujada y sola hasta la zona
  // de pallet. Los 6 m salen de la foto que mandó Eduardo de su empaque.
  { tipo: "Transportador de gravedad", grupo: GRUPO_LINEA, largo: 6, ancho: 0.41, dibujo: "banda" },
  { tipo: "Transportador de banda de PVC", grupo: GRUPO_LINEA, largo: 17, ancho: 0.41, dibujo: "banda" },
  { tipo: "Transportador de caja vacía", grupo: GRUPO_LINEA, largo: 30, ancho: 0.41, dibujo: "banda" },

  // Accesorios — Eduardo lo dejó en la caseta y nada más. Se quitaron la
  // bodega y el "Otro". La medida sale del plano "LINEA DE 6X12+1".
  { tipo: "Caseta de vigilancia", grupo: "Accesorios", largo: 4.6, ancho: 4.6, dibujo: "caseta" },
];

/** Los grupos en el orden en que van, sin repetir. */
export const GRUPOS_EQUIPO: string[] = [...new Set(EQUIPOS.map((e) => e.grupo))];

/** Los que se van tocando al recorrer el empaque (todo menos la línea nueva). */
export const GRUPOS_DEL_RECORRIDO: string[] = GRUPOS_EQUIPO.filter((g) => g !== GRUPO_LINEA);

/**
 * El número de orden de cada pieza: 1, 2, 3, 4… corrido, en el orden en que
 * el vendedor las fue tocando. Antes se numeraba por tipo ("Mesa #1, #2") y
 * salían puros unos, que no decían nada. Con el número corrido, el que trae
 * el 5 en el dibujo es el mismo 5 de la lista de medidas y el del layout.
 */
export function numerosDeModulo(modulos: Modulo[]): Record<string, number> {
  const numeros: Record<string, number> = {};
  modulos.forEach((m, i) => (numeros[m.id] = i + 1));
  return numeros;
}

/** "3. Cepilladora lavadora" — el nombre como se lee en las listas. */
export function conNumero(numero: number, tipo: string): string {
  return `${numero}. ${tipo}`;
}

/** Separación entre piezas cuando se acomodan solas, en metros. */
const HUECO = 0.15;

/**
 * Acomoda TODAS las piezas en su orden numérico, en una fila a lo largo y
 * centrada en el empaque — así se ve como se ve una línea de verdad. Cuando
 * ya no cabe más a lo largo, sigue en otra fila abajo.
 *
 * Es el punto de partida: el vendedor toca todo lo que ve, le queda ordenado
 * solo, y de ahí nada más las corre a la izquierda, derecha, arriba o abajo.
 */
export function acomodarEnOrden(modulos: Modulo[], espacio: Espacio): Modulo[] {
  // 1. Se reparten en filas, respetando el orden en que se tocaron.
  const filas: Modulo[][] = [];
  let fila: Modulo[] = [];
  let largoFila = 0;

  for (const m of modulos) {
    const suma = largoFila === 0 ? m.largo : largoFila + HUECO + m.largo;
    if (fila.length > 0 && suma > espacio.largo) {
      filas.push(fila);
      fila = [m];
      largoFila = m.largo;
    } else {
      fila.push(m);
      largoFila = suma;
    }
  }
  if (fila.length > 0) filas.push(fila);

  // 2. Todo el bloque queda centrado a lo alto del empaque.
  const altoDeFila = filas.map((f) => Math.max(...f.map((m) => m.ancho), 0));
  const altoTotal = altoDeFila.reduce((t, a) => t + a, 0) + HUECO * Math.max(0, filas.length - 1);
  let y = (espacio.ancho - altoTotal) / 2;

  const acomodados: Modulo[] = [];
  filas.forEach((f, i) => {
    const anchoFila = f.reduce((t, m) => t + m.largo, 0) + HUECO * Math.max(0, f.length - 1);
    // Se llena de DERECHA a IZQUIERDA: el número 1 es la volteadora, y ahí
    // es donde entra la fruta. La fila queda centrada igual.
    let x = espacio.largo - (espacio.largo - anchoFila) / 2;
    for (const m of f) {
      x -= m.largo;
      // Cada pieza va centrada dentro del alto de su fila.
      acomodados.push({ ...m, x: +x.toFixed(2), y: +(y + (altoDeFila[i] - m.ancho) / 2).toFixed(2) });
      x -= HUECO;
    }
    y += altoDeFila[i] + HUECO;
  });

  return acomodados;
}

/**
 * Las frutas que se trabajan, para arrancar el levantamiento por ahí.
 * Las fotos salen del catálogo de CepaMex, con su permiso.
 *
 * Cada fruta trae la copita que le toca, dictada por Eduardo. Al escogerla,
 * la pantalla ya no ofrece la otra familia: si el tomate va con clip, no
 * tiene caso enseñar los botones de charola. Las que traen `medida` la
 * dejan puesta sola; las que solo traen `copita` esperan que él escoja el
 * paso. Las que no traen nada TODAVÍA NO LAS HA DICHO — no inventar.
 */
export interface FrutaLinea {
  nombre: string;
  foto?: string;
  /** "clip" o "charola". Si va vacío, se ofrecen las dos familias. */
  copita?: "clip" | "charola";
  /** El paso exacto, si él ya lo dijo (ej. '3¾"'). */
  medida?: string;
  /** Aclaración que sale bajo la fruta escogida. */
  nota?: string;
}

export const FRUTAS_LINEA: FrutaLinea[] = [
  { nombre: "Tomate", foto: "/frutas/f-tomate.png", copita: "clip", medida: '3¾"' },
  { nombre: "Tomate grape", foto: "/frutas/f-tomate.png", copita: "clip", medida: '1¼"' },
  { nombre: "Chile morrón", foto: "/frutas/f-morron.png", copita: "charola", medida: '6"' },
  {
    nombre: "Pepino",
    foto: "/frutas/f-pepino.png",
    copita: "charola",
    medida: '6"',
    nota: "El pepino lleva la charola de 6\" especial.",
  },
  { nombre: "Cítricos", foto: "/frutas/f-citricos.png", copita: "clip" },
  { nombre: "Limón persa", foto: "/frutas/f-citricos.png", copita: "clip", medida: '3"' },
  { nombre: "Mango", foto: "/frutas/f-mango.png" },
  { nombre: "Aguacate", foto: "/frutas/f-aguacate.png" },
  { nombre: "Cebolla", foto: "/frutas/f-cebolla.png" },
  { nombre: "Papa", foto: "/frutas/f-papa.png" },
  { nombre: "Otra" },
];

/** ¿Este módulo se sale del espacio disponible? */
export function seSale(m: Modulo, espacio: Espacio): boolean {
  const fuera = 0.001; // tolerancia, para que un empate no marque error
  return (
    m.x < -fuera ||
    m.y < -fuera ||
    m.x + m.largo > espacio.largo + fuera ||
    m.y + m.ancho > espacio.ancho + fuera
  );
}

/** ¿Estos dos módulos están encimados? */
export function seEnciman(a: Modulo, b: Modulo): boolean {
  const holgura = 0.001;
  return (
    a.x < b.x + b.largo - holgura &&
    a.x + a.largo > b.x + holgura &&
    a.y < b.y + b.ancho - holgura &&
    a.y + a.ancho > b.y + holgura
  );
}

/** Los ids de los módulos con problema: encimados o fuera del espacio. */
export function modulosConProblema(modulos: Modulo[], espacio: Espacio): Set<string> {
  const malos = new Set<string>();
  for (const m of modulos) {
    if (seSale(m, espacio)) malos.add(m.id);
  }
  for (let i = 0; i < modulos.length; i++) {
    for (let j = i + 1; j < modulos.length; j++) {
      if (seEnciman(modulos[i], modulos[j])) {
        malos.add(modulos[i].id);
        malos.add(modulos[j].id);
      }
    }
  }
  return malos;
}

/**
 * Primer lugar libre donde cabe un módulo nuevo, recorriendo el piso de arriba
 * a abajo. Sin esto los módulos nacen unos encima de otros y todo sale en rojo
 * antes de que el vendedor mueva nada.
 */
export function buscarHueco(
  modulos: Modulo[],
  espacio: Espacio,
  largo: number,
  ancho: number
): { x: number; y: number } {
  const paso = 0.25;
  for (let y = 0; y + ancho <= espacio.ancho + 0.001; y = +(y + paso).toFixed(2)) {
    for (let x = 0; x + largo <= espacio.largo + 0.001; x = +(x + paso).toFixed(2)) {
      const candidato = { x, y, largo, ancho } as Modulo;
      if (!modulos.some((m) => seEnciman(candidato, m))) return { x, y };
    }
  }
  return { x: 0, y: 0 }; // ya no cabe: se pone en la esquina y saldrá en rojo
}

/**
 * Dónde cae lo que va CON la clasificadora (tolvas, bancos, básculas). Va
 * pegado a ella y no revuelto con el resto: las tolvas de la clasificadora
 * tienen que quedar a un ladito de la clasificadora, no del otro lado del
 * empaque. Se van apilando debajo, y si ya no cabe abajo, arriba.
 */
export function juntoALaClasificadora(
  modulos: Modulo[],
  espacio: Espacio,
  largo: number,
  ancho: number
): { x: number; y: number } | null {
  const clasif = modulos.find((m) => m.tipo.startsWith("Clasificadora"));
  if (!clasif) return null;

  const x = Math.min(Math.max(0, clasif.x), Math.max(0, espacio.largo - largo));
  for (const abajo of [true, false]) {
    let y = abajo ? clasif.y + clasif.ancho + HUECO : clasif.y - HUECO - ancho;
    for (let intento = 0; intento < 40; intento++) {
      const cabe = y >= 0 && y + ancho <= espacio.ancho;
      const candidato = { x, y, largo, ancho } as Modulo;
      if (cabe && !modulos.some((m) => seEnciman(candidato, m))) {
        return { x: +x.toFixed(2), y: +y.toFixed(2) };
      }
      y += abajo ? HUECO + ancho : -(HUECO + ancho);
    }
  }
  return null; // no cupo cerca: que lo acomode el buscador de siempre
}

/** Qué tan cerca hay que estar (en metros) para que una pieza se pegue a otra. */
const IMAN = 0.22;

function pegar(valor: number, candidatos: number[]): number {
  let mejor = valor;
  let distancia = IMAN;
  for (const c of candidatos) {
    const d = Math.abs(valor - c);
    if (d < distancia) {
      distancia = d;
      mejor = c;
    }
  }
  return mejor;
}

/**
 * Ajusta la posición para que las piezas se alineen solas al acercarlas.
 * Sin esto, alinear dos máquinas con el dedo en un teléfono es imposible.
 */
export function pegarAOtros(
  arrastrado: { id: string; largo: number; ancho: number },
  modulos: Modulo[],
  espacio: Espacio,
  x: number,
  y: number
): { x: number; y: number } {
  const otros = modulos.filter((m) => m.id !== arrastrado.id);

  const enX: number[] = [0, espacio.largo - arrastrado.largo];
  const enY: number[] = [0, espacio.ancho - arrastrado.ancho];

  for (const o of otros) {
    // Orilla con orilla (pegadas) y también alineadas por el mismo borde.
    enX.push(o.x, o.x + o.largo, o.x - arrastrado.largo, o.x + o.largo - arrastrado.largo);
    enY.push(o.y, o.y + o.ancho, o.y - arrastrado.ancho, o.y + o.ancho - arrastrado.ancho);
  }

  return { x: pegar(x, enX), y: pegar(y, enY) };
}

/** Metros cuadrados que ocupan las máquinas. */
export function areaOcupada(modulos: Modulo[]): number {
  return modulos.reduce((total, m) => total + m.largo * m.ancho, 0);
}

/** Arma el mensaje del levantamiento para mandarlo por WhatsApp. */
export function resumenLevantamiento(
  espacio: Espacio,
  modulos: Modulo[],
  cabe: boolean,
  notas: string,
  whatsapp: string,
  fruta = ""
): string {
  const numeros = numerosDeModulo(modulos);
  const linea = (m: Modulo) => {
    const giro = m.rotacion !== 0 ? ` · girada ${m.rotacion}°` : "";
    const esp = m.espejo ? " · en espejo (salidas del otro lado)" : "";
    // El ancho es el ÚTIL, y así se dice, para que nadie lo confunda con el total.
    return `- ${conNumero(numeros[m.id], m.tipo)}: ${m.largo.toFixed(2)} m de largo x ${m.ancho.toFixed(2)} m de ancho útil${giro}${esp}`;
  };
  const porOrigen = (o: Origen) => modulos.filter((m) => m.origen === o);

  const seccion = (titulo: string, lista: Modulo[]) =>
    lista.length > 0 ? `\n${titulo} (${lista.length}):\n${lista.map(linea).join("\n")}` : "";

  return [
    "Levantamiento de mi empaque:",
    fruta && `Fruta: ${fruta}`,
    `Espacio disponible: ${espacio.largo.toFixed(2)} x ${espacio.ancho.toFixed(2)} m`,
    seccion("Lo que YA TENGO", porOrigen("cliente")),
    seccion("Usadas de ELFCO que me interesan", porOrigen("usada")),
    seccion("Nuevas a fabricar", porOrigen("nueva")),
    `\n${cabe ? "Con este acomodo SÍ cabe." : "Con este acomodo todavía NO cabe — hay módulos encimados o fuera del espacio."}`,
    notas && `\nNotas: ${notas}`,
    whatsapp && `\nMi WhatsApp: ${whatsapp}`,
  ]
    .filter(Boolean)
    .join("\n");
}
