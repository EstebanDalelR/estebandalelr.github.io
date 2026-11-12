"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Card, Title } from "../blocks";

/* Schematic energy use per km vs ambient temperature: U-shaped, lowest near 25 °C. */
const box = { x: 90, y: 80, w: 440, h: 220 };
const s = makeScale(box, [-15, 40], [0, 1.9]);
const use = (t: number) => 1 + 0.00045 * (t - 25) ** 2 * (t < 25 ? 1 : 1.6);
const TEMPS = Array.from({ length: 111 }, (_, i) => -15 + i / 2);

const WORRIES = ["finding a free charger", "whether it works", "waiting time", "charging cost"];

export default function RangeVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Range anxiety and what drains the range">
      <Reveal show={is("anxiety")}>
        <Title>From range anxiety to charging anxiety</Title>
        <motion.g initial={false} animate={{ opacity: is("anxiety") ? 1 : 0 }}>
          <rect x={40} y={80} width={230} height={80} rx={40} fill={C.dim} opacity={0.15} stroke={C.dim} />
          <Label x={155} y={127} size={17} weight={700} color={C.dim}>
            Can I get there?
          </Label>
        </motion.g>
        <motion.path
          d="M280 120 L320 120"
          stroke={C.ink}
          strokeWidth={2}
          markerEnd="url(#arrow)"
          initial={false}
          animate={{ opacity: is("anxiety") ? 1 : 0 }}
          transition={{ delay: 0.3 }}
        />
        <motion.g initial={false} animate={{ opacity: is("anxiety") ? 1 : 0 }} transition={{ delay: is("anxiety") ? 0.5 : 0 }}>
          <rect x={330} y={70} width={240} height={100} rx={40} fill={C.accent} opacity={0.15} stroke={C.accent} />
          <Label x={450} y={115} size={16} weight={700} color={C.accent}>
            Can I charge when
          </Label>
          <Label x={450} y={137} size={16} weight={700} color={C.accent}>
            I get there?
          </Label>
        </motion.g>
        <Label x={155} y={190} size={12} color={C.dim}>
          early EVs: short range, few chargers
        </Label>
        <Label x={450} y={190} size={12} color={C.dim}>
          from about 2024
        </Label>
        {WORRIES.map((w, i) => (
          <motion.g key={w} initial={false} animate={{ opacity: is("anxiety") ? 1 : 0, x: is("anxiety") ? 0 : -12 }} transition={{ delay: is("anxiety") ? 0.8 + i * 0.12 : 0 }}>
            <circle cx={180} cy={240 + i * 40} r={8} fill={C.electron} />
            <Label x={200} y={245 + i * 40} anchor="start" size={15}>
              {w}
            </Label>
          </motion.g>
        ))}
      </Reveal>

      <Reveal show={is("factors")}>
        <Title>What sets the real range?</Title>
        <Card x={20} y={75} w={180} h={175} show={is("factors")} title="The driver" color={C.electron} lines={["driving style", "speed", "charging habits", "load carried"]} size={13} />
        <Card
          x={210}
          y={75}
          w={180}
          h={175}
          show={is("factors")}
          delay={0.15}
          title="The car"
          color={C.accent}
          lines={["weight", "shape (drag)", "tyre pressure", "propulsion system", "auxiliaries: heat, A/C"]}
          size={13}
        />
        <Card
          x={400}
          y={75}
          w={180}
          h={175}
          show={is("factors")}
          delay={0.3}
          title="The conditions"
          color={C.lfp}
          lines={["temperature", "wind and weather", "road gradient", "traffic", "route length"]}
          size={13}
        />
        <Chip x={300} y={310} text="discuss: which matters most, and why?" w={330} color={C.accent} />
      </Reveal>

      <Reveal show={is("cold")}>
        <Title y={40}>Cold weather drains the range</Title>
        <Axes box={box} xLabel="ambient temperature (°C)" yLabel="energy per km (relative)" xLabelDy={40} />
        {[-10, 0, 10, 25, 40].map((t) => (
          <Label key={t} x={s.sx(t)} y={box.y + box.h + 16} size={11} color={C.dim}>
            {t}
          </Label>
        ))}
        <rect x={s.sx(-15)} y={box.y} width={s.sx(5) - s.sx(-15)} height={box.h} fill={C.lfp} opacity={0.1} />
        <rect x={s.sx(32)} y={box.y} width={s.sx(40) - s.sx(32)} height={box.h} fill={C.hot} opacity={0.1} />
        <DrawPath d={s.path(TEMPS.map((t) => [t, use(t)] as [number, number]))} show={is("cold")} color={C.electron} />
        <circle cx={s.sx(25)} cy={s.sy(1)} r={7} fill={C.lithium} />
        <Label x={s.sx(25)} y={s.sy(1) + 26} size={12} weight={700} color={C.lithium}>
          best ≈ 25 °C
        </Label>
        <Label x={s.sx(-5)} y={box.y + box.h - 14} size={12} weight={700} color={C.lfp}>
          sluggish battery + cabin heating
        </Label>
        <Label x={s.sx(36)} y={box.y + box.h - 14} size={12} weight={700} color={C.hot}>
          A/C
        </Label>
        <Chip x={300} y={380} text="Nissan Leaf, UK 2016–19: ≈ 70 % more energy per km in cold months" w={500} color={C.lfp} />
        <Label x={300} y={418} size={11} color={C.dim}>
          schematic curve · specific consumption = energy used ÷ distance (Energy 238, 2022)
        </Label>
      </Reveal>
    </Stage>
  );
}
