"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Flow, Label, Reveal, Stage, makeScale } from "../primitives";

const vBox = { x: 90, y: 70, w: 450, h: 260 };
const v = makeScale(vBox, [0, 1], [0, 1.1]);
const capLine = v.path([
  [0, 1],
  [1, 0],
]);
const battery = v.path(
  Array.from({ length: 101 }, (_, i) => {
    const q = i / 100;
    return [q, 0.8 + 0.12 * Math.exp(-q * 25) - 0.05 * q - 0.55 * Math.exp((q - 1) * 30)] as [number, number];
  }),
);

const RESPONSE = [
  { name: "SMES", t: "≈ 5 ms", w: 0.08 },
  { name: "Capacitors", t: "< 50 ms", w: 0.2 },
  { name: "Batteries", t: "< 1 s", w: 0.38 },
  { name: "Flywheels", t: "seconds", w: 0.5 },
  { name: "Pumped hydro", t: "s – min", w: 0.72 },
  { name: "CAES", t: "minutes", w: 0.9 },
];

const LIMITS = ["almost no energy capacity", "very high cost per kWh", "capacitors self-discharge fast", "SMES needs cryogenic cooling"];

export default function ElectromagneticVisual({ visual }: { visual: string }) {
  return (
    <Stage label="Electromagnetic energy storage">
      <Reveal show={visual === "em-mechanism"}>
        <Label x={150} y={50} size={16} weight={700} color={C.anion}>
          Capacitor: electric field
        </Label>
        <rect x={95} y={90} width={14} height={180} fill={C.hot} />
        <rect x={191} y={90} width={14} height={180} fill={C.lfp} />
        {[110, 145, 180, 215, 250].map((y) => (
          <g key={y}>
            <Label x={102} y={y + 5} size={14} weight={800} color="#0b1220">
              +
            </Label>
            <Label x={198} y={y + 5} size={14} weight={800} color="#0b1220">
              −
            </Label>
            <path d={`M112 ${y} L188 ${y}`} stroke={C.anion} strokeWidth={1.5} markerEnd="url(#arrow)" opacity={0.8} />
          </g>
        ))}
        <Label x={150} y={305} size={15} weight={700}>
          W = ½ C V²
        </Label>
        <Label x={150} y={328} size={12} color={C.dim}>
          no chemical reaction
        </Label>

        <line x1={300} y1={70} x2={300} y2={350} stroke={C.grid} strokeWidth={2} />

        <Label x={450} y={50} size={16} weight={700} color="#93c5fd">
          SMES: magnetic field
        </Label>
        <ellipse cx={450} cy={180} rx={100} ry={70} fill="none" stroke="#93c5fd" strokeWidth={10} opacity={0.5} />
        <Flow path="M450 110 A100 70 0 1 1 449 110" count={8} dur={3} color={C.electron} r={5} />
        <Label x={450} y={176} size={13}>
          superconducting coil
        </Label>
        <Label x={450} y={196} size={13} color="#bae6fd">
          cooled, zero resistance
        </Label>
        <Label x={450} y={305} size={15} weight={700}>
          W = ½ L I²
        </Label>
        <Label x={450} y={328} size={12} color={C.dim}>
          current circulates without loss
        </Label>
        <Chip x={300} y={405} text="stored directly as electric or magnetic field energy" color={C.anion} w={420} />
      </Reveal>

      <Reveal show={visual === "em-voltage"}>
        <Axes box={vBox} xLabel="charge removed →" yLabel="voltage" />
        <DrawPath d={capLine} show={visual === "em-voltage"} color={C.anion} width={3.5} />
        <DrawPath d={battery} show={visual === "em-voltage"} color={C.lithium} width={3.5} delay={0.3} />
        <Label x={v.sx(0.56)} y={v.sy(0.06)} size={14} weight={700} color={C.anion} anchor="start">
          capacitor: V = Q / C
        </Label>
        <Label x={v.sx(0.55)} y={v.sy(0.8) - 12} size={14} weight={700} color={C.lithium}>
          battery plateau
        </Label>
        <line x1={v.sx(0.5)} x2={v.sx(0.5)} y1={v.sy(0.5)} y2={v.sy(0)} stroke={C.dim} strokeDasharray="4 4" />
        <circle cx={v.sx(0.5)} cy={v.sy(0.5)} r={6} fill={C.anion} />
        <Label x={v.sx(0.5) - 12} y={v.sy(0.5) + 24} anchor="end" size={13}>
          at V/2: 75 % of the energy is gone
        </Label>
        <Chip x={300} y={405} text="energy ∝ V² · many loads can't use the lower half" color={C.anion} w={400} />
      </Reveal>

      <Reveal show={visual === "em-when"}>
        <Label x={300} y={40} size={17} weight={700}>
          Response time
        </Label>
        {RESPONSE.map((r, i) => (
          <g key={r.name}>
            <Label x={160} y={88 + i * 44} anchor="end" size={14} weight={i < 2 ? 700 : 500} color={i < 2 ? C.anion : C.ink}>
              {r.name}
            </Label>
            <motion.rect
              x={172}
              y={70 + i * 44}
              height={26}
              rx={5}
              fill={i < 2 ? C.anion : C.dim}
              opacity={0.8}
              initial={false}
              animate={{ width: visual === "em-when" ? r.w * 300 : 0 }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
            />
            <Label x={180 + r.w * 300} y={88 + i * 44} anchor="start" size={13}>
              {r.t}
            </Label>
          </g>
        ))}
        <rect x={60} y={345} width={480} height={50} rx={12} fill="#111a2c" stroke={C.anion} />
        <Label x={300} y={367} size={14} weight={700} color={C.anion}>
          power quality · frequency regulation · millions of cycles
        </Label>
        <Label x={300} y={386} size={13}>
          grid capacitor systems ~200 MW class, for seconds
        </Label>
      </Reveal>

      <Reveal show={visual === "em-limits"}>
        <Label x={300} y={42} size={17} weight={700}>
          Their greatest limitations
        </Label>
        {LIMITS.map((l, i) => (
          <motion.g key={l} initial={false} animate={{ opacity: visual === "em-limits" ? 1 : 0, x: visual === "em-limits" ? 0 : -20 }} transition={{ delay: i * 0.12 }}>
            <rect x={110} y={80 + i * 64} width={380} height={48} rx={12} fill={C.hot} opacity={0.12} stroke={C.hot} />
            <Label x={300} y={110 + i * 64} size={15}>
              {l}
            </Label>
          </motion.g>
        ))}
        <Chip x={300} y={390} text="bought for speed, never for capacity" color={C.anion} w={320} />
      </Reveal>
    </Stage>
  );
}
