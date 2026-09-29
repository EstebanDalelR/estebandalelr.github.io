"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";

const FAMILIES = [
  { name: "Mechanical", ex: "pumped hydro · CAES · flywheel", color: "#93c5fd" },
  { name: "Thermal", ex: "sensible · latent · liquid air", color: C.hot },
  { name: "Chemical", ex: "hydrogen · e-fuels", color: C.electron },
  { name: "Electromagnetic", ex: "capacitors · SMES", color: C.anion },
  { name: "Electrochemical", ex: "batteries · flow", color: C.lithium },
];

const STAGES = [
  { x: 100, title: "Natural energy", items: ["Sun", "Wind", "Waves", "Fossil fuels", "Nuclear", "Biomass"], color: C.electron },
  { x: 300, title: "Conversion", items: ["Engines", "Generators", "Batteries", "Fuel cells", "Power plants", "Fires"], color: C.accent },
  { x: 500, title: "Society use", items: ["Heat", "Cooling", "Chemicals", "Electricity", "Transport"], color: C.lithium },
];

export default function IntroVisual({ visual }: { visual: string }) {
  const hello = visual === "hello";
  return (
    <Stage label="Energy storage families and energy flow in society">
      <Reveal show={hello}>
        <Label x={300} y={48} size={18} weight={700}>
          Five families of energy storage
        </Label>
        {FAMILIES.map((f, i) => (
          <motion.g key={f.name} initial={false} animate={{ opacity: hello ? 1 : 0, x: hello ? 0 : -20 }} transition={{ delay: hello ? i * 0.12 : 0 }}>
            <rect x={90} y={78 + i * 66} width={420} height={54} rx={14} fill={f.color} opacity={0.14} stroke={f.color} />
            <circle cx={122} cy={105 + i * 66} r={12} fill={f.color} />
            <Label x={146} y={101 + i * 66} anchor="start" size={16} weight={700} color={f.color}>
              {f.name}
            </Label>
            <Label x={146} y={121 + i * 66} anchor="start" size={13} color={C.dim}>
              {f.ex}
            </Label>
          </motion.g>
        ))}
      </Reveal>

      <Reveal show={visual === "flow"}>
        {STAGES.map((s) => (
          <g key={s.title}>
            <rect x={s.x - 80} y={70} width={160} height={290} rx={16} fill="#111a2c" stroke={s.color} />
            <Label x={s.x} y={100} size={15} weight={700} color={s.color}>
              {s.title}
            </Label>
            {s.items.map((it, j) => (
              <Label key={it} x={s.x} y={140 + j * 36} size={14}>
                {it}
              </Label>
            ))}
          </g>
        ))}
        <Flow path="M182 215 L218 215" count={3} dur={1.4} color={C.electron} r={5} />
        <Flow path="M382 215 L418 215" count={3} dur={1.4} color={C.accent} r={5} />
        <Chip x={300} y={405} text="where does storage fit into this chain?" color={C.accent} w={330} />
      </Reveal>
    </Stage>
  );
}
