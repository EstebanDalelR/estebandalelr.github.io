"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";

const HILL = "M120 360 L120 120 L250 120 L470 360 Z";

export default function VoltageVisual({ visual }: { visual: string }) {
  const potential = visual === "potential";
  const hill = visual === "hill";

  return (
    <Stage label="Voltage as a difference in potential">
      <Reveal show={potential}>
        {/* potential ladder */}
        <line x1={110} y1={360} x2={110} y2={70} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />
        <Label x={120} y={62} anchor="start" size={13} color={C.dim}>
          electric potential
        </Label>
        <line x1={100} y1={120} x2={360} y2={120} stroke={C.accent} strokeWidth={3} />
        <line x1={100} y1={320} x2={360} y2={320} stroke={C.lfp} strokeWidth={3} />
        <Label x={96} y={125} anchor="end" size={14} weight={700} color={C.accent}>
          A
        </Label>
        <Label x={96} y={325} anchor="end" size={14} weight={700} color={C.lfp}>
          B
        </Label>
        <motion.g
          initial={false}
          animate={potential ? { y: [0, 190, 190] } : { y: 0 }}
          transition={potential ? { duration: 3, repeat: Infinity, times: [0, 0.7, 1] } : { duration: 0 }}
        >
          <circle cx={230} cy={112} r={12} fill={C.cation} />
          <Label x={230} y={117} size={13} color="#0b1220" weight={800}>
            +
          </Label>
        </motion.g>
        <path d="M280 140 C300 190 300 250 280 300" fill="none" stroke={C.electron} strokeWidth={2} markerEnd="url(#arrow-e)" />
        <Label x={306} y={225} anchor="start" size={13} color={C.electron}>
          gives up energy E
        </Label>
        {/* voltmeter */}
        <line x1={360} y1={120} x2={470} y2={120} stroke={C.dim} strokeWidth={2} />
        <line x1={360} y1={320} x2={470} y2={320} stroke={C.dim} strokeWidth={2} />
        <line x1={470} y1={120} x2={470} y2={192} stroke={C.dim} strokeWidth={2} />
        <line x1={470} y1={248} x2={470} y2={320} stroke={C.dim} strokeWidth={2} />
        <circle cx={470} cy={220} r={28} fill="#111a2c" stroke={C.ink} strokeWidth={2.5} />
        <Label x={470} y={227} size={20} weight={800}>
          V
        </Label>
        <Label x={520} y={225} anchor="start" size={13} color={C.dim}>
          voltmeter
        </Label>
        <Chip x={300} y={395} text="V = E / Q    ·    1 V = 1 J/C" color={C.accent} w={300} />
      </Reveal>

      <Reveal show={hill}>
        <path d={HILL} fill={C.accent} opacity={0.07} />
        <path d="M120 360 L120 120" stroke={C.lithium} strokeWidth={6} />
        <path d="M120 120 L250 120" stroke={C.dim} strokeWidth={4} />
        <path d="M250 120 L470 360" stroke={C.copper} strokeWidth={6} />
        <path d="M470 360 L120 360" stroke={C.dim} strokeWidth={4} />
        <Flow path={HILL} count={9} dur={6} color={C.cation} r={7} label="+" />
        <Label x={108} y={240} anchor="end" size={13} color={C.lithium} weight={700}>
          source
        </Label>
        <Label x={108} y={258} anchor="end" size={12} color={C.dim}>
          lifts charge
        </Label>
        <Label x={380} y={215} anchor="start" size={13} color={C.copper} weight={700}>
          load: charge gives
        </Label>
        <Label x={380} y={233} anchor="start" size={13} color={C.copper} weight={700}>
          its energy away
        </Label>
        {/* height ruler */}
        <line x1={530} y1={120} x2={530} y2={360} stroke={C.ink} strokeWidth={2} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <line x1={250} y1={120} x2={540} y2={120} stroke={C.dim} strokeDasharray="4 4" />
        <Label x={540} y={235} anchor="start" size={16} weight={700} color={C.accent}>
          V
        </Label>
        <Chip x={300} y={410} text="voltage = height difference, always between two points" color={C.accent} w={420} />
      </Reveal>
    </Stage>
  );
}
