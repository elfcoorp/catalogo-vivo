"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { CONFIG } from "@/lib/config";
import { linkWhatsApp } from "@/lib/whatsapp";

/**
 * Kit para el equipo (social selling — Hughes 2022): cada vendedor tiene su
 * propia liga (?v=slug). Cuando el cliente da "Lo quiero", el WhatsApp abre
 * con SU número. Aquí cada quien copia su liga y su mensaje ya escrito.
 */
export default function Vendedores() {
  const [origin, setOrigin] = useState("");
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function copiar(texto: string, id: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      /* sin portapapeles */
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-12">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-marca">
        <Icon name="lucide:arrow-left" size={16} /> Volver al catálogo
      </Link>

      <header className="mb-10">
        <span className="chip mb-3">
          <Icon name="fluent-emoji-flat:handshake" size={16} /> Kit para tu equipo
        </span>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">La liga de cada vendedor</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Cada quien comparte su liga. Cuando el cliente da &ldquo;Lo quiero&rdquo;, la conversación
          de WhatsApp llega directo a esa persona, con el mensaje ya escrito. Pégala en la bio de
          Instagram, en tus estados de WhatsApp, en grupos y en tu firma de correo.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {CONFIG.vendedores.map((vend) => {
          const liga = `${origin}/?v=${vend.slug}`;
          const mensaje = `Hola 👋 Te comparto el catálogo de ${CONFIG.marca.negocio}. Aquí ves todo y pides directo por WhatsApp: ${liga}`;
          return (
            <div key={vend.slug} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-2xl">{vend.nombre}</p>
                  {vend.puesto && <p className="text-sm text-ink-mute">{vend.puesto}</p>}
                </div>
                <span className="chip">
                  <Icon name="lucide:link" size={14} /> ?v={vend.slug}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2 rounded-xl border border-line bg-bg-2/40 p-3 text-sm">
                <code className="break-all text-ink-soft">{liga || "…"}</code>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => copiar(liga, `liga-${vend.slug}`)} className="btn-marca">
                  <Icon name={copiado === `liga-${vend.slug}` ? "lucide:check" : "lucide:copy"} size={16} />
                  {copiado === `liga-${vend.slug}` ? "¡Copiada!" : "Copiar mi liga"}
                </button>
                <button onClick={() => copiar(mensaje, `msg-${vend.slug}`)} className="btn-ghost">
                  <Icon name={copiado === `msg-${vend.slug}` ? "lucide:check" : "lucide:message-square"} size={16} />
                  {copiado === `msg-${vend.slug}` ? "¡Copiado!" : "Copiar mensaje para compartir"}
                </button>
                <a
                  href={linkWhatsApp(vend.whatsapp, `Prueba: soy ${vend.nombre} y esta es mi liga ${liga}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  <Icon name="logos:whatsapp-icon" size={16} /> Probar
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-line p-5 text-sm text-ink-soft">
        <p className="font-semibold text-ink">¿Cómo se usa?</p>
        <p className="mt-1">
          Dile a cada vendedor: &ldquo;comparte TU liga, no la de la tienda&rdquo;. Así sabes quién trajo
          cada venta y el cliente siempre le escribe a la persona correcta. Da un bono por agendar o
          comprar hoy (un descuento, un regalo, envío gratis) para que la liga trabaje sola.
        </p>
      </div>
    </main>
  );
}
