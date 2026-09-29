"use client";

import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

const W50 = 2 * Math.PI * 50; // rad/s

/* single phase: 0..40 ms, ±360 V */
const box = { x: 80, y: 60, w: 470, h: 280 };
const s1 = makeScale(box, [0, 40], [-360, 360]);
const ts = Array.from({ length: 241 }, (_, i) => (i / 240) * 40);
const sine = s1.path(ts.map((t) => [t, 325 * Math.sin(W50 * t * 1e-3)]));

/* three phase: voltages on top, powers below */
const vBox = { x: 80, y: 60, w: 470, h: 150 };
const pBox = { x: 80, y: 260, w: 470, h: 120 };
const sv = makeScale(vBox, [0, 40], [-1.15, 1.15]);
const sp = makeScale(pBox, [0, 40], [0, 1.7]);
const PHASES = [
  { shift: 0, color: C.hot, name: "L1" },
  { shift: (2 * Math.PI) / 3, color: C.electron, name: "L2" },
  { shift: (4 * Math.PI) / 3, color: C.lfp, name: "L3" },
];

export default function AcVisual({ visual }: { visual: string }) {
  const single = visual === "sine" || visual === "rms";
  const rms = visual === "rms";
  const three = visual === "three-phase";

  return (
    <Stage label="AC voltage, RMS and three phase">
      <Reveal show={single}>
        <Axes box={box} xLabel="" yLabel="v (V)" origin={{ y: s1.sy(0) }} />
        {[10, 20, 30, 40].map((t) => (
          <Label key={t} x={s1.sx(t)} y={box.y + box.h + 22} size={12} color={C.dim}>
            {`${t} ms`}
          </Label>
        ))}
        <DrawPath d={sine} show={single} color={C.accent} width={3.5} dur={1.6} />
        <line x1={box.x} x2={box.x + box.w} y1={s1.sy(325)} y2={s1.sy(325)} stroke={C.dim} strokeDasharray="4 5" />
        <Label x={box.x - 6} y={s1.sy(325) + 4} anchor="end" size={12} color={C.dim}>
          325
        </Label>
        <Label x={box.x - 6} y={s1.sy(-325) + 4} anchor="end" size={12} color={C.dim}>
          −325
        </Label>
        <line x1={s1.sx(5)} x2={s1.sx(25)} y1={box.y + 4} y2={box.y + 4} stroke={C.electron} strokeWidth={2} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <Label x={s1.sx(15)} y={box.y - 4} size={13} color={C.electron} weight={700}>
          T = 20 ms → 50 Hz
        </Label>
        <Label x={s1.sx(33)} y={s1.sy(325) - 8} size={13} color={C.dim}>
          V_max = 325 V
        </Label>
      </Reveal>

      <Reveal show={rms}>
        <line x1={box.x} x2={box.x + box.w} y1={s1.sy(230)} y2={s1.sy(230)} stroke={C.lithium} strokeWidth={2.5} />
        <line x1={box.x} x2={box.x + box.w} y1={s1.sy(-230)} y2={s1.sy(-230)} stroke={C.lithium} strokeWidth={2.5} strokeDasharray="6 5" />
        <Label x={box.x - 6} y={s1.sy(230) + 4} anchor="end" size={12} color={C.lithium}>
          230
        </Label>
        <Chip x={185} y={395} text="V_rms = 325 / √2 ≈ 230 V" color={C.lithium} w={230} />
        <Chip x={430} y={395} text="average = 0 → use RMS" color={C.hot} w={200} />
        <Chip x={300} y={428} text="P_avg = V_rms · I_rms" color={C.lithium} w={220} />
      </Reveal>

      <Reveal show={three}>
        <Axes box={vBox} xLabel="" yLabel="phase voltages" origin={{ y: sv.sy(0) }} />
        {PHASES.map((p, k) => (
          <g key={p.name}>
            <DrawPath d={sv.path(ts.map((t) => [t, Math.sin(W50 * t * 1e-3 - p.shift)]))} show={three} color={p.color} width={2.5} delay={k * 0.25} />
            <DrawPath
              d={sp.path(ts.map((t) => [t, Math.sin(W50 * t * 1e-3 - p.shift) ** 2]))}
              show={three}
              color={p.color}
              width={1.8}
              dash="5 4"
              delay={0.8 + k * 0.2}
            />
          </g>
        ))}
        <line x1={sv.sx(0)} x2={sv.sx(20 / 3)} y1={vBox.y - 2} y2={vBox.y - 2} stroke={C.ink} strokeWidth={1.5} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <Label x={sv.sx(20 / 3) + 8} y={vBox.y + 2} anchor="start" size={13}>
          120° (6.7 ms) apart
        </Label>
        <Axes box={pBox} xLabel="time (ms)" yLabel="power per phase" xLabelDy={30} />
        <DrawPath d={sp.path([[0, 1.5], [40, 1.5]])} show={three} color={C.accent} width={4} delay={1.6} />
        <Label x={pBox.x + pBox.w} y={sp.sy(1.5) - 10} anchor="end" size={13} color={C.accent} weight={700}>
          sum of three phases: constant
        </Label>
      </Reveal>
    </Stage>
  );
}
