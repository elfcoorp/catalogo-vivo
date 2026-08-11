"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { LogoChico } from "@/components/catalogo/LogoChico";
import { CONFIG } from "@/lib/config";
import { linkWhatsApp } from "@/lib/whatsapp";

/** "¿Tienes una máquina parada? Nosotros te la vendemos" — formulario corto a WhatsApp. */
export default function VenderMaquina() {
  const [maquina, setMaquina] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const mensaje = [
    "Hola, tengo una máquina que quiero vender con ELFCO.",
    maquina && `Qué es: ${maquina}`,
    whatsapp && `Mi WhatsApp: ${whatsapp}`,
    "(Voy a mandar las fotos aquí mismo por WhatsApp.)",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-marca">
          <Icon name="lucide:arrow-left" size={16} /> Volver al catálogo
        </Link>
        <LogoChico className="h-10 w-10 shrink-0 rounded-full object-cover" />
      </div>

      <header className="mb-8">
        <span className="chip mb-3">
          <Icon name="fluent-emoji-flat:handshake" size={16} /> Vende tu máquina
        </span>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">¿Tienes una máquina parada?</h1>
        <p className="mt-3 max-w-xl text-lg text-ink-soft">Nosotros te la vendemos. Cuéntanos qué es y te contactamos por WhatsApp.</p>
      </header>

      <div className="card flex flex-col gap-5 p-6">
        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          ¿Qué máquina es?
          <textarea
            value={maquina}
            onChange={(e) => setMaquina(e.target.value)}
            rows={3}
            placeholder="Ej. Calibrador de tomate, 4 líneas x 12 salidas, marca CIU…"
            className="rounded-xl border border-line-strong bg-bg-2 p-3 text-base font-normal text-ink outline-none focus:border-marca"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Tu WhatsApp
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Ej. 644 123 4567"
            className="rounded-xl border border-line-strong bg-bg-2 p-3 text-base font-normal text-ink outline-none focus:border-marca"
          />
        </label>

        <p className="text-sm text-ink-mute">Las fotos las mandas directo por WhatsApp, junto con este mensaje.</p>

        <a
          href={linkWhatsApp(CONFIG.marca.whatsappPrincipal, mensaje)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-marca btn-wa"
        >
          <Icon name="logos:whatsapp-icon" size={20} /> Enviar por WhatsApp
        </a>
      </div>
    </main>
  );
}
