import { notFound } from "next/navigation";
import { FichaProductoContenido } from "@/components/catalogo/FichaProductoContenido";
import { PRODUCTOS, productoPorSlug } from "@/lib/productos";
import { esModoTecnico } from "@/lib/modo";

export function generateStaticParams() {
  return PRODUCTOS.map((p) => ({ slug: p.slug }));
}

export default async function FichaProducto({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ v?: string; modo?: string }>;
}) {
  const { slug } = await params;
  const { v, modo } = await searchParams;
  const producto = productoPorSlug(slug);
  if (!producto) notFound();

  const relacionados = PRODUCTOS.filter(
    (p) => p.categoria === producto.categoria && p.slug !== producto.slug
  ).slice(0, 3);

  return (
    <FichaProductoContenido
      producto={producto}
      relacionados={relacionados}
      v={v ?? null}
      modoTecnico={esModoTecnico(modo)}
    />
  );
}
