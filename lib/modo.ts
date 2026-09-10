/** Versión B (doc sección 12): liga con ?modo=tecnico oculta todo botón/liga de WhatsApp. */
export function esModoTecnico(valor?: string | null): boolean {
  return valor === "tecnico";
}

/**
 * MODO DUEÑO — la liga privada de Eduardo: ?modo=dueno
 *
 * Sin esto, quien entre al catálogo ve NADA MÁS el catálogo. El menú no le
 * muestra el planeador, ni personaliza, ni vende tu máquina, ni el kit de
 * vendedores. Lo pidió Eduardo el 10 de septiembre de 2026: no quiere gente
 * de fuera husmeando sus herramientas.
 *
 * Las páginas siguen existiendo — esto solo esconde las entradas del menú.
 * Es un candado de puerta, no de caja fuerte: si alguien adivina la dirección
 * exacta, entra. Para lo de hoy alcanza, porque ahí no hay datos de clientes.
 */
export function esModoDueno(valor?: string | null): boolean {
  return valor === "dueno";
}
