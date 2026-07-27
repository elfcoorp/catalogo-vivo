import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const anuncios = join(__dirname, "..", "anuncios");

const items = [
  { file: "ejemplo-grape-1080x1080-thumb.jpg", label: "Tomate grape 4x12", pick: true },
  { file: "ejemplo-citricos-1080x1080-thumb.jpg", label: "Cítricos", pick: false },
  { file: "ejemplo-6-lineas-1080x1080-thumb.jpg", label: "Clasificadora 6 líneas", pick: false },
  { file: "ejemplo-roma-bola-1080x1080-thumb.jpg", label: "Tomate roma / bola", pick: false },
  { file: "ejemplo-4x12-morron-1080x1080-thumb.jpg", label: "Clasificadora 4x12 morrón", pick: false },
];

const cards = items
  .map(({ file, label, pick }) => {
    const b64 = readFileSync(join(anuncios, file)).toString("base64");
    return `
      <figure class="card${pick ? " card--pick" : ""}">
        <img src="data:image/jpeg;base64,${b64}" alt="Portada de anuncio: ${label}" width="480" height="480" />
        <figcaption>
          <span class="label">${label}</span>
          ${pick ? '<span class="pill">Recomendada</span>' : ""}
        </figcaption>
      </figure>`;
  })
  .join("\n");

const html = `<title>Comparación de portadas — elfco</title>
<style>
  :root {
    --verde-950: #1c2e1a;
    --verde-800: #31502e;
    --verde-500: #66a73d;
    --verde-100: #eef4ea;
    --ink: #202821;
    --ink-soft: #5c6b57;
    --bg: #faf9f6;
    --card-bg: #ffffff;
    --line: #e3e2dc;
  }
  :root[data-theme="dark"] {
    --bg: #14150f;
    --card-bg: #1d2019;
    --ink: #f2f1ec;
    --ink-soft: #a9b3a3;
    --line: #33362c;
    --verde-100: #223224;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #14150f;
      --card-bg: #1d2019;
      --ink: #f2f1ec;
      --ink-soft: #a9b3a3;
      --line: #33362c;
      --verde-100: #223224;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font-family: -apple-system, "Segoe UI", Inter, Arial, sans-serif;
    padding: 40px 24px 64px;
  }
  header {
    max-width: 1040px;
    margin: 0 auto 36px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  h1 {
    font-size: clamp(24px, 3vw, 32px);
    margin: 0;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  p.sub {
    margin: 0;
    color: var(--ink-soft);
    font-size: 15px;
    max-width: 60ch;
  }
  .grid {
    max-width: 1040px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
  }
  .card {
    background: var(--card-bg);
    border: 1px solid var(--line);
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .card--pick {
    border-color: var(--verde-500);
    box-shadow: 0 0 0 2px var(--verde-500) inset;
  }
  .card img {
    width: 100%;
    height: auto;
    display: block;
  }
  .card figcaption {
    padding: 12px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 14px;
  }
  .label { font-weight: 600; }
  .pill {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: var(--verde-100);
    color: var(--verde-800);
    padding: 4px 9px;
    border-radius: 999px;
    white-space: nowrap;
  }
  :root[data-theme="dark"] .pill,
  @media (prefers-color-scheme: dark) { .pill { color: var(--verde-500); } }
</style>
<header>
  <h1>Portadas de prueba para el anuncio</h1>
  <p class="sub">5 versiones con la misma plantilla (logo, titular, checklist, CTA de WhatsApp), cada una con la foto de una máquina distinta — formato 1080×1080 para feed.</p>
</header>
<div class="grid">
${cards}
</div>
`;

const out = join(anuncios, "comparacion.html");
writeFileSync(out, html);
console.log("Generado:", out);
