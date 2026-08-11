import { CONFIG } from "@/lib/config";

/** El logo circular de la marca, en chico, para encabezados de páginas internas. */
export function LogoChico({ className }: { className?: string }) {
  const { marca } = CONFIG;
  if (!marca.logo) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={marca.logo} alt={marca.negocio} className={className ?? "h-12 w-12 shrink-0 rounded-full object-cover"} />
  );
}
