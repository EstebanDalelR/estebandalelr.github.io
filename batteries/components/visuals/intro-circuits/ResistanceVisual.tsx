"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Resistor } from "./circuit";

const ivBox = { x: 80, y: 80, w: 280, h: 240 };
const iv = makeScale(ivBox, [0, 10], [0, 10]);

const MATERIALS = [
  { name: "copper", rho: "1.7 × 10⁻⁸ Ω·m", color: C.copper },
  { name: "aluminium", rho: "2.7 × 10⁻⁸ Ω·m", color: C.zinc },
  { name: "rubber", rho: "~10¹³ Ω·m", color: C.dim },
];

export default function ResistanceVisual({ visual }: { visual: string }) {
  const ohm = visual === "ohm";
  const rho = visual === "resistivity";
  const power = visual === "power";

  return (
    <Stage label="Resistance, resistivity and power">
      <Reveal show={ohm}>
        <Axes box={ivBox} xLabel="current I (mA)" yLabel="voltage V (V)" xLabelDy={42} />
        {[0, 5, 10].map((v) => (
          <Label key={`x${v}`} x={iv.sx(v)} y={ivBox.y + ivBox.h + 18} size={12} color={C.dim}>
            {v}
          </Label>
        ))}
        {[5, 10].map((v) => (
          <Label key={`y${v}`} x={ivBox.x - 8} y={iv.sy(v) + 4} size={12} color={C.dim} anchor="end">
            {v}
          </Label>
        ))}
        <DrawPath d={iv.path([[0, 0], [10, 10]])} show={ohm} color={C.accent} width={3.5} />
        <DrawPath d={iv.path([[0, 0], [10, 5]])} show={ohm} color={C.electron} width={3} delay={0.3} />
        <Label x={iv.sx(6.5)} y={iv.sy(7.6)} size={13} color={C.accent} anchor="end" weight={700}>
          R = 1 kΩ
        </Label>
        <Label x={iv.sx(8.5)} y={iv.sy(3.4)} size={13} color={C.electron} weight={700}>
          R = 0.5 kΩ
        </Label>
        <Label x={ivBox.x + ivBox.w} y={ivBox.y + ivBox.h - 20} size={13} color={C.dim} anchor="end">
          straight line: slope = R
        </Label>
        <Resistor x={420} y={200} len={120} color={C.ink} width={3} />
        <line x1={430} y1={160} x2={530} y2={160} stroke={C.accent} strokeWidth={2} markerEnd="url(#arrow)" />
        <Label x={480} y={150} size={14} color={C.accent} weight={700}>
          I
        </Label>
        <Label x={420} y={240} size={16} weight={700}>
          +
        </Label>
        <Label x={540} y={240} size={16} weight={700}>
          −
        </Label>
        <Label x={480} y={250} size={14} weight={700}>
          V
        </Label>
        <Chip x={480} y={300} text="V = R · I" color={C.accent} w={120} />
        <Label x={480} y={340} size={13} color={C.dim}>
          1 Ω = 1 V/A
        </Label>
      </Reveal>

      <Reveal show={rho}>
        <Label x={300} y={50} size={16} weight={700}>
          Same copper, different shape
        </Label>
        <motion.rect x={80} y={100} height={44} rx={10} fill={C.copper} initial={false} animate={{ width: rho ? 150 : 0 }} transition={{ duration: 0.7 }} />
        <Label x={250} y={128} anchor="start" size={14}>
          length L, area A → R
        </Label>
        <motion.rect x={80} y={180} height={14} rx={7} fill={C.copper} initial={false} animate={{ width: rho ? 440 : 0 }} transition={{ duration: 0.9, delay: 0.2 }} />
        <Label x={80} y={220} anchor="start" size={14}>
          length 3L, area A/3 → R × 9
        </Label>
        <Chip x={420} y={222} text="R = ρ L / A" color={C.accent} w={150} />
        <Label x={300} y={270} size={14} color={C.dim}>
          resistivity ρ is the material · resistance R is the component
        </Label>
        {MATERIALS.map((m, i) => (
          <g key={m.name}>
            <rect x={130} y={296 + i * 40} width={340} height={30} rx={8} fill="#111a2c" stroke={C.grid} />
            <circle cx={152} cy={311 + i * 40} r={7} fill={m.color} />
            <Label x={170} y={316 + i * 40} anchor="start" size={14} weight={700}>
              {m.name}
            </Label>
            <Label x={455} y={316 + i * 40} anchor="end" size={14} color={C.dim}>
              {`ρ = ${m.rho}`}
            </Label>
          </g>
        ))}
      </Reveal>

      <Reveal show={power}>
        <Label x={150} y={60} size={15} weight={700}>
          p = R i²
        </Label>
        {[
          { i: 1, x: 80 },
          { i: 2, x: 170 },
        ].map((b) => (
          <g key={b.i}>
            <motion.rect
              x={b.x}
              width={60}
              rx={6}
              fill={C.hot}
              opacity={0.8}
              initial={false}
              animate={{ y: power ? 320 - b.i * b.i * 55 : 320, height: power ? b.i * b.i * 55 : 0 }}
              transition={{ duration: 0.8, delay: b.i * 0.15 }}
            />
            <Label x={b.x + 30} y={342} size={13}>
              {`i = ${b.i}`}
            </Label>
            <Label x={b.x + 30} y={310 - b.i * b.i * 55} size={13} weight={700} color={C.hot}>
              {b.i === 1 ? "p" : "4p"}
            </Label>
          </g>
        ))}
        <Label x={150} y={372} size={13} color={C.dim}>
          double the current, four times the heat
        </Label>
        <line x1={300} y1={80} x2={300} y2={380} stroke={C.grid} strokeWidth={2} />
        <Label x={445} y={60} size={15} weight={700}>
          Send 100 MW
        </Label>
        <rect x={330} y={90} width={230} height={80} rx={10} fill="#111a2c" stroke={C.hot} />
        <Label x={445} y={120} size={14} weight={700}>
          at 40 kV: I = 2 500 A
        </Label>
        <Label x={445} y={148} size={13} color={C.hot}>
          loss R I² → 100 ×
        </Label>
        <rect x={330} y={190} width={230} height={80} rx={10} fill="#111a2c" stroke={C.lithium} />
        <Label x={445} y={220} size={14} weight={700}>
          at 400 kV: I = 250 A
        </Label>
        <Label x={445} y={248} size={13} color={C.lithium}>
          loss R I² → 1 ×
        </Label>
        <Chip x={445} y={310} text="high voltage → low current → low losses" color={C.lithium} w={260} />
        <Label x={445} y={350} size={13} color={C.dim}>
          p = v i = R i² = v²/R
        </Label>
      </Reveal>
    </Stage>
  );
}
