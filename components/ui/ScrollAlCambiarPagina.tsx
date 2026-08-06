"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Al entrar a una ficha nueva (o volver al catálogo), sube la página
 * hasta arriba. Sin esto, `scroll-behavior: smooth` (globals.css) a veces
 * deja la página a medio scroll tras dar clic en una tarjeta.
 */
export function ScrollAlCambiarPagina() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
