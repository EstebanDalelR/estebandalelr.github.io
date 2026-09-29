"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Flow, Label, Reveal, Stage, makeScale } from "../primitives";
import { erf } from "./erf";

/* ---- Fick 1: planes with decreasing numbers of atoms ---- */
const PLANES = [60, 105, 150, 195, 240];
const COUNTS = [9, 7, 5, 3, 1];

/* ---- Fick 2: c–x profiles spreading with time (surface held constant) ---- */
const f2Box = { x: 340, y: 90, w: 230, h: 230 };
const f2 = makeScale(f2Box, [0, 4], [0, 1.05]);
const f2Curve = (t: number) =>
  f2.path(Array.from({ length: 81 }, (_, i) => [i / 20, 1 - erf(i / 20 / (2 * Math.sqrt(t)))] as [number, number]));

/* ---- Arrhenius ---- */
const arBox = { x: 90, y: 80, w: 420, h: 260 };
const ar = makeScale(arBox, [0, 1], [0, 1]);

/* ---- erf profiles, worked example ---- */
const D = 2e-11; // m²/s at 1000 °C
const CS = 0.9;
const erfBox = { x: 90, y: 80, w: 430, h: 260 };
const es = makeScale(erfBox, [0, 400], [0, 1]);
const profile = (sc: typeof es, tSec: number, xmax = 400) =>
  sc.path(
    Array.from({ length: 101 }, (_, i) => {
      const xUm = (i / 100) * xmax;
      const z = (xUm * 1e-6) / (2 * Math.sqrt(D * tSec));
      return [xUm, CS * (1 - erf(z))] as [number, number];
    })
  );
const TIMES = [
  { t: 120, label: "2 min", color: C.lfp },
  { t: 709, label: "12 min", color: C.accent },
  { t: 3600, label: "60 min", color: C.electron },
];
const wkBox = { x: 380, y: 110, w: 190, h: 190 };
const wk = makeScale(wkBox, [0, 300], [0, 1]);

const STEPS = [
  "1 · surface: A = c_s = 0.009",
  "2 · depth at t = 0: A + B = 0 → B = −0.009",
  "3 · 0.005 = 0.009 (1 − erf z) → erf z ≈ 0.444",
  "4 · erf table → z ≈ 0.42",
  "5 · t = x² / (4 D z²)",
  "   = (10⁻⁴)² / (4 · 2×10⁻¹¹ · 0.42²)",
  "   ≈ 710 s ≈ 12 min",
];

/* ---- grain structures for the paths step ---- */
function Grains({ x, y, n }: { x: number; y: number; n: number }) {
  const size = 130;
  const step = size / n;
  const lines: string[] = [];
  for (let i = 1; i < n; i++) {
    const wob = (k: number) => ((k * 37 + i * 17) % 7) - 3;
    lines.push(`M${x + i * step + wob(1)},${y} L${x + i * step + wob(2)},${y + size / 2} L${x + i * step + wob(3)},${y + size}`);
    lines.push(`M${x},${y + i * step + wob(4)} L${x + size / 2},${y + i * step + wob(5)} L${x + size},${y + i * step + wob(6)}`);
  }
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} fill={C.graphite} opacity={0.35} stroke={C.dim} />
      {lines.map((d, i) => (
        <path key={i} d={d} stroke={C.electron} strokeWidth={2} fill="none" opacity={0.85} />
      ))}
    </g>
  );
}

export default function DiffusionVisual({ visual }: { visual: string }) {
  return (
    <Stage label="Diffusion">
      {/* Fick's laws */}
      <Reveal show={visual === "fick"}>
        <Label x={150} y={50} size={15} weight={700}>
          Fick 1: flux down the gradient
        </Label>
        {PLANES.map((x, i) => (
          <g key={x}>
            <line x1={x} x2={x} y1={80} y2={320} stroke={C.grid} strokeWidth={2} />
            {Array.from({ length: COUNTS[i] }, (_, k) => (
              <circle key={k} cx={x} cy={95 + k * 26} r={7} fill={C.anion} />
            ))}
          </g>
        ))}
        <Flow path="M60 350 L240 350" count={4} dur={2.2} color={C.anion} r={5} />
        <line x1={60} x2={250} y1={350} y2={350} stroke={C.anion} strokeWidth={1.5} markerEnd="url(#arrow)" opacity={0.6} />
        <Label x={150} y={380} size={14} color={C.accent} weight={700}>
          J = −D · dc/dx
        </Label>
        <Label x={150} y={402} size={12} color={C.dim}>
          more jumps from crowded to empty planes
        </Label>

        <Label x={455} y={50} size={15} weight={700}>
          Fick 2: profiles spread
        </Label>
        <Axes box={f2Box} xLabel="depth x" yLabel="c" />
        {[0.05, 0.4, 2].map((t, i) => (
          <DrawPath key={t} d={f2Curve(t)} show={visual === "fick"} color={[C.lfp, C.accent, C.electron][i]} width={2.5} delay={i * 0.3} />
        ))}
        <Label x={455} y={380} size={13} color={C.dim}>
          t₁ &lt; t₂ &lt; t₃
        </Label>
        <Label x={455} y={402} size={14} color={C.accent} weight={700}>
          ∂c/∂t = D ∂²c/∂x²
        </Label>
      </Reveal>

      {/* Arrhenius */}
      <Reveal show={visual === "arrhenius"}>
        <Axes box={arBox} xLabel="1 / T" yLabel="ln D" />
        <DrawPath d={ar.path([[0.05, 0.9], [0.95, 0.12]])} show={visual === "arrhenius"} color={C.accent} width={3.5} />
        <circle cx={ar.sx(0.05)} cy={ar.sy(0.9)} r={5} fill={C.accent} />
        <Label x={ar.sx(0.05) + 10} y={ar.sy(0.9) - 10} anchor="start" size={13} color={C.accent}>
          intercept: ln D₀
        </Label>
        <Label x={ar.sx(0.55) + 12} y={ar.sy(0.48) + 4} anchor="start" size={14} color={C.electron} weight={700}>
          slope = −Q / R
        </Label>
        <Label x={ar.sx(0.08)} y={arBox.y + arBox.h - 12} anchor="start" size={12} color={C.dim}>
          ← high T
        </Label>
        <Label x={ar.sx(0.98)} y={arBox.y + arBox.h - 12} anchor="end" size={12} color={C.dim}>
          low T →
        </Label>
        <Chip x={300} y={395} text="D = D₀ e^(−Q/RT): an atom must break bonds to jump" w={400} />
        <Label x={300} y={432} size={13} color={C.dim}>
          strong bonds → high Q → slow diffusion → high melting point
        </Label>
      </Reveal>

      {/* diffusion paths */}
      <Reveal show={visual === "paths"}>
        <Label x={300} y={42} size={15} weight={700}>
          Fast lanes: D_surface &gt; D_GB &gt; D_bulk
        </Label>
        {[
          { name: "surface", w: 380, color: C.electron },
          { name: "grain boundary", w: 260, color: C.accent },
          { name: "bulk", w: 120, color: C.lfp },
        ].map((b, i) => (
          <g key={b.name}>
            <Label x={150} y={82 + i * 34} anchor="end" size={13}>
              {b.name}
            </Label>
            <motion.rect
              x={160}
              y={68 + i * 34}
              height={20}
              rx={5}
              fill={b.color}
              initial={false}
              animate={{ width: visual === "paths" ? b.w : 0 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            />
          </g>
        ))}
        <Label x={160 + 380} y={186} anchor="end" size={12} color={C.dim}>
          D (log scale)
        </Label>
        <Grains x={100} y={210} n={2} />
        <Grains x={370} y={210} n={7} />
        <Label x={165} y={362} size={13}>
          coarse: few boundaries
        </Label>
        <Label x={435} y={362} size={13}>
          fine: many boundaries
        </Label>
        <Chip x={300} y={405} text="fine-grained material → faster total diffusion" color={C.electron} w={360} />
      </Reveal>

      {/* erf solution */}
      <Reveal show={visual === "erf"}>
        <Axes box={erfBox} xLabel="depth x (µm)" yLabel="carbon (wt %)" xLabelDy={40} />
        {[0, 100, 200, 300, 400].map((v) => (
          <Label key={v} x={es.sx(v)} y={erfBox.y + erfBox.h + 18} size={12} color={C.dim}>
            {v}
          </Label>
        ))}
        {[0, 0.5, 0.9].map((v) => (
          <Label key={v} x={erfBox.x - 8} y={es.sy(v) + 4} anchor="end" size={12} color={C.dim}>
            {v}
          </Label>
        ))}
        <line x1={erfBox.x} x2={erfBox.x + erfBox.w} y1={es.sy(CS)} y2={es.sy(CS)} stroke={C.dim} strokeDasharray="4 4" />
        {TIMES.map((p, i) => (
          <g key={p.t}>
            <DrawPath d={profile(es, p.t)} show={visual === "erf"} color={p.color} width={2.5} delay={i * 0.3} />
            {/* label where the curve crosses 0.45 wt % (erf z = 0.5 → z ≈ 0.477) */}
            <Label x={es.sx(0.477 * 2 * Math.sqrt(D * p.t) * 1e6) + 8} y={es.sy(0.45) + 4} anchor="start" size={12} color={p.color}>
              {p.label}
            </Label>
          </g>
        ))}
        <Label x={es.sx(4)} y={es.sy(CS) - 10} anchor="start" size={13} color={C.hot} weight={700}>
          surface held: A = c_s
        </Label>
        <line x1={es.sx(390)} x2={es.sx(390)} y1={es.sy(0.55)} y2={es.sy(0.02)} stroke={C.lfp} strokeDasharray="3 3" />
        <Label x={es.sx(395)} y={es.sy(0.6)} anchor="end" size={13} color={C.lfp} weight={700}>
          deep inside: A + B = c₀ = 0
        </Label>
        <Chip x={300} y={430} text="c = A + B erf z,  z = x / (2√(Dt))" w={300} />
      </Reveal>

      {/* worked 2022 exam */}
      <Reveal show={visual === "worked"}>
        <Label x={30} y={50} anchor="start" size={15} weight={700}>
          2022 exam: 0.5 wt % C at 100 µm, 1000 °C
        </Label>
        {STEPS.map((s, i) => (
          <motion.g
            key={s}
            initial={false}
            animate={{ opacity: visual === "worked" ? 1 : 0 }}
            transition={{ delay: visual === "worked" ? 0.2 + i * 0.25 : 0 }}
          >
            <Label x={30} y={100 + i * 34} anchor="start" size={13} color={i === 6 ? C.accent : C.ink} weight={i === 6 ? 700 : 500}>
              {s}
            </Label>
          </motion.g>
        ))}
        <Axes box={wkBox} xLabel="x (µm)" yLabel="wt % C" xLabelDy={38} />
        <Label x={wk.sx(100)} y={wkBox.y + wkBox.h + 16} size={12} color={C.dim}>
          100
        </Label>
        <Label x={wkBox.x - 6} y={wk.sy(0.5) + 4} anchor="end" size={12} color={C.dim}>
          0.5
        </Label>
        <DrawPath d={profile(wk, 709, 300)} show={visual === "worked"} color={C.accent} width={2.5} delay={0.4} />
        <line x1={wkBox.x} x2={wk.sx(100)} y1={wk.sy(0.5)} y2={wk.sy(0.5)} stroke={C.hot} strokeDasharray="4 4" />
        <line x1={wk.sx(100)} x2={wk.sx(100)} y1={wk.sy(0.5)} y2={wkBox.y + wkBox.h} stroke={C.hot} strokeDasharray="4 4" />
        <circle cx={wk.sx(100)} cy={wk.sy(0.5)} r={6} fill={C.hot} />
        <Label x={wk.sx(100) + 10} y={wk.sy(0.5) - 10} anchor="start" size={12} color={C.hot}>
          target
        </Label>
        <Label x={300} y={430} size={12} color={C.dim}>
          D ≈ 2 × 10⁻¹¹ m²/s read from the figure at the maximum 1000 °C
        </Label>
      </Reveal>
    </Stage>
  );
}
