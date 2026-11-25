"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Flow, Label, Reveal, Stage, makeScale } from "../primitives";
import { Card, Title } from "../blocks";

const INPUTS = ["Vehicle weight", "Energy management", "Rolling resistance", "Temperature", "Auxiliary loads", "All-electric range"];
const CRITERIA = ["Mechanical", "Temperature", "Battery life", "Voltage curve"];

/* Schematic capacity fade at three temperatures (lecture figure: hotter cells fade much faster). */
const fBox = { x: 70, y: 80, w: 280, h: 200 };
const fade = makeScale(fBox, [0, 2000], [70, 102]);
const TEMPS = [
  { t: "25 °C", c: C.lfp, k: 0.0065 },
  { t: "45 °C", c: C.copper, k: 0.019 },
  { t: "60 °C", c: C.hot, k: 0.05 },
];
const N = Array.from({ length: 81 }, (_, i) => i * 25);

/* Discharge curve vs SOC for the gauge step. */
const dBox = { x: 270, y: 110, w: 280, h: 180 };
const dis = makeScale(dBox, [100, 0], [2.6, 4.4]);
const nmc = (soc: number) => 3.0 + 1.15 * (soc / 100) + 0.25 * Math.tanh((soc - 6) / 4) - 0.05;
const lfp = (soc: number) => 3.3 + 0.05 * (soc / 100) + 0.25 * Math.exp(-(100 - soc) / 3) - 0.6 * Math.exp(-soc / 4);
const SOC = Array.from({ length: 101 }, (_, i) => 100 - i);

const vBox = { x: 80, y: 80, w: 440, h: 230 };
const vs = makeScale(vBox, [100, 0], [2.6, 4.4]);

const BMS_IN = ["Voltage", "Current", "Temperature"];
const BMS_OUT = ["Cell balancing", "Thermal management", "Car, cloud, display"];

export default function PackDesignVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Designing an EV battery pack">
      <Reveal show={is("design-map")}>
        <Title>From vehicle to battery technology</Title>
        <ellipse cx={130} cy={210} rx={115} ry={140} fill="#111a2c" stroke={C.grid} />
        {INPUTS.map((t, i) => (
          <Label key={t} x={130} y={128 + i * 34} size={13}>
            {t}
          </Label>
        ))}
        <rect x={290} y={120} width={110} height={56} rx={10} fill={C.electron} opacity={0.16} stroke={C.electron} />
        <Label x={345} y={153} size={15} weight={700} color={C.electron}>
          Power
        </Label>
        <rect x={290} y={240} width={110} height={56} rx={10} fill={C.lithium} opacity={0.16} stroke={C.lithium} />
        <Label x={345} y={273} size={15} weight={700} color={C.lithium}>
          Energy
        </Label>
        <path d="M245 160 L290 148" stroke={C.ink} strokeWidth={1.5} markerEnd="url(#arrow)" />
        <path d="M245 260 L290 268" stroke={C.ink} strokeWidth={1.5} markerEnd="url(#arrow)" />
        <rect x={470} y={150} width={110} height={120} rx={10} fill={C.accent} opacity={0.14} stroke={C.accent} />
        <Label x={525} y={200} size={13} weight={700} color={C.accent}>
          Battery
        </Label>
        <Label x={525} y={218} size={13} weight={700} color={C.accent}>
          technology
        </Label>
        <Label x={525} y={236} size={13} weight={700} color={C.accent}>
          selection
        </Label>
        <path d="M400 148 L470 185" stroke={C.ink} strokeWidth={1.5} markerEnd="url(#arrow)" />
        <path d="M400 268 L470 235" stroke={C.ink} strokeWidth={1.5} markerEnd="url(#arrow)" />
        <Label x={435} y={150} size={12} color={C.dim}>
          C-rate
        </Label>
        <Label x={435} y={278} size={12} color={C.dim}>
          capacity
        </Label>
        {CRITERIA.map((c, i) => (
          <Chip key={c} x={80 + i * 147} y={395} text={c} w={140} color={C.accent} />
        ))}
      </Reveal>

      <Reveal show={is("mechanical")}>
        <Title>Mechanical stability, cell to pack</Title>
        <rect x={120} y={90} width={360} height={200} rx={16} fill="#111a2c" stroke={C.zinc} strokeWidth={3} />
        {Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 10 }, (_, c) => <circle key={`${r}-${c}`} cx={156 + c * 32} cy={130 + r * 40} r={12} fill={C.lithium} opacity={0.5} stroke={C.lithium} />),
        )}
        {[
          { x: 70, y: 120, t: "vibration", a: "M100 125 L120 135" },
          { x: 530, y: 120, t: "corrosion", a: "M500 125 L480 135" },
          { x: 70, y: 270, t: "crash", a: "M100 265 L120 255" },
          { x: 530, y: 270, t: "connections", a: "M500 265 L480 255" },
        ].map((k) => (
          <g key={k.t}>
            <path d={k.a} stroke={C.hot} strokeWidth={2} markerEnd="url(#arrow)" />
            <Label x={k.x} y={k.y} size={13} color={C.hot} weight={700}>
              {k.t}
            </Label>
          </g>
        ))}
        <Label x={300} y={330} size={14}>
          hundreds of cells joined into one structure
        </Label>
        <Label x={300} y={356} size={13} color={C.dim}>
          low-leakage, vibration-proof connections · no corrosion
        </Label>
        <Label x={300} y={378} size={13} color={C.dim}>
          crash-safe encapsulation and placement in the vehicle
        </Label>
      </Reveal>

      <Reveal show={is("thermal")}>
        <Title>Heat shortens life; cold needs heating</Title>
        <Axes box={fBox} xLabel="cycle number" yLabel="capacity (% of BOL)" />
        {TEMPS.map((t, i) => (
          <g key={t.t}>
            <DrawPath d={fade.path(N.map((n) => [n, Math.max(70, 100 - t.k * n)] as [number, number]).filter(([, q]) => q > 70))} show={is("thermal")} color={t.c} delay={i * 0.2} />
            <Label x={fBox.x + fBox.w - 4} y={fBox.y + 20 + i * 18} anchor="end" size={12} color={t.c} weight={700}>
              {t.t}
            </Label>
          </g>
        ))}
        <Card x={380} y={75} w={200} h={110} show={is("thermal")} title="Air cooling" color={C.lfp} lines={["cheap, no leaks", "too weak for fast charge"]} size={12} />
        <Card x={380} y={195} w={200} h={110} show={is("thermal")} delay={0.15} title="Liquid cooling" color={C.accent} lines={["better performance", "costly; needed for fast charge"]} size={12} />
        <Chip x={210} y={335} text="Joule heat P = I²R" color={C.hot} w={170} />
        <Label x={300} y={378} size={13}>
          specification: −40 to 80 °C
        </Label>
        <Label x={300} y={402} size={13} color={C.dim}>
          in the cold, heat the pack: charging a cold cell can grow lithium dendrites
        </Label>
      </Reveal>

      <Reveal show={is("soc-dod")}>
        <Title>State of charge, depth of discharge, end of life</Title>
        <rect x={60} y={100} width={110} height={220} rx={12} fill="#111a2c" stroke={C.ink} strokeWidth={2} />
        <rect x={95} y={88} width={40} height={12} rx={3} fill={C.ink} />
        <motion.rect x={68} width={94} rx={8} fill={C.lithium} opacity={0.7} initial={false} animate={{ y: is("soc-dod") ? 188 : 312, height: is("soc-dod") ? 124 : 0 }} transition={{ duration: 1 }} />
        <Label x={115} y={150} size={14} weight={700} color={C.dim}>
          DOD 40 %
        </Label>
        <Label x={115} y={255} size={14} weight={700} color="#0b1220">
          SOC 60 %
        </Label>
        <Chip x={115} y={355} text="DOD + SOC = 100 %" w={170} />
        <Axes box={dBox} xLabel="SOC (%)" yLabel="cell voltage (V)" xLabelDy={34} />
        <DrawPath d={dis.path(SOC.map((s) => [s, nmc(s)] as [number, number]))} show={is("soc-dod")} color={C.accent} />
        {[100, 50, 0].map((s) => (
          <Label key={s} x={dis.sx(s)} y={dBox.y + dBox.h + 16} size={11} color={C.dim}>
            {s}
          </Label>
        ))}
        <Label x={410} y={350} size={13}>
          end of life: 80 % of beginning-of-life capacity
        </Label>
        <Label x={410} y={372} size={12} color={C.dim}>
          calendar life (years) · cycle life (cycles) · shelf life
        </Label>
        <Label x={410} y={394} size={12} color={C.dim}>
          state of health: a rough estimate from capacity loss
        </Label>
      </Reveal>

      <Reveal show={is("voltage-profile")}>
        <Title>Flat or sloping discharge curve?</Title>
        <Axes box={vBox} xLabel="SOC (%) →  empty" yLabel="cell voltage (V)" />
        <DrawPath d={vs.path(SOC.map((s) => [s, nmc(s)] as [number, number]))} show={is("voltage-profile")} color={C.accent} />
        <DrawPath d={vs.path(SOC.map((s) => [s, lfp(s)] as [number, number]).filter(([, v]) => v > 2.6))} show={is("voltage-profile")} color={C.lfp} delay={0.3} />
        <Label x={vs.sx(80)} y={vs.sy(nmc(80)) - 12} size={14} weight={700} color={C.accent}>
          sloping (e.g. NMC)
        </Label>
        <Label x={vs.sx(50)} y={vs.sy(3.3) + 24} size={14} weight={700} color={C.lfp}>
          flat (LFP)
        </Label>
        <Label x={300} y={360} size={14}>
          flat: steady performance over a wide SOC range
        </Label>
        <Label x={300} y={385} size={14} color={C.electron}>
          but the EV needs SOC for energy management and range
        </Label>
        <Label x={300} y={410} size={13} color={C.dim}>
          a slope or clear voltage steps make the SOC easier to read
        </Label>
      </Reveal>

      <Reveal show={is("bms")}>
        <Title>The BMS is the brain of the pack</Title>
        <rect x={30} y={140} width={80} height={150} rx={14} fill={C.lithium} opacity={0.18} stroke={C.lithium} />
        <Label x={70} y={220} size={13} weight={700} color={C.lithium}>
          Li-ion
        </Label>
        {BMS_IN.map((t, i) => (
          <g key={t}>
            <path d={`M110 ${170 + i * 45} H200`} stroke={C.dim} strokeDasharray="5 4" />
            <Flow path={`M110 ${170 + i * 45} H200`} count={2} dur={1.4} color={C.electron} r={3} />
            <Label x={155} y={162 + i * 45} size={11} color={C.dim}>
              {t}
            </Label>
          </g>
        ))}
        <rect x={200} y={130} width={170} height={170} rx={14} fill="#111a2c" stroke={C.accent} strokeWidth={2} />
        <Label x={285} y={165} size={15} weight={700} color={C.accent}>
          State estimator
        </Label>
        {["SOC: charge", "SOP: power", "SOH: health"].map((t, i) => (
          <Label key={t} x={285} y={200 + i * 26} size={13}>
            {t}
          </Label>
        ))}
        {BMS_OUT.map((t, i) => (
          <g key={t}>
            <path d={`M370 ${170 + i * 45} H420`} stroke={C.ink} strokeWidth={1.5} markerEnd="url(#arrow)" />
            <rect x={425} y={152 + i * 45} width={155} height={36} rx={8} fill="#111a2c" stroke={C.grid} />
            <Label x={502} y={175 + i * 45} size={12}>
              {t}
            </Label>
          </g>
        ))}
        <Label x={300} y={360} size={14}>
          measure → estimate → act
        </Label>
      </Reveal>
    </Stage>
  );
}
