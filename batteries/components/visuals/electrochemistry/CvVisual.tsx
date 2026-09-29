"use client";

import { motion } from "framer-motion";
import { simulateCV } from "@batteries/lib/simulate";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

const E_START = -0.3;
const E_SWITCH = 0.35;
const sim = simulateCV({ eStart: E_START, eSwitch: E_SWITCH }).filter((_, i) => i % 6 === 0);
const half = Math.floor(sim.length / 2);
const forward = sim.slice(0, half + 1);

// Peaks for the annotation
const pa = forward.reduce((a, b) => (b[1] > a[1] ? b : a));
const pc = sim.slice(half).reduce((a, b) => (b[1] < a[1] ? b : a));
const dEp = Math.round((pa[0] - pc[0]) * 1000);
const eHalf = (pa[0] + pc[0]) / 2;

const box = { x: 80, y: 60, w: 460, h: 300 };
const main = makeScale(box, [E_START, E_SWITCH], [-1.05, 1.25]);

// Scan-rate family: faradaic current ∝ √v, capacitive background ∝ v (sign follows sweep direction)
const RATES = [0.025, 0.1, 0.4];
const RATE_COLORS = [C.lfp, C.accent, C.electron];
const rateScale = makeScale({ x: 60, y: 60, w: 330, h: 300 }, [E_START, E_SWITCH], [-2.3, 2.6]);
const rateCurve = (v: number) =>
  sim.map(([e, i], k) => [e, i * Math.sqrt(v / 0.1) + (k <= half ? 1 : -1) * 0.8 * v] as [number, number]);

// Triangle waveform E(t)
const sweepBox = { x: 80, y: 70, w: 460, h: 280 };
const sweep = makeScale(sweepBox, [0, 13], [E_START - 0.05, E_SWITCH + 0.05]);
const tSwitch = (E_SWITCH - E_START) / 0.1;
const wave: [number, number][] = [
  [0, E_START],
  [tSwitch, E_SWITCH],
  [2 * tSwitch, E_START],
];

export default function CvVisual({ visual }: { visual: string }) {
  const plot = visual === "cv-duck" || visual === "cv-reverse";

  return (
    <Stage label="Cyclic voltammetry">
      <Reveal show={visual === "cv-sweep"}>
        <Axes box={sweepBox} xLabel="time →" yLabel="E applied" />
        <DrawPath d={sweep.path(wave)} show={visual === "cv-sweep"} color={C.accent} width={3.5} dur={1.6} />
        <motion.circle
          r={8}
          fill={C.electron}
          initial={false}
          animate={{
            cx: wave.map(([t]) => sweep.sx(t)),
            cy: wave.map(([, e]) => sweep.sy(e)),
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        />
        <Label x={sweep.sx(tSwitch)} y={sweep.sy(E_SWITCH) - 16} size={14} color={C.dim}>
          switching potential
        </Label>
        <Label x={sweep.sx(tSwitch / 2) - 12} y={sweep.sy(0) - 18} size={14} color={C.accent} anchor="end">
          slope = scan rate v
        </Label>
        <Chip x={300} y={410} text="record i while E is swept linearly, then reversed" w={380} />
      </Reveal>

      <Reveal show={plot}>
        <Axes box={box} xLabel="E − E⁰′ (V)" yLabel="i (oxidation +)" origin={{ y: main.sy(0) }} />
        <DrawPath d={main.path(forward)} show={plot} color={C.accent} width={3.5} dur={1.6} />
        <DrawPath d={main.path(sim.slice(half))} show={visual === "cv-reverse"} color={C.anion} width={3.5} dur={1.6} />
        <Label x={main.sx(pa[0]) + 10} y={main.sy(pa[1]) - 12} size={14} anchor="start" color={C.accent}>
          peak: diffusion takes over
        </Label>
        <Label x={main.sx(0.3)} y={main.sy(0.8)} size={13} anchor="end" color={C.dim}>
          growing diffusion layer
        </Label>
      </Reveal>

      <Reveal show={visual === "cv-reverse"}>
        <line x1={main.sx(pa[0])} y1={main.sy(pa[1])} x2={main.sx(pa[0])} y2={main.sy(-0.9)} stroke={C.dim} strokeDasharray="4 4" />
        <line x1={main.sx(pc[0])} y1={main.sy(pc[1])} x2={main.sx(pc[0])} y2={main.sy(-0.9)} stroke={C.dim} strokeDasharray="4 4" />
        <line x1={main.sx(pc[0])} y1={main.sy(-0.88)} x2={main.sx(pa[0])} y2={main.sy(-0.88)} stroke={C.electron} strokeWidth={2} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <Label x={main.sx(eHalf) + 60} y={main.sy(-0.88) + 5} size={14} color={C.electron} anchor="start" weight={700}>
          ΔEp ≈ {dEp} mV (57/n)
        </Label>
        <line x1={main.sx(eHalf)} y1={box.y} x2={main.sx(eHalf)} y2={box.y + box.h} stroke={C.lithium} strokeDasharray="2 5" />
        <Label x={main.sx(eHalf) - 8} y={box.y + 12} size={14} color={C.lithium} anchor="end" weight={700}>
          E½ ≈ E⁰′
        </Label>
        <Label x={main.sx(pc[0]) - 12} y={main.sy(pc[1]) + 4} size={14} color={C.anion} anchor="end">
          reverse peak
        </Label>
        <Chip x={300} y={420} text="reversible: |ipa| = |ipc| (from baseline)" color={C.anion} w={340} />
      </Reveal>

      <Reveal show={visual === "cv-scanrate"}>
        <Axes box={{ x: 60, y: 60, w: 330, h: 300 }} xLabel="E (V)" yLabel="i" origin={{ y: rateScale.sy(0) }} />
        {RATES.map((v, k) => (
          <DrawPath key={v} d={rateScale.path(rateCurve(v))} show={visual === "cv-scanrate"} color={RATE_COLORS[k]} width={2.5} delay={k * 0.3} />
        ))}
        {RATES.map((v, k) => (
          <Label key={v} x={70} y={395 + k * 18} anchor="start" size={13} color={RATE_COLORS[k]}>
            v = {v * 1000} mV/s
          </Label>
        ))}
        {/* inset: ip vs sqrt(v) */}
        <g>
          <rect x={420} y={80} width={165} height={170} rx={10} fill="#0b1220" stroke={C.grid} />
          <line x1={440} y1={225} x2={570} y2={225} stroke={C.dim} />
          <line x1={440} y1={225} x2={440} y2={95} stroke={C.dim} />
          <line x1={440} y1={225} x2={565} y2={110} stroke={C.accent} strokeWidth={2.5} />
          {RATES.map((v, k) => {
            const x = 440 + Math.sqrt(v / 0.4) * 115;
            const y = 225 - Math.sqrt(v / 0.4) * 105.8;
            return <circle key={v} cx={x} cy={y} r={5} fill={RATE_COLORS[k]} />;
          })}
          <Label x={505} y={243} size={12} color={C.dim}>
            √v
          </Label>
          <Label x={448} y={104} size={12} color={C.dim} anchor="start">
            ip
          </Label>
        </g>
        <Label x={500} y={280} size={13} color={C.accent}>
          line ⇒ diffusion
        </Label>
        <Label x={500} y={300} size={13} color={C.accent}>
          slope ⇒ D
        </Label>
        <Label x={500} y={330} size={13} color={C.dim}>
          i ∝ v ⇒ adsorbed /
        </Label>
        <Label x={500} y={348} size={13} color={C.dim}>
          capacitive current
        </Label>
      </Reveal>

      <Reveal show={visual === "cv-caveat"}>
        {/* textbook assumption */}
        <Label x={150} y={40} size={15} weight={700}>
          Equations assume
        </Label>
        <rect x={40} y={70} width={24} height={260} fill={C.zinc} />
        <motion.rect
          x={64}
          y={70}
          height={260}
          fill={C.accent}
          opacity={0.25}
          animate={{ width: [10, 120, 10] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />
        <Label x={170} y={200} size={13} color={C.dim}>
          bulk solution → ∞
        </Label>
        <Label x={150} y={360} size={13}>
          planar · semi-infinite diffusion
        </Label>
        <Label x={150} y={380} size={13}>
          supporting electrolyte · no migration
        </Label>

        <line x1={300} y1={60} x2={300} y2={390} stroke={C.grid} strokeWidth={2} />

        {/* real battery cell */}
        <Label x={450} y={40} size={15} weight={700}>
          A Li-ion cell is
        </Label>
        <rect x={330} y={70} width={100} height={260} fill={C.graphite} opacity={0.6} />
        <rect x={470} y={70} width={100} height={260} fill={C.lfp} opacity={0.6} />
        {[100, 150, 200, 250, 300].map((y) => (
          <g key={y}>
            <circle cx={360} cy={y} r={9} fill={C.graphite} />
            <circle cx={400} cy={y - 20} r={9} fill={C.graphite} />
            <circle cx={500} cy={y} r={9} fill={C.lfp} />
            <circle cx={540} cy={y - 20} r={9} fill={C.lfp} />
          </g>
        ))}
        <motion.rect x={410} y={70} height={260} fill={C.hot} opacity={0.3} animate={{ width: [0, 80, 80] }} transition={{ repeat: Infinity, duration: 4 }} />
        <Label x={450} y={360} size={13}>
          thin (20–50 µm) · porous
        </Label>
        <Label x={450} y={380} size={13}>
          diffusion layers overlap in ~6 s
        </Label>
        <Chip x={300} y={420} text="Randles–Sevcik, Cottrell, Sand: not directly valid" color={C.hot} w={400} />
      </Reveal>
    </Stage>
  );
}
