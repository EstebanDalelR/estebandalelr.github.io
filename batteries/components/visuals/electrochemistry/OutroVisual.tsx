"use client";

import { motion } from "framer-motion";
import { getCourse } from "@batteries/lib/courses";
import { C, Label, Stage } from "../primitives";

const { chapters } = getCourse("electrochemistry").narration;

const titleOf = (id: string) => chapters.find((c) => c.id === id)?.title ?? id;

const CARDS = [
  { t: "Pile", id: "voltaic-pile", k: ["Zn oxidised,", "H⁺ reduced"] },
  { t: "Li-ion", id: "li-ion", k: ["graphite (−)", "LFP (+)"] },
  { t: "EDL", id: "edl", k: ["compact +", "diffuse layer"] },
  { t: "CV", id: "cv", k: ["ΔEp = 57/n mV", "ip ∝ √v"] },
  { t: "i vs E", id: "controlled-current", k: ["fixed rate vs", "chosen reaction"] },
  { t: "Supercaps", id: "supercaps", k: ["high power", "E = ½CV²"] },
  { t: "Fuel cell", id: "fuel-cells", k: ["cathode ORR", "activation loss"] },
  { t: "Rate test", id: "capacity-fade", k: ["iR drop +", "diffusion"] },
  { t: "EIS", id: "eis", k: ["τ = RC", "per process"] },
  { t: "Kinetics", id: "kinetics", k: ["big j₀,", "β ≈ 0.5, nano"] },
];

export default function OutroVisual({ visual }: { visual: string }) {
  const show = visual === "recap";
  return (
    <Stage label="Recap">
      <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }}>
        <Label x={300} y={24} size={12} color={C.dim}>
          Click a topic to jump back to it
        </Label>
      </motion.g>
      {CARDS.map((c, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 20 + col * 114;
        const y = 36 + row * 84;
        return (
          <motion.g
            key={c.t}
            initial={false}
            animate={{ opacity: show ? 1 : 0, y: show ? 0 : 12 }}
            transition={{ delay: show ? i * 0.07 : 0, duration: 0.4 }}
          >
            <a href={`#${c.id}`} className="group cursor-pointer" aria-label={`Jump to ${titleOf(c.id)}`}>
              <title>{titleOf(c.id)}</title>
              <rect
                x={x}
                y={y}
                width={104}
                height={72}
                rx={10}
                fill="#111a2c"
                stroke={C.grid}
                className="transition-colors group-hover:fill-[#16233a] group-hover:stroke-[#3dd6c6]"
              />
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
            </a>
          </motion.g>
        );
      })}

      <motion.g initial={false} animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.9 }} transition={{ delay: show ? 0.9 : 0, duration: 0.5 }} style={{ originX: "300px", originY: "330px" }}>
        <rect x={40} y={232} width={520} height={196} rx={16} fill="#0b1220" stroke={C.accent} strokeWidth={2} />
        <Label x={300} y={268} size={20} weight={800} color={C.accent}>
          Batteries do not work at equilibrium
        </Label>
        <rect x={70} y={290} width={210} height={112} rx={12} fill={C.lfp} opacity={0.12} stroke={C.lfp} />
        <Label x={175} y={322} size={15} weight={700} color={C.lfp}>
          Thermodynamics
        </Label>
        <Label x={175} y={350} size={14}>
          → voltage
        </Label>
        <Label x={175} y={374} size={14}>
          → capacity
        </Label>
        <rect x={320} y={290} width={210} height={112} rx={12} fill={C.lithium} opacity={0.12} stroke={C.lithium} />
        <Label x={425} y={322} size={15} weight={700} color={C.lithium}>
          Kinetics + mass transport
        </Label>
        <Label x={425} y={350} size={14}>
          → what you actually get
        </Label>
        <Label x={425} y={374} size={14}>
          (power, usable capacity)
        </Label>
      </motion.g>
    </Stage>
  );
}
