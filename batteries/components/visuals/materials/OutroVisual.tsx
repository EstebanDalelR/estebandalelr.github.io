"use client";

import { motion } from "framer-motion";
import { getCourse } from "@batteries/lib/courses";
import { C, Label, Stage, RECAP_CARD_CLASS, RecapLink } from "../primitives";

const { chapters } = getCourse("materials").narration;
const titleOf = (id: string) => chapters.find((c) => c.id === id)?.title ?? id;

const CARDS = [
  { t: "Bonding", id: "bonding", k: ["U ∝ Z₊Z₋ / r", "strong → high Tm"] },
  { t: "Packing", id: "packing", k: ["fcc, hcp: 0.74", "2 tet + 1 oct / atom"] },
  { t: "Miller", id: "miller", k: ["intercepts →", "reciprocals: (101)"] },
  { t: "Defects", id: "defects", k: ["stacking fault", "ABCABABC"] },
  { t: "Phase rule", id: "thermo", k: ["p + f = c + 1", "common tangent"] },
  { t: "Lever rule", id: "binary", k: ["opposite arm", "3-phase triangle"] },
  { t: "Diffusion", id: "diffusion", k: ["D = D₀e^(−Q/RT)", "c = A + B erf z"] },
  { t: "Nucleation", id: "nucleation", k: ["ΔG* ∝ 1/ΔT²", "needs undercooling"] },
  { t: "Solidification", id: "solidification", k: ["eutectic lamellae", "peritectic coring"] },
  { t: "TTT", id: "ttt", k: ["nose: kinetics", "× driving force"] },
  { t: "Steels", id: "steels", k: ["Schaeffler:", "Cr_eq vs Ni_eq"] },
  { t: "Superalloys", id: "alloys", k: ["γ + coherent γ′", "creep resistant"] },
];
const CHAIN = ["bonding", "structure", "defects", "diffusion", "microstructure", "properties"];

export default function OutroVisual({ visual }: { visual: string }) {
  const show = visual === "recap";
  return (
    <Stage label="Recap">
      <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }}>
        <Label x={300} y={22} size={12} color={C.dim}>
          Click a topic to jump back to it
        </Label>
      </motion.g>
      {CARDS.map((c, i) => {
        const x = 20 + (i % 4) * 142;
        const y = 34 + Math.floor(i / 4) * 72;
        return (
          <motion.g key={c.t} initial={false} animate={{ opacity: show ? 1 : 0, y: show ? 0 : 12 }} transition={{ delay: show ? i * 0.06 : 0, duration: 0.4 }}>
            <RecapLink href={`#${c.id}`} title={titleOf(c.id)}>
              <rect x={x} y={y} width={134} height={64} rx={10} fill="#111a2c" stroke={C.grid} className={RECAP_CARD_CLASS} />
              <circle cx={x + 14} cy={y + 16} r={9} fill={C.accent} />
              <Label x={x + 14} y={y + 20} size={12} color="#0b1220" weight={800}>
                {i + 1}
              </Label>
              <Label x={x + 28} y={y + 21} anchor="start" size={12} weight={700}>
                {c.t}
              </Label>
              {c.k.map((line, j) => (
                <Label key={j} x={x + 67} y={y + 40 + j * 16} size={12} color={C.dim}>
                  {line}
                </Label>
              ))}
            </RecapLink>
          </motion.g>
        );
      })}

      <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ delay: show ? 0.9 : 0, duration: 0.5 }}>
        <rect x={20} y={250} width={560} height={180} rx={16} fill="#0b1220" stroke={C.accent} strokeWidth={2} />
        <Label x={300} y={284} size={18} weight={800} color={C.accent}>
          One chain of cause and effect
        </Label>
        <line x1={65} x2={535} y1={350} y2={350} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />
        {CHAIN.map((n, i) => {
          const x = 65 + i * 90;
          return (
            <g key={n}>
              <circle cx={x} cy={350} r={9} fill={i === CHAIN.length - 1 ? C.lithium : C.accent} />
              <Label x={x} y={i % 2 ? 386 : 328} size={13} weight={700}>
                {n}
              </Label>
            </g>
          );
        })}
        <Label x={300} y={414} size={12} color={C.dim}>
          processing (cooling, ageing, alloying) steers the microstructure
        </Label>
      </motion.g>
    </Stage>
  );
}
