"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";

const LOOP = { repeat: Infinity, duration: 6, ease: "easeInOut" as const };

/** Na gives its 3s electron to Cl, the ions attract; then a shifted row shows why ionic crystals are brittle. */
function Ionic({ show }: { show: boolean }) {
  // 7 valence electrons on Cl's outer shell, the 8th slot is where Na's electron lands
  const clShell = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4 - Math.PI / 2);
  return (
    <g>
      <Label x={300} y={34} size={16} weight={700}>
        Ionic: an electron is transferred
      </Label>
      {/* Na */}
      <motion.g initial={false} animate={show ? { x: [0, 0, 40, 40, 0] } : { x: 0 }} transition={{ ...LOOP, times: [0, 0.35, 0.55, 0.85, 1] }}>
        <circle cx={150} cy={130} r={46} fill="none" stroke={C.grid} strokeWidth={1.5} />
        <circle cx={150} cy={130} r={18} fill={C.cation} />
        <Label x={150} y={135} size={13} color="#0b1220" weight={800}>
          Na
        </Label>
        <motion.g initial={false} animate={show ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }} transition={{ ...LOOP, times: [0, 0.35, 0.45, 0.85, 1] }}>
          <Label x={178} y={104} size={15} color={C.cation} weight={800}>
            +
          </Label>
        </motion.g>
        <Label x={150} y={200} size={13} color={C.dim}>
          Na: 1 valence e⁻
        </Label>
      </motion.g>
      {/* Cl */}
      <motion.g initial={false} animate={show ? { x: [0, 0, -40, -40, 0] } : { x: 0 }} transition={{ ...LOOP, times: [0, 0.35, 0.55, 0.85, 1] }}>
        <circle cx={430} cy={130} r={46} fill="none" stroke={C.grid} strokeWidth={1.5} />
        <circle cx={430} cy={130} r={22} fill={C.anion} />
        <Label x={430} y={135} size={13} color="#0b1220" weight={800}>
          Cl
        </Label>
        {clShell.slice(1).map((a, i) => (
          <circle key={i} cx={430 + Math.cos(a) * 46} cy={130 + Math.sin(a) * 46} r={4} fill={C.electron} />
        ))}
        <motion.g initial={false} animate={show ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }} transition={{ ...LOOP, times: [0, 0.35, 0.45, 0.85, 1] }}>
          <Label x={466} y={100} size={15} color={C.anion} weight={800}>
            −
          </Label>
        </motion.g>
        <Label x={430} y={200} size={13} color={C.dim}>
          Cl: 7 valence e⁻
        </Label>
      </motion.g>
      {/* the transferred electron: from Na's shell to Cl's empty slot */}
      <motion.circle
        r={5}
        fill={C.electron}
        initial={false}
        animate={show ? { cx: [196, 196, 430, 390, 390, 196], cy: [130, 130, 84, 84, 84, 130] } : { cx: 196, cy: 130 }}
        transition={{ ...LOOP, times: [0, 0.1, 0.35, 0.55, 0.85, 1] }}
      />
      <motion.g initial={false} animate={show ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }} transition={{ ...LOOP, times: [0, 0.5, 0.6, 0.85, 1] }}>
        <Label x={290} y={124} size={13} color={C.ink}>
          ← attract →
        </Label>
      </motion.g>

      {/* lattice: the top row slides half a spacing, like charges meet */}
      <g transform="translate(140 240)">
        {[0, 1, 2].map((r) => (
          <motion.g key={r} initial={false} animate={show && r === 0 ? { x: [0, 0, 34, 34, 0] } : { x: 0 }} transition={{ ...LOOP, times: [0, 0.4, 0.6, 0.9, 1] }}>
            {[0, 1, 2, 3, 4, 5].map((c) => {
              const plus = (r + c) % 2 === 0;
              return (
                <g key={c}>
                  <circle cx={c * 34} cy={r * 34} r={plus ? 11 : 14} fill={plus ? C.cation : C.anion} />
                  <Label x={c * 34} y={r * 34 + 5} size={13} color="#0b1220" weight={800}>
                    {plus ? "+" : "−"}
                  </Label>
                </g>
              );
            })}
          </motion.g>
        ))}
        <motion.g initial={false} animate={show ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }} transition={{ ...LOOP, times: [0, 0.55, 0.62, 0.9, 1] }}>
          {[34, 102, 170].map((x) => (
            <line key={x} x1={x} y1={8} x2={x} y2={30} stroke={C.hot} strokeWidth={2.5} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          ))}
          <Label x={230} y={22} size={13} color={C.hot} anchor="start" weight={700}>
            + meets +: repulsion
          </Label>
        </motion.g>
      </g>
      <Label x={330} y={360} size={13} anchor="start">
        → cracks: hard but brittle
      </Label>
      <Chip x={300} y={420} text="conducts only when molten or dissolved (ions free to move)" color={C.anion} w={440} />
    </g>
  );
}

/** Two 1s orbitals overlap into a shared electron pair; then a tetrahedral network. */
function Covalent({ show }: { show: boolean }) {
  const bond = [
    [0, 0],
    [60, 35],
    [0, 70],
    [-60, 35],
  ];
  return (
    <g>
      <Label x={300} y={34} size={16} weight={700}>
        Covalent: electrons are shared
      </Label>
      {[-1, 1].map((side) => (
        <motion.g key={side} initial={false} animate={show ? { x: [side * 50, 0, 0, side * 50] } : { x: 0 }} transition={{ ...LOOP, times: [0, 0.3, 0.85, 1] }}>
          <circle cx={300 + side * 30} cy={140} r={55} fill={C.lfp} opacity={0.22} />
          <circle cx={300 + side * 30} cy={140} r={8} fill={C.lfp} />
          <Label x={300 + side * 30} y={215} size={13} color={C.dim}>
            H (1s)
          </Label>
        </motion.g>
      ))}
      <motion.g initial={false} animate={show ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }} transition={{ ...LOOP, times: [0, 0.3, 0.4, 0.85, 1] }}>
        <circle cx={300} cy={133} r={5} fill={C.electron} />
        <circle cx={300} cy={147} r={5} fill={C.electron} />
        <Label x={300} y={78} size={13} color={C.electron} weight={700}>
          shared pair between the nuclei
        </Label>
      </motion.g>

      {/* tetrahedral network (diamond-like) */}
      <g transform="translate(150 270)">
        {[0, 1, 2].map((k) => (
          <g key={k} transform={`translate(${k * 120} ${k % 2 ? 20 : 0})`}>
            {bond.slice(1).map(([x, y], i) => (
              <line key={i} x1={0} y1={35} x2={x} y2={y} stroke={C.anion} strokeWidth={3} />
            ))}
            <line x1={60} y1={35} x2={120} y2={k % 2 ? 15 : 55} stroke={C.anion} strokeWidth={3} opacity={k < 2 ? 1 : 0} />
            {bond.slice(1).map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={8} fill={C.zinc} />
            ))}
            <circle cx={0} cy={35} r={9} fill={C.anion} />
          </g>
        ))}
      </g>
      <Chip x={300} y={420} text="directional bonds → hard, high melting, insulating" color={C.anion} w={400} />
    </g>
  );
}

/** Ion cores in a flowing sea of electrons; a field makes them drift; the top rows slide but stay bonded. */
function Metallic({ show }: { show: boolean }) {
  const rows = [0, 1, 2, 3];
  const cols = [0, 1, 2, 3, 4, 5, 6];
  return (
    <g>
      <Label x={300} y={34} size={16} weight={700}>
        Metallic: a sea of electrons
      </Label>
      <rect x={70} y={90} width={460} height={230} rx={14} fill={C.electron} opacity={0.08} />
      {/* electron sea flowing left to right through the gaps between rows */}
      {[0, 1, 2, 3, 4].map((g) => (
        <Flow key={g} path={`M80 ${100 + g * 50} L520 ${100 + g * 50}`} count={7} dur={3 + (g % 2)} r={3.5} />
      ))}
      {rows.map((r) => (
        <motion.g key={r} initial={false} animate={show && r < 2 ? { x: [0, 0, 32, 32, 0] } : { x: 0 }} transition={{ ...LOOP, times: [0, 0.5, 0.7, 0.9, 1] }}>
          {cols.map((c) => (
            <g key={c}>
              <circle cx={110 + c * 64} cy={125 + r * 50} r={15} fill={C.zinc} />
              <Label x={110 + c * 64} y={130 + r * 50} size={14} color="#0b1220" weight={800}>
                +
              </Label>
            </g>
          ))}
        </motion.g>
      ))}
      <line x1={140} y1={350} x2={460} y2={350} stroke={C.electron} strokeWidth={2.5} markerEnd="url(#arrow-e)" />
      <Label x={300} y={340} size={13} color={C.electron}>
        apply a field: electrons drift → conducts
      </Label>
      <motion.g initial={false} animate={show ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }} transition={{ ...LOOP, times: [0, 0.5, 0.6, 0.9, 1] }}>
        <Label x={530} y={78} size={13} color={C.lithium} anchor="end" weight={700}>
          top rows slide →
        </Label>
      </motion.g>
      <Chip x={300} y={410} text="layers slide, the sea keeps them bonded → ductile" color={C.lithium} w={400} />
    </g>
  );
}

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

      <Reveal show={visual === "ionic"}>
        <Ionic show={visual === "ionic"} />
      </Reveal>
      <Reveal show={visual === "covalent"}>
        <Covalent show={visual === "covalent"} />
      </Reveal>
      <Reveal show={visual === "metallic"}>
        <Metallic show={visual === "metallic"} />
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
