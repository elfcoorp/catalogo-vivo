import type { Config, Producto, Vendedor } from "./tipos";

/**
 * Arma el mensaje predefinido de WhatsApp.
 * Si viene un vendedor referido, el saludo lo nombra ("Hola Juan, ...").
 */
export function construirMensaje(
  plantilla: string,
  producto: string,
  vendedor?: string
): string {
  const saludo = vendedor ? `Hola ${vendedor}, ` : "Hola, ";
  return plantilla.replaceAll("{saludo}", saludo).replaceAll("{producto}", producto);
}

/** Deja solo números (por si el alumno pega el número con espacios o "+"). */
export function soloNumeros(numero: string): string {
  return numero.replace(/[^0-9]/g, "");
}

/** Construye la liga wa.me con el mensaje ya codificado. */
export function linkWhatsApp(numero: string, mensaje: string): string {
  return `https://wa.me/${soloNumeros(numero)}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Decide a qué número va el botón "Lo quiero":
 * al del vendedor referido (si la liga trae ?v=slug y ese vendedor existe),
 * o al número principal del negocio.
 */
export function resolverVendedor(
  config: Config,
  vendedorSlug?: string | null
): Vendedor | null {
  if (!vendedorSlug) return null;
  return config.vendedores.find((v) => v.slug === vendedorSlug) ?? null;
}

/** La liga final de "Lo quiero" para un producto, respetando el vendedor referido. */
export function linkLoQuiero(
  config: Config,
  producto: Producto,
  vendedorSlug?: string | null
): string {
  const vendedor = resolverVendedor(config, vendedorSlug);
  const numero = vendedor ? vendedor.whatsapp : config.marca.whatsappPrincipal;
  const mensaje = construirMensaje(
    config.mensajePlantilla,
    producto.nombre,
    vendedor?.nombre.split(" ")[0]
  );
  return linkWhatsApp(numero, mensaje);
}
