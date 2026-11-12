"use client";

import { motion } from "framer-motion";
import { C, Flow, Label, Reveal, Stage } from "../primitives";
import { Title } from "../blocks";

const POWER = "#f87171";
const INFO = "#4ade80";

const BLOCKS = [
  { x: 30, t: "Energy", t2: "storage", c: C.lithium },
  { x: 220, t: "Power", t2: "electronics", c: C.electron },
  { x: 410, t: "Electric", t2: "motor", c: C.accent },
];

const TYPES = [
  { t: "Conventional", p: "ICE only", f: "fuel", fuel: 1, elec: 0, c: C.dim },
  { t: "Hybrid (HEV)", p: "ICE + e-motor", f: "fuel", fuel: 0.75, elec: 0.25, c: C.electron },
  { t: "Plug-in (PHEV)", p: "e-motor + ICE", f: "fuel + electricity", fuel: 0.35, elec: 0.65, c: C.lfp },
  { t: "Battery EV (BEV)", p: "e-motor only", f: "electricity", fuel: 0, elec: 1, c: C.lithium },
];

export default function PropulsionVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Electric propulsion system and vehicle types">
      <Reveal show={is("propulsion")}>
        <Title>Basic electric propulsion system</Title>
        {BLOCKS.map((b, i) => (
          <motion.g key={b.t} initial={false} animate={{ opacity: is("propulsion") ? 1 : 0 }} transition={{ delay: is("propulsion") ? i * 0.15 : 0 }}>
            <rect x={b.x} y={210} width={160} height={80} rx={12} fill={b.c} opacity={0.16} stroke={b.c} />
            <Label x={b.x + 80} y={245} size={15} weight={700} color={b.c}>
              {b.t}
            </Label>
            <Label x={b.x + 80} y={266} size={15} weight={700} color={b.c}>
              {b.t2}
            </Label>
          </motion.g>
        ))}
        <Label x={300} y={308} size={12} color={C.dim}>
          inverter
        </Label>
        <Label x={110} y={308} size={12} color={C.dim}>
          usually a battery
        </Label>
        <Label x={490} y={308} size={12} color={C.dim}>
          wheels · propeller
        </Label>
        {[
          "M190 250 L220 250",
          "M380 250 L410 250",
        ].map((d) => (
          <g key={d}>
            <path d={d} stroke={POWER} strokeWidth={4} />
            <Flow path={d} count={2} dur={1} color={POWER} r={4} />
          </g>
        ))}
        <rect x={220} y={80} width={160} height={70} rx={12} fill="#111a2c" stroke={INFO} />
        <Label x={300} y={120} size={15} weight={700} color={INFO}>
          Controller
        </Label>
        <path d="M300 150 L300 210" stroke={INFO} strokeWidth={2} strokeDasharray="5 4" markerEnd="url(#arrow)" />
        <path d="M490 210 L490 115 L380 115" fill="none" stroke={INFO} strokeWidth={2} strokeDasharray="5 4" />
        <path d="M110 210 L110 115 L220 115" fill="none" stroke={INFO} strokeWidth={2} strokeDasharray="5 4" />
        <Label x={490} y={102} size={12} color={INFO}>
          sensors
        </Label>
        <Label x={110} y={102} size={12} color={INFO}>
          communication
        </Label>
        <line x1={150} y1={370} x2={190} y2={370} stroke={POWER} strokeWidth={4} />
        <Label x={198} y={375} anchor="start" size={13}>
          power
        </Label>
        <line x1={330} y1={370} x2={370} y2={370} stroke={INFO} strokeWidth={2} strokeDasharray="5 4" />
        <Label x={378} y={375} anchor="start" size={13}>
          information
        </Label>
        <Label x={300} y={415} size={12} color={C.dim}>
          the same chain drives cars, buses and ship thrusters
        </Label>
      </Reveal>

      <Reveal show={is("ev-types")}>
        <Title>Types of vehicle</Title>
        {TYPES.map((t, i) => {
          const x = 20 + i * 142;
          return (
            <motion.g key={t.t} initial={false} animate={{ opacity: is("ev-types") ? 1 : 0, y: is("ev-types") ? 0 : 10 }} transition={{ delay: is("ev-types") ? i * 0.15 : 0 }}>
              <rect x={x} y={75} width={132} height={300} rx={12} fill="#111a2c" stroke={t.c} />
              <Label x={x + 66} y={102} size={13.5} weight={700} color={t.c}>
                {t.t}
              </Label>
              <Label x={x + 66} y={130} size={12}>
                {t.p}
              </Label>
              <rect x={x + 41} y={160} width={50} height={160} rx={6} fill="#0b1220" stroke={C.grid} />
              <rect x={x + 41} y={160 + 160 * (1 - t.fuel)} width={50} height={160 * t.fuel} fill={C.copper} opacity={0.75} />
              <rect x={x + 41} y={160} width={50} height={160 * t.elec} fill={C.lithium} opacity={0.75} />
              <Label x={x + 66} y={350} size={12} color={C.dim}>
                {t.f}
              </Label>
            </motion.g>
          );
        })}
        <rect x={180} y={400} width={14} height={14} fill={C.lithium} />
        <Label x={200} y={412} anchor="start" size={13}>
          electric drive
        </Label>
        <rect x={330} y={400} width={14} height={14} fill={C.copper} />
        <Label x={350} y={412} anchor="start" size={13}>
          combustion engine
        </Label>
      </Reveal>
    </Stage>
  );
}
