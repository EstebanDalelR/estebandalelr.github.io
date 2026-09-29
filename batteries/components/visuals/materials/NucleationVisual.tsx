"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

const box = { x: 80, y: 60, w: 430, h: 300 };
const Y = 8;
const s = makeScale(box, [0, 1.4], [-Y, Y]);
const GAMMA = 1;

/** Points of f(r) for r in [0, 1.4], stopping when the curve leaves the plot. */
function curve(f: (r: number) => number) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 140; i++) {
    const r = i / 100;
    const v = f(r);
    if (Math.abs(v) > Y) break;
    pts.push([r, v]);
  }
  return s.path(pts);
}
const vol = (dGv: number) => (r: number) => (4 / 3) * Math.PI * r ** 3 * dGv;
const surf = (r: number) => 4 * Math.PI * r * r * GAMMA;
const total = (dGv: number) => (r: number) => vol(dGv)(r) + surf(r);

const DGV = -3;
const rStar = (dGv: number) => (-2 * GAMMA) / dGv;
const gStar = (dGv: number) => (16 * Math.PI * GAMMA ** 3) / (3 * dGv * dGv);

const FAMILY = [
  { dGv: -1.6, label: "small ΔT", color: C.hot },
  { dGv: -3, label: "medium ΔT", color: C.electron },
  { dGv: -6, label: "large ΔT", color: C.lithium },
];

export default function NucleationVisual({ visual }: { visual: string }) {
  const plot = visual !== "heterogeneous";
  const single = visual === "balance" || visual === "critical";
  const under = visual === "undercooling";

  return (
    <Stage label="Nucleation">
      <Reveal show={plot}>
        <Axes box={box} xLabel="nucleus radius r" yLabel="ΔG" origin={{ y: s.sy(0) }} xLabelDy={-12} />
        <motion.g initial={false} animate={{ opacity: under ? 0.18 : 1 }}>
          <DrawPath d={curve(surf)} show={plot} color={C.hot} width={2} dash="6 5" />
          <DrawPath d={curve(vol(DGV))} show={plot} color={C.lfp} width={2} dash="6 5" delay={0.2} />
          <DrawPath d={curve(total(DGV))} show={plot} color={C.accent} width={3.5} delay={0.4} />
        </motion.g>
        <Reveal show={single}>
          <Label x={s.sx(0.62)} y={s.sy(6.8)} anchor="end" size={13} color={C.hot}>
            surface: + 4πr²γ
          </Label>
          <Label x={s.sx(0.55)} y={s.sy(-5.5)} anchor="end" size={13} color={C.lfp}>
            volume: (4/3)πr³ ΔG_v &lt; 0
          </Label>
          <Label x={s.sx(0.95)} y={s.sy(1.6)} anchor="start" size={13} color={C.accent} weight={700}>
            total
          </Label>
        </Reveal>

        <Reveal show={visual === "critical"}>
          <line x1={s.sx(rStar(DGV))} x2={s.sx(rStar(DGV))} y1={s.sy(gStar(DGV))} y2={s.sy(0)} stroke={C.electron} strokeDasharray="4 4" />
          <line x1={box.x} x2={s.sx(rStar(DGV))} y1={s.sy(gStar(DGV))} y2={s.sy(gStar(DGV))} stroke={C.electron} strokeDasharray="4 4" />
          <circle cx={s.sx(rStar(DGV))} cy={s.sy(gStar(DGV))} r={6} fill={C.electron} />
          <Label x={s.sx(rStar(DGV))} y={s.sy(0) + 18} size={14} color={C.electron} weight={700}>
            r*
          </Label>
          <Label x={box.x + 8} y={s.sy(gStar(DGV)) - 8} anchor="start" size={14} color={C.electron} weight={700}>
            ΔG* (barrier)
          </Label>
          <Label x={s.sx(0.3)} y={s.sy(0) + 40} size={12} color={C.dim}>
            r &lt; r*: dissolves
          </Label>
          <Label x={s.sx(0.85)} y={s.sy(0) + 40} size={12} color={C.dim}>
            r &gt; r*: grows
          </Label>
          <Chip x={300} y={415} text="r* = −2γ / ΔG_v    ΔG* = 16πγ³ / (3ΔG_v²)" w={360} />
        </Reveal>

        <Reveal show={under}>
          <DrawPath d={curve(surf)} show={under} color={C.dim} width={2.5} />
          <Label x={s.sx(0.72)} y={s.sy(7.2)} anchor="end" size={12} color={C.dim}>
            ΔT = 0: no maximum, infinite barrier
          </Label>
          {FAMILY.map((f, i) => (
            <g key={f.label}>
              <DrawPath d={curve(total(f.dGv))} show={under} color={f.color} width={3} delay={0.2 + i * 0.25} />
              <circle cx={s.sx(rStar(f.dGv))} cy={s.sy(gStar(f.dGv))} r={5} fill={f.color} />
              <Label x={95} y={300 + i * 22} anchor="start" size={13} color={f.color}>
                {f.label}
              </Label>
            </g>
          ))}
          <Chip x={300} y={415} text="more undercooling → smaller r*, lower ΔG* ∝ 1/ΔT²" color={C.lithium} w={400} />
        </Reveal>
      </Reveal>

      <Reveal show={visual === "heterogeneous"}>
        <Label x={155} y={45} size={15} weight={700}>
          Nucleating on a wall
        </Label>
        <Label x={155} y={75} size={12} color={C.dim}>
          homogeneous: full sphere
        </Label>
        <circle cx={155} cy={125} r={36} fill={C.lfp} opacity={0.75} />
        <Label x={155} y={200} size={12} color={C.dim}>
          heterogeneous: a cap, less surface
        </Label>
        <path d="M86 270 A 80 80 0 0 1 224 270 Z" fill={C.lfp} opacity={0.75} />
        <line x1={30} x2={280} y1={270} y2={270} stroke={C.zinc} strokeWidth={4} />
        <rect x={30} y={272} width={250} height={26} fill={C.zinc} opacity={0.25} />
        <line x1={86} y1={270} x2={116} y2={218} stroke={C.electron} strokeWidth={2} />
        <path d="M108 270 A 22 22 0 0 0 97 251" fill="none" stroke={C.electron} strokeWidth={2} />
        <Label x={120} y={260} size={14} color={C.electron} weight={700}>
          θ
        </Label>
        <Label x={155} y={316} size={12} color={C.dim}>
          mould wall or particle
        </Label>
        <Chip x={155} y={352} text="ΔG*_het = f(θ) · ΔG*_hom" w={230} />
        <Label x={155} y={385} size={12} color={C.dim}>
          f(θ) = (2 − 3cosθ + cos³θ)/4 &lt; 1
        </Label>

        <line x1={300} x2={300} y1={40} y2={400} stroke={C.grid} strokeWidth={2} />

        <Label x={445} y={45} size={15} weight={700}>
          Grain size
        </Label>
        {[
          { x: 320, n: 2, label: "few nuclei" },
          { x: 460, n: 6, label: "nucleation agents" },
        ].map((g) => (
          <g key={g.x}>
            <rect x={g.x} y={80} width={120} height={120} fill={C.graphite} opacity={0.35} stroke={C.dim} />
            {Array.from({ length: g.n - 1 }, (_, i) => (
              <g key={i}>
                <line x1={g.x + ((i + 1) * 120) / g.n} x2={g.x + ((i + 1) * 120) / g.n + 6} y1={80} y2={200} stroke={C.electron} strokeWidth={1.5} />
                <line x1={g.x} x2={g.x + 120} y1={80 + ((i + 1) * 120) / g.n} y2={80 + ((i + 1) * 120) / g.n - 5} stroke={C.electron} strokeWidth={1.5} />
              </g>
            ))}
            <Label x={g.x + 60} y={222} size={12}>
              {g.label}
            </Label>
          </g>
        ))}
        <Label x={380} y={242} size={12} color={C.dim}>
          large grains
        </Label>
        <Label x={520} y={242} size={12} color={C.dim}>
          many small grains
        </Label>
        <Label x={445} y={300} size={13}>
          a few degrees of undercooling
        </Label>
        <Label x={445} y={320} size={13}>
          instead of hundreds
        </Label>
        <Chip x={445} y={360} text="small grains → stronger" color={C.lithium} w={220} />
        <Label x={445} y={392} size={12} color={C.dim}>
          e.g. TiN particles in a casting
        </Label>
      </Reveal>
    </Stage>
  );
}
