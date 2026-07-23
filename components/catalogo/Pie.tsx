import Link from "next/link";
import { CONFIG } from "@/lib/config";

/** Pie del catálogo. El crédito discreto ayuda a que otros pidan el suyo. */
export function Pie() {
  return (
    <footer className="border-t border-line py-10 text-center text-sm text-ink-mute">
      <p className="font-medium text-ink-soft">{CONFIG.marca.negocio}</p>
      {CONFIG.marca.ciudad && <p className="mt-1">{CONFIG.marca.ciudad}</p>}
      <p className="mt-4 no-print">
        <Link href="/vendedores" className="hover:text-marca">
          Kit para vendedores
        </Link>
        {"  ·  "}
        Hecho con <span className="font-semibold text-ink-soft">Catálogo Vivo</span>
      </p>
    </footer>
  );
}
