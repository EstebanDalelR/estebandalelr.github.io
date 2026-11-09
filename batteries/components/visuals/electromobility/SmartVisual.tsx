"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Card, Title } from "../blocks";

const LEVELS = [
  { n: "0", t: "human plugs in", c: C.dim },
  { n: "1–3", t: "increasing assistance", c: C.lfp },
  { n: "4", t: "car parks itself, robot arm plugs in", c: C.electron },
  { n: "5", t: "fully autonomous, no human", c: C.lithium },
];

/* Schematic spot price over a day (öre/kWh). */
const box = { x: 80, y: 80, w: 460, h: 230 };
const s = makeScale(box, [0, 24], [0, 1]);
const PRICE: [number, number][] = Array.from({ length: 49 }, (_, i) => {
  const h = i / 2;
  const morning = Math.exp(-(((h - 8) / 1.6) ** 2)) * 0.55;
  const evening = Math.exp(-(((h - 18.5) / 1.8) ** 2)) * 0.8;
  const solarDip = -Math.exp(-(((h - 13) / 2.2) ** 2)) * 0.12;
  return [h, 0.18 + morning + evening + solarDip];
});

export default function SmartVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Smart and heavy-duty charging">
      <Reveal show={is("automation")}>
        <Title>Charging automation levels</Title>
        {LEVELS.map((l, i) => (
          <motion.g key={l.n} initial={false} animate={{ opacity: is("automation") ? 1 : 0, x: is("automation") ? 0 : -16 }} transition={{ delay: is("automation") ? i * 0.15 : 0 }}>
            <rect x={60} y={80 + i * 70} width={80 + i * 30} height={50} rx={10} fill={l.c} opacity={0.85} />
            <Label x={100 + i * 15} y={111 + i * 70} size={17} weight={800} color="#0b1220">
              {l.n}
            </Label>
            <Label x={160 + i * 30} y={111 + i * 70} anchor="start" size={15}>
              {l.t}
            </Label>
          </motion.g>
        ))}
        <Chip x={300} y={390} text="a level-4 robotaxi still needs a physical connection" w={410} color={C.electron} />
      </Reveal>

      <Reveal show={is("price")}>
        <Title y={40}>When should you charge?</Title>
        <Axes box={box} xLabel="hour of day" yLabel="spot price (schematic)" xLabelDy={40} />
        {[0, 6, 12, 18, 24].map((h) => (
          <Label key={h} x={s.sx(h)} y={box.y + box.h + 16} size={11} color={C.dim}>
            {h}
          </Label>
        ))}
        <rect x={s.sx(0)} y={box.y} width={s.sx(5.5) - s.sx(0)} height={box.h} fill={C.lithium} opacity={0.12} />
        <rect x={s.sx(22.5)} y={box.y} width={s.sx(24) - s.sx(22.5)} height={box.h} fill={C.lithium} opacity={0.12} />
        <DrawPath d={s.path(PRICE)} show={is("price")} color={C.electron} />
        <Label x={s.sx(2.7)} y={box.y + 24} size={13} color={C.lithium} weight={700}>
          charge here
        </Label>
        <Label x={s.sx(18.5)} y={s.sy(1.0) - 10} size={13} color={C.hot} weight={700}>
          evening peak
        </Label>
        <Label x={s.sx(13)} y={s.sy(0.35) + 26} size={12} color={C.dim}>
          sun & wind dip
        </Label>
        <Chip x={300} y={380} text="smart charging: cheaper for you, easier for the grid" w={400} color={C.accent} />
        <Label x={300} y={418} size={12} color={C.dim}>
          real prices: elpriset idag / Nord Pool, per hour and bidding zone
        </Label>
      </Reveal>

      <Reveal show={is("heavy")}>
        <Title>Heavy-duty needs megawatts</Title>
        <Card x={30} y={80} w={260} h={170} show={is("heavy")} title="Car" color={C.lfp} lines={["battery ≈ 50–100 kWh", "home AC 11 kW overnight", "DC 150–350 kW on trips"]} size={14} />
        <Card
          x={310}
          y={80}
          w={260}
          h={170}
          show={is("heavy")}
          delay={0.2}
          title="Long-haul truck"
          color={C.hot}
          lines={["battery: several hundred kWh", "MCS up to 1.44 MW", "depots and freight corridors"]}
          size={14}
        />
        <rect x={60} y={290} width={480} height={110} rx={14} fill="#0b1220" stroke={C.electron} />
        <Label x={300} y={320} size={15} weight={700} color={C.electron}>
          Fit charging into the driver's rest
        </Label>
        <Label x={300} y={346} size={14}>
          EU rules: 45 min break after 4.5 h of driving
        </Label>
        <Label x={300} y={370} size={13} color={C.dim}>
          ≈ 40 min at MCS takes a truck from 20 to 80 %
        </Label>
      </Reveal>

      <Reveal show={is("airport")}>
        <Title>Looking ahead</Title>
        <Card
          x={30}
          y={75}
          w={260}
          h={210}
          show={is("airport")}
          title="Grön Flygplats 2050"
          color={C.lithium}
          lines={["fossil-free aviation", "electrified ground operations", "smart automation", "renewables + storage", "airport as regional energy hub"]}
        />
        <Card
          x={310}
          y={75}
          w={260}
          h={210}
          show={is("airport")}
          delay={0.2}
          title="Solar + electric"
          color={C.electron}
          lines={["agrivoltaics: panels over crops", "autonomous electric tractors", "solar drones: Helios (2001),", "Airbus Zephyr in the", "stratosphere for weeks"]}
        />
        <Label x={300} y={330} size={15} weight={700}>
          Your 2035 charging plan: what comes first?
        </Label>
        {[
          ["coverage", C.lfp],
          ["speed", C.electron],
          ["cost", C.hot],
        ].map(([t, c], i) => (
          <Chip key={t} x={170 + i * 130} y={375} text={t} color={c} w={110} />
        ))}
      </Reveal>
    </Stage>
  );
}
