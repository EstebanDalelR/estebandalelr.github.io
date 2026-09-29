"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";

const BENEFITS = [
  { t: "Easy to convert", s: "into heat, light, motion", icon: "⇄" },
  { t: "Long distances", s: "over high-voltage lines", icon: "→" },
  { t: "Clean where used", s: "no fumes at the socket", icon: "✓" },
  { t: "Small losses", s: "in conversion & transmission", icon: "%" },
];

const MIX = [
  { name: "Hydro", v: 49.8, color: C.lfp },
  { name: "Nuclear", v: 32.8, color: C.anion },
  { name: "Wind", v: 12.0, color: C.lithium },
  { name: "Unspecified", v: 3.3, color: C.dim },
  { name: "Heat (CHP)", v: 2.1, color: C.hot },
];

const R = 90;
const CIRC = 2 * Math.PI * R;

function Transformer({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke={C.electron} strokeWidth={3}>
      <circle cx={x - 9} cy={y} r={16} />
      <circle cx={x + 9} cy={y} r={16} />
    </g>
  );
}

function Pylon({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x - 14} ${y + 44} L${x} ${y - 20} L${x + 14} ${y + 44} M${x - 18} ${y - 6} L${x + 18} ${y - 6} M${x - 8} ${y + 14} L${x + 8} ${y + 14}`}
      fill="none"
      stroke={C.dim}
      strokeWidth={2.5}
    />
  );
}

export default function IntroVisual({ visual }: { visual: string }) {
  const why = visual === "why";
  const chain = visual === "chain";
  const sweden = visual === "sweden";
  let start = 0;

  return (
    <Stage label="Why electricity: the power system chain">
      <Reveal show={why}>
        <Label x={300} y={60} size={18} weight={700}>
          Why move energy as electricity?
        </Label>
        {BENEFITS.map((b, i) => {
          const x = 70 + (i % 2) * 240;
          const y = 95 + Math.floor(i / 2) * 130;
          return (
            <motion.g key={b.t} initial={false} animate={{ opacity: why ? 1 : 0, y: why ? 0 : 10 }} transition={{ delay: why ? i * 0.12 : 0 }}>
              <rect x={x} y={y} width={220} height={105} rx={14} fill="#111a2c" stroke={C.grid} />
              <circle cx={x + 36} cy={y + 52} r={22} fill={C.accent} opacity={0.18} stroke={C.accent} />
              <Label x={x + 36} y={y + 60} size={20} color={C.accent} weight={800}>
                {b.icon}
              </Label>
              <Label x={x + 68} y={y + 46} anchor="start" size={15} weight={700}>
                {b.t}
              </Label>
              <Label x={x + 68} y={y + 68} anchor="start" size={12} color={C.dim}>
                {b.s}
              </Label>
            </motion.g>
          );
        })}
      </Reveal>

      <Reveal show={chain}>
        <line x1={86} y1={180} x2={520} y2={180} stroke={C.dim} strokeWidth={3} />
        <Flow path="M86 180 L520 180" count={9} dur={3.2} color={C.accent} r={4} />
        {/* generator */}
        <circle cx={60} cy={180} r={26} fill="#111a2c" stroke={C.lfp} strokeWidth={3} />
        <Label x={60} y={186} size={16} weight={800} color={C.lfp}>
          G~
        </Label>
        <Transformer x={160} y={180} />
        <Pylon x={260} y={160} />
        <Pylon x={350} y={160} />
        <Transformer x={445} y={180} />
        {/* consumers */}
        <path d="M512 196 L512 172 L530 158 L548 172 L548 196 Z" fill={C.copper} opacity={0.85} />
        <rect x={556} y={170} width={30} height={26} fill={C.zinc} />
        <rect x={574} y={152} width={7} height={18} fill={C.zinc} />
        <Label x={60} y={236} size={13} weight={700}>Generator</Label>
        <Label x={60} y={254} size={12} color={C.dim}>P_mech ⇒ P_el</Label>
        <Label x={160} y={236} size={13} weight={700}>Step-up</Label>
        <Label x={160} y={254} size={12} color={C.dim}>low → high V</Label>
        <Label x={305} y={236} size={13} weight={700}>Transmission</Label>
        <Label x={305} y={254} size={12} color={C.dim}>high V, low I</Label>
        <Label x={445} y={236} size={13} weight={700}>Step-down</Label>
        <Label x={445} y={254} size={12} color={C.dim}>high → low V</Label>
        <Label x={548} y={236} size={13} weight={700}>Consumers</Label>
        <Label x={548} y={254} size={12} color={C.dim}>homes, industry</Label>
        {/* new additions */}
        <path d="M380 320 L380 186" stroke={C.lithium} strokeWidth={2} strokeDasharray="5 5" />
        <path d="M495 320 L495 186" stroke={C.electron} strokeWidth={2} strokeDasharray="5 5" />
        <rect x={350} y={320} width={60} height={34} rx={5} fill={C.lithium} opacity={0.25} stroke={C.lithium} />
        <Label x={380} y={342} size={13} weight={700} color={C.lithium}>Storage</Label>
        <rect x={455} y={320} width={80} height={34} rx={5} fill={C.electron} opacity={0.2} stroke={C.electron} />
        <Label x={495} y={342} size={13} weight={700} color={C.electron}>Distributed</Label>
        <Chip x={375} y={400} text="new links in the chain: storage + distributed production" color={C.lithium} w={420} />
      </Reveal>

      <Reveal show={sweden}>
        <Label x={300} y={40} size={16} weight={700}>
          Sweden, 18 August 2022 (Svenska kraftnät)
        </Label>
        <g transform={`rotate(-90 150 225)`}>
          {MIX.map((m) => {
            const len = (m.v / 100) * CIRC;
            const seg = (
              <motion.circle
                key={m.name}
                cx={150}
                cy={225}
                r={R}
                fill="none"
                stroke={m.color}
                strokeWidth={40}
                strokeDasharray={`${len} ${CIRC}`}
                strokeDashoffset={-start}
                initial={false}
                animate={{ opacity: sweden ? 1 : 0 }}
              />
            );
            start += len;
            return seg;
          })}
        </g>
        <Label x={150} y={222} size={15} weight={700}>
          production
        </Label>
        <Label x={150} y={242} size={12} color={C.dim}>
          mix (%)
        </Label>
        {MIX.map((m, i) => (
          <g key={m.name}>
            <rect x={278} y={140 + i * 30} width={14} height={14} fill={m.color} />
            <Label x={300} y={152 + i * 30} anchor="start" size={13}>
              {`${m.name} ${m.v.toFixed(1)} %`}
            </Label>
          </g>
        ))}
        {/* production vs consumption (schematic) */}
        <rect x={452} y={120} width={42} height={220} rx={4} fill={C.accent} opacity={0.7} />
        <rect x={530} y={165} width={42} height={175} rx={4} fill={C.copper} opacity={0.7} />
        <Label x={473} y={360} size={12}>production</Label>
        <Label x={551} y={360} size={12}>consumption</Label>
        <line x1={494} y1={120} x2={580} y2={120} stroke={C.dim} strokeDasharray="4 4" />
        <line x1={551} y1={124} x2={551} y2={161} stroke={C.electron} strokeWidth={2} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <Label x={540} y={104} size={13} color={C.electron} weight={700}>
          export 2.3 GW
        </Label>
        <Label x={512} y={380} size={12} color={C.dim}>
          (schematic)
        </Label>
        <Chip x={300} y={420} text="storage smooths the gap between production and consumption" color={C.accent} w={440} />
      </Reveal>
    </Stage>
  );
}
