"use client";

import { motion } from "framer-motion";
import { C, Chip, Label, Reveal, Stage } from "../primitives";
import { Card, Title } from "../blocks";

const TYPES = [
  { t: "BEV", s: "battery electric", c: C.lithium },
  { t: "PHEV", s: "plug-in hybrid", c: C.electron },
  { t: "FCEV", s: "hydrogen fuel cell", c: C.lfp },
];

const MODES = ["e-bikes", "cars", "buses", "trucks", "ships", "aircraft"];

const MAP = [
  { t: "Vehicles", l: ["BEV, PHEV, FCEV"], c: C.lithium, a: -90 },
  { t: "Powertrain", l: ["motors, power", "electronics, batteries"], c: C.electron, a: -30 },
  { t: "Charging", l: ["infrastructure,", "charging time"], c: C.lfp, a: 30 },
  { t: "Environment", l: ["emissions,", "sustainability"], c: C.accent, a: 90 },
  { t: "Economy", l: ["purchase, charging,", "maintenance cost"], c: C.copper, a: 150 },
  { t: "Politics", l: ["regulation,", "funding"], c: C.anion, a: 210 },
];

export default function IntroVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="What is electromobility">
      <Reveal show={is("definition")}>
        <Title>Electric propulsion of vehicles and fleets</Title>
        {TYPES.map((t, i) => (
          <Card key={t.t} x={30 + i * 185} y={80} w={170} h={110} title={t.t} lines={[t.s]} color={t.c} show={is("definition")} delay={i * 0.15} size={14} />
        ))}
        <Label x={300} y={235} size={15} weight={700} color={C.dim}>
          + connected vehicles and charging infrastructure
        </Label>
        {MODES.map((m, i) => (
          <Chip key={m} x={70 + i * 92} y={300} text={m} w={82} color={i % 2 ? C.lfp : C.accent} />
        ))}
        <Label x={300} y={370} size={13} color={C.dim}>
          adoption depends on technology and on people: range anxiety, acceptance
        </Label>
      </Reveal>

      <Reveal show={is("map")}>
        <circle cx={300} cy={225} r={62} fill="#111a2c" stroke={C.accent} strokeWidth={2} />
        <Label x={300} y={222} size={16} weight={800} color={C.accent}>
          Electro-
        </Label>
        <Label x={300} y={242} size={16} weight={800} color={C.accent}>
          mobility
        </Label>
        {MAP.map((m, i) => {
          const rad = (m.a * Math.PI) / 180;
          const x = 300 + Math.cos(rad) * 205;
          const y = 225 + Math.sin(rad) * 155;
          return (
            <motion.g key={m.t} initial={false} animate={{ opacity: is("map") ? 1 : 0 }} transition={{ delay: is("map") ? 0.2 + i * 0.12 : 0 }}>
              <line x1={300 + Math.cos(rad) * 64} y1={225 + Math.sin(rad) * 64} x2={x - Math.cos(rad) * 50} y2={y - Math.sin(rad) * 30} stroke={m.c} strokeWidth={2} />
              <rect x={x - 75} y={y - 30} width={150} height={60} rx={10} fill="#111a2c" stroke={m.c} />
              <Label x={x} y={y - 9} size={14} weight={700} color={m.c}>
                {m.t}
              </Label>
              {m.l.map((l, j) => (
                <Label key={j} x={x} y={y + 8 + j * 14} size={11} color={C.dim}>
                  {l}
                </Label>
              ))}
            </motion.g>
          );
        })}
      </Reveal>

      <Reveal show={is("course")}>
        <Title>1EL003 learning outcomes</Title>
        {[
          ["Vehicle types", "pros and cons of each"],
          ["Driveline", "motors, power electronics, batteries"],
          ["Society", "scenarios, environment, economy"],
          ["The grid", "what charging demands, now and later"],
        ].map(([t, s], i) => (
          <Card key={t} x={30 + (i % 2) * 280} y={70 + Math.floor(i / 2) * 105} w={260} h={90} title={t} lines={[s]} show={is("course")} delay={i * 0.12} />
        ))}
        <rect x={60} y={300} width={480} height={120} rx={14} fill="#0b1220" stroke={C.electron} />
        <Label x={300} y={326} size={15} weight={700} color={C.electron}>
          e-exam, 8 January 2027 · 70 points
        </Label>
        {[
          ["grade 3", "42 p"],
          ["grade 4", "49 p"],
          ["grade 5", "56 p"],
        ].map(([g, p], i) => (
          <g key={g}>
            <Label x={160 + i * 140} y={360} size={14} weight={700}>
              {p}
            </Label>
            <Label x={160 + i * 140} y={378} size={12} color={C.dim}>
              {g}
            </Label>
          </g>
        ))}
        <Label x={300} y={406} size={12} color={C.dim}>
          bonus: 1 p per seminar (×3), up to 4 p for the group project
        </Label>
      </Reveal>
    </Stage>
  );
}
