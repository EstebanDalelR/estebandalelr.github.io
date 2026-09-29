"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

const SERVICES = [
  { t: "milliseconds", s: "power quality · fast frequency response", color: C.anion },
  { t: "seconds – minutes", s: "frequency containment & restoration", color: C.accent },
  { t: "hours", s: "arbitrage · peak shaving · solar shifting", color: C.lithium },
  { t: "days", s: "reserve · adequacy (windless week)", color: C.electron },
];

/* cost per kWh of capacity vs duration: Cpower/d + Cenergy (illustrative, $/kW and $/kWh) */
const cBox = { x: 90, y: 60, w: 450, h: 270 };
const cs = makeScale(cBox, [0.5, 16], [0, 900]);
const TECHS = [
  { name: "Li-ion", p: 300, e: 250, color: C.lithium },
  { name: "flow / CAES / H₂", p: 1500, e: 40, color: C.electron },
];
const durations = Array.from({ length: 80 }, (_, i) => 0.5 + (i / 79) * 15.5);
const costCurve = (p: number, e: number) => cs.path(durations.map((d) => [d, Math.min(900, p / d + e)] as [number, number]));
const crossover = (TECHS[1].p - TECHS[0].p) / (TECHS[0].e - TECHS[1].e); // ≈ 5.7 h

/* LCOS vs cycles per year: LCOS ∝ fixed / cycles + variable */
const lBox = { x: 90, y: 60, w: 450, h: 270 };
const ls = makeScale(lBox, [50, 700], [0, 700]);
const lcos = (n: number) => 60 + 36000 / n;
const cycles = Array.from({ length: 80 }, (_, i) => 50 + (i / 79) * 650);

const PARAMS = ["power & energy (duration)", "round-trip efficiency", "lifetime / cycle life", "response time", "cost per kW and per kWh"];

export default function EconomicsVisual({ visual }: { visual: string }) {
  return (
    <Stage label="Grid-scale storage economics">
      <Reveal show={visual === "services"}>
        <Label x={300} y={40} size={17} weight={700}>
          What storage is paid for
        </Label>
        <path d="M60 90 L60 390" stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />
        <Label x={48} y={250} size={12} color={C.dim} anchor="end">
          time
        </Label>
        {SERVICES.map((s, i) => (
          <motion.g key={s.t} initial={false} animate={{ opacity: visual === "services" ? 1 : 0, x: visual === "services" ? 0 : -20 }} transition={{ delay: i * 0.15 }}>
            <circle cx={60} cy={115 + i * 76} r={8} fill={s.color} />
            <rect x={85} y={90 + i * 76} width={470} height={52} rx={12} fill={s.color} opacity={0.14} stroke={s.color} />
            <Label x={100} y={112 + i * 76} anchor="start" size={15} weight={700} color={s.color}>
              {s.t}
            </Label>
            <Label x={100} y={132 + i * 76} anchor="start" size={13}>
              {s.s}
            </Label>
          </motion.g>
        ))}
        <Label x={300} y={430} size={13} color={C.dim}>
          location-specific too: congestion relief, black start
        </Label>
      </Reveal>

      <Reveal show={visual === "capex"}>
        <Axes box={cBox} xLabel="duration (hours)" yLabel="cost per kWh of capacity" xLabelDy={40} />
        {[1, 4, 8, 12, 16].map((d) => (
          <Label key={d} x={cs.sx(d)} y={cBox.y + cBox.h + 18} size={12} color={C.dim}>
            {`${d} h`}
          </Label>
        ))}
        {TECHS.map((t, i) => (
          <DrawPath key={t.name} d={costCurve(t.p, t.e)} show={visual === "capex"} color={t.color} width={3.5} delay={i * 0.3} />
        ))}
        <rect x={cs.sx(1)} y={cBox.y} width={cs.sx(4) - cs.sx(1)} height={cBox.h} fill={C.lithium} opacity={0.08} />
        <Label x={(cs.sx(1) + cs.sx(4)) / 2} y={cBox.y + cBox.h - 14} size={13} weight={700} color={C.lithium}>
          Li-ion wins 1–4 h
        </Label>
        <line x1={cs.sx(crossover)} x2={cs.sx(crossover)} y1={cBox.y + 30} y2={cBox.y + cBox.h} stroke={C.ink} strokeDasharray="4 4" />
        <Label x={cs.sx(crossover) + 8} y={cBox.y + 44} anchor="start" size={13}>
          lines cross
        </Label>
        <Label x={cs.sx(13)} y={cs.sy(TECHS[0].p / 13 + TECHS[0].e) - 12} size={13} weight={700} color={C.lithium}>
          Li-ion
        </Label>
        <Label x={cs.sx(13)} y={cs.sy(TECHS[1].p / 13 + TECHS[1].e) + 22} size={13} weight={700} color={C.electron}>
          flow · CAES · H₂ · pumped hydro
        </Label>
        <Label x={cBox.x + cBox.w - 4} y={cBox.y + 80} anchor="end" size={12} color={C.dim}>
          short: power cost dominates
        </Label>
        <Label x={cBox.x + cBox.w - 4} y={cBox.y + 98} anchor="end" size={12} color={C.dim}>
          long: energy cost dominates
        </Label>
      </Reveal>

      <Reveal show={visual === "lcos"}>
        <Axes box={lBox} xLabel="cycles per year" yLabel="LCOS ($ per MWh discharged)" xLabelDy={40} />
        {[100, 200, 400, 600].map((n) => (
          <Label key={n} x={ls.sx(n)} y={lBox.y + lBox.h + 18} size={12} color={C.dim}>
            {n}
          </Label>
        ))}
        <DrawPath d={ls.path(cycles.map((n) => [n, Math.min(700, lcos(n))] as [number, number]))} show={visual === "lcos"} color={C.electron} width={3.5} />
        {[150, 300].map((n) => (
          <g key={n}>
            <circle cx={ls.sx(n)} cy={ls.sy(lcos(n))} r={6} fill={C.hot} />
            <Label x={ls.sx(n) + 10} y={ls.sy(lcos(n)) - 8} anchor="start" size={13} weight={700}>
              {`${n}/yr → ${Math.round(lcos(n))}`}
            </Label>
          </g>
        ))}
        <Label x={ls.sx(560)} y={ls.sy(lcos(560)) + 26} size={13} color={C.dim}>
          flattens past ~400
        </Label>
        <Chip x={300} y={415} text="halve the cycles → cost per MWh roughly doubles" color={C.hot} w={400} />
      </Reveal>

      <Reveal show={visual === "rural"}>
        <Label x={300} y={38} size={17} weight={700}>
          Exam case: a rural community
        </Label>
        <g transform="translate(50 60)">
          <rect width={230} height={120} rx={12} fill="#111a2c" stroke={C.accent} />
          <Label x={115} y={24} size={14} weight={700} color={C.accent}>
            Services
          </Label>
          <Label x={115} y={52} size={13}>
            frequency & voltage support
          </Label>
          <Label x={115} y={74} size={13}>
            backup during outages
          </Label>
          <Label x={115} y={96} size={13}>
            solar into the evening
          </Label>
        </g>
        <g transform="translate(320 60)">
          <rect width={230} height={120} rx={12} fill="#111a2c" stroke={C.lithium} />
          <Label x={115} y={24} size={14} weight={700} color={C.lithium}>
            Two technologies
          </Label>
          <Label x={115} y={52} size={13}>
            Li-ion: fast, daily cycling
          </Label>
          <Label x={115} y={74} size={13}>
            + flow battery, or pumped
          </Label>
          <Label x={115} y={96} size={13}>
            hydro if hill + water
          </Label>
        </g>
        <Label x={300} y={215} size={14} weight={700} color={C.electron}>
          Decide on five parameters
        </Label>
        {PARAMS.map((p, i) => (
          <motion.g key={p} initial={false} animate={{ opacity: visual === "rural" ? 1 : 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
            <circle cx={170} cy={242 + i * 36} r={10} fill={C.electron} />
            <Label x={170} y={247 + i * 36} size={12} weight={800} color="#0b1220">
              {i + 1}
            </Label>
            <Label x={192} y={247 + i * 36} anchor="start" size={14}>
              {p}
            </Label>
          </motion.g>
        ))}
      </Reveal>
    </Stage>
  );
}
