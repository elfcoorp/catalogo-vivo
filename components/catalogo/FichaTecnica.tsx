import { Icon } from "@/components/ui/Icon";

interface FichaTecnicaProps {
  datos: { etiqueta: string; valor: string }[];
}

/**
 * Cuadro de especificaciones técnicas (dimensiones, potencia, capacidad, peso...)
 * para el comprador técnico que quiere verificar datos duros antes de escribir.
 * Sección aparte del resumen de venta — no cuenta contra el máximo de 3 características.
 */
export function FichaTecnica({ datos }: FichaTecnicaProps) {
  if (datos.length === 0) return null;

  return (
    <section className="card mt-4 rounded-2xl border border-line p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
        <Icon name="lucide:clipboard-list" size={18} className="text-marca" />
        Ficha técnica
      </h2>
      <dl className="flex flex-col divide-y divide-line">
        {datos.map((d) => (
          <div key={d.etiqueta} className="flex items-baseline justify-between gap-4 py-2 text-sm">
            <dt className="text-ink-soft">{d.etiqueta}</dt>
            <dd className="text-right font-medium text-ink">{d.valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
