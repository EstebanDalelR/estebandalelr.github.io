"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

// Nyquist plot with equal scaling on both axes (191.7 px per unit).
const nBox = { x: 80, y: 60, w: 460, h: 280 };
const ns = makeScale(nBox, [0, 2.4], [0, 280 / (460 / 2.4)]);

const R0 = 0.05; // leads
const RB = 1.0; // bulk resistance of the polymer
const semicircle: [number, number][] = Array.from({ length: 61 }, (_, i) => {
  const th = Math.PI - (i / 60) * Math.PI;
  return [R0 + RB / 2 + (RB / 2) * Math.cos(th), (RB / 2) * Math.sin(th)];
});
const TILT = (80 * Math.PI) / 180;
const spikeStart: [number, number] = [R0 + RB, 0.02];
const spike: [number, number][] = [spikeStart, [R0 + RB + 1.3 * Math.cos(TILT), 1.3 * Math.sin(TILT)]];

/* sine step */
const sine = (y0: number, amp: number, phase: number) =>
  Array.from({ length: 121 }, (_, i) => {
    const x = 80 + (i / 120) * 460;
    return `${i ? "L" : "M"}${x.toFixed(1)},${(y0 - amp * Math.sin((i / 120) * Math.PI * 4 - phase)).toFixed(1)}`;
  }).join("");
const PHASE = Math.PI / 3;

/* time-constant step: log frequency axis from 10^6 Hz (left) to 10^-2 Hz (right) */
const fx = (logf: number) => 80 + ((6 - logf) / 8) * 460;
const PROCESSES = [
  { logf: 5, name: "ion hopping in the bulk", sub: "fast · small τ", color: C.accent, y: 150 },
  { logf: 2, name: "ions reach the electrodes", sub: "transition", color: C.electron, y: 220 },
  { logf: -1, name: "double layer charging", sub: "slow · large τ", color: C.anion, y: 150 },
];

export default function EisVisual({ visual }: { visual: string }) {
  const sineStep = visual === "eis-sine";
  const tc = visual === "eis-timeconstants";
  const nyquist = !sineStep && !tc;
  const high = visual === "eis-high";
  const medium = visual === "eis-medium";
  const low = visual === "eis-low";

  return (
    <Stage label="Electrochemical impedance spectroscopy">
      <Reveal show={sineStep}>
        <Label x={80} y={70} size={15} anchor="start" color={C.accent} weight={700}>
          applied: E = E_dc + ΔE sin ωt (a few mV)
        </Label>
        <DrawPath d={sine(140, 28, 0)} show={sineStep} color={C.accent} />
        <Label x={80} y={220} size={15} anchor="start" color={C.electron} weight={700}>
          response: current, shifted by φ
        </Label>
        <DrawPath d={sine(290, 48, PHASE)} show={sineStep} color={C.electron} delay={0.4} />
        <line x1={80 + 460 / 8} x2={80 + 460 / 8} y1={100} y2={340} stroke={C.dim} strokeDasharray="4 4" />
        <line
          x1={80 + 460 / 8 + (PHASE / (Math.PI * 4)) * 460}
          x2={80 + 460 / 8 + (PHASE / (Math.PI * 4)) * 460}
          y1={230}
          y2={340}
          stroke={C.dim}
          strokeDasharray="4 4"
        />
        <Label x={80 + 460 / 8 + 10} y={360} size={14} color={C.dim}>
          φ
        </Label>
        <Chip x={300} y={400} text="|Z| = ΔE/Δi and φ, from MHz down to mHz" color={C.accent} w={340} />
      </Reveal>

      <Reveal show={nyquist}>
        <Axes box={nBox} xLabel="Z′ (real)" yLabel="−Z″ (imaginary)" />
        <DrawPath d={ns.path(semicircle)} show={nyquist} color={high ? C.accent : C.dim} width={high ? 4 : 3} />
        <DrawPath d={ns.path(spike)} show={nyquist} color={low ? C.anion : C.dim} width={low ? 4 : 3} delay={0.6} />
        <motion.circle
          cx={ns.sx(R0 + RB)}
          cy={ns.sy(0.02)}
          initial={false}
          animate={{ r: medium ? 16 : 0, opacity: medium ? 1 : 0 }}
          fill="none"
          stroke={C.electron}
          strokeWidth={3}
        />
        <Label x={ns.sx(0.25)} y={ns.sy(0.62)} size={12} color={C.dim}>
          ← high f
        </Label>
        <Label x={ns.sx(1.45)} y={ns.sy(1.2)} size={12} color={C.dim} anchor="start">
          low f
        </Label>

        <Reveal show={high}>
          <line x1={ns.sx(R0 + RB)} x2={ns.sx(R0 + RB)} y1={ns.sy(0)} y2={ns.sy(0) + 16} stroke={C.accent} strokeWidth={2} />
          <Label x={ns.sx(R0 + RB)} y={ns.sy(0) + 30} size={13} color={C.accent} weight={700}>
            R_b
          </Label>
          <g transform="translate(360 120)">
            <rect width={180} height={130} rx={10} fill="#0b1220" stroke={C.accent} />
            <Label x={90} y={24} size={14} weight={700} color={C.accent}>
              R_b ∥ C_geo
            </Label>
            <line x1={30} x2={150} y1={60} y2={60} stroke={C.ink} strokeWidth={2} />
            <rect x={65} y={52} width={50} height={16} fill="#0b1220" stroke={C.ink} strokeWidth={2} />
            <line x1={30} x2={30} y1={60} y2={96} stroke={C.ink} strokeWidth={2} />
            <line x1={150} x2={150} y1={60} y2={96} stroke={C.ink} strokeWidth={2} />
            <line x1={30} x2={84} y1={96} y2={96} stroke={C.ink} strokeWidth={2} />
            <line x1={96} x2={150} y1={96} y2={96} stroke={C.ink} strokeWidth={2} />
            <line x1={84} x2={84} y1={86} y2={106} stroke={C.ink} strokeWidth={2} />
            <line x1={96} x2={96} y1={86} y2={106} stroke={C.ink} strokeWidth={2} />
            <Label x={90} y={124} size={12} color={C.dim}>
              σ = l / (R_b · A)
            </Label>
          </g>
          <Label x={450} y={280} size={13} color={C.dim}>
            ion migration through the polymer
          </Label>
        </Reveal>

        <Reveal show={medium}>
          <g transform="translate(360 150)">
            <rect width={180} height={80} rx={10} fill="#0b1220" stroke={C.electron} />
            <Label x={90} y={30} size={13} color={C.electron} weight={700}>
              semicircle ends,
            </Label>
            <Label x={90} y={50} size={13}>
              ions start to pile up
            </Label>
            <Label x={90} y={68} size={13}>
              at the electrodes
            </Label>
          </g>
        </Reveal>

        <Reveal show={low}>
          <g transform="translate(360 150)">
            <rect width={180} height={100} rx={10} fill="#0b1220" stroke={C.anion} />
            <Label x={90} y={28} size={13} color={C.anion} weight={700}>
              blocking electrodes:
            </Label>
            <Label x={90} y={48} size={13}>
              no charge transfer,
            </Label>
            <Label x={90} y={68} size={13}>
              double layer = capacitor
            </Label>
            <Label x={90} y={88} size={12} color={C.dim}>
              tilted: rough surface (CPE)
            </Label>
          </g>
        </Reveal>
      </Reveal>

      <Reveal show={tc}>
        <Label x={300} y={60} size={18} weight={700}>
          τ = RC · a process responds only if 1/ω &gt; τ
        </Label>
        <line x1={80} x2={548} y1={300} y2={300} stroke={C.dim} strokeWidth={1.5} markerEnd="url(#arrow)" />
        {[6, 4, 2, 0, -2].map((l) => (
          <g key={l}>
            <line x1={fx(l)} x2={fx(l)} y1={294} y2={306} stroke={C.dim} />
            <Label x={fx(l)} y={326} size={12} color={C.dim}>
              {l === 6 ? "1 MHz" : l === 4 ? "10 kHz" : l === 2 ? "100 Hz" : l === 0 ? "1 Hz" : "10 mHz"}
            </Label>
          </g>
        ))}
        <Label x={548} y={350} size={13} color={C.dim} anchor="end">
          lower frequency → slower processes
        </Label>
        {PROCESSES.map((p, i) => (
          <motion.g key={p.name} initial={false} animate={{ opacity: tc ? 1 : 0, y: tc ? 0 : 10 }} transition={{ delay: tc ? 0.2 + i * 0.25 : 0 }}>
            <line x1={fx(p.logf)} x2={fx(p.logf)} y1={p.y + 16} y2={292} stroke={p.color} strokeDasharray="4 4" />
            <circle cx={fx(p.logf)} cy={300} r={7} fill={p.color} />
            <Label x={fx(p.logf)} y={p.y - 6} size={14} color={p.color} weight={700}>
              {p.name}
            </Label>
            <Label x={fx(p.logf)} y={p.y + 12} size={12} color={C.dim}>
              {p.sub}
            </Label>
          </motion.g>
        ))}
      </Reveal>
    </Stage>
  );
}
