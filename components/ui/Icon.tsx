"use client";

import { Icon as Iconify } from "@iconify/react";

/**
 * Íconos y logos de marca REALES vía Iconify (miles de packs).
 * Nombres útiles para esta clase:
 *   - "logos:claude-icon", "logos:anthropic-icon"
 *   - "logos:nodejs-icon", "logos:vercel-icon", "logos:github-icon", "logos:git-icon"
 *   - "logos:tiktok-icon", "logos:instagram-icon", "logos:youtube-icon", "logos:facebook"
 *   - "logos:apple", "logos:microsoft-windows-icon"
 *   - "flat-color-icons:clapperboard", "fluent-emoji-flat:rocket"
 */
export function Icon({
  name,
  size = 24,
  className,
  style,
}: {
  name: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return <Iconify icon={name} width={size} height={size} className={className} style={style} />;
}
