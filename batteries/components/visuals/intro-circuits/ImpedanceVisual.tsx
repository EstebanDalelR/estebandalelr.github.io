"use client";

import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Cell, Resistor, Wire } from "./circuit";

const box = { x: 270, y: 90, w: 290, h: 220 };
const s = makeScale(box, [0, 5], [0, 1.15]);
const ts = Array.from({ length: 101 }, (_, i) => (i / 100) * 5);
const rising = s.path(ts.map((t) => [t, 1 - Math.exp(-t)]));
const decaying = s.path(ts.map((t) => [t, Math.exp(-t)]));

/* complex plane for Z = R + jX */
const O = { x: 150, y: 330 };
const RX = 220;
const XY = 160;

function Coil({ x, y }: { x: number; y: number }) {
  // vertical coil from y to y+60
  const d = Array.from({ length: 4 }, (_, i) => `M${x} ${y + i * 15} a8 7.5 0 1 1 0 15`).join(" ");
  return <path d={d} fill="none" stroke={C.anion} strokeWidth={3} />;
}

function Capacitor({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={C.anion} strokeWidth={4}>
      <line x1={x - 18} x2={x + 18} y1={y - 5} y2={y - 5} />
      <line x1={x - 18} x2={x + 18} y1={y + 5} y2={y + 5} />
    </g>
  );
}

function SmallCircuit({ kind }: { kind: "C" | "L" }) {
  return (
    <g>
      <Wire d="M50 205 L50 130 L90 130" />
      <Resistor x={90} y={130} len={60} />
      <Wire d={kind === "C" ? "M150 130 L200 130 L200 205 M200 215 L200 290 L50 290 L50 225" : "M150 130 L200 130 L200 180 M200 240 L200 290 L50 290 L50 225"} />
      <Cell x={50} y={215} color={C.lithium} />
      {kind === "C" ? <Capacitor x={200} y={210} /> : <Coil x={200} y={180} />}
      <Label x={120} y={112} size={13} weight={700}>
        R
      </Label>
      <Label x={228} y={215} anchor="start" size={14} weight={700} color={C.anion}>
        {kind}
      </Label>
      <Label x={32} y={220} anchor="end" size={13} color={C.lithium} weight={700}>
        E
      </Label>
    </g>
  );
}

export default function ImpedanceVisual({ visual }: { visual: string }) {
  const cap = visual === "capacitor";
  const ind = visual === "inductor";
  const plot = cap || ind;
  const imp = visual === "impedance";

  return (
    <Stage label="Capacitors, inductors and impedance">
      <Reveal show={plot}>
        <Axes box={box} xLabel="time (τ)" yLabel="normalised" />
      </Reveal>

      <Reveal show={cap}>
        <SmallCircuit kind="C" />
        <DrawPath d={decaying} show={cap} color={C.electron} width={3} />
        <DrawPath d={rising} show={cap} color={C.accent} width={3.5} delay={0.3} />
        <Label x={s.sx(0.25)} y={s.sy(1.02)} anchor="start" size={13} color={C.electron} weight={700}>
          i: high at first
        </Label>
        <Label x={s.sx(4.9)} y={s.sy(0.9)} anchor="end" size={13} color={C.accent} weight={700}>
          v_C rises
        </Label>
        <Label x={130} y={340} size={12} color={C.dim}>
          W = ½ C v²  (electric field)
        </Label>
        <Chip x={300} y={400} text="voltage lags behind current" color={C.accent} w={260} />
      </Reveal>

      <Reveal show={ind}>
        <SmallCircuit kind="L" />
        <DrawPath d={decaying} show={ind} color={C.accent} width={3.5} />
        <DrawPath d={rising} show={ind} color={C.electron} width={3} delay={0.3} />
        <Label x={s.sx(0.25)} y={s.sy(1.02)} anchor="start" size={13} color={C.accent} weight={700}>
          v_L: jumps first
        </Label>
        <Label x={s.sx(4.9)} y={s.sy(0.9)} anchor="end" size={13} color={C.electron} weight={700}>
          i builds up
        </Label>
        <Label x={130} y={340} size={12} color={C.dim}>
          W = ½ L i²  (magnetic field)
        </Label>
        <Chip x={300} y={400} text="current lags behind voltage" color={C.electron} w={260} />
      </Reveal>

      <Reveal show={imp}>
        <line x1={O.x - 20} y1={O.y} x2={O.x + RX + 60} y2={O.y} stroke={C.dim} strokeWidth={1.5} markerEnd="url(#arrow)" />
        <line x1={O.x} y1={O.y + 20} x2={O.x} y2={O.y - XY - 60} stroke={C.dim} strokeWidth={1.5} markerEnd="url(#arrow)" />
        <Label x={O.x + RX + 60} y={O.y + 22} anchor="end" size={13} color={C.dim}>
          real
        </Label>
        <Label x={O.x + 8} y={O.y - XY - 64} anchor="start" size={13} color={C.dim}>
          imaginary (j)
        </Label>
        <DrawPath d={`M${O.x} ${O.y} L${O.x + RX} ${O.y}`} show={imp} color={C.accent} width={4} />
        <DrawPath d={`M${O.x + RX} ${O.y} L${O.x + RX} ${O.y - XY}`} show={imp} color={C.anion} width={3} dash="6 5" delay={0.4} />
        <DrawPath d={`M${O.x} ${O.y} L${O.x + RX} ${O.y - XY}`} show={imp} color={C.electron} width={4} delay={0.8} />
        <path d={`M${O.x + 50} ${O.y} A50 50 0 0 0 ${O.x + 50 * Math.cos(Math.atan2(XY, RX))} ${O.y - 50 * Math.sin(Math.atan2(XY, RX))}`} fill="none" stroke={C.ink} strokeWidth={1.5} />
        <Label x={O.x + 62} y={O.y - 12} anchor="start" size={14}>
          φ
        </Label>
        <Label x={O.x + RX / 2} y={O.y + 24} size={14} color={C.accent} weight={700}>
          R
        </Label>
        <Label x={O.x + RX + 12} y={O.y - XY / 2} anchor="start" size={14} color={C.anion} weight={700}>
          jX
        </Label>
        <Label x={O.x + RX / 2 - 16} y={O.y - XY / 2 - 14} anchor="end" size={15} color={C.electron} weight={700}>
          Z
        </Label>
        <Label x={480} y={120} size={14} weight={700}>
          Z = R + jX
        </Label>
        <Label x={480} y={145} size={13} color={C.dim}>
          X_L = ωL
        </Label>
        <Label x={480} y={165} size={13} color={C.dim}>
          X_C = −1/(ωC)
        </Label>
        <Chip x={300} y={390} text="resistance: DC · impedance: AC, size + phase, depends on ω" color={C.electron} w={450} />
        <Chip x={300} y={425} text="V = I · Z" color={C.accent} w={120} />
      </Reveal>
    </Stage>
  );
}
