"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { LogoChico } from "@/components/catalogo/LogoChico";
import { FormularioEmpaque } from "@/components/catalogo/FormularioEmpaque";
import { useLang } from "@/lib/i18n";

/** Página completa de "Personaliza tu máquina": las 10 preguntas del empaque. */
export default function Personaliza() {
  const { t } = useLang();

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-marca">
          <Icon name="lucide:arrow-left" size={16} /> {t("volverAlCatalogo")}
        </Link>
        <LogoChico className="h-10 w-10 shrink-0 rounded-full object-cover" />
      </div>

      <header className="mb-8 text-center">
        <span className="chip mb-4">
          <Icon name="fluent-emoji-flat:triangular-ruler" size={16} /> {t("tabPersonalizadas")}
        </span>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t("personalizadasTitulo")}</h1>
        <p className="mt-3 text-lg text-ink-soft">{t("personalizadasSubtitulo")}</p>
      </header>

      <FormularioEmpaque />
    </main>
  );
}
