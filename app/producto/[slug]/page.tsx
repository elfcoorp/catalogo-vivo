import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { GaleriaProducto } from "@/components/catalogo/GaleriaProducto";
import { BotonPdf } from "@/components/catalogo/BotonPdf";
import { BotonCompartirLink } from "@/components/catalogo/BotonCompartirLink";
import { FichaTecnica } from "@/components/catalogo/FichaTecnica";
import { ProductoCard } from "@/components/catalogo/ProductoCard";
import { CONFIG } from "@/lib/config";
import { PRODUCTOS, productoPorSlug } from "@/lib/productos";
import { linkLoQuiero } from "@/lib/whatsapp";

export function generateStaticParams() {
  return PRODUCTOS.map((p) => ({ slug: p.slug }));
}

export default async function FichaProducto({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  const { slug } = await params;
  const { v } = await searchParams;
  const producto = productoPorSlug(slug);
  if (!producto) notFound();

  const href = linkLoQuiero(CONFIG, producto, v ?? null);
  const relacionados = PRODUCTOS.filter(
    (p) => p.categoria === producto.categoria && p.slug !== producto.slug
  ).slice(0, 3);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10">
      <Link href={v ? `/?v=${v}` : "/"} className="mb-8 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-marca">
        <Icon name="lucide:arrow-left" size={16} /> Volver al catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Foto */}
        <div className="relative">
          <GaleriaProducto
            imagen={producto.imagen}
            galeria={producto.galeria}
            video={producto.video}
            alt={producto.nombre}
            className="aspect-square rounded-3xl border border-line"
          />
          {producto.escasez && (
            <span className="chip chip-escasez absolute left-4 top-4">
              <Icon
                name={producto.escasez.tipo === "tiempo" ? "fluent-emoji-flat:alarm-clock" : "fluent-emoji-flat:fire"}
                size={14}
              />
              {producto.escasez.tipo === "tiempo" ? "Solo " : "Quedan "}
              {producto.escasez.valor}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-marca">{producto.categoria}</p>
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">{producto.nombre}</h1>
          <p className="text-lg text-ink-soft">
            <span className="font-semibold text-ink">Para</span> {producto.paraQuien.replace(/^para\s+/i, "")}
          </p>
          <p className="text-xl leading-snug text-ink">{producto.beneficio}</p>

          <ul className="flex flex-col gap-2">
            {producto.caracteristicas.map((c) => (
              <li key={c} className="flex items-start gap-2 text-ink-soft">
                <Icon name="lucide:check" size={18} className="mt-0.5 shrink-0 text-marca" />
                {c}
              </li>
            ))}
          </ul>

          {producto.prueba && <p className="italic text-ink-mute">{producto.prueba}</p>}

          {producto.garantia && (
            <p className="flex items-start gap-1.5 text-sm text-ink-soft">
              <Icon name="lucide:shield-check" size={15} className="mt-0.5 shrink-0 text-marca" />
              {producto.garantia}
            </p>
          )}

          {producto.bono && (
            <div
              className="rounded-2xl border px-4 py-3"
              style={{
                background: "color-mix(in srgb, var(--marca-2) 12%, transparent)",
                borderColor: "color-mix(in srgb, var(--marca-2) 30%, transparent)",
              }}
            >
              <span className="font-semibold">Además te llevas:</span> {producto.bono}
            </div>
          )}

          <div className="flex flex-col gap-1 pt-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {producto.precioAntes && <span className="text-lg text-ink-mute line-through">{producto.precioAntes}</span>}
              <span className="font-display text-4xl font-semibold">{producto.precio}</span>
              {producto.facilidades && <span className="text-ink-soft">· {producto.facilidades}</span>}
            </div>
            <span className="text-sm text-ink-mute">Precio sujeto a cambios sin previo aviso.</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href={href} target="_blank" rel="noopener noreferrer" className="btn-marca btn-wa mt-2 w-full sm:w-auto">
              <MessageCircle size={22} /> Lo quiero
            </a>
            <BotonCompartirLink etiqueta="Compartir liga" className="btn-ghost mt-2 w-full sm:w-auto" />
            <BotonPdf
              productos={[producto]}
              etiqueta="Compartir esta máquina en PDF"
              nombreArchivo={`${producto.slug}.pdf`}
              className="btn-ghost mt-2 w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {producto.fichaTecnica && <FichaTecnica datos={producto.fichaTecnica} />}

      {/* Relacionados */}
      {relacionados.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-semibold">También te puede gustar</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relacionados.map((p) => (
              <ProductoCard key={p.slug} producto={p} vendedorSlug={v ?? null} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
