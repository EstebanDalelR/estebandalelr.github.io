"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

/* growth: population bars */
const POP = [
  { name: "India", pop: 1.4, add: "+14 M / yr", color: C.electron },
  { name: "USA", pop: 0.33, add: "+2 M / yr", color: C.lfp },
];

/* gdp: energy per capita vs GDP per capita (schematic, log-log) */
const gBox = { x: 90, y: 60, w: 450, h: 280 };
const g = makeScale(gBox, [0, 1], [0, 1]);
const COUNTRIES: [number, number, string][] = [
  [0.08, 0.1, ""],
  [0.15, 0.16, ""],
  [0.22, 0.28, "India"],
  [0.3, 0.3, ""],
  [0.4, 0.45, ""],
  [0.48, 0.5, "China"],
  [0.55, 0.52, ""],
  [0.65, 0.66, ""],
  [0.72, 0.63, "Sweden"],
  [0.78, 0.82, ""],
  [0.86, 0.9, "USA"],
  [0.9, 0.78, ""],
];

/* transitions: stacked share of sources over time */
const tBox = { x: 90, y: 60, w: 450, h: 270 };
const t = makeScale(tBox, [1800, 2020], [0, 1]);
// cumulative shares (wood/renewables, coal, oil+gas, other) at each year
const YEARS = [1800, 1850, 1885, 1910, 1940, 1965, 1990, 2020];
const RENEW = [0.98, 0.9, 0.5, 0.22, 0.12, 0.06, 0.07, 0.1];
const COAL = [0.02, 0.1, 0.5, 0.7, 0.55, 0.3, 0.25, 0.25];
const band = (lo: number[], hi: number[]) => {
  const top = YEARS.map((y, i) => [y, hi[i]] as [number, number]);
  const bot = YEARS.map((y, i) => [y, lo[i]] as [number, number]).reverse();
  return t.path([...top, ...bot]) + "Z";
};
const zero = YEARS.map(() => 0);
const r = RENEW;
const rc = RENEW.map((v, i) => v + COAL[i]);
const one = YEARS.map(() => 1);

export default function SocietyVisual({ visual }: { visual: string }) {
  return (
    <Stage label="Energy consumption in society">
      <Reveal show={visual === "growth"}>
        <Label x={300} y={52} size={17} weight={700}>
          Global consumption keeps rising
        </Label>
        {POP.map((p, i) => (
          <g key={p.name}>
            <Label x={130} y={140 + i * 110} anchor="end" size={15} weight={700}>
              {p.name}
            </Label>
            <motion.rect
              x={145}
              y={118 + i * 110}
              height={36}
              rx={8}
              fill={p.color}
              opacity={0.85}
              initial={false}
              animate={{ width: visual === "growth" ? p.pop * 200 : 0 }}
              transition={{ duration: 0.9 }}
            />
            <Label x={155 + p.pop * 200} y={142 + i * 110} anchor="start" size={14}>
              {`${p.pop} bn people`}
            </Label>
            <Chip x={250} y={180 + i * 110} text={p.add} color={p.color} w={130} />
          </g>
        ))}
        <Label x={300} y={400} size={14} color={C.dim}>
          absolute growth, not just per-capita use, must be supplied
        </Label>
        <Label x={300} y={424} size={13} color={C.dim}>
          global total 2023 ≈ 15 000 mtoe / year
        </Label>
      </Reveal>

      <Reveal show={visual === "gdp"}>
        <Axes box={gBox} xLabel="GDP per capita (log) →" yLabel="energy per capita (log)" />
        <DrawPath d={g.path([[0.05, 0.07], [0.95, 0.92]])} show={visual === "gdp"} color={C.accent} width={2.5} dash="6 5" />
        {COUNTRIES.map(([x, y, n]) => (
          <g key={`${x}-${y}`}>
            <circle cx={g.sx(x)} cy={g.sy(y)} r={n ? 8 : 6} fill={n ? C.electron : C.lfp} opacity={0.85} />
            {n && (
              <Label x={g.sx(x) - 12} y={g.sy(y) - 10} anchor="end" size={13}>
                {n}
              </Label>
            )}
          </g>
        ))}
        <Chip x={220} y={100} text="development means more energy" color={C.accent} w={260} />
        <Label x={300} y={410} size={13} color={C.dim}>
          a pattern, not a law: some economies decouple (efficiency, structural change)
        </Label>
      </Reveal>

      <Reveal show={visual === "transitions"}>
        <Axes box={tBox} xLabel="year" yLabel="share of energy supply" xLabelDy={40} />
        <path d={band(zero, r)} fill={C.lithium} opacity={0.55} />
        <path d={band(r, rc)} fill={C.graphite} opacity={0.9} />
        <path d={band(rc, one)} fill={C.copper} opacity={0.6} />
        {[1800, 1885, 1965, 2020].map((y) => (
          <Label key={y} x={t.sx(y)} y={tBox.y + tBox.h + 18} size={12} color={C.dim}>
            {y}
          </Label>
        ))}
        <Label x={t.sx(1840)} y={t.sy(0.5)} size={14} weight={700} color="#0b1220">
          wood / renewables
        </Label>
        <Label x={t.sx(1925)} y={t.sy(0.55)} size={14} weight={700}>
          coal
        </Label>
        <Label x={t.sx(1990)} y={t.sy(0.72)} size={14} weight={700} color="#0b1220">
          oil + gas
        </Label>
        <line x1={t.sx(1885)} x2={t.sx(1885)} y1={tBox.y} y2={tBox.y + tBox.h} stroke={C.ink} strokeDasharray="4 4" />
        <Label x={t.sx(1885) + 6} y={tBox.y + 14} anchor="start" size={12}>
          coal overtakes wood ~1885
        </Label>
        <Label x={t.sx(1965)} y={t.sy(0.06) - 8} size={13} color={C.lithium} weight={800}>
          renewables ~6 %
        </Label>
        <Chip x={300} y={425} text="transitions ADD sources, and take decades" color={C.electron} w={340} />
      </Reveal>

      <Reveal show={visual === "waste"}>
        <Label x={300} y={52} size={17} weight={700}>
          Where primary energy goes
        </Label>
        <rect x={60} y={110} width={40} height={240} fill={C.electron} />
        <Label x={80} y={372} size={13}>
          primary
        </Label>
        <motion.path
          d="M100 110 C220 110 260 90 380 90 L380 250 C260 250 220 270 100 270 Z"
          fill={C.hot}
          opacity={0.55}
          initial={false}
          animate={{ opacity: visual === "waste" ? 0.55 : 0 }}
        />
        <motion.path
          d="M100 270 C220 270 260 300 380 300 L380 380 C260 380 220 350 100 350 Z"
          fill={C.lithium}
          opacity={0.7}
          initial={false}
          animate={{ opacity: visual === "waste" ? 0.7 : 0 }}
        />
        <Label x={480} y={165} size={18} weight={800} color={C.hot}>
          ≈ 2/3
        </Label>
        <Label x={480} y={188} size={14}>
          rejected as heat
        </Label>
        <Label x={480} y={335} size={18} weight={800} color={C.lithium}>
          ≈ 1/3
        </Label>
        <Label x={480} y={358} size={14}>
          useful energy
        </Label>
        <Chip x={300} y={420} text="not bad bookkeeping: the 2nd law at work" color={C.hot} w={330} />
      </Reveal>
    </Stage>
  );
}
