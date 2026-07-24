import { jsPDF } from "jspdf";
import type { Config, Producto } from "./tipos";

async function imagenABase64(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Arma un PDF real del catálogo (marca + productos) para descargar o compartir. */
export async function generarCatalogoPdf(config: Config, productos: Producto[], nombreArchivo?: string): Promise<File> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const imgSize = 38;
  let y = 20;

  doc.setFontSize(22);
  doc.setTextColor(0);
  doc.text(config.marca.negocio, pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(90);
  const descLines = doc.splitTextToSize(config.marca.descripcion, pageWidth - marginX * 2);
  doc.text(descLines, pageWidth / 2, y, { align: "center" });
  y += descLines.length * 5 + 10;

  for (const p of productos) {
    if (y + imgSize + 15 > pageHeight - 15) {
      doc.addPage();
      y = 20;
    }

    const imgData = p.imagen ? await imagenABase64(p.imagen) : null;
    if (imgData) {
      try {
        doc.addImage(imgData, "JPEG", marginX, y, imgSize, imgSize);
      } catch {
        /* si la imagen falla, seguimos sin ella */
      }
    }

    const textX = marginX + imgSize + 6;
    const textWidth = pageWidth - textX - marginX;
    let ty = y + 5;

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(p.categoria.toUpperCase(), textX, ty);
    ty += 6;

    doc.setFontSize(13);
    doc.setTextColor(0);
    const nombreLines = doc.splitTextToSize(p.nombre, textWidth);
    doc.text(nombreLines, textX, ty);
    ty += nombreLines.length * 6;

    doc.setFontSize(9);
    doc.setTextColor(80);
    const beneficioLines = doc.splitTextToSize(p.beneficio, textWidth).slice(0, 2);
    doc.text(beneficioLines, textX, ty);
    ty += beneficioLines.length * 4.5 + 3;

    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text(p.precio, textX, ty);

    y += imgSize + 12;
    doc.setDrawColor(225);
    doc.line(marginX, y - 6, pageWidth - marginX, y - 6);
  }

  if (y + 10 > pageHeight - 10) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(10);
  doc.setTextColor(90);
  const pie = [`Pide por WhatsApp: ${config.marca.whatsappPrincipal}`, config.marca.ciudad].filter(Boolean).join(" · ");
  doc.text(pie, pageWidth / 2, y + 4, { align: "center" });

  const blob = doc.output("blob");
  return new File([blob], nombreArchivo ?? `catalogo-${config.marca.negocio}.pdf`, { type: "application/pdf" });
}
