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
