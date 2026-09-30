"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

export const W = 600;
export const H = 450;

export const C = {
  ink: "#e6edf7",
  dim: "#8da0bc",
  grid: "#26324a",
  zinc: "#9fb3c8",
  copper: "#e2874b",
  cloth: "#c8b48a",
  electron: "#facc15",
  cation: "#2dd4bf",
  anion: "#c084fc",
  lithium: "#a3e635",
  graphite: "#475569",
  lfp: "#60a5fa",
  hot: "#fb7185",
  accent: "#3dd6c6",
};

export function Stage({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={label}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={C.ink} />
        </marker>
        <marker id="arrow-e" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={C.electron} />
        </marker>
        <radialGradient id="glow">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {children}
    </svg>
  );
}

/** Fade/slide a group in when `show` flips on. */
export function Reveal({ show, children, delay = 0 }: { show: boolean; children: ReactNode; delay?: number }) {
  return (
    <motion.g
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.5, delay: show ? delay : 0 }}
      style={{ pointerEvents: show ? "auto" : "none" }}
    >
      {children}
    </motion.g>
  );
}

export function Label({
  x,
  y,
  children,
  size = 15,
  color = C.ink,
  anchor = "middle",
  weight = 500,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  weight?: number;
}) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} textAnchor={anchor} fontWeight={weight} fontFamily="var(--font-geist-sans), sans-serif">
      {children}
    </text>
  );
}

/**
 * A native SVG keyframe loop, placed inside the element it animates. framer-motion
 * keyframe loops on SVG attributes stop after one pass, so looping attribute
 * animations use this instead. It (re)starts from the first keyframe whenever
 * `active` turns on, which keeps step-by-step walks in sync with their labels.
 * `attr="translate"` animates the transform with "dx dy" values.
 */
export function SvgLoop({
  attr,
  values,
  keyTimes,
  dur,
  active = true,
}: {
  attr: string;
  values: (number | string)[];
  keyTimes?: number[];
  dur: number;
  active?: boolean;
}) {
  const ref = useRef<SVGAnimationElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) el.beginElement();
    else el.endElement();
  }, [active]);
  const common = {
    values: values.join(";"),
    keyTimes: keyTimes?.join(";"),
    dur: `${dur}s`,
    begin: "indefinite",
    repeatCount: "indefinite",
  };
  return attr === "translate" ? (
    <animateTransform ref={ref as React.Ref<SVGAnimateTransformElement>} attributeName="transform" type="translate" {...common} />
  ) : (
    <animate ref={ref as React.Ref<SVGAnimateElement>} attributeName={attr} {...common} />
  );
}

/** A recap card that jumps back to its chapter (hover lights the card's outline). */
export function RecapLink({ href, title, children }: { href: string; title: string; children: ReactNode }) {
  return (
    <a href={href} className="group cursor-pointer" aria-label={`Jump to ${title}`}>
      <title>{title}</title>
      {children}
    </a>
  );
}

export const RECAP_CARD_CLASS = "transition-colors group-hover:fill-[#16233a] group-hover:stroke-[#3dd6c6]";

/** Particles that travel along an SVG path forever. */
export function Flow({
  path,
  count = 5,
  dur = 3,
  color = C.electron,
  r = 5,
  label,
  reverse = false,
}: {
  path: string;
  count?: number;
  dur?: number;
  color?: string;
  r?: number;
  label?: string;
  reverse?: boolean;
}) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <g key={i}>
          <circle r={r} fill={color}>
            <animateMotion
              dur={`${dur}s`}
              repeatCount="indefinite"
              begin={`${(-i * dur) / count}s`}
              path={path}
              keyPoints={reverse ? "1;0" : "0;1"}
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
          {label && (
            <text fontSize={r * 1.6} fill="#111" textAnchor="middle" dy={r * 0.55} fontWeight={700}>
              {label}
              <animateMotion
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${(-i * dur) / count}s`}
                path={path}
                keyPoints={reverse ? "1;0" : "0;1"}
                keyTimes="0;1"
                calcMode="linear"
              />
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

export function Ion({ x, y, sign, color, r = 11 }: { x: number; y: number; sign: "+" | "−"; color: string; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} opacity={0.9} />
      <text x={x} y={y + r * 0.45} fontSize={r * 1.3} textAnchor="middle" fill="#0b1220" fontWeight={800}>
        {sign}
      </text>
    </g>
  );
}

type Box = { x: number; y: number; w: number; h: number };

export type Scale = {
  sx: (v: number) => number;
  sy: (v: number) => number;
  path: (pts: [number, number][]) => string;
};

export function makeScale(box: Box, xd: [number, number], yd: [number, number]): Scale {
  const sx = (v: number) => box.x + ((v - xd[0]) / (xd[1] - xd[0])) * box.w;
  const sy = (v: number) => box.y + box.h - ((v - yd[0]) / (yd[1] - yd[0])) * box.h;
  const path = (pts: [number, number][]) =>
    pts.map(([a, b], i) => `${i ? "L" : "M"}${sx(a).toFixed(1)},${sy(b).toFixed(1)}`).join("");
  return { sx, sy, path };
}

export function Axes({
  box,
  xLabel,
  yLabel,
  origin,
  xLabelDy = 26,
}: {
  box: Box;
  xLabel: string;
  yLabel: string;
  /** Pixel position of the axes crossing; defaults to bottom-left. */
  origin?: { x?: number; y?: number };
  /** Push the x-axis title further down when tick labels sit under the axis. */
  xLabelDy?: number;
}) {
  const ox = origin?.x ?? box.x;
  const oy = origin?.y ?? box.y + box.h;
  return (
    <g stroke={C.dim} strokeWidth={1.5}>
      <line x1={box.x} y1={oy} x2={box.x + box.w + 8} y2={oy} markerEnd="url(#arrow)" />
      <line x1={ox} y1={box.y + box.h} x2={ox} y2={box.y - 8} markerEnd="url(#arrow)" />
      <g stroke="none">
        <Label x={box.x + box.w} y={oy + xLabelDy} anchor="end" size={14} color={C.dim}>
          {xLabel}
        </Label>
        <Label x={ox + 8} y={box.y - 14} anchor="start" size={14} color={C.dim}>
          {yLabel}
        </Label>
      </g>
    </g>
  );
}

/** A path that draws itself when shown. */
export function DrawPath({
  d,
  show = true,
  color = C.accent,
  width = 3,
  dur = 1.2,
  dash,
  delay = 0,
}: {
  d: string;
  show?: boolean;
  color?: string;
  width?: number;
  dur?: number;
  dash?: string;
  delay?: number;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dash}
      initial={false}
      animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
      transition={{ duration: show ? dur : 0.3, delay: show ? delay : 0, ease: "easeInOut" }}
    />
  );
}

export function Chip({ x, y, text, color = C.accent, w }: { x: number; y: number; text: string; color?: string; w?: number }) {
  const width = w ?? text.length * 8 + 20;
  return (
    <g>
      <rect x={x - width / 2} y={y - 14} width={width} height={26} rx={13} fill={color} opacity={0.16} stroke={color} />
      <Label x={x} y={y + 4} size={13} color={color}>
        {text}
      </Label>
    </g>
  );
}
