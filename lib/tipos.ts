/**
 * Tipos del Catálogo Vivo.
 * Todo lo que el alumno personaliza vive en `lib/config.ts` y `lib/productos.ts`
 * y usa estos tipos. No hay base de datos: el catálogo es datos + imágenes.
 */

/** Un vendedor de tu equipo. Cada uno comparte su liga: `?v=<slug>`. */
export interface Vendedor {
  /** Identificador para la liga, sin espacios ni acentos (ej. "juan"). */
  slug: string;
  /** Nombre visible (ej. "Juan Pérez"). */
  nombre: string;
  /** WhatsApp en formato internacional, solo números (ej. "5213312345678"). */
  whatsapp: string;
  /** Puesto o zona (opcional, ej. "Ventas Norte"). */
  puesto?: string;
}

/** La identidad de tu negocio: se aplica a todo el catálogo. */
export interface Marca {
  /** Nombre del negocio. */
  negocio: string;
  /** Una línea que dice qué haces y para quién. */
  descripcion: string;
  /** Ruta del logo en /public (ej. "/logo.png"). Si no hay, se usa el nombre. */
  logo?: string;
  /** Color principal de tu marca (hex). */
  primario: string;
  /** Color secundario/acento (hex). */
  secundario: string;
  /** Fondo del catálogo. */
  fondo: "claro" | "oscuro";
  /** WhatsApp principal del negocio (cuando la visita no trae vendedor). */
  whatsappPrincipal: string;
  /** Ciudad (opcional, aparece en el pie). */
  ciudad?: string;
  /** Liga de Instagram o web (opcional). */
  enlace?: string;
}

/** Una promoción o bono activo (aplica a un producto). */
export interface Escasez {
  /** Por tiempo (una fecha límite) o por unidades (cuántas quedan). */
  tipo: "tiempo" | "unidades";
  /** El texto: "hasta el domingo" o "8 piezas". */
  valor: string;
}

/**
 * Un producto o servicio. La estructura sigue la "anatomía del que vende"
 * (investigación HBR / MIT Sloan / libros de ventas — ver CLAUDE.md):
 * foto clara, para quién es, beneficio antes que característica, 3 datos,
 * precio con ancla, bono, garantía, escasez honesta, prueba.
 */
export interface Producto {
  /** Identificador para la liga de la ficha (ej. "vela-cafe"). */
  slug: string;
  /** Nombre del producto o servicio. */
  nombre: string;
  /** Categoría (debe existir en config.categorias). */
  categoria: string;
  /** Ruta de la foto en /public (ej. "/productos/vela.jpg"). */
  imagen?: string;
  /** Fotos extra para la ficha del producto (además de `imagen`). Opcional. */
  galeria?: string[];
  /** Ruta del video en /public (ej. "/videos/tu-video.mp4"). Opcional. */
  video?: string;
  /**
   * Para quién es y qué "trabajo" le resuelve (Jobs-to-be-done, Christensen).
   * Ej.: "Para el que quiere un regalo que se vea caro sin gastar de más".
   */
  paraQuien: string;
  /** El beneficio principal, en resultado, no en característica (StoryBrand). */
  beneficio: string;
  /** Máximo 3 datos que SÍ importan (choice overload, Iyengar). */
  caracteristicas: string[];
  /** Precio actual, ya con símbolo (ej. "$450"). */
  precio: string;
  /** Precio antes / de lista, para anclar (Ariely). Opcional. */
  precioAntes?: string;
  /** Facilidades de pago (ej. "o 3 pagos de $150"). Opcional. */
  facilidades?: string;
  /** El bono / lo que incluye además (Hormozi). Opcional. */
  bono?: string;
  /** Garantía por escrito: quita el miedo a comprar (Hormozi). Opcional. */
  garantia?: string;
  /** Escasez honesta, por tiempo o unidades (Cialdini). Opcional. */
  escasez?: Escasez;
  /** La prueba: testimonio, número o marca (prueba social). Opcional. */
  prueba?: string;
  /** Marca el producto estrella de su categoría ("el más vendido"). */
  destacado?: boolean;
  /**
   * Ficha técnica estilo fabricante (dimensiones, potencia, capacidad, peso, etc.)
   * para el comprador técnico que quiere verificar datos duros. Opcional — aparece
   * como sección aparte, no cuenta contra el máximo de 3 `caracteristicas`.
   */
  fichaTecnica?: { etiqueta: string; valor: string }[];
  /**
   * Plano ELFCO de la máquina (imagen en /public/planos, con marca de agua).
   * Se muestra solo para ver en la ficha; el plano completo lo manda el vendedor
   * cuando el cliente ya va en serio. Opcional.
   */
  plano?: string;
}

/** La configuración completa del catálogo. */
export interface Config {
  marca: Marca;
  vendedores: Vendedor[];
  /** Orden en que se muestran las categorías. */
  categorias: string[];
  /**
   * Plantilla del mensaje de WhatsApp. Usa {saludo} y {producto}.
   * Ej.: "{saludo}me interesa {producto}. ¿Me pueden dar más información?"
   */
  mensajePlantilla: string;
}
