"use client";

import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Table, Title } from "../blocks";

const PHASES = [
  { c: C.hot, shift: 0, n: "a" },
  { c: C.electron, shift: (2 * Math.PI) / 3, n: "b" },
  { c: C.lfp, shift: (4 * Math.PI) / 3, n: "c" },
];
const waveBox = { x: 40, y: 100, w: 260, h: 200 };
const wave = makeScale(waveBox, [0, 2 * Math.PI], [-1.2, 1.2]);
const T = Array.from({ length: 81 }, (_, i) => (i / 80) * 2 * Math.PI);

/* Torque vs load angle: T ∝ sin α. */
const tBox = { x: 330, y: 110, w: 230, h: 170 };
const tq = makeScale(tBox, [0, 180], [0, 1.15]);
const sinPts: [number, number][] = Array.from({ length: 61 }, (_, i) => [i * 3, Math.sin((i * 3 * Math.PI) / 180)]);

const QUADS = [
  { x: 310, y: 90, t: "Motoring", s: "forward", c: C.lithium },
  { x: 90, y: 90, t: "Generating", s: "braking, reverse", c: C.electron },
  { x: 90, y: 260, t: "Motoring", s: "reverse", c: C.lithium },
  { x: 310, y: 260, t: "Generating", s: "braking, forward", c: C.electron },
];

export default function RotatingVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  const cx = 450,
    cy = 200,
    R = 90;
  return (
    <Stage label="Rotating magnetic field, synchronous speed and torque">
      <Reveal show={is("three-phase")}>
        <Title>Three phases, 120° apart, make a rotating field</Title>
        <line x1={waveBox.x} y1={wave.sy(0)} x2={waveBox.x + waveBox.w} y2={wave.sy(0)} stroke={C.grid} />
        {PHASES.map((p, i) => (
          <DrawPath key={p.n} d={wave.path(T.map((t) => [t, Math.cos(t - p.shift)]))} show={is("three-phase")} color={p.c} width={2.5} delay={i * 0.2} />
        ))}
        <Label x={170} y={330} size={13} color={C.dim}>
          three currents, each shifted by 120°
        </Label>
        <circle cx={cx} cy={cy} r={R + 20} fill="none" stroke={C.grid} strokeWidth={14} />
        {PHASES.map((p) => {
          const a = p.shift - Math.PI / 2;
          return <circle key={p.n} cx={cx + (R + 20) * Math.cos(a)} cy={cy + (R + 20) * Math.sin(a)} r={10} fill={p.c} />;
        })}
        <g>
          <line x1={cx} y1={cy} x2={cx} y2={cy - R + 4} stroke={C.accent} strokeWidth={3} markerEnd="url(#arrow)" />
          <circle cx={cx} cy={cy} r={6} fill={C.accent} />
          <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="4s" repeatCount="indefinite" />
        </g>
        <Label x={cx} y={cy + R + 55} size={13} color={C.accent} weight={700}>
          sum: constant size, constant speed
        </Label>
        <Label x={300} y={410} size={13} color={C.dim}>
          one phase has dead points · two are not smooth · three give constant power
        </Label>
      </Reveal>

      <Reveal show={is("sync-speed")}>
        <Title>Synchronous speed n = 120 f / P</Title>
        <Table
          x={110}
          y={80}
          cols={[120, 130, 130]}
          show={is("sync-speed")}
          highlight={2}
          rows={[
            ["Poles", "50 Hz", "200 Hz"],
            ["2", "3000 rpm", "12 000 rpm"],
            ["4", "1500 rpm", "6000 rpm"],
            ["6", "1000 rpm", "4000 rpm"],
            ["8", "750 rpm", "3000 rpm"],
          ]}
          rowH={44}
          size={15}
        />
        <Label x={300} y={340} size={14}>
          more poles → slower field at the same frequency
        </Label>
        <Label x={300} y={368} size={14} color={C.accent}>
          in an EV the inverter sets f, so it sets the speed
        </Label>
      </Reveal>

      <Reveal show={is("torque")}>
        <Title>The rotor field chases the stator field</Title>
        <circle cx={160} cy={210} r={110} fill="none" stroke={C.grid} strokeWidth={2} />
        <line x1={160} y1={210} x2={160 + 100 * Math.cos(-0.35)} y2={210 + 100 * Math.sin(-0.35)} stroke={C.lfp} strokeWidth={3} markerEnd="url(#arrow)" />
        <Label x={275} y={170} size={14} color={C.lfp} weight={700}>
          B stator
        </Label>
        <line x1={160} y1={210} x2={160 + 85 * Math.cos(0.45)} y2={210 + 85 * Math.sin(0.45)} stroke={C.hot} strokeWidth={3} markerEnd="url(#arrow)" />
        <Label x={250} y={270} size={14} color={C.hot} weight={700}>
          B rotor
        </Label>
        <path d={`M${160 + 45 * Math.cos(-0.35)} ${210 + 45 * Math.sin(-0.35)} A45 45 0 0 1 ${160 + 45 * Math.cos(0.45)} ${210 + 45 * Math.sin(0.45)}`} fill="none" stroke={C.electron} strokeWidth={2} />
        <Label x={222} y={216} size={15} color={C.electron} weight={700}>
          α
        </Label>
        <Axes box={tBox} xLabel="load angle α (°)" yLabel="torque" />
        <DrawPath d={tq.path(sinPts)} show={is("torque")} color={C.accent} />
        <Label x={tq.sx(90)} y={tq.sy(1) - 10} size={12} color={C.dim}>
          max at 90°
        </Label>
        <Chip x={300} y={360} text="T ∝ B_s · B_r · sin α" w={200} />
        <Label x={300} y={400} size={13} color={C.dim}>
          salient iron adds reluctance torque · distributed vs concentrated windings
        </Label>
      </Reveal>

      <Reveal show={is("quadrants")}>
        <Title>One machine, four quadrants: P = T · ω</Title>
        <line x1={70} y1={240} x2={530} y2={240} stroke={C.dim} strokeWidth={1.5} markerEnd="url(#arrow)" />
        <line x1={300} y1={410} x2={300} y2={70} stroke={C.dim} strokeWidth={1.5} markerEnd="url(#arrow)" />
        <Label x={530} y={262} anchor="end" size={13} color={C.dim}>
          speed
        </Label>
        <Label x={308} y={80} anchor="start" size={13} color={C.dim}>
          torque
        </Label>
        {QUADS.map((q) => (
          <g key={q.s}>
            <rect x={q.x} y={q.y} width={200} height={120} rx={12} fill={q.c} opacity={0.12} stroke={q.c} />
            <Label x={q.x + 100} y={q.y + 52} size={16} weight={700} color={q.c}>
              {q.t}
            </Label>
            <Label x={q.x + 100} y={q.y + 76} size={13}>
              {q.s}
            </Label>
          </g>
        ))}
        <Label x={300} y={435} size={13} color={C.dim}>
          P &gt; 0: electrical in, mechanical out · P &lt; 0: mechanical in, electrical out (regen)
        </Label>
      </Reveal>
    </Stage>
  );
}
