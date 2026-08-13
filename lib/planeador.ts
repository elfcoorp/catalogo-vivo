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
  ancho: number;
  /** Posición de la esquina superior izquierda, en metros. */
  x: number;
  y: number;
  origen: Origen;
  /** Dibujo en planta recortado del plano ELFCO. Si no hay, se ve como bloque. */
  imagen?: string;
  /** Giro del dibujo en grados. */
  rotacion: 0 | 90 | 180 | 270;
  /** Voltea el dibujo como espejo: las salidas cambian de lado. */
  espejo: boolean;
  /** Un poste de la nave: no se cotiza, pero estorba y nada puede ir encima. */
  esPoste?: boolean;
}

/** Lado de un poste cuadrado, en metros. El vendedor lo ajusta si es más grueso. */
export const POSTE = 0.3;

/**
 * Módulos con su dibujo real, recortado de los planos de ELFCO. Las medidas
 * salen de la lista de partes del mismo plano, así que no son inventadas —
 * aun así el vendedor las puede corregir, porque cada empaque trae las suyas.
 */
export interface ModuloCatalogo {
  tipo: string;
  largo: number;
  ancho: number;
  imagen?: string;
}

export const CATALOGO_MODULOS: ModuloCatalogo[] = [
  // De "LINEA CHAROLAS 6 x 12+1": medidas tal cual las lista el plano.
  { tipo: "Cepilladora lavadora", largo: 2.27, ancho: 1.2, imagen: "/modulos/mod-cepilladora.png" },
  { tipo: "Selección manual", largo: 3.4, ancho: 1.2, imagen: "/modulos/mod-seleccion.png" },
  { tipo: "Clasificadora de charolas 6 líneas", largo: 15.34, ancho: 4.35, imagen: "/modulos/mod-clasificadora.png" },
  { tipo: "Elevador de rodillos", largo: 3, ancho: 1.2 },
  { tipo: "Banda de PVC", largo: 3, ancho: 1.8 },
  { tipo: "Banda sanitaria", largo: 7, ancho: 0.77 },
  { tipo: "Tolva de recepción", largo: 6, ancho: 1.2 },
  { tipo: "Mesa descarnadora", largo: 3, ancho: 1.2 },
  { tipo: "Volteadora de bins", largo: 8, ancho: 3.7 },
  { tipo: "Módulo de empaque", largo: 3, ancho: 1.2 },
  { tipo: "Otro", largo: 3, ancho: 1.2 },
];

export interface Espacio {
  largo: number;
  ancho: number;
}

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

/** Metros cuadrados que ocupan las máquinas (los postes no cuentan como equipo). */
export function areaOcupada(modulos: Modulo[]): number {
  return modulos.filter((m) => !m.esPoste).reduce((total, m) => total + m.largo * m.ancho, 0);
}

/** Arma el mensaje del levantamiento para mandarlo por WhatsApp. */
export function resumenLevantamiento(
  espacio: Espacio,
  modulos: Modulo[],
  cabe: boolean,
  notas: string,
  whatsapp: string
): string {
  const linea = (m: Modulo) => {
    const giro = m.rotacion !== 0 ? ` · girada ${m.rotacion}°` : "";
    const esp = m.espejo ? " · en espejo (salidas del otro lado)" : "";
    return `- ${m.tipo}: ${m.largo.toFixed(2)} x ${m.ancho.toFixed(2)} m${giro}${esp}`;
  };
  const maquinas = modulos.filter((m) => !m.esPoste);
  const postes = modulos.filter((m) => m.esPoste);
  const porOrigen = (o: Origen) => maquinas.filter((m) => m.origen === o);

  const seccion = (titulo: string, lista: Modulo[]) =>
    lista.length > 0 ? `\n${titulo} (${lista.length}):\n${lista.map(linea).join("\n")}` : "";

  return [
    "Levantamiento de mi empaque:",
    `Espacio disponible: ${espacio.largo.toFixed(2)} x ${espacio.ancho.toFixed(2)} m`,
    postes.length > 0 && `Postes marcados en el área: ${postes.length}`,
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
