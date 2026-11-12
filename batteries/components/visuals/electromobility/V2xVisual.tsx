"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Flow, Label, Reveal, Stage, makeScale } from "../primitives";
import { Card, Table, Title } from "../blocks";

/* A schematic day: household load with a morning and an evening peak (arbitrary units). */
const bump = (h: number, mu: number, sig: number) => Math.exp(-(((h - mu) / sig) ** 2) / 2);
const base = (h: number) => 0.32 + 0.16 * bump(h, 8, 1.5) + 0.3 * bump(h, 19, 1.8) + 0.05 * bump(h, 13, 3);
const HRS = Array.from({ length: 97 }, (_, i) => i / 4);

const box = { x: 80, y: 80, w: 460, h: 220 };
const s = makeScale(box, [0, 24], [0, 1.25]);
const curve = (f: (h: number) => number) => s.path(HRS.map((h) => [h, f(h)] as [number, number]));
/** Shaded area between two curves. */
const area = (lo: (h: number) => number, hi: (h: number) => number) =>
  `${s.path(HRS.map((h) => [h, hi(h)] as [number, number]))}${HRS.slice()
    .reverse()
    .map((h) => `L${s.sx(h).toFixed(1)},${s.sy(lo(h)).toFixed(1)}`)
    .join("")}Z`;

/* Extra EV load under each strategy. */
const dumb = (h: number) => 0.3 * bump(h, 19.5, 1.6);
const tariffEv = (h: number) => {
  const t = h >= 22 ? h - 22 : h + 2; // hours since the cheap tariff began
  return 0.75 * (1 - Math.exp(-t * 4)) * Math.exp(-t / 1.4);
};
const smartEv = (h: number) => 0.17 / (1 + Math.exp((h - 6.3) * 5)) + 0.17 / (1 + Math.exp(-(h - 22.7) * 5));

function Hours() {
  return (
    <>
      <Axes box={box} xLabel="hour of day" yLabel="grid load" xLabelDy={40} />
      {[0, 6, 12, 18, 24].map((h) => (
        <Label key={h} x={s.sx(h)} y={box.y + box.h + 16} size={11} color={C.dim}>
          {h}
        </Label>
      ))}
    </>
  );
}

const TOPOLOGIES = [
  { k: "V2L", t: "vehicle-to-load", d: "power a device: camping, outage, rural site", c: C.electron },
  { k: "V2H", t: "vehicle-to-home", d: "run the house at peak price or in a blackout", c: C.lithium },
  { k: "V2B", t: "vehicle-to-building", d: "same for commercial and industrial buildings", c: C.lfp },
  { k: "V2G", t: "vehicle-to-grid", d: "sell energy services to the grid itself", c: C.accent },
];

export default function V2xVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Smart charging strategies and V2X">
      <Reveal show={is("grid")}>
        <Title>From one-way to two-way grid</Title>
        <Card x={20} y={75} w={270} h={250} show={is("grid")} title="Yesterday" color={C.dim} lines={[]} />
        <Card x={310} y={75} w={270} h={250} show={is("grid")} delay={0.2} title="Today" color={C.accent} lines={[]} />
        {/* yesterday: plant → lines → homes */}
        <rect x={45} y={150} width={60} height={70} rx={6} fill={C.dim} opacity={0.3} stroke={C.dim} />
        <Label x={75} y={240} size={12} color={C.dim}>
          power plant
        </Label>
        <line x1={110} y1={185} x2={230} y2={185} stroke={C.dim} strokeWidth={3} />
        <Flow path="M110 185 L230 185" count={4} dur={2} color={C.electron} r={4} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={235} y={150 + i * 30} width={30} height={22} rx={4} fill={C.dim} opacity={0.3} stroke={C.dim} />
        ))}
        <Label x={155} y={290} size={13}>
          central, one direction
        </Label>
        {/* today: many sources and flows both ways */}
        {[
          { x: 360, y: 135, t: "solar", c: C.electron },
          { x: 530, y: 135, t: "wind", c: C.lfp },
          { x: 360, y: 245, t: "battery", c: C.lithium },
          { x: 530, y: 245, t: "EVs", c: C.accent },
        ].map((n) => (
          <g key={n.t}>
            <line x1={n.x} y1={n.y} x2={445} y2={190} stroke={n.c} strokeOpacity={0.5} strokeWidth={2} />
            <circle cx={n.x} cy={n.y} r={24} fill="#0b1220" />
            <circle cx={n.x} cy={n.y} r={24} fill={n.c} opacity={0.22} stroke={n.c} />
            <Label x={n.x} y={n.y + 5} size={12} weight={700} color={n.c}>
              {n.t}
            </Label>
          </g>
        ))}
        <circle cx={445} cy={190} r={30} fill="#0b1220" stroke={C.ink} />
        <Label x={445} y={186} size={11} weight={700}>
          micro
        </Label>
        <Label x={445} y={200} size={11} weight={700}>
          grid
        </Label>
        <Flow path="M510 232 L470 205" count={2} dur={1.5} color={C.accent} r={4} />
        <Flow path="M470 205 L510 232" count={2} dur={1.5} color={C.accent} r={4} />
        <Label x={445} y={300} size={13}>
          decentralised, both directions
        </Label>
        <Chip x={300} y={375} text="EVs arrive as a big new load in the middle of this" w={400} color={C.accent} />
      </Reveal>

      <Reveal show={is("demand")}>
        <Title y={40}>A new load on the evening peak</Title>
        <Hours />
        <path d={area(base, (h) => base(h) + dumb(h))} fill={C.hot} opacity={0.35} />
        <DrawPath d={curve(base)} show={is("demand")} color={C.lfp} />
        <DrawPath d={curve((h) => base(h) + dumb(h))} show={is("demand")} color={C.hot} delay={0.6} />
        <Label x={s.sx(19.5)} y={s.sy(base(19.5) + dumb(19.5)) - 12} size={13} weight={700} color={C.hot}>
          plug in after work
        </Label>
        <Label x={s.sx(4)} y={s.sy(base(4)) - 12} size={12} color={C.lfp}>
          households
        </Label>
        <Chip x={200} y={380} text="higher peaks · voltage drops · overloads" w={300} color={C.hot} />
        <Chip x={472} y={380} text="parked ~90 % of the day" w={196} color={C.lithium} />
      </Reveal>

      <Reveal show={is("uncontrolled")}>
        <Title y={40}>1 · Uncontrolled (dumb) charging</Title>
        <Hours />
        <path d={area(base, (h) => base(h) + dumb(h))} fill={C.hot} opacity={0.4} />
        <DrawPath d={curve((h) => base(h) + dumb(h))} show={is("uncontrolled")} color={C.hot} />
        <DrawPath d={curve(base)} show={is("uncontrolled")} color={C.lfp} width={2} dash="5 5" />
        <Label x={s.sx(19.5)} y={s.sy(base(19.5) + dumb(19.5)) - 12} size={13} weight={700} color={C.hot}>
          starts at plug-in, runs until full
        </Label>
        <Label x={300} y={365} size={14}>
          ordinary load · flat price · no incentive to wait
        </Label>
        <Chip x={300} y={400} text="cure: costly grid and generation reinforcement" w={380} color={C.hot} />
      </Reveal>

      <Reveal show={is("tariff")}>
        <Title y={40}>2 · Multiple tariff (time-of-use)</Title>
        <Hours />
        <rect x={s.sx(22)} y={box.y} width={s.sx(24) - s.sx(22)} height={box.h} fill={C.lithium} opacity={0.12} />
        <rect x={s.sx(0)} y={box.y} width={s.sx(6) - s.sx(0)} height={box.h} fill={C.lithium} opacity={0.12} />
        <Label x={s.sx(3)} y={box.y + 18} size={12} weight={700} color={C.lithium}>
          cheap tariff
        </Label>
        <path d={area(base, (h) => base(h) + tariffEv(h))} fill={C.electron} opacity={0.4} />
        <DrawPath d={curve((h) => base(h) + tariffEv(h))} show={is("tariff")} color={C.electron} />
        <DrawPath d={curve(base)} show={is("tariff")} color={C.lfp} width={2} dash="5 5" />
        <Label x={s.sx(20.4)} y={s.sy(base(22.4) + tariffEv(22.4)) - 10} size={13} weight={700} color={C.electron}>
          everyone starts at 22:00
        </Label>
        <Label x={300} y={365} size={14}>
          user still decides · price nudges the timing
        </Label>
        <Chip x={300} y={400} text="still uncontrolled: synchronised start → a new peak" w={410} color={C.electron} />
      </Reveal>

      <Reveal show={is("smart")}>
        <Title y={40}>3 · Smart (controlled) charging</Title>
        <Hours />
        <path d={area(base, (h) => base(h) + smartEv(h))} fill={C.lithium} opacity={0.4} />
        <DrawPath d={curve((h) => base(h) + smartEv(h))} show={is("smart")} color={C.lithium} />
        <DrawPath d={curve(base)} show={is("smart")} color={C.lfp} width={2} dash="5 5" />
        <Label x={s.sx(3.2)} y={s.sy(base(3) + smartEv(3)) - 26} size={13} weight={700} color={C.lithium}>
          spread over the night
        </Label>
        <rect x={110} y={348} width={380} height={76} rx={12} fill="#111a2c" stroke={C.accent} />
        <Label x={300} y={370} size={14} weight={700} color={C.accent}>
          aggregator (or DSO) sets each car's power
        </Label>
        <Label x={300} y={392} size={13}>
          from grid conditions · market prices · available generation
        </Label>
        <Label x={300} y={412} size={12} color={C.dim}>
          users still get their charge · fleet sells ancillary services
        </Label>
      </Reveal>

      <Reveal show={is("v2g")}>
        <Title>4 · Bidirectional charging (V2G / V2X)</Title>
        <rect x={60} y={110} width={140} height={110} rx={14} fill={C.lfp} opacity={0.15} stroke={C.lfp} />
        <Label x={130} y={170} size={16} weight={700} color={C.lfp}>
          grid
        </Label>
        <rect x={400} y={110} width={140} height={110} rx={14} fill={C.accent} opacity={0.15} stroke={C.accent} />
        <Label x={470} y={160} size={16} weight={700} color={C.accent}>
          EV battery
        </Label>
        <Label x={470} y={182} size={12} color={C.dim}>
          distributed storage
        </Label>
        <Flow path="M205 145 L395 145" count={4} dur={2} color={C.lithium} r={5} />
        <Flow path="M395 190 L205 190" count={4} dur={2} color={C.electron} r={5} />
        <Label x={300} y={132} size={13} color={C.lithium}>
          charge when cheap
        </Label>
        <Label x={300} y={215} size={13} color={C.electron}>
          discharge at high demand
        </Label>
        <Label x={300} y={268} size={14} weight={700}>
          peak shaving · load balancing · voltage support · reserves
        </Label>
        <Label x={300} y={292} size={13} color={C.dim}>
          more reserve capacity than smart charging alone
        </Label>
        <Chip x={300} y={345} text="cost: extra cycles → battery degradation" w={340} color={C.hot} />
        <Chip x={300} y={390} text="owners need a bigger incentive" w={260} color={C.hot} />
      </Reveal>

      <Reveal show={is("strategy-table")}>
        <Title y={36}>Test yourself: the four strategies</Title>
        <Table
          x={10}
          y={64}
          cols={[120, 85, 115, 75, 75, 110]}
          rowH={52}
          size={12}
          show={is("strategy-table")}
          highlight={4}
          rows={[
            ["Strategy", "User ctrl", "Grid ctrl", "Price", "Export", "Grid benefit"],
            ["Dumb", "High", "None", "No", "No", "Very limited"],
            ["Multiple tariff", "High", "None", "Yes", "No", "Moderate"],
            ["Smart", "Moderate", "Aggregator/DSO", "Yes", "No", "High"],
            ["V2G", "Moderate", "Aggregator/DSO", "Yes", "Yes", "Highest"],
          ]}
        />
        <Label x={300} y={350} size={14}>
          only V2G sends power back to the grid
        </Label>
      </Reveal>

      <Reveal show={is("topologies")}>
        <Title>V2X topologies</Title>
        {TOPOLOGIES.map((t, i) => (
          <motion.g key={t.k} initial={false} animate={{ opacity: is("topologies") ? 1 : 0, x: is("topologies") ? 0 : -16 }} transition={{ delay: is("topologies") ? i * 0.15 : 0 }}>
            <rect x={40} y={75 + i * 70} width={520} height={56} rx={12} fill={t.c} opacity={0.14} stroke={t.c} />
            <Label x={90} y={110 + i * 70} size={20} weight={800} color={t.c}>
              {t.k}
            </Label>
            <Label x={150} y={98 + i * 70} anchor="start" size={14} weight={700}>
              {t.t}
            </Label>
            <Label x={150} y={118 + i * 70} anchor="start" size={13} color={C.dim}>
              {t.d}
            </Label>
          </motion.g>
        ))}
        <Chip x={300} y={385} text="V1G = smart charging, no export" w={280} color={C.lithium} />
        <Label x={300} y={425} size={11} color={C.dim}>
          Thompson & Perez, Energy Policy 137 (2020)
        </Label>
      </Reveal>
    </Stage>
  );
}
