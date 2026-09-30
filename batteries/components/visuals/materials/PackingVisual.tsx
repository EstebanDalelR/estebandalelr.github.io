"use client";

import { motion } from "framer-motion";
import { C, Chip, Label, Reveal, Stage } from "../primitives";

// Simple oblique projection of a unit cube (side s) at origin (ox, oy).
function project(ox: number, oy: number, s: number) {
  return (x: number, y: number, z: number): [number, number] => [ox + x * s + y * s * 0.45, oy - z * s - y * s * 0.3];
}

type Proj = (x: number, y: number, z: number) => [number, number];

// Face diagonals, drawn faintly so face-centred atoms visibly sit on their faces.
const FACE_DIAGONALS: [number, number, number, number, number, number][] = [
  [0, 0, 0, 1, 0, 1], [1, 0, 0, 0, 0, 1], [0, 1, 0, 1, 1, 1], [1, 1, 0, 0, 1, 1],
  [0, 0, 0, 0, 1, 1], [0, 1, 0, 0, 0, 1], [1, 0, 0, 1, 1, 1], [1, 1, 0, 1, 0, 1],
  [0, 0, 0, 1, 1, 0], [1, 0, 0, 0, 1, 0], [0, 0, 1, 1, 1, 1], [1, 0, 1, 0, 1, 1],
];

function CubeFrame({ p, faces = false }: { p: Proj; faces?: boolean }) {
  const edges: [number, number, number, number, number, number][] = [
    [0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0], [1, 0, 0, 1, 0, 1], [0, 1, 0, 1, 1, 0],
    [0, 1, 0, 0, 1, 1], [0, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 1],
    [1, 1, 0, 1, 1, 1], [1, 0, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1],
  ];
  // The three edges meeting the back-bottom-left corner (0,1,0) are hidden behind the cell.
  const hidden = (a: number, b: number, c: number) => a === 0 && b === 1 && c === 0;
  return (
    <g stroke={C.dim} strokeWidth={1.5}>
      {faces &&
        FACE_DIAGONALS.map(([a, b, c, d, e, f], i) => {
          const [x1, y1] = p(a, b, c);
          const [x2, y2] = p(d, e, f);
          return <line key={`d${i}`} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1} opacity={0.22} />;
        })}
      {edges.map(([a, b, c, d, e, f], i) => {
        const [x1, y1] = p(a, b, c);
        const [x2, y2] = p(d, e, f);
        const back = hidden(a, b, c) || hidden(d, e, f);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={back ? "5 4" : undefined} opacity={back ? 0.55 : 1} />;
      })}
    </g>
  );
}

const CORNERS: [number, number, number][] = [0, 1].flatMap((x) => [0, 1].flatMap((y) => [0, 1].map((z) => [x, y, z] as [number, number, number])));
const FACES: [number, number, number][] = [
  [0.5, 0.5, 0], [0.5, 0.5, 1], [0.5, 0, 0.5], [0.5, 1, 0.5], [0, 0.5, 0.5], [1, 0.5, 0.5],
];

/** Atoms drawn back to front; depth (y) fades and shrinks them so the cell reads in 3D. */
function Atoms({ pts, p, r, color }: { pts: [number, number, number][]; p: Proj; r: number; color: string }) {
  const sorted = [...pts].sort((a, b) => b[1] - a[1]);
  return (
    <g>
      {sorted.map((pt, i) => {
        const [x, y] = p(...pt);
        const depth = pt[1];
        return (
          <circle key={i} cx={x} cy={y} r={r * (1 - 0.18 * depth)} fill={color} fillOpacity={1 - 0.6 * depth} stroke="#0b1220" strokeWidth={1} />
        );
      })}
    </g>
  );
}

const LAYER_COLOR = { A: C.lfp, B: C.copper, C: C.lithium } as const;
type Layer = keyof typeof LAYER_COLOR;

/* Side view: each close-packed layer is a row of atoms. Seen along the rows, B sits a third of a
   spacing over from A and C two thirds, so hcp (ABAB) repeats every 2 layers and ccp every 3. */
const SIDE = { gap: 36, r: 10, rise: 40, atoms: 4 };
const SHIFT: Record<Layer, number> = { A: 0, B: SIDE.gap / 3, C: (2 * SIDE.gap) / 3 };

function StackColumn({ x, seq, title }: { x: number; seq: Layer[]; title: string }) {
  const bottom = 340;
  const top = bottom - (seq.length - 1) * SIDE.rise;
  return (
    <g>
      <Label x={x + 66} y={70} size={15} weight={700}>
        {title}
      </Label>
      {/* guides through the A positions: they line up again every repeat */}
      {Array.from({ length: SIDE.atoms }, (_, k) => (
        <line key={k} x1={x + k * SIDE.gap} x2={x + k * SIDE.gap} y1={top - 22} y2={bottom + 18} stroke={C.lfp} strokeDasharray="3 4" opacity={0.45} />
      ))}
      {seq.map((l, i) => (
        <g key={i}>
          <Label x={x - 26} y={bottom - i * SIDE.rise + 5} size={14} weight={800} color={LAYER_COLOR[l]}>
            {l}
          </Label>
          {Array.from({ length: SIDE.atoms }, (_, k) => (
            <circle key={k} cx={x + k * SIDE.gap + SHIFT[l]} cy={bottom - i * SIDE.rise} r={SIDE.r} fill={LAYER_COLOR[l]} stroke="#0b1220" strokeWidth={1} />
          ))}
        </g>
      ))}
    </g>
  );
}

/* Top view on a triangular lattice with spacing D: A atoms, then the two sets of hollows,
   B = A + (a1 + a2)/3 and C = A + 2(a1 + a2)/3, kept inside the patch of A atoms. */
const D = 36;
const H = (D * Math.sqrt(3)) / 2;
const TOP_R = 78;
const lattice = (dx: number, dy: number, radius: number) => {
  const pts: [number, number][] = [];
  for (let n = -4; n <= 4; n++)
    for (let m = -5; m <= 5; m++) {
      const x = m * D + n * (D / 2) + dx;
      const y = n * H + dy;
      if (Math.hypot(x, y) <= radius) pts.push([x, y]);
    }
  return pts;
};
const TOP: Record<Layer, [number, number][]> = {
  A: lattice(0, 0, TOP_R),
  B: lattice(D / 2, H / 3, TOP_R - D / 2),
  C: lattice(D, (2 * H) / 3, TOP_R - D / 2),
};

const TYPES = [
  { s: "NaCl (rock salt)", p: "ccp Cl⁻", h: "Na⁺ in all octahedral", c: "6-6" },
  { s: "CaF₂ (fluorite)", p: "ccp Ca²⁺", h: "F⁻ in all tetrahedral", c: "8-4" },
  { s: "ZnS (zinc blende)", p: "ccp S²⁻", h: "Zn²⁺ in ½ tetrahedral", c: "4-4" },
  { s: "NiAs", p: "hcp As", h: "Ni in all octahedral", c: "6-6" },
  { s: "CdI₂", p: "hcp I⁻", h: "Cd²⁺ in ½ octahedral", c: "6-3" },
];

// radius-ratio axis 0 → 1.1 mapped to x 70 → 540
const rx = (v: number) => 70 + (v / 1.1) * 470;
const BANDS = [
  { from: 0.155, to: 0.225, name: "trigonal (3)", color: C.dim },
  { from: 0.225, to: 0.414, name: "tetrahedral (4)", color: C.anion },
  { from: 0.414, to: 0.732, name: "octahedral (6)", color: C.accent },
  { from: 0.732, to: 1.1, name: "cubic (8)", color: C.electron },
];

export default function PackingVisual({ visual }: { visual: string }) {
  const cells = visual === "cells";
  const voids = visual === "voids" || visual === "hydride";
  const hydride = visual === "hydride";
  const pBcc = project(80, 300, 130);
  const pFcc = project(340, 300, 130);
  const pV = project(90, 330, 190);

  return (
    <Stage label="Crystal structures, packing and voids">
      <Reveal show={cells}>
        <Label x={170} y={60} size={16} weight={700}>
          bcc
        </Label>
        <CubeFrame p={pBcc} />
        <Atoms pts={[...CORNERS, [0.5, 0.5, 0.5]]} p={pBcc} r={14} color={C.zinc} />
        <Label x={170} y={350} size={14}>
          2 atoms per cell
        </Label>
        <Chip x={170} y={385} text="APF = 0.68" color={C.zinc} w={130} />

        <Label x={430} y={60} size={16} weight={700}>
          fcc = ccp
        </Label>
        <CubeFrame p={pFcc} faces />
        <Atoms pts={[...CORNERS, ...FACES]} p={pFcc} r={14} color={C.copper} />
        <Label x={430} y={350} size={14}>
          4 atoms per cell
        </Label>
        <Chip x={430} y={385} text="APF = 0.74" color={C.copper} w={130} />
        <Label x={300} y={430} size={13} color={C.dim}>
          hcp is also close packed: APF = 0.74
        </Label>
      </Reveal>

      <Reveal show={visual === "stacking"}>
        <StackColumn x={75} seq={["A", "B", "A", "B", "A", "B"]} title="hcp: ABAB" />
        <StackColumn x={250} seq={["A", "B", "C", "A", "B", "C"]} title="ccp: ABCABC" />
        {/* top view: first layer A, then where B and C atoms sit in its hollows */}
        <g transform="translate(495 205)">
          <Label x={0} y={-112} size={15} weight={700}>
            top view
          </Label>
          {TOP.A.map(([x, y], i) => (
            <circle key={`a${i}`} cx={x} cy={y} r={D / 2 - 1} fill={LAYER_COLOR.A} fillOpacity={0.45} stroke={LAYER_COLOR.A} strokeOpacity={0.8} />
          ))}
          {TOP.B.map(([x, y], i) => (
            <circle key={`b${i}`} cx={x} cy={y} r={7} fill={LAYER_COLOR.B} stroke="#0b1220" strokeWidth={1} />
          ))}
          {TOP.C.map(([x, y], i) => (
            <circle key={`c${i}`} cx={x} cy={y} r={7} fill={LAYER_COLOR.C} stroke="#0b1220" strokeWidth={1} />
          ))}
          {(["A", "B", "C"] as const).map((l, k) => (
            <g key={l}>
              <circle cx={-52 + k * 44} cy={112} r={7} fill={LAYER_COLOR[l]} />
              <Label x={-40 + k * 44} y={117} size={13} anchor="start">
                {l}
              </Label>
            </g>
          ))}
        </g>
        <Chip x={300} y={420} text="never A on A: atoms would sit on top of each other" color={C.hot} w={400} />
      </Reveal>

      <Reveal show={voids}>
        <CubeFrame p={pV} />
        <Atoms pts={[...CORNERS, ...FACES]} p={pV} r={12} color={hydride ? "#94a3b8" : C.copper} />
        {/* octahedral voids: centre + edge midpoints (show centre and 3 visible edges) */}
        <motion.g initial={false} animate={{ opacity: hydride ? 0.25 : 1 }}>
          {([[0.5, 0.5, 0.5], [0.5, 0, 0], [0, 0.5, 0], [0, 0, 0.5]] as [number, number, number][]).map((pt, i) => {
            const [x, y] = pV(...pt);
            return <rect key={i} x={x - 6} y={y - 6} width={12} height={12} fill={C.anion} transform={`rotate(45 ${x} ${y})`} />;
          })}
        </motion.g>
        {/* tetrahedral voids at (¼,¼,¼) etc. */}
        {[0.25, 0.75].flatMap((x) => [0.25, 0.75].flatMap((y) => [0.25, 0.75].map((z) => [x, y, z] as [number, number, number]))).map((pt, i) => {
          const [x, y] = pV(...pt);
          return <circle key={i} cx={x} cy={y} r={hydride ? 7 : 5} fill={hydride ? C.lithium : C.electron} />;
        })}
        <g transform="translate(420 90)">
          <Reveal show={!hydride}>
            <Label x={80} y={0} size={16} weight={700}>
              ccp unit cell
            </Label>
            <Label x={0} y={40} size={14} anchor="start">
              4 atoms
            </Label>
            <rect x={0} y={60} width={12} height={12} fill={C.anion} transform="rotate(45 6 66)" />
            <Label x={22} y={72} size={14} anchor="start" color={C.anion}>
              4 octahedral voids
            </Label>
            <circle cx={6} cy={100} r={6} fill={C.electron} />
            <Label x={22} y={105} size={14} anchor="start" color={C.electron}>
              8 tetrahedral voids
            </Label>
            <rect x={-10} y={140} width={180} height={60} rx={10} fill="#0b1220" stroke={C.accent} />
            <Label x={80} y={165} size={14} weight={700} color={C.accent}>
              per atom:
            </Label>
            <Label x={80} y={188} size={14}>
              1 oct + 2 tet
            </Label>
          </Reveal>
          <Reveal show={hydride}>
            <Label x={80} y={0} size={16} weight={700}>
              Titanium hydride
            </Label>
            <circle cx={6} cy={36} r={8} fill="#94a3b8" />
            <Label x={22} y={41} size={14} anchor="start">
              Ti: ccp, 4 per cell
            </Label>
            <circle cx={6} cy={70} r={7} fill={C.lithium} />
            <Label x={22} y={75} size={14} anchor="start" color={C.lithium}>
              H: all 8 tetrahedral
            </Label>
            <Label x={80} y={120} size={15}>
              H : Ti = 8 : 4 = 2 : 1
            </Label>
            <rect x={10} y={140} width={140} height={50} rx={10} fill="#0b1220" stroke={C.lithium} />
            <Label x={80} y={172} size={20} weight={800} color={C.lithium}>
              TiH₂
            </Label>
          </Reveal>
        </g>
      </Reveal>

      <Reveal show={visual === "ionic-structures"}>
        <Label x={300} y={40} size={16} weight={700}>
          Larger ion packs, smaller ion fills voids
        </Label>
        {["structure", "packed", "voids filled", "CN"].map((h, i) => (
          <Label key={h} x={[40, 210, 310, 540][i]} y={80} size={13} color={C.dim} anchor={i === 3 ? "end" : "start"}>
            {h}
          </Label>
        ))}
        {TYPES.map((t, i) => (
          <g key={t.s}>
            <rect x={30} y={92 + i * 50} width={520} height={40} rx={8} fill="#111a2c" stroke={C.grid} />
            <Label x={40} y={117 + i * 50} size={14} weight={700} anchor="start">
              {t.s}
            </Label>
            <Label x={210} y={117 + i * 50} size={13} anchor="start">
              {t.p}
            </Label>
            <Label x={310} y={117 + i * 50} size={13} anchor="start" color={C.accent}>
              {t.h}
            </Label>
            <Label x={540} y={117 + i * 50} size={13} anchor="end">
              {t.c}
            </Label>
          </g>
        ))}
        <rect x={110} y={352} width={380} height={62} rx={10} fill={C.hot} opacity={0.12} stroke={C.hot} />
        <Label x={300} y={376} size={13} color={C.hot}>
          slide typo: “CdI₂: <tspan textDecoration="line-through">Cs</tspan> in 50 % of octahedral holes”
        </Label>
        <Label x={300} y={398} size={13} weight={700} color={C.lithium}>
          correct: Cd (cadmium) in half the octahedral voids
        </Label>
      </Reveal>

      <Reveal show={visual === "radius-ratio"}>
        <Label x={300} y={40} size={16} weight={700}>
          Radius ratio r₊ / r₋ decides the void
        </Label>
        {BANDS.map((b) => (
          <g key={b.name}>
            <rect x={rx(b.from)} y={110} width={rx(b.to) - rx(b.from)} height={120} fill={b.color} opacity={0.14} stroke={b.color} />
            <Label x={(rx(b.from) + rx(b.to)) / 2} y={b.from < 0.2 ? 100 : 130} size={12} color={b.color} weight={700}>
              {b.name}
            </Label>
          </g>
        ))}
        <line x1={70} y1={230} x2={548} y2={230} stroke={C.dim} strokeWidth={1.5} markerEnd="url(#arrow)" />
        {[0.155, 0.225, 0.414, 0.732].map((v) => (
          <g key={v}>
            <line x1={rx(v)} x2={rx(v)} y1={226} y2={236} stroke={C.dim} />
            <Label x={rx(v)} y={v === 0.225 ? 270 : 254} size={12} color={C.dim}>
              {v.toFixed(3)}
            </Label>
          </g>
        ))}
        {[
          { n: "NaCl", v: 0.57, y: 170, c: C.accent },
          { n: "KCl", v: 0.76, y: 196, c: C.accent },
          { n: "CsCl", v: 1.0, y: 170, c: C.electron },
        ].map((m) => (
          <g key={m.n}>
            <circle cx={rx(m.v)} cy={m.y} r={7} fill={m.c} />
            <Label x={rx(m.v)} y={m.y - 12} size={13} weight={700}>
              {`${m.n} ${m.v.toFixed(2)}`}
            </Label>
          </g>
        ))}
        <Label x={300} y={292} size={13} color={C.dim}>
          r(Na⁺) 1.02 · r(K⁺) 1.36 · r(Cs⁺) 1.79 · r(Cl⁻) 1.78 Å
        </Label>
        <Label x={300} y={322} size={13}>
          NaCl, KCl: rock salt (KCl sits just past 0.732: the rule is only qualitative)
        </Label>
        <Label x={300} y={346} size={13}>
          CsCl: large Cs⁺ → cubic 8-fold coordination
        </Label>
        <Chip x={300} y={396} text="highest coordination, but cation and anion must touch" color={C.accent} w={400} />
      </Reveal>
    </Stage>
  );
}
