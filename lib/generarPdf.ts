import { jsPDF } from "jspdf";
import type { Config, Producto } from "./tipos";

interface ImagenCargada {
  data: string;
  formato: "JPEG" | "PNG";
}

async function cargarImagen(src: string): Promise<ImagenCargada | null> {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    const formato = blob.type.includes("png") ? "PNG" : "JPEG";
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return { data, formato };
  } catch {
    return null;
  }
}

function hexARgb(hex: string): [number, number, number] {
  const limpio = hex.replace("#", "");
  return [
    parseInt(limpio.slice(0, 2), 16),
    parseInt(limpio.slice(2, 4), 16),
    parseInt(limpio.slice(4, 6), 16),
  ];
}

const ALTO_PIE = 20;

/** Arma un PDF real (marca + ficha completa de cada producto) para descargar o compartir. */
export async function generarCatalogoPdf(config: Config, productos: Producto[], nombreArchivo?: string): Promise<File> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - ALTO_PIE - 8;
  const [pr, pg, pb] = hexARgb(config.marca.primario);
  const [sr, sg, sb] = hexARgb(config.marca.secundario);
  let y = 0;

  function nuevaPagina() {
    doc.addPage();
    y = 20;
  }

  function espacioDisponible(alto: number) {
    if (y + alto > bottomLimit) nuevaPagina();
  }

  const logo = config.marca.logo ? await cargarImagen(config.marca.logo) : null;

  function encabezadoMarca() {
    y = 16;
    if (logo) {
      const alto = 22;
      const ancho = alto; // el logo es cuadrado
      try {
        doc.addImage(logo.data, logo.formato, pageWidth / 2 - ancho / 2, y, ancho, alto);
      } catch {
        /* si falla, seguimos sin logo */
      }
      y += alto + 4;
    } else {
      doc.setFontSize(20);
      doc.setTextColor(pr, pg, pb);
      doc.text(config.marca.negocio, pageWidth / 2, y + 6, { align: "center" });
      y += 12;
    }
    doc.setDrawColor(sr, sg, sb);
    doc.setLineWidth(0.6);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 8;
  }

  for (let i = 0; i < productos.length; i++) {
    const p = productos[i];
    if (i === 0) {
      encabezadoMarca();
    } else {
      nuevaPagina();
      encabezadoMarca();
    }

    // Categoría + nombre
    doc.setFontSize(9.5);
    doc.setTextColor(sr, sg, sb);
    doc.text(p.categoria.toUpperCase(), marginX, y);
    y += 7;

    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    const nombreLines = doc.splitTextToSize(p.nombre, contentWidth);
    doc.text(nombreLines, marginX, y);
    y += nombreLines.length * 7.5 + 4;

    // Solo la foto principal (compacta): la galería completa ya se ve en la página web
    if (p.imagen) {
      const lado = 42;
      espacioDisponible(lado + 4);
      const imgCargada = await cargarImagen(p.imagen);
      if (imgCargada) {
        try {
          doc.addImage(imgCargada.data, imgCargada.formato, marginX, y, lado, lado);
        } catch {
          /* si la foto falla, seguimos sin ella */
        }
      }
      y += lado + 4;
    }

    // Para quién / beneficio
    espacioDisponible(16);
    doc.setFontSize(10.5);
    doc.setTextColor(90, 90, 90);
    const paraLines = doc.splitTextToSize(`Para ${p.paraQuien.replace(/^para\s+/i, "")}`, contentWidth);
    doc.text(paraLines, marginX, y);
    y += paraLines.length * 5 + 3;

    espacioDisponible(14);
    doc.setFontSize(12.5);
    doc.setTextColor(20, 20, 20);
    const beneficioLines = doc.splitTextToSize(p.beneficio, contentWidth);
    doc.text(beneficioLines, marginX, y);
    y += beneficioLines.length * 6 + 5;

    // Características
    espacioDisponible(6);
    for (const c of p.caracteristicas) {
      espacioDisponible(6);
      doc.setFontSize(10.5);
      doc.setTextColor(sr, sg, sb);
      doc.text("✓", marginX, y);
      doc.setTextColor(40, 40, 40);
      const cLines = doc.splitTextToSize(c, contentWidth - 6);
      doc.text(cLines, marginX + 6, y);
      y += cLines.length * 5.2 + 1;
    }
    y += 3;

    // Ficha técnica: 2 columnas, compacta, para caber en 1 hoja aunque tenga muchos datos
    if (p.fichaTecnica && p.fichaTecnica.length > 0) {
      espacioDisponible(12);
      doc.setFontSize(13);
      doc.setTextColor(pr, pg, pb);
      doc.text("Ficha técnica", marginX, y);
      y += 7;

      const badge = 6;
      const gapCol = 6;
      const colWidth = (contentWidth - gapCol) / 2;
      const colX = [marginX, marginX + colWidth + gapCol];
      const textWidth = colWidth - badge - 4;
      let yCol = [y, y];

      function nuevaPaginaFicha() {
        nuevaPagina();
        yCol = [y, y];
      }

      p.fichaTecnica.forEach((d, idx) => {
        const etiquetaLines = doc.splitTextToSize(d.etiqueta, textWidth);
        const valorLines = doc.splitTextToSize(d.valor, textWidth);
        const altoEtiqueta = Math.max(etiquetaLines.length * 3.6, badge);
        const filaAlto = altoEtiqueta + valorLines.length * 3.4 + 4;

        const col = yCol[0] <= yCol[1] ? 0 : 1;
        if (yCol[col] + filaAlto > bottomLimit) {
          nuevaPaginaFicha();
        }

        const x = colX[col];
        const yy = yCol[col];

        doc.setFillColor(sr, sg, sb);
        doc.roundedRect(x, yy, badge, badge, 1.3, 1.3, "F");
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text(String(idx + 1), x + badge / 2, yy + badge / 2 + 1, { align: "center" });

        doc.setFontSize(8.5);
        doc.setTextColor(sr, sg, sb);
        doc.text(etiquetaLines, x + badge + 3, yy + 3.4);

        doc.setFontSize(7.5);
        doc.setTextColor(70, 70, 70);
        doc.text(valorLines, x + badge + 3, yy + altoEtiqueta + 3);

        yCol[col] = yy + filaAlto;
      });

      y = Math.max(yCol[0], yCol[1]) + 5;
    }

    // Garantía
    if (p.garantia) {
      const garantiaLines = doc.splitTextToSize(p.garantia, contentWidth - 8);
      const alto = garantiaLines.length * 5 + 8;
      espacioDisponible(alto);
      doc.setFillColor(245, 249, 242);
      doc.roundedRect(marginX, y, contentWidth, alto, 3, 3, "F");
      doc.setFontSize(9.5);
      doc.setTextColor(sr, sg, sb);
      doc.text("✓ Garantía", marginX + 4, y + 5.5);
      doc.setTextColor(60, 70, 55);
      doc.text(garantiaLines, marginX + 4, y + 10.5);
      y += alto + 6;
    }

    // Bono
    if (p.bono) {
      espacioDisponible(10);
      doc.setFontSize(10);
      doc.setTextColor(sr, sg, sb);
      doc.text("Además:", marginX, y);
      doc.setTextColor(60, 60, 60);
      const bonoLines = doc.splitTextToSize(p.bono, contentWidth - 20);
      doc.text(bonoLines, marginX + 20, y);
      y += bonoLines.length * 5 + 4;
    }

    // Fotos extra: si sobra espacio en la página actual, aprovechamos para mostrar más
    const fotosExtra = (p.galeria ?? []).filter((f) => f !== p.imagen);
    if (fotosExtra.length > 0) {
      const celda = 36;
      const gapFoto = 4;
      const columnas = Math.max(1, Math.floor((contentWidth + gapFoto) / (celda + gapFoto)));
      const espacioRestante = bottomLimit - y - 14; // deja lugar para la línea de precio/WhatsApp
      const filasQueCaben = Math.floor((espacioRestante + gapFoto) / (celda + gapFoto));
      const maxFotos = Math.min(fotosExtra.length, columnas * Math.max(0, filasQueCaben));

      if (maxFotos > 0) {
        y += 2;
        for (let idx = 0; idx < maxFotos; idx++) {
          const col = idx % columnas;
          if (col === 0 && idx !== 0) y += celda + gapFoto;
          const x = marginX + col * (celda + gapFoto);
          const imgCargada = await cargarImagen(fotosExtra[idx]);
          if (imgCargada) {
            try {
              doc.addImage(imgCargada.data, imgCargada.formato, x, y, celda, celda);
            } catch {
              /* si una foto falla, seguimos con las demás */
            }
          }
        }
        y += celda + gapFoto + 2;
      }
    }

    // Precio: no se imprime (puede cambiar según demanda) — se pide por WhatsApp
    espacioDisponible(10);
    doc.setFontSize(11.5);
    doc.setTextColor(pr, pg, pb);
    doc.text(`Precio y disponibilidad: pregunta por WhatsApp ${config.marca.whatsappPrincipal}`, marginX, y + 4);
    y += 10;
  }

  // Pie de página verde, igual en todas las hojas
  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina);
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, pageHeight - ALTO_PIE, pageWidth, ALTO_PIE, "F");

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(config.marca.negocio, marginX, pageHeight - ALTO_PIE / 2 - 2);

    doc.setFontSize(8.5);
    const contacto = [
      `WhatsApp ${config.marca.whatsappPrincipal}`,
      config.marca.ciudad,
      config.marca.enlace && `catalogo-vivo-kappa.vercel.app`,
    ]
      .filter(Boolean)
      .join("  ·  ");
    doc.text(contacto, marginX, pageHeight - ALTO_PIE / 2 + 3);

    doc.setFontSize(8);
    doc.text(`${pagina}/${totalPaginas}`, pageWidth - marginX, pageHeight - ALTO_PIE / 2, { align: "right" });
  }

  const blob = doc.output("blob");
  return new File([blob], nombreArchivo ?? `catalogo-${config.marca.negocio}.pdf`, { type: "application/pdf" });
}
