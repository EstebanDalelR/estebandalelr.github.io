"use client";

import { C } from "../primitives";

/** Zig-zag resistor from (x, y), horizontal (to the right) or vertical (downwards). */
export function Resistor({
  x,
  y,
  len = 60,
  vertical = false,
  color = C.ink,
  width = 2.5,
}: {
  x: number;
  y: number;
  len?: number;
  vertical?: boolean;
  color?: string;
  width?: number;
}) {
  const n = 6;
  const body = len * 0.7;
  const pts: [number, number][] = [
    [0, 0],
    [len * 0.15, 0],
  ];
  for (let k = 0; k < n; k++) pts.push([len * 0.15 + ((k + 0.5) * body) / n, k % 2 ? 7 : -7]);
  pts.push([len * 0.85, 0], [len, 0]);
  const d = pts.map(([a, b], i) => `${i ? "L" : "M"}${vertical ? x + b : x + a} ${vertical ? y + a : y + b}`).join(" ");
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" />;
}

/** Battery cell drawn across a vertical wire: long (+) plate on top. */
export function Cell({ x, y, color = C.ink }: { x: number; y: number; color?: string }) {
  return (
    <g>
      <line x1={x - 16} x2={x + 16} y1={y - 5} y2={y - 5} stroke={color} strokeWidth={3} />
      <line x1={x - 8} x2={x + 8} y1={y + 5} y2={y + 5} stroke={color} strokeWidth={5} />
    </g>
  );
}

export function Wire({ d, color = C.dim }: { d: string; color?: string }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />;
}

/** Rotor with spokes (wrap in a rotating motion.g to spin it). */
export function Rotor({ x, y, r = 28, color = C.lfp }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#111a2c" stroke={color} strokeWidth={3} />
      {[0, 60, 120].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={x - Math.cos(rad) * (r - 5)}
            y1={y - Math.sin(rad) * (r - 5)}
            x2={x + Math.cos(rad) * (r - 5)}
            y2={y + Math.sin(rad) * (r - 5)}
            stroke={color}
            strokeWidth={2.5}
          />
        );
      })}
      <circle cx={x} cy={y} r={4} fill={color} />
    </g>
  );
}
