"use client";

import { motion } from "framer-motion";
import { C, Chip, Label, Reveal, Stage } from "../primitives";

const SEQ = ["A", "B", "C", "A", "B", "A", "B", "C"] as const;
const COL = { A: C.lfp, B: C.copper, C: C.lithium } as const;

function Grid({ x, y, n = 4, gap = 22, skip, extra }: { x: number; y: number; n?: number; gap?: number; skip?: number; extra?: [number, number, string] }) {
  return (
    <g>
      {Array.from({ length: n * n }, (_, i) =>
        i === skip ? (
          <circle key={i} cx={x + (i % n) * gap} cy={y + Math.floor(i / n) * gap} r={7} fill="none" stroke={C.hot} strokeDasharray="3 2" />
        ) : (
          <circle key={i} cx={x + (i % n) * gap} cy={y + Math.floor(i / n) * gap} r={7} fill={C.zinc} />
        ),
      )}
      {extra && <circle cx={extra[0]} cy={extra[1]} r={5} fill={extra[2]} />}
    </g>
  );
}

// hexagonal neighbours of a (111) surface atom: 6 in-plane + 3 below; 3 above are missing
const inPlane = Array.from({ length: 6 }, (_, i) => [Math.cos((i * Math.PI) / 3) * 70, Math.sin((i * Math.PI) / 3) * 70]);
const layerOffsets = [0, 2, 4].map((i) => [Math.cos((i * Math.PI) / 3 + Math.PI / 6) * 40, Math.sin((i * Math.PI) / 3 + Math.PI / 6) * 40]);

export default function DefectsVisual({ visual }: { visual: string }) {
  const disl = visual === "dislocations";
  return (
    <Stage label="Defects, stacking faults and surface energy">
      <Reveal show={visual === "dimensions"}>
        {[
          { t: "0D", s: "vacancy · interstitial · substitution", c: C.hot },
          { t: "1D", s: "dislocations", c: C.electron },
          { t: "2D", s: "surfaces · grain boundaries · stacking faults", c: C.anion },
          { t: "3D", s: "pores · precipitates", c: C.accent },
        ].map((d, i) => {
          const x = i % 2 === 0 ? 30 : 310;
          const y = i < 2 ? 40 : 240;
          return (
            <g key={d.t}>
              <rect x={x} y={y} width={260} height={180} rx={14} fill={d.c} opacity={0.08} stroke={d.c} />
              <Label x={x + 18} y={y + 30} size={20} weight={800} color={d.c} anchor="start">
                {d.t}
              </Label>
              <Label x={x + 130} y={y + 166} size={12} color={C.dim}>
                {d.s}
              </Label>
              {i === 0 && <Grid x={x + 90} y={y + 55} skip={5} extra={[x + 90 + 55, y + 55 + 33, C.hot]} />}
              {i === 1 && (
                <g>
                  {[0, 1, 2, 3, 4].map((c) => (
                    <line key={c} x1={x + 70 + c * 30} y1={y + (c === 2 ? 90 : 45)} x2={x + 70 + c * 30} y2={y + 140} stroke={C.zinc} strokeWidth={4} />
                  ))}
                  <Label x={x + 130} y={y + 82} size={18} color={C.electron} weight={800}>
                    ⊥
                  </Label>
                </g>
              )}
              {i === 2 && (
                <g>
                  <Grid x={x + 50} y={y + 55} n={4} gap={20} />
                  <g transform={`rotate(20 ${x + 190} ${y + 90})`}>
                    <Grid x={x + 150} y={y + 55} n={4} gap={20} />
                  </g>
                  <line x1={x + 132} y1={y + 45} x2={x + 132} y2={y + 140} stroke={C.anion} strokeWidth={2} strokeDasharray="4 3" />
                </g>
              )}
              {i === 3 && (
                <g>
                  <Grid x={x + 80} y={y + 50} n={5} gap={22} />
                  <circle cx={x + 124} cy={y + 94} r={24} fill={C.accent} opacity={0.8} />
                </g>
              )}
            </g>
          );
        })}
      </Reveal>

      <Reveal show={visual === "stacking-fault"}>
        <Label x={300} y={40} size={16} weight={700}>
          Stacking fault in a ccp metal
        </Label>
        {SEQ.map((l, i) => {
          const wrong = i === 5;
          const y = 390 - i * 42;
          return (
            <g key={i}>
              <rect x={170} y={y} width={180} height={34} rx={6} fill={COL[l]} opacity={0.85} stroke={wrong ? C.hot : "none"} strokeWidth={3} />
              <Label x={260} y={y + 23} size={16} weight={800} color="#0b1220">
                {l}
              </Label>
              <Label x={160} y={y + 22} size={12} color={C.dim} anchor="end">
                {`${i + 1}`}
              </Label>
              {wrong && (
                <Label x={382} y={y + 22} size={13} color={C.hot} anchor="start" weight={700}>
                  ← should be C
                </Label>
              )}
            </g>
          );
        })}
        <path d="M358 140 L372 140 L372 296 L358 296" fill="none" stroke={C.electron} strokeWidth={2} />
        <Label x={382} y={258} size={13} color={C.electron} anchor="start">
          locally ABAB
        </Label>
        <Label x={382} y={276} size={13} color={C.electron} anchor="start">
          = hcp stacking
        </Label>
        <Label x={90} y={140} size={13} color={C.dim}>
          correct: ABCABC…
        </Label>
        <Label x={90} y={160} size={13} color={C.hot}>
          here: ABCAB A BC
        </Label>
      </Reveal>

      <Reveal show={visual === "surface"}>
        <Label x={300} y={40} size={16} weight={700}>
          A (111) surface atom in a ccp metal
        </Label>
        <g transform="translate(200 220)">
          {layerOffsets.map(([dx, dy], i) => (
            <circle key={`b${i}`} cx={dx} cy={dy + 18} r={24} fill={C.lfp} opacity={0.6} />
          ))}
          {inPlane.map(([dx, dy], i) => (
            <circle key={`p${i}`} cx={dx} cy={dy} r={26} fill={C.zinc} />
          ))}
          <circle cx={0} cy={0} r={26} fill={C.electron} />
          {layerOffsets.map(([dx, dy], i) => (
            <circle key={`a${i}`} cx={-dx} cy={-dy - 18} r={22} fill="none" stroke={C.hot} strokeWidth={2} strokeDasharray="4 3" />
          ))}
        </g>
        <g transform="translate(360 110)">
          <Label x={0} y={0} size={14} anchor="start">
            6 in the same plane
          </Label>
          <Label x={0} y={26} size={14} anchor="start" color={C.lfp}>
            3 in the layer below
          </Label>
          <Label x={0} y={52} size={14} anchor="start" color={C.hot}>
            3 above: missing
          </Label>
          <Label x={0} y={96} size={16} weight={700} anchor="start">
            9 of 12 neighbours
          </Label>
          <Label x={0} y={122} size={16} weight={700} anchor="start" color={C.hot}>
            3/12 = 25 % bonds lost
          </Label>
        </g>
        <Chip x={300} y={400} text="stronger bonds → higher surface energy and higher melting point" color={C.electron} w={460} />
      </Reveal>

      <Reveal show={disl}>
        <Label x={300} y={40} size={16} weight={700}>
          Plastic deformation = dislocations gliding
        </Label>
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 12 }, (_, c) => <circle key={`${r}-${c}`} cx={70 + c * 38} cy={120 + r * 38} r={9} fill={C.zinc} />),
        )}
        <line x1={55} y1={215} x2={500} y2={215} stroke={C.dim} strokeDasharray="5 4" />
        <Label x={506} y={219} size={12} color={C.dim} anchor="start">
          slip plane
        </Label>
        <motion.g initial={false} animate={{ x: disl ? [0, 190, 190] : 0 }} transition={{ repeat: Infinity, duration: 4, times: [0, 0.6, 1] }}>
          <Label x={127} y={224} size={24} weight={800} color={C.electron}>
            ⊥
          </Label>
        </motion.g>
        <circle cx={390} cy={215} r={24} fill={C.accent} opacity={0.85} />
        <Label x={390} y={306} size={13} color={C.accent} weight={700}>
          precipitate blocks it
        </Label>
        <Label x={300} y={340} size={14} color={C.dim}>
          obstacles: grain boundaries · solute atoms · precipitates
        </Label>
        <Chip x={300} y={390} text="block the dislocations → harder, stronger material" color={C.accent} w={400} />
      </Reveal>
    </Stage>
  );
}
