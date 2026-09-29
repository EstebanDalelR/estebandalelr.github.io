"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";

const FORMS = [
  { name: "Chemical", color: C.electron },
  { name: "Thermal", color: C.hot },
  { name: "Kinetic", color: "#93c5fd" },
  { name: "Gravitational", color: C.lfp },
  { name: "Electrical", color: C.accent },
  { name: "Radiant", color: "#fde68a" },
];

const EFFICIENCIES = [
  { name: "Petrol engine", v: 0.28, via: "via heat", color: C.hot },
  { name: "Combined-cycle gas turbine", v: 0.6, via: "via heat", color: C.hot },
  { name: "Carnot, 100 °C → 4 °C", v: 0.26, via: "ceiling", color: C.dim },
  { name: "Li-ion battery (round trip)", v: 0.92, via: "no heat step", color: C.lithium },
  { name: "Pumped hydro (round trip)", v: 0.8, via: "no heat step", color: C.lfp },
];

export default function ThermoVisual({ visual }: { visual: string }) {
  const qualityScale = visual === "second" || visual === "quality";
  return (
    <Stage label="Thermodynamics and energy quality">
      <Reveal show={visual === "first"}>
        <Label x={300} y={48} size={17} weight={700}>
          1st law: energy is conserved, only converted
        </Label>
        {FORMS.map((f, i) => {
          const a = (i / FORMS.length) * Math.PI * 2 - Math.PI / 2;
          const x = 300 + Math.cos(a) * 125;
          const y = 240 + Math.sin(a) * 125;
          return (
            <g key={f.name}>
              <circle cx={x} cy={y} r={40} fill={f.color} opacity={0.2} stroke={f.color} />
              <Label x={x} y={y + 5} size={13} weight={700} color={f.color}>
                {f.name}
              </Label>
            </g>
          );
        })}
        <Flow path="M300 150 A90 90 0 1 1 299 150" count={8} dur={6} color={C.electron} r={5} />
        <Label x={300} y={235} size={15} weight={700}>
          total stays
        </Label>
        <Label x={300} y={255} size={15} weight={700}>
          constant
        </Label>
        <Chip x={300} y={425} text="storage cannot create energy: out ≤ in, the rest becomes heat" color={C.accent} w={470} />
      </Reveal>

      <Reveal show={qualityScale}>
        <Label x={300} y={48} size={17} weight={700}>
          2nd law: energy has quality
        </Label>
        <defs>
          <linearGradient id="quality-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={C.accent} />
            <stop offset="100%" stopColor={C.hot} stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <rect x={110} y={80} width={40} height={300} rx={8} fill="url(#quality-grad)" />
        <Label x={100} y={92} anchor="end" size={14} weight={700}>
          1
        </Label>
        <Label x={100} y={384} anchor="end" size={14} weight={700}>
          0
        </Label>
        <Label x={130} y={405} size={13} color={C.dim}>
          quality
        </Label>
        <g>
          <Label x={170} y={98} anchor="start" size={14} weight={700} color={C.accent}>
            electricity · work · spinning flywheel · water behind a dam
          </Label>
          <Label x={170} y={118} anchor="start" size={13} color={C.dim}>
            high quality, low entropy
          </Label>
          <Label x={170} y={240} anchor="start" size={14} weight={700} color={C.electron}>
            high-temperature heat (steam, flame)
          </Label>
          <Label x={170} y={362} anchor="start" size={14} weight={700} color={C.hot}>
            lukewarm water · heat near ambient
          </Label>
          <Label x={170} y={382} anchor="start" size={13} color={C.dim}>
            low quality, high entropy
          </Label>
        </g>
        <motion.path
          d="M470 140 L470 330"
          stroke={C.ink}
          strokeWidth={2.5}
          markerEnd="url(#arrow)"
          initial={false}
          animate={{ opacity: qualityScale ? 1 : 0 }}
        />
        <Label x={480} y={240} anchor="start" size={13}>
          easy, complete
        </Label>
        <Reveal show={visual === "quality"}>
          <Chip x={330} y={425} text="high quality converts to anything, efficiently" color={C.accent} w={380} />
        </Reveal>
        <Reveal show={visual === "second"}>
          <Chip x={330} y={425} text="the reverse (heat → work) is never complete" color={C.hot} w={360} />
        </Reveal>
      </Reveal>

      <Reveal show={visual === "carnot"}>
        <Label x={300} y={48} size={17} weight={700}>
          The Carnot ceiling on any heat engine
        </Label>
        <rect x={80} y={80} width={440} height={60} rx={12} fill={C.hot} opacity={0.2} stroke={C.hot} />
        <Label x={300} y={117} size={16} weight={700} color={C.hot}>
          hot reservoir T_H = 100 °C = 373 K
        </Label>
        <circle cx={300} cy={225} r={42} fill="#111a2c" stroke={C.ink} strokeWidth={2} />
        <Label x={300} y={230} size={14} weight={700}>
          engine
        </Label>
        <rect x={80} y={310} width={440} height={60} rx={12} fill={C.lfp} opacity={0.2} stroke={C.lfp} />
        <Label x={300} y={347} size={16} weight={700} color={C.lfp}>
          cold reservoir T_L = 4 °C = 277 K
        </Label>
        <Flow path="M300 140 L300 183" count={3} dur={1.2} color={C.hot} r={6} />
        <Flow path="M300 267 L300 310" count={2} dur={1.2} color={C.lfp} r={6} />
        <Flow path="M342 225 L500 225" count={2} dur={1.4} color={C.accent} r={6} />
        <Label x={500} y={210} anchor="end" size={14} weight={700} color={C.accent}>
          work ≤ 26 %
        </Label>
        <Chip x={300} y={420} text="always use kelvin · human body ~25 %" color={C.electron} w={320} />
      </Reveal>

      <Reveal show={visual === "beat-carnot"}>
        <Label x={300} y={48} size={17} weight={700}>
          Storage that skips the heat step beats Carnot
        </Label>
        {EFFICIENCIES.map((e, i) => (
          <g key={e.name}>
            <Label x={250} y={112 + i * 60} anchor="end" size={14}>
              {e.name}
            </Label>
            <motion.rect
              x={262}
              y={92 + i * 60}
              height={30}
              rx={6}
              fill={e.color}
              opacity={0.85}
              initial={false}
              animate={{ width: visual === "beat-carnot" ? e.v * 280 : 0 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            />
            <Label x={270 + e.v * 280} y={113 + i * 60} anchor="start" size={14} weight={700}>
              {`${Math.round(e.v * 100)} %`}
            </Label>
            <Label x={262} y={138 + i * 60} anchor="start" size={12} color={C.dim}>
              {e.via}
            </Label>
          </g>
        ))}
        <Chip x={300} y={420} text="isothermal conversion: no hot and cold reservoir" color={C.lithium} w={380} />
      </Reveal>
    </Stage>
  );
}
