"use client";

import { motion } from "framer-motion";
import { getCourse } from "@batteries/lib/courses";
import { C, Label, Stage, RECAP_CARD_CLASS, RecapLink } from "../primitives";

const { chapters } = getCourse("intro-energy").narration;
const titleOf = (id: string) => chapters.find((c) => c.id === id)?.title ?? id;

const CARDS = [
  { t: "Society", id: "society", k: ["population +", "development"] },
  { t: "Thermo", id: "thermo", k: ["2nd law:", "quality"] },
  { t: "Storage", id: "why-storage", k: ["buys time,", "costs efficiency"] },
  { t: "Compare", id: "compare", k: ["E, P, η, life,", "response, cost"] },
  { t: "Hydro", id: "hydro", k: ["only pumped", "is rechargeable"] },
  { t: "Fuels", id: "fuels", k: ["dense, but", "10–30 % back"] },
  { t: "E-magnetic", id: "electromagnetic", k: ["speed, not", "capacity"] },
  { t: "Economics", id: "economics", k: ["duration", "decides"] },
  { t: "Chemistries", id: "chemistries", k: ["alkaline 1.5 V", "Ni-Cd 1.2 V"] },
  { t: "Testing", id: "testing", k: ["EE < CE", "3 losses"] },
];

const DURATION = [
  { name: "capacitors", t: "seconds", color: C.anion },
  { name: "batteries", t: "hours", color: C.lithium },
  { name: "pumped hydro", t: "days", color: C.lfp },
  { name: "fuels", t: "seasons", color: C.electron },
];

export default function OutroVisual({ visual }: { visual: string }) {
  const show = visual === "recap";
  return (
    <Stage label="Recap">
      <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }}>
        <Label x={300} y={20} size={12} color={C.dim}>
          Click a topic to jump back to it
        </Label>
      </motion.g>
      {CARDS.map((c, i) => {
        const x = 20 + (i % 5) * 114;
        const y = 30 + Math.floor(i / 5) * 84;
        return (
          <motion.g key={c.t} initial={false} animate={{ opacity: show ? 1 : 0, y: show ? 0 : 12 }} transition={{ delay: show ? i * 0.07 : 0, duration: 0.4 }}>
            <RecapLink href={`#${c.id}`} title={titleOf(c.id)}>
              <rect x={x} y={y} width={104} height={72} rx={10} fill="#111a2c" stroke={C.grid} className={RECAP_CARD_CLASS} />
              <circle cx={x + 16} cy={y + 18} r={10} fill={C.accent} />
              <Label x={x + 16} y={y + 22} size={12} color="#0b1220" weight={800}>
                {i + 1}
              </Label>
              <Label x={x + 32} y={y + 23} size={12} weight={700} anchor="start">
                {c.t}
              </Label>
              {c.k.map((line, j) => (
                <Label key={j} x={x + 52} y={y + 46 + j * 16} size={12} color={C.dim}>
                  {line}
                </Label>
              ))}
            </RecapLink>
          </motion.g>
        );
      })}
      <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ delay: show ? 0.8 : 0, duration: 0.5 }}>
        <rect x={40} y={218} width={520} height={206} rx={16} fill="#0b1220" stroke={C.accent} strokeWidth={2} />
        <Label x={300} y={252} size={19} weight={800} color={C.accent}>
          Duration decides the technology
        </Label>
        <line x1={80} y1={320} x2={520} y2={320} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />
        {DURATION.map((d, i) => {
          const x = 110 + i * 130;
          return (
            <g key={d.name}>
              <circle cx={x} cy={320} r={9} fill={d.color} />
              <Label x={x} y={300} size={14} weight={700} color={d.color}>
                {d.name}
              </Label>
              <Label x={x} y={346} size={13}>
                {d.t}
              </Label>
            </g>
          );
        })}
        <Label x={300} y={396} size={14} color={C.dim}>
          storage buys time, at the cost of efficiency
        </Label>
      </motion.g>
    </Stage>
  );
}
