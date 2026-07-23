import type { Config } from "./tipos";

// Configuración generada con el wizard (/configurar).
export const CONFIG: Config = {
  marca: {
    negocio: "elfco",
    descripcion: "Soluciones Agroindustria en los empaques de exportación de frutas y verduras",
    logo: "/logo.png",
    primario: "#31502e",
    secundario: "#66a73d",
    fondo: "claro",
    whatsappPrincipal: "524521300840",
    ciudad: "Ciudad Obregón",
    enlace: "elfcoorp",
  },
  vendedores: [
    { slug: "araceli", nombre: "Araceli Castillon", whatsapp: "5216221453333" },
  ],
  categorias: ["Líneas de empaque usadas", "Materiales de embalaje", "Servicios"],
  mensajePlantilla:
    "{saludo}vi tu catálogo y me interesa {producto}. ¿Me pueden dar más información y precio?",
};
