/**
 * QUIÉN ABRIÓ EL CATÁLOGO — el lado del servidor.
 *
 * Cada liga que Eduardo manda por WhatsApp lleva una clave chiquita por
 * contacto (?c=abc123). Cuando esa persona abre el catálogo, el componente
 * Huella (components/ui/Huella.tsx) manda aquí la clave y la página que vio.
 * Esto lo apunta en la base Redis que Eduardo conectó en Vercel el 14 de
 * septiembre de 2026 (Upstash, plan gratis).
 *
 * Lo lee después herramientas/quien-abrio.mjs del ERP, y de ahí sale la
 * lista de a quién llamarle: "Rubén vio la MAF dos veces".
 *
 * ⚠️ NO se guarda IP, ni nombre, ni nada de la persona: nada más la clave que
 * Eduardo mismo le puso a su liga, la ruta y la hora. La clave sólo tiene
 * sentido junto con la lista de contactos que vive en el ERP, en su máquina.
 */
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/* Los nombres de las variables los puso Vercel al conectar la base. */
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

/** La clave son 6 letras/números; cualquier otra cosa se ignora sin ruido. */
const CLAVE = /^[a-z0-9]{4,8}$/;

/**
 * EL REPORTE se pide aquí mismo, con GET, y no directo a Redis. Por qué: las
 * llaves de Redis están marcadas "Sensitive" en Vercel, así que la máquina de
 * Eduardo no las puede bajar (vercel env pull las entrega como [SENSITIVE]).
 * Y está bien que sea así. Lo que sí tiene su máquina es REPORTE_TOKEN, una
 * llave aparte que sólo sirve para LEER este reporte. Aquí adentro, el
 * servidor sí tiene las de Redis.
 *
 * Devuelve claves y visitas, nada más. Los NOMBRES no están aquí: los pone el
 * ERP en la máquina de Eduardo (herramientas/quien-abrio.mjs).
 */
export async function GET(req: Request) {
  const esperado = process.env.REPORTE_TOKEN;
  const auth = req.headers.get("authorization") ?? "";
  if (!esperado || auth !== "Bearer " + esperado) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const dias = Number(new URL(req.url).searchParams.get("dias") ?? 0) || 0;
  const desde = dias ? Date.now() - dias * 86400000 : 0;

  const claves = await redis.smembers("claves");
  const salida: { c: string; vistas: { ruta: string; t: string }[] }[] = [];
  for (const c of claves) {
    const crudo = await redis.lrange<string | { ruta: string; t: string }>(`abrio:${c}`, 0, 199);
    /* el cliente de Upstash a veces ya devuelve el JSON convertido */
    const vistas = crudo
      .map((s) => (typeof s === "string" ? (JSON.parse(s) as { ruta: string; t: string }) : s))
      .filter((v) => new Date(v.t).getTime() >= desde);
    if (vistas.length) salida.push({ c, vistas });
  }
  return NextResponse.json({ ok: true, claves: salida }, { headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request) {
  let cuerpo: { c?: unknown; ruta?: unknown } = {};
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const c = String(cuerpo.c ?? "").toLowerCase();
  const ruta = String(cuerpo.ruta ?? "/").slice(0, 120);
  if (!CLAVE.test(c)) return NextResponse.json({ ok: false }, { status: 400 });

  const t = new Date().toISOString();
  await Promise.all([
    /* la lista de lo que vio, la más reciente primero; se guardan las últimas 200 */
    redis.lpush(`abrio:${c}`, JSON.stringify({ ruta, t })),
    redis.ltrim(`abrio:${c}`, 0, 199),
    /* el conjunto de claves que han abierto algo, para recorrerlas después */
    redis.sadd("claves", c),
    redis.set(`ultimo:${c}`, t),
  ]);
  return NextResponse.json({ ok: true });
}
