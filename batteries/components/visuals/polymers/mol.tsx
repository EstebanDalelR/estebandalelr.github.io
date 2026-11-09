"use client";

import { C, Label } from "../primitives";

export const ATOM: Record<string, string> = {
  C: "#94a3b8",
  H: "#e6edf7",
  O: "#fb7185",
  N: "#60a5fa",
  Br: "#e2874b",
  R: "#a3e635",
};

/** A ball-and-stick atom. */
export function Atom({ x, y, el, r }: { x: number; y: number; el: string; r?: number }) {
  const rad = r ?? (el === "H" ? 10 : 15);
  return (
    <g>
      <circle cx={x} cy={y} r={rad} fill={ATOM[el] ?? C.accent} stroke="#0b1220" strokeWidth={1.5} />
      <Label x={x} y={y + rad * 0.36} size={rad * 0.95} weight={800} color="#0b1220">
        {el}
      </Label>
    </g>
  );
}

/** One, two or three parallel bond lines between two points. */
export function Bond({ x1, y1, x2, y2, order = 1, color = C.dim }: { x1: number; y1: number; x2: number; y2: number; order?: 1 | 2 | 3; color?: string }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * 5;
  const ny = (dx / len) * 5;
  const offsets = order === 1 ? [0] : order === 2 ? [-0.6, 0.6] : [-1.1, 0, 1.1];
  return (
    <g stroke={color} strokeWidth={3} strokeLinecap="round">
      {offsets.map((o) => (
        <line key={o} x1={x1 + nx * o} y1={y1 + ny * o} x2={x2 + nx * o} y2={y2 + ny * o} />
      ))}
    </g>
  );
}

/** A zig-zag backbone of n carbons starting at (x, y), returning the vertex positions. */
export function zigzag(n: number, x: number, y: number, step = 38, amp = 14): [number, number][] {
  return Array.from({ length: n }, (_, i) => [x + i * step, y + (i % 2 ? -amp : amp)] as [number, number]);
}

export function Backbone({ pts, color = C.dim, width = 3 }: { pts: [number, number][]; color?: string; width?: number }) {
  return <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" />;
}
