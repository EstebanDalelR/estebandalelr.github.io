"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Table, Title } from "../blocks";

const STAGES = ["Pure ICE", "Start-stop", "Mild HEV", "Strong HEV", "PHEV", "EV"];
const FACTORS = [
  { t: "Electric range", s: "10, 50, 100, 200 km?", c: C.lithium },
  { t: "Energy per km", s: "100, 200, 300 Wh/km?", c: C.lfp },
  { t: "Performance", s: "commuter or sport?", c: C.anion },
  { t: "Geography", s: "temperature, terrain?", c: C.electron },
];

/* Schematic SOC traces: a charge-sustaining hybrid and a plug-in hybrid (charge, deplete, sustain). */
const csBox = { x: 50, y: 90, w: 220, h: 150 };
const cdBox = { x: 330, y: 90, w: 230, h: 150 };
const cs = makeScale(csBox, [0, 100], [0, 1]);
const cd = makeScale(cdBox, [0, 100], [0, 1]);
const wob = (t: number) => 0.55 + 0.07 * Math.sin(t * 0.9) + 0.04 * Math.sin(t * 2.3 + 1);
const csPts: [number, number][] = Array.from({ length: 101 }, (_, i) => [i, wob(i)]);
const cdPts: [number, number][] = Array.from({ length: 101 }, (_, i) => {
  if (i < 20) return [i, 0.3 + (0.6 * i) / 20];
  if (i < 65) return [i, 0.9 - (0.65 * (i - 20)) / 45 + 0.03 * Math.sin(i * 1.7)];
  return [i, 0.25 + 0.04 * Math.sin(i * 1.3) + 0.02 * Math.sin(i * 3.1)];
});

/* Schematic speed distributions of hybrid trucks on three routes. */
const uBox = { x: 60, y: 90, w: 230, h: 200 };
const sBox = { x: 340, y: 90, w: 220, h: 200 };
const us = makeScale(uBox, [0, 100], [0, 1]);
const ss = makeScale(sBox, [0, 100], [0, 1]);
const g = (x: number, m: number, w: number) => Math.exp(-(((x - m) / w) ** 2));
const ROUTES = [
  { n: "Urban", c: C.hot, f: (v: number) => 0.55 * g(v, 2, 6) + 0.35 * g(v, 25, 12) + 0.1 * g(v, 50, 10) },
  { n: "Rural", c: C.electron, f: (v: number) => 0.3 * g(v, 2, 5) + 0.2 * g(v, 45, 14) + 0.75 * g(v, 82, 4) },
  { n: "Inter-city", c: C.lfp, f: (v: number) => 0.2 * g(v, 2, 5) + 0.95 * g(v, 87, 3) },
];
const SOC_P = [
  { c: C.hot, f: (x: number) => 0.9 * g(x, 22, 3) + 0.25 * g(x, 40, 10) },
  { c: C.electron, f: (x: number) => 0.6 * g(x, 30, 4) + 0.2 * g(x, 45, 8) },
  { c: C.lfp, f: (x: number) => 0.45 * g(x, 30, 5) + 0.15 * g(x, 50, 8) },
];
const V = Array.from({ length: 101 }, (_, i) => i);

export default function EvBatteriesVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Battery requirements for different electric vehicles">
      <Reveal show={is("app-criteria")}>
        <Title>What each application wants from a battery</Title>
        <Table
          x={15}
          y={70}
          cols={[120, 150, 150, 150]}
          show={is("app-criteria")}
          rowH={46}
          size={12.5}
          rows={[
            ["", "Electronics", "Electric vehicle", "Grid storage"],
            ["Energy", "150–300 Wh/kg", "100–150 Wh/kg", "50–100 Wh/kg"],
            ["Cost", "any", "100–150 $/kWh", "as low as possible"],
            ["Temperature", "5 to 40 °C", "−20 to 60 °C", "−20 to 50 °C"],
            ["Calendar life", "2–3 years", "10–15 years", "15–20 years"],
            ["Cycle life", "500–1000 deep", "3000–7000", "10–15 k shallow"],
            ["Rate", "slow–fast", "fast", "slow"],
          ]}
        />
        <Label x={300} y={420} size={13} color={C.dim}>
          for an EV, cost and calendar life are the hard demands
        </Label>
      </Reveal>

      <Reveal show={is("jamais-contente")}>
        <Title>1899: La Jamais Contente</Title>
        <path d="M90 200 Q150 130 300 140 Q430 145 470 200 Z" fill={C.accent} opacity={0.2} stroke={C.accent} strokeWidth={2} />
        <circle cx={160} cy={205} r={22} fill="#0b1220" stroke={C.ink} strokeWidth={2} />
        <circle cx={400} cy={205} r={22} fill="#0b1220" stroke={C.ink} strokeWidth={2} />
        <Chip x={300} y={95} text="first car past 100 km/h: 105.88 km/h" w={300} color={C.electron} />
        <Label x={300} y={265} size={14}>
          2 motors · 50 kW · 100 lead-acid cells in series (2 V each) · 7 h to charge
        </Label>
        <rect x={100} y={300} width={400} height={34} rx={6} fill="#111a2c" stroke={C.grid} />
        <motion.rect x={100} y={300} height={34} rx={6} fill={C.copper} initial={false} animate={{ width: is("jamais-contente") ? 200 : 0 }} transition={{ duration: 0.9 }} />
        <Label x={200} y={322} size={13} weight={700} color="#0b1220">
          battery ≈ 725 kg
        </Label>
        <Label x={400} y={322} size={13} color={C.dim}>
          rest of the car
        </Label>
        <Label x={300} y={360} size={13} color={C.dim}>
          1450 kg in total — half of it battery
        </Label>
        <Label x={300} y={400} size={14} color={C.hot}>
          weight and range let combustion win for the next 100 years
        </Label>
      </Reveal>

      <Reveal show={is("electrification")}>
        <Title>Degree of electrification</Title>
        <path d="M50 190 L550 190 L550 90 Z" fill={C.lithium} opacity={0.25} stroke={C.lithium} />
        {STAGES.map((s, i) => (
          <g key={s}>
            <line x1={50 + i * 100} y1={190} x2={50 + i * 100} y2={198} stroke={C.dim} />
            <Label x={50 + i * 100} y={214} size={12}>
              {s}
            </Label>
          </g>
        ))}
        <Label x={50} y={236} anchor="start" size={12} color={C.dim}>
          0 %
        </Label>
        <Label x={550} y={236} anchor="end" size={12} color={C.dim}>
          100 %
        </Label>
        <Label x={300} y={262} size={13} color={C.accent}>
          EREV: drives on the motor only; a small engine just charges the battery
        </Label>
        {FACTORS.map((f, i) => (
          <motion.g key={f.t} initial={false} animate={{ opacity: is("electrification") ? 1 : 0 }} transition={{ delay: is("electrification") ? 0.3 + i * 0.12 : 0 }}>
            <rect x={20 + i * 142} y={290} width={132} height={90} rx={12} fill={f.c} opacity={0.14} stroke={f.c} />
            <Label x={86 + i * 142} y={325} size={13} weight={700} color={f.c}>
              {f.t}
            </Label>
            <Label x={86 + i * 142} y={350} size={11}>
              {f.s}
            </Label>
          </motion.g>
        ))}
        <Label x={300} y={410} size={13} color={C.dim}>
          what sets the optimal degree of electrification
        </Label>
      </Reveal>

      <Reveal show={is("cs-cd")}>
        <Title>Charge sustaining vs charge depleting</Title>
        <Axes box={csBox} xLabel="time" yLabel="SOC" xLabelDy={40} />
        <DrawPath d={cs.path(csPts)} show={is("cs-cd")} color={C.electron} width={2} />
        <Label x={160} y={110} size={13} weight={700} color={C.electron}>
          HEV: charge sustaining
        </Label>
        <Axes box={cdBox} xLabel="time" yLabel="SOC" xLabelDy={40} />
        <DrawPath d={cd.path(cdPts)} show={is("cs-cd")} color={C.lithium} width={2} />
        {[20, 65].map((t) => (
          <line key={t} x1={cd.sx(t)} y1={cdBox.y} x2={cd.sx(t)} y2={cdBox.y + cdBox.h} stroke={C.dim} strokeDasharray="4 4" />
        ))}
        <Label x={cd.sx(10)} y={cdBox.y + cdBox.h + 20} size={11} color={C.dim}>
          plug in
        </Label>
        <Label x={cd.sx(42)} y={cdBox.y + cdBox.h + 20} size={11} color={C.dim}>
          depleting
        </Label>
        <Label x={cd.sx(83)} y={cdBox.y + cdBox.h + 20} size={11} color={C.dim}>
          sustaining
        </Label>
        <Label x={445} y={110} size={13} weight={700} color={C.lithium}>
          PHEV
        </Label>
        <Table
          x={90}
          y={300}
          cols={[120, 100, 100, 100]}
          show={is("cs-cd")}
          rowH={38}
          size={13}
          rows={[
            ["Vehicle", "HEV", "PHEV", "EV"],
            ["Pack size", "< 3 kWh", "5–15 kWh", "30–100 kWh"],
          ]}
        />
        <Label x={300} y={410} size={12} color={C.dim}>
          an EV is charge depleting all the way
        </Label>
      </Reveal>

      <Reveal show={is("usage")}>
        <Title>Usage conditions matter (hybrid trucks)</Title>
        <Axes box={uBox} xLabel="speed (km/h)" yLabel="share of time" />
        <Axes box={sBox} xLabel="SOC (%)" yLabel="share of time" />
        {ROUTES.map((r, i) => (
          <g key={r.n}>
            <DrawPath d={us.path(V.map((v) => [v, r.f(v)]))} show={is("usage")} color={r.c} width={2} delay={i * 0.2} />
            <DrawPath d={ss.path(V.map((v) => [v, SOC_P[i].f(v)]))} show={is("usage")} color={r.c} width={2} delay={0.6 + i * 0.2} />
            <circle cx={180 + i * 110} cy={350} r={6} fill={r.c} />
            <Label x={192 + i * 110} y={355} anchor="start" size={13}>
              {r.n}
            </Label>
          </g>
        ))}
        <Label x={ss.sx(30)} y={sBox.y + 30} anchor="start" size={12} color={C.hot}>
          near the lower limit
        </Label>
        <Label x={300} y={400} size={13} color={C.dim}>
          the hybrid strategy draws SOC down during acceleration
        </Label>
      </Reveal>
    </Stage>
  );
}
