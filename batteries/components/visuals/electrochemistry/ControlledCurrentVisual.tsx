"use client";

import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

const V_LOW = 2.5;
const V_HIGH = 4.0;

// Schematic LFP/graphite full cell at constant current. iR shifts the curve,
// k > 1 mimics the diffusion-limited drop arriving earlier at higher rate.
function curve(kind: "dis" | "chg", iR: number, k: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let q = 0; q <= 1.2; q += 0.005) {
    const tail = 0.8 * Math.exp((q * k - 1) * 18);
    const v =
      kind === "dis"
        ? 3.3 - iR + 0.25 * Math.exp(-15 * q) - 0.04 * q - tail
        : 3.4 + iR - 0.25 * Math.exp(-15 * q) + 0.04 * q + tail;
    if (kind === "dis" && v <= V_LOW) return [...pts, [q, V_LOW]];
    if (kind === "chg" && v >= V_HIGH) return [...pts, [q, V_HIGH]];
    pts.push([q, v]);
  }
  return pts;
}

const box = { x: 80, y: 60, w: 460, h: 290 };
const s = makeScale(box, [0, 1.1], [2.3, 4.3]);
const disLow = curve("dis", 0, 1);
const disHigh = curve("dis", 0.2, 1.12);
const chgLow = curve("chg", 0, 1);
const chgHigh = curve("chg", 0.2, 1.12);
const qLow = disLow[disLow.length - 1][0];
const qHigh = disHigh[disHigh.length - 1][0];

// Graphite half-cell, first lithiation: galvanostatic curve vs voltammogram
const gcBox = { x: 50, y: 90, w: 220, h: 250 };
const gc = makeScale(gcBox, [0, 1], [0, 3.2]);
const gcCurve: [number, number][] = Array.from({ length: 120 }, (_, i) => {
  const q = i / 119;
  // quick drop from OCV, ~1 % shoulder from SEI near 0.8 V, then staged plateaus near 0.1–0.2 V
  const v = 0.12 + 0.08 * Math.exp(-q * 6) + 0.7 * Math.exp(-q * 60) + 2.2 * Math.exp(-q * 300) - 0.05 * q;
  return [q, v];
});
const cvBox = { x: 340, y: 90, w: 230, h: 250 };
const cv = makeScale(cvBox, [0, 1.5], [-1.1, 0.25]);
const cvCurve: [number, number][] = Array.from({ length: 200 }, (_, i) => {
  const e = 1.5 - (i / 199) * 1.45;
  const sei = -0.28 * Math.exp(-(((e - 0.7) / 0.08) ** 2));
  const intercalation = -1.0 * Math.exp(-(((e - 0.08) / 0.07) ** 2));
  return [e, sei + intercalation - 0.02];
});

export default function ControlledCurrentVisual({ visual }: { visual: string }) {
  const plot = visual !== "cc-vs-cv";
  const cons = visual === "cc-cons";

  return (
    <Stage label="Controlled current versus controlled potential">
      <Reveal show={plot}>
        <Axes box={box} xLabel="capacity (Q = I·t) →" yLabel="cell voltage (V)" />
        {[2.5, 3, 3.5, 4].map((v) => (
          <Label key={v} x={box.x - 10} y={s.sy(v) + 5} anchor="end" size={12} color={C.dim}>
            {v.toFixed(1)}
          </Label>
        ))}
        <line x1={box.x} y1={s.sy(V_LOW)} x2={box.x + box.w} y2={s.sy(V_LOW)} stroke={C.hot} strokeDasharray="6 5" />
        <Label x={box.x + 8} y={s.sy(V_LOW) - 8} anchor="start" size={13} color={C.hot}>
          lower cut-off
        </Label>
        <DrawPath d={s.path(disLow)} show={plot} color={C.accent} width={3.5} dur={1.6} />
        <Chip x={220} y={s.sy(4.15)} text="I = constant" w={130} />
      </Reveal>

      <Reveal show={visual === "cc-pros"}>
        <line x1={s.sx(0)} y1={s.sy(2.4)} x2={s.sx(qLow)} y2={s.sy(2.4)} stroke={C.electron} strokeWidth={2} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <Label x={s.sx(qLow / 2)} y={s.sy(2.4) - 8} size={14} color={C.electron} weight={700}>
          Q = I · t
        </Label>
        <Label x={box.x + 20} y={410} anchor="start" size={13} color={C.lithium}>
          ✓ like real use
        </Label>
        <Label x={box.x + 160} y={410} anchor="start" size={13} color={C.lithium}>
          ✓ simple
        </Label>
        <Label x={box.x + 260} y={410} anchor="start" size={13} color={C.lithium}>
          ✓ charge &amp; energy directly
        </Label>
      </Reveal>

      <Reveal show={cons}>
        <line x1={box.x} y1={s.sy(V_HIGH)} x2={box.x + box.w} y2={s.sy(V_HIGH)} stroke={C.hot} strokeDasharray="6 5" />
        <Label x={box.x + box.w} y={s.sy(V_HIGH) - 8} anchor="end" size={13} color={C.hot}>
          upper cut-off
        </Label>
        <DrawPath d={s.path(chgLow)} show={cons} color={C.accent} width={2} dash="5 4" />
        <DrawPath d={s.path(chgHigh)} show={cons} color={C.electron} width={3} delay={0.3} />
        <DrawPath d={s.path(disHigh)} show={cons} color={C.electron} width={3} delay={0.5} />
        {/* iR arrows at mid-capacity */}
        <line x1={s.sx(0.5)} y1={s.sy(3.38)} x2={s.sx(0.5)} y2={s.sy(3.6)} stroke={C.ink} strokeWidth={1.5} markerEnd="url(#arrow)" />
        <line x1={s.sx(0.5)} y1={s.sy(3.26)} x2={s.sx(0.5)} y2={s.sy(3.06)} stroke={C.ink} strokeWidth={1.5} markerEnd="url(#arrow)" />
        <Label x={s.sx(0.5) + 10} y={s.sy(3.62)} anchor="start" size={13}>
          + iR
        </Label>
        <Label x={s.sx(0.5) + 10} y={s.sy(3.0)} anchor="start" size={13}>
          − iR
        </Label>
        <line x1={s.sx(qHigh)} y1={s.sy(2.4)} x2={s.sx(qLow)} y2={s.sy(2.4)} stroke={C.hot} strokeWidth={2} markerEnd="url(#arrow)" />
        <Label x={s.sx(qHigh) - 6} y={s.sy(2.4) + 5} anchor="end" size={13} color={C.hot}>
          capacity lost
        </Label>
        <Label x={box.x + 20} y={405} anchor="start" size={13} color={C.electron}>
          high current: window shrinks by 2iR
        </Label>
        <Label x={box.x + 20} y={425} anchor="start" size={13} color={C.dim}>
          cut-off reached — but why? side reactions? charging current when dE/dt ≠ 0
        </Label>
      </Reveal>

      <Reveal show={visual === "cc-vs-cv"}>
        <Label x={160} y={45} size={15} weight={700}>
          Constant current
        </Label>
        <Label x={160} y={66} size={12} color={C.dim}>
          graphite, first lithiation
        </Label>
        <Axes box={gcBox} xLabel="Q" yLabel="E vs Li⁺/Li" />
        <DrawPath d={gc.path(gcCurve)} show={visual === "cc-vs-cv"} color={C.accent} width={3} />
        <circle cx={gc.sx(0.008)} cy={gc.sy(0.8)} r={14} fill="none" stroke={C.hot} strokeDasharray="3 3" />
        <Label x={gc.sx(0.008) + 20} y={gc.sy(0.8) - 16} anchor="start" size={12} color={C.hot}>
          SEI ≈ 1 % of charge: hidden
        </Label>

        <Label x={450} y={45} size={15} weight={700}>
          Controlled potential
        </Label>
        <Label x={450} y={66} size={12} color={C.dim}>
          first cathodic sweep
        </Label>
        <Axes box={cvBox} xLabel="E vs Li⁺/Li" yLabel="i" origin={{ y: cv.sy(0) }} />
        <DrawPath d={cv.path(cvCurve)} show={visual === "cc-vs-cv"} color={C.anion} width={3} delay={0.3} />
        <Label x={cv.sx(0.7)} y={cv.sy(-0.3) + 24} size={13} color={C.hot} weight={700}>
          SEI peak
        </Label>
        <Label x={cv.sx(0.08) + 20} y={cv.sy(-1.02) + 4} anchor="start" size={13} color={C.anion}>
          Li⁺ intercalation
        </Label>
        <Chip x={300} y={410} text="current reveals kinetics & separate processes" w={380} />
      </Reveal>
    </Stage>
  );
}
