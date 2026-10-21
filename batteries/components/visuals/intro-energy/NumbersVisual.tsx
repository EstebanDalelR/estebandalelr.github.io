"use client";

import { C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

function Card({ x, title, big, sub, color }: { x: number; title: string; big: string; sub: string; color: string }) {
  return (
    <g>
      <rect x={x} y={150} width={250} height={140} rx={16} fill={color} opacity={0.12} stroke={color} />
      <Label x={x + 125} y={180} size={14} color={C.dim}>
        {title}
      </Label>
      <Label x={x + 125} y={232} size={26} weight={800} color={color}>
        {big}
      </Label>
      <Label x={x + 125} y={264} size={13}>
        {sub}
      </Label>
    </g>
  );
}

const yearBox = { x: 70, y: 330, w: 460, h: 80 };
const yearScale = makeScale(yearBox, [0, 12], [0, 1]);
const months = Array.from({ length: 49 }, (_, i) => i / 4);
// Swedish solar peaks in June (month 5.5), heating demand peaks in January (month 0.5 / 12.5).
const solarYear = months.map((m) => [m, Math.max(0.03, 0.5 - 0.47 * Math.cos(((m - 5.5) / 12) * 2 * Math.PI))] as [number, number]);
const heatYear = months.map((m) => [m, 0.5 + 0.45 * Math.cos(((m - 0.5) / 12) * 2 * Math.PI)] as [number, number]);

export default function NumbersVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Orders of magnitude for energy supply">
      {/* totals */}
      <Reveal show={is("totals")}>
        <Label x={300} y={44} size={17} weight={700}>
          How much energy do we use?
        </Label>
        <Card x={30} title="Sweden, per year" big="≈ 370 TWh" sub="final energy use" color={C.lfp} />
        <Card x={320} title="World, on average" big="≈ 12 TW" sub="≈ 100,000 TWh per year" color={C.electron} />
        <Label x={155} y={314} size={13} color={C.dim}>
          electricity ≈ 140 TWh, a bit over a third
        </Label>
        <Label x={445} y={314} size={13} color={C.dim}>
          electricity only ≈ 20 %
        </Label>
        <rect x={60} y={350} width={480} height={30} rx={8} fill={C.grid} />
        <rect x={60} y={350} width={384} height={30} rx={8} fill={C.hot} opacity={0.8} />
        <Label x={252} y={371} size={14} weight={700} color="#0b1220">
          fossil fuels ≈ 80 %
        </Label>
        <Label x={492} y={371} size={13}>
          rest
        </Label>
        <Label x={300} y={404} size={13} color={C.dim}>
          share of the world&apos;s energy supply
        </Label>
      </Reveal>

      {/* wind */}
      <Reveal show={is("wind")}>
        <Label x={300} y={44} size={17} weight={700}>
          Wind: how many turbines?
        </Label>
        <Chip x={160} y={96} text="η ≈ 45 % (Betz limit 59 %)" color={C.accent} w={250} />
        <Chip x={440} y={96} text="capacity factor ≈ 35 %" color={C.accent} w={220} />
        <Chip x={300} y={128} text="5 MW × 0.35 × 8760 h ≈ 15 GWh per year" color={C.electron} w={380} />
        <Card x={30} title="Sweden" big="≈ 25,000" sub="turbines" color={C.lfp} />
        <Card x={320} title="World" big="≈ 7 million" sub="turbines" color={C.electron} />
        <Label x={300} y={340} size={13} color={C.dim}>
          order of magnitude: 370 TWh ÷ 15 GWh, and 100,000 TWh ÷ 15 GWh
        </Label>
      </Reveal>

      {/* nuclear */}
      <Reveal show={is("nuclear")}>
        <Label x={300} y={44} size={17} weight={700}>
          Nuclear: how many reactors?
        </Label>
        <Chip x={160} y={96} text="≈ 440 reactors today" color={C.accent} w={220} />
        <Chip x={440} y={96} text="≈ 1 GW × 90 % ≈ 8 TWh/yr" color={C.accent} w={240} />
        <Card x={30} title="Sweden" big="≈ 45" sub="reactors (it has 6)" color={C.lfp} />
        <Card x={320} title="World" big="> 10,000" sub="reactors, ≈ 30 × today" color={C.electron} />
      </Reveal>

      {/* solar */}
      <Reveal show={is("solar")}>
        <Label x={300} y={44} size={17} weight={700}>
          Solar: how much area?
        </Label>
        <Chip x={160} y={86} text="module efficiency ≈ 20 %" color={C.accent} w={230} />
        <Chip x={440} y={86} text="≈ 200 kWh/m² per year (Sweden)" color={C.accent} w={270} />
        <rect x={30} y={112} width={250} height={110} rx={16} fill={C.lfp} opacity={0.12} stroke={C.lfp} />
        <Label x={155} y={148} size={13} color={C.dim}>
          Sweden
        </Label>
        <Label x={155} y={182} size={22} weight={800} color={C.lfp}>
          ≈ 2,000 km²
        </Label>
        <Label x={155} y={206} size={13}>
          under 0.5 % of the country
        </Label>
        <rect x={320} y={112} width={250} height={110} rx={16} fill={C.electron} opacity={0.12} stroke={C.electron} />
        <Label x={445} y={148} size={13} color={C.dim}>
          World
        </Label>
        <Label x={445} y={182} size={22} weight={800} color={C.electron}>
          ≈ 350,000 km²
        </Label>
        <Label x={445} y={206} size={13}>
          about the area of Germany
        </Label>
        <Axes2 />
        <DrawPath d={yearScale.path(heatYear)} show={is("solar")} color={C.hot} width={3} />
        <DrawPath d={yearScale.path(solarYear)} show={is("solar")} color={C.electron} width={3} delay={0.4} />
        <Label x={yearScale.sx(2.2)} y={yearScale.sy(1) - 6} size={12} color={C.hot} anchor="start">
          heating demand
        </Label>
        <Label x={yearScale.sx(6.4)} y={yearScale.sy(0.97) - 4} size={12} color={C.electron} anchor="start">
          solar output
        </Label>
        <Label x={yearScale.sx(0)} y={yearBox.y + yearBox.h + 18} size={12} color={C.dim} anchor="start">
          Jan
        </Label>
        <Label x={yearScale.sx(6)} y={yearBox.y + yearBox.h + 18} size={12} color={C.dim}>
          Jul
        </Label>
        <Label x={yearScale.sx(12)} y={yearBox.y + yearBox.h + 18} size={12} color={C.dim} anchor="end">
          Dec
        </Label>
        <Label x={300} y={262} size={13} color={C.dim}>
          Does the sun shine when we least need it? In Sweden, partly
        </Label>
      </Reveal>

      {/* biomass */}
      <Reveal show={is("biomass")}>
        <Label x={300} y={44} size={17} weight={700}>
          Biomass: how much land?
        </Label>
        <Chip x={160} y={96} text="photosynthesis ≈ 1 %" color={C.accent} w={220} />
        <Chip x={440} y={96} text="≈ 5–10 kWh/m² per year" color={C.accent} w={240} />
        <Card x={30} title="Sweden" big="≈ 50,000 km²" sub="about a tenth of the country" color={C.lfp} />
        <Card x={320} title="World" big="≈ 10 million km²" sub="most of today's cropland" color={C.electron} />
        <Label x={300} y={340} size={14}>
          tens of times the area of solar panels
        </Label>
        <Label x={300} y={364} size={13} color={C.dim}>
          order-of-magnitude estimates: the ranking is what matters
        </Label>
      </Reveal>
    </Stage>
  );
}

function Axes2() {
  return (
    <g stroke={C.dim} strokeWidth={1.5}>
      <line x1={yearBox.x} y1={yearBox.y + yearBox.h} x2={yearBox.x + yearBox.w} y2={yearBox.y + yearBox.h} />
    </g>
  );
}
