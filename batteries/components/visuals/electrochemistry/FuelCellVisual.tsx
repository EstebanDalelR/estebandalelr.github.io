"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Flow, Label, Reveal, Stage, makeScale } from "../primitives";

const box = { x: 80, y: 60, w: 460, h: 300 };
const sc = makeScale(box, [0, 1.4], [0, 1.35]);

type Params = { a: number; j0: number; r: number };
const BASE: Params = { a: 0.045, j0: 0.001, r: 0.15 };
const BETTER: Params = { a: 0.036, j0: 0.004, r: 0.09 };

// Tafel-like activation loss + ohmic + exponential mass-transport loss.
function voltage(j: number, p: Params) {
  const act = p.a * Math.log((j + p.j0) / p.j0);
  const mass = 0.05 * Math.exp(8 * (j - 1.2));
  return 1.02 - act - p.r * j - mass;
}

function curve(p: Params): [number, number][] {
  const pts: [number, number][] = [];
  for (let j = 0; j <= 1.36; j += 0.01) {
    const v = voltage(j, p);
    if (v < 0.05) break;
    pts.push([j, v]);
  }
  return pts;
}

const base = sc.path(curve(BASE));
const better = sc.path(curve(BETTER));

export default function FuelCellVisual({ visual }: { visual: string }) {
  const cell = visual === "fc-cell";
  const improve = visual === "fc-improve";

  return (
    <Stage label="PEM fuel cell">
      {/* Cell schematic */}
      <Reveal show={cell}>
        <rect x={150} y={110} width={80} height={230} rx={6} fill={C.graphite} />
        <rect x={270} y={110} width={60} height={230} fill={C.accent} opacity={0.25} stroke={C.accent} />
        <rect x={370} y={110} width={80} height={230} rx={6} fill={C.graphite} />
        <Label x={190} y={100} weight={700}>anode (−)</Label>
        <Label x={300} y={100} size={13} color={C.accent}>Nafion</Label>
        <Label x={410} y={100} weight={700}>cathode (+)</Label>
        <rect x={228} y={110} width={8} height={230} fill="#cbd5e1" opacity={0.5} />
        <rect x={364} y={110} width={8} height={230} fill="#cbd5e1" opacity={0.5} />
        <Label x={300} y={360} size={12} color={C.dim}>Pt/C catalyst layers</Label>

        <Label x={70} y={190} size={16} weight={700} color="#93c5fd">H₂ in</Label>
        <Flow path="M60 210 L200 210" color="#93c5fd" r={7} count={4} dur={2.2} />
        <Label x={530} y={190} size={16} weight={700} color="#fca5a5">O₂ in</Label>
        <Flow path="M545 210 L405 210" color="#fca5a5" r={7} count={4} dur={2.2} />
        <Label x={530} y={315} size={15} weight={700} color="#bae6fd">H₂O out</Label>
        <Flow path="M410 290 L550 290" color="#bae6fd" r={6} count={3} dur={2.2} />

        <Flow path="M225 180 L375 180" color={C.cation} r={7} count={5} dur={2} label="+" />
        <Flow path="M225 250 L375 250" color={C.cation} r={7} count={5} dur={2} label="+" />
        <Label x={300} y={225} size={13} weight={700} color={C.cation}>H⁺</Label>

        <path d="M190 110 L190 60 L410 60 L410 110" fill="none" stroke={C.dim} strokeWidth={3} />
        <Flow path="M190 110 L190 60 L410 60 L410 110" count={6} dur={3} r={5} />
        <Label x={300} y={50} size={13} color={C.electron}>e⁻ through the load</Label>

        <Label x={190} y={400} size={14}>H₂ → 2H⁺ + 2e⁻</Label>
        <Label x={410} y={400} size={14}>O₂ + 4H⁺ + 4e⁻ → 2H₂O</Label>
        <Label x={300} y={432} size={15} weight={700} color={C.accent}>E° = 1.23 V</Label>
      </Reveal>

      {/* Polarisation curve */}
      <Reveal show={!cell}>
        <Axes box={box} xLabel="current density j (A/cm²)" yLabel="cell voltage (V)" xLabelDy={40} />
        {[0, 0.5, 1].map((v) => (
          <Label key={v} x={box.x - 10} y={sc.sy(v) + 4} size={12} color={C.dim} anchor="end">
            {v.toFixed(1)}
          </Label>
        ))}
        {[0.5, 1].map((j) => (
          <Label key={j} x={sc.sx(j)} y={box.y + box.h + 16} size={12} color={C.dim}>
            {j.toFixed(1)}
          </Label>
        ))}
        <line x1={box.x} y1={sc.sy(1.23)} x2={box.x + box.w} y2={sc.sy(1.23)} stroke={C.accent} strokeDasharray="6 5" />
        <Label x={box.x + box.w} y={sc.sy(1.23) - 8} size={13} color={C.accent} anchor="end">
          theoretical 1.23 V
        </Label>

        <motion.g initial={false} animate={{ opacity: improve ? 0.25 : 1 }}>
          <rect x={box.x} y={box.y} width={sc.sx(0.15) - box.x} height={box.h} fill={C.hot} opacity={0.12} />
          <rect x={sc.sx(0.15)} y={box.y} width={sc.sx(1.1) - sc.sx(0.15)} height={box.h} fill={C.electron} opacity={0.06} />
          <rect x={sc.sx(1.1)} y={box.y} width={box.x + box.w - sc.sx(1.1)} height={box.h} fill={C.anion} opacity={0.12} />
          <Label x={(box.x + sc.sx(0.15)) / 2} y={box.y + box.h - 12} size={12} color={C.hot}>activation</Label>
          <Label x={(sc.sx(0.15) + sc.sx(1.1)) / 2} y={box.y + box.h - 12} size={12} color={C.electron}>ohmic</Label>
          <Label x={(sc.sx(1.1) + box.x + box.w) / 2} y={box.y + box.h - 12} size={12} color={C.anion}>mass transport</Label>
        </motion.g>

        <DrawPath d={base} show={!cell} color={C.ink} width={3.5} />
        <Reveal show={!cell && !improve} delay={0.6}>
          <path d={`M${sc.sx(0.2)} ${sc.sy(1.2)} L${sc.sx(0.05)} ${sc.sy(0.95)}`} stroke={C.hot} strokeWidth={2} markerEnd="url(#arrow)" />
          <Label x={sc.sx(0.22)} y={sc.sy(1.2) + 18} size={13} color={C.hot} anchor="start">
            big drop: slow O₂ reduction at the cathode
          </Label>
          <Label x={sc.sx(0.22)} y={sc.sy(1.2) + 36} size={12} color={C.dim} anchor="start">
            (H₂O₂ intermediate)
          </Label>
        </Reveal>

        <DrawPath d={better} show={improve} color={C.lithium} width={3.5} />
        <Reveal show={improve} delay={0.5}>
          <Label x={sc.sx(0.62)} y={sc.sy(0.86)} size={14} color={C.lithium} anchor="start" weight={700}>
            improved cell
          </Label>
          <g transform="translate(96 238)">
            <rect x={0} y={0} width={236} height={104} rx={10} fill="#0b1220" opacity={0.92} stroke={C.lithium} />
            <Label x={12} y={20} size={13} anchor="start">• better catalyst: Pt / Pt alloys</Label>
            <Label x={12} y={38} size={13} anchor="start">   on high-surface-area carbon</Label>
            <Label x={12} y={56} size={13} anchor="start">• higher T and O₂ pressure</Label>
            <Label x={12} y={74} size={13} anchor="start">• good three-phase boundary</Label>
            <Label x={12} y={92} size={13} anchor="start">• thin, hydrated membrane</Label>
          </g>
        </Reveal>
        <Reveal show={improve}>
          <Chip x={200} y={420} text="mainly: speed up the cathode ORR" color={C.lithium} />
        </Reveal>
      </Reveal>
    </Stage>
  );
}
