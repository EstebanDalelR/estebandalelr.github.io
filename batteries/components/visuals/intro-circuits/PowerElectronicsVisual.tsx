"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Cell, Resistor, Rotor, Wire } from "./circuit";

/* waveform strips for the "renewables" step */
const strip = (y0: number, fn: (x: number) => number) =>
  Array.from({ length: 181 }, (_, i) => {
    const x = 200 + i * 2;
    return `${i ? "L" : "M"}${x},${(y0 - fn(i / 180) * 26).toFixed(1)}`;
  }).join("");
const WIND = strip(110, (u) => Math.sin(2 * Math.PI * (2.2 * u + 2.5 * u * u)) * (0.6 + 0.4 * u));
const PV = strip(225, () => 0.8);
const GRID = strip(340, (u) => Math.sin(2 * Math.PI * 4 * u));

/* PWM rows */
const ROWS = [0.25, 0.5, 0.75];
const pwm = (y0: number, d: number) => {
  const periods = 4;
  const w = 320 / periods;
  let p = `M240 ${y0}`;
  for (let k = 0; k < periods; k++) {
    const x = 240 + k * w;
    p += ` L${x} ${y0 - 40} L${x + d * w} ${y0 - 40} L${x + d * w} ${y0} L${x + w} ${y0}`;
  }
  return p;
};

/* frequency after a trip: high vs low inertia */
const fBox = { x: 330, y: 110, w: 230, h: 200 };
const fs = makeScale(fBox, [0, 20], [49.55, 50.05]);
const ts = Array.from({ length: 161 }, (_, i) => (i / 160) * 20);
const HIGH = fs.path(ts.map((t) => [t, 50 - (0.2 * (1 - Math.exp(-t / 4)) + 0.1 * (Math.exp(-t / 10) - Math.exp(-t / 4)))]));
const LOW = fs.path(ts.map((t) => [t, 50 - (0.2 * (1 - Math.exp(-t)) + 0.35 * (Math.exp(-t / 5) - Math.exp(-t)))]));

function Block({ x, y, title, sub, color, children }: { x: number; y: number; title: string; sub: string; color: string; children?: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={92} height={70} rx={10} fill="#111a2c" stroke={color} strokeWidth={2.5} />
      <Label x={x + 46} y={y + 30} size={18} weight={800} color={color}>
        {title}
      </Label>
      <Label x={x + 46} y={y + 52} size={12} color={C.dim}>
        {sub}
      </Label>
      {children}
    </g>
  );
}

export default function PowerElectronicsVisual({ visual }: { visual: string }) {
  const ren = visual === "renewables";
  const conv = visual === "converter";
  const sw = visual === "switching";
  const inertia = visual === "inertia-loss";

  return (
    <Stage label="Power electronics for renewables">
      <Reveal show={ren}>
        <Label x={100} y={105} size={14} weight={700} color={C.lfp}>
          wind turbine
        </Label>
        <Label x={100} y={125} size={12} color={C.dim}>
          speed follows wind
        </Label>
        <Label x={100} y={220} size={14} weight={700} color={C.electron}>
          solar panels
        </Label>
        <Label x={100} y={240} size={12} color={C.dim}>
          direct current
        </Label>
        <Label x={100} y={335} size={14} weight={700} color={C.accent}>
          the grid
        </Label>
        <Label x={100} y={355} size={12} color={C.dim}>
          50 Hz, in phase
        </Label>
        <DrawPath d={WIND} show={ren} color={C.lfp} width={3} />
        <DrawPath d={PV} show={ren} color={C.electron} width={3} delay={0.3} />
        <DrawPath d={GRID} show={ren} color={C.accent} width={3} delay={0.6} />
        <Label x={380} y={172} size={26} color={C.hot} weight={800}>
          ≠
        </Label>
        <Label x={380} y={288} size={26} color={C.hot} weight={800}>
          ≠
        </Label>
        <Chip x={300} y={415} text="variable frequency or DC cannot be synchronised directly" color={C.hot} w={430} />
      </Reveal>

      <Reveal show={conv}>
        <Block x={10} y={170} title="G ~" sub="variable f" color={C.lfp} />
        <Block x={128} y={170} title="~ → =" sub="rectifier" color={C.electron} />
        <Block x={246} y={170} title="DC" sub="DC link" color={C.dim} />
        <Block x={364} y={170} title="= → ~" sub="inverter" color={C.lithium} />
        <Block x={482} y={170} title="50 Hz" sub="grid" color={C.accent} />
        {[102, 220, 338, 456].map((x) => (
          <line key={x} x1={x} y1={205} x2={x + 26} y2={205} stroke={C.ink} strokeWidth={2} markerEnd="url(#arrow)" />
        ))}
        <rect x={262} y={320} width={60} height={34} rx={4} fill={C.electron} opacity={0.25} stroke={C.electron} />
        <Label x={292} y={342} size={13} weight={700} color={C.electron}>
          PV
        </Label>
        <line x1={292} y1={320} x2={292} y2={246} stroke={C.electron} strokeWidth={2} markerEnd="url(#arrow)" />
        <Label x={306} y={290} anchor="start" size={12} color={C.dim}>
          DC skips the rectifier
        </Label>
        <Label x={300} y={120} size={14}>
          output at exactly the grid&apos;s voltage, frequency and phase
        </Label>
        <Chip x={300} y={400} text="✗ a transformer changes voltage, never frequency" color={C.hot} w={400} />
      </Reveal>

      <Reveal show={sw}>
        <Wire d="M50 205 L50 110 L100 110 M140 110 L170 110 L170 170 M170 250 L170 300 L50 300 L50 215" />
        <line x1={100} y1={110} x2={136} y2={92} stroke={C.ink} strokeWidth={3} />
        <circle cx={100} cy={110} r={3.5} fill={C.ink} />
        <circle cx={140} cy={110} r={3.5} fill={C.ink} />
        <Resistor x={170} y={170} len={80} vertical color={C.copper} />
        <Cell x={50} y={210} color={C.lithium} />
        <Label x={30} y={215} anchor="end" size={13} color={C.lithium} weight={700}>
          5 V
        </Label>
        <Label x={118} y={84} size={12} color={C.dim}>
          switch
        </Label>
        <Label x={186} y={215} anchor="start" size={13} color={C.copper} weight={700}>
          1 Ω
        </Label>
        {ROWS.map((d, i) => {
          const y0 = 140 + i * 105;
          return (
            <g key={d}>
              <DrawPath d={pwm(y0, d)} show={sw} color={C.electron} width={2.5} delay={i * 0.2} />
              <line x1={240} x2={560} y1={y0 - 40 * d} y2={y0 - 40 * d} stroke={C.accent} strokeWidth={2} strokeDasharray="6 4" />
              <Label x={240} y={y0 - 52} anchor="start" size={13} weight={700}>
                {`D = ${d * 100} %`}
              </Label>
              <Label x={560} y={y0 - 52} anchor="end" size={13} color={C.accent} weight={700}>
                {`average ${(5 * d).toFixed(2)} V`}
              </Label>
            </g>
          );
        })}
        <Chip x={300} y={415} text="V_avg = D · 5 V    ·    P_avg = D · 25 W" color={C.accent} w={340} />
      </Reveal>

      <Reveal show={inertia}>
        <Label x={150} y={80} size={14} weight={700} color={C.lfp}>
          synchronous generator
        </Label>
        <motion.g initial={false} animate={{ opacity: inertia ? 1 : 0 }}>
          <Rotor x={110} y={135} />
          <line x1={138} y1={135} x2={250} y2={135} stroke={C.accent} strokeWidth={4} />
        </motion.g>
        <Label x={150} y={190} size={12} color={C.dim}>
          rotating mass coupled to the grid
        </Label>
        <Label x={150} y={240} size={14} weight={700} color={C.hot}>
          converter-connected
        </Label>
        <Rotor x={70} y={295} color={C.dim} />
        <rect x={120} y={276} width={60} height={38} rx={6} fill="#111a2c" stroke={C.lithium} />
        <Label x={150} y={300} size={12} color={C.lithium}>
          = / ~
        </Label>
        <line x1={98} y1={295} x2={120} y2={295} stroke={C.dim} strokeWidth={3} />
        <line x1={180} y1={295} x2={250} y2={295} stroke={C.accent} strokeWidth={4} />
        <Label x={150} y={345} size={12} color={C.hot}>
          decoupled: adds no inertia
        </Label>
        <Axes box={fBox} xLabel="time (s)" yLabel="f (Hz)" />
        <line x1={fBox.x} x2={fBox.x + fBox.w} y1={fs.sy(50)} y2={fs.sy(50)} stroke={C.dim} strokeDasharray="3 5" />
        <DrawPath d={HIGH} show={inertia} color={C.lfp} width={3} />
        <DrawPath d={LOW} show={inertia} color={C.hot} width={3} delay={0.3} />
        <Label x={fBox.x + fBox.w} y={fs.sy(49.9)} anchor="end" size={12} color={C.lfp} weight={700}>
          high inertia
        </Label>
        <Label x={fs.sx(3)} y={fs.sy(49.6) + 4} anchor="start" size={12} color={C.hot} weight={700}>
          low inertia: faster, deeper
        </Label>
        <line x1={250} y1={125} x2={250} y2={305} stroke={C.accent} strokeWidth={4} />
        <Label x={262} y={220} anchor="start" size={12} color={C.accent}>
          grid
        </Label>
        <Chip x={300} y={410} text="more renewables → less inertia → need fast storage" color={C.accent} w={400} />
      </Reveal>
    </Stage>
  );
}
