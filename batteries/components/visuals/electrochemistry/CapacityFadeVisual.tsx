"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

/* ---------- rate test bar chart ---------- */
const barBox = { x: 80, y: 70, w: 480, h: 270 };
const RATES = [
  { name: "C/10", cap: 160 },
  { name: "C/5", cap: 155 },
  { name: "C/2", cap: 144 },
  { name: "1C", cap: 128 },
  { name: "2C", cap: 104 },
  { name: "5C", cap: 62 },
  { name: "C/10", cap: 158 },
];
const barScale = makeScale(barBox, [0, RATES.length], [0, 180]);

/* ---------- discharge curves for the iR step ---------- */
const vBox = { x: 90, y: 60, w: 450, h: 280 };
const vs = makeScale(vBox, [0, 170], [2.6, 3.9]);
const CUT_LOW = 2.8;
const CUT_HIGH = 3.8;

function ocv(x: number) {
  return 3.4 - 0.15 * (x - 0.5) + 0.1 * Math.log((1 - x + 1e-3) / (x + 1e-3));
}
function discharge(iR: number): [number, number][] {
  const pts: [number, number][] = [];
  // Start at x = 0.04 so the discharge begins just below the upper cut-off.
  for (let x = 0.04; x <= 0.999; x += 0.004) {
    const v = ocv(x) - iR;
    if (v < CUT_LOW) {
      pts.push([x * 160, CUT_LOW]);
      break;
    }
    pts.push([x * 160, v]);
  }
  return pts;
}
const slow = discharge(0.02);
const fast = discharge(0.35);
const fastEnd = fast[fast.length - 1][0];

/* ---------- particle cross-sections ---------- */
function Particle({ x, label, shell, show }: { x: number; label: string; shell: number; show: boolean }) {
  const R = 90;
  return (
    <g transform={`translate(${x} 210)`}>
      <circle r={R} fill={C.lithium} opacity={0.85} />
      <motion.circle initial={false} animate={{ r: show ? R - shell : R }} transition={{ duration: 1.4, ease: "easeOut" }} fill={C.lfp} />
      <Label x={0} y={R + 30} size={15} weight={700}>
        {label}
      </Label>
      <Label x={0} y={R + 50} size={13} color={C.dim}>
        {`lithiated shell ≈ ${Math.round((shell / R) * 100)}% of radius`}
      </Label>
    </g>
  );
}

const CHECKS = [
  "Measure / compensate the iR drop",
  "Impedance spectroscopy (EIS)",
  "Three-electrode cell: which electrode limits?",
  "Vary mass loading and particle size",
  "CV at several scan rates",
  "Half cells vs full cells",
  "Post mortem: SEM, XPS …",
];

export default function CapacityFadeVisual({ visual }: { visual: string }) {
  const bars = visual === "rate-test" || visual === "rate-recover";
  const recover = visual === "rate-recover";
  const ir = visual === "rate-ir";
  const diffusion = visual === "rate-diffusion";
  const analyse = visual === "rate-analyse";

  return (
    <Stage label="Capacity at increasing rates">
      <Reveal show={bars}>
        <Axes box={barBox} xLabel="cycling rate →" yLabel="capacity (mAh/g)" xLabelDy={40} />
        {[50, 100, 150].map((v) => (
          <g key={v}>
            <line x1={barBox.x} x2={barBox.x + barBox.w} y1={barScale.sy(v)} y2={barScale.sy(v)} stroke={C.grid} />
            <Label x={barBox.x - 8} y={barScale.sy(v) + 4} size={12} color={C.dim} anchor="end">
              {v}
            </Label>
          </g>
        ))}
        {RATES.map((r, i) => {
          const last = i === RATES.length - 1;
          const color = last ? C.lithium : C.accent;
          return (
            <g key={i}>
              {[0, 1, 2].map((k) => {
                const cap = r.cap - k * (i === 5 ? 3 : 1);
                const x = barScale.sx(i) + 10 + k * 18;
                return (
                  <motion.rect
                    key={k}
                    x={x}
                    width={14}
                    rx={2}
                    fill={color}
                    initial={false}
                    animate={{
                      y: bars ? barScale.sy(cap) : barScale.sy(0),
                      height: bars ? barScale.sy(0) - barScale.sy(cap) : 0,
                      opacity: recover && !last && i !== 0 ? 0.35 : 0.9,
                    }}
                    transition={{ duration: 0.7, delay: bars ? i * 0.08 : 0 }}
                  />
                );
              })}
              <Label x={barScale.sx(i) + 35} y={barBox.y + barBox.h + 18} size={12} color={last ? C.lithium : C.dim}>
                {r.name}
              </Label>
            </g>
          );
        })}
        <Reveal show={recover}>
          <line
            x1={barScale.sx(6) + 4}
            x2={barScale.sx(7) - 4}
            y1={barScale.sy(118)}
            y2={barScale.sy(118)}
            stroke={C.hot}
            strokeWidth={3}
            strokeDasharray="6 4"
          />
          <Label x={barScale.sx(6) + 35} y={barScale.sy(118) + 18} size={12} color={C.hot}>
            not back?
          </Label>
          <Chip x={200} y={24} text="back to full → loss was kinetic" color={C.lithium} w={250} />
          <Chip x={430} y={24} text="stays low → degradation" color={C.hot} w={200} />
          <Label x={320} y={420} size={13} color={C.dim}>
            degradation: SEI growth · loss of active material · trapped lithium
          </Label>
        </Reveal>
      </Reveal>

      <Reveal show={ir}>
        <Axes box={vBox} xLabel="capacity (mAh/g)" yLabel="cell voltage (V)" />
        {[3.0, 3.4, 3.8].map((v) => (
          <Label key={v} x={vBox.x - 8} y={vs.sy(v) + 4} size={12} color={C.dim} anchor="end">
            {v.toFixed(1)}
          </Label>
        ))}
        <line x1={vBox.x} x2={vBox.x + vBox.w} y1={vs.sy(CUT_LOW)} y2={vs.sy(CUT_LOW)} stroke={C.hot} strokeDasharray="6 5" />
        <line x1={vBox.x} x2={vBox.x + vBox.w} y1={vs.sy(CUT_HIGH)} y2={vs.sy(CUT_HIGH)} stroke={C.hot} strokeDasharray="6 5" />
        <Label x={vBox.x + vBox.w} y={vs.sy(CUT_LOW) + 18} size={12} color={C.hot} anchor="end">
          lower cut-off
        </Label>
        <Label x={vBox.x + vBox.w} y={vs.sy(CUT_HIGH) - 8} size={12} color={C.hot} anchor="end">
          upper cut-off
        </Label>
        <DrawPath d={vs.path(slow)} show={ir} color={C.accent} width={3} />
        <DrawPath d={vs.path(fast)} show={ir} color={C.electron} width={3} delay={0.5} />
        <Label x={vs.sx(60)} y={vs.sy(3.56)} size={13} color={C.accent} anchor="start">
          low current
        </Label>
        <Label x={vs.sx(40)} y={vs.sy(3.12)} size={13} color={C.electron} anchor="start">
          high current: shifted down by iR
        </Label>
        {/* capacity lost */}
        <line x1={vs.sx(fastEnd)} x2={vs.sx(fastEnd)} y1={vs.sy(CUT_LOW)} y2={vs.sy(CUT_LOW) + 30} stroke={C.electron} />
        <line x1={vs.sx(159)} x2={vs.sx(159)} y1={vs.sy(CUT_LOW)} y2={vs.sy(CUT_LOW) + 30} stroke={C.accent} />
        <line
          x1={vs.sx(fastEnd)}
          x2={vs.sx(159)}
          y1={vs.sy(CUT_LOW) + 24}
          y2={vs.sy(CUT_LOW) + 24}
          stroke={C.ink}
          markerStart="url(#arrow)"
          markerEnd="url(#arrow)"
        />
        <Chip x={300} y={410} text="window shrinks by 2iR · worse with high mass loading" color={C.electron} w={380} />
      </Reveal>

      <Reveal show={diffusion}>
        <Particle x={160} label="slow rate (C/10)" shell={70} show={diffusion} />
        <Particle x={440} label="fast rate (5C)" shell={22} show={diffusion} />
        <Label x={300} y={60} size={18} weight={700}>
          δ ≈ √(2Dt): less time → thinner diffusion layer
        </Label>
        <g transform="translate(300 400)">
          <circle cx={-150} cy={0} r={7} fill={C.lithium} />
          <Label x={-138} y={5} size={13} anchor="start">lithiated</Label>
          <circle cx={-40} cy={0} r={7} fill={C.lfp} />
          <Label x={-28} y={5} size={13} anchor="start">not reached</Label>
        </g>
        <Label x={300} y={432} size={13} color={C.dim}>
          also: Li⁺ transport in the electrolyte (t₊ &lt; 1)
        </Label>
      </Reveal>

      <Reveal show={analyse}>
        <Label x={300} y={60} size={18} weight={700}>
          How to find out why
        </Label>
        {CHECKS.map((c, i) => (
          <motion.g
            key={c}
            initial={false}
            animate={{ x: analyse ? 0 : -30, opacity: analyse ? 1 : 0 }}
            transition={{ delay: analyse ? 0.1 + i * 0.12 : 0 }}
          >
            <rect x={100} y={88 + i * 46} width={400} height={36} rx={10} fill="#111a2c" stroke={C.grid} />
            <circle cx={124} cy={106 + i * 46} r={10} fill={C.accent} />
            <path d={`M119 ${106 + i * 46} l4 4 l7 -8`} stroke="#0b1220" strokeWidth={2.5} fill="none" />
            <Label x={144} y={111 + i * 46} size={15} anchor="start">
              {c}
            </Label>
          </motion.g>
        ))}
      </Reveal>
    </Stage>
  );
}
