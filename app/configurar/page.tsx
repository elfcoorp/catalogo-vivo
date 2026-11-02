"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { generarPromptPegar, slugify } from "@/lib/config-builder";

interface VendedorForm {
  nombre: string;
  whatsapp: string;
}

const PALETAS = [
  { nombre: "Bosque", primario: "#0f766e", secundario: "#c98a2b" },
  { nombre: "Vino", primario: "#9d174d", secundario: "#d9a441" },
  { nombre: "Noche", primario: "#4338ca", secundario: "#e0795a" },
  { nombre: "Tierra", primario: "#9a3412", secundario: "#3f6212" },
  { nombre: "Océano", primario: "#0369a1", secundario: "#f59e0b" },
  { nombre: "Rosa", primario: "#be185d", secundario: "#7c3aed" },
];

export default function Configurar() {
  const [negocio, setNegocio] = useState("Mi Negocio");
  const [descripcion, setDescripcion] = useState("Lo que vendo, para quién · Mi ciudad");
  const [ciudad, setCiudad] = useState("Guadalajara, MX");
  const [enlace, setEnlace] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [primario, setPrimario] = useState("#0f766e");
  const [secundario, setSecundario] = useState("#c98a2b");
  const [fondo, setFondo] = useState<"claro" | "oscuro">("claro");
  const [vendedores, setVendedores] = useState<VendedorForm[]>([{ nombre: "", whatsapp: "" }]);
  const [copiado, setCopiado] = useState(false);

  const promptPegar = useMemo(
    () =>
      generarPromptPegar({
        negocio,
        descripcion,
        ciudad,
        enlace,
        whatsapp,
        primario,
        secundario,
        fondo,
        vendedores: vendedores.filter((v) => v.nombre.trim() || v.whatsapp.trim()),
      }),
    [negocio, descripcion, ciudad, enlace, whatsapp, primario, secundario, fondo, vendedores]
  );

  async function copiar() {
    try {
      await navigator.clipboard.writeText(promptPegar);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* sin portapapeles */
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-marca">
        <Icon name="lucide:arrow-left" size={16} /> Volver al catálogo
      </Link>

      <header className="mb-10">
        <span className="chip mb-3">
          <Icon name="fluent-emoji-flat:gear" size={16} /> Configura tu catálogo
        </span>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Ponlo con tu marca</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Llena estos datos, mira cómo va quedando, y al final copia tu configuración. No necesitas
          saber programar: al terminar te decimos exactamente dónde pegarla.
        </p>
      </header>

      {/* 1 · Tu marca */}
      <Seccion n={1} titulo="Tu marca">
        <Campo label="Nombre del negocio">
          <input className="input" value={negocio} onChange={(e) => setNegocio(e.target.value)} />
        </Campo>
        <Campo label="Una línea: qué vendes y para quién">
          <input className="input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Ciudad">
            <input className="input" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
          </Campo>
          <Campo label="Instagram o web (opcional)">
            <input className="input" value={enlace} onChange={(e) => setEnlace(e.target.value)} placeholder="instagram.com/tunegocio" />
          </Campo>
        </div>
        <Campo label="Tu WhatsApp (con código de país, solo números)">
          <input
            className="input"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="52 33 1234 5678"
            inputMode="tel"
          />
        </Campo>
      </Seccion>

      {/* 2 · Tus colores */}
      <Seccion n={2} titulo="Tus colores">
        <div className="mb-4 flex flex-wrap gap-2">
          {PALETAS.map((p) => (
            <button
              key={p.nombre}
              onClick={() => {
                setPrimario(p.primario);
                setSecundario(p.secundario);
              }}
              className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm hover:border-marca"
            >
              <span className="flex">
                <span className="h-4 w-4 rounded-l-full" style={{ background: p.primario }} />
                <span className="h-4 w-4 rounded-r-full" style={{ background: p.secundario }} />
              </span>
              {p.nombre}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Color principal">
            <div className="flex items-center gap-3">
              <input type="color" value={primario} onChange={(e) => setPrimario(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-transparent" />
              <input className="input flex-1" value={primario} onChange={(e) => setPrimario(e.target.value)} />
            </div>
          </Campo>
          <Campo label="Color de acento">
            <div className="flex items-center gap-3">
              <input type="color" value={secundario} onChange={(e) => setSecundario(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-transparent" />
              <input className="input flex-1" value={secundario} onChange={(e) => setSecundario(e.target.value)} />
            </div>
          </Campo>
        </div>
        <Campo label="Fondo del catálogo">
          <div className="flex gap-2">
            {(["claro", "oscuro"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFondo(f)}
                className={cn("rounded-full border px-4 py-2 text-sm capitalize", fondo === f ? "border-marca text-marca" : "border-line text-ink-soft")}
              >
                {f}
              </button>
            ))}
          </div>
        </Campo>
      </Seccion>

      {/* 3 · Tu equipo */}
      <Seccion n={3} titulo="Tu equipo de ventas">
        <p className="mb-4 text-sm text-ink-mute">
          Agrega a cada vendedor con su WhatsApp. Cada quien recibirá su propia liga.
        </p>
        <div className="flex flex-col gap-3">
          {vendedores.map((v, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                className="input flex-1"
                placeholder="Nombre"
                value={v.nombre}
                onChange={(e) => setVendedores((arr) => arr.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))}
              />
              <input
                className="input flex-1"
                placeholder="WhatsApp (solo números)"
                inputMode="tel"
                value={v.whatsapp}
                onChange={(e) => setVendedores((arr) => arr.map((x, j) => (j === i ? { ...x, whatsapp: e.target.value } : x)))}
              />
              {v.nombre && <span className="chip">?v={slugify(v.nombre)}</span>}
              {vendedores.length > 1 && (
                <button onClick={() => setVendedores((arr) => arr.filter((_, j) => j !== i))} className="text-ink-mute hover:text-ink" aria-label="Quitar">
                  <Icon name="lucide:x" size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => setVendedores((arr) => [...arr, { nombre: "", whatsapp: "" }])} className="btn-ghost mt-4">
          <Icon name="lucide:plus" size={16} /> Agregar vendedor
        </button>
      </Seccion>

      {/* Preview en vivo */}
      <Seccion n={4} titulo="Cómo va quedando">
        <div
          style={{ ["--marca" as string]: primario, ["--marca-2" as string]: secundario }}
          className={cn("rounded-3xl border border-line p-6", fondo === "oscuro" ? "tema-oscuro" : "")}
        >
          <div className="rounded-2xl p-4" style={{ background: fondo === "oscuro" ? "#141a18" : "#fff" }}>
            <p className="font-display text-3xl font-semibold text-gradient-marca">{negocio || "Mi Negocio"}</p>
            <p className="text-sm" style={{ color: fondo === "oscuro" ? "#b9c4bf" : "#4b5852" }}>
              {descripcion}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="chip">Catálogo 24/7</span>
              <span className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: primario }}>
                Lo quiero
              </span>
              <span className="rounded-full px-4 py-2 text-sm font-semibold" style={{ background: `color-mix(in srgb, ${secundario} 18%, transparent)`, color: secundario }}>
                El más pedido
              </span>
            </div>
          </div>
        </div>
      </Seccion>

      {/* Salida */}
      <Seccion n={5} titulo="Tu configuración lista">
        <div className="rounded-2xl border border-line p-5">
          <p className="text-sm text-ink-soft">
            Ya está. Copia este prompt y pégalo en tu <span className="font-semibold text-ink">Claude Code</span> o{" "}
            <span className="font-semibold text-ink">Cowork</span>: ya trae el link para descargar el proyecto y tu configuración.
          </p>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-ink-soft">
            <li>
              <span className="font-semibold text-ink">Con Claude Code:</span> copia el prompt de abajo y pégalo. Él descarga el proyecto y le pone tu configuración.
            </li>
            <li>
              <span className="font-semibold text-ink">Si ya tienes el proyecto:</span> copia solo la parte de <code>lib/config.ts</code> (lo que va después de &ldquo;reemplaza…&rdquo;) y pégala en ese archivo.
            </li>
          </ol>
          <motion.pre
            key={copiado ? "c" : "n"}
            className="mt-4 max-h-72 overflow-auto rounded-xl border border-line bg-bg-2/60 p-4 text-xs leading-relaxed"
          >
            <code>{promptPegar}</code>
          </motion.pre>
          <button onClick={copiar} className="btn-marca mt-4">
            <Icon name={copiado ? "lucide:check" : "lucide:copy"} size={18} />
            {copiado ? "¡Copiado!" : "Copiar el prompt"}
          </button>
        </div>
      </Seccion>

      <style>{`
        .input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--line-strong);
          background: var(--surface);
          padding: 0.7rem 0.9rem;
          font-size: 1rem;
          color: var(--ink);
        }
        .input:focus { outline: 2px solid var(--marca); outline-offset: 1px; }
      `}</style>
    </main>
  );
}

function Seccion({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full text-sm font-semibold text-white" style={{ background: "var(--marca)" }}>
          {n}
        </span>
        <h2 className="font-display text-2xl font-semibold">{titulo}</h2>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
