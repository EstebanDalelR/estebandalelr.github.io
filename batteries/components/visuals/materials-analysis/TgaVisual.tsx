"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Flow, Label, Reveal, Stage, makeScale } from "../primitives";
import { Bars, Title } from "../blocks";

const box = { x: 80, y: 70, w: 460, h: 270 };
const s = makeScale(box, [0, 1000], [20, 105]);
const step = (T: number, at: number, w: number) => 1 / (1 + Math.exp(-(T - at) / w));

/* Calcium oxalate monohydrate: residual mass in % vs T (°C). */
const OX = (T: number) => 100 - 12.3 * step(T, 180, 14) - 19.2 * step(T, 480, 16) - 30.1 * step(T, 720, 20);
const OX_PTS: [number, number][] = Array.from({ length: 201 }, (_, i) => [i * 5, OX(i * 5)]);
/* Its derivative, scaled to sit under the curve. */
const D_PTS: [number, number][] = OX_PTS.slice(1).map(([T, m], i) => [T, 26 + (OX_PTS[i][1] - m) * 5]);

function MassAxes() {
  return (
    <g>
      <Axes box={box} xLabel="temperature (°C)" yLabel="mass (%)" xLabelDy={40} />
      {[0, 250, 500, 750, 1000].map((T) => (
        <Label key={T} x={s.sx(T)} y={box.y + box.h + 16} size={11} color={C.dim}>
          {T}
        </Label>
      ))}
      {[100, 80, 60, 40].map((m) => (
        <Label key={m} x={box.x - 8} y={s.sy(m) + 4} anchor="end" size={11} color={C.dim}>
          {m}
        </Label>
      ))}
    </g>
  );
}

const STEPS = [
  { T: 180, top: 100, bot: 87.7, loss: "−12.3 %", gas: "H₂O", c: C.lfp },
  { T: 480, top: 87.7, bot: 68.5, loss: "−19.2 %", gas: "CO", c: C.electron },
  { T: 720, top: 68.5, bot: 38.4, loss: "−30.1 %", gas: "CO₂", c: C.hot },
];

export default function TgaVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Thermogravimetric analysis">
      <Reveal show={is("tga")}>
        <Title y={40}>TGA: weigh while heating</Title>
        <MassAxes />
        <DrawPath d={s.path(OX_PTS)} show={is("tga")} color={C.accent} />
        <DrawPath d={s.path(D_PTS)} show={is("tga")} color={C.anion} width={2} delay={0.8} />
        <Label x={s.sx(980)} y={s.sy(42) - 8} anchor="end" size={13} color={C.accent}>
          mass (TG)
        </Label>
        <Label x={s.sx(330)} y={s.sy(33)} size={13} color={C.anion}>
          derivative (DTG)
        </Label>
        <Chip x={300} y={400} text="each step = a mass loss · each DTG peak = its fastest point" w={460} />
      </Reveal>

      <Reveal show={is("oxalate")}>
        <Title y={40}>Calcium oxalate monohydrate</Title>
        <MassAxes />
        <DrawPath d={s.path(OX_PTS)} show={is("oxalate")} color={C.accent} />
        {STEPS.map((st, i) => (
          <motion.g key={st.gas} initial={false} animate={{ opacity: is("oxalate") ? 1 : 0 }} transition={{ delay: is("oxalate") ? 0.6 + i * 0.3 : 0 }}>
            <line x1={s.sx(st.T + 70)} x2={s.sx(st.T + 70)} y1={s.sy(st.top)} y2={s.sy(st.bot)} stroke={st.c} strokeWidth={2} markerEnd="url(#arrow)" />
            <Label x={s.sx(st.T + 82)} y={(s.sy(st.top) + s.sy(st.bot)) / 2} anchor="start" size={14} weight={800} color={st.c}>
              {`${st.loss} ${st.gas}`}
            </Label>
          </motion.g>
        ))}
        <Label x={300} y={400} size={13}>
          CaC₂O₄·H₂O → CaC₂O₄ → CaCO₃ → CaO
        </Label>
        <Label x={300} y={422} size={12} color={C.dim}>
          measured 12.34 / 18.7 / 30.09 % vs theory 12.3 / 19.2 / 30.1 %
        </Label>
      </Reveal>

      <Reveal show={is("copper")}>
        <Title>CuSO₄·5H₂O: what should each step weigh?</Title>
        <Bars
          items={[
            { label: "CuSO₄·5H₂O", value: 100, color: C.lfp, note: "250 g/mol" },
            { label: "5 H₂O", value: 36, color: C.cation, note: "90 g/mol" },
            { label: "SO₂", value: 25.6, color: C.electron, note: "64.1 g/mol" },
            { label: "½ O₂", value: 6.4, color: C.hot, note: "16 g/mol" },
            { label: "CuO left", value: 31.8, color: C.copper, note: "79.5 g/mol" },
            { label: "Cu₂O left", value: 28.6, color: C.anion, note: "if reduced further" },
          ]}
          x={160}
          y={75}
          gap={50}
          w={330}
          max={100}
          show={is("copper")}
          format={(v) => `${v} %`}
        />
        <Chip x={300} y={405} text="theoretical losses identify each step" w={320} />
      </Reveal>

      <Reveal show={is("coupling")}>
        <Title>Which gas is it? Couple an analyser</Title>
        <rect x={40} y={140} width={150} height={120} rx={14} fill="#111a2c" stroke={C.accent} strokeWidth={2} />
        <Label x={115} y={195} size={16} weight={700} color={C.accent}>
          TGA / STA
        </Label>
        <Label x={115} y={216} size={12} color={C.dim}>
          how much mass
        </Label>
        <rect x={250} y={150} width={110} height={100} rx={14} fill="#111a2c" stroke={C.electron} strokeWidth={2} strokeDasharray="6 4" />
        <Label x={305} y={196} size={15} weight={700} color={C.electron}>
          GC
        </Label>
        <Label x={305} y={216} size={11} color={C.dim}>
          optional: separate
        </Label>
        <rect x={420} y={140} width={150} height={120} rx={14} fill="#111a2c" stroke={C.hot} strokeWidth={2} />
        <Label x={495} y={195} size={16} weight={700} color={C.hot}>
          MS
        </Label>
        <Label x={495} y={216} size={12} color={C.dim}>
          which molecules
        </Label>
        <Flow path="M190 200 L250 200" count={3} dur={1.2} color={C.lfp} r={5} />
        <Flow path="M360 200 L420 200" count={3} dur={1.2} color={C.lfp} r={5} />
        {[
          ["m/z 18", "H₂O"],
          ["m/z 28", "CO"],
          ["m/z 44", "CO₂"],
        ].map(([m, g], i) => (
          <g key={m}>
            <Chip x={170 + i * 130} y={320} text={`${m} → ${g}`} color={C.hot} w={120} />
          </g>
        ))}
        <Label x={300} y={385} size={14}>
          the gas signal appears exactly at each mass step
        </Label>
      </Reveal>
    </Stage>
  );
}
