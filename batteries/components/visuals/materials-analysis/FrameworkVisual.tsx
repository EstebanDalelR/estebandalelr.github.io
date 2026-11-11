"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";
import { Card, Title } from "../blocks";

const CHAIN = [
  { t: "Probe", l: ["photons, e⁻,", "neutrons,", "heat, force"], c: C.electron },
  { t: "Matter", l: ["the sample:", "powder, film,", "whole cell"], c: C.lfp },
  { t: "Interaction", l: ["scattered,", "absorbed,", "or emitted"], c: C.anion },
  { t: "Detection", l: ["what comes out", "→ structure,", "composition"], c: C.lithium },
];

const WHEN = [
  { t: "Ex situ", s: "take it out, then measure", c: C.lfp },
  { t: "Post mortem", s: "open a dead cell", c: C.hot },
  { t: "In situ", s: "inside a working setup", c: C.electron },
  { t: "Operando", s: "while it charges / discharges", c: C.lithium },
];

export default function FrameworkVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Probe, matter, interaction, detection">
      <Reveal show={is("probe")}>
        <Title>Every technique, one chain</Title>
        {CHAIN.map((c, i) => (
          <g key={c.t}>
            <Card x={20 + i * 145} y={110} w={125} h={110} title={c.t} lines={c.l} color={c.c} show={is("probe")} delay={i * 0.2} size={12} />
            {i < 3 && <line x1={145 + i * 145} y1={165} x2={165 + i * 145} y2={165} stroke={C.ink} strokeWidth={2} markerEnd="url(#arrow)" />}
          </g>
        ))}
        <Chip x={300} y={290} text="what you send in · what it does · what you catch" w={400} />
        <Label x={300} y={350} size={14} color={C.dim}>
          choose the probe for the question: structure? chemistry? surface? heat?
        </Label>
      </Reveal>

      <Reveal show={is("interactions")}>
        <Title>One probe, many answers: X-rays</Title>
        <rect x={250} y={170} width={100} height={100} rx={8} fill={C.lfp} opacity={0.25} stroke={C.lfp} />
        {[0, 1, 2, 3].map((k) => (
          <line key={k} x1={255} x2={345} y1={185 + k * 24} y2={185 + k * 24} stroke={C.lfp} strokeWidth={2} />
        ))}
        <Label x={300} y={290} size={13}>
          sample
        </Label>
        <Flow path="M60 140 L250 200" count={4} dur={1.6} color={C.electron} r={4} />
        <Label x={90} y={125} size={13} color={C.electron}>
          X-rays in
        </Label>
        {[
          { d: "M350 200 L410 140", t: "diffraction → XRD", s: "crystal structure, phases", c: C.accent, ly: 135 },
          { d: "M350 230 L410 230", t: "photoelectrons → XPS", s: "elements, oxidation state", c: C.hot, ly: 228 },
          { d: "M350 260 L410 320", t: "fluorescence", s: "elemental composition", c: C.anion, ly: 322 },
        ].map((o, i) => (
          <motion.g key={o.t} initial={false} animate={{ opacity: is("interactions") ? 1 : 0 }} transition={{ delay: is("interactions") ? 0.4 + i * 0.25 : 0 }}>
            <Flow path={o.d} count={3} dur={1.6} color={o.c} r={4} />
            <Label x={420} y={o.ly} anchor="start" size={14} weight={700} color={o.c}>
              {o.t}
            </Label>
            <Label x={420} y={o.ly + 17} anchor="start" size={12} color={C.dim}>
              {o.s}
            </Label>
          </motion.g>
        ))}
        <Chip x={160} y={400} text="electrons (SEM) → morphology" w={250} color={C.electron} />
      </Reveal>

      <Reveal show={is("destructive")}>
        <Title>Non-destructive vs destructive</Title>
        <Card
          x={30}
          y={80}
          w={260}
          h={220}
          show={is("destructive")}
          title="Non-destructive"
          color={C.lithium}
          lines={["specimen intact & functional", "preserves a valuable sample", "relies on a probe", "", "e.g. X-ray scattering"]}
        />
        <Card
          x={310}
          y={80}
          w={260}
          h={220}
          show={is("destructive")}
          delay={0.2}
          title="Destructive"
          color={C.hot}
          lines={["specimen permanently altered", "needs several samples", "relies on a force or reaction", "", "e.g. accelerating rate", "calorimetry (ARC)"]}
        />
        <Label x={300} y={350} size={14} color={C.dim}>
          thermal analysis is usually destructive: the sample decomposes
        </Label>
      </Reveal>

      <Reveal show={is("depth")}>
        <Title>How deep do you look?</Title>
        <rect x={120} y={90} width={360} height={260} rx={20} fill={C.lfp} opacity={0.18} stroke={C.lfp} />
        <rect x={120} y={90} width={360} height={14} rx={7} fill={C.electron} opacity={0.8} />
        <Label x={300} y={84} size={12} color={C.electron}>
          surface / SEI: a few nm
        </Label>
        <Label x={300} y={230} size={16} weight={700} color={C.lfp}>
          bulk of the particle
        </Label>
        <Chip x={540} y={98} text="XPS" color={C.electron} w={60} />
        <line x1={510} y1={98} x2={485} y2={98} stroke={C.electron} strokeWidth={2} markerEnd="url(#arrow)" />
        <Chip x={540} y={230} text="XRD" color={C.accent} w={60} />
        <Chip x={540} y={270} text="neutrons" color={C.accent} w={80} />
        <Label x={300} y={395} size={14}>
          surface techniques see the SEI; bulk techniques see the crystal structure
        </Label>
      </Reveal>

      <Reveal show={is("operando")}>
        <Title>When do you look?</Title>
        {WHEN.map((w, i) => (
          <motion.g key={w.t} initial={false} animate={{ opacity: is("operando") ? 1 : 0, x: is("operando") ? 0 : -12 }} transition={{ delay: is("operando") ? i * 0.15 : 0 }}>
            <rect x={60} y={80 + i * 70} width={480} height={56} rx={12} fill="#111a2c" stroke={w.c} />
            <Label x={80} y={114 + i * 70} anchor="start" size={16} weight={700} color={w.c}>
              {w.t}
            </Label>
            <Label x={520} y={114 + i * 70} anchor="end" size={14} color={C.dim}>
              {w.s}
            </Label>
          </motion.g>
        ))}
        <Chip x={300} y={390} text="operando catches states that relax when the current stops" w={440} color={C.lithium} />
      </Reveal>

      <Reveal show={is("facilities")}>
        <Title>Large-scale facilities in Lund</Title>
        <g>
          <circle cx={160} cy={210} r={90} fill="none" stroke={C.electron} strokeWidth={6} />
          <circle r={8} fill={C.electron}>
            <animateMotion dur="2s" repeatCount="indefinite" path="M160 120 A90 90 0 1 1 159.9 120" />
          </circle>
          <line x1={240} y1={170} x2={290} y2={140} stroke={C.electron} strokeWidth={3} markerEnd="url(#arrow-e)" />
          <Label x={160} y={215} size={18} weight={800} color={C.electron}>
            MAX IV
          </Label>
          <Label x={160} y={330} size={13}>
            synchrotron: very bright X-rays
          </Label>
        </g>
        <g>
          <rect x={340} y={190} width={220} height={40} rx={8} fill={C.lfp} opacity={0.3} stroke={C.lfp} />
          <circle cx={560} cy={210} r={20} fill={C.lfp} />
          <Flow path="M340 210 L540 210" count={4} dur={1.2} color={C.lfp} r={5} />
          <Label x={450} y={170} size={18} weight={800} color={C.lfp}>
            ESS
          </Label>
          <Label x={450} y={262} size={13}>
            spallation: neutrons
          </Label>
          <Label x={450} y={282} size={12} color={C.dim}>
            first neutrons planned early 2027
          </Label>
        </g>
        <Label x={300} y={400} size={13} color={C.dim}>
          neutrons see light elements like lithium; X-rays see heavy ones
        </Label>
      </Reveal>
    </Stage>
  );
}
