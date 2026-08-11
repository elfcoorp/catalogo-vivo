"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CONFIG } from "@/lib/config";
import { linkWhatsApp } from "@/lib/whatsapp";

const FRUTAS = ["Tomate", "Chile morrón", "Pepino", "Cítricos", "Mango", "Aguacate", "Cebolla", "Papa", "Otra"];
const PROCESOS = ["Lavado", "Secado", "Encerado", "Solo clasificar"];
const EMPAQUES = ["A granel pesado", "Acomodado", "Clamshell", "Arpilla (cebolla)", "Caja (papa)"];
const VACIADOS = ["A mano (austero)", "Automatizado con volteadora (equipado)"];
const SI_NO = ["Sí", "No"];
const MATERIALES = ["Acero inoxidable", "Acero al carbón"];
const MAQUINA_ACTUAL = ["Ya tengo máquina, quiero upgrade", "Empiezo de cero"];

interface OpcionesProps {
  opciones: string[];
  seleccion: string[];
  multiple?: boolean;
  onToggle: (valor: string) => void;
}

function Opciones({ opciones, seleccion, onToggle }: OpcionesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const activa = seleccion.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition"
            style={
              activa
                ? { background: "var(--marca)", color: "#fff", borderColor: "var(--marca)" }
                : { borderColor: "var(--line-strong)", color: "var(--ink-soft)" }
            }
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function alternarUnico(seleccion: string[], valor: string): string[] {
  return seleccion[0] === valor ? [] : [valor];
}

function alternarMultiple(seleccion: string[], valor: string): string[] {
  return seleccion.includes(valor) ? seleccion.filter((v) => v !== valor) : [...seleccion, valor];
}

interface PreguntaProps {
  numero: number;
  texto: string;
  children: React.ReactNode;
}

function Pregunta({ numero, texto, children }: PreguntaProps) {
  return (
    <div className="flex flex-col gap-2.5 border-b border-line pb-6">
      <p className="text-sm font-semibold text-ink">
        {numero}. {texto}
      </p>
      {children}
    </div>
  );
}

interface FormularioEmpaqueProps {
  modoTecnico?: boolean;
}

/** Las 10 preguntas de "¿Cabe en tu empaque?" — arman un mensaje y se mandan por WhatsApp. */
export function FormularioEmpaque({ modoTecnico }: FormularioEmpaqueProps) {
  const [fruta, setFruta] = useState<string[]>([]);
  const [frutaOtra, setFrutaOtra] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [proceso, setProceso] = useState<string[]>([]);
  const [empaque, setEmpaque] = useState<string[]>([]);
  const [trabajadores, setTrabajadores] = useState("");
  const [vaciado, setVaciado] = useState<string[]>([]);
  const [etiquetadora, setEtiquetadora] = useState<string[]>([]);
  const [material, setMaterial] = useState<string[]>([]);
  const [horasHoy, setHorasHoy] = useState("");
  const [horasMeta, setHorasMeta] = useState("");
  const [maquinaActual, setMaquinaActual] = useState<string[]>([]);
  const [anchoMesa, setAnchoMesa] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const esUpgrade = maquinaActual[0] === MAQUINA_ACTUAL[0];

  const mensaje = [
    "Hola, quiero platicar sobre una línea personalizada para mi empaque.",
    fruta.length > 0 && `Fruta: ${fruta[0] === "Otra" && frutaOtra ? frutaOtra : fruta.join(", ")}`,
    capacidad && `Capacidad que necesito: ${capacidad}`,
    proceso.length > 0 && `Proceso: ${proceso.join(", ")}`,
    empaque.length > 0 && `Cómo empaco: ${empaque.join(", ")}`,
    trabajadores && `Trabajadores en empacado: ${trabajadores}`,
    vaciado.length > 0 && `Vaciado: ${vaciado[0]}`,
    etiquetadora.length > 0 && `Etiquetadora: ${etiquetadora[0]}`,
    material.length > 0 && `Material: ${material[0]}`,
    (horasHoy || horasMeta) && `Horas de trabajo: hoy ${horasHoy || "—"}, quisiera ${horasMeta || "—"}`,
    maquinaActual.length > 0 &&
      `${maquinaActual[0]}${esUpgrade && anchoMesa ? ` · Ancho de mesa de selección manual actual: ${anchoMesa}` : ""}`,
    whatsapp && `Mi WhatsApp: ${whatsapp}`,
    "Voy a mandar por aquí una foto de mi espacio o un dibujo a mano con las medidas (ancho, largo, postes, desniveles y estructuras a más de 3 metros de altura).",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="card flex flex-col gap-6 p-6">
      <Pregunta numero={1} texto="¿Qué fruta trabajas?">
        <Opciones opciones={FRUTAS} seleccion={fruta} onToggle={(v) => setFruta(alternarUnico(fruta, v))} />
        {fruta[0] === "Otra" && (
          <input
            type="text"
            value={frutaOtra}
            onChange={(e) => setFrutaOtra(e.target.value)}
            placeholder="¿Cuál?"
            className="rounded-xl border border-line-strong bg-bg-2 p-2.5 text-sm outline-none focus:border-marca"
          />
        )}
      </Pregunta>

      <Pregunta numero={2} texto="¿Cuánta capacidad necesitas? (camiones o toneladas por día; si no sabes, hectáreas o volumen aproximado)">
        <input
          type="text"
          value={capacidad}
          onChange={(e) => setCapacidad(e.target.value)}
          placeholder="Ej. 2 camiones al día, o 40 hectáreas"
          className="rounded-xl border border-line-strong bg-bg-2 p-2.5 text-sm outline-none focus:border-marca"
        />
      </Pregunta>

      <Pregunta numero={3} texto="¿Qué proceso necesitas?">
        <Opciones opciones={PROCESOS} seleccion={proceso} onToggle={(v) => setProceso(alternarMultiple(proceso, v))} />
      </Pregunta>

      <Pregunta numero={4} texto="¿Cómo empacas?">
        <Opciones opciones={EMPAQUES} seleccion={empaque} onToggle={(v) => setEmpaque(alternarMultiple(empaque, v))} />
      </Pregunta>

      <Pregunta numero={5} texto="¿Cuántos trabajadores quieres usar en el empacado?">
        <input
          type="text"
          value={trabajadores}
          onChange={(e) => setTrabajadores(e.target.value)}
          placeholder="Ej. 12 personas"
          className="rounded-xl border border-line-strong bg-bg-2 p-2.5 text-sm outline-none focus:border-marca"
        />
      </Pregunta>

      <Pregunta numero={6} texto="Vaciado: ¿a mano (austero) o automatizado con volteadora de bins/taras (equipado)?">
        <Opciones opciones={VACIADOS} seleccion={vaciado} onToggle={(v) => setVaciado(alternarUnico(vaciado, v))} />
      </Pregunta>

      <Pregunta numero={7} texto="¿Con o sin etiquetadora?">
        <Opciones opciones={SI_NO.map((o) => `${o === "Sí" ? "Con" : "Sin"} etiquetadora`)} seleccion={etiquetadora} onToggle={(v) => setEtiquetadora(alternarUnico(etiquetadora, v))} />
      </Pregunta>

      <Pregunta numero={8} texto="Material: ¿acero inoxidable o acero al carbón?">
        <Opciones opciones={MATERIALES} seleccion={material} onToggle={(v) => setMaterial(alternarUnico(material, v))} />
      </Pregunta>

      <Pregunta numero={9} texto="¿Cuántas horas trabajas hoy y cuántas te gustaría trabajar?">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={horasHoy}
            onChange={(e) => setHorasHoy(e.target.value)}
            placeholder="Hoy, ej. 10 hrs"
            className="w-40 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-sm outline-none focus:border-marca"
          />
          <input
            type="text"
            value={horasMeta}
            onChange={(e) => setHorasMeta(e.target.value)}
            placeholder="Me gustaría, ej. 8 hrs"
            className="w-40 rounded-xl border border-line-strong bg-bg-2 p-2.5 text-sm outline-none focus:border-marca"
          />
        </div>
      </Pregunta>

      <Pregunta numero={10} texto="¿Ya tienes máquina y quieres hacer upgrade, o empiezas de cero?">
        <Opciones opciones={MAQUINA_ACTUAL} seleccion={maquinaActual} onToggle={(v) => setMaquinaActual(alternarUnico(maquinaActual, v))} />
        {esUpgrade && (
          <input
            type="text"
            value={anchoMesa}
            onChange={(e) => setAnchoMesa(e.target.value)}
            placeholder="¿Cuánto mide de ancho tu mesa de selección manual antes del calibrador?"
            className="rounded-xl border border-line-strong bg-bg-2 p-2.5 text-sm outline-none focus:border-marca"
          />
        )}
      </Pregunta>

      <div className="flex flex-col gap-2.5">
        <p className="text-sm font-semibold text-ink">Tu WhatsApp</p>
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="Ej. 644 123 4567"
          className="rounded-xl border border-line-strong bg-bg-2 p-2.5 text-sm outline-none focus:border-marca"
        />
      </div>

      <p className="rounded-xl bg-bg-2 p-3 text-sm text-ink-soft">
        Sube una foto de tu espacio o un dibujo a mano con las medidas. Marca el ancho y el largo, los <b>POSTES</b>, los{" "}
        <b>DESNIVELES</b> y cualquier estructura a más de 3 metros de altura en el techo — mándala junto con el mensaje de
        WhatsApp.
      </p>

      {modoTecnico ? (
        <p className="text-center text-sm text-ink-mute">Llena esto y compártelo directo con tu contacto en ELFCO.</p>
      ) : (
        <a href={linkWhatsApp(CONFIG.marca.whatsappPrincipal, mensaje)} target="_blank" rel="noopener noreferrer" className="btn-marca btn-wa">
          <Icon name="logos:whatsapp-icon" size={20} /> Mandar por WhatsApp
        </a>
      )}
    </div>
  );
}
