"use client";

import { motion } from "framer-motion";
import { C, Label, Reveal, Stage } from "../primitives";

const LADDER = [
  { t: "Bonding", s: "metallic · ionic · covalent", c: C.electron },
  { t: "Crystal structure", s: "packing · voids · Miller indices", c: C.accent },
  { t: "Defects", s: "vacancies · dislocations · surfaces", c: C.anion },
  { t: "Diffusion & transformations", s: "phase diagrams · nucleation · TTT", c: C.lfp },
  { t: "Microstructure", s: "grains · lamellae · precipitates", c: C.copper },
  { t: "Properties", s: "hard steel · creep-resistant alloys", c: C.lithium },
];

const ROADMAP = [
  "Bonding",
  "Packing",
  "Miller",
  "Defects",
  "Solutions",
  "Thermo",
  "Binary",
  "Ternary",
  "Diffusion",
  "Nucleation",
  "Solidification",
  "TTT",
  "Steels",
  "Alloys",
];

export default function IntroVisual({ visual }: { visual: string }) {
  const ladder = visual === "ladder";
  return (
    <Stage label="From atoms to alloys">
      <Reveal show={ladder}>
        <Label x={300} y={34} size={16} weight={700}>
          One chain of cause and effect
        </Label>
        {LADDER.map((l, i) => {
          const y = 56 + i * 64;
          return (
            <motion.g key={l.t} initial={false} animate={{ opacity: ladder ? 1 : 0, x: ladder ? 0 : -20 }} transition={{ delay: ladder ? i * 0.12 : 0 }}>
              <rect x={150} y={y} width={300} height={46} rx={12} fill={l.c} opacity={0.14} stroke={l.c} />
              <Label x={300} y={y + 20} size={15} weight={700} color={l.c}>
                {l.t}
              </Label>
              <Label x={300} y={y + 38} size={12} color={C.dim}>
                {l.s}
              </Label>
              {i < LADDER.length - 1 && <line x1={300} y1={y + 46} x2={300} y2={y + 62} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />}
            </motion.g>
          );
        })}
      </Reveal>

      <Reveal show={visual === "roadmap"}>
        <Label x={300} y={40} size={16} weight={700}>
          Following the exam, chapter by chapter
        </Label>
        {ROADMAP.map((r, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = 40 + col * 132;
          const y = 70 + row * 86;
          return (
            <g key={r}>
              <rect x={x} y={y} width={120} height={64} rx={12} fill="#111a2c" stroke={C.grid} />
              <circle cx={x + 20} cy={y + 22} r={12} fill={C.accent} />
              <Label x={x + 20} y={y + 27} size={12} color="#0b1220" weight={800}>
                {i + 1}
              </Label>
              <Label x={x + 60} y={y + 50} size={13}>
                {r}
              </Label>
            </g>
          );
        })}
      </Reveal>
    </Stage>
  );
}
