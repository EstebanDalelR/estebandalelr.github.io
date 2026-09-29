"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";

const THERMAL = [
  { name: "Sensible", how: "raise temperature", ex: "water, molten salt, rock", h: 0.3, color: C.hot },
  { name: "Latent", how: "melt at constant T", ex: "ice, salt hydrates (PCM)", h: 0.55, color: C.electron },
  { name: "Thermochemical", how: "reversible reaction", ex: "salt hydration", h: 0.9, color: C.anion },
];

export default function MechThermalVisual({ visual }: { visual: string }) {
  return (
    <Stage label="Flywheels, compressed air and thermal storage">
      <Reveal show={visual === "flywheel"}>
        <Label x={300} y={42} size={17} weight={700}>
          Flywheel: kinetic energy in a spinning rotor
        </Label>
        <rect x={110} y={80} width={220} height={250} rx={20} fill="none" stroke={C.dim} strokeDasharray="6 5" />
        <Label x={220} y={350} size={12} color={C.dim}>
          vacuum housing · bearings
        </Label>
        <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx={220} cy={205} r={85} fill="#93c5fd" opacity={0.3} stroke="#93c5fd" strokeWidth={3} />
          <path d="M220 120 L220 290 M135 205 L305 205" stroke="#93c5fd" strokeWidth={4} />
        </motion.g>
        <Label x={460} y={120} size={16} weight={700} color="#93c5fd">
          60 000 rpm
        </Label>
        <Label x={460} y={160} size={14}>
          0.5–1 kWh per unit
        </Label>
        <Label x={460} y={190} size={14}>
          5 s – 30 min discharge
        </Label>
        <Label x={460} y={220} size={14}>
          70–80 % efficiency
        </Label>
        <Chip x={460} y={270} text="friction empties it in hours" color={C.hot} w={220} />
        <Chip x={300} y={410} text="superb power & response · poor energy & self-discharge" color="#93c5fd" w={430} />
      </Reveal>

      <Reveal show={visual === "caes"}>
        <Label x={300} y={40} size={17} weight={700}>
          Compressed air in salt caverns
        </Label>
        {[
          { x: 150, title: "Diabatic", eff: "≈ 42 %", note: "heat dumped · burns natural gas", color: C.hot, gas: true },
          { x: 450, title: "Adiabatic", eff: "≈ 70 %", note: "compression heat stored & reused", color: C.lithium, gas: false },
        ].map((p) => (
          <g key={p.title}>
            <Label x={p.x} y={80} size={16} weight={700} color={p.color}>
              {p.title}
            </Label>
            <rect x={p.x - 110} y={100} width={80} height={46} rx={8} fill="#111a2c" stroke={C.ink} />
            <Label x={p.x - 70} y={128} size={12}>
              compressor
            </Label>
            <rect x={p.x + 30} y={100} width={80} height={46} rx={8} fill="#111a2c" stroke={C.ink} />
            <Label x={p.x + 70} y={128} size={12}>
              turbine
            </Label>
            <ellipse cx={p.x} cy={290} rx={110} ry={50} fill={C.dim} opacity={0.25} stroke={C.dim} />
            <Label x={p.x} y={295} size={13} color={C.dim}>
              salt cavern, ~70 bar
            </Label>
            <Flow path={`M${p.x - 70} 146 L${p.x - 40} 250`} count={3} dur={1.5} color="#bae6fd" r={4} />
            <Flow path={`M${p.x + 40} 250 L${p.x + 70} 146`} count={3} dur={1.5} color="#bae6fd" r={4} />
            {p.gas ? (
              <>
                <Flow path={`M${p.x - 70} 100 L${p.x - 70} 60`} count={2} dur={1.2} color={C.hot} r={4} />
                <Label x={p.x + 70} y={190} size={12} color={C.hot}>
                  + gas burned
                </Label>
              </>
            ) : (
              <>
                <rect x={p.x - 25} y={105} width={50} height={36} rx={6} fill={C.hot} opacity={0.4} />
                <Label x={p.x} y={128} size={12} weight={700}>
                  heat
                </Label>
              </>
            )}
            <Label x={p.x} y={378} size={22} weight={800} color={p.color}>
              {p.eff}
            </Label>
            <Label x={p.x} y={402} size={12} color={C.dim}>
              {p.note}
            </Label>
          </g>
        ))}
        <line x1={300} y1={70} x2={300} y2={410} stroke={C.grid} strokeWidth={2} />
      </Reveal>

      <Reveal show={visual === "thermal"}>
        <Label x={300} y={42} size={17} weight={700}>
          Storing heat as heat: no Carnot penalty
        </Label>
        {THERMAL.map((t, i) => (
          <g key={t.name}>
            <motion.rect
              x={90 + i * 160}
              width={100}
              rx={8}
              fill={t.color}
              opacity={0.7}
              initial={false}
              animate={{ y: visual === "thermal" ? 330 - t.h * 230 : 330, height: visual === "thermal" ? t.h * 230 : 0 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            />
            <Label x={140 + i * 160} y={352} size={15} weight={700} color={t.color}>
              {t.name}
            </Label>
            <Label x={140 + i * 160} y={372} size={12}>
              {t.how}
            </Label>
            <Label x={140 + i * 160} y={390} size={12} color={C.dim}>
              {t.ex}
            </Label>
          </g>
        ))}
        <Label x={60} y={210} size={13} color={C.dim} anchor="middle">
          energy
        </Label>
        <Label x={60} y={228} size={13} color={C.dim} anchor="middle">
          density
        </Label>
        <Chip x={300} y={425} text="denser, and more complex, left to right" color={C.anion} w={330} />
      </Reveal>

      <Reveal show={visual === "district"}>
        <Label x={300} y={42} size={17} weight={700}>
          Sweden already stores heat at scale
        </Label>
        <path d="M40 150 L560 150" stroke={C.hot} strokeWidth={6} opacity={0.6} />
        {[100, 220, 340, 460].map((x) => (
          <g key={x}>
            <path d={`M${x} 150 L${x} 120`} stroke={C.hot} strokeWidth={4} opacity={0.6} />
            <path d={`M${x - 26} 120 L${x} 95 L${x + 26} 120 Z`} fill={C.electron} opacity={0.75} />
          </g>
        ))}
        <Flow path="M40 150 L560 150" count={8} dur={4} color={C.hot} r={4} />
        <Label x={300} y={185} size={13} color={C.dim}>
          district heating network: accumulator tanks buffer the daily cycle
        </Label>
        <path d="M120 220 L480 220 L480 380 L120 380 Z" fill={C.graphite} opacity={0.35} />
        <ellipse cx={300} cy={300} rx={140} ry={55} fill={C.hot} opacity={0.35} stroke={C.hot} />
        <Label x={300} y={295} size={16} weight={700}>
          Hudiksvall rock cavern
        </Label>
        <Label x={300} y={318} size={14}>
          90 000 m³ · 4100 MWh
        </Label>
        <Chip x={300} y={420} text="seasonal heat: cheapest per kWh of any storage" color={C.hot} w={380} />
      </Reveal>
    </Stage>
  );
}
