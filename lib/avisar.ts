/**
 * AVISAR QUÉ HIZO LA PERSONA EN EL CATÁLOGO.
 *
 * Hasta el 22 de septiembre de 2026 sólo se apuntaba que alguien ABRIÓ una
 * página. Eduardo pidió saber también cuándo descargan el PDF y cuándo
 * comparten la liga, y tiene razón en que eso vale más:
 *
 *   · el que mira, anda paseando;
 *   · el que DESCARGA el PDF es porque se lo va a enseñar a alguien;
 *   · el que COMPARTE la liga ya te la está moviendo adentro de su empresa.
 *
 * Usa la misma clave que dejó la liga de WhatsApp (?c=), que Huella.tsx
 * guardó en el navegador. Si no hay clave, no manda nada y se calla.
 *
 * NO se guarda a quién se lo mandó: cuando la persona pica compartir, el
 * teléfono abre su propio menú y de ahí en adelante es asunto suyo.
 */

const LLAVE = "elfco-clave";

export type Accion = "descargo" | "compartio";

/** Manda el aviso. Nunca truena ni interrumpe: si falla, se queda callado. */
export function avisar(accion: Accion, detalle?: string) {
  try {
    const c = localStorage.getItem(LLAVE);
    if (!c) return;
    fetch("/api/abrio", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        c,
        ruta: window.location.pathname,
        accion,
        detalle: (detalle ?? "").slice(0, 80),
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* sin localStorage o sin red: no pasa nada, el botón sigue funcionando */
  }
}
