import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { CONFIG } from "@/lib/config";

export const runtime = "nodejs";
export const alt = `${CONFIG.marca.negocio} · Catálogo`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen que se ve al compartir el catálogo en WhatsApp, Instagram, Facebook, etc. */
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
          backgroundColor: "#f4f7f0",
        }}
      >
        <img src={logoBase64} width={260} height={260} style={{ borderRadius: "50%" }} />
        <div
          style={{
            marginTop: 36,
            fontSize: 60,
            fontWeight: 700,
            color: CONFIG.marca.primario,
          }}
        >
          Líneas de empaque usadas
        </div>
        <div style={{ marginTop: 14, fontSize: 32, color: "#5a6a55" }}>
          {CONFIG.marca.descripcion}
        </div>
      </div>
    ),
    size
  );
}
