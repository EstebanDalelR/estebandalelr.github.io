"use client";

import { motion } from "framer-motion";
import { butlerVolmer } from "@batteries/lib/simulate";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

const box = { x: 70, y: 60, w: 470, h: 290 };
const originY = box.y + box.h / 2;
const originX = box.x + box.w / 2;

/* ---- normalised Butler–Volmer (j0 = 1, beta = 0.5) ---- */
const bvScale = makeScale(box, [-0.12, 0.12], [-11, 11]);
const F = 96485 / (8.314 * 298.15);
const etas = Array.from({ length: 121 }, (_, i) => -0.12 + (i / 120) * 0.24);
const total = bvScale.path(etas.map((e) => [e, butlerVolmer(e, 1, 0.5)]));
const anodic = bvScale.path(etas.map((e) => [e, Math.min(11, Math.exp(0.5 * F * e))]));
const cathodic = bvScale.path(etas.map((e) => [e, Math.max(-11, -Math.exp(-0.5 * F * e))]));

/* ---- system A vs B in mA/cm2 ---- */
const cmpScale = makeScale(box, [-0.15, 0.15], [-7, 7]);
const etas2 = Array.from({ length: 151 }, (_, i) => -0.15 + (i / 150) * 0.3);
const sysA = cmpScale.path(etas2.map((e) => [e, butlerVolmer(e, 4e-5, 0.3) * 1000]));
const sysB = cmpScale.path(etas2.map((e) => [e, butlerVolmer(e, 3e-4, 0.47) * 1000]));

/* ---- particles ---- */
const SMALL = Array.from({ length: 36 }, (_, i) => ({ x: 380 + (i % 6) * 26, y: 125 + Math.floor(i / 6) * 26 }));

export default function KineticsVisual({ visual }: { visual: string }) {
  const bv = visual === "bv-curve";
  const cmp = visual === "bv-compare";
  const particles = visual === "particles" || visual === "particles-downside";
  const downside = visual === "particles-downside";

  return (
    <Stage label="Butler–Volmer kinetics and particle size">
      <Reveal show={bv || cmp}>
        <Axes box={box} xLabel="overpotential η" yLabel="j" origin={{ x: originX, y: originY }} />
        <Label x={box.x + 6} y={originY - 10} size={12} color={C.dim} anchor="start">
          reduction
        </Label>
        <Label x={box.x + box.w - 6} y={originY - 10} size={12} color={C.dim} anchor="end">
          oxidation
        </Label>
      </Reveal>

      <Reveal show={bv}>
        <DrawPath d={anodic} show={bv} color={C.hot} width={2} dash="6 5" />
        <DrawPath d={cathodic} show={bv} color={C.lfp} width={2} dash="6 5" />
        <DrawPath d={total} show={bv} color={C.accent} width={3.5} delay={0.3} />
        <circle cx={originX} cy={bvScale.sy(1)} r={5} fill={C.hot} />
        <circle cx={originX} cy={bvScale.sy(-1)} r={5} fill={C.lfp} />
        <Label x={originX + 10} y={bvScale.sy(1) - 8} size={13} color={C.hot} anchor="start">
          +j₀
        </Label>
        <Label x={originX - 10} y={bvScale.sy(-1) + 18} size={13} color={C.lfp} anchor="end">
          −j₀
        </Label>
        <Label x={bvScale.sx(0.105)} y={bvScale.sy(9)} size={13} color={C.accent} anchor="end">
          net current
        </Label>
        <Chip x={300} y={400} text="at η = 0: forward = backward = j₀, net = 0" color={C.accent} w={330} />
        <Label x={300} y={432} size={13} color={C.dim}>
          β = 0.5 → symmetric branches
        </Label>
      </Reveal>

      <Reveal show={cmp}>
        <DrawPath d={sysA} show={cmp} color={C.hot} width={3} />
        <DrawPath d={sysB} show={cmp} color={C.lithium} width={3.5} delay={0.3} />
        <Label x={box.x + box.w - 4} y={originY + 52} size={13} color={C.hot} anchor="end">
          A: j₀ = 4·10⁻⁵ A/cm², β = 0.3
        </Label>
        <Label x={box.x + box.w - 4} y={originY + 76} size={13} color={C.lithium} anchor="end">
          B: j₀ = 3·10⁻⁴ A/cm², β = 0.47
        </Label>
        <Label x={box.x + 4} y={box.y + box.h - 8} size={12} color={C.dim} anchor="start">
          j in mA/cm²
        </Label>
        <Chip x={300} y={400} text="choose B: ~10× higher j₀, near-symmetric β" color={C.lithium} w={340} />
        <Label x={300} y={432} size={13} color={C.dim}>
          small overpotential on both charge and discharge
        </Label>
      </Reveal>

      <Reveal show={particles}>
        <Label x={150} y={60} size={16} weight={700}>
          1 µm particles
        </Label>
        <Label x={458} y={60} size={16} weight={700}>
          10 nm particles
        </Label>
        <Label x={458} y={80} size={12} color={C.dim}>
          (not to scale)
        </Label>
        <g transform="translate(150 200)">
          <circle r={85} fill={C.lithium} />
          <motion.circle
            fill={C.lfp}
            initial={false}
            animate={{ r: particles ? [85, 55] : 85 }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
          />
          <motion.circle
            r={88}
            fill="none"
            stroke={C.copper}
            initial={false}
            animate={{ opacity: downside ? 0.9 : 0 }}
            strokeWidth={4}
          />
        </g>
        {SMALL.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={10} fill={C.lithium} />
            <motion.circle
              cx={p.x}
              cy={p.y}
              fill={C.lfp}
              initial={false}
              animate={{ r: particles ? [10, 0] : 10 }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 3.2, delay: (i % 6) * 0.03 }}
            />
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={12}
              fill="none"
              stroke={C.copper}
              strokeWidth={3}
              initial={false}
              animate={{ opacity: downside ? 0.9 : 0 }}
              transition={{ delay: downside ? 0.2 + i * 0.01 : 0 }}
            />
          </g>
        ))}

        <Reveal show={!downside}>
          <Label x={300} y={340} size={16} weight={700}>
            same 50 mg → same theoretical capacity
          </Label>
          <Label x={300} y={368} size={15} color={C.accent}>
            t ~ L²/D → (1 µm / 10 nm)² = 10⁴ × faster
          </Label>
          <Label x={300} y={396} size={14}>
            ~100× more surface → lower current density
          </Label>
          <Chip x={300} y={428} text="higher power, more capacity usable at high rate" color={C.lithium} w={370} />
        </Reveal>
        <Reveal show={downside}>
          <Label x={300} y={340} size={16} weight={700} color={C.copper}>
            more surface → more SEI (orange) and side reactions
          </Label>
          <Label x={300} y={368} size={15}>
            lower coulombic efficiency
          </Label>
          <Label x={300} y={396} size={15}>
            lower packing density → lower Wh/L
          </Label>
        </Reveal>
      </Reveal>
    </Stage>
  );
}
