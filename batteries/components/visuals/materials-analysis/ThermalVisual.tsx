"use client";

import { C, Chip, DrawPath, Label, Reveal, Stage } from "../primitives";
import { Title } from "../blocks";

const PROGRAMS: { t: string; d: string; c: string }[] = [
  { t: "isothermal", d: "M0 40 L120 40", c: C.lfp },
  { t: "dynamic (ramp)", d: "M0 70 L120 10", c: C.electron },
  { t: "heat & cool", d: "M0 70 L60 10 L120 70", c: C.hot },
  { t: "ramp + hold", d: "M0 70 L40 35 L80 35 L120 5", c: C.lithium },
  {
    t: "modulated",
    d: "M0 70 " + Array.from({ length: 24 }, (_, i) => `L${(i + 1) * 5} ${70 - (i + 1) * 2.5 + Math.sin((i + 1) * 1.6) * 6}`).join(" "),
    c: C.anion,
  },
];

export default function ThermalVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Thermal analysis principle">
      <Reveal show={is("furnace")}>
        <Title>Sample in a crucible, in a furnace</Title>
        <rect x={150} y={90} width={300} height={220} rx={20} fill="#1a1420" stroke={C.hot} strokeWidth={3} />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M${170 + i * 42} 300 q 6 -10 0 -20 q -6 -10 0 -20`} fill="none" stroke={C.hot} strokeWidth={2} opacity={0.6}>
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${1.5 + (i % 3) * 0.4}s`} repeatCount="indefinite" />
          </path>
        ))}
        <path d="M210 170 L230 220 L270 220 L290 170 Z" fill="#111a2c" stroke={C.ink} strokeWidth={2} />
        <rect x={232} y={198} width={36} height={18} fill={C.electron} />
        <path d="M310 170 L330 220 L370 220 L390 170 Z" fill="#111a2c" stroke={C.ink} strokeWidth={2} />
        <Label x={250} y={250} size={13}>
          sample
        </Label>
        <Label x={350} y={250} size={13}>
          reference
        </Label>
        <line x1={250} y1={222} x2={250} y2={330} stroke={C.dim} strokeWidth={2} />
        <line x1={350} y1={222} x2={350} y2={330} stroke={C.dim} strokeWidth={2} />
        <Label x={300} y={110} size={13} color={C.hot}>
          furnace follows T(t)
        </Label>
        {[
          ["mass", "TGA", C.lithium],
          ["ΔT", "DTA", C.electron],
          ["heat flow", "DSC", C.hot],
          ["strain", "TMA/DMA", C.lfp],
        ].map(([q, t, c], i) => (
          <Chip key={t} x={82 + i * 145} y={380} text={`${q} → ${t}`} color={c} w={138} />
        ))}
      </Reveal>

      <Reveal show={is("programs")}>
        <Title>Temperature programs</Title>
        {PROGRAMS.map((p, i) => {
          const x = 40 + (i % 3) * 185;
          const y = 85 + Math.floor(i / 3) * 160;
          return (
            <g key={p.t} transform={`translate(${x} ${y})`}>
              <rect x={-10} y={-10} width={160} height={120} rx={10} fill="#111a2c" stroke={C.grid} />
              <line x1={0} y1={80} x2={135} y2={80} stroke={C.dim} markerEnd="url(#arrow)" />
              <line x1={0} y1={80} x2={0} y2={-2} stroke={C.dim} markerEnd="url(#arrow)" />
              <g transform="translate(6 4)">
                <DrawPath d={p.d} show={is("programs")} color={p.c} delay={i * 0.15} />
              </g>
              <Label x={70} y={100} size={13} weight={700} color={p.c}>
                {p.t}
              </Label>
            </g>
          );
        })}
        <Label x={500} y={300} size={12} color={C.dim}>
          axes: T vs time
        </Label>
        <Label x={500} y={320} size={12} color={C.dim}>
          typical ramp:
        </Label>
        <Label x={500} y={338} size={12} color={C.dim}>
          10 °C/min
        </Label>
        <Label x={300} y={420} size={13} color={C.dim}>
          modulation separates reversing (heat capacity) from non-reversing events
        </Label>
      </Reveal>
    </Stage>
  );
}
