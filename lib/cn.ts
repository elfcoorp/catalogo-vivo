import { clsx, type ClassValue } from "clsx";

/** Une clases condicionales. Mantén las utilidades de Tailwind ordenadas y legibles. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
