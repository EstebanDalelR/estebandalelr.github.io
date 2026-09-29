"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";

const WATER = "#38bdf8";
const EARTH = "#2a3550";

function Turbine({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} fill="#111a2c" stroke={C.ink} strokeWidth={2} />
      <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <path d={`M${x - 8} ${y} L${x + 8} ${y} M${x} ${y - 8} L${x} ${y + 8}`} stroke={C.accent} strokeWidth={2.5} />
      </motion.g>
    </g>
  );
}

const PROS = ["huge scale: ~200 GW, most stored energy", "80–90 % round trip", "low self-discharge: hours to months", "~50-year lifetime, low maintenance"];
const CONS = ["needs mountains and water", "high investment, slow to build", "floods land, changes rivers", "far from where power is used"];

export default function HydroVisual({ visual }: { visual: string }) {
  const types = visual === "hydro-types" || visual === "hydro-rechargeable";
  const recharge = visual === "hydro-rechargeable";
  return (
    <Stage label="Hydropower and pumped storage">
      <Reveal show={types}>
        {/* 1: impoundment: valley cross-section, reservoir held back by a concrete dam */}
        <g>
          <Label x={100} y={40} size={14} weight={700}>
            Impoundment
          </Label>
          <path d="M10 95 L28 300 L190 300 L190 318 L10 318 Z" fill={EARTH} />
          <path d="M22 125 L112 125 L112 300 L28 300 Z" fill={WATER} opacity={0.5} />
          <path d="M22 125 L112 125" stroke={WATER} strokeWidth={2} />
          <path d="M108 100 L124 100 L162 300 L108 300 Z" fill={C.dim} />
          {/* penstock through the dam to the powerhouse at its foot */}
          <path d="M112 262 L166 288" stroke="#0b1220" strokeWidth={6} strokeLinecap="round" />
          <Flow path="M112 262 L166 288" count={3} dur={1} color={WATER} r={3} />
          <path d="M160 294 L190 294 L190 300 L160 300 Z" fill={WATER} opacity={0.5} />
          <Turbine x={172} y={284} />
          <Flow path="M55 55 L55 118" count={3} dur={1.6} color="#bae6fd" r={3} />
          <Label x={64} y={80} size={12} color="#bae6fd" anchor="start">
            rain
          </Label>
          <Label x={66} y={215} size={12} color="#e0f2fe">
            reservoir
          </Label>
          <Label x={100} y={340} size={12} color={C.dim}>
            dam + reservoir
          </Label>
        </g>
        {/* 2: diversion: the river keeps flowing; a low weir sends part of it through a turbine */}
        <g>
          <Label x={300} y={40} size={14} weight={700}>
            Diversion (run-of-river)
          </Label>
          <path d="M210 250 L390 290 L390 318 L210 318 Z" fill={EARTH} />
          <path d="M210 232 L292 250 L292 268 L210 250 Z" fill={WATER} opacity={0.5} />
          <path d="M300 262 L390 282 L390 290 L300 270 Z" fill={WATER} opacity={0.5} />
          <path d="M290 244 L300 246 L300 270 L290 268 Z" fill={C.dim} />
          <Flow path="M212 240 L290 257 L302 262 L388 284" count={6} dur={3} color={WATER} r={3} />
          {/* intake above the weir, canal and penstock to a powerhouse downstream */}
          <path d="M270 252 L270 200 L340 200 L350 254" fill="none" stroke="#0b1220" strokeWidth={6} strokeLinejoin="round" />
          <Flow path="M270 252 L270 200 L340 200 L350 254" count={4} dur={1.8} color={WATER} r={3} />
          <Turbine x={351} y={263} />
          <Label x={236} y={205} size={12} color={C.dim}>
            intake
          </Label>
          <Label x={300} y={236} size={12} color={C.dim}>
            weir
          </Label>
          <Label x={300} y={340} size={12} color={C.dim}>
            no or little reservoir
          </Label>
        </g>
        {/* 3: pumped storage: an upper basin on a hill, a lower basin at its foot */}
        <g>
          <Label x={500} y={40} size={14} weight={700}>
            Pumped storage
          </Label>
          <path d="M410 300 L430 132 L500 132 L552 300 L590 300 L590 318 L410 318 Z" fill={EARTH} />
          <path d="M428 108 L502 108 L500 132 L430 132 Z" fill={WATER} opacity={0.55} />
          <path d="M424 104 L432 104 L432 132 L424 132 Z M498 104 L506 104 L504 132 L498 132 Z" fill={C.dim} />
          <path d="M548 272 L590 272 L590 300 L552 300 Z" fill={WATER} opacity={0.55} />
          <path d="M488 128 L540 272" stroke="#0b1220" strokeWidth={6} strokeLinecap="round" />
          <Flow path="M488 128 L540 272" count={3} dur={1.4} color={WATER} r={3} />
          <Reveal show={recharge}>
            <Flow path="M540 272 L488 128" count={3} dur={1.4} color={C.lithium} r={3} />
          </Reveal>
          <Turbine x={534} y={256} />
          <Label x={465} y={96} size={12} color={C.dim}>
            upper
          </Label>
          <Label x={572} y={262} size={12} color={C.dim}>
            lower
          </Label>
          <Label x={500} y={340} size={12} color={C.dim} anchor="middle">
            reversible pump-turbine
          </Label>
        </g>
      </Reveal>

      <Reveal show={recharge}>
        <Chip x={100} y={385} text="refilled by rain" color={C.electron} w={150} />
        <Chip x={300} y={385} text="almost no storage" color={C.hot} w={160} />
        <Chip x={500} y={385} text="✓ charged from the grid" color={C.lithium} w={190} />
        <Label x={300} y={430} size={14} weight={700}>
          only pumped storage is rechargeable with electricity
        </Label>
      </Reveal>

      <Reveal show={visual === "hydro-pros-cons"}>
        <Label x={150} y={50} size={17} weight={700} color={C.lithium}>
          Advantages
        </Label>
        <Label x={450} y={50} size={17} weight={700} color={C.hot}>
          Disadvantages
        </Label>
        {PROS.map((p, i) => (
          <motion.g key={p} initial={false} animate={{ opacity: visual === "hydro-pros-cons" ? 1 : 0 }} transition={{ delay: 0.1 + i * 0.12 }}>
            <rect x={20} y={80 + i * 70} width={265} height={54} rx={10} fill={C.lithium} opacity={0.12} stroke={C.lithium} />
            <Label x={152} y={112 + i * 70} size={13}>
              {p}
            </Label>
          </motion.g>
        ))}
        {CONS.map((p, i) => (
          <motion.g key={p} initial={false} animate={{ opacity: visual === "hydro-pros-cons" ? 1 : 0 }} transition={{ delay: 0.3 + i * 0.12 }}>
            <rect x={315} y={80 + i * 70} width={265} height={54} rx={10} fill={C.hot} opacity={0.12} stroke={C.hot} />
            <Label x={447} y={112 + i * 70} size={13}>
              {p}
            </Label>
          </motion.g>
        ))}
        <Label x={300} y={420} size={13} color={C.dim}>
          wins on everything except location
        </Label>
      </Reveal>

      <Reveal show={visual === "gravity"}>
        <Label x={300} y={42} size={17} weight={700}>
          Gravity storage: the materials accounting
        </Label>
        <line x1={120} y1={340} x2={120} y2={90} stroke={C.dim} strokeWidth={3} />
        <line x1={120} y1={90} x2={200} y2={90} stroke={C.dim} strokeWidth={3} />
        <motion.g initial={false} animate={{ y: visual === "gravity" ? [0, -200, -200] : 0 }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 0.6 }}>
          <rect x={170} y={300} width={60} height={40} fill="#9ca3af" />
          <Label x={200} y={326} size={13} weight={700} color="#0b1220">
            1 t
          </Label>
        </motion.g>
        <path d="M250 100 L250 340" stroke={C.ink} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <Label x={260} y={225} anchor="start" size={14}>
          100 m
        </Label>
        <Label x={200} y={375} size={15} weight={700} color={C.accent}>
          ≈ 0.27 kWh
        </Label>
        <Label x={380} y={225} size={28} weight={800}>
          ≈
        </Label>
        <rect x={450} y={200} width={50} height={40} rx={4} fill={C.lithium} />
        <Label x={475} y={225} size={13} weight={700} color="#0b1220">
          1 kg
        </Label>
        <Label x={475} y={270} size={15} weight={700} color={C.lithium}>
          Li-ion ≈ 0.25 kWh
        </Label>
        <Chip x={300} y={425} text="20 MWh ≈ 75 000 t lifted 100 m: physics works, materials don't" color={C.hot} w={490} />
      </Reveal>
    </Stage>
  );
}
