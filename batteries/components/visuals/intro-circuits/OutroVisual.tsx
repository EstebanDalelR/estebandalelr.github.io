"use client";

import { motion } from "framer-motion";
import { getCourse } from "@batteries/lib/courses";
import { C, Label, Stage, RECAP_CARD_CLASS, RecapLink } from "../primitives";

const { chapters } = getCourse("intro-circuits").narration;
const titleOf = (id: string) => chapters.find((c) => c.id === id)?.title ?? id;

const CARDS = [
  { t: "Current", id: "current", k: ["I = dq/dt", "1 A = 1 C/s"] },
  { t: "Voltage", id: "voltage", k: ["V = E/Q", "1 V = 1 J/C"] },
  { t: "Resistance", id: "resistance", k: ["V = R·I", "R = ρL/A"] },
  { t: "Power", id: "resistance", k: ["p = R·i²", "→ high-V lines"] },
  { t: "Kirchhoff", id: "series", k: ["loop: ΣV = 0", "node: ΣI = 0"] },
  { t: "AC", id: "ac", k: ["230 V rms", "325 V peak, 50 Hz"] },
  { t: "Impedance", id: "impedance", k: ["Z = R + jX", "size + phase"] },
  { t: "Grid", id: "sync", k: ["inertia, primary", "& secondary"] },
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
        const x = 18 + (i % 4) * 143;
        const y = 30 + Math.floor(i / 4) * 100;
        return (
          <motion.g
            key={c.t}
            initial={false}
            animate={{ opacity: show ? 1 : 0, y: show ? 0 : 12 }}
            transition={{ delay: show ? i * 0.07 : 0, duration: 0.4 }}
          >
            <RecapLink href={`#${c.id}`} title={titleOf(c.id)}>
              <rect x={x} y={y} width={133} height={88} rx={10} fill="#111a2c" stroke={C.grid} className={RECAP_CARD_CLASS} />
              <circle cx={x + 16} cy={y + 18} r={10} fill={C.accent} />
              <Label x={x + 16} y={y + 22} size={12} color="#0b1220" weight={800}>
                {i + 1}
              </Label>
              <Label x={x + 32} y={y + 23} size={13} weight={700} anchor="start">
                {c.t}
              </Label>
              {c.k.map((line, j) => (
                <Label key={j} x={x + 66} y={y + 52 + j * 20} size={12} color={C.dim}>
                  {line}
                </Label>
              ))}
            </RecapLink>
          </motion.g>
        );
      })}

      <motion.g
        initial={false}
        animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.9 }}
        transition={{ delay: show ? 0.7 : 0, duration: 0.5 }}
        style={{ originX: "300px", originY: "330px" }}
      >
        <rect x={40} y={238} width={520} height={190} rx={16} fill="#0b1220" stroke={C.accent} strokeWidth={2} />
        <Label x={300} y={274} size={19} weight={800} color={C.accent}>
          Frequency = the balance of the grid
        </Label>
        <rect x={70} y={296} width={210} height={112} rx={12} fill={C.lfp} opacity={0.12} stroke={C.lfp} />
        <Label x={175} y={326} size={14} weight={700} color={C.lfp}>
          Synchronised generators
        </Label>
        <Label x={175} y={352} size={13}>
          share inertia
        </Label>
        <Label x={175} y={374} size={13}>
          → time to react
        </Label>
        <rect x={320} y={296} width={210} height={112} rx={12} fill={C.hot} opacity={0.1} stroke={C.hot} />
        <Label x={425} y={326} size={14} weight={700} color={C.hot}>
          Power electronics
        </Label>
        <Label x={425} y={352} size={13}>
          connect renewables
        </Label>
        <Label x={425} y={374} size={13}>
          but add no inertia
        </Label>
      </motion.g>
    </Stage>
  );
}
