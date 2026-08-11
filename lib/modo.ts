/** Versión B (doc sección 12): liga con ?modo=tecnico oculta todo botón/liga de WhatsApp. */
export function esModoTecnico(valor?: string | null): boolean {
  return valor === "tecnico";
}
