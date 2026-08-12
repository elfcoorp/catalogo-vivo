"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "es" | "en" | "pt";

export const BANDERA: Record<Lang, string> = { es: "🇲🇽", en: "🇺🇸", pt: "🇧🇷" };
export const NOMBRE_IDIOMA: Record<Lang, string> = { es: "Español", en: "English", pt: "Português" };

export const TEXTOS = {
  es: {
    buscar: "Busca por fruta o máquina…",
    filtros: "Filtros",
    quitarFiltros: "Quitar filtros",
    porTuFruta: "Por tu fruta",
    tipoDeCopita: "Tipo de copita",
    clasificaPor: "Clasifica por",
    estatus: "Estatus",
    disponible: "Disponible",
    apartada: "Apartada",
    rodilloClip: "Rodillo / clip",
    charola: "Charola",
    peso: "Peso",
    diametro: "Diámetro",
    color: "Color",
    verFichaCompleta: "Ver ficha completa",
    elMasPedido: "El más pedido",
    verificada: "Verificada",
    loQuiero: "Lo quiero",
    compartirLiga: "Compartir liga",
    compartirCatalogo: "Compartir catálogo",
    descargarPdf: "Descargar en PDF",
    compartirPdf: "Compartir esta máquina en PDF",
    volverAlCatalogo: "Volver al catálogo",
    fichaTecnica: "Ficha técnica",
    planoDeLaMaquina: "Plano de la máquina",
    descargarPlano: "Descargar plano",
    planoNota: "Plano de referencia ELFCO. El plano a detalle se entrega al concretar la compra.",
    garantia: "Garantía",
    tambienTePuedeGustar: "También te puede gustar",
    precioSujeto: "Precio sujeto a cambios sin previo aviso.",
    fleteNota: "El flete se cotiza según tu destino — pregúntanos.",
    tabUsadas: "Usadas rehabilitadas",
    tabPersonalizadas: "Personaliza tu máquina",
    personalizadasTitulo: "¿Cabe en tu empaque?",
    personalizadasSubtitulo: "Mándanos las medidas de tu espacio y te dibujamos el plano gratis con la máquina que te interese.",
    masOpciones: "Más opciones",
    vendeTuMaquina: "Vende tu máquina",
    kitVendedores: "Kit para vendedores",
    ligaTecnicos: "Liga para técnicos (sin WhatsApp)",
    ligaCopiada: "¡Liga copiada!",
    versionTecnicos: "Versión para técnicos — sin botones de contacto.",
    idioma: "Idioma",
    noHayMaquinas: "No hay máquinas con esos filtros por ahora. Quita alguno para ver más opciones.",
    opciones: "opciones",
    verResultados: "Ver resultados",
    cerrarFiltros: "Cerrar filtros",
    todas: "Todas",
    catalogoDisponible: "Catálogo disponible 24/7",
  },
  en: {
    buscar: "Search by fruit or machine…",
    filtros: "Filters",
    quitarFiltros: "Clear filters",
    porTuFruta: "By your fruit",
    tipoDeCopita: "Cup type",
    clasificaPor: "Sorts by",
    estatus: "Status",
    disponible: "Available",
    apartada: "Reserved",
    rodilloClip: "Roller / clip",
    charola: "Tray",
    peso: "Weight",
    diametro: "Diameter",
    color: "Color",
    verFichaCompleta: "View full details",
    elMasPedido: "Most requested",
    verificada: "Verified",
    loQuiero: "I want it",
    compartirLiga: "Share link",
    compartirCatalogo: "Share catalog",
    descargarPdf: "Download PDF",
    compartirPdf: "Share this machine as PDF",
    volverAlCatalogo: "Back to catalog",
    fichaTecnica: "Technical specs",
    planoDeLaMaquina: "Machine layout",
    descargarPlano: "Download layout",
    planoNota: "ELFCO reference layout. The detailed layout is provided once the purchase is confirmed.",
    garantia: "Warranty",
    tambienTePuedeGustar: "You might also like",
    precioSujeto: "Price subject to change without notice.",
    fleteNota: "Freight is quoted based on your destination — just ask.",
    tabUsadas: "Refurbished used",
    tabPersonalizadas: "Customize your machine",
    personalizadasTitulo: "Does it fit your packing house?",
    personalizadasSubtitulo: "Send us your space measurements and we'll draw you a free layout with the machine you're interested in.",
    masOpciones: "More options",
    vendeTuMaquina: "Sell your machine",
    kitVendedores: "Sales team kit",
    ligaTecnicos: "Technician link (no WhatsApp)",
    ligaCopiada: "Link copied!",
    versionTecnicos: "Technician version — no contact buttons.",
    idioma: "Language",
    noHayMaquinas: "No machines match those filters right now. Remove one to see more options.",
    opciones: "options",
    verResultados: "See results",
    cerrarFiltros: "Close filters",
    todas: "All",
    catalogoDisponible: "Catalog available 24/7",
  },
  pt: {
    buscar: "Busque por fruta ou máquina…",
    filtros: "Filtros",
    quitarFiltros: "Remover filtros",
    porTuFruta: "Pela sua fruta",
    tipoDeCopita: "Tipo de copo",
    clasificaPor: "Classifica por",
    estatus: "Status",
    disponible: "Disponível",
    apartada: "Reservada",
    rodilloClip: "Rolo / clip",
    charola: "Bandeja",
    peso: "Peso",
    diametro: "Diâmetro",
    color: "Cor",
    verFichaCompleta: "Ver ficha completa",
    elMasPedido: "Mais pedida",
    verificada: "Verificada",
    loQuiero: "Eu quero",
    compartirLiga: "Compartilhar link",
    compartirCatalogo: "Compartilhar catálogo",
    descargarPdf: "Baixar em PDF",
    compartirPdf: "Compartilhar esta máquina em PDF",
    volverAlCatalogo: "Voltar ao catálogo",
    fichaTecnica: "Ficha técnica",
    planoDeLaMaquina: "Layout da máquina",
    descargarPlano: "Baixar layout",
    planoNota: "Layout de referência ELFCO. O layout detalhado é entregue ao fechar a compra.",
    garantia: "Garantia",
    tambienTePuedeGustar: "Você também pode gostar",
    precioSujeto: "Preço sujeito a alterações sem aviso prévio.",
    fleteNota: "O frete é cotado de acordo com seu destino — pergunte-nos.",
    tabUsadas: "Usadas reformadas",
    tabPersonalizadas: "Personalize sua máquina",
    personalizadasTitulo: "Cabe na sua embaladora?",
    personalizadasSubtitulo: "Mande as medidas do seu espaço e desenhamos grátis o layout com a máquina que te interessa.",
    masOpciones: "Mais opções",
    vendeTuMaquina: "Venda sua máquina",
    kitVendedores: "Kit para vendedores",
    ligaTecnicos: "Link para técnicos (sem WhatsApp)",
    ligaCopiada: "Link copiado!",
    versionTecnicos: "Versão para técnicos — sem botões de contato.",
    idioma: "Idioma",
    noHayMaquinas: "Nenhuma máquina corresponde a esses filtros agora. Remova algum para ver mais opções.",
    opciones: "opções",
    verResultados: "Ver resultados",
    cerrarFiltros: "Fechar filtros",
    todas: "Todas",
    catalogoDisponible: "Catálogo disponível 24/7",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type Textos = keyof (typeof TEXTOS)["es"];

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (chave: Textos) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

const CLAVE_STORAGE = "elfco-idioma";

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const guardado = window.localStorage.getItem(CLAVE_STORAGE);
    if (guardado === "es" || guardado === "en" || guardado === "pt") setLangState(guardado);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    window.localStorage.setItem(CLAVE_STORAGE, l);
  }

  function t(chave: Textos): string {
    return TEXTOS[lang][chave];
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

/** Usa el idioma actual del catálogo. Debe usarse dentro de <LangProvider>. */
export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang debe usarse dentro de <LangProvider>");
  return ctx;
}
