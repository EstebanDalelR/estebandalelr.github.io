"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

// G–composition curves: x = mole fraction of B (0..1)
const box = { x: 90, y: 60, w: 420, h: 290 };
const s = makeScale(box, [0, 1], [-0.85, -0.25]);
const gAlpha = (x: number, lift = 0) => 1.6 * (x - 0.25) ** 2 - 0.7 + lift;
const gBeta = (x: number) => 1.6 * (x - 0.75) ** 2 - 0.75;
const curve = (f: (x: number) => number, a: number, b: number): [number, number][] =>
  Array.from({ length: 80 }, (_, i) => {
    const x = a + ((b - a) * i) / 79;
    return [x, f(x)];
  });

// Common tangent between two parabolas with equal curvature k: y = k(x-a)^2 + ca and k(x-b)^2 + cb
function tangent(k: number, a: number, ca: number, b: number, cb: number) {
  // slope m equal: 2k(x1-a) = 2k(x2-b) → x2 = x1 + (b - a); line through both points
  // y2 - y1 = m (x2 - x1)
  // k(x2-b)^2 + cb - k(x1-a)^2 - ca = 2k(x1-a)(b-a)  with (x2-b)=(x1-a)
  const x1 = a + (cb - ca) / (2 * k * (b - a));
  const x2 = x1 + (b - a);
  const m = 2 * k * (x1 - a);
  const y1 = k * (x1 - a) ** 2 + ca;
  return { x1, x2, y1, y2: y1 + m * (x2 - x1), m, at: (x: number) => y1 + m * (x - x1) };
}

const T0 = tangent(1.6, 0.25, -0.7, 0.75, -0.75);
const T1 = tangent(1.6, 0.25, -0.58, 0.75, -0.75);

export default function ThermoVisual({ visual }: { visual: string }) {
  const tan = visual === "tangent";
  const nano = visual === "nano";
  const plot = tan || nano;
  const t = nano ? T1 : T0;

  return (
    <Stage label="Gibbs energy, phase rule and common tangent">
      <Reveal show={visual === "gibbs"}>
        <rect x={140} y={70} width={320} height={80} rx={14} fill="#0b1220" stroke={C.accent} />
        <Label x={300} y={122} size={28} weight={800} color={C.accent}>
          G = H − TS
        </Label>
        <Label x={200} y={186} size={13} color={C.dim}>
          H: bond energy
        </Label>
        <Label x={400} y={186} size={13} color={C.dim}>
          S: disorder
        </Label>
        {/* ball rolling into a valley */}
        <path d="M100 250 C200 250 220 370 300 370 C380 370 400 280 500 280" fill="none" stroke={C.dim} strokeWidth={3} />
        <motion.circle r={12} fill={C.electron} initial={false} animate={{ cx: [130, 300], cy: [238, 356] }} transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 0.8 }} />
        <Label x={300} y={398} size={14} weight={700}>
          equilibrium: G at its minimum
        </Label>
        <Chip x={300} y={430} text="ΔG < 0 → the reaction runs by itself" color={C.lithium} w={320} />
      </Reveal>

      <Reveal show={visual === "phase-rule"}>
        <rect x={150} y={50} width={300} height={60} rx={12} fill="#0b1220" stroke={C.accent} />
        <Label x={300} y={88} size={22} weight={800} color={C.accent}>
          p + f = c + 1
        </Label>
        <Label x={300} y={134} size={13} color={C.dim}>
          p phases · f degrees of freedom · c components · pressure fixed
        </Label>
        {[
          { t: "Binary (c = 2)", l: ["p + f = 3", "1 phase: f = 2 (T and x)", "2 phases: f = 1", "3 phases: f = 0 → one point"], c: C.lfp },
          { t: "Ternary, T fixed (c = 3)", l: ["p + f = 4, minus T → 3", "1 phase: f = 2", "2 phases: f = 1", "3 phases: f = 0"], c: C.copper },
        ].map((b, i) => (
          <g key={b.t}>
            <rect x={40 + i * 270} y={170} width={250} height={200} rx={14} fill={b.c} opacity={0.1} stroke={b.c} />
            <Label x={165 + i * 270} y={200} size={15} weight={700} color={b.c}>
              {b.t}
            </Label>
            {b.l.map((line, k) => (
              <Label key={line} x={165 + i * 270} y={236 + k * 32} size={14} weight={k === 3 ? 700 : 400}>
                {line}
              </Label>
            ))}
          </g>
        ))}
        <Label x={300} y={410} size={13} color={C.dim}>
          eutectic and peritectic points: 3 phases, f = 0, invariant
        </Label>
      </Reveal>

      <Reveal show={plot}>
        <Axes box={box} xLabel="mole fraction B →" yLabel="G (per mole)" />
        <Label x={box.x} y={box.y + box.h + 20} size={13}>
          A
        </Label>
        <Label x={box.x + box.w} y={box.y + box.h + 20} size={13}>
          B
        </Label>
        <line x1={box.x + box.w} y1={box.y} x2={box.x + box.w} y2={box.y + box.h} stroke={C.dim} strokeWidth={1.5} />
        {/* alpha: original and (nano) raised */}
        <DrawPath d={s.path(curve((x) => gAlpha(x), 0, 0.62))} show={plot} color={C.lfp} width={3} dash={nano ? "6 5" : undefined} />
        <DrawPath d={s.path(curve((x) => gAlpha(x, 0.12), 0, 0.62))} show={nano} color={C.lfp} width={3} />
        <DrawPath d={s.path(curve(gBeta, 0.38, 1))} show={plot} color={C.copper} width={3} />
        <Label x={s.sx(0.12)} y={s.sy(gAlpha(0.12, nano ? 0.12 : 0)) - 12} size={15} weight={700} color={C.lfp}>
          α
        </Label>
        <Label x={s.sx(0.9)} y={s.sy(gBeta(0.9)) - 12} size={15} weight={700} color={C.copper}>
          β
        </Label>

        {/* common tangent */}
        <motion.line
          initial={false}
          animate={{ x1: s.sx(0), y1: s.sy(t.at(0)), x2: s.sx(1), y2: s.sy(t.at(1)) }}
          transition={{ duration: 0.8 }}
          stroke={C.electron}
          strokeWidth={2.5}
        />
        <motion.circle initial={false} animate={{ cx: s.sx(t.x1), cy: s.sy(t.y1) }} r={6} fill={C.electron} />
        <motion.circle initial={false} animate={{ cx: s.sx(t.x2), cy: s.sy(t.y2) }} r={6} fill={C.electron} />
        <motion.line initial={false} animate={{ x1: s.sx(t.x1), x2: s.sx(t.x1), y1: s.sy(t.y1), y2: box.y + box.h }} stroke={C.electron} strokeDasharray="3 4" />
        <motion.line initial={false} animate={{ x1: s.sx(t.x2), x2: s.sx(t.x2), y1: s.sy(t.y2), y2: box.y + box.h }} stroke={C.electron} strokeDasharray="3 4" />
        <motion.circle initial={false} animate={{ cx: s.sx(0), cy: s.sy(t.at(0)) }} r={5} fill={C.hot} />
        <motion.circle initial={false} animate={{ cx: s.sx(1), cy: s.sy(t.at(1)) }} r={5} fill={C.hot} />
        <Label x={box.x + 8} y={s.sy(t.at(0)) - 8} size={13} color={C.hot} anchor="start" weight={700}>
          μ_A
        </Label>
        <Label x={box.x + box.w - 8} y={s.sy(t.at(1)) - 8} size={13} color={C.hot} anchor="end" weight={700}>
          μ_B
        </Label>

        <Reveal show={tan}>
          <Label x={300} y={400} size={13}>
            one common tangent → μ_A(α) = μ_A(β) and μ_B(α) = μ_B(β)
          </Label>
          <Label x={300} y={422} size={13} color={C.electron}>
            touching points = compositions of α and β at equilibrium
          </Label>
        </Reveal>
        <Reveal show={nano}>
          <Label x={300} y={400} size={13} color={C.lfp}>
            nanocrystalline α: G_total = G_bulk + G_surface → α curve moves up
          </Label>
          <Label x={300} y={422} size={13} color={C.electron}>
            the tangent touches at new points → the two-phase region shifts
          </Label>
        </Reveal>
      </Reveal>
    </Stage>
  );
}
