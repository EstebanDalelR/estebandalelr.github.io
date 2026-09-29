"use client";

import { Axes, C, Chip, DrawPath, Label, Reveal, Stage } from "../primitives";

const box = { x: 90, y: 70, w: 460, h: 260 };
const T_MAX = 600; // s
const F_MIN = 49.4;
const F_MAX = 50.2;
const TRIP = 10; // s, a large plant trips

// Square-root time axis so the seconds-scale dip and the minutes-scale recovery both show.
const sx = (t: number) => box.x + Math.sqrt(t / T_MAX) * box.w;
const sy = (f: number) => box.y + box.h - ((f - F_MIN) / (F_MAX - F_MIN)) * box.h;

function freq(t: number) {
  if (t < TRIP) return 50;
  const u = t - TRIP;
  // primary: dips to a nadir within seconds, then settles ~0.15 Hz low
  const dev = 0.15 * (1 - Math.exp(-u / 2)) + 0.25 * (Math.exp(-u / 12) - Math.exp(-u / 2));
  // secondary: after ~1 min, restores 50 Hz over a few minutes
  const secondary = u < 50 ? 1 : Math.exp(-(u - 50) / 80);
  return 50 - dev * secondary;
}

const path = (t0: number, t1: number) => {
  const pts: string[] = [];
  const n = 300;
  for (let i = 0; i <= n; i++) {
    // sample uniformly in sqrt(t)
    const a = Math.sqrt(t0 / T_MAX);
    const b = Math.sqrt(t1 / T_MAX);
    const t = (a + ((b - a) * i) / n) ** 2 * T_MAX;
    pts.push(`${i ? "L" : "M"}${sx(t).toFixed(1)},${sy(freq(t)).toFixed(1)}`);
  }
  return pts.join("");
};

const PRIMARY = path(0, 60);
const SECONDARY = path(60, T_MAX);
// nadir
let nadirT = TRIP;
for (let t = TRIP; t < 40; t += 0.1) if (freq(t) < freq(nadirT)) nadirT = t;
const NADIR_F = freq(nadirT);

export default function FrequencyVisual({ visual }: { visual: string }) {
  const secondary = visual === "secondary" || visual === "bands";
  const bands = visual === "bands";

  return (
    <Stage label="Primary and secondary frequency regulation">
      <Reveal show={bands}>
        <rect x={box.x} y={sy(50.1)} width={box.w} height={sy(49.9) - sy(50.1)} fill={C.lithium} opacity={0.14} />
        <rect x={box.x} y={sy(49.9)} width={box.w} height={sy(49.5) - sy(49.9)} fill={C.copper} opacity={0.14} />
        <Label x={box.x + box.w - 8} y={sy(50.1) + 16} anchor="end" size={13} color={C.lithium} weight={700}>
          normal operation 49.9–50.1 Hz
        </Label>
        <Label x={box.x + box.w - 8} y={sy(49.5) - 10} anchor="end" size={13} color={C.copper} weight={700}>
          disturbance reserves 49.5–49.9 Hz
        </Label>
      </Reveal>

      <Axes box={box} xLabel="time (√ scale)" yLabel="frequency (Hz)" xLabelDy={44} />
      {[49.5, 49.9, 50, 50.1].map((f) => (
        <Label key={f} x={box.x - 8} y={sy(f) + 4} anchor="end" size={12} color={C.dim}>
          {f.toFixed(1)}
        </Label>
      ))}
      {[
        { t: 10, s: "10 s" },
        { t: 60, s: "1 min" },
        { t: 300, s: "5 min" },
        { t: 600, s: "10 min" },
      ].map((k) => (
        <Label key={k.s} x={sx(k.t)} y={box.y + box.h + 18} size={12} color={C.dim}>
          {k.s}
        </Label>
      ))}
      <line x1={box.x} x2={box.x + box.w} y1={sy(50)} y2={sy(50)} stroke={C.dim} strokeDasharray="3 5" />

      <DrawPath d={PRIMARY} show color={C.hot} width={3.5} dur={1.4} />
      <line x1={sx(TRIP)} x2={sx(TRIP)} y1={sy(50) - 30} y2={sy(50) - 6} stroke={C.ink} markerEnd="url(#arrow)" />
      <Label x={sx(TRIP) + 4} y={sy(50) - 36} anchor="start" size={12}>
        a large plant trips
      </Label>

      <Reveal show={visual === "primary"}>
        <circle cx={sx(nadirT)} cy={sy(NADIR_F)} r={6} fill="none" stroke={C.hot} strokeWidth={2} />
        <Label x={sx(nadirT) + 10} y={sy(NADIR_F) + 20} anchor="start" size={13} color={C.hot}>
          {`nadir ≈ ${NADIR_F.toFixed(2)} Hz`}
        </Label>
        <line x1={sx(30)} x2={box.x + box.w} y1={sy(49.85)} y2={sy(49.85)} stroke={C.hot} strokeDasharray="6 5" />
        <Label x={box.x + box.w - 8} y={sy(49.85) - 8} anchor="end" size={13} color={C.hot}>
          settles below 50 Hz
        </Label>
        <Chip x={300} y={415} text="primary control: within seconds, stops the fall" color={C.hot} w={360} />
      </Reveal>

      <DrawPath d={SECONDARY} show={secondary} color={C.lithium} width={3.5} dur={1.4} />
      <Reveal show={visual === "secondary"}>
        <Label x={sx(250)} y={sy(49.93) + 26} size={13} color={C.lithium} weight={700}>
          back to 50 Hz over minutes
        </Label>
        <Chip x={300} y={415} text="secondary control: within minutes, restores 50 Hz" color={C.lithium} w={380} />
      </Reveal>
      <Reveal show={bands}>
        <Chip x={300} y={415} text="fast storage is ideal for these reserves" color={C.accent} w={320} />
      </Reveal>
    </Stage>
  );
}
