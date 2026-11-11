"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Card, Title } from "../blocks";

const box = { x: 80, y: 80, w: 460, h: 250 };
const s = makeScale(box, [0, 300], [-1, 1]);
const g = (T: number, at: number, w: number) => Math.exp(-(((T - at) / w) ** 2));
const sig = (T: number, at: number, w: number) => 1 / (1 + Math.exp(-(T - at) / w));

/* A semi-crystalline polymer DSC trace, exo up: Tg step, cold crystallisation, melting, decomposition. */
const trace = (T: number) => 0.15 - 0.12 * sig(T, 70, 3) + 0.55 * g(T, 120, 9) - 0.75 * g(T, 200, 8) + (T > 255 ? -(((T - 255) / 45) ** 2) * 0.6 : 0);
const TRACE: [number, number][] = Array.from({ length: 301 }, (_, T) => [T, trace(T)]);

/* DTA: temperature difference, melting dips (endo), crystallisation rises. */
const dta = (T: number) => -0.7 * g(T, 160, 10) + 0.5 * g(T, 240, 9);
const DTA: [number, number][] = Array.from({ length: 301 }, (_, T) => [T, dta(T)]);

/* Aging: enthalpy relaxation peak at Tg grows with annealing time. */
const aBox = { x: 90, y: 90, w: 430, h: 230 };
const as = makeScale(aBox, [60, 140], [-0.2, 1.3]);
const AGES = [0, 1, 5, 20];
const aged = (T: number, h: number) => 0.9 - 0.35 * sig(T, 100, 2) - (Math.log1p(h) / Math.log1p(20)) * 0.42 * g(T, 102, 3);

function HeatAxes({ y = "heat flow (exo ↑)" }: { y?: string }) {
  return (
    <g>
      <Axes box={box} xLabel="temperature →" yLabel={y} />
      <line x1={box.x} x2={box.x + box.w} y1={s.sy(0)} y2={s.sy(0)} stroke={C.grid} strokeDasharray="4 4" />
    </g>
  );
}

export default function DscVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="DTA and DSC">
      <Reveal show={is("dta")}>
        <Title y={40}>DTA: sample vs reference temperature</Title>
        <HeatAxes y="ΔT = T(sample) − T(ref)" />
        <DrawPath d={s.path(DTA)} show={is("dta")} color={C.electron} />
        <Label x={s.sx(160)} y={s.sy(-0.7) + 24} size={13} color={C.lfp}>
          melting: sample lags (endo)
        </Label>
        <Label x={s.sx(240)} y={s.sy(0.5) - 12} size={13} color={C.hot}>
          crystallises / reacts: runs ahead (exo)
        </Label>
        <Chip x={300} y={395} text="DTA sees that something happens, not exactly how much heat" w={460} />
      </Reveal>

      <Reveal show={is("dsc")}>
        <Title>DSC: heat flow, so peak area = enthalpy</Title>
        <Card
          x={30}
          y={80}
          w={260}
          h={200}
          show={is("dsc")}
          title="DTA"
          color={C.electron}
          lines={["measures ΔT between", "sample and reference", "", "qualitative: when", "events happen"]}
        />
        <Card
          x={310}
          y={80}
          w={260}
          h={200}
          show={is("dsc")}
          delay={0.2}
          title="DSC"
          color={C.hot}
          lines={["measures heat flow", "into / out of the sample", "", "quantitative: ΔH in J/g", "from the peak area"]}
        />
        <Chip x={300} y={330} text="STA = TGA + DSC at once: mass loss and heat flow together" w={460} color={C.accent} />
        <Label x={300} y={380} size={13} color={C.dim}>
          check the sign convention on every plot: exo up or endo up
        </Label>
      </Reveal>

      <Reveal show={is("events")}>
        <Title y={40}>Reading a polymer DSC curve</Title>
        <HeatAxes />
        <DrawPath d={s.path(TRACE)} show={is("events")} color={C.accent} dur={2} />
        {[
          { T: 70, y: 0.42, t: "Tg: step", c: C.lfp },
          { T: 120, y: 0.82, t: "cold crystallisation (exo)", c: C.electron },
          { T: 200, y: -0.86, t: "melting Tm (endo)", c: C.hot },
          { T: 262, y: 0.35, t: "decomposition", c: C.dim },
        ].map((e, i) => (
          <motion.g key={e.t} initial={false} animate={{ opacity: is("events") ? 1 : 0 }} transition={{ delay: is("events") ? 0.6 + i * 0.35 : 0 }}>
            <Label x={s.sx(e.T)} y={s.sy(e.y)} size={13} weight={700} color={e.c}>
              {e.t}
            </Label>
          </motion.g>
        ))}
        <Label x={300} y={400} size={13} color={C.dim}>
          Tg: heat capacity jumps as the chains start to move
        </Label>
      </Reveal>

      <Reveal show={is("crystallinity")}>
        <Title>Degree of crystallinity from the melting peak</Title>
        <rect x={60} y={90} width={220} height={220} rx={14} fill="#111a2c" stroke={C.grid} />
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i} d={`M80 ${120 + i * 14} l 70 0`} stroke={C.accent} strokeWidth={3} />
        ))}
        <path d="M160 140 C200 100 230 220 260 160 M90 230 C140 200 160 300 240 260 M180 290 C200 250 250 300 265 230" fill="none" stroke={C.hot} strokeWidth={3} />
        <Label x={115} y={210} size={12} color={C.accent}>
          crystalline
        </Label>
        <Label x={210} y={310} size={12} color={C.hot}>
          amorphous
        </Label>
        <Label x={440} y={120} size={15} weight={700}>
          polyethylene
        </Label>
        <Label x={440} y={160} size={14}>
          measured ΔHm = 146 J/g
        </Label>
        <Label x={440} y={185} size={14}>
          100 % crystal = 293 J/g
        </Label>
        <line x1={340} x2={540} y1={205} y2={205} stroke={C.dim} />
        <Label x={440} y={240} size={22} weight={800} color={C.accent}>
          χ ≈ 0.50
        </Label>
        <Chip x={300} y={380} text="only crystals melt, so the melting enthalpy counts them" w={420} />
      </Reveal>

      <Reveal show={is("aging")}>
        <Title y={40}>Physical aging of polystyrene</Title>
        <Axes box={aBox} xLabel="temperature (°C)" yLabel="heat flow (endo ↓)" xLabelDy={40} />
        {[80, 100, 120].map((T) => (
          <Label key={T} x={as.sx(T)} y={aBox.y + aBox.h + 16} size={11} color={C.dim}>
            {T}
          </Label>
        ))}
        {AGES.map((h, i) => {
          const off = i * 0.25;
          const pts: [number, number][] = Array.from({ length: 161 }, (_, k) => {
            const T = 60 + k * 0.5;
            return [T, aged(T, h) + off - 0.4];
          });
          const c = [C.lfp, C.accent, C.electron, C.hot][i];
          return (
            <g key={h}>
              <DrawPath d={as.path(pts)} show={is("aging")} color={c} delay={i * 0.3} width={2.5} />
              <Label x={as.sx(138)} y={as.sy(0.55 + off - 0.4) - 4} anchor="end" size={12} color={c}>
                {`${h} h`}
              </Label>
            </g>
          );
        })}
        <Label x={as.sx(78)} y={as.sy(-0.12)} size={12} color={C.dim}>
          annealed at 80 °C
        </Label>
        <Chip x={300} y={395} text="relaxation peak at Tg ≈ 100 °C grows with aging time" w={420} color={C.electron} />
      </Reveal>
    </Stage>
  );
}
