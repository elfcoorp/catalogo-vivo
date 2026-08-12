"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { LogoChico } from "@/components/catalogo/LogoChico";
import { Planeador } from "@/components/catalogo/Planeador";
import { useLang } from "@/lib/i18n";

/** "¿Cabe en tu empaque?" — el levantamiento visual, antes de cotizar. */
export default function PaginaPlaneador() {
  const { t } = useLang();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-marca">
          <Icon name="lucide:arrow-left" size={16} /> {t("volverAlCatalogo")}
        </Link>
        <LogoChico className="h-10 w-10 shrink-0 rounded-full object-cover" />
      </div>

      <header className="mb-8">
        <span className="chip mb-4">
          <Icon name="fluent-emoji-flat:straight-ruler" size={16} /> {t("planeador")}
        </span>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t("planeadorTitulo")}</h1>
        <p className="mt-3 text-lg text-ink-soft">{t("planeadorSubtitulo")}</p>
      </header>

      <Planeador />
    </main>
  );
}
