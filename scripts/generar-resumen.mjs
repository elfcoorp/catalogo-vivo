import { jsPDF } from "jspdf";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const VERDE = [49, 80, 46];
const VERDE_CLARO = [102, 167, 61];
const GRIS = [70, 70, 70];
const GRIS_CLARO = [120, 120, 120];

const doc = new jsPDF({ unit: "mm", format: "a4" });
const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const marginX = 18;
const contentWidth = pageWidth - marginX * 2;
const bottomLimit = pageHeight - 16;
let y = 20;

function nuevaPagina() {
  doc.addPage();
  y = 20;
}
function espacio(alto) {
  if (y + alto > bottomLimit) nuevaPagina();
}

function titulo(texto) {
  espacio(14);
  doc.setFontSize(15);
  doc.setTextColor(...VERDE);
  doc.setFont(undefined, "bold");
  doc.text(texto, marginX, y);
  doc.setDrawColor(...VERDE_CLARO);
  doc.setLineWidth(0.5);
  doc.line(marginX, y + 2, pageWidth - marginX, y + 2);
  y += 9;
  doc.setFont(undefined, "normal");
}

function subtitulo(texto) {
  espacio(9);
  doc.setFontSize(11.5);
  doc.setTextColor(...VERDE);
  doc.setFont(undefined, "bold");
  const lines = doc.splitTextToSize(texto, contentWidth);
  doc.text(lines, marginX, y);
  y += lines.length * 5.5 + 2;
  doc.setFont(undefined, "normal");
}

function parrafo(texto) {
  doc.setFontSize(10);
  doc.setTextColor(...GRIS);
  const lines = doc.splitTextToSize(texto, contentWidth);
  espacio(lines.length * 5 + 2);
  doc.text(lines, marginX, y);
  y += lines.length * 5 + 3;
}

function bullet(texto) {
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(texto, contentWidth - 6);
  espacio(lines.length * 5 + 1);
  doc.setTextColor(...VERDE_CLARO);
  doc.text("•", marginX, y);
  doc.setTextColor(...GRIS);
  doc.text(lines, marginX + 5, y);
  y += lines.length * 5 + 1;
}

function espaciador(mm = 4) {
  y += mm;
}

// Portada
doc.setFontSize(22);
doc.setTextColor(...VERDE);
doc.setFont(undefined, "bold");
doc.text("elfco · Catálogo Vivo", marginX, y + 4);
y += 12;
doc.setFontSize(12);
doc.setTextColor(...GRIS_CLARO);
doc.setFont(undefined, "normal");
doc.text("Resumen de trabajo y plan de publicidad", marginX, y);
y += 6;
doc.setFontSize(9);
doc.text("Generado el 28 de julio de 2026 · catalogo-vivo-kappa.vercel.app", marginX, y);
y += 12;

// 1. Qué es el catálogo
titulo("1. Tu catálogo");
parrafo(
  "Un catálogo web con 6 máquinas de líneas de empaque usadas, con fotos, ficha técnica completa, botón directo a WhatsApp (\"Lo quiero\"), PDF individual por máquina para compartir, y liga para redes sociales."
);
bullet("Línea tomate grape 4x12 — $2,700,000 MXN + IVA");
bullet("Línea completa para cítricos — $4,500,000 MXN + IVA");
bullet("Clasificadora 6 líneas (morrón/mango/aguacate) — $1,500,000 MXN");
bullet("Línea tomate roma/bola — $1,300,000 MXN");
bullet("Clasificadora 4x12 (morrón/mango/cebolla/aguacate) — $3,500,000 MXN");
bullet("Volteadora de bins Rochin (nueva) — $2,300,000 MXN");
espaciador();

// 2. Cambios importantes hechos
titulo("2. Cambios importantes que hicimos");
bullet("Los precios ya NO aparecen en los PDF ni en la versión para imprimir — invitan a preguntar por WhatsApp. En la página web sí se muestra el precio, con el aviso \"Precio sujeto a cambios sin previo aviso.\"");
bullet("Texto de garantía en las 6 máquinas: se enciende cada función frente al cliente en la bodega, se vende como está (puede faltar un tornillo, lámina o pintura, nunca algo que afecte su funcionamiento), no incluye instalación salvo que se contrate, y se trabaja con contrato firmado + anticipo antes de cargar.");
bullet("El PDF individual ahora cabe mejor: foto principal compacta, ficha técnica en 2 columnas, y si sobra espacio en la segunda hoja se muestran más fotos de la galería.");
bullet("Imagen de vista previa (la que sale al compartir el link en WhatsApp/redes) corregida: ya no es la foto genérica de una vela, ahora es tu logo con el texto \"Líneas de empaque usadas.\"");
bullet("Se agregó la volteadora de bins Rochin como 6to producto, con ficha técnica completa armada a partir de tus notas de voz y fotos.");
espaciador();

// 3. Plan de publicidad
titulo("3. Plan de publicidad (primera vez)");
subtitulo("Rotación semanal por producto y región");
bullet("Semana 1 — Tomate (grape/roma) — Sinaloa (Culiacán) y Sonora");
bullet("Semana 2 — Cítricos — Nuevo León/Tamaulipas y Veracruz");
bullet("Semana 3 — Morrón/clasificadoras — El Bajío (Guanajuato) y Sinaloa/Sonora");
bullet("Semana 4 — Aguacate + morrón — Michoacán y Puebla");
espaciador(2);
subtitulo("Cómo correrlo cada semana");
bullet("Las 3 redes al mismo tiempo, no una por una: TikTok con video real, Facebook e Instagram con las portadas ya generadas (carpeta anuncios/).");
bullet("Presupuesto sugerido: Facebook $150 + Instagram $120 + TikTok $150 = $420 MXN/día — ~$2,940 MXN por semana.");
bullet("Plan completo de 4 semanas ~ $11,760 MXN — pero se decidió ir semana por semana, evaluando resultados antes de seguir (no pagar todo de un jalón, por ser su primera campaña).");
bullet("Dejar el anuncio corriendo 24 horas la primera semana (sin restringir horario). Para la semana 2, decidir el horario según el reporte real de \"clics por hora\" de cada plataforma — no adivinar.");
espaciador(2);
subtitulo("Pendiente / checklist antes de lanzar");
bullet("Instalar el Meta Pixel en el sitio (falta el Pixel ID de Meta Business Manager).");
bullet("Verificar que el Pixel dispare antes de gastar presupuesto (Meta Pixel Helper).");
bullet("Crear audiencia personalizada de visitantes del sitio (retargeting), y más adelante una \"lookalike.\"");
bullet("Bio de Instagram/Facebook con el link completo: https://catalogo-vivo-kappa.vercel.app");
bullet("Usar ligas de vendedor (?v=nombre) para saber qué vendedor o canal trae la venta.");
bullet("Cuando tengas resultados de la semana 1, comparte capturas o reportes exportados (CSV/PDF) de cada plataforma para leerlos juntos y decidir la semana 2.");
espaciador();

// 4. Consejos clave
titulo("4. Consejos clave que platicamos");
bullet("Mostrar precio en la maquinaria usada es normal (como bienes raíces o autos usados) — filtra a los que de verdad están interesados. El riesgo de que copien tu cotización se cubre dejando el PDF sin precio.");
bullet("El objetivo real de la primera semana de anuncios es generar mensajes de WhatsApp, no necesariamente cerrar una venta — el ciclo de venta de maquinaria industrial toma semanas o meses.");
bullet("El Meta Pixel es gratis — no tiene costo instalarlo ni tener el registro de visitantes; solo pagas cuando usas esos datos para volver a anunciarte (retargeting).");
bullet("Para audio de los videos de TikTok: mejor dejar el sonido real de la máquina funcionando que ponerle música — genera más confianza para equipo industrial usado.");
bullet("Duración recomendada de video para TikTok: 15-30 segundos, con el gancho en los primeros 2-3 segundos.");

// Pie de página en todas las hojas
const totalPaginas = doc.getNumberOfPages();
for (let p = 1; p <= totalPaginas; p++) {
  doc.setPage(p);
  doc.setFontSize(8);
  doc.setTextColor(...GRIS_CLARO);
  doc.text(`elfco · Catálogo Vivo`, marginX, pageHeight - 8);
  doc.text(`${p}/${totalPaginas}`, pageWidth - marginX, pageHeight - 8, { align: "right" });
}

const out = join(root, "anuncios", "resumen-catalogo-y-publicidad.pdf");
writeFileSync(out, Buffer.from(doc.output("arraybuffer")));
console.log("Generado:", out);
