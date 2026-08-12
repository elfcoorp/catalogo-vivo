"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { CONFIG } from "@/lib/config";
import { useLang, BANDERA, NOMBRE_IDIOMA, type Lang } from "@/lib/i18n";

interface BarraSuperiorProps {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  modoTecnico?: boolean;
}

/** Barra fija arriba: logo, buscador (filtra en automático) y menú de opciones. */
const IDIOMAS: Lang[] = ["es", "en", "pt"];

export function BarraSuperior({ busqueda, onBusquedaChange, modoTecnico }: BarraSuperiorProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [ligaCopiada, setLigaCopiada] = useState(false);
  const { lang, setLang, t } = useLang();

  async function copiarLigaTecnicos() {
    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("modo", "tecnico");
      await navigator.clipboard.writeText(url.toString());
      setLigaCopiada(true);
      setTimeout(() => setLigaCopiada(false), 2000);
    } catch {
      /* sin portapapeles disponible */
    }
  }

  return (
    <div className="sticky top-0 z-40 border-b border-line bg-bg-2/90 backdrop-blur no-print">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CONFIG.marca.logo} alt={CONFIG.marca.negocio} className="h-9 w-9 rounded-full object-cover" />
        </Link>

        <div className="relative flex-1">
          <Icon
            name="lucide:search"
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder={t("buscar")}
            className="w-full rounded-full border border-line-strong bg-bg-2 py-2 pl-9 pr-3 text-sm outline-none focus:border-marca"
          />
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setLang(IDIOMAS[(IDIOMAS.indexOf(lang) + 1) % IDIOMAS.length])}
            className="btn-ghost !p-2.5 !text-base"
            aria-label={t("idioma")}
            title={NOMBRE_IDIOMA[lang]}
          >
            {BANDERA[lang]}
          </button>
        </div>

        <div className="relative shrink-0">
          {/* z-50 para que el boton quede ARRIBA de la capa que cierra el menu:
              si no, el dedo toca la capa y nunca al boton. */}
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            className="btn-ghost relative z-50 !p-2.5"
            aria-label={menuAbierto ? t("cerrarMenu") : t("masOpciones")}
            aria-expanded={menuAbierto}
          >
            <Icon name={menuAbierto ? "lucide:x" : "lucide:menu"} size={18} />
          </button>
          {menuAbierto && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuAbierto(false)} />
              <div
                className="absolute right-0 top-full z-50 mt-2 flex w-64 flex-col gap-1 rounded-2xl border border-line-strong p-2 shadow-2xl"
                style={{ background: "var(--bg-2)" }}
              >
                {!modoTecnico && (
                  <>
                    <Link
                      href="/vender"
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-soft hover:bg-bg hover:text-marca"
                    >
                      <Icon name="lucide:tag" size={16} /> {t("vendeTuMaquina")}
                    </Link>
                    <Link
                      href="/vendedores"
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-soft hover:bg-bg hover:text-marca"
                    >
                      <Icon name="lucide:users" size={16} /> {t("kitVendedores")}
                    </Link>
                    <button
                      onClick={copiarLigaTecnicos}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink-soft hover:bg-bg hover:text-marca"
                    >
                      <Icon name={ligaCopiada ? "lucide:check" : "lucide:shield"} size={16} />
                      {ligaCopiada ? t("ligaCopiada") : t("ligaTecnicos")}
                    </button>
                  </>
                )}
                {modoTecnico && (
                  <p className="px-3 py-2 text-xs text-ink-mute">{t("versionTecnicos")}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
