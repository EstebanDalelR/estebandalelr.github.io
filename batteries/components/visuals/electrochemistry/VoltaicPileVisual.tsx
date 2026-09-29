"use client";

import { motion } from "framer-motion";
import { C, Flow, Ion, Label, Reveal, Stage } from "../primitives";

const CELLS = 4;
const DISC_H = 16;
// Each cell from the bottom up: zinc, soaked cloth, copper.
const layers = Array.from({ length: CELLS }).flatMap((_, i) => [
  { kind: "zinc", cell: i },
  { kind: "cloth", cell: i },
  { kind: "copper", cell: i },
]);

export default function VoltaicPileVisual({ visual }: { visual: string }) {
  const zoom = visual === "pile-zinc" || visual === "pile-copper";
  const series = visual === "pile-series";
  const baseY = 380;

  return (
    <Stage label="Voltaic pile">
      <motion.g initial={false} animate={{ x: zoom ? -90 : 0, opacity: zoom ? 0.35 : 1 }} transition={{ duration: 0.6 }}>
        {/* the stack */}
        {layers.map((l, i) => {
          const y = baseY - (i + 1) * (DISC_H + 2);
          const fill = l.kind === "zinc" ? C.zinc : l.kind === "copper" ? C.copper : C.cloth;
          return (
            <g key={i}>
              <ellipse cx={200} cy={y + DISC_H} rx={70} ry={12} fill="#000" opacity={0.25} />
              <rect x={130} y={y} width={140} height={DISC_H} fill={fill} opacity={l.kind === "cloth" ? 0.8 : 1} />
              <ellipse cx={200} cy={y} rx={70} ry={12} fill={fill} stroke="#0b1220" strokeOpacity={0.3} />
            </g>
          );
        })}
        {/* wire + bulb */}
        <path d={`M270 ${baseY - 214} L400 ${baseY - 214} L400 ${baseY - 8} L270 ${baseY - 8}`} fill="none" stroke={C.dim} strokeWidth={3} />
        <Flow path={`M270 ${baseY - 8} L400 ${baseY - 8} L400 ${baseY - 214} L270 ${baseY - 214}`} count={6} dur={3.5} r={4} />
        <circle cx={400} cy={baseY - 110} r={22} fill="#fde68a" opacity={0.9} />
        <circle cx={400} cy={baseY - 110} r={50} fill="url(#glow)" opacity={0.5} />
        <Label x={440} y={baseY - 8} size={13} color={C.dim} anchor="start">− zinc end</Label>
        <Label x={440} y={baseY - 210} size={13} color={C.dim} anchor="start">+ copper end</Label>
        <Label x={200} y={40} size={18} weight={700}>Volta, 1799</Label>
      </motion.g>

      {/* legend */}
      <Reveal show={!zoom}>
        <g transform="translate(40 420)">
          <rect width={14} height={14} fill={C.zinc} />
          <Label x={20} y={12} anchor="start" size={13}>Zn</Label>
          <rect x={70} width={14} height={14} fill={C.cloth} />
          <Label x={90} y={12} anchor="start" size={13}>brine-soaked cloth</Label>
          <rect x={240} width={14} height={14} fill={C.copper} />
          <Label x={260} y={12} anchor="start" size={13}>Cu</Label>
        </g>
      </Reveal>

      {/* zoom: one cell */}
      <Reveal show={zoom}>
        <g transform="translate(250 90)">
          <rect x={0} y={0} width={70} height={260} fill={C.zinc} rx={4} />
          <rect x={70} y={0} width={120} height={260} fill={C.cloth} opacity={0.35} />
          <rect x={190} y={0} width={70} height={260} fill={C.copper} rx={4} />
          <Label x={35} y={-12} weight={700}>Zn (−)</Label>
          <Label x={130} y={-12} size={13} color={C.dim}>electrolyte</Label>
          <Label x={225} y={-12} weight={700}>Cu (+)</Label>
          <path d="M35 260 L35 300 L225 300 L225 260" fill="none" stroke={C.dim} strokeWidth={3} />
          <Flow path="M35 262 L35 300 L225 300 L225 262" count={5} dur={2.5} r={5} />
          <Label x={130} y={322} size={13} color={C.electron}>e⁻ through the metal</Label>
        </g>
      </Reveal>

      <Reveal show={visual === "pile-zinc"}>
        <g transform="translate(250 90)">
          {[60, 120, 180].map((y, i) => (
            <motion.g key={y} animate={{ x: [60, 110], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.8 }}>
              <Ion x={20} y={y} sign="+" color={C.zinc} r={12} />
            </motion.g>
          ))}
          <rect x={-10} y={196} width={250} height={34} rx={8} fill="#0b1220" opacity={0.85} />
          <Label x={115} y={219} size={17} weight={700}>Zn → Zn²⁺ + 2e⁻   (oxidation)</Label>
        </g>
      </Reveal>

      <Reveal show={visual === "pile-copper"}>
        <g transform="translate(250 90)">
          {[50, 110, 170].map((y, i) => (
            <g key={y}>
              <motion.g animate={{ x: [-60, 0], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.6 }}>
                <Ion x={180} y={y} sign="+" color={C.cation} r={8} />
              </motion.g>
              <motion.circle cx={175} r={7} fill="none" stroke="#e0f2fe" strokeWidth={2} animate={{ cy: [y, y - 60], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.6 + 0.8 }} />
            </g>
          ))}
          <rect x={20} y={196} width={250} height={34} rx={8} fill="#0b1220" opacity={0.85} />
          <Label x={145} y={219} size={17} weight={700}>2H⁺ + 2e⁻ → H₂   (reduction)</Label>
        </g>
      </Reveal>

      <Reveal show={series}>
        {Array.from({ length: CELLS }).map((_, i) => (
          <g key={i}>
            <path d={`M118 ${baseY - i * 54 - 4} l-10 0 l0 -48 l10 0`} fill="none" stroke={C.accent} strokeWidth={2} />
            <Label x={100} y={baseY - i * 54 - 22} anchor="end" size={13} color={C.accent}>
              ≈0.76 V
            </Label>
          </g>
        ))}
        <rect x={420} y={200} width={160} height={60} rx={10} fill="#0b1220" stroke={C.accent} />
        <Label x={500} y={225} size={15} color={C.accent} weight={700}>cells in series</Label>
        <Label x={500} y={248} size={15}>V = n × V_cell</Label>
        <Flow path="M150 330 L150 260" count={3} dur={1.8} color={C.cation} r={4} />
        <Flow path="M250 260 L250 330" count={3} dur={1.8} color={C.anion} r={4} />
      </Reveal>
    </Stage>
  );
}
