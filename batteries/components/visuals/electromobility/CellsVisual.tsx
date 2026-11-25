"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, Label, Reveal, Stage, makeScale } from "../primitives";
import { Bars, Card, Title } from "../blocks";

const FORMATS = [
  { t: "Cylindrical", pro: ["low cost", "mass production"], con: ["bulky steel/Al can", "low power"], use: "e-bike, tools, Tesla", c: C.lfp },
  { t: "Prismatic", pro: ["efficient packaging", "higher energy density"], con: ["low automation", "many sizes"], use: "EVs, energy storage", c: C.accent },
  { t: "Pouch", pro: ["light, flexible", "highest energy density"], con: ["high cost", "hard to scale"], use: "phone, drone, wearable", c: C.anion },
];

const SIZES = [
  { n: "18650", d: 18, h: 65 },
  { n: "2170", d: 21, h: 70 },
  { n: "4680", d: 46, h: 80 },
];

/* Specific capacity (log axis) vs potential vs Li for the lecture's electrodes. */
const eBox = { x: 80, y: 80, w: 460, h: 250 };
const lx = (q: number) => Math.log10(q);
const es = makeScale(eBox, [lx(100), lx(5000)], [0, 4.2]);
const ELECTRODES = [
  { n: "Graphite", q: 372, v: 0.15, conv: false },
  { n: "LTO", q: 160, v: 1.55, conv: false },
  { n: "LiMO₂ / LiMPO₄", q: 150, v: 3.7, conv: false },
  { n: "Si", q: 3580, v: 0.4, conv: true },
  { n: "S₈", q: 1672, v: 2.15, conv: true },
  { n: "O₂", q: 3840, v: 2.9, conv: true },
];

type Grade = "H" | "M" | "L";
const COLS = ["Power", "Energy", "Safety", "Life", "Cost", "Perf."];
/* Lecture table. For cost, H means expensive. */
const CHEM: { n: string; full: string; g: Grade[]; ev?: boolean }[] = [
  { n: "LCO", full: "lithium cobalt oxide", g: ["L", "H", "L", "L", "H", "M"] },
  { n: "LMO", full: "lithium manganese oxide", g: ["M", "M", "M", "L", "L", "L"] },
  { n: "NCM", full: "nickel manganese cobalt", g: ["M", "H", "M", "M", "L", "M"], ev: true },
  { n: "LFP", full: "lithium iron phosphate", g: ["H", "L", "H", "H", "L", "M"], ev: true },
  { n: "NCA", full: "nickel cobalt aluminium", g: ["M", "H", "L", "M", "M", "M"] },
  { n: "LTO", full: "lithium titanate", g: ["M", "L", "H", "H", "H", "H"] },
];
const good = (g: Grade, col: number) => {
  const flip = col === 4; // high cost is bad
  const score = g === "H" ? 2 : g === "M" ? 1 : 0;
  return flip ? 2 - score : score;
};
const SHADE = ["#7f1d1d", "#713f12", "#14532d"];

export default function CellsVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Battery cells, modules and chemistries for EVs">
      <Reveal show={is("cell-formats")}>
        <Title>Three cell formats</Title>
        {FORMATS.map((f, i) => {
          const x = 20 + i * 192;
          return (
            <motion.g key={f.t} initial={false} animate={{ opacity: is("cell-formats") ? 1 : 0, y: is("cell-formats") ? 0 : 10 }} transition={{ delay: is("cell-formats") ? i * 0.15 : 0 }}>
              <rect x={x} y={70} width={180} height={350} rx={12} fill="#111a2c" stroke={f.c} strokeOpacity={0.7} />
              {i === 0 && <rect x={x + 72} y={90} width={36} height={90} rx={18} fill={f.c} opacity={0.5} stroke={f.c} />}
              {i === 1 && <rect x={x + 45} y={95} width={90} height={80} rx={6} fill={f.c} opacity={0.5} stroke={f.c} />}
              {i === 2 && <path d={`M${x + 55} 92 H${x + 125} V180 H${x + 55} Z M${x + 75} 92 V82 M${x + 105} 92 V82`} fill={f.c} fillOpacity={0.4} stroke={f.c} strokeWidth={2} />}
              <Label x={x + 90} y={210} size={16} weight={700} color={f.c}>
                {f.t}
              </Label>
              {f.pro.map((p, j) => (
                <Label key={p} x={x + 90} y={238 + j * 18} size={12} color={C.lithium}>
                  + {p}
                </Label>
              ))}
              {f.con.map((p, j) => (
                <Label key={p} x={x + 90} y={286 + j * 18} size={12} color={C.hot}>
                  − {p}
                </Label>
              ))}
              <Label x={x + 90} y={350} size={12} color={C.dim}>
                {f.use}
              </Label>
            </motion.g>
          );
        })}
      </Reveal>

      <Reveal show={is("series-parallel")}>
        <Title>Cell → module → pack: 8S2P</Title>
        {[0, 1].map((r) => (
          <g key={r}>
            {Array.from({ length: 8 }, (_, c) => (
              <g key={c}>
                <rect x={70 + c * 58} y={110 + r * 80} width={40} height={50} rx={6} fill={C.lithium} opacity={0.3} stroke={C.lithium} />
                <Label x={90 + c * 58} y={140 + r * 80} size={11}>
                  3.6 V
                </Label>
                {c < 7 && <line x1={110 + c * 58} y1={135 + r * 80} x2={128 + c * 58} y2={135 + r * 80} stroke={C.electron} strokeWidth={2} />}
              </g>
            ))}
          </g>
        ))}
        <path d="M55 135 V215 M55 175 H35" stroke={C.copper} strokeWidth={3} fill="none" />
        <path d="M531 135 V215 M531 175 H551" stroke={C.copper} strokeWidth={3} fill="none" />
        <Label x={300} y={95} size={12} color={C.electron}>
          8 in series → voltage adds
        </Label>
        <Label x={300} y={255} size={12} color={C.copper}>
          2 strings in parallel → capacity adds
        </Label>
        <Bars
          show={is("series-parallel")}
          x={200}
          y={285}
          w={280}
          gap={40}
          max={28.8}
          format={(v) => (v === 28.8 ? "28.8 V" : "10 Ah")}
          items={[
            { label: "Voltage 8 × 3.6 V", value: 28.8, color: C.electron },
            { label: "Capacity 2 × 5 Ah", value: 10, color: C.copper },
          ]}
        />
        <Label x={300} y={385} size={13}>
          energy = 28.8 V × 10 Ah ≈ 288 Wh from 16 cells
        </Label>
        <Label x={300} y={410} size={12} color={C.dim}>
          16S4P: twice the voltage and twice the capacity of 8S2P
        </Label>
      </Reveal>

      <Reveal show={is("cell-size")}>
        <Title>Tesla cells keep growing</Title>
        {SIZES.map((s, i) => {
          const k = 3;
          const w = s.d * k,
            h = s.h * k;
          const cx = 90 + i * 110;
          return (
            <motion.g key={s.n} initial={false} animate={{ opacity: is("cell-size") ? 1 : 0, y: is("cell-size") ? 0 : 12 }} transition={{ delay: is("cell-size") ? i * 0.2 : 0 }}>
              <rect x={cx - w / 2} y={330 - h} width={w} height={h} rx={w / 4} fill={C.zinc} opacity={0.35} stroke={C.zinc} />
              <rect x={cx - w / 6} y={322 - h} width={w / 3} height={8} rx={2} fill={C.zinc} />
              <Label x={cx} y={355} size={15} weight={700} color={C.accent}>
                {s.n}
              </Label>
              <Label x={cx} y={375} size={12} color={C.dim}>
                {s.d} × {s.h} mm
              </Label>
            </motion.g>
          );
        })}
        {["fewer cells, fewer welds", "easier management", "more active material", "higher energy density", "lower cost per Wh"].map((t, i) => (
          <g key={t}>
            <circle cx={420} cy={120 + i * 40} r={6} fill={C.lithium} />
            <Label x={434} y={125 + i * 40} anchor="start" size={13}>
              {t}
            </Label>
          </g>
        ))}
      </Reveal>

      <Reveal show={is("electrodes")}>
        <Title>Electrodes: capacity vs potential</Title>
        <Axes box={eBox} xLabel="specific capacity (mAh/g, log)" yLabel="V vs Li" xLabelDy={34} />
        {[100, 1000].map((q) => (
          <Label key={q} x={es.sx(lx(q))} y={eBox.y + eBox.h + 16} size={11} color={C.dim}>
            {q}
          </Label>
        ))}
        {ELECTRODES.map((e, i) => (
          <motion.g key={e.n} initial={false} animate={{ opacity: is("electrodes") ? 1 : 0, scale: is("electrodes") ? 1 : 0.5 }} transition={{ delay: is("electrodes") ? i * 0.12 : 0 }}>
            <circle cx={es.sx(lx(e.q))} cy={es.sy(e.v)} r={8} fill={e.conv ? C.copper : C.lfp} />
            <Label x={es.sx(lx(e.q)) + (e.q > 3000 ? -12 : 12)} y={es.sy(e.v) - 10} anchor={e.q > 3000 ? "end" : "start"} size={12}>
              {`${e.n} · ${e.q} mAh/g, ${e.v} V`}
            </Label>
          </motion.g>
        ))}
        <circle cx={150} cy={385} r={7} fill={C.lfp} />
        <Label x={162} y={390} anchor="start" size={13}>
          intercalation: reversible
        </Label>
        <circle cx={350} cy={385} r={7} fill={C.copper} />
        <Label x={362} y={390} anchor="start" size={13}>
          conversion: high energy
        </Label>
        <Chip x={300} y={425} text="cell energy = capacity × voltage" w={260} />
      </Reveal>

      <Reveal show={is("chem-table")}>
        <Title>Li-ion chemistries</Title>
        {COLS.map((c, j) => (
          <Label key={c} x={215 + j * 62} y={85} size={12} weight={700} color={C.accent}>
            {c}
          </Label>
        ))}
        {CHEM.map((r, i) => (
          <motion.g key={r.n} initial={false} animate={{ opacity: is("chem-table") ? 1 : 0 }} transition={{ delay: is("chem-table") ? i * 0.08 : 0 }}>
            {r.ev && <rect x={22} y={96 + i * 48} width={556} height={44} rx={8} fill="none" stroke={C.accent} strokeWidth={2} />}
            <Label x={40} y={118 + i * 48} anchor="start" size={15} weight={700}>
              {r.n}
            </Label>
            <Label x={40} y={133 + i * 48} anchor="start" size={10} color={C.dim}>
              {r.full}
            </Label>
            {r.g.map((g, j) => (
              <g key={j}>
                <rect x={188 + j * 62} y={100 + i * 48} width={54} height={36} rx={6} fill={SHADE[good(g, j)]} />
                <Label x={215 + j * 62} y={124 + i * 48} size={14} weight={700}>
                  {g}
                </Label>
              </g>
            ))}
          </motion.g>
        ))}
        <Label x={300} y={410} size={13} color={C.dim}>
          green = favourable (for cost, L is good) · outlined: the EV workhorses NCM and LFP
        </Label>
      </Reveal>

      <Reveal show={is("solid-state")}>
        <Title>Solid-state batteries for EVs?</Title>
        <Card x={20} y={80} w={270} h={200} show={is("solid-state")} title="Benefits" color={C.lithium} lines={["non-flammable → safer", "could enable Li metal anodes", "could pair with high-voltage", "cathodes"]} />
        <Card
          x={310}
          y={80}
          w={270}
          h={200}
          show={is("solid-state")}
          delay={0.15}
          title="Challenges"
          color={C.hot}
          lines={["Li dendrites; unstable at low V", "unstable at high V", "hard to make (ceramics)", "dry-room stability", "price"]}
        />
        <Chip x={300} y={330} text="unlikely in EVs before 2030" color={C.electron} w={260} />
      </Reveal>

      <Reveal show={is("aviation")}>
        <Title>Electric flight: Dornier 228, same 1900 kg</Title>
        <Bars
          show={is("aviation")}
          x={210}
          y={90}
          w={300}
          gap={58}
          max={22944}
          format={(v) => `${v.toLocaleString("en-US")} kWh`}
          items={[
            { label: "Jet fuel, stored", value: 22944, color: C.copper },
            { label: "Fuel, useful (30 %)", value: 6883, color: C.copper, note: "turboprop" },
            { label: "Battery, stored", value: 484, color: C.lithium, note: "255 Wh/kg pack" },
            { label: "Battery, useful (80 %)", value: 387, color: C.lithium, note: "electric drive" },
          ]}
        />
        <Chip x={300} y={355} text="about 18× less useful energy" color={C.hot} w={250} />
        <Label x={300} y={400} size={13} color={C.dim}>
          batteries still have a long way to go for aircraft
        </Label>
      </Reveal>
    </Stage>
  );
}
