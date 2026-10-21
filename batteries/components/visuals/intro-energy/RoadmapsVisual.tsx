"use client";

import { motion } from "framer-motion";
import { C, Chip, Label, Reveal, Stage, makeScale } from "../primitives";

const SOURCES = [
  { t: "Wind", c: "#93c5fd" },
  { t: "Water", c: C.lfp },
  { t: "Sunlight", c: C.electron },
];
const SECTORS = ["Transport", "Heating / cooling", "Industry", "Agriculture, forestry, fishing"];

// Waterfall of 2050 end-use load in TW.
const wfBox = { x: 60, y: 70, w: 480, h: 270 };
const wf = makeScale(wfBox, [0, 6], [0, 22]);
const STEPS = [
  { label: "BAU 2050", from: 0, to: 20.6, color: C.hot, note: "20.6 TW" },
  { label: "electricity does more work", from: 20.6 * (1 - 0.23), to: 20.6, color: C.accent, note: "−23.0 %" },
  { label: "no mining or refining of fuels", from: 20.6 * (1 - 0.23 - 0.126), to: 20.6 * (1 - 0.23), color: C.accent, note: "−12.6 %" },
  { label: "extra efficiency", from: 20.6 * (1 - 0.23 - 0.126 - 0.069), to: 20.6 * (1 - 0.23 - 0.126), color: C.accent, note: "−6.9 %" },
  { label: "100 % WWS 2050", from: 0, to: 11.8, color: C.lithium, note: "11.8 TW" },
];

const MIX: { t: string; v: number; c: string }[] = [
  { t: "Onshore wind", v: 23.5, c: "#93c5fd" },
  { t: "Solar PV plants", v: 21.4, c: C.electron },
  { t: "Residential rooftop PV", v: 14.9, c: C.electron },
  { t: "Offshore wind", v: 13.6, c: "#93c5fd" },
  { t: "Commercial rooftop PV", v: 11.6, c: C.electron },
  { t: "CSP with storage", v: 9.7, c: C.copper },
  { t: "Hydropower", v: 4.0, c: C.lfp },
  { t: "Geothermal", v: 0.7, c: C.hot },
  { t: "Wave", v: 0.6, c: C.cation },
  { t: "Tidal", v: 0.1, c: C.cation },
];

const STORAGE = ["CSP with heat storage", "Pumped hydro", "Batteries", "Hydropower reservoirs", "Hydrogen", "Heat in rock and water", "Cold in ice", "Demand response"];

const ASSUMPTIONS = [
  { t: "One method, 139 countries", s: "averages over very different places", c: C.lfp },
  { t: "No electricity trade", s: "each country self-supplies", c: C.accent },
  { t: "Hydropower frozen", s: "2015 capacity, higher capacity factor", c: C.lfp },
  { t: "Immature technology", s: "e-aircraft, wave, tidal, H₂, storage", c: C.hot },
  { t: "Grid not tested here", s: "companion study, hourly model", c: C.anion },
  { t: "80 % by 2030", s: "faster than any past transition", c: C.electron },
];

const TENSIONS = [
  { a: "small scale", b: "large scale" },
  { a: "existing plant", b: "new plant" },
  { a: "central", b: "decentral" },
  { a: "use less", b: "more energy" },
  { a: "one bet", b: "spread bets" },
];

export default function RoadmapsVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="100% wind, water and solar roadmaps">
      {/* idea */}
      <Reveal show={is("wws")}>
        <Label x={300} y={40} size={16} weight={700}>
          100 % wind, water, sunlight for 139 countries
        </Label>
        {SOURCES.map((s, i) => (
          <g key={s.t}>
            <rect x={30} y={80 + i * 80} width={110} height={56} rx={12} fill={s.c} opacity={0.16} stroke={s.c} />
            <Label x={85} y={114 + i * 80} size={15} weight={700} color={s.c}>
              {s.t}
            </Label>
            <line x1={140} y1={108 + i * 80} x2={215} y2={190} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />
          </g>
        ))}
        <rect x={215} y={150} width={140} height={80} rx={14} fill={C.accent} opacity={0.18} stroke={C.accent} />
        <Label x={285} y={186} size={16} weight={800} color={C.accent}>
          Electricity
        </Label>
        <Label x={285} y={208} size={12} color={C.dim}>
          (+ electrolytic H₂)
        </Label>
        {SECTORS.map((s, i) => (
          <g key={s}>
            <line x1={355} y1={190} x2={420} y2={92 + i * 62} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />
            <rect x={424} y={70 + i * 62} width={150} height={44} rx={10} fill="#111a2c" stroke={C.grid} />
            <Label x={499} y={97 + i * 62} size={s.length > 18 ? 11 : 13}>
              {s}
            </Label>
          </g>
        ))}
        <Chip x={160} y={350} text="80 % by 2030" color={C.electron} w={150} />
        <Chip x={330} y={350} text="100 % by 2050" color={C.lithium} w={160} />
        <Label x={300} y={400} size={14} color={C.dim}>
          one possible end state, not a prediction
        </Label>
      </Reveal>

      {/* demand waterfall */}
      <Reveal show={is("demand")}>
        <Label x={300} y={40} size={16} weight={700}>
          End-use power demand, 139 countries
        </Label>
        <line x1={wfBox.x} y1={wfBox.y + wfBox.h} x2={wfBox.x + wfBox.w} y2={wfBox.y + wfBox.h} stroke={C.dim} strokeWidth={1.5} />
        {STEPS.map((s, i) => {
          const x = wf.sx(i + 0.12);
          const w = wf.sx(i + 0.88) - x;
          return (
            <motion.g key={s.label} initial={false} animate={{ opacity: is("demand") ? 1 : 0 }} transition={{ delay: is("demand") ? i * 0.25 : 0 }}>
              <rect x={x} y={wf.sy(s.to)} width={w} height={wf.sy(s.from) - wf.sy(s.to)} rx={4} fill={s.color} opacity={0.75} />
              <Label x={x + w / 2} y={wf.sy(s.to) - 8} size={14} weight={800} color={s.color}>
                {s.note}
              </Label>
              <Label x={x + w / 2} y={wfBox.y + wfBox.h + 20} size={11} color={C.dim}>
                {s.label.split(" ").slice(0, Math.ceil(s.label.split(" ").length / 2)).join(" ")}
              </Label>
              <Label x={x + w / 2} y={wfBox.y + wfBox.h + 34} size={11} color={C.dim}>
                {s.label.split(" ").slice(Math.ceil(s.label.split(" ").length / 2)).join(" ")}
              </Label>
            </motion.g>
          );
        })}
        <Chip x={300} y={408} text="total: −42.5 %" color={C.lithium} w={160} />
      </Reveal>

      {/* generation mix */}
      <Reveal show={is("mix")}>
        <Label x={300} y={34} size={16} weight={700}>
          Share of 2050 end-use power by source (%)
        </Label>
        {MIX.map((m, i) => (
          <motion.g key={m.t} initial={false} animate={{ opacity: is("mix") ? 1 : 0 }} transition={{ delay: is("mix") ? i * 0.08 : 0 }}>
            <Label x={190} y={69 + i * 30} size={13} anchor="end">
              {m.t}
            </Label>
            <rect x={200} y={54 + i * 30} width={Math.max(3, m.v * 15)} height={22} rx={4} fill={m.c} opacity={0.8} />
            <Label x={206 + m.v * 15} y={70 + i * 30} size={12} color={C.dim} anchor="start">
              {m.v.toFixed(1)}
            </Label>
          </motion.g>
        ))}
        <Label x={300} y={386} size={13} color={C.hot}>
          not included: nuclear · coal with carbon capture · biofuels
        </Label>
        <Label x={300} y={408} size={13} color={C.dim}>
          hydropower: no new capacity, only a higher capacity factor
        </Label>
      </Reveal>

      {/* land */}
      <Reveal show={is("land")}>
        <Label x={300} y={40} size={16} weight={700}>
          Land and rooftops
        </Label>
        <rect x={40} y={70} width={200} height={200} fill={C.grid} opacity={0.6} stroke={C.dim} />
        <rect x={40} y={70} width={19} height={19} fill={C.accent} opacity={0.5} stroke={C.accent} strokeDasharray="4 3" />
        <rect x={40} y={70} width={9.4} height={9.4} fill={C.lithium} />
        <Label x={140} y={292} size={13} weight={700}>
          land of the 139 countries
        </Label>
        <Label x={62} y={112} size={13} color={C.lithium} anchor="start">
          0.22 % footprint
        </Label>
        <Label x={62} y={134} size={13} color={C.accent} anchor="start">
          0.92 % spacing (onshore wind)
        </Label>
        <Label x={140} y={320} size={12} color={C.dim}>
          offshore wind, wave, tidal: in the water
        </Label>
        <Label x={420} y={90} size={14} weight={700}>
          Rooftop PV, no new land
        </Label>
        {[
          { t: "Residential roofs", v: 34.9, c: C.electron },
          { t: "Commercial / government", v: 68.2, c: C.copper },
        ].map((r, i) => (
          <g key={r.t}>
            <Label x={300} y={128 + i * 70} size={13} anchor="start" color={C.dim}>
              {r.t}
            </Label>
            <rect x={300} y={138 + i * 70} width={260} height={22} rx={6} fill={C.grid} />
            <rect x={300} y={138 + i * 70} width={(260 * r.v) / 100} height={22} rx={6} fill={r.c} opacity={0.85} />
            <Label x={306} y={154 + i * 70} size={12} color="#0b1220" anchor="start" weight={700}>
              {`${r.v} % of potential used`}
            </Label>
          </g>
        ))}
        <Chip x={430} y={300} text="more PV where sunny and rich" color={C.dim} w={230} />
      </Reveal>

      {/* matching */}
      <Reveal show={is("match")}>
        <Label x={300} y={34} size={16} weight={700}>
          Matching supply and demand
        </Label>
        <rect x={30} y={60} width={130} height={80} rx={12} fill="#111a2c" stroke={C.grid} />
        <Label x={95} y={92} size={14} weight={700}>
          Wind + solar
        </Label>
        <Label x={95} y={114} size={12} color={C.dim}>
          weather-driven
        </Label>
        <rect x={30} y={160} width={130} height={80} rx={12} fill="#111a2c" stroke={C.grid} />
        <Label x={95} y={192} size={14} weight={700}>
          Demand
        </Label>
        <Label x={95} y={214} size={12} color={C.dim}>
          hourly, all sectors
        </Label>
        <line x1={160} y1={100} x2={200} y2={150} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />
        <line x1={160} y1={200} x2={200} y2={170} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />
        <rect x={200} y={120} width={130} height={70} rx={12} fill={C.accent} opacity={0.16} stroke={C.accent} />
        <Label x={265} y={150} size={14} weight={800} color={C.accent}>
          Grid model
        </Label>
        <Label x={265} y={170} size={12} color={C.dim}>
          5 years, 30 s steps
        </Label>
        <line x1={330} y1={155} x2={360} y2={155} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />
        {STORAGE.map((s, i) => (
          <g key={s}>
            <rect x={364} y={58 + i * 28} width={210} height={23} rx={8} fill={C.lithium} opacity={0.14} stroke={C.lithium} />
            <Label x={469} y={74 + i * 28} size={12}>
              {s}
            </Label>
          </g>
        ))}
        {[
          { t: "Base power", s: "steady, almost always on", c: C.lfp },
          { t: "Balancing power", s: "follows fast swings", c: C.electron },
          { t: "Reserve power", s: "spare for outages", c: C.hot },
        ].map((d, i) => (
          <g key={d.t}>
            <rect x={30 + i * 190} y={310} width={180} height={64} rx={12} fill={d.c} opacity={0.12} stroke={d.c} />
            <Label x={120 + i * 190} y={338} size={14} weight={700} color={d.c}>
              {d.t}
            </Label>
            <Label x={120 + i * 190} y={360} size={12} color={C.dim}>
              {d.s}
            </Label>
          </g>
        ))}
        <Label x={300} y={410} size={13} color={C.dim}>
          several storage mixes keep supply = demand, with no nuclear or fossil backup
        </Label>
      </Reveal>

      {/* costs */}
      <Reveal show={is("costs")}>
        <Label x={300} y={34} size={16} weight={700}>
          Costs and benefits in 2050
        </Label>
        <Label x={150} y={66} size={13} color={C.dim}>
          cost of electricity (¢/kWh)
        </Label>
        {[
          { t: "BAU", v: 9.78, c: C.hot },
          { t: "WWS", v: 8.86, c: C.lithium },
          { t: "WWS + storage", v: 9.66, c: C.accent },
        ].map((b, i) => (
          <g key={b.t}>
            <Label x={30} y={96 + i * 36} size={13} anchor="start">
              {b.t}
            </Label>
            <rect x={140} y={80 + i * 36} width={b.v * 14} height={24} rx={5} fill={b.c} opacity={0.8} />
            <Label x={146 + b.v * 14} y={97 + i * 36} size={12} color={C.dim} anchor="start">
              {b.v}
            </Label>
          </g>
        ))}
        <rect x={30} y={200} width={170} height={84} rx={12} fill={C.hot} opacity={0.12} stroke={C.hot} />
        <Label x={115} y={228} size={12} color={C.dim}>
          air-pollution deaths avoided
        </Label>
        <Label x={115} y={256} size={20} weight={800} color={C.hot}>
          4.6 M / year
        </Label>
        <Label x={115} y={276} size={11} color={C.dim}>
          today; 3.5 M in 2050
        </Label>
        <rect x={215} y={200} width={170} height={84} rx={12} fill={C.electron} opacity={0.12} stroke={C.electron} />
        <Label x={300} y={228} size={12} color={C.dim}>
          damage avoided per year
        </Label>
        <Label x={300} y={256} size={20} weight={800} color={C.electron}>
          ≈ $23 + 28 T
        </Label>
        <Label x={300} y={276} size={11} color={C.dim}>
          health + climate
        </Label>
        <rect x={400} y={200} width={170} height={84} rx={12} fill={C.lithium} opacity={0.12} stroke={C.lithium} />
        <Label x={485} y={228} size={12} color={C.dim}>
          permanent jobs
        </Label>
        <Label x={485} y={256} size={20} weight={800} color={C.lithium}>
          +52 M −28 M
        </Label>
        <Label x={485} y={276} size={11} color={C.dim}>
          net +24.3 M
        </Label>
        <Label x={300} y={330} size={14}>
          up-front ≈ $125 trillion for ≈ 50 TW (≈ $2.5 M/MW vs $2.7 M/MW BAU)
        </Label>
        <Chip x={300} y={380} text="fuel is free: stable energy prices" color={C.accent} w={280} />
      </Reveal>

      {/* assumptions */}
      <Reveal show={is("assumptions")}>
        <Label x={300} y={38} size={16} weight={700}>
          Read it critically: key assumptions
        </Label>
        {ASSUMPTIONS.map((a, i) => {
          const x = 30 + (i % 2) * 280;
          const y = 66 + Math.floor(i / 2) * 110;
          return (
            <motion.g key={a.t} initial={false} animate={{ opacity: is("assumptions") ? 1 : 0, y: is("assumptions") ? 0 : 10 }} transition={{ delay: is("assumptions") ? i * 0.1 : 0 }}>
              <rect x={x} y={y} width={260} height={92} rx={14} fill={a.c} opacity={0.12} stroke={a.c} />
              <Label x={x + 130} y={y + 38} size={15} weight={700} color={a.c}>
                {a.t}
              </Label>
              <Label x={x + 130} y={y + 64} size={12} color={C.dim}>
                {a.s}
              </Label>
            </motion.g>
          );
        })}
      </Reveal>

      {/* debate */}
      <Reveal show={is("debate")}>
        <Label x={300} y={38} size={16} weight={700}>
          Open questions for the seminar
        </Label>
        {TENSIONS.map((t, i) => (
          <g key={t.a}>
            <Label x={30} y={92 + i * 62} size={14} anchor="start" weight={700} color={C.lfp}>
              {t.a}
            </Label>
            <Label x={570} y={92 + i * 62} size={14} anchor="end" weight={700} color={C.electron}>
              {t.b}
            </Label>
            <line x1={170} y1={87 + i * 62} x2={430} y2={87 + i * 62} stroke={C.dim} strokeWidth={2} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          </g>
        ))}
        <Chip x={300} y={410} text="no single source suffices; the best mix is regional" color={C.accent} w={400} />
      </Reveal>
    </Stage>
  );
}
