"use client";

import { motion } from "framer-motion";
import { C, Chip, Label, Reveal, Stage } from "../primitives";
import { Title } from "../blocks";
import { ATOM, Atom, Backbone, Bond, zigzag } from "./mol";

/** 2-butene drawn flat: C=C with a methyl (R) and H on each carbon. */
function Butene({ x, y, cis }: { x: number; y: number; cis: boolean }) {
  const l = x - 30;
  const r = x + 30;
  const up = y - 40;
  const dn = y + 40;
  const right = cis ? up : dn;
  const rightH = cis ? dn : up;
  return (
    <g>
      <Bond x1={l} y1={y} x2={r} y2={y} order={2} color={C.electron} />
      <Bond x1={l} y1={y} x2={l - 34} y2={up} />
      <Bond x1={l} y1={y} x2={l - 34} y2={dn} />
      <Bond x1={r} y1={y} x2={r + 34} y2={right} />
      <Bond x1={r} y1={y} x2={r + 34} y2={rightH} />
      <Atom x={l - 34} y={up} el="R" r={14} />
      <Atom x={l - 34} y={dn} el="H" />
      <Atom x={r + 34} y={right} el="R" r={14} />
      <Atom x={r + 34} y={rightH} el="H" />
      <Atom x={l} y={y} el="C" />
      <Atom x={r} y={y} el="C" />
    </g>
  );
}

const GROUPS = [
  { el: "H", c: ATOM.H },
  { el: "O", c: ATOM.O },
  { el: "N", c: ATOM.N },
  { el: "R", c: ATOM.R },
];

function Tetra({ x, y, mirror }: { x: number; y: number; mirror: boolean }) {
  const s = mirror ? -1 : 1;
  const pos: [number, number][] = [
    [0, -55],
    [s * 52, 22],
    [s * -30, 48],
    [s * -50, -2],
  ];
  return (
    <g>
      {pos.map(([dx, dy], i) => (
        <line key={i} x1={x} y1={y} x2={x + dx} y2={y + dy} stroke={C.dim} strokeWidth={i === 2 ? 5 : 3} strokeDasharray={i === 3 ? "4 3" : undefined} />
      ))}
      {pos.map(([dx, dy], i) => (
        <Atom key={`a${i}`} x={x + dx} y={y + dy} el={GROUPS[i].el} r={14} />
      ))}
      <Atom x={x} y={y} el="C" r={16} />
    </g>
  );
}

type Tact = "iso" | "syndio" | "a";
const ATACTIC = [1, 1, -1, 1, -1, -1, 1, -1];

function Chain({ y, kind }: { y: number; kind: Tact }) {
  const pts = zigzag(15, 30, y, 30, 12);
  return (
    <g>
      <Backbone pts={pts} />
      {pts.map(([x, py], i) => {
        if (i % 2) return null;
        const k = i / 2;
        const side = kind === "iso" ? -1 : kind === "syndio" ? (k % 2 ? 1 : -1) : ATACTIC[k];
        const ey = py + side * 30;
        return (
          <g key={i}>
            <line x1={x} y1={py} x2={x} y2={ey} stroke={C.lithium} strokeWidth={3} />
            <circle cx={x} cy={ey} r={9} fill={C.lithium} />
          </g>
        );
      })}
    </g>
  );
}

export default function StereoVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Stereochemistry and tacticity">
      <Reveal show={is("cis-trans")}>
        <Title>Same formula, different shape</Title>
        <Butene x={160} y={210} cis />
        <Butene x={440} y={210} cis={false} />
        <Label x={160} y={300} size={16} weight={700} color={C.accent}>
          cis-2-butene
        </Label>
        <Label x={160} y={322} size={13} color={C.dim}>
          methyls on the same side
        </Label>
        <Label x={440} y={300} size={16} weight={700} color={C.electron}>
          trans-2-butene
        </Label>
        <Label x={440} y={322} size={13} color={C.dim}>
          methyls on opposite sides
        </Label>
        <Chip x={300} y={390} text="C=C cannot rotate, so the two isomers never interconvert" w={430} />
        <Label x={300} y={424} size={12} color={C.dim}>
          R = CH₃ (methyl)
        </Label>
      </Reveal>

      <Reveal show={is("chiral")}>
        <Title>Four different groups → chiral carbon</Title>
        <Tetra x={160} y={210} mirror={false} />
        <Tetra x={440} y={210} mirror />
        <line x1={300} y1={110} x2={300} y2={320} stroke={C.accent} strokeWidth={2} strokeDasharray="6 5" />
        <Label x={300} y={100} size={13} color={C.accent}>
          mirror
        </Label>
        <Label x={300} y={360} size={15} weight={700}>
          enantiomers: same connectivity, opposite 3D shape
        </Label>
        <Chip x={300} y={405} text="non-superimposable, like left and right hands" color={C.electron} w={360} />
      </Reveal>

      <Reveal show={is("tacticity")}>
        <Title>Tacticity: how side groups line up</Title>
        {(
          [
            ["isotactic", "all on one side", "iso", 120],
            ["syndiotactic", "alternating", "syndio", 235],
            ["atactic", "random", "a", 350],
          ] as [string, string, Tact, number][]
        ).map(([name, sub, kind, y], i) => (
          <motion.g key={name} initial={false} animate={{ opacity: is("tacticity") ? 1 : 0 }} transition={{ delay: is("tacticity") ? i * 0.3 : 0 }}>
            <Chain y={y} kind={kind} />
            <Label x={580} y={y - 30} anchor="end" size={15} weight={700} color={C.accent}>
              {name}
            </Label>
            <Label x={580} y={y - 12} anchor="end" size={12} color={C.dim}>
              {sub}
            </Label>
          </motion.g>
        ))}
        <Label x={300} y={428} size={12} color={C.dim}>
          green = side group (e.g. CH₃ in polypropylene, phenyl in polystyrene)
        </Label>
      </Reveal>

      <Reveal show={is("packing")}>
        <Title>Regular chains crystallise, random ones cannot</Title>
        <rect x={40} y={80} width={240} height={240} rx={14} fill="#111a2c" stroke={C.accent} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M60 ${110 + i * 36} q 25 -14 50 0 t 50 0 t 50 0 t 50 0`} fill="none" stroke={C.accent} strokeWidth={3} />
        ))}
        <Label x={160} y={345} size={15} weight={700} color={C.accent}>
          isotactic polypropylene
        </Label>
        <Label x={160} y={366} size={13} color={C.dim}>
          packs into crystals · Tm ≈ 165 °C
        </Label>
        <rect x={320} y={80} width={240} height={240} rx={14} fill="#111a2c" stroke={C.hot} />
        {[
          "M340 120 C380 90 400 200 450 150 S520 100 540 160",
          "M345 220 C390 180 420 300 470 240 S530 200 545 280",
          "M350 300 C380 250 430 280 460 200 S520 260 540 120",
          "M360 160 C400 260 440 120 500 190",
        ].map((d, i) => (
          <path key={i} d={d} fill="none" stroke={C.hot} strokeWidth={3} opacity={0.85} />
        ))}
        <Label x={440} y={345} size={15} weight={700} color={C.hot}>
          atactic polystyrene
        </Label>
        <Label x={440} y={366} size={13} color={C.dim}>
          amorphous glass · Tg ≈ 100 °C
        </Label>
        <Chip x={300} y={415} text="synthesis route → tacticity → properties" color={C.electron} w={340} />
      </Reveal>
    </Stage>
  );
}
