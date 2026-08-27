import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { CONFIG } from "@/lib/config";

export const runtime = "nodejs";
export const alt = `${CONFIG.marca.negocio} · Catálogo`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagen que se ve al compartir el catálogo en WhatsApp, Instagram, Facebook.
 *
 * Va con fondo OSCURO, igual que el catálogo. Antes salía crema y ya no
 * combinaba con el sitio ni con el fondo negro de WhatsApp. El verde va en el
 * tono claro de la marca para que resalte y se lea nítido; el logo se queda
 * sobre su círculo blanco porque sus letras son oscuras.
 */
export default async function Image() {
  const logoData = readFileSync(join(process.cwd(), "public/logo.png"));
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0c0f0e",
        }}
      >
        {/* El logo lleva letras oscuras, así que va sobre su círculo blanco
            para que no se pierda en el fondo negro. */}
        <div
          style={{
            display: "flex",
            width: 288,
            height: 288,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            border: `6px solid ${CONFIG.marca.secundario}`,
          }}
        >
          <img src={logoBase64} width={252} height={252} style={{ borderRadius: "50%" }} />
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 64,
            fontWeight: 700,
            color: CONFIG.marca.secundario,
          }}
        >
          Líneas de empaque usadas
        </div>
        <div style={{ marginTop: 16, fontSize: 32, color: "#b9c4bf" }}>
          {CONFIG.marca.descripcion}
        </div>
      </div>
    ),
    size
  );
}
