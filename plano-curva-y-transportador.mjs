/**
 * Hojas técnicas de ELFCO (dibujo propio, estilo plano: líneas delgadas,
 * tres vistas, cotas en mm y tabla técnica) para:
 *   1. la curva de banda termoplástica 90° de 0.90 m
 *   2. el transportador de rodillos motorizado 16" x 3.00 m
 * Los datos técnicos salen de la hoja del fabricante y de su cotización
 * (21-oct-2026). La hoja del fabricante NO se publica: estos dibujos son nuestros.
 *
 *   node plano-curva-y-transportador.mjs && node planos-a-pdf.mjs
 */
import sharp from "sharp";

const W = 1700, H = 2200;                    // hoja vertical, como ficha
const azul = "#1E4E8C", tinta = "#222", gr = "#777", suave = "#f3f5f8";
const T = (x, y, t, s = 16, a = "start", w = 400, c = tinta, extra = "") => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${s}" font-weight="${w}" text-anchor="${a}" fill="${c}" ${extra}>${t}</text>`;
const L = (x1, y1, x2, y2, w = 1.2, c = tinta, dash = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
const R = (x, y, w, h, sw = 1.2, fill = "none") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${tinta}" stroke-width="${sw}"/>`;
/* cota horizontal con flechas, estilo plano */
const cotaH = (x1, x2, y, label) => L(x1, y, x2, y, 1, azul) + L(x1, y - 7, x1, y + 7, 1, azul) + L(x2, y - 7, x2, y + 7, 1, azul)
  + `<path d="M ${x1} ${y} l 9 -4 l 0 8 z M ${x2} ${y} l -9 -4 l 0 8 z" fill="${azul}"/>` + T((x1 + x2) / 2, y - 9, label, 17, "middle", 400, tinta);
const cotaV = (x, y1, y2, label) => L(x, y1, x, y2, 1, azul) + L(x - 7, y1, x + 7, y1, 1, azul) + L(x - 7, y2, x + 7, y2, 1, azul)
  + `<path d="M ${x} ${y1} l -4 9 l 8 0 z M ${x} ${y2} l -4 -9 l 8 0 z" fill="${azul}"/>` + T(x + 12, (y1 + y2) / 2 + 6, label, 17, "start");
const etiquetaVista = (x, y, t) => T(x, y, t, 18, "start", 700, azul, 'font-style="italic"') + L(x + 200, y - 6, x + 520, y - 6, 8, "#e3e7ee");
const cabecera = (titulo, sub) => `<rect x="0" y="0" width="${W}" height="150" fill="${suave}"/>` + L(60, 150, W - 60, 150, 2, azul)
  + T(60, 70, titulo, 46, "start", 700, azul, 'font-style="italic"') + T(60, 118, sub, 24, "start", 400, gr, 'font-style="italic"') + T(W - 60, 70, "elfco", 40, "end", 700, "#1B5E20") + T(W - 60, 100, "maquinaria usada y verificada", 15, "end", 400, gr);
const pie = () => `<rect x="0" y="${H - 70}" width="${W}" height="70" fill="${azul}"/>` + T(60, H - 28, "catalogo-vivo-kappa.vercel.app", 22, "start", 700, "#fff") + T(W - 60, H - 28, "WhatsApp +52 622 145 3333 · Ciudad Obregón · Guaymas, Sonora", 18, "end", 400, "#fff")
  + T(W - 60, H - 84, "Dibujo de ELFCO. Medidas en milímetros. Las marcadas aprox. se confirman en sitio.", 13, "end", 400, gr);
/* tabla técnica estilo ficha */
const tabla = (x, y, filas, ancho = 760) => { let g = ""; filas.forEach(([k, v], i) => { const yy = y + i * 44; g += `<rect x="${x}" y="${yy}" width="${ancho}" height="38" fill="${i % 2 ? "#fff" : "#eef1f6"}"/>` + T(x + 14, yy + 26, k, 17, "start", 700, azul) + T(x + 300, yy + 26, v, 17, "start"); }); return g; };

/* ================= 1. CURVA 90° ================= */
{
  const S = 0.44; // px por mm
  const ancho = 900, rIn = 600, rOut = rIn + ancho, tramo = 300;
  const cx = 160 + tramo * S, cy = 230 + rOut * S;
  const P = (r, a) => [cx + r * S * Math.cos(a), cy - r * S * Math.sin(a)];
  const arco = (r, sweep) => { const [ax, ay] = P(r, Math.PI / 2), [bx, by] = P(r, 0); return sweep ? `M ${ax} ${ay} A ${r * S} ${r * S} 0 0 1 ${bx} ${by}` : `M ${bx} ${by} A ${r * S} ${r * S} 0 0 0 ${ax} ${ay}`; };
  let g = "";
  /* rieles exteriores e interiores (doble línea = canto de la estructura) */
  for (const r of [rOut, rOut - 35, rIn + 35, rIn]) g += `<path d="${arco(r, true)}" fill="none" stroke="${tinta}" stroke-width="${r === rOut || r === rIn ? 1.8 : 1}"/>`;
  /* banda: líneas de guía */
  for (let k = 1; k <= 3; k++) g += `<path d="${arco(rIn + 35 + ((ancho - 70) * k) / 4, true)}" fill="none" stroke="${gr}" stroke-width="0.8"/>`;
  /* tramos rectos de entrada (arriba, izquierda) y salida (abajo, derecha) */
  const [ex, ey] = P(rOut, Math.PI / 2); // esquina superior exterior
  g += R(ex - tramo * S, ey, tramo * S, ancho * S, 1.8) + L(ex - tramo * S, ey + 35 * S, ex, ey + 35 * S) + L(ex - tramo * S, ey + (ancho - 35) * S, ex, ey + (ancho - 35) * S);
  const [sx, sy] = P(rIn, 0); // esquina interior derecha
  g += R(sx, sy, ancho * S, tramo * S, 1.8) + L(sx + 35 * S, sy, sx + 35 * S, sy + tramo * S) + L(sx + (ancho - 35) * S, sy, sx + (ancho - 35) * S, sy + tramo * S);
  /* rodillo de salida y motorreductor */
  g += R(sx - 6, sy + tramo * S - 30, ancho * S + 12, 30, 1.2) + R(sx + ancho * S + 12, sy + tramo * S - 48, 70, 54, 1.2) + `<circle cx="${sx + ancho * S + 47}" cy="${sy + tramo * S - 21}" r="14" fill="none" stroke="${tinta}" stroke-width="1"/>` + T(sx + ancho * S + 92, sy + tramo * S - 16, "motorreductor 1 HP", 14);
  /* patas (círculos) */
  for (const [px, py] of [[ex - tramo * S + 20, ey + 20], [ex - tramo * S + 20, ey + ancho * S - 20], [sx + ancho * S - 20, sy + tramo * S - 20], [sx + 20, sy + tramo * S - 20], P(rOut - 20, Math.PI / 4), P(rIn + 20, Math.PI / 4)]) g += `<circle cx="${px}" cy="${py}" r="5" fill="none" stroke="${tinta}" stroke-width="1"/>`;
  /* cotas */
  g += cotaH(ex - tramo * S, sx + ancho * S, ey - 40, `${tramo + rOut} aprox.`);
  g += cotaV(sx + ancho * S + 180, ey, sy + tramo * S, `${rOut + tramo} aprox.`);
  g += cotaV(ex - tramo * S - 60, ey, ey + ancho * S, "900");
  g += T(ex - tramo * S - 60, ey + ancho * S / 2 + 40, "A", 20, "middle", 700, azul);
  /* ángulo B */
  const ra = 260 * S; g += `<path d="M ${cx + ra} ${cy} A ${ra} ${ra} 0 0 0 ${cx} ${cy - ra}" fill="none" stroke="${azul}" stroke-width="1"/>` + `<path d="M ${cx} ${cy - ra} l -5 10 l 10 0 z" fill="${azul}"/>` + T(cx + ra * 0.78, cy - ra * 0.78, "B = 90°", 18, "middle", 700, azul);
  g += L(cx, cy, cx + rOut * S + 40, cy, 0.8, azul, "6 5") + L(cx, cy, cx, cy - rOut * S - 40, 0.8, azul, "6 5");
  g += T(cx + 20, cy - 12, `R interior ${rIn} aprox.`, 14, "start", 400, gr);
  g += etiquetaVista(160, cy + tramo * S + 120, "VISTA DE PLANTA");
  /* frente */
  const fy = cy + tramo * S + 190, fx = 160, fw = 1050, alto = 760 * S, canto = 110 * S;
  let f = R(fx, fy, fw, canto, 1.8) + L(fx, fy + canto * 0.45, fx + fw, fy + canto * 0.45, 0.8, gr);
  for (const px of [fx + 40, fx + fw * 0.5 - 8, fx + fw - 56]) f += R(px, fy + canto, 16, alto - canto, 1.2) + R(px - 10, fy + alto - 8, 36, 8, 1.2);
  f += L(fx + 48, fy + alto * 0.62, fx + fw * 0.5, fy + alto * 0.62, 1) + L(fx + fw * 0.5, fy + alto * 0.62, fx + fw - 48, fy + alto * 0.62, 1);
  f += R(fx + fw + 10, fy + 6, 60, 70, 1.2) + `<circle cx="${fx + fw + 40}" cy="${fy + 41}" r="20" fill="none" stroke="${tinta}" stroke-width="1"/>`;
  f += cotaV(fx + fw + 120, fy, fy + alto, "C = altura ajustable");
  f += etiquetaVista(160, fy + alto + 60, "VISTA DE FRENTE");
  /* tabla */
  const ty = fy + alto + 110;
  const tb = T(160, ty - 14, "CARACTERÍSTICAS TÉCNICAS", 22, "start", 700, azul, 'font-style="italic"') + tabla(160, ty, [
    ["Ancho de banda (A)", "0.90 m"], ["Grados (B)", "90°"], ["Capacidad", "10 a 14 ton/h"], ["Motor", "1 HP · 0.74 kW · trifásico 220/440 V, 60 Hz"], ["Peso", "aprox. 527 kg"],
    ["Banda", "termoplástica de polipropileno de 2\""], ["Estructura", "acero al carbón, pintura electrostática; contacto con la fruta en inoxidable"], ["Altura (C)", "ajustable, según la línea donde se conecte"],
  ], 1380);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#fff"/>${cabecera("CURVA DE BANDA TERMOPLÁSTICA", "90° · 0.90 m de ancho · características técnicas")}${g}${f}${tb}${pie()}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile("public/planos/curva-termoplastica-plano.png");
  console.log("curva ok");
}

/* ================= 2. TRANSPORTADOR DE RODILLOS 16" x 3.00 m ================= */
{
  const S = 0.40; // px por mm
  const largo = 3000, anchoUtil = 406, marco = 40, alto = 570, bar = 90;
  const ox = 160, oy = 240;
  const wT = largo * S, hT = (anchoUtil + marco * 2) * S;
  let g = R(ox, oy, wT, hT, 1.8) + L(ox, oy + marco * S, ox + wT, oy + marco * S) + L(ox, oy + hT - marco * S, ox + wT, oy + hT - marco * S);
  const paso = 76; for (let x = ox + 12; x < ox + wT - 10; x += paso * S) g += L(x, oy + marco * S + 2, x, oy + hT - marco * S - 2, 0.9, "#555");
  /* ligas (dibujo de la cadena de ligas a un lado) */
  for (let x = ox + 12; x < ox + wT - 10; x += paso * S) g += `<circle cx="${x}" cy="${oy + marco * S / 2}" r="4" fill="none" stroke="${tinta}" stroke-width="0.8"/>`;
  g += cotaH(ox, ox + wT, oy - 40, "3000");
  g += cotaV(ox + wT + 40, oy, oy + hT, `${anchoUtil + marco * 2}`) + cotaV(ox + wT + 150, oy + marco * S, oy + hT - marco * S, `${anchoUtil} útil`);
  g += etiquetaVista(160, oy + hT + 70, "VISTA DE PLANTA");
  /* lateral */
  const ly = oy + hT + 160;
  let l = R(ox, ly + bar * S, wT, 110 * S, 1.8);
  for (let x = ox + 12; x < ox + wT - 10; x += paso * S) l += `<circle cx="${x}" cy="${ly + bar * S + 55 * S}" r="${22 * S}" fill="none" stroke="#555" stroke-width="0.8"/>`;
  /* barandal */
  l += L(ox, ly, ox + wT, ly, 1.4) + L(ox, ly + 10, ox + wT, ly + 10, 0.8); for (let x = ox + 30; x < ox + wT; x += 500 * S) l += L(x, ly, x, ly + bar * S, 1);
  /* patas y motor punteados: no incluidos */
  for (const x of [ox + 250 * S, ox + wT - 250 * S]) l += R(x - 8, ly + (bar + 110) * S, 16, (alto - 110) * S, 1, "none").replace("stroke-width=\"1\"", "stroke-width=\"1\" stroke-dasharray=\"7 5\"");
  l += R(ox + 1200 * S, ly + (bar + 110) * S + 6, 70, 46, 1).replace("stroke-width=\"1\"", "stroke-width=\"1\" stroke-dasharray=\"7 5\"") + T(ox + 1200 * S + 35, ly + (bar + 110) * S + 36, "motor", 13, "middle");
  l += cotaV(ox + wT + 40, ly + bar * S, ly + (bar + alto) * S, `${alto} ref.`) + cotaV(ox + wT + 150, ly, ly + bar * S, `${bar}`);
  l += T(ox, ly + (bar + alto) * S + 40, "Lo punteado NO viene: motorreductor trifásico 220/440 V y patas se consiguen aparte.", 16, "start", 700, "#C77D00");
  l += etiquetaVista(160, ly + (bar + alto) * S + 90, "VISTA LATERAL");
  /* frontal */
  const fy = ly + (bar + alto) * S + 150, fx = 160;
  let f = R(fx, fy + bar * S, hT, 110 * S, 1.8) + L(fx, fy, fx, fy + bar * S, 1.4) + L(fx + hT, fy, fx + hT, fy + bar * S, 1.4) + L(fx - 6, fy, fx + 6, fy, 1.4) + L(fx + hT - 6, fy, fx + hT + 6, fy, 1.4);
  f += `<circle cx="${fx + hT / 2}" cy="${fy + bar * S + 55 * S}" r="${22 * S}" fill="none" stroke="#555" stroke-width="0.8"/>` + L(fx + marco * S, fy + bar * S + 55 * S, fx + hT - marco * S, fy + bar * S + 55 * S, 1);
  for (const x of [fx + 18, fx + hT - 34]) f += R(x, fy + (bar + 110) * S, 16, (alto - 110) * S, 1).replace("stroke-width=\"1\"", "stroke-width=\"1\" stroke-dasharray=\"7 5\"");
  f += cotaH(fx, fx + hT, fy - 30, `${anchoUtil + marco * 2}`);
  f += etiquetaVista(160 + hT + 120, fy + 60, "VISTA FRONTAL");
  /* tabla */
  const ty = fy + 60;
  const tb = T(160 + hT + 120, ty + 40, "CARACTERÍSTICAS TÉCNICAS", 22, "start", 700, azul, 'font-style="italic"') + tabla(160 + hT + 120, ty + 54, [
    ["Dimensiones (mm)", `${largo} x ${anchoUtil + marco * 2} x altura a definir`], ["Ancho útil", "16\" (406 mm)"], ["Tramos", "6, de 3.00 m cada uno"], ["Tipo", "motorizado: rodillos con ligas de transmisión"],
    ["Barandal", "incluido, a los dos lados"], ["Material", "acero al carbón con pintura electrostática"], ["Motorreductor", "NO incluido · trifásico 220/440 V"], ["Patas", "NO incluidas"],
  ], 1050);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#fff"/>${cabecera("TRANSPORTADOR DE RODILLOS", "motorizado · 16\" x 3.00 m · 6 tramos · sin motor ni patas")}${g}${l}${f}${tb}${pie()}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile("public/planos/transportador-rodillos-plano.png");
  console.log("transportador ok");
}
