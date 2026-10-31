"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { CONFIG } from "@/lib/config";
import { linkLoQuiero } from "@/lib/whatsapp";
import type { SlideVideo } from "@/lib/feed";

/*
 * El catálogo en video: scroll vertical, una máquina por pantalla.
 *
 * Cómo funciona:
 *  - Cada pantalla trae su video de YouTube (reproductor con la API de YouTube,
 *    sin controles, en silencio al arrancar: así el navegador deja que arranque
 *    solo). Cuando la pantalla queda a la vista, el video corre; cuando sale,
 *    se pausa. Al final vuelve a empezar.
 *  - Un toque sobre el video lo pausa o lo sigue. El botón de la bocina
 *    prende el sonido (queda prendido para las siguientes pantallas).
 *  - Abajo: marca, nombre, un dato, y los botones: Ficha, Plano, Fotos y
 *    "Lo quiero" (WhatsApp, respeta al vendedor de la liga y el modo técnico).
 */

/* la API de YouTube se carga una sola vez */
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  seekTo: (s: number, allow: boolean) => void;
  destroy: () => void;
  getPlayerState?: () => number;
}
interface YTNamespace {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
}
let apiPromesa: Promise<YTNamespace> | null = null;
function cargarApiYoutube(): Promise<YTNamespace> {
  if (apiPromesa) return apiPromesa;
  apiPromesa = new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const anterior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { anterior?.(); resolve(window.YT!); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return apiPromesa;
}

interface Props {
  slides: SlideVideo[];
  vendedorSlug?: string | null;
  modoTecnico?: boolean;
}

export function FeedVideos({ slides, vendedorSlug, modoTecnico }: Props) {
  const [conSonido, setConSonido] = useState(false);
  const [activo, setActivo] = useState(0);
  const contenedor = useRef<HTMLDivElement>(null);
  const params = vendedorSlug ? `?v=${vendedorSlug}` : modoTecnico ? "?modo=tecnico" : "";

  /* cuál pantalla está a la vista */
  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setActivo(Number((e.target as HTMLElement).dataset.indice));
      },
      { root: el, threshold: 0.6 }
    );
    el.querySelectorAll("[data-indice]").forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [slides.length]);

  return (
    <div ref={contenedor} className="feed-videos h-[100dvh] w-full snap-y snap-mandatory overflow-y-scroll bg-black text-white">
      {/* barra de arriba */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))]">
        <Link href={`/${params}`} className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-sm backdrop-blur">
          <Icon name="lucide:layout-grid" size={16} /> Catálogo
        </Link>
        <span className="rounded-full bg-black/50 px-3 py-2 text-xs backdrop-blur">{activo + 1} / {slides.length}</span>
        <button
          onClick={() => setConSonido((v) => !v)}
          className="pointer-events-auto rounded-full bg-black/50 p-2.5 backdrop-blur"
          aria-label={conSonido ? "Quitar sonido" : "Poner sonido"}
        >
          <Icon name={conSonido ? "lucide:volume-2" : "lucide:volume-x"} size={18} />
        </button>
      </div>

      {slides.map((s, i) => (
        <Pantalla
          key={`${s.producto.slug}-${s.videoId}`}
          slide={s}
          indice={i}
          activa={i === activo}
          conSonido={conSonido}
          params={params}
          modoTecnico={!!modoTecnico}
          vendedorSlug={vendedorSlug}
          onPedirSonido={() => setConSonido(true)}
        />
      ))}
    </div>
  );
}

function Pantalla({
  slide, indice, activa, conSonido, params, modoTecnico, vendedorSlug, onPedirSonido,
}: {
  slide: SlideVideo; indice: number; activa: boolean; conSonido: boolean; params: string;
  modoTecnico: boolean; vendedorSlug?: string | null; onPedirSonido: () => void;
}) {
  const { producto, videoId } = slide;
  const caja = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const [listo, setListo] = useState(false);
  const [pausado, setPausado] = useState(false);

  /* crear el reproductor una vez */
  useEffect(() => {
    let vivo = true;
    cargarApiYoutube().then((YT) => {
      if (!vivo || !caja.current) return;
      player.current = new YT.Player(caja.current, {
        videoId,
        playerVars: { autoplay: 0, controls: 0, mute: 1, loop: 1, playlist: videoId, playsinline: 1, rel: 0, modestbranding: 1, fs: 0, disablekb: 1, iv_load_policy: 3 },
        events: { onReady: () => { if (vivo) setListo(true); } },
      });
    });
    return () => { vivo = false; try { player.current?.destroy(); } catch { /* nada */ } player.current = null; };
  }, [videoId]);

  /* correr o pausar según esté a la vista */
  useEffect(() => {
    const p = player.current;
    if (!p || !listo) return;
    if (activa && !pausado) { if (conSonido) p.unMute(); else p.mute(); p.playVideo(); }
    else p.pauseVideo();
  }, [activa, listo, pausado, conSonido]);

  const alternar = useCallback(() => {
    const p = player.current;
    if (!p) return;
    if (pausado) { p.playVideo(); setPausado(false); }
    else { p.pauseVideo(); setPausado(true); }
  }, [pausado]);

  const plano = producto.plano ? producto.plano.replace(".png", ".pdf") : null;
  const fotos = (producto.galeria?.length ?? 0) + (producto.imagen ? 1 : 0);
  const liga = `/producto/${producto.slug}${params}`;

  return (
    <section data-indice={indice} className="relative h-[100dvh] w-full snap-start overflow-hidden">
      {/* el video, centrado y llenando la altura (los shorts son 9:16) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full" style={{ aspectRatio: "9 / 16", minWidth: "100%", maxWidth: "max(100%, calc(100dvh * 9 / 16))" }}>
          <div ref={caja} className="absolute inset-0 h-full w-full [&>iframe]:h-full [&>iframe]:w-full" />
        </div>
      </div>
      {/* capa que recibe el toque (el iframe no deja pasar los toques) */}
      <button
        onClick={() => { if (!conSonido) onPedirSonido(); else alternar(); }}
        className="absolute inset-0 z-10 flex items-center justify-center"
        aria-label={pausado ? "Seguir" : conSonido ? "Pausar" : "Poner sonido"}
      >
        {!listo && <span className="rounded-full bg-black/50 px-4 py-2 text-sm">Cargando video…</span>}
        {listo && pausado && <Icon name="lucide:play" size={72} className="drop-shadow-lg" />}
        {listo && !pausado && !conSonido && activa && (
          <span className="rounded-full bg-black/50 px-4 py-2 text-sm backdrop-blur">Toca para escuchar</span>
        )}
      </button>

      {/* lo de abajo */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-24">
        <div className="pointer-events-auto mx-auto max-w-xl">
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
            {producto.marcaFabricante && <span className="rounded-full bg-white/15 px-2 py-0.5">{producto.marcaFabricante}</span>}
            {producto.estatus === "apartada" && <span className="rounded-full bg-amber-500/80 px-2 py-0.5">Apartada</span>}
            {producto.zona && <span className="text-white/70">{producto.zona}</span>}
            {slide.totalDeVideos > 1 && <span className="text-white/70">video {slide.numeroDeVideo} de {slide.totalDeVideos}</span>}
          </div>
          <h2 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{producto.nombreCorto ?? producto.nombre}</h2>
          {producto.resumenTarjeta && <p className="mt-1 text-sm text-white/80">{producto.resumenTarjeta}</p>}
          <p className="mt-1 text-sm font-semibold">{producto.precio}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={liga} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
              <Icon name="lucide:file-text" size={16} /> Ficha
            </Link>
            {plano && (
              <a href={plano} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
                <Icon name="lucide:ruler" size={16} /> Plano
              </a>
            )}
            {fotos > 0 && (
              <Link href={liga} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
                <Icon name="lucide:images" size={16} /> {fotos} fotos
              </Link>
            )}
            {!modoTecnico && (
              <a
                href={linkLoQuiero(CONFIG, producto, vendedorSlug)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "#25D366" }}
              >
                <Icon name="lucide:message-circle" size={16} /> Lo quiero
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
