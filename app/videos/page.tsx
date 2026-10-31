import { redirect } from "next/navigation";

/** /videos fue la primera dirección del catálogo en video; ahora es la portada. */
export default async function PaginaVideos({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; modo?: string }>;
}) {
  const { v, modo } = await searchParams;
  const q = new URLSearchParams();
  if (v) q.set("v", v);
  if (modo) q.set("modo", modo);
  const s = q.toString();
  redirect(s ? `/?${s}` : "/");
}
