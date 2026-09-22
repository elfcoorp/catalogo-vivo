/**
 * LO QUE CADA QUIEN YA VIO.
 *
 * Eduardo lo pidió el 22 de septiembre de 2026: que el catálogo no siempre
 * abra igual, sino acomodado a lo que esa persona ha estado viendo. Sus
 * palabras: "que esa persona pueda seguir viendo lo que le está picando".
 *
 * Se guarda EN EL NAVEGADOR DE LA PERSONA, no en el servidor. Dos razones:
 *
 *   1. Es instantáneo: la portada se acomoda antes de que cargue nada.
 *   2. No hace falta saber quién es. Funciona aunque haya entrado sin liga.
 *
 * Lo que se guarda es nada más la lista de máquinas que abrió, la última
 * primero. Ni nombre, ni teléfono, ni nada de la persona.
 */

const LLAVE = "elfco-visto";
const CUANTAS = 6;

/** Apunta que abrió esta máquina. La más reciente queda al frente. */
export function apuntarVisto(slug: string) {
  if (!slug) return;
  try {
    const antes = leerVistos().filter((s) => s !== slug);
    localStorage.setItem(LLAVE, JSON.stringify([slug, ...antes].slice(0, CUANTAS)));
  } catch {
    /* sin localStorage: el catálogo funciona igual, nomás no se acomoda */
  }
}

/** Las máquinas que ya abrió, de la más reciente a la más vieja. */
export function leerVistos(): string[] {
  try {
    const crudo = localStorage.getItem(LLAVE);
    if (!crudo) return [];
    const lista: unknown = JSON.parse(crudo);
    return Array.isArray(lista) ? lista.filter((s) => typeof s === "string").slice(0, CUANTAS) : [];
  } catch {
    return [];
  }
}

/** Si la ruta es la ficha de una máquina, devuelve su slug. */
export function slugDeRuta(ruta: string): string {
  const m = /^\/producto\/([^/?#]+)/.exec(ruta || "");
  return m ? m[1] : "";
}
