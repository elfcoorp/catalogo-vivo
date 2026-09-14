"use client";
/**
 * QUIÉN ABRIÓ EL CATÁLOGO — el lado del navegador.
 *
 * Si la dirección trae ?c=abc123 (la clave que Eduardo le puso a la liga de
 * ese contacto), la guarda en el navegador y la manda a /api/abrio junto con
 * la página. Después, cada ficha que abra esa misma persona se sigue
 * apuntando, porque la clave ya quedó guardada.
 *
 * La clave se BORRA de la barra de direcciones en cuanto se lee. Si no, cuando
 * Rubén le reenvía la liga a un amigo, las visitas del amigo se contarían
 * como de Rubén. Así sólo cuenta el primer salto.
 *
 * No hace nada visible. Si algo falla (sin localStorage, sin red), se calla.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const LLAVE = "elfco-clave";
const CLAVE = /^[a-z0-9]{4,8}$/i;

export function Huella() {
  const ruta = usePathname();

  useEffect(() => {
    let c: string | null = null;
    try {
      const u = new URL(window.location.href);
      const q = u.searchParams.get("c");
      if (q && CLAVE.test(q)) {
        c = q.toLowerCase();
        localStorage.setItem(LLAVE, c);
        u.searchParams.delete("c");
        window.history.replaceState(null, "", u.pathname + u.search + u.hash);
      } else {
        c = localStorage.getItem(LLAVE);
      }
    } catch {
      c = null;
    }
    if (!c) return;

    fetch("/api/abrio", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ c, ruta }),
      keepalive: true,
    }).catch(() => {});
  }, [ruta]);

  return null;
}
