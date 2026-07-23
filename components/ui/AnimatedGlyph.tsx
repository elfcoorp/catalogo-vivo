"use client";

import { motion } from "framer-motion";
import { Icon as BrandIcon } from "./Icon";
import { cn } from "@/lib/cn";

interface AnimatedGlyphProps {
  /** Nombre Iconify a color (ej. "fluent-emoji-flat:clapper-board"). */
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Flotación continua (idle). */
  float?: boolean;
}

const SIZES = {
  sm: { box: "h-12 w-12 rounded-2xl", icon: 24 },
  md: { box: "h-16 w-16 rounded-2xl", icon: 36 },
  lg: { box: "h-20 w-20 rounded-3xl", icon: 46 },
  xl: { box: "h-24 w-24 rounded-[1.75rem]", icon: 58 },
};

/** Ícono con PERSONALIDAD: ícono a color (Iconify) sobre una placa con profundidad
 *  3D, anillo cónico girando, glow interno, punto pulsante, entrada con spring +
 *  rotateY y movimiento idle. Se siente diseñado por un UX/UI, no "hecho con Claude". */
export function AnimatedGlyph({ name, color = "#1db954", size = "md", className, float = true }: AnimatedGlyphProps) {
  const s = SIZES[size];
  return (
    <div className={cn("inline-block", float && "anim-floaty", className)} style={{ perspective: 700 }}>
      <motion.span
        initial={{ scale: 0.4, opacity: 0, rotateY: -45 }}
        whileInView={{ scale: 1, opacity: 1, rotateY: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 240, damping: 16 }}
        whileHover={{ scale: 1.09, rotateX: 10, rotateY: -10 }}
        style={{
          transformStyle: "preserve-3d",
          background: `linear-gradient(150deg, ${color}38, ${color}0a)`,
          border: `1px solid ${color}45`,
          boxShadow: `0 18px 44px -16px ${color}99, inset 0 1px 0 rgba(255,255,255,0.14)`,
        }}
        className={cn("relative grid place-items-center overflow-hidden", s.box)}
      >
        {/* anillo cónico girando = profundidad / reactor */}
        <span
          className="anim-spin-slow absolute inset-[-40%] opacity-25"
          style={{ background: `conic-gradient(from 0deg, transparent, ${color}, transparent 55%)` }}
        />
        {/* glow interno */}
        <span
          className="absolute inset-0 rounded-[inherit]"
          style={{ background: `radial-gradient(62% 62% at 30% 20%, ${color}50, transparent 70%)` }}
        />
        {/* brillo superior (cristal) */}
        <span className="absolute inset-x-2 top-1 h-1/3 rounded-full bg-white/15 blur-md" />
        {/* ícono real a color */}
        <BrandIcon name={name} size={s.icon} className="relative drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]" />
        {/* punto pulsante */}
        <span
          className="anim-pulse-glow absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 10px ${color}` }}
        />
      </motion.span>
    </div>
  );
}
