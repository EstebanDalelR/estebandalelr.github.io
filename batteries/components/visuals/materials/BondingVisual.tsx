"use client";

import { motion } from "framer-motion";
import { C, Chip, Label, Reveal, Stage } from "../primitives";

const BARS = [
  { name: "NaCl", u: 788, note: "Z = 1 · 1", color: C.lfp },
  { name: "NaF", u: 904, note: "Z = 1 · 1, smaller r", color: C.accent },
  { name: "MgO", u: 3938, note: "Z = 2 · 2", color: C.hot },
];

export default function BondingVisual({ visual }: { visual: string }) {
  const lattice = visual === "lattice-energy";
  return (
    <Stage label="Chemical bonding">
      <Reveal show={visual === "triangle"}>
        <path d="M300 60 L90 380 L510 380 Z" fill={C.accent} opacity={0.06} stroke={C.grid} strokeWidth={2} />
        {/* covalent (top) */}
        <circle cx={300} cy={60} r={9} fill={C.anion} />
        <Label x={300} y={40} size={15} weight={700} color={C.anion}>
          Covalent
        </Label>
        <Label x={380} y={72} size={12} color={C.dim} anchor="start">
          non-metal + non-metal
        </Label>
        <Label x={380} y={88} size={12} color={C.dim} anchor="start">
          electrons shared, directional
        </Label>
        {/* metallic (bottom left) */}
        <circle cx={90} cy={380} r={9} fill={C.electron} />
        <Label x={90} y={410} size={15} weight={700} color={C.electron}>
          Metallic
        </Label>
        <Label x={90} y={428} size={12} color={C.dim}>
          sea of electrons
        </Label>
        {/* ionic (bottom right) */}
        <circle cx={510} cy={380} r={9} fill={C.hot} />
        <Label x={510} y={410} size={15} weight={700} color={C.hot}>
          Ionic
        </Label>
        <Label x={510} y={428} size={12} color={C.dim}>
          electrons transferred
        </Label>

        {/* metallic sketch: ion cores in electron sea */}
        <g transform="translate(150 250)">
          <rect x={-10} y={-10} width={120} height={80} rx={12} fill={C.electron} opacity={0.12} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => <circle key={`${r}-${c}`} cx={10 + c * 30} cy={10 + r * 25} r={8} fill={C.zinc} />),
          )}
          {[5, 32, 60, 88, 20, 75].map((x, i) => (
            <circle key={i} cx={x} cy={i < 3 ? 22 : 47} r={2.5} fill={C.electron} />
          ))}
          <Label x={50} y={92} size={12} color={C.dim}>
            conducts, ductile
          </Label>
        </g>
        {/* ionic sketch */}
        <g transform="translate(350 250)">
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => {
              const plus = (r + c) % 2 === 0;
              return (
                <g key={`${r}-${c}`}>
                  <circle cx={10 + c * 28} cy={10 + r * 25} r={plus ? 7 : 10} fill={plus ? C.cation : C.anion} />
                  <Label x={10 + c * 28} y={14 + r * 25} size={12} color="#0b1220" weight={800}>
                    {plus ? "+" : "−"}
                  </Label>
                </g>
              );
            }),
          )}
          <Label x={50} y={92} size={12} color={C.dim}>
            hard but brittle
          </Label>
        </g>
        {/* covalent sketch */}
        <g transform="translate(300 160)">
          <circle cx={-22} cy={0} r={13} fill={C.anion} opacity={0.8} />
          <circle cx={22} cy={0} r={13} fill={C.anion} opacity={0.8} />
          <circle cx={-3} cy={-3} r={3} fill={C.electron} />
          <circle cx={3} cy={3} r={3} fill={C.electron} />
          <Label x={0} y={34} size={12} color={C.dim}>
            shared pair
          </Label>
        </g>
      </Reveal>

      <Reveal show={lattice}>
        <Label x={300} y={40} size={16} weight={700}>
          Lattice energy (kJ/mol)
        </Label>
        <Label x={300} y={62} size={13} color={C.dim}>
          U ∝ Z₊Z₋ / r: higher charge, smaller ions → larger U
        </Label>
        {BARS.map((b, i) => {
          const y = 110 + i * 90;
          const w = (b.u / 3938) * 360;
          return (
            <g key={b.name}>
              <Label x={110} y={y + 26} size={16} weight={700} anchor="end">
                {b.name}
              </Label>
              <motion.rect x={125} y={y} height={40} rx={6} fill={b.color} initial={false} animate={{ width: lattice ? w : 0 }} transition={{ duration: 0.8, delay: i * 0.2 }} />
              <Label x={125 + w + 8} y={y + 26} size={15} weight={700} anchor="start">
                {b.u}
              </Label>
              <Label x={125} y={y + 60} size={12} color={C.dim} anchor="start">
                {b.note}
              </Label>
            </g>
          );
        })}
        <Chip x={300} y={420} text="MgO: double charges → about 5× the lattice energy" color={C.hot} w={380} />
      </Reveal>

      <Reveal show={visual === "properties"}>
        <Label x={300} y={60} size={16} weight={700}>
          Stronger bonds mean…
        </Label>
        <line x1={70} y1={380} x2={70} y2={100} stroke={C.accent} strokeWidth={3} markerEnd="url(#arrow)" />
        <Label x={82} y={100} size={13} color={C.accent} anchor="start">
          bond strength
        </Label>
        {[
          { t: "higher melting point", s: "more energy to break the lattice", c: C.hot },
          { t: "higher surface energy", s: "each broken bond costs more", c: C.electron },
          { t: "slower diffusion", s: "higher activation energy to jump", c: C.lfp },
        ].map((p, i) => (
          <g key={p.t}>
            <rect x={130} y={120 + i * 90} width={400} height={66} rx={12} fill={p.c} opacity={0.12} stroke={p.c} />
            <Label x={330} y={148 + i * 90} size={16} weight={700} color={p.c}>
              {p.t}
            </Label>
            <Label x={330} y={170 + i * 90} size={13} color={C.dim}>
              {p.s}
            </Label>
          </g>
        ))}
        <Label x={330} y={420} size={13} color={C.dim}>
          remember this: it answers the surface energy and diffusion questions
        </Label>
      </Reveal>
    </Stage>
  );
}
