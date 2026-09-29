"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

const box = { x: 80, y: 60, w: 460, h: 280 };
const s = makeScale(box, [0, 24], [0, 1.1]);
const hours = Array.from({ length: 97 }, (_, i) => i / 4);

const demand = (h: number) => 0.6 + 0.12 * Math.sin(((h - 8) / 24) * 2 * Math.PI) + 0.18 * Math.exp(-(((h - 19) / 2.2) ** 2));
const solar = (h: number, k: number) => Math.max(0, k * Math.sin(((h - 6) / 12) * Math.PI));
const wind = (h: number) => 0.18 + 0.1 * Math.sin(h * 0.9) + 0.06 * Math.sin(h * 2.3);

const demandPath = s.path(hours.map((h) => [h, demand(h)]));
const windPath = s.path(hours.map((h) => [h, wind(h)]));
const solarPath = s.path(hours.map((h) => [h, solar(h, 0.55)]));
const netPath = (k: number) => s.path(hours.map((h) => [h, Math.max(0.02, demand(h) - solar(h, k))]));

export default function WhyStorageVisual({ visual }: { visual: string }) {
  const chart = visual !== "peak";
  return (
    <Stage label="Variability and the role of storage">
      <Reveal show={chart}>
        <Axes box={box} xLabel="hour of day" yLabel="power" xLabelDy={40} />
        {[0, 6, 12, 18, 24].map((h) => (
          <Label key={h} x={s.sx(h)} y={box.y + box.h + 18} size={12} color={C.dim}>
            {`${h}:00`}
          </Label>
        ))}
        <DrawPath d={demandPath} show={chart} color={C.ink} width={3} />
        <Label x={s.sx(22.6)} y={s.sy(0.72)} size={13} weight={700}>
          demand
        </Label>
      </Reveal>

      <Reveal show={visual === "variability"}>
        <DrawPath d={solarPath} show={visual === "variability"} color={C.electron} width={3} />
        <DrawPath d={windPath} show={visual === "variability"} color="#93c5fd" width={3} delay={0.3} />
        <Label x={s.sx(12)} y={s.sy(0.55) - 10} size={13} weight={700} color={C.electron}>
          solar
        </Label>
        <Label x={s.sx(2)} y={s.sy(0.32)} size={13} weight={700} color="#93c5fd">
          wind
        </Label>
        <Chip x={300} y={430} text="set by weather, not demand: seconds to seasons" color={C.electron} w={380} />
      </Reveal>

      <Reveal show={visual === "net-load" || visual === "buys-time"}>
        {[0.3, 0.55, 0.8].map((k, i) => (
          <DrawPath key={k} d={netPath(k)} show={visual === "net-load" || visual === "buys-time"} color={[C.lfp, C.accent, C.hot][i]} width={2.5} delay={i * 0.35} />
        ))}
        <Reveal show={visual === "net-load"}>
          <Label x={s.sx(12)} y={s.sy(0.08) - 6} size={13} weight={700} color={C.hot}>
            midday dip
          </Label>
        </Reveal>
        <Label x={s.sx(19.2)} y={s.sy(0.32)} size={13} weight={700} color={C.hot} anchor="start">
          ← steep evening ramp
        </Label>
        <Label x={box.x + 8} y={box.y + 12} anchor="start" size={13} color={C.dim}>
          net load = demand − wind − solar, as solar grows
        </Label>
      </Reveal>

      <Reveal show={visual === "buys-time"}>
        <motion.rect x={s.sx(10)} y={s.sy(0.3)} width={s.sx(15) - s.sx(10)} height={s.sy(0) - s.sy(0.3)} fill={C.lithium} opacity={0.25} />
        <motion.rect x={s.sx(18)} y={s.sy(0.95)} width={s.sx(21) - s.sx(18)} height={s.sy(0.55) - s.sy(0.95)} fill={C.electron} opacity={0.3} />
        <Label x={s.sx(12.5)} y={s.sy(0.26)} size={13} weight={700} color={C.lithium}>
          charge
        </Label>
        <Label x={s.sx(19.5)} y={s.sy(0.99)} size={13} weight={700} color={C.electron}>
          discharge
        </Label>
        <Chip x={300} y={430} text="storage buys time, at the cost of efficiency" color={C.lithium} w={360} />
      </Reveal>

      <Reveal show={visual === "peak"}>
        <Label x={300} y={48} size={17} weight={700}>
          Peak shaving: the Uppsala battery
        </Label>
        {Array.from({ length: 4 }, (_, i) => (
          <g key={i}>
            <rect x={90 + i * 70} y={110} width={60} height={120} rx={6} fill={C.lfp} opacity={0.8} />
            <rect x={98 + i * 70} y={122} width={44} height={10} rx={2} fill={C.lithium} />
          </g>
        ))}
        <Label x={220} y={255} size={13} color={C.dim}>
          second-life BMW car batteries
        </Label>
        <g transform="translate(400 110)">
          <rect width={170} height={120} rx={12} fill="#111a2c" stroke={C.accent} />
          <Label x={85} y={34} size={20} weight={800} color={C.accent}>
            5 MW
          </Label>
          <Label x={85} y={64} size={20} weight={800} color={C.accent}>
            20 MWh
          </Label>
          <Label x={85} y={96} size={13}>
            4 h at full power
          </Label>
        </g>
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i} transform={`translate(${90 + i * 48} 300)`}>
            <path d="M0 22 L16 8 L32 22 L32 44 L0 44 Z" fill={C.electron} opacity={0.75} />
          </g>
        ))}
        <Label x={300} y={375} size={15} weight={700}>
          ≈ 1700 family houses
        </Label>
        <Chip x={300} y={420} text="charge when demand and price are low, discharge at the peak" color={C.accent} w={450} />
      </Reveal>
    </Stage>
  );
}
