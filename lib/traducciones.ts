import type { Lang } from "./i18n";

interface CamposTraducibles {
  nombre?: string;
  nombreCorto?: string;
  resumenTarjeta?: string;
  pasoCopita?: string;
}

/** Traducciones de los datos de producto (nombre y resumen corto). La ficha técnica se queda en español. */
export const TRADUCCION_PRODUCTOS: Record<string, Record<"en" | "pt", CamposTraducibles>> = {
  "linea-tomate-grape-4x12": {
    en: {
      nombre: "Grape Tomato Line 4x12",
      nombreCorto: "Sorter · 4 lines x 12 outlets",
      resumenTarjeta: "Capacity 450 kg/line/hour",
      pasoCopita: "Roller 1¼\"",
    },
    pt: {
      nombre: "Linha de Tomate Grape 4x12",
      nombreCorto: "Calibrador · 4 linhas x 12 saídas",
      resumenTarjeta: "Capacidade 450 kg/linha/hora",
      pasoCopita: "Rolo 1¼\"",
    },
  },
  "linea-citricos": {
    en: {
      nombre: "Complete Citrus Line",
      nombreCorto: "Sorter · Citrus",
      resumenTarjeta: "Adjustable tube sizer",
      pasoCopita: "4 grade-1 outlets + 4 grade-2 · Stainless steel",
    },
    pt: {
      nombre: "Linha Completa para Cítricos",
      nombreCorto: "Calibrador · Cítricos",
      resumenTarjeta: "Calibrador de tubos ajustável",
      pasoCopita: "4 saídas 1ª + 4 de 2ª qualidade · Inox",
    },
  },
  "clasificadora-6-lineas": {
    en: {
      nombre: "6-Line Sorter x 12 Outlets (mango, bell pepper, avocado)",
      nombreCorto: "Sorter · 6 lines x 12 outlets",
      resumenTarjeta: "Capacity 1.9 ton/line per hour",
      pasoCopita: "Tray 6\"",
    },
    pt: {
      nombre: "Calibradora 6 linhas x 12 saídas (manga, pimentão, abacate)",
      nombreCorto: "Calibrador · 6 linhas x 12 saídas",
      resumenTarjeta: "Capacidade 1.9 ton/linha por hora",
      pasoCopita: "Bandeja 6\"",
    },
  },
  "linea-tomate-roma-bola": {
    en: {
      nombre: "Roma/Round Tomato Line — 2-Line Sorter x 12 Outlets",
      nombreCorto: "Sorter · 2 lines x 12 outlets",
      resumenTarjeta: "Capacity 7.2 ton/line",
      pasoCopita: "Roller 3¾\"",
    },
    pt: {
      nombre: "Linha tomate Roma / caqui — Calibradora 2 linhas x 12 saídas",
      nombreCorto: "Calibrador · 2 linhas x 12 saídas",
      resumenTarjeta: "Capacidade 7.2 ton/linha",
      pasoCopita: "Rolo 3¾\"",
    },
  },
  "clasificadora-4x12-morron-mango-aguacate": {
    en: {
      nombre: "Bell Pepper, Mango, Onion & Avocado Sorter — 4 Lines x 12 Outlets",
      nombreCorto: "Sorter · 4 lines x 12 outlets",
      resumenTarjeta: "Like new · 1 season of use",
      pasoCopita: "Roller 4½\" (weight)",
    },
    pt: {
      nombre: "Calibradora pimentão, manga, cebola e abacate — 4 linhas x 12 saídas",
      nombreCorto: "Calibrador · 4 linhas x 12 saídas",
      resumenTarjeta: "Seminova · 1 temporada de uso",
      pasoCopita: "Rolo 4½\" (com peso)",
    },
  },
  "volteadora-bins-rochin": {
    en: {
      nombre: "Rochin Bin Tipper",
      nombreCorto: "Bin tipper",
      resumenTarjeta: "All stainless steel",
    },
    pt: {
      nombre: "Tombador de bins Rochin",
      nombreCorto: "Tombador de bins",
      resumenTarjeta: "Todo em aço inoxidável",
    },
  },
  "clasificadora-pepino-2x7": {
    en: {
      nombre: "Cucumber Sorter — 2 Lines x 7 Outlets",
      nombreCorto: "Sorter · 2 lines x 7 outlets",
      resumenTarjeta: "Capacity ~4.4 ton/hr",
      pasoCopita: "Special 6\" tray",
    },
    pt: {
      nombre: "Calibradora de pepino — 2 linhas x 7 saídas",
      nombreCorto: "Calibrador · 2 linhas x 7 saídas",
      resumenTarjeta: "Capacidade ~4.4 ton/h",
      pasoCopita: "Bandeja 6\" especial",
    },
  },
  "linea-tomate-roma-4x24": {
    en: {
      nombre: "Complete Roma Tomato Line — 4-Line Sorter x 24 Outlets",
      nombreCorto: "Sorter · 4 lines x 24 outlets",
      resumenTarjeta: "Sorts by size and color, Android control",
      pasoCopita: "Clip 3¾\"",
    },
    pt: {
      nombre: "Linha completa para tomate Roma — Calibradora 4 linhas x 24 saídas",
      nombreCorto: "Calibrador · 4 linhas x 24 saídas",
      resumenTarjeta: "Classifica por tamanho e cor, controle por Android",
      pasoCopita: "Clip 3¾\"",
    },
  },
};

export function traducirProducto<T extends CamposTraducibles & { slug: string }>(producto: T, lang: Lang): T {
  if (lang === "es") return producto;
  const t = TRADUCCION_PRODUCTOS[producto.slug]?.[lang];
  if (!t) return producto;
  return { ...producto, ...t };
}

const FRUTA_EN: Record<string, string> = {
  tomate: "Tomato",
  "chile morrón": "Bell pepper",
  pepino: "Cucumber",
  cítricos: "Citrus",
  mango: "Mango",
  aguacate: "Avocado",
  cebolla: "Onion",
  papa: "Potato",
  "chile jalapeño": "Jalapeño",
  "chile rojo": "Red chili",
};

const FRUTA_PT: Record<string, string> = {
  tomate: "Tomate",
  "chile morrón": "Pimentão",
  pepino: "Pepino",
  cítricos: "Cítricos",
  mango: "Manga",
  aguacate: "Abacate",
  cebolla: "Cebola",
  papa: "Batata",
  "chile jalapeño": "Jalapeño",
  "chile rojo": "Chile vermelho",
};

/** Traduce el nombre de una fruta para mostrarla — el valor interno (para filtros) se queda igual. */
export function traducirFruta(fruta: string, lang: Lang): string {
  if (lang === "en") return FRUTA_EN[fruta] ?? fruta;
  if (lang === "pt") return FRUTA_PT[fruta] ?? fruta;
  return fruta[0].toUpperCase() + fruta.slice(1);
}

const CATEGORIA_EN: Record<string, string> = {
  "Líneas de empaque usadas": "Used packing lines",
  "Materiales de embalaje": "Packing materials",
  Servicios: "Services",
};

const CATEGORIA_PT: Record<string, string> = {
  "Líneas de empaque usadas": "Linhas de embalagem usadas",
  "Materiales de embalaje": "Materiais de embalagem",
  Servicios: "Serviços",
};

export function traducirCategoria(categoria: string, lang: Lang): string {
  if (lang === "en") return CATEGORIA_EN[categoria] ?? categoria;
  if (lang === "pt") return CATEGORIA_PT[categoria] ?? categoria;
  return categoria;
}
