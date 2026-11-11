"use client";

import { motion } from "framer-motion";
import { C, Chip, Label, Reveal, Stage } from "../primitives";
import { Card, Title } from "../blocks";

const BEADS = 22;
const bead = (i: number) => {
  const t = i / (BEADS - 1);
  return { x: 50 + t * 500, y: 220 + Math.sin(t * Math.PI * 3) * 60 };
};

const EXAMPLES = [
  { t: "plastics", c: C.lfp },
  { t: "rubber", c: C.electron },
  { t: "cellulose", c: C.lithium },
  { t: "proteins", c: C.anion },
  { t: "electrode binder", c: C.copper },
];

export default function IntroVisual({ visual }: { visual: string }) {
  const chain = visual === "chain";
  const road = visual === "roadmap";
  return (
    <Stage label="A polymer is a chain of repeating units">
      <Reveal show={chain}>
        <Title>One molecule, thousands of units</Title>
        <polyline
          points={Array.from({ length: BEADS }, (_, i) => `${bead(i).x},${bead(i).y}`).join(" ")}
          fill="none"
          stroke={C.dim}
          strokeWidth={3}
        />
        {Array.from({ length: BEADS }, (_, i) => {
          const p = bead(i);
          return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={11}
              fill={C.accent}
              stroke="#0b1220"
              strokeWidth={2}
              initial={false}
              animate={{ scale: chain ? 1 : 0 }}
              transition={{ delay: chain ? i * 0.04 : 0 }}
            />
          );
        })}
        <Chip x={bead(3).x + 20} y={bead(3).y + 40} text="one monomer unit" w={140} />
        <circle cx={bead(3).x} cy={bead(3).y} r={17} fill="none" stroke={C.electron} strokeWidth={2} />
        <Label x={300} y={360} size={14} color={C.dim}>
          length and chemistry of the chain decide the material
        </Label>
        {EXAMPLES.map((e, i) => (
          <Chip key={e.t} x={[70, 165, 265, 365, 495][i]} y={405} text={e.t} color={e.c} w={e.t.length * 8 + 22} />
        ))}
      </Reveal>

      <Reveal show={road}>
        <Title>Two lectures, one story</Title>
        <Card
          x={40}
          y={80}
          w={245}
          h={270}
          show={road}
          title="F1 Organic chemistry"
          color={C.lfp}
          lines={["structures & bonds", "nucleophile / electrophile", "substitution, carbonyls", "radical reactions", "stereochemistry", "tacticity"]}
          size={14}
        />
        <Card
          x={315}
          y={80}
          w={245}
          h={270}
          show={road}
          delay={0.2}
          title="F2 Polymer science"
          color={C.lithium}
          lines={["history: Staudinger", "monomer ≠ repeating unit", "architectures", "crosslinking & families", "Mn, Mw, dispersity", "measuring molar mass"]}
          size={14}
        />
        <line x1={285} y1={215} x2={313} y2={215} stroke={C.ink} strokeWidth={2} markerEnd="url(#arrow)" />
        <Label x={300} y={395} size={14} color={C.dim}>
          the chemistry of the bead → the length and shape of the string
        </Label>
      </Reveal>
    </Stage>
  );
}
