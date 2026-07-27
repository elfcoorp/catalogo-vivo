import { ImageResponse } from "next/og.js";
import { createElement as h } from "react";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function dataUri(path, mime) {
  const data = readFileSync(join(root, path));
  return `data:${mime};base64,${data.toString("base64")}`;
}

const logo = dataUri("public/logo.png", "image/png");

const VERDE = "#31502e";
const VERDE_CLARO = "#66a73d";

function check() {
  return h(
    "div",
    {
      style: {
        width: 40,
        height: 40,
        borderRadius: 8,
        background: VERDE_CLARO,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      },
    },
    h("div", {
      style: {
        position: "absolute",
        width: 5,
        height: 12,
        background: "#ffffff",
        borderRadius: 2,
        left: 14,
        top: 15,
        transform: "rotate(45deg)",
        display: "flex",
      },
    }),
    h("div", {
      style: {
        position: "absolute",
        width: 5,
        height: 20,
        background: "#ffffff",
        borderRadius: 2,
        left: 20,
        top: 8,
        transform: "rotate(-45deg)",
        display: "flex",
      },
    })
  );
}

function iconoWhatsapp() {
  return h(
    "div",
    {
      style: {
        width: 74,
        height: 74,
        borderRadius: "50%",
        background: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      },
    },
    h("div", {
      style: {
        width: 38,
        height: 32,
        background: "#ffffff",
        borderRadius: 10,
        display: "flex",
      },
    }),
    h("div", {
      style: {
        position: "absolute",
        bottom: 19,
        left: 30,
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderWidth: "7px 7px 0 0",
        borderColor: "#ffffff transparent transparent transparent",
        transform: "rotate(45deg)",
        display: "flex",
      },
    })
  );
}

function anuncio({ width, height, tamañoTitulo, tamañoSub, foto }) {
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "sans-serif",
      },
    },
    // Foto de fondo
    h("img", {
      src: foto,
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      },
    }),
    // Degradado oscuro para legibilidad
    h("div", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(180deg, rgba(10,20,10,0.55) 0%, rgba(10,20,10,0.15) 30%, rgba(10,20,10,0.55) 62%, rgba(10,20,10,0.88) 100%)",
        display: "flex",
      },
    }),
    // Logo arriba a la izquierda
    h(
      "div",
      {
        style: {
          position: "absolute",
          top: 44,
          left: 44,
          display: "flex",
          alignItems: "center",
          gap: 16,
        },
      },
      h("img", { src: logo, width: 150, height: 150, style: { borderRadius: "50%" } }),
      h(
        "div",
        { style: { fontSize: 56, fontWeight: 700, color: "#ffffff", display: "flex" } },
        "elfco"
      )
    ),
    // Bloque de texto principal
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 210,
          display: "flex",
          flexDirection: "column",
          padding: "0 56px",
        },
      },
      h(
        "div",
        {
          style: {
            fontSize: tamañoTitulo,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.05,
            display: "flex",
            flexWrap: "wrap",
          },
        },
        "LÍNEAS DE EMPAQUE USADAS"
      ),
      h(
        "div",
        {
          style: {
            marginTop: 22,
            fontSize: tamañoSub,
            fontWeight: 500,
            color: "#e7f0e3",
            display: "flex",
          },
        },
        "Capacidad industrial sin pagar precio de nueva"
      ),
      h(
        "div",
        { style: { marginTop: 28, display: "flex", flexDirection: "column", gap: 14 } },
        ...["Revisadas y funcionando", "Ficha técnica completa", "Puedes venir a probarla"].map((txt) =>
          h(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 16 } },
            check(),
            h("div", { style: { fontSize: 30, color: "#ffffff", display: "flex" } }, txt)
          )
        )
      )
    ),
    // Barra CTA de WhatsApp
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 160,
          background: VERDE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        },
      },
      iconoWhatsapp(),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column" } },
        h(
          "div",
          { style: { fontSize: 38, fontWeight: 700, color: "#ffffff", display: "flex" } },
          "¡Escríbenos por WhatsApp!"
        ),
        h(
          "div",
          { style: { fontSize: 26, color: "#d8e8d2", display: "flex" } },
          "Ve el catálogo completo → catalogo-vivo-kappa.vercel.app"
        )
      )
    )
  );
}

async function generar(nombre, width, height, tamañoTitulo, tamañoSub, fotoPath) {
  const foto = dataUri(fotoPath, "image/jpeg");
  const res = new ImageResponse(anuncio({ width, height, tamañoTitulo, tamañoSub, foto }), {
    width,
    height,
  });
  const buf = Buffer.from(await res.arrayBuffer());
  const out = join(root, "anuncios", nombre);
  writeFileSync(out, buf);
  console.log("Generado:", out);
}

const fotoFinal = "public/productos/tomate-grape-4x12.jpg";
await generar("anuncio-final-cuadrado-1080x1080.png", 1080, 1080, 66, 32, fotoFinal);
await generar("anuncio-final-vertical-1080x1920.png", 1080, 1920, 74, 36, fotoFinal);
