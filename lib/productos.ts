import type { Producto } from "./tipos";

/**
 * ================================================================
 *  TUS PRODUCTOS O SERVICIOS.
 *  Cada ficha sigue la "anatomía del que vende" (ver CLAUDE.md):
 *   paraQuien  → el trabajo que resuelve (Christensen, HBR 2005)
 *   beneficio  → resultado, no característica (StoryBrand)
 *   caracteristicas → SOLO 3 que importan (Iyengar, las mermeladas)
 *   precioAntes → ancla (Ariely) · facilidades → quita el miedo al gasto
 *   bono       → la oferta apilada (Hormozi)
 *   escasez    → honesta, por tiempo o unidades (Cialdini)
 *   prueba     → prueba social (Cialdini)
 * ================================================================
 */
export const PRODUCTOS: Producto[] = [
  {
    slug: "linea-tomate-grape-4x12",
    nombre: "Línea tomate grape 4x12",
    categoria: "Líneas de empaque usadas",
    imagen: "/productos/tomate-grape-4x12.jpg",
    galeria: [
      "/productos/tomate-grape-4x12-detalle-1.jpg",
      "/productos/tomate-grape-4x12-detalle-2.jpg",
      "/productos/tomate-grape-4x12-detalle-3.jpg",
      "/productos/tomate-grape-4x12-detalle-4.jpg",
      "/productos/tomate-grape-4x12-detalle-5.jpg",
    ],
    paraQuien:
      "Empacadoras de tomate grape que siguen clasificando a mano o con línea limitada, y quieren capacidad industrial sin pagar precio de nueva, ni tener que maquillar su fruta en otro empaque por mal cálculo de producción.",
    beneficio:
      "Clasifica por diámetro y color automáticamente; rehabilitada con software actualizado.",
    caracteristicas: ["Marca CIU · 4 líneas x 12 salidas", "Capacidad 450 kg/línea/hora", "Software actualizado"],
    precio: "$2,700,000 MXN + IVA",
    facilidades: "Pago de contado antes de embarque. No incluye instalación.",
    bono: "Te conectamos con técnico especializado para instalación.",
    destacado: true,
    fichaTecnica: [
      { etiqueta: "Paso de rodillo", valor: "1¼\"" },
      { etiqueta: "Velocidad", valor: "Hasta 25 rodillos por segundo" },
      { etiqueta: "Capacidad", valor: "450 kg/hora por línea" },
      { etiqueta: "Clasifica por", valor: "Medida, color y forma" },
      { etiqueta: "Rango de medida", valor: "15-29 mm" },
    ],
    garantia: "Puedes venir a probar la máquina, previa cita. La subimos a tus camiones antes del pago — hasta que la veas cargada y lista, depositas y te la llevas.",
  },
  {
    slug: "linea-citricos",
    nombre: "Línea completa para cítricos",
    categoria: "Líneas de empaque usadas",
    imagen: "/productos/citricos.jpg",
    galeria: [
      "/productos/citricos-detalle-1.jpg",
      "/productos/citricos-detalle-2.jpg",
      "/productos/citricos-detalle-3.jpg",
      "/productos/citricos-detalle-4.jpg",
      "/productos/citricos-detalle-5.jpg",
      "/productos/citricos-detalle-6.jpg",
    ],
    paraQuien:
      "Empacadoras de cítricos que buscan una línea completa (selección, lavado, encerado y calibrado) en acero inoxidable, sin pagar precio de una línea nueva instalada.",
    beneficio:
      "Volteadora de bins, descanicador, 2 mesas de selección manual, 2 cepilladoras de lavado/encerado, 2 secadoras de cera (gas LP) y calibrador de tubos ajustables. Semi-nueva, con solo 1 temporada de uso.",
    caracteristicas: ["Marca SIAI · Todo en acero inoxidable", "Calibrador de tubos ajustables", "Semi-nueva · Solo 1 temporada de uso"],
    precio: "$4,500,000 MXN + IVA",
    facilidades: "Pago de contado antes de embarque. Sin instalar.",
    fichaTecnica: [
      { etiqueta: "Clasifica por", valor: "Primera y segunda calidad (en las mesas de selección manual)" },
      { etiqueta: "Volteadora de bins (ancho)", valor: "51\" · 450 kg/minuto" },
      { etiqueta: "Selección manual", valor: "1.7 x 4 m" },
      { etiqueta: "Descanicador fijo", valor: "1.8 x 2.5 m" },
      { etiqueta: "Cepilladora de lavado", valor: "1.5 x 4.8 m" },
      { etiqueta: "Secado de lavado", valor: "1.5 x 4 m y 1.5 x 4.47 m" },
      { etiqueta: "Cepilladora de encerado", valor: "1.5 x 2.23 m" },
      { etiqueta: "Secado de encerado", valor: "1.5 x 7.4 m" },
      { etiqueta: "Selección manual (jugo)", valor: "1.5 x 6 m" },
      { etiqueta: "Calibrador de tubos", valor: "2 x 6.2 m" },
      { etiqueta: "Bandas distribuidoras", valor: "0.92 x 16.1 m y 0.92 x 7.85 m" },
    ],
    garantia: "Puedes venir a probar la máquina, previa cita. La subimos a tus camiones antes del pago — hasta que la veas cargada y lista, depositas y te la llevas.",
  },
  {
    slug: "clasificadora-6-lineas",
    nombre: "Clasificadora 6 líneas x 12 salidas (mango, chile morrón, aguacate)",
    categoria: "Líneas de empaque usadas",
    imagen: "/productos/clasificadora-6-lineas.jpg",
    galeria: [
      "/productos/clasificadora-6-lineas-detalle-1.jpg",
      "/productos/clasificadora-6-lineas-detalle-2.jpg",
      "/productos/clasificadora-6-lineas-detalle-3.jpg",
      "/productos/clasificadora-6-lineas-detalle-4.jpg",
      "/productos/clasificadora-6-lineas-detalle-5.jpg",
      "/productos/clasificadora-6-lineas-detalle-6.jpg",
    ],
    paraQuien:
      "Empacadoras de mango, chile morrón o aguacate que clasifican a mano y quieren pasar a clasificación automática por peso, sin pagar precio de una nueva.",
    beneficio:
      "Clasifica por peso con singulador de cepillos; motor, cadenas, cableado y sistema de pesaje nuevos.",
    caracteristicas: ["Marca CIU · 6 líneas x 12 salidas x 1 de error", "Capacidad 2.5 ton/línea", "Pintura electrostática nueva (gris)"],
    precio: "$1,500,000 MXN",
    facilidades: "Pago de contado antes de embarque. Sin instalación.",
    bono: "Incluye caseta de vigilancia.",
    fichaTecnica: [
      { etiqueta: "Tipo", valor: "Clasificadora de charolas 7½\"" },
      { etiqueta: "Acabado", valor: "Pintura electrostática nueva, color gris" },
      { etiqueta: "Velocidad", valor: "3 tazas por segundo (equipo usado; nueva corre ~4.5)" },
      { etiqueta: "Capacidad", valor: "2.5 ton/línea" },
      { etiqueta: "Clasifica por", valor: "Solo medida" },
      { etiqueta: "Rango de medida", valor: "85-150 mm" },
    ],
    garantia: "Puedes venir a probar la máquina, previa cita. La subimos a tus camiones antes del pago — hasta que la veas cargada y lista, depositas y te la llevas.",
  },
  {
    slug: "linea-tomate-roma-bola",
    nombre: "Línea tomate roma / bola — Clasificadora 2 líneas x 12 salidas",
    categoria: "Líneas de empaque usadas",
    imagen: "/productos/tomate-roma-bola.jpg",
    galeria: [
      "/productos/tomate-roma-bola-detalle-1.jpg",
      "/productos/tomate-roma-bola-detalle-2.jpg",
      "/productos/tomate-roma-bola-detalle-3.jpg",
      "/productos/tomate-roma-bola-detalle-4.jpg",
      "/productos/tomate-roma-bola-detalle-5.jpg",
      "/productos/tomate-roma-bola-detalle-6.jpg",
    ],
    paraQuien:
      "Empacadoras de tomate roma o bola que necesitan clasificar por tamaño y color con capacidad de expansión, sin comprar una línea nueva.",
    beneficio:
      "Clasifica por tamaño y color; incluye singulador, cepilladora, elevador con base para caja llena y bancos para cajas ya empacadas.",
    caracteristicas: ["Marca CIU · 2 líneas x 12 salidas (expandible)", "Capacidad 7.2 ton/línea", "Incluye elevador y bancos de descanso"],
    precio: "$1,300,000 MXN",
    fichaTecnica: [
      { etiqueta: "Paso de rodillo", valor: "3¾\" (sin peso)" },
      { etiqueta: "Velocidad", valor: "Hasta 12 rodillos por segundo" },
      { etiqueta: "Capacidad", valor: "~7.2 ton/hora por línea (ajustado a fruta de 280 g, 60% de llenado)" },
      { etiqueta: "Clasifica por", valor: "Medida, color y forma" },
      { etiqueta: "Rango de medida", valor: "54-86 mm" },
    ],
    garantia: "Puedes venir a probar la máquina, previa cita. La subimos a tus camiones antes del pago — hasta que la veas cargada y lista, depositas y te la llevas.",
  },
  {
    slug: "clasificadora-4x12-morron-mango-aguacate",
    nombre: "Clasificadora morrón, mango, cebolla y aguacate — 4 líneas x 12 salidas",
    categoria: "Líneas de empaque usadas",
    imagen: "/productos/clasificadora-4x12-morron-12.jpg",
    galeria: [
      "/productos/clasificadora-4x12-morron-1.jpg",
      "/productos/clasificadora-4x12-morron-3.jpg",
      "/productos/clasificadora-4x12-morron-7.jpg",
      "/productos/clasificadora-4x12-morron-6.jpg",
      "/productos/clasificadora-4x12-morron-11.jpg",
      "/productos/clasificadora-4x12-morron-8.jpg",
      "/productos/clasificadora-4x12-morron-9.jpg",
      "/productos/clasificadora-4x12-morron-4.jpg",
      "/productos/clasificadora-4x12-morron-2.jpg",
      "/productos/clasificadora-4x12-morron-5.jpg",
      "/productos/clasificadora-4x12-morron-10.jpg",
    ],
    paraQuien:
      "Empacadoras de chile morrón, mango, cebolla o aguacate que clasifican a mano y quieren pasar a clasificación automática por peso, sin pagar precio de una nueva.",
    beneficio:
      "Clasifica por peso; incluye elevador con mesa de selección manual (para sacar segunda calidad), 2 bandas de bajada para dirigir la fruta a un bin, básculas, transportadores de caja vacía y llena, y caseta de vigilancia.",
    caracteristicas: ["Marca CIU · 4 líneas x 12 salidas", "Semi-nueva · Solo 1 temporada de uso", "Incluye caseta de vigilancia"],
    precio: "$3,500,000 MXN",
    facilidades: "Incluye instalación en Sinaloa o Sonora (aplican restricciones; se revisa antes de autorizar).",
    fichaTecnica: [
      { etiqueta: "Paso de rodillo", valor: "4½\" (con peso)" },
      { etiqueta: "Velocidad", valor: "Hasta 9 rodillos por segundo" },
      { etiqueta: "Capacidad", valor: "8 ton/hora por línea (peso promedio 400 g por fruta)" },
      { etiqueta: "Clasifica por", valor: "Solo peso (sin cámaras: no clasifica color, defecto ni forma)" },
      { etiqueta: "Rango de medida", valor: "58-103 mm" },
    ],
    garantia: "Puedes venir a probar la máquina, previa cita. La subimos a tus camiones antes del pago — hasta que la veas cargada y lista, depositas y te la llevas.",
  },
];

/** Productos de una categoría, con el destacado primero. */
export function productosPorCategoria(categoria: string): Producto[] {
  return PRODUCTOS.filter((p) => p.categoria === categoria).sort(
    (a, b) => Number(b.destacado ?? false) - Number(a.destacado ?? false)
  );
}

/** Busca un producto por su slug (para la ficha individual). */
export function productoPorSlug(slug: string): Producto | undefined {
  return PRODUCTOS.find((p) => p.slug === slug);
}
