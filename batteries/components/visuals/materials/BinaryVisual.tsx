"use client";

import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

// Cu–Ni lens diagram, wt% Ni 0..100, T 1050..1500 °C (schematic, matching the lecture's tie line)
const box = { x: 90, y: 60, w: 440, h: 280 };
const s = makeScale(box, [0, 100], [1050, 1500]);
const liquidus = (x: number) => 1085 + (1455 - 1085) * (1 - Math.pow(1 - x / 100, 1.53));
const solidus = (x: number) => 1085 + (1455 - 1085) * Math.pow(x / 100, 0.96);
const pts = (f: (x: number) => number): [number, number][] => Array.from({ length: 60 }, (_, i) => [(i / 59) * 100, f((i / 59) * 100)]);

const T_TIE = 1250;
const CL = 32;
const CA = 43;
const C0 = 35;

export default function BinaryVisual({ visual }: { visual: string }) {
  const lens = visual === "lines" || visual === "lever";
  const lever = visual === "lever";
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
