"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Flow, Label, Reveal, Stage, makeScale } from "../primitives";

const TREE = [
  { name: "Mechanical", kids: ["Pumped hydro", "CAES", "Flywheels"], color: "#93c5fd" },
  { name: "Thermal", kids: ["Sensible", "Latent", "Liquid air"], color: C.hot },
  { name: "Chemical", kids: ["Hydrogen", "Synthetic gas"], color: C.electron },
  { name: "Electro-magnetic", kids: ["Capacitors", "SMES"], color: C.anion },
  { name: "Electro-chemical", kids: ["Batteries", "High-T", "Flow"], color: C.lithium },
];

/* Ragone, log10 Wh/kg (x) vs log10 W/kg (y) */
const rBox = { x: 90, y: 50, w: 450, h: 300 };
const rg = makeScale(rBox, [-2, 4], [0, 6]);
const REGIONS = [
  { name: "Capacitors", cx: -1.4, cy: 4.8, rx: 0.5, ry: 0.8, color: C.dim },
  { name: "Supercaps", cx: 0.3, cy: 3.9, rx: 0.7, ry: 0.8, color: C.anion },
  { name: "Batteries", cx: 1.9, cy: 2.4, rx: 0.6, ry: 0.9, color: C.lithium },
  { name: "Fuel cells", cx: 2.8, cy: 1.3, rx: 0.5, ry: 0.8, color: C.electron },
];
// constant discharge time t: log P = log E + log(3600/t)
const DIAGONALS = [
  { t: 3.6, label: "1 s" },
  { t: 3600, label: "1 h" },
  { t: 3600 * 24 * 10, label: "10 days" },
];

const SELF = [
  { name: "Flywheel", v: "% per hour", w: 0.95, color: "#93c5fd" },
  { name: "Capacitor", v: "% per day", w: 0.7, color: C.anion },
  { name: "Li-ion", v: "% per month", w: 0.3, color: C.lithium },
  { name: "Fuels", v: "≈ 0", w: 0.04, color: C.electron },
];

const lifeBox = { x: 90, y: 70, w: 450, h: 250 };
const lf = makeScale(lifeBox, [0, 3000], [60, 102]);
const fade = (n: number) => 100 - 20 * (n / 2500) ** 0.8;

export default function CompareVisual({ visual }: { visual: string }) {
  return (
    <Stage label="How to compare energy storage technologies">
      <Reveal show={visual === "family"}>
        <Label x={300} y={40} size={17} weight={700}>
          Energy storage solutions
        </Label>
        {TREE.map((f, i) => {
          const x = 70 + i * 115;
          return (
            <g key={f.name}>
              <path d={`M300 55 L${x} 90`} stroke={C.grid} strokeWidth={2} />
              <rect x={x - 52} y={90} width={104} height={46} rx={10} fill={f.color} opacity={0.2} stroke={f.color} />
              {f.name.split("-").map((w, j, all) => (
                <Label key={w} x={x} y={(all.length > 1 ? 109 : 118) + j * 16} size={13} weight={700} color={f.color}>
                  {all.length > 1 && j === 0 ? `${w}-` : w}
                </Label>
              ))}
              {f.kids.map((k, j) => (
                <g key={k}>
                  <line x1={x} x2={x} y1={136} y2={160 + j * 44} stroke={C.grid} />
                  <rect x={x - 50} y={160 + j * 44} width={100} height={32} rx={8} fill="#111a2c" stroke={C.grid} />
                  <Label x={x} y={181 + j * 44} size={12}>
                    {k}
                  </Label>
                </g>
              ))}
            </g>
          );
        })}
        <Chip x={300} y={400} text="no silver bullet: best for what, where, how long?" color={C.accent} w={400} />
      </Reveal>

      <Reveal show={visual === "energy-power"}>
        <Label x={300} y={48} size={17} weight={700}>
          Two independent axes
        </Label>
        <g transform="translate(90 90)">
          <rect width={180} height={200} rx={14} fill={C.lfp} opacity={0.15} stroke={C.lfp} />
          <motion.rect x={20} width={140} rx={8} fill={C.lfp} initial={false} animate={{ y: visual === "energy-power" ? 40 : 180, height: visual === "energy-power" ? 140 : 0 }} transition={{ duration: 1 }} />
          <Label x={90} y={-12} size={15} weight={700} color={C.lfp}>
            Energy · kWh
          </Label>
          <Label x={90} y={230} size={13}>
            how LONG you can supply
          </Label>
        </g>
        <g transform="translate(330 90)">
          <rect width={180} height={200} rx={14} fill={C.electron} opacity={0.12} stroke={C.electron} />
          <Flow path="M20 100 L160 100" count={6} dur={0.9} color={C.electron} r={7} />
          <Label x={90} y={-12} size={15} weight={700} color={C.electron}>
            Power · kW
          </Label>
          <Label x={90} y={230} size={13}>
            how MUCH at once
          </Label>
        </g>
        <Chip x={300} y={390} text="duration = energy / power, e.g. 20 MWh / 5 MW = 4 h" color={C.accent} w={430} />
      </Reveal>

      <Reveal show={visual === "density"}>
        <Label x={300} y={48} size={17} weight={700}>
          Per kilogram or per litre?
        </Label>
        <g transform="translate(150 200)">
          <path d="M-70 10 L70 -10 L80 0 L70 10 L-70 -10 Z" fill={C.dim} opacity={0.3} />
          <path d="M-10 -8 L20 -60 L30 -60 L15 -6 Z M-10 8 L20 60 L30 60 L15 6 Z" fill={C.dim} opacity={0.5} />
          <Label x={0} y={100} size={15} weight={700} color={C.electron}>
            aviation: Wh / kg
          </Label>
          <Label x={0} y={122} size={13} color={C.dim}>
            specific energy (gravimetric)
          </Label>
        </g>
        <g transform="translate(450 200)">
          <rect x={-50} y={-60} width={100} height={110} rx={6} fill={C.lfp} opacity={0.3} stroke={C.lfp} />
          <rect x={-90} y={-30} width={40} height={80} fill={C.grid} />
          <rect x={50} y={-40} width={40} height={90} fill={C.grid} />
          <Label x={0} y={100} size={15} weight={700} color={C.lfp}>
            city substation: Wh / L
          </Label>
          <Label x={0} y={122} size={13} color={C.dim}>
            energy density (volumetric)
          </Label>
        </g>
        <Chip x={300} y={400} text="a desert site may care about neither" color={C.dim} w={320} />
      </Reveal>

      <Reveal show={visual === "ragone"}>
        <Axes box={rBox} xLabel="specific energy (Wh/kg, log)" yLabel="specific power (W/kg, log)" xLabelDy={42} />
        {[-2, 0, 2, 4].map((e) => (
          <Label key={e} x={rg.sx(e)} y={rBox.y + rBox.h + 18} size={12} color={C.dim}>
            {`10${{ "-2": "⁻²", "0": "⁰", "2": "²", "4": "⁴" }[String(e)]}`}
          </Label>
        ))}
        <defs>
          <clipPath id="ragone-clip">
            <rect x={rBox.x} y={rBox.y} width={rBox.w} height={rBox.h} />
          </clipPath>
        </defs>
        <g clipPath="url(#ragone-clip)">
          {DIAGONALS.map((d) => {
            const k = Math.log10(3600 / d.t);
            return (
              <path key={d.label} d={rg.path([[-2, -2 + k], [4, 4 + k]])} stroke={C.accent} strokeDasharray="6 6" strokeWidth={1.5} fill="none" opacity={0.8} />
            );
          })}
          {REGIONS.map((r) => (
            <g key={r.name}>
              <ellipse
                cx={rg.sx(r.cx)}
                cy={rg.sy(r.cy)}
                rx={rg.sx(r.cx + r.rx) - rg.sx(r.cx)}
                ry={rg.sy(r.cy - r.ry) - rg.sy(r.cy)}
                fill={r.color}
                opacity={0.25}
                stroke={r.color}
              />
              <Label x={rg.sx(r.cx)} y={rg.sy(r.cy) + 5} size={13} weight={700} color={r.color}>
                {r.name}
              </Label>
            </g>
          ))}
        </g>
        {DIAGONALS.map((d) => {
          const k = Math.log10(3600 / d.t);
          const x = Math.min(3.6, 5.6 - k);
          return (
            <Label key={d.label} x={rg.sx(x) + 4} y={rg.sy(x + k) + 14} anchor="start" size={12} color={C.accent}>
              {d.label}
            </Label>
          );
        })}
      </Reveal>

      <Reveal show={visual === "efficiency"}>
        <Label x={300} y={40} size={16} weight={700}>
          Round-trip efficiency: where is the boundary?
        </Label>
        {["grid", "power electronics", "storage", "power electronics", "grid"].map((n, i) => (
          <g key={`${n}-${i}`}>
            <rect x={30 + i * 112} y={70} width={96} height={46} rx={10} fill="#111a2c" stroke={i === 2 ? C.lithium : C.grid} />
            <Label x={78 + i * 112} y={98} size={12} weight={i === 2 ? 700 : 500}>
              {n}
            </Label>
          </g>
        ))}
        <rect x={250} y={62} width={100} height={62} rx={12} fill="none" stroke={C.electron} strokeDasharray="5 4" />
        <rect x={22} y={56} width={556} height={74} rx={14} fill="none" stroke={C.accent} strokeDasharray="5 4" />
        <Label x={300} y={148} size={12} color={C.electron}>
          published figure often only this box
        </Label>
        <Label x={300} y={166} size={12} color={C.accent}>
          system: + cooling, auxiliaries, converters
        </Label>
        <Label x={300} y={215} size={16} weight={700}>
          Self-discharge
        </Label>
        {SELF.map((sd, i) => (
          <g key={sd.name}>
            <Label x={150} y={253 + i * 40} anchor="end" size={14}>
              {sd.name}
            </Label>
            <motion.rect
              x={162}
              y={236 + i * 40}
              height={24}
              rx={5}
              fill={sd.color}
              opacity={0.85}
              initial={false}
              animate={{ width: visual === "efficiency" ? sd.w * 260 : 0 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            />
            <Label x={172 + sd.w * 260} y={253 + i * 40} anchor="start" size={13} weight={700}>
              {sd.v}
            </Label>
          </g>
        ))}
        <Label x={300} y={420} size={13} color={C.dim}>
          self-discharge sets the longest useful storage time
        </Label>
      </Reveal>

      <Reveal show={visual === "life"}>
        <Axes box={lifeBox} xLabel="cycle number" yLabel="capacity (%)" xLabelDy={40} />
        {[0, 1000, 2000, 3000].map((n) => (
          <Label key={n} x={lf.sx(n)} y={lifeBox.y + lifeBox.h + 18} size={12} color={C.dim}>
            {n}
          </Label>
        ))}
        {[60, 80, 100].map((v) => (
          <Label key={v} x={lifeBox.x - 8} y={lf.sy(v) + 4} anchor="end" size={12} color={C.dim}>
            {v}
          </Label>
        ))}
        <line x1={lifeBox.x} x2={lifeBox.x + lifeBox.w} y1={lf.sy(80)} y2={lf.sy(80)} stroke={C.hot} strokeDasharray="6 5" />
        <Label x={lifeBox.x + lifeBox.w} y={lf.sy(80) - 8} anchor="end" size={12} color={C.hot}>
          end of life ≈ 80 %
        </Label>
        <DrawPath d={lf.path(Array.from({ length: 61 }, (_, i) => [i * 50, fade(i * 50)] as [number, number]))} show={visual === "life"} color={C.lithium} width={3} />
        <Label x={lf.sx(900)} y={lf.sy(fade(900)) - 12} size={13} color={C.lithium} anchor="start">
          cycle life: fade per cycle
        </Label>
        <Chip x={175} y={425} text="calendar life ticks even when idle" color={C.electron} w={260} />
        <Chip x={450} y={425} text="+ response · maturity · $/kW · $/kWh" color={C.accent} w={270} />
      </Reveal>
    </Stage>
  );
}
