"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";
import { Rotor } from "./circuit";

const GENS = [110, 240, 370, 500];

/** Spin children about (x, y) forever. */
function Spin({ x, y, dur, children }: { x: number; y: number; dur: number; children: ReactNode }) {
  return (
    <g>
      {children}
      <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`360 ${x} ${y}`} dur={`${dur}s`} repeatCount="indefinite" />
    </g>
  );
}

/** Frequency gauge, 49.5..50.5 Hz across a half circle. */
function Gauge({ f, show }: { f: number; show: boolean }) {
  const cx = 300;
  const cy = 150;
  const r = 80;
  const at = (x: number, rr: number) => {
    const a = Math.PI * (1 - (x - 49.5));
    return { x: cx + Math.cos(a) * rr, y: cy - Math.sin(a) * rr };
  };
  const a = at(49.5, r);
  const b = at(50.5, r);
  const needle = at(show ? f : 50, r - 14);
  return (
    <g>
      <path d={`M${a.x} ${a.y} A${r} ${r} 0 0 1 ${b.x} ${b.y}`} fill="none" stroke={C.grid} strokeWidth={10} />
      {[49.5, 50, 50.5].map((x) => {
        const p = at(x, r + 18);
        return (
          <Label key={x} x={p.x} y={p.y + 4} size={12} color={C.dim}>
            {x.toFixed(1)}
          </Label>
        );
      })}
      <motion.line
        x1={cx}
        y1={cy}
        stroke={C.hot}
        strokeWidth={4}
        strokeLinecap="round"
        initial={false}
        animate={{ x2: needle.x, y2: needle.y }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
      <circle cx={cx} cy={cy} r={6} fill={C.hot} />
      <Label x={cx} y={cy + 30} size={16} weight={700} color={C.hot}>
        {show ? `${f.toFixed(1)} Hz ↓` : "50.0 Hz"}
      </Label>
    </g>
  );
}

export default function SyncVisual({ visual }: { visual: string }) {
  const gen = visual === "generator";
  const sync = visual === "synchronised";
  const mismatch = visual === "mismatch";

  return (
    <Stage label="Generators, synchronisation and inertia">
      <Reveal show={gen}>
        {/* turbine */}
        <Spin x={110} y={210} dur={1.6}>
          {[0, 120, 240].map((a) => (
            <ellipse key={a} cx={110} cy={168} rx={10} ry={40} fill={C.lfp} opacity={0.8} transform={`rotate(${a} 110 210)`} />
          ))}
        </Spin>
        <circle cx={110} cy={210} r={9} fill={C.ink} />
        <line x1={110} y1={210} x2={250} y2={210} stroke={C.zinc} strokeWidth={8} />
        <rect x={250} y={160} width={110} height={100} rx={12} fill="#111a2c" stroke={C.lfp} strokeWidth={3} />
        <Label x={305} y={217} size={22} weight={800} color={C.lfp}>
          G
        </Label>
        <path d="M360 190 L520 190 M360 230 L520 230" stroke={C.dim} strokeWidth={3} />
        <Flow path="M360 190 L520 190" count={5} dur={1.8} color={C.accent} r={4} />
        <circle cx={540} cy={210} r={22} fill={C.electron} opacity={0.85} />
        <circle cx={540} cy={210} r={44} fill="url(#glow)" opacity={0.4} />
        <Label x={170} y={110} size={14} weight={700} color={C.lfp}>
          mechanical
        </Label>
        <Label x={170} y={316} size={13}>
          speed ω · torque T
        </Label>
        <Label x={450} y={110} size={14} weight={700} color={C.accent}>
          electrical
        </Label>
        <Label x={450} y={316} size={13}>
          voltage V · current I
        </Label>
        <Chip x={300} y={345} text="P = ω · T = V · I" color={C.accent} w={200} />
        <Label x={300} y={390} size={13} color={C.dim}>
          speed sets voltage and frequency · the load brakes the shaft as torque
        </Label>
      </Reveal>

      <Reveal show={sync || mismatch}>
        <line x1={70} y1={300} x2={540} y2={300} stroke={C.accent} strokeWidth={6} />
        <Label x={556} y={305} anchor="start" size={13} color={C.accent} weight={700}>
          grid
        </Label>
        {GENS.map((x) => (
          <g key={x}>
            <line x1={x} y1={258} x2={x} y2={300} stroke={C.dim} strokeWidth={3} />
            <Spin x={x} y={230} dur={mismatch ? 1.6 : 1.2}>
              <Rotor x={x} y={230} />
            </Spin>
          </g>
        ))}
      </Reveal>

      <Reveal show={sync}>
        <Label x={300} y={60} size={16} weight={700}>
          All spinning in step at 50 Hz
        </Label>
        <Chip x={300} y={140} text="one huge rotating mass = inertia, W = ½ I ω²" color={C.lfp} w={380} />
        <Label x={300} y={350} size={14}>
          a sudden disturbance is shared by every generator
        </Label>
        <Label x={300} y={375} size={14} color={C.dim}>
          no single plant has to take the hit
        </Label>
      </Reveal>

      <Reveal show={mismatch}>
        <Gauge f={49.8} show={mismatch} />
        <Label x={110} y={60} size={14} weight={700} color={C.accent}>
          production
        </Label>
        <Label x={490} y={60} size={14} weight={700} color={C.copper}>
          consumption
        </Label>
        <motion.rect x={60} y={74} height={16} rx={4} fill={C.accent} initial={false} animate={{ width: mismatch ? 100 : 0 }} />
        <motion.rect x={420} y={74} height={16} rx={4} fill={C.copper} initial={false} animate={{ width: mismatch ? 140 : 0 }} />
        <Label x={300} y={350} size={14}>
          load &gt; production: energy is taken from the rotating masses
        </Label>
        <Label x={300} y={375} size={14} color={C.dim}>
          generators slow down → frequency drops
        </Label>
        <Chip x={300} y={415} text="inertia buys seconds, then reserves must restore the balance" color={C.hot} w={440} />
      </Reveal>
    </Stage>
  );
}
