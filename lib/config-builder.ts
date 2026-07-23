/** Utilidades del wizard: generan el texto de `lib/config.ts` sin que el alumno escriba código. */

/** Convierte un nombre en un identificador para la liga: "Juan Pérez" → "juan". */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .toLowerCase()
    .trim()
    .split(/\s+/)[0] // primer nombre
    .replace(/[^a-z0-9]/g, "");
}

/** Deja solo números en un teléfono. */
export function soloNumeros(numero: string): string {
  return numero.replace(/[^0-9]/g, "");
}

interface DatosConfig {
  negocio: string;
  descripcion: string;
  ciudad: string;
  enlace: string;
  whatsapp: string;
  primario: string;
  secundario: string;
  fondo: "claro" | "oscuro";
  vendedores: { nombre: string; whatsapp: string }[];
}

/** Serializa un valor de texto de forma segura para pegarlo en el archivo. */
function s(valor: string): string {
  return JSON.stringify(valor ?? "");
}

/**
 * Prompt COMPLETO listo para pegar en Claude Code / Cowork: incluye el link del
 * repo (para que lo descargue) + la configuración generada. Una sola cosa que copiar.
 */
export function generarPromptPegar(d: DatosConfig): string {
  return `Descarga el proyecto de https://github.com/m4nueldeleon/catalogo-vivo y ayúdame a configurar mi Catálogo Vivo para mi negocio, siguiendo el CLAUDE.md.

Para empezar, reemplaza el contenido de lib/config.ts con esto:

${generarConfigTS(d)}`;
}

/** Genera el contenido completo de `lib/config.ts` con los datos del wizard. */
export function generarConfigTS(d: DatosConfig): string {
  const whatsappPrincipal = soloNumeros(d.whatsapp) || "5213300000000";

  const usados = new Set<string>();
  const vendedores = d.vendedores
    .filter((v) => v.nombre.trim())
    .map((v) => {
      let slug = slugify(v.nombre) || "vendedor";
      while (usados.has(slug)) slug += "2";
      usados.add(slug);
      const wa = soloNumeros(v.whatsapp) || whatsappPrincipal;
      return `    { slug: ${s(slug)}, nombre: ${s(v.nombre)}, whatsapp: ${s(wa)} },`;
    })
    .join("\n");

  const vendedoresBloque =
    vendedores ||
    `    { slug: "tienda", nombre: ${s(d.negocio)}, whatsapp: ${s(whatsappPrincipal)} },`;

  return `import type { Config } from "./tipos";

// Configuración generada con el wizard (/configurar).
export const CONFIG: Config = {
  marca: {
    negocio: ${s(d.negocio)},
    descripcion: ${s(d.descripcion)},
    logo: undefined, // pon "/logo.png" cuando subas tu logo a la carpeta public
    primario: ${s(d.primario)},
    secundario: ${s(d.secundario)},
    fondo: ${s(d.fondo)},
    whatsappPrincipal: ${s(whatsappPrincipal)},
    ciudad: ${s(d.ciudad)},
    enlace: ${s(d.enlace)},
  },
  vendedores: [
${vendedoresBloque}
  ],
  categorias: ["Para tu casa", "Talleres", "Servicios"],
  mensajePlantilla:
    "{saludo}vi tu catálogo y me interesa {producto}. ¿Me pueden dar más información y precio?",
};
`;
}
