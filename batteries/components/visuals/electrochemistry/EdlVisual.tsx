"use client";

import { motion } from "framer-motion";
import { Axes, C, DrawPath, Ion, Label, Reveal, Stage, makeScale } from "../primitives";

const SURFACE = 110;
const IHP = 130;
const OHP = 176;
const ROWS = [95, 145, 195, 245, 295, 345];

// Diffuse-layer ions (net excess of cations close to the surface, fading out into the bulk).
const DIFFUSE: { x: number; y: number; sign: "+" | "−" }[] = [
  { x: 225, y: 120, sign: "+" },
  { x: 240, y: 230, sign: "+" },
  { x: 230, y: 320, sign: "+" },
  { x: 285, y: 170, sign: "+" },
  { x: 300, y: 275, sign: "−" },
  { x: 345, y: 110, sign: "−" },
  { x: 360, y: 215, sign: "+" },
  { x: 350, y: 335, sign: "+" },
  { x: 420, y: 150, sign: "−" },
  { x: 430, y: 260, sign: "+" },
  { x: 480, y: 110, sign: "+" },
  { x: 500, y: 200, sign: "−" },
  { x: 470, y: 330, sign: "−" },
  { x: 540, y: 280, sign: "+" },
];

function potential(x: number, concentrated: boolean) {
  const drop = concentrated ? 0.12 : 0.45;
  const debye = concentrated ? 18 : 70;
  if (x <= OHP) return 1 - ((1 - drop) * (x - SURFACE)) / (OHP - SURFACE);
  return drop * Math.exp(-(x - OHP) / debye);
}

const potBox = { x: SURFACE, y: 90, w: 450, h: 290 };
const potScale = makeScale(potBox, [SURFACE, SURFACE + 450], [0, 1.05]);
const potPts = (conc: boolean) =>
  Array.from({ length: 200 }, (_, i) => {
    const x = SURFACE + (i / 199) * 450;
    return [x, potential(x, conc)] as [number, number];
  });

// C_dl = (1/C_H + 1/C_diff)^-1, Gouy–Chapman C_diff = C0·cosh(fE/2)
const f = 96485 / (8.314 * 298.15);
const capBox = { x: 90, y: 80, w: 460, h: 290 };
const capScale = makeScale(capBox, [-0.3, 0.3], [0, 28]);
const capPts = (c0: number) =>
  Array.from({ length: 160 }, (_, i) => {
    const e = -0.3 + (i / 159) * 0.6;
    const cd = c0 * Math.cosh((f * e) / 2);
    return [e, 1 / (1 / 25 + 1 / cd)] as [number, number];
  });

export default function EdlVisual({ visual }: { visual: string }) {
  const stern = visual !== "edl-helmholtz";
  const showIons = visual === "edl-helmholtz" || visual === "edl-stern" || visual === "edl-potential";
  const dimIons = visual === "edl-potential";

  return (
    <Stage label="Electric double layer">
      <motion.g initial={false} animate={{ opacity: showIons ? (dimIons ? 0.28 : 1) : 0 }} transition={{ duration: 0.5 }}>
        {/* electrode with negative surface charge */}
        <rect x={30} y={70} width={SURFACE - 30} height={300} fill={C.zinc} opacity={0.5} />
        <Label x={70} y={395} size={14} weight={700}>
          metal (−)
        </Label>
        {ROWS.map((y) => (
          <Ion key={y} x={SURFACE - 10} y={y} sign="−" color={C.electron} r={8} />
        ))}

        {/* IHP: specifically adsorbed ions and solvent */}
        <Reveal show={stern}>
          {ROWS.map((y, i) =>
            i % 3 === 1 ? (
              <Ion key={y} x={IHP} y={y + 25} sign="−" color={C.anion} r={9} />
            ) : (
              <g key={y} transform={`translate(${IHP} ${y + 25}) rotate(${i % 2 ? 20 : -20})`}>
                <ellipse rx={9} ry={6} fill="#7dd3fc" />
                <circle cx={-6} cy={-5} r={3} fill="#e0f2fe" />
                <circle cx={6} cy={-5} r={3} fill="#e0f2fe" />
              </g>
            ),
          )}
          {DIFFUSE.map((d) => (
            <Ion key={`${d.x}-${d.y}`} x={d.x} y={d.y} sign={d.sign} color={d.sign === "+" ? C.cation : C.anion} r={10} />
          ))}
        </Reveal>

        {/* cations: a single Helmholtz plane, then solvated at the OHP */}
        {ROWS.map((y) => (
          <motion.g key={y} initial={false} animate={{ x: stern ? OHP : 150 }} transition={{ duration: 0.7 }}>
            <motion.circle cx={0} cy={y} r={16} fill="none" stroke="#7dd3fc" strokeDasharray="3 3" initial={false} animate={{ opacity: stern ? 0.8 : 0 }} />
            <Ion x={0} y={y} sign="+" color={C.cation} r={10} />
          </motion.g>
        ))}

        <Reveal show={!stern}>
          <line x1={150} y1={70} x2={150} y2={370} stroke={C.cation} strokeDasharray="4 4" />
          <Label x={330} y={200} size={16} weight={700}>
            Helmholtz: a parallel-plate capacitor
          </Label>
          <Label x={330} y={225} size={14} color={C.dim}>
            charge on the metal, equal and opposite ions
          </Label>
          <Label x={330} y={245} size={14} color={C.dim}>
            one ion radius away
          </Label>
        </Reveal>

        <Reveal show={visual === "edl-stern"}>
          <line x1={IHP} y1={60} x2={IHP} y2={380} stroke={C.anion} strokeDasharray="4 4" />
          <line x1={OHP} y1={60} x2={OHP} y2={380} stroke={C.cation} strokeDasharray="4 4" />
          <Label x={IHP - 4} y={50} size={13} color={C.anion} anchor="end">
            IHP
          </Label>
          <Label x={OHP + 4} y={50} size={13} color={C.cation} anchor="start">
            OHP
          </Label>
          <Label x={380} y={50} size={13} color={C.dim}>
            diffuse layer → bulk
          </Label>
          <Label x={150} y={420} size={13}>
            compact (Stern) layer
          </Label>
          <Label x={400} y={420} size={13}>
            diffuse (Gouy–Chapman) layer
          </Label>
        </Reveal>
      </motion.g>

      {/* potential profile, drawn over the same x positions */}
      <Reveal show={visual === "edl-potential"}>
        <Axes box={potBox} xLabel="distance from electrode →" yLabel="|φ − φ(bulk)|" />
        <line x1={OHP} y1={potBox.y} x2={OHP} y2={potBox.y + potBox.h} stroke={C.cation} strokeDasharray="4 4" />
        <DrawPath d={potScale.path(potPts(false))} show={visual === "edl-potential"} color={C.accent} width={3.5} />
        <DrawPath d={potScale.path(potPts(true))} show={visual === "edl-potential"} color={C.electron} width={2.5} dash="6 5" delay={0.6} />
        <Label x={OHP - 10} y={potBox.y + potBox.h + 22} size={13} color={C.cation} anchor="end">
          OHP
        </Label>
        <Label x={250} y={200} size={14} color={C.accent} anchor="start">
          linear in compact layer, then exponential decay
        </Label>
        <Label x={250} y={225} size={14} color={C.electron} anchor="start">
          high concentration: thin diffuse layer
        </Label>
      </Reveal>

      {/* capacitance vs potential */}
      <Reveal show={visual === "edl-capacitance"}>
        <Axes box={capBox} xLabel="E − E(pzc) (V)" yLabel="C_dl (µF/cm²)" />
        <line x1={capScale.sx(0)} y1={capBox.y} x2={capScale.sx(0)} y2={capBox.y + capBox.h} stroke={C.dim} strokeDasharray="4 4" />
        <DrawPath d={capScale.path(capPts(5))} show={visual === "edl-capacitance"} color={C.accent} width={3.5} />
        <DrawPath d={capScale.path(capPts(60))} show={visual === "edl-capacitance"} color={C.electron} width={2.5} dash="6 5" delay={0.5} />
        <Label x={capScale.sx(0)} y={capScale.sy(4.2) + 28} size={14} color={C.accent} weight={700}>
          minimum at pzc
        </Label>
        <Label x={capScale.sx(-0.3) + 10} y={capScale.sy(26) - 6} anchor="start" size={13} color={C.dim}>
          approaches C_H (compact layer)
        </Label>
        <Label x={capBox.x + 10} y={410} anchor="start" size={13} color={C.accent}>
          dilute electrolyte
        </Label>
        <Label x={capBox.x + 150} y={410} anchor="start" size={13} color={C.electron}>
          concentrated
        </Label>
        <Label x={capBox.x + 290} y={410} anchor="start" size={13} color={C.dim}>
          + adsorption · carbon DOS
        </Label>
        <Label x={300} y={440} size={13} color={C.dim}>
          1/C_dl = 1/C_H + 1/C_diff
        </Label>
      </Reveal>
    </Stage>
  );
}
