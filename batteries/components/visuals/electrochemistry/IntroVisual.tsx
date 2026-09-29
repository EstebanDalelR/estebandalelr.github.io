"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";

const CHAPTERS = ["Pile", "Li-ion", "EDL", "CV", "i vs E", "Supercap", "Fuel cell", "Rate", "EIS", "Kinetics"];

function Device({ x, title, kind }: { x: number; title: string; kind: "battery" | "fuel" | "cap" }) {
  return (
    <g transform={`translate(${x} 70)`}>
      <rect x={-70} y={40} width={140} height={170} rx={14} fill="#111a2c" stroke={C.grid} strokeWidth={2} />
      <rect x={-60} y={52} width={22} height={146} rx={4} fill={kind === "battery" ? C.zinc : C.graphite} />
      <rect x={38} y={52} width={22} height={146} rx={4} fill={kind === "battery" ? C.copper : C.graphite} />
      <rect x={-34} y={52} width={68} height={146} fill={C.accent} opacity={0.08} />
      {kind === "fuel" && (
        <>
          <Flow path="M-110 90 L-62 90" color="#93c5fd" r={6} count={3} dur={1.6} />
          <Flow path="M110 170 L62 170" color="#fca5a5" r={6} count={3} dur={1.6} />
          <Label x={-100} y={76} size={13} color="#93c5fd">H₂</Label>
          <Label x={100} y={196} size={13} color="#fca5a5">O₂</Label>
        </>
      )}
      {kind === "cap" && (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <circle cx={-30} cy={64 + i * 24} r={6} fill={C.cation} />
              <circle cx={30} cy={64 + i * 24} r={6} fill={C.anion} />
            </g>
          ))}
        </g>
      )}
      {kind === "battery" && <Flow path="M-26 125 L26 125" color={C.lithium} count={4} dur={2} r={5} />}
      <path d="M-49 40 L-49 10 L49 10 L49 40" fill="none" stroke={C.dim} strokeWidth={2} />
      <Flow path="M-49 40 L-49 10 L49 10 L49 40" count={4} dur={2.4} r={4} />
      <Label x={0} y={250} size={18} weight={700}>
        {title}
      </Label>
    </g>
  );
}

export default function IntroVisual({ visual }: { visual: string }) {
  const compare = visual === "family-compare";
  const roadmap = visual === "roadmap";
  return (
    <Stage label="Batteries, fuel cells and supercapacitors">
      <motion.g animate={{ opacity: roadmap ? 0.15 : 1 }} transition={{ duration: 0.5 }}>
        <Device x={110} title="Battery" kind="battery" />
        <Device x={300} title="Fuel cell" kind="fuel" />
        <Device x={490} title="Supercapacitor" kind="cap" />
      </motion.g>
      <Reveal show={compare}>
        <Chip x={110} y={360} text="closed · redox" color={C.lithium} />
        <Chip x={300} y={360} text="open · fed fuel" color="#93c5fd" />
        <Chip x={490} y={360} text="no redox · EDL" color={C.anion} />
        <Label x={110} y={400} size={13} color={C.dim}>&quot;slow&quot;</Label>
        <Label x={300} y={400} size={13} color={C.dim}>&quot;slow conversion&quot;</Label>
        <Label x={490} y={400} size={13} color={C.dim}>&quot;fast&quot;</Label>
      </Reveal>
      <Reveal show={roadmap}>
        <path d="M60 225 C160 120 220 330 300 225 S440 120 540 225" fill="none" stroke={C.grid} strokeWidth={4} />
        {CHAPTERS.map((c, i) => {
          const t = i / (CHAPTERS.length - 1);
          const x = 60 + t * 480;
          const y = 225 + Math.sin(t * Math.PI * 2) * -70;
          return (
            <motion.g key={c} initial={false} animate={{ scale: roadmap ? 1 : 0.4 }} transition={{ delay: roadmap ? i * 0.07 : 0 }} style={{ originX: `${x}px`, originY: `${y}px` }}>
              <circle cx={x} cy={y} r={18} fill={C.accent} opacity={0.9} />
              <Label x={x} y={y + 5} size={13} color="#0b1220" weight={800}>{i + 1}</Label>
              <Label x={x} y={y + (i % 2 ? 44 : -30)} size={13}>{c}</Label>
            </motion.g>
          );
        })}
      </Reveal>
    </Stage>
  );
}
