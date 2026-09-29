"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";
import { Cell, Resistor, Wire } from "./circuit";

const NODE = { x: 300, y: 205 };
const BRANCHES = [
  { path: `M120 ${NODE.y} L${NODE.x} ${NODE.y}`, text: "3 mA in", lx: 190, ly: NODE.y - 14, color: C.accent },
  { path: `M${NODE.x} 55 L${NODE.x} ${NODE.y}`, text: "2 mA in", lx: NODE.x + 12, ly: 110, color: C.accent, start: true },
  { path: `M${NODE.x} ${NODE.y} L480 ${NODE.y}`, text: "4 mA out", lx: 410, ly: NODE.y - 14, color: C.electron },
  { path: `M${NODE.x} ${NODE.y} L${NODE.x} 355`, text: "1 mA out", lx: NODE.x + 12, ly: 300, color: C.electron, start: true },
];

const RBARS = [
  { name: "R₁", v: 2, color: C.accent },
  { name: "R₂", v: 8, color: C.anion },
  { name: "R_tot", v: 1.6, color: C.lithium },
];

export default function ParallelVisual({ visual }: { visual: string }) {
  const kcl = visual === "kcl";
  const par = visual === "parallel";
  const example = visual === "example";
  const circuit = par || example;

  return (
    <Stage label="Parallel circuits and Kirchhoff's current law">
      <Reveal show={kcl}>
        {BRANCHES.map((b) => (
          <g key={b.text}>
            <path d={b.path} stroke={C.dim} strokeWidth={3} />
            <Flow path={b.path} count={4} dur={2.2} color={b.color} r={5} />
            <Label x={b.lx} y={b.ly} size={14} color={b.color} weight={700} anchor={b.start ? "start" : "middle"}>
              {b.text}
            </Label>
          </g>
        ))}
        <circle cx={NODE.x} cy={NODE.y} r={10} fill={C.ink} />
        <Label x={NODE.x + 20} y={NODE.y + 30} size={13} color={C.dim} anchor="start">
          node
        </Label>
        <Chip x={300} y={395} text="3 + 2 − 4 − 1 = 0   ·   ΣI = 0" color={C.accent} w={300} />
        <Label x={300} y={430} size={13} color={C.dim}>
          charge cannot pile up in a wire: what flows in, flows out
        </Label>
      </Reveal>

      <Reveal show={circuit}>
        <Wire d="M80 195 L80 100 L400 100 L400 180" />
        <Wire d="M250 100 L250 180" />
        <Wire d="M250 240 L250 320 M400 240 L400 320 L80 320 L80 215" />
        <Resistor x={250} y={180} len={60} vertical color={C.accent} />
        <Resistor x={400} y={180} len={60} vertical color={C.anion} />
        <Cell x={80} y={205} color={C.lithium} />
        <circle cx={250} cy={100} r={5} fill={C.ink} />
        <circle cx={250} cy={320} r={5} fill={C.ink} />
        <Flow path="M80 195 L80 100 L250 100" count={5} dur={2.2} color={C.accent} r={4} />
        <motion.g initial={false} animate={{ opacity: circuit ? 1 : 0 }}>
          <Flow path="M250 100 L250 320 L80 320 L80 215" count={example ? 7 : 4} dur={2.6} color={C.accent} r={4} />
          <Flow path="M250 100 L400 100 L400 320 L250 320" count={example ? 2 : 4} dur={2.6} color={C.anion} r={4} />
        </motion.g>
      </Reveal>

      <Reveal show={par}>
        <Label x={266} y={215} anchor="start" size={14} weight={700} color={C.accent}>
          R₁
        </Label>
        <Label x={416} y={215} anchor="start" size={14} weight={700} color={C.anion}>
          R₂
        </Label>
        <Label x={325} y={70} size={13} color={C.dim}>
          same voltage across each branch · currents add
        </Label>
        {RBARS.map((b, i) => (
          <g key={b.name}>
            <Label x={140} y={362 + i * 26} anchor="end" size={13} weight={700} color={b.color}>
              {b.name}
            </Label>
            <motion.rect
              x={150}
              y={350 + i * 26}
              height={16}
              rx={4}
              fill={b.color}
              initial={false}
              animate={{ width: par ? b.v * 30 : 0 }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.2 }}
            />
            <Label x={158 + b.v * 30} y={362 + i * 26} anchor="start" size={13}>
              {`${b.v} Ω`}
            </Label>
          </g>
        ))}
        <Label x={500} y={390} size={13} color={C.lithium} weight={700}>
          below the smallest
        </Label>
        <Label x={500} y={410} size={13} color={C.lithium} weight={700}>
          branch, always
        </Label>
      </Reveal>

      <Reveal show={example}>
        <Label x={165} y={88} size={14} color={C.accent} weight={700}>
          I = 27 mA
        </Label>
        <Label x={262} y={150} anchor="start" size={13} color={C.accent} weight={700}>
          21 mA
        </Label>
        <Label x={412} y={150} anchor="start" size={13} color={C.anion} weight={700}>
          6 mA
        </Label>
        <Label x={266} y={215} anchor="start" size={14} weight={700} color={C.accent}>
          R₁ = ?
        </Label>
        <Label x={416} y={215} anchor="start" size={14} weight={700} color={C.anion}>
          R₂ = 7 Ω
        </Label>
        <Label x={300} y={360} size={14}>
          KCL: I₂ = 27 − 21 = 6 mA
        </Label>
        <Label x={300} y={386} size={14}>
          same voltage: I₁R₁ = I₂R₂
        </Label>
        <Chip x={300} y={420} text="R₁ = 6 mA · 7 Ω / 21 mA = 2 Ω" color={C.lithium} w={300} />
      </Reveal>
    </Stage>
  );
}
