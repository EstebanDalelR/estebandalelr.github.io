"use client";

import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Card, Title } from "../blocks";

/* EU greenhouse gas emissions relative to 1990 (=100). */
const box = { x: 80, y: 80, w: 450, h: 250 };
const s = makeScale(box, [1990, 2050], [0, 110]);
const ACTUAL: [number, number][] = [
  [1990, 100],
  [2000, 92],
  [2007, 92],
  [2010, 86],
  [2015, 78],
  [2020, 68],
  [2024, 60.5],
];
const PATH: [number, number][] = [
  [2024, 60.5],
  [2030, 45],
  [2040, 20],
  [2050, 0],
];

export default function PolicyVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Climate policy for transport">
      <Reveal show={is("targets")}>
        <Title y={40}>EU greenhouse gas emissions (1990 = 100)</Title>
        <Axes box={box} xLabel="year" yLabel="% of 1990" xLabelDy={40} />
        {[1990, 2010, 2030, 2050].map((y) => (
          <Label key={y} x={s.sx(y)} y={box.y + box.h + 16} size={11} color={C.dim}>
            {y}
          </Label>
        ))}
        <DrawPath d={s.path(ACTUAL)} show={is("targets")} color={C.accent} />
        <DrawPath d={s.path(PATH)} show={is("targets")} color={C.electron} dash="6 5" delay={1} />
        <circle cx={s.sx(2024)} cy={s.sy(60.5)} r={6} fill={C.accent} />
        <Label x={s.sx(2024) - 8} y={s.sy(60.5) + 26} anchor="end" size={13} color={C.accent}>
          2024: −39.5 %
        </Label>
        <circle cx={s.sx(2030)} cy={s.sy(45)} r={6} fill={C.electron} />
        <Label x={s.sx(2030) + 10} y={s.sy(45) - 8} anchor="start" size={13} color={C.electron}>
          2030: at least −55 %
        </Label>
        <circle cx={s.sx(2050)} cy={s.sy(0)} r={6} fill={C.lithium} />
        <Label x={s.sx(2050)} y={s.sy(28)} anchor="end" size={13} color={C.lithium}>
          2050: net zero
        </Label>
        <Label x={300} y={400} size={13} color={C.dim}>
          more renewables, less carbon-intensive fuels, better efficiency
        </Label>
        <Label x={300} y={420} size={12} color={C.dim}>
          source: EEA greenhouse gas inventory 2026 (path after 2024 schematic)
        </Label>
      </Reveal>

      <Reveal show={is("fit55")}>
        <Title>Fit for 55 (2021)</Title>
        {[
          { t: "CO₂ standards", c: C.hot, l: ["cars and vans:", "no new combustion", "engines from 2035"] },
          { t: "AFIR", c: C.lfp, l: ["alternative fuels", "infrastructure: charging", "& refuelling, port power"] },
          { t: "ReFuelEU", c: C.electron, l: ["aviation:", "sustainable", "aviation fuels"] },
        ].map((p, i) => (
          <Card key={p.t} x={25 + i * 190} y={80} w={170} h={160} title={p.t} color={p.c} lines={p.l} show={is("fit55")} delay={i * 0.2} size={14} />
        ))}
        <Chip x={300} y={290} text="−55 % net emissions by 2030 vs 1990" color={C.accent} w={340} />
        <Label x={300} y={350} size={14}>
          revises EU climate, energy, transport and tax law
        </Label>
        <Label x={300} y={372} size={14}>
          so policy matches the agreed climate goals
        </Label>
      </Reveal>

      <Reveal show={is("sweden")}>
        <Title>Sweden's climate framework</Title>
        {[
          ["2030", "domestic transport −70 % vs 2010", C.lfp],
          ["2040", "emissions −75 % vs 1990", C.electron],
          ["2045", "net zero (≥ 85 % below 1990)", C.lithium],
          ["after", "negative emissions", C.accent],
        ].map(([y, t, c], i) => (
          <g key={y}>
            <circle cx={90} cy={100 + i * 56} r={26} fill="#111a2c" stroke={c} strokeWidth={2} />
            <Label x={90} y={105 + i * 56} size={14} weight={800} color={c}>
              {y}
            </Label>
            <Label x={135} y={105 + i * 56} anchor="start" size={15}>
              {t}
            </Label>
          </g>
        ))}
        <rect x={60} y={325} width={480} height={95} rx={14} fill="#0b1220" stroke={C.dim} />
        <Label x={300} y={352} size={14} weight={700}>
          EU road transport
        </Label>
        <Label x={300} y={376} size={13} color={C.dim}>
          CO₂ may have peaked in 2025 · ≈ −25 % by 2035 projected
        </Label>
        <Label x={300} y={398} size={13} color={C.dim}>
          &gt; 1.1 million public charging points by 2026
        </Label>
      </Reveal>
    </Stage>
  );
}
