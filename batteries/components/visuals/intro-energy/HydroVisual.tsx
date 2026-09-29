"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";

const WATER = "#38bdf8";

function Turbine({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} fill="#111a2c" stroke={C.ink} strokeWidth={2} />
      <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }} style={{ originX: `${x}px`, originY: `${y}px` }}>
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
        {/* 1: impoundment */}
        <g>
          <Label x={100} y={40} size={14} weight={700}>
            Impoundment
          </Label>
          <path d="M20 110 L120 110 L120 300 L20 300 Z" fill={WATER} opacity={0.5} />
          <path d="M120 70 L140 70 L150 300 L120 300 Z" fill={C.dim} />
          <Flow path="M140 250 L180 280" count={3} dur={1} color={WATER} r={4} />
          <Turbine x={160} y={268} />
          <Label x={100} y={330} size={12} color={C.dim}>
            dam + reservoir
          </Label>
          <Flow path="M60 40 L60 100" count={3} dur={1.6} color="#bae6fd" r={3} />
          <Label x={70} y={62} size={12} color="#bae6fd" anchor="start">
            rain
          </Label>
        </g>
        {/* 2: diversion */}
        <g>
          <Label x={300} y={40} size={14} weight={700}>
            Diversion (run-of-river)
          </Label>
          <path d="M210 120 C260 140 330 140 390 120 L390 150 C330 170 260 170 210 150 Z" fill={WATER} opacity={0.5} />
          <Flow path="M250 150 L270 230 L330 230 L350 150" count={4} dur={2} color={WATER} r={4} />
          <Turbine x={300} y={230} />
          <Label x={300} y={330} size={12} color={C.dim}>
            no or little reservoir
          </Label>
        </g>
        {/* 3: pumped storage */}
        <g>
          <Label x={500} y={40} size={14} weight={700}>
            Pumped storage
          </Label>
          <rect x={420} y={80} width={70} height={50} fill={WATER} opacity={0.55} />
          <rect x={510} y={250} width={75} height={50} fill={WATER} opacity={0.55} />
          <path d="M470 130 L530 250" stroke={C.dim} strokeWidth={6} />
          <Turbine x={500} y={190} />
          <Flow path="M475 135 L525 245" count={3} dur={1.4} color={WATER} r={4} />
          <Reveal show={recharge}>
            <Flow path="M535 245 L485 135" count={3} dur={1.4} color={C.lithium} r={4} />
          </Reveal>
          <Label x={455} y={148} size={12} color={C.dim}>
            upper
          </Label>
          <Label x={555} y={282} size={12} color="#0b1220" weight={700}>
            lower
          </Label>
          <Label x={500} y={330} size={12} color={C.dim} anchor="middle">
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
