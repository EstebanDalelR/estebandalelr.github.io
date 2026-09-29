"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Flow, Label, Reveal, Stage, makeScale } from "../primitives";
import { Cell, Resistor, Wire } from "./circuit";

// Loop corners: (60,90) (280,90) (280,290) (60,290); source on the left side.
const LOOP = "M60 180 L60 90 L280 90 L280 290 L60 290 L60 200";

const stairBox = { x: 385, y: 80, w: 185, h: 170 };
const st = makeScale(stairBox, [0, 4], [0, 40]);
const STAIRS: [number, number][] = [
  [0, 0],
  [0.5, 0],
  [0.5, 36],
  [1.5, 36],
  [1.5, 30],
  [2.5, 30],
  [2.5, 12],
  [3.5, 12],
  [3.5, 0],
  [4, 0],
];
const DROPS = [
  { at: 1.5, from: 36, to: 30, text: "−6 V" },
  { at: 2.5, from: 30, to: 12, text: "−18 V" },
  { at: 3.5, from: 12, to: 0, text: "−12 V" },
];
const BAR_X = 385;
const BAR_W = 185;
const SPLIT = [
  { v: 6, name: "R₁", color: C.accent, x: BAR_X },
  { v: 18, name: "R₂", color: C.anion, x: BAR_X + (6 / 36) * BAR_W },
  { v: 12, name: "R₃", color: C.electron, x: BAR_X + (24 / 36) * BAR_W },
];

export default function SeriesVisual({ visual }: { visual: string }) {
  const kvl = visual === "kvl";
  const walk = visual === "walk";
  const divider = visual === "divider";
  const numbers = walk || divider;

  return (
    <Stage label="Series circuit and Kirchhoff's voltage law">
      {/* the circuit stays for every step */}
      <Wire d="M60 180 L60 90 L140 90" />
      <Resistor x={140} y={90} len={60} color={numbers ? C.accent : C.ink} />
      <Wire d="M200 90 L280 90 L280 160" />
      <Resistor x={280} y={160} len={60} vertical color={numbers ? C.anion : C.ink} />
      <Wire d="M280 220 L280 290 L200 290" />
      <Resistor x={140} y={290} len={60} color={numbers ? C.electron : C.ink} />
      <Wire d="M140 290 L60 290 L60 200" />
      <Cell x={60} y={190} color={C.lithium} />
      <Flow path={LOOP} count={8} dur={5} color={C.accent} r={4} />
      <Label x={40} y={176} anchor="end" size={13} color={C.lithium} weight={700}>
        +
      </Label>
      <Label x={40} y={214} anchor="end" size={13} color={C.lithium} weight={700}>
        −
      </Label>
      <Label x={60} y={330} size={14} color={C.lithium} weight={700}>
        36 V
      </Label>
      <Label x={170} y={72} size={13} weight={700}>
        R₁ = 1 kΩ
      </Label>
      <Label x={296} y={186} anchor="start" size={13} weight={700}>
        R₂
      </Label>
      <Label x={296} y={204} anchor="start" size={13} weight={700}>
        3 kΩ
      </Label>
      <Label x={170} y={320} size={13} weight={700}>
        R₃ = 2 kΩ
      </Label>

      <Reveal show={visual === "series"}>
        <Chip x={450} y={130} text="same current I everywhere" color={C.accent} w={220} />
        <Label x={450} y={200} size={15} weight={700}>
          R_tot = R₁ + R₂ + R₃
        </Label>
        <Label x={450} y={226} size={15} color={C.accent} weight={700}>
          = 6 kΩ
        </Label>
      </Reveal>

      <Reveal show={kvl}>
        <motion.path
          d="M170 140 A50 50 0 1 1 169 140"
          fill="none"
          stroke={C.ink}
          strokeWidth={2}
          markerEnd="url(#arrow)"
          initial={false}
          animate={{ pathLength: kvl ? 1 : 0 }}
          transition={{ duration: 1.2 }}
        />
        <Label x={170} y={196} size={15} weight={700}>
          ΣV = 0
        </Label>
        <Label x={450} y={150} size={14}>
          around any closed loop,
        </Label>
        <Label x={450} y={172} size={14}>
          the voltages sum to zero
        </Label>
        <Chip x={450} y={230} text="energy gained = energy given away" color={C.accent} w={260} />
      </Reveal>

      <Reveal show={numbers}>
        <Label x={170} y={132} size={14} color={C.accent} weight={700}>
          I = 36 V / 6 kΩ = 6 mA
        </Label>
        <Axes box={stairBox} xLabel="walk around the loop" yLabel="potential (V)" xLabelDy={40} />
        {[12, 30, 36].map((v) => (
          <Label key={v} x={stairBox.x - 6} y={st.sy(v) + 4} anchor="end" size={12} color={C.dim}>
            {v}
          </Label>
        ))}
        {["source", "R₁", "R₂", "R₃"].map((n, i) => (
          <Label key={n} x={st.sx(0.5 + i)} y={stairBox.y + stairBox.h + 16} size={12} color={C.dim}>
            {n}
          </Label>
        ))}
        <DrawPath d={st.path(STAIRS)} show={numbers} color={C.lithium} width={3} dur={1.8} />
        {DROPS.map((d) => (
          <Label key={d.text} x={st.sx(d.at) + 6} y={st.sy((d.from + d.to) / 2) + 4} anchor="start" size={12} color={C.hot} weight={700}>
            {d.text}
          </Label>
        ))}
      </Reveal>

      <Reveal show={walk}>
        <Label x={477} y={330} size={14} weight={700}>
          +36 − 6 − 18 − 12 = 0
        </Label>
      </Reveal>

      <Reveal show={divider}>
        {SPLIT.map((s) => {
          const w = (s.v / 36) * BAR_W;
          return (
            <g key={s.name}>
              <rect x={s.x} y={310} width={w} height={30} fill={s.color} opacity={0.8} />
              <Label x={s.x + w / 2} y={330} size={12} color="#0b1220" weight={800}>
                {`${s.v} V`}
              </Label>
            </g>
          );
        })}
        <Label x={477} y={362} size={12} color={C.dim}>
          36 V split 1 : 3 : 2, like the resistances
        </Label>
        <Chip x={300} y={410} text="V_R₁ = R₁ / (R₁ + R₂) · V" color={C.accent} w={260} />
      </Reveal>
    </Stage>
  );
}
