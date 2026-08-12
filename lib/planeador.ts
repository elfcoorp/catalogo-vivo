/**
 * Planeador de layout: el vendedor dibuja el espacio del cliente visto desde
 * arriba y acomoda módulos a escala para responder UNA pregunta — ¿cabe?
 * El plano a detalle es otra fase (después del anticipo, con ingeniero).
 */

/** Un módulo que se puede acomodar en el piso del empaque. */
export interface Modulo {
  id: string;
  tipo: string;
  /** Metros. Se editan siempre: cada empaque trae medidas distintas. */
  largo: number;
  ancho: number;
  /** Posición de la esquina superior izquierda, en metros. */
  x: number;
  y: number;
  /** true = el cliente YA lo tiene (verde). false = es lo que se le va a vender. */
  yaLoTiene: boolean;
}

/** Los tipos que un vendedor acomoda en un levantamiento. */
export const TIPOS_MODULO = [
  "Mesa de selección · guía central",
  "Mesa de selección · guías laterales",
  "Mesa de selección · banda superior",
  "Mesa de selección · tolva",
  "Mesa descarnadora",
  "Cepilladora",
  "Banda de PVC",
  "Clasificadora",
  "Tolva",
  "Módulo de empaque",
  "Llenadora",
  "Volteadora de bins",
  "Otro",
] as const;

/**
 * Medida de arranque, NO una especificación. Es el tamaño de mesa que se usó
 * de ejemplo (3.00 x 1.20 m); el vendedor la corrige con la medida real que
 * trae el cliente. Nunca se presenta como si fuera la medida de una máquina.
 */
export const LARGO_INICIAL = 3;
export const ANCHO_INICIAL = 1.2;

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
      const candidato: Modulo = { id: "?", tipo: "", largo, ancho, x, y, yaLoTiene: false };
      if (!modulos.some((m) => seEnciman(candidato, m))) return { x, y };
    }
  }
  return { x: 0, y: 0 }; // ya no cabe: se pone en la esquina y saldrá en rojo
}

/** Metros cuadrados que ocupan los módulos, para comparar contra el espacio. */
export function areaOcupada(modulos: Modulo[]): number {
  return modulos.reduce((total, m) => total + m.largo * m.ancho, 0);
}

/** Arma el mensaje del levantamiento para mandarlo por WhatsApp. */
export function resumenLevantamiento(
  espacio: Espacio,
  modulos: Modulo[],
  cabe: boolean,
  notas: string,
  whatsapp: string
): string {
  const linea = (m: Modulo) =>
    `- ${m.tipo}: ${m.largo.toFixed(2)} x ${m.ancho.toFixed(2)} m`;
  const tiene = modulos.filter((m) => m.yaLoTiene);
  const nuevos = modulos.filter((m) => !m.yaLoTiene);

  return [
    "Levantamiento de mi empaque:",
    `Espacio disponible: ${espacio.largo.toFixed(2)} x ${espacio.ancho.toFixed(2)} m`,
    tiene.length > 0 && `\nLo que YA TENGO (${tiene.length}):\n${tiene.map(linea).join("\n")}`,
    nuevos.length > 0 && `\nLo que NECESITO cotizar (${nuevos.length}):\n${nuevos.map(linea).join("\n")}`,
    `\n${cabe ? "Con este acomodo SÍ cabe." : "Con este acomodo todavía NO cabe — hay módulos encimados o fuera del espacio."}`,
    notas && `\nNotas: ${notas}`,
    whatsapp && `\nMi WhatsApp: ${whatsapp}`,
  ]
    .filter(Boolean)
    .join("\n");
}
