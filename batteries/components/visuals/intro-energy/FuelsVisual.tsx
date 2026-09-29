"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";

const DENSITY = [
  { name: "Hydrogen", v: 33000, color: "#93c5fd" },
  { name: "Diesel", v: 12000, color: C.electron },
  { name: "Methanol", v: 5500, color: C.copper },
  { name: "Ammonia", v: 5200, color: C.anion },
  { name: "Li-ion", v: 250, color: C.lithium },
];
// log scale: 100 Wh/kg at x=160, 100 000 Wh/kg at x=560
const lx = (v: number) => 160 + ((Math.log10(v) - 2) / 3) * 400;

const CHAIN = [
  { name: "electrolysis", eff: "70–80 %" },
  { name: "compress / liquefy", eff: "−10 to −30 %" },
  { name: "store", eff: "≈ no loss" },
  { name: "fuel cell / engine", eff: "30–55 %" },
];

const COLOURS = [
  { name: "Grey", from: "natural gas, CO₂ released", fill: "#9ca3af" },
  { name: "Blue", from: "natural gas + carbon capture", fill: "#60a5fa" },
  { name: "Green", from: "electrolysis, renewable power", fill: "#4ade80" },
  { name: "Pink", from: "electrolysis, nuclear power", fill: "#f472b6" },
];

export default function FuelsVisual({ visual }: { visual: string }) {
  const hub = visual === "p2x" || visual === "routes";
  return (
    <Stage label="Fuels and Power-to-X">
      <Reveal show={hub}>
        <Label x={300} y={40} size={17} weight={700}>
          Power-to-X
        </Label>
        <rect x={30} y={180} width={110} height={60} rx={12} fill={C.electron} opacity={0.2} stroke={C.electron} />
        <Label x={85} y={206} size={14} weight={700} color={C.electron}>
          surplus
        </Label>
        <Label x={85} y={225} size={14} weight={700} color={C.electron}>
          electricity
        </Label>
        <rect x={190} y={180} width={110} height={60} rx={12} fill="#93c5fd" opacity={0.2} stroke="#93c5fd" />
        <Label x={245} y={206} size={13} weight={700}>
          electrolysis
        </Label>
        <Label x={245} y={225} size={13}>
          2H₂O → 2H₂ + O₂
        </Label>
        <Flow path="M140 210 L190 210" count={3} dur={1} color={C.electron} r={4} />
        <circle cx={360} cy={210} r={28} fill="#93c5fd" opacity={0.85} />
        <Label x={360} y={216} size={16} weight={800} color="#0b1220">
          H₂
        </Label>
        <Flow path="M300 210 L332 210" count={2} dur={0.8} color="#93c5fd" r={4} />
        <Reveal show={visual === "routes"}>
          {[
            { y: 100, name: "CH₄ methane", via: "+ CO₂ · Sabatier", color: C.copper },
            { y: 180, name: "CH₃OH methanol", via: "+ CO₂ · catalyst", color: C.electron },
            { y: 260, name: "NH₃ ammonia", via: "+ N₂ · Haber–Bosch", color: C.anion },
            { y: 340, name: "H₂ itself", via: "stored as gas / liquid", color: "#93c5fd" },
          ].map((r) => (
            <g key={r.name}>
              <path d={`M388 210 L450 ${r.y + 15}`} stroke={C.grid} strokeWidth={2} />
              <rect x={450} y={r.y - 8} width={140} height={46} rx={10} fill={r.color} opacity={0.18} stroke={r.color} />
              <Label x={520} y={r.y + 12} size={13} weight={700} color={r.color}>
                {r.name}
              </Label>
              <Label x={520} y={r.y + 30} size={12} color={C.dim}>
                {r.via}
              </Label>
            </g>
          ))}
        </Reveal>
        <Reveal show={visual === "p2x"}>
          <Chip x={300} y={330} text="electricity → a storable fuel or chemical X" color={C.electron} w={340} />
        </Reveal>
      </Reveal>

      <Reveal show={visual === "fuel-density"}>
        <Label x={300} y={42} size={17} weight={700}>
          Specific energy (Wh/kg, log scale)
        </Label>
        {[100, 1000, 10000, 100000].map((v) => (
          <g key={v}>
            <line x1={lx(v)} x2={lx(v)} y1={70} y2={340} stroke={C.grid} />
            <Label x={lx(v)} y={360} size={12} color={C.dim}>
              {v.toLocaleString("en-US")}
            </Label>
          </g>
        ))}
        {DENSITY.map((d, i) => (
          <g key={d.name}>
            <Label x={150} y={105 + i * 52} anchor="end" size={14}>
              {d.name}
            </Label>
            <motion.rect
              x={160}
              y={85 + i * 52}
              height={30}
              rx={6}
              fill={d.color}
              opacity={0.85}
              initial={false}
              animate={{ width: visual === "fuel-density" ? lx(d.v) - 160 : 0 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            />
            <Label x={lx(d.v) + 6} y={106 + i * 52} anchor="start" size={13} weight={700}>
              {d.v.toLocaleString("en-US")}
            </Label>
          </g>
        ))}
        <Chip x={300} y={405} text="H₂ holds > 100× a battery per kg · stores for months" color="#93c5fd" w={420} />
      </Reveal>

      <Reveal show={visual === "fuel-losses"}>
        <Label x={300} y={42} size={17} weight={700}>
          Every step costs efficiency
        </Label>
        {CHAIN.map((c, i) => (
          <g key={c.name}>
            <rect x={20 + i * 145} y={90} width={125} height={70} rx={12} fill="#111a2c" stroke={C.grid} />
            <Label x={82 + i * 145} y={120} size={13} weight={700}>
              {c.name}
            </Label>
            <Label x={82 + i * 145} y={142} size={13} color={i === 2 ? C.lithium : C.hot}>
              {c.eff}
            </Label>
            {i < CHAIN.length - 1 && <path d={`M${145 + i * 145} 125 L${165 + i * 145} 125`} stroke={C.ink} markerEnd="url(#arrow)" />}
          </g>
        ))}
        {[1, 0.75, 0.55, 0.5, 0.2].map((w, i) => (
          <motion.rect
            key={i}
            x={20 + i * 112}
            width={96}
            rx={6}
            fill={i === 4 ? C.hot : C.electron}
            opacity={0.8}
            initial={false}
            animate={{ height: visual === "fuel-losses" ? w * 140 : 0, y: visual === "fuel-losses" ? 340 - w * 140 : 340 }}
            transition={{ duration: 0.7, delay: i * 0.15 }}
          />
        ))}
        <Label x={68} y={362} size={12} color={C.dim}>
          100 % in
        </Label>
        <Label x={516} y={362} size={13} weight={700} color={C.hot}>
          10–30 % back
        </Label>
        <Chip x={300} y={410} text="worst round trip in the course · leaks · embrittles steel" color={C.hot} w={440} />
      </Reveal>

      <Reveal show={visual === "colours"}>
        <Label x={300} y={42} size={17} weight={700}>
          Hydrogen colours = production route
        </Label>
        {COLOURS.map((c, i) => (
          <g key={c.name}>
            <circle cx={120} cy={100 + i * 70} r={24} fill={c.fill} />
            <Label x={120} y={106 + i * 70} size={14} weight={800} color="#0b1220">
              H₂
            </Label>
            <Label x={165} y={96 + i * 70} anchor="start" size={16} weight={700} color={c.fill}>
              {c.name}
            </Label>
            <Label x={165} y={116 + i * 70} anchor="start" size={13}>
              {c.from}
            </Label>
          </g>
        ))}
        <Chip x={470} y={112} text="≈ 96 % fossil today" color="#9ca3af" w={180} />
        <Chip x={300} y={410} text="same molecule, different climate footprint" color={C.lithium} w={360} />
      </Reveal>
    </Stage>
  );
}
