"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

// Cu–Ni lens diagram, wt% Ni 0..100, T 1050..1500 °C (schematic, matching the lecture's tie line)
const box = { x: 90, y: 60, w: 440, h: 280 };
const s = makeScale(box, [0, 100], [1050, 1500]);
const liquidus = (x: number) => 1085 + (1455 - 1085) * (1 - Math.pow(1 - x / 100, 1.53));
const solidus = (x: number) => 1085 + (1455 - 1085) * Math.pow(x / 100, 0.96);
const pts = (f: (x: number) => number): [number, number][] => Array.from({ length: 60 }, (_, i) => [(i / 59) * 100, f((i / 59) * 100)]);

// Pb–Sn eutectic (schematic, straight lines): wt% Sn 0..100, T 0..350 °C
const pbBox = { x: 90, y: 60, w: 440, h: 280 };
const ps = makeScale(pbBox, [0, 100], [0, 350]);
const PB = {
  liqL: [[0, 327], [61.9, 183]] as [number, number][],
  liqR: [[61.9, 183], [100, 232]] as [number, number][],
  solA: [[0, 327], [18.3, 183]] as [number, number][],
  solvA: [[18.3, 183], [10, 100], [3, 0]] as [number, number][],
  solB: [[100, 232], [97.8, 183]] as [number, number][],
  solvB: [[97.8, 183], [99, 0]] as [number, number][],
  eut: [[18.3, 183], [97.8, 183]] as [number, number][],
};

function PbSn({ show, below }: { show: boolean; below: boolean }) {
  const T = below ? 170 : 196;
  const right = below ? 97.8 : 61.9;
  const y = ps.sy(T);
  const leftArm = 40 - 18.3;
  const rightArm = right - 40;
  return (
    <g>
      <Axes box={pbBox} xLabel="wt% Sn" yLabel="T (°C)" xLabelDy={40} />
      {[0, 20, 40, 60, 80, 100].map((v) => (
        <Label key={v} x={ps.sx(v)} y={pbBox.y + pbBox.h + 18} size={12} color={C.dim}>
          {v}
        </Label>
      ))}
      {Object.entries(PB).map(([k, p]) => (
        <DrawPath key={k} d={ps.path(p)} show={show} color={k.startsWith("liq") ? C.hot : k === "eut" ? C.dim : C.lfp} width={k === "eut" ? 2 : 3} />
      ))}
      <Label x={ps.sx(12)} y={ps.sy(305)} size={14} weight={700}>
        L
      </Label>
      <Label x={ps.sx(23)} y={ps.sy(212)} size={13}>
        α + L
      </Label>
      <Label x={ps.sx(84)} y={ps.sy(196)} size={13}>
        β + L
      </Label>
      <Label x={ps.sx(60)} y={ps.sy(80)} size={14} weight={700}>
        α + β
      </Label>
      <Label x={ps.sx(1.5)} y={ps.sy(60)} size={13} color={C.lfp} anchor="start">
        α
      </Label>
      <Label x={pbBox.x + 6} y={ps.sy(183) - 6} size={12} color={C.dim} anchor="start">
        183 °C
      </Label>
      {/* alloy at 40 wt% Sn */}
      <line x1={ps.sx(40)} x2={ps.sx(40)} y1={pbBox.y + 20} y2={pbBox.y + pbBox.h} stroke={C.electron} strokeDasharray="4 4" />
      <Label x={ps.sx(40)} y={pbBox.y + 14} size={12} color={C.electron}>
        40 wt% Sn
      </Label>
      {/* tie line and arms */}
      <motion.line initial={false} animate={{ x2: ps.sx(right), y1: y, y2: y }} x1={ps.sx(18.3)} stroke={C.electron} strokeWidth={3} />
      <circle cx={ps.sx(18.3)} cy={y} r={5} fill={C.lfp} />
      <motion.circle initial={false} animate={{ cx: ps.sx(right), cy: y }} r={5} fill={below ? C.anion : C.hot} />
      <circle cx={ps.sx(40)} cy={y} r={6} fill={C.electron} />
      <Label x={ps.sx((18.3 + 40) / 2)} y={y + (below ? 20 : 30)} size={12} color={C.ink}>
        {leftArm.toFixed(1)}
      </Label>
      <Label x={ps.sx((40 + right) / 2)} y={y + (below ? 20 : 30)} size={12} color={C.ink}>
        {rightArm.toFixed(1)}
      </Label>
      <Label x={ps.sx(18.3) - 8} y={below ? y - 8 : y + 30} size={12} color={C.lfp} anchor="end">
        18.3
      </Label>
      <Label x={ps.sx(right) + 8} y={below ? y - 8 : y + 30} size={12} color={below ? C.anion : C.hot} anchor="start">
        {right}
      </Label>
    </g>
  );
}

// Fe–Fe₃C (schematic): wt% C 0..6.7, T 0..1600 °C, drawn narrow to leave room for the result
const feBox = { x: 80, y: 60, w: 300, h: 280 };
const fs = makeScale(feBox, [0, 6.7], [0, 1600]);
const FE: [number, number][][] = [
  [[0, 912], [0.76, 727]],
  [[0.76, 727], [2.14, 1148]],
  [[0.022, 727], [6.7, 727]],
  [[2.14, 1148], [6.7, 1148]],
  [[0, 1538], [4.3, 1148], [6.7, 1250]],
  [[0, 1495], [2.14, 1148]],
  [[0.022, 727], [0.006, 0]],
];

function FeC({ show, pearlite }: { show: boolean; pearlite: boolean }) {
  const T = pearlite ? 760 : 60;
  const left = pearlite ? 0.76 : 0.022;
  const y = fs.sy(T);
  return (
    <g>
      <Axes box={feBox} xLabel="wt% C" yLabel="T (°C)" xLabelDy={40} />
      {[0, 2, 4, 6.7].map((v) => (
        <Label key={v} x={fs.sx(v)} y={feBox.y + feBox.h + 18} size={12} color={C.dim}>
          {v}
        </Label>
      ))}
      {FE.map((p, i) => (
        <DrawPath key={i} d={fs.path(p)} show={show} color={C.lfp} width={2.5} />
      ))}
      <line x1={fs.sx(6.7)} x2={fs.sx(6.7)} y1={feBox.y} y2={feBox.y + feBox.h} stroke={C.copper} strokeWidth={3} />
      <Label x={fs.sx(6.7) - 6} y={feBox.y + 14} size={12} color={C.copper} anchor="end">
        Fe₃C
      </Label>
      <Label x={fs.sx(3.6)} y={fs.sy(1400)} size={13} weight={700}>
        L
      </Label>
      <Label x={fs.sx(3.9)} y={fs.sy(930)} size={13}>
        γ + Fe₃C
      </Label>
      <Label x={fs.sx(3.9)} y={fs.sy(380)} size={13}>
        α + Fe₃C
      </Label>
      <Label x={fs.sx(0.55)} y={fs.sy(1000)} size={13} weight={700} color={C.accent}>
        γ
      </Label>
      <Label x={feBox.x + feBox.w - 4} y={fs.sy(727) + 16} size={12} color={C.dim} anchor="end">
        727 °C
      </Label>
      <line x1={fs.sx(1.2)} x2={fs.sx(1.2)} y1={feBox.y + 24} y2={feBox.y + feBox.h} stroke={C.electron} strokeDasharray="4 4" />
      <Label x={fs.sx(1.2) + 4} y={feBox.y + 20} size={12} color={C.electron} anchor="start">
        1.2 wt% C
      </Label>
      <motion.line initial={false} animate={{ x1: fs.sx(left), y1: y, y2: y }} x2={fs.sx(6.7)} stroke={C.electron} strokeWidth={3} />
      <motion.circle initial={false} animate={{ cx: fs.sx(left), cy: y }} r={5} fill={pearlite ? C.accent : C.lfp} />
      <circle cx={fs.sx(6.7)} cy={y} r={5} fill={C.copper} />
      <circle cx={fs.sx(1.2)} cy={y} r={6} fill={C.electron} />
    </g>
  );
}

/** Pearlite grains (lamellae) with a cementite network along the grain boundaries. */
function PearliteSketch() {
  const cells = [
    "M0 0 L60 -20 L90 30 L40 70 L-20 40 Z",
    "M60 -20 L120 -10 L130 50 L90 30 Z",
    "M-20 40 L40 70 L20 120 L-40 100 Z",
    "M40 70 L90 30 L130 50 L120 110 L20 120 Z",
  ];
  return (
    <g>
      <defs>
        <pattern id="lamellae" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="6" height="6" fill={C.zinc} opacity={0.35} />
          <rect width="2" height="6" fill={C.copper} />
        </pattern>
      </defs>
      {cells.map((d, i) => (
        <path key={i} d={d} fill="url(#lamellae)" stroke={C.copper} strokeWidth={4} strokeLinejoin="round" />
      ))}
    </g>
  );
}

const T_TIE = 1250;
const CL = 32;
const CA = 43;
const C0 = 35;

export default function BinaryVisual({ visual }: { visual: string }) {
  const lens = visual === "lines" || visual === "lever";
  const lever = visual === "lever";
  const pbsn = visual === "pbsn-above" || visual === "pbsn-below";
  const fe = visual === "steel-lever" || visual === "pearlite-lever";
  const ty = s.sy(T_TIE);

  return (
    <Stage label="Binary phase diagrams and the lever rule">
      <Reveal show={lens}>
        <Axes box={box} xLabel="wt% Ni" yLabel="T (°C)" xLabelDy={40} />
        {[0, 20, 40, 60, 80, 100].map((v) => (
          <Label key={v} x={s.sx(v)} y={box.y + box.h + 18} size={12} color={C.dim}>
            {v}
          </Label>
        ))}
        <DrawPath d={s.path(pts(liquidus))} show={lens} color={C.hot} width={3} />
        <DrawPath d={s.path(pts(solidus))} show={lens} color={C.lfp} width={3} delay={0.3} />
        <Label x={s.sx(55)} y={s.sy(1470)} size={15} weight={700}>
          melt (L)
        </Label>
        <Label x={s.sx(72)} y={s.sy(1120)} size={15} weight={700}>
          solid α
        </Label>
        <Label x={s.sx(80)} y={s.sy(liquidus(80)) - 10} size={13} color={C.hot} anchor="end">
          liquidus
        </Label>
        <Label x={s.sx(60)} y={s.sy(solidus(60)) + 20} size={13} color={C.lfp} anchor="start">
          solidus
        </Label>
        {/* tie line */}
        <line x1={s.sx(CL)} x2={s.sx(CA)} y1={ty} y2={ty} stroke={C.electron} strokeWidth={3} />
        <circle cx={s.sx(CL)} cy={ty} r={5} fill={C.hot} />
        <circle cx={s.sx(CA)} cy={ty} r={5} fill={C.lfp} />
        <Reveal show={!lever}>
          <Label x={s.sx(CA) + 10} y={ty + 5} size={13} color={C.electron} anchor="start">
            tie line: L + α
          </Label>
        </Reveal>
        <Reveal show={lever}>
          <circle cx={s.sx(C0)} cy={ty} r={6} fill={C.electron} />
          <line x1={s.sx(C0)} x2={s.sx(C0)} y1={ty} y2={box.y + box.h} stroke={C.electron} strokeDasharray="3 4" />
          <Label x={s.sx(CL) - 9} y={ty + 4} size={12} color={C.hot} anchor="end">
            C_L = 32
          </Label>
          <Label x={s.sx(CA) + 9} y={ty + 4} size={12} color={C.lfp} anchor="start">
            C_α = 43
          </Label>
          <Label x={s.sx(C0) + 4} y={ty + 22} size={12} color={C.electron} anchor="start">
            C₀ = 35
          </Label>
          <g transform="translate(100 66)">
            <rect x={0} y={0} width={180} height={112} rx={10} fill="#0b1220" stroke={C.electron} />
            <Label x={90} y={24} size={13}>
              w_L = (43 − 35)/(43 − 32)
            </Label>
            <Label x={90} y={46} size={15} weight={700} color={C.hot}>
              = 8/11 ≈ 73 %
            </Label>
            <Label x={90} y={72} size={13}>
              w_α = 3/11
            </Label>
            <Label x={90} y={94} size={15} weight={700} color={C.lfp}>
              ≈ 27 %
            </Label>
          </g>
          <Chip x={300} y={425} text="each phase takes the arm on the opposite side" color={C.electron} w={380} />
        </Reveal>
      </Reveal>

      <Reveal show={pbsn}>
        <PbSn show={pbsn} below={visual === "pbsn-below"} />
        <g transform="translate(355 66)">
          <rect x={0} y={0} width={180} height={84} rx={10} fill="#0b1220" stroke={C.electron} />
          <Reveal show={visual === "pbsn-above"}>
            <Label x={90} y={20} size={12} color={C.dim}>
              just above 183 °C: α + L
            </Label>
            <Label x={90} y={44} size={13}>
              w_L = 21.7 / (61.9 − 18.3)
            </Label>
            <Label x={90} y={68} size={15} weight={700} color={C.hot}>
              ≈ 50 % melt, 50 % α
            </Label>
          </Reveal>
          <Reveal show={visual === "pbsn-below"}>
            <Label x={90} y={20} size={12} color={C.dim}>
              just below 183 °C: α + β
            </Label>
            <Label x={90} y={44} size={13} color={C.lfp} weight={700}>
              w_Pb = 57.8 / 79.5 ≈ 73 %
            </Label>
            <Label x={90} y={68} size={13} color={C.anion} weight={700}>
              w_Sn ≈ 27 %
            </Label>
          </Reveal>
        </g>
        <Reveal show={visual === "pbsn-below"}>
          <Chip x={300} y={425} text="same alloy, different tie line" color={C.electron} w={280} />
        </Reveal>
        <Reveal show={visual === "pbsn-above"}>
          <Chip x={300} y={425} text="each phase takes the opposite arm" color={C.electron} w={300} />
        </Reveal>
      </Reveal>

      <Reveal show={fe}>
        <FeC show={fe} pearlite={visual === "pearlite-lever"} />
        <g transform="translate(400 66)">
          <Reveal show={visual === "steel-lever"}>
            <rect x={0} y={0} width={185} height={170} rx={10} fill="#0b1220" stroke={C.electron} />
            <Label x={92} y={22} size={12} color={C.dim}>
              room temperature: α + Fe₃C
            </Label>
            <Label x={92} y={48} size={13}>
              w(Fe₃C) =
            </Label>
            <Label x={92} y={68} size={13}>
              (1.2 − 0.022)/(6.7 − 0.022)
            </Label>
            <Label x={92} y={94} size={15} weight={700} color={C.copper}>
              ≈ 18 %
            </Label>
            <Label x={92} y={124} size={13} color={C.copper}>
              1 kg alloy: 0.18 kg Fe₃C
            </Label>
            <Label x={92} y={146} size={13} color={C.lfp}>
              0.82 kg ferrite (α)
            </Label>
          </Reveal>
          <Reveal show={visual === "pearlite-lever"}>
            <rect x={0} y={0} width={185} height={130} rx={10} fill="#0b1220" stroke={C.electron} />
            <Label x={92} y={22} size={12} color={C.dim}>
              just above 727 °C: γ + Fe₃C
            </Label>
            <Label x={92} y={46} size={13}>
              w_γ = 5.5 / 5.94
            </Label>
            <Label x={92} y={70} size={15} weight={700} color={C.accent}>
              ≈ 93 % → pearlite
            </Label>
            <Label x={92} y={96} size={13} color={C.accent}>
              0.93 kg pearlite
            </Label>
            <Label x={92} y={116} size={13} color={C.copper}>
              + 0.07 kg Fe₃C at GBs
            </Label>
            <g transform="translate(55 205)">
              <PearliteSketch />
            </g>
            <Label x={92} y={348} size={12} color={C.dim}>
              Fe₃C network on the boundaries
            </Label>
          </Reveal>
        </g>
      </Reveal>

      <Reveal show={visual === "practice"}>
        <rect x={90} y={80} width={420} height={290} rx={20} fill={C.accent} fillOpacity={0.08} stroke={C.accent} strokeWidth={2} />
        {/* mini diagram icon with a draggable point */}
        <g transform="translate(130 120)">
          <rect x={0} y={0} width={150} height={120} rx={10} fill="#0b1220" stroke={C.grid} />
          <path d="M14 30 C60 40 100 80 136 100" fill="none" stroke={C.hot} strokeWidth={2.5} />
          <path d="M14 30 C50 70 100 95 136 100" fill="none" stroke={C.lfp} strokeWidth={2.5} />
          <line x1={40} x2={110} y1={72} y2={72} stroke={C.electron} strokeWidth={2} />
          <motion.circle r={7} fill={C.electron} initial={false} animate={{ cx: [60, 90, 60], cy: [72, 72, 72] }} transition={{ repeat: Infinity, duration: 3 }} />
          <path d="M96 92 l10 14 l3 -6 l6 1 z" fill={C.ink} />
        </g>
        <Label x={400} y={150} size={18} weight={800} color={C.accent}>
          Practise it yourself
        </Label>
        <Label x={400} y={178} size={15} weight={700}>
          Phase Diagram Explorer
        </Label>
        <Label x={400} y={204} size={13} color={C.dim}>
          Cu–Ni · Pb–Sn · Fe–C
        </Label>
        <Label x={300} y={290} size={14}>
          drag composition & temperature,
        </Label>
        <Label x={300} y={314} size={14}>
          then check your lever rule
        </Label>
        <Label x={300} y={350} size={12} color={C.dim}>
          open it with the link under this slide
        </Label>
      </Reveal>

      <Reveal show={visual === "reactions"}>
        {/* eutectic sketch */}
        <g transform="translate(40 60)">
          <Label x={120} y={0} size={15} weight={700}>
            Eutectic
          </Label>
          <path d="M0 40 L120 190 L240 40" fill="none" stroke={C.hot} strokeWidth={3} />
          <line x1={20} y1={190} x2={220} y2={190} stroke={C.dim} strokeWidth={2} />
          <circle cx={120} cy={190} r={7} fill={C.electron} />
          <Label x={120} y={100} size={14}>
            L
          </Label>
          <Label x={40} y={230} size={13}>
            α
          </Label>
          <Label x={200} y={230} size={13}>
            β
          </Label>
          <Label x={120} y={270} size={14} weight={700} color={C.electron}>
            L → α + β
          </Label>
          <Label x={120} y={292} size={12} color={C.dim}>
            a melt turns into two solids at once
          </Label>
        </g>
        {/* peritectic sketch */}
        <g transform="translate(320 60)">
          <Label x={120} y={0} size={15} weight={700}>
            Peritectic
          </Label>
          <path d="M0 40 C60 70 110 110 160 150 L240 190" fill="none" stroke={C.hot} strokeWidth={3} />
          <line x1={20} y1={150} x2={200} y2={150} stroke={C.dim} strokeWidth={2} />
          <circle cx={160} cy={150} r={7} fill={C.electron} />
          <Label x={60} y={120} size={14}>
            L + α
          </Label>
          <Label x={140} y={200} size={13}>
            β
          </Label>
          <Label x={120} y={270} size={14} weight={700} color={C.electron}>
            L + α → β
          </Label>
          <Label x={120} y={292} size={12} color={C.dim}>
            a melt reacts with a solid
          </Label>
        </g>
        <Chip x={300} y={410} text="both: 3 phases in equilibrium, f = 0" color={C.electron} w={320} />
      </Reveal>
    </Stage>
  );
}
