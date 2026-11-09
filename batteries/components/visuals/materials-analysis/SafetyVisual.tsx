"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Bars, Table, Title } from "../blocks";

const LOOP = [
  { t: "exothermic reaction", a: -90, c: C.hot },
  { t: "temperature rises", a: 30, c: C.electron },
  { t: "reaction speeds up", a: 150, c: C.copper },
];

/* Reaction enthalpy (J/g) vs state of charge, TA Instruments note TA467. */
const SOC = [0, 50, 100];
const NMC = [72.1, 625, 1618];
const GR = [49.8, 216, 345];
const box = { x: 90, y: 80, w: 300, h: 250 };
const s = makeScale(box, [0, 100], [0, 1700]);

/* ARC: heat-wait-search staircase, then exotherm tracking. */
const aBox = { x: 80, y: 90, w: 460, h: 230 };
const as = makeScale(aBox, [0, 100], [20, 260]);
const ARC: [number, number][] = [];
{
  let T = 40;
  let t = 0;
  for (let k = 0; k < 6; k++) {
    ARC.push([t, T], [t + 3, T + 10], [t + 9, T + 10]);
    t += 9;
    T += 10;
  }
  // onset found: self-heating, adiabatic tracking accelerates into runaway
  for (let k = 1; k <= 30; k++) ARC.push([t + k * 1.4, T + 0.6 * Math.exp(k / 5.4)]);
}

export default function SafetyVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Thermal runaway and safety testing">
      <Reveal show={is("runaway")}>
        <Title>Thermal runaway: a feedback loop</Title>
        <circle cx={300} cy={220} r={110} fill="none" stroke={C.hot} strokeWidth={2} strokeDasharray="8 6">
          <animateTransform attributeName="transform" type="rotate" from="0 300 220" to="360 300 220" dur="10s" repeatCount="indefinite" />
        </circle>
        {LOOP.map((l, i) => {
          const r = (l.a * Math.PI) / 180;
          const x = 300 + Math.cos(r) * 110;
          const y = 220 + Math.sin(r) * 110;
          return (
            <motion.g key={l.t} initial={false} animate={{ opacity: is("runaway") ? 1 : 0 }} transition={{ delay: is("runaway") ? i * 0.25 : 0 }}>
              <rect x={x - 95} y={y - 20} width={190} height={40} rx={20} fill="#111a2c" stroke={l.c} strokeWidth={2} />
              <Label x={x} y={y + 5} size={14} weight={700} color={l.c}>
                {l.t}
              </Label>
            </motion.g>
          );
        })}
        <Label x={300} y={226} size={18} weight={800} color={C.hot}>
          ↻
        </Label>
        <Chip x={300} y={395} text="ends in venting or fire · strongly SOC dependent" w={400} color={C.hot} />
      </Reveal>

      <Reveal show={is("nmc")}>
        <Title>DSC of washed electrodes at 100 % SOC</Title>
        <Bars
          items={[
            { label: "NMC811", value: 1618, color: C.hot },
            { label: "graphite", value: 345, color: C.graphite },
          ]}
          x={140}
          y={120}
          w={380}
          gap={90}
          show={is("nmc")}
          format={(v) => `${v} J/g`}
        />
        <Label x={140} y={168} anchor="start" size={12} color={C.dim}>
          layered oxide decomposes and releases O₂
        </Label>
        <Label x={140} y={258} anchor="start" size={12} color={C.dim}>
          SEI decomposes, lithiated carbon reacts
        </Label>
        <Label x={300} y={330} size={15} weight={700}>
          the charged (delithiated) cathode releases ≈ 5× more heat
        </Label>
        <Label x={300} y={360} size={13} color={C.dim}>
          electrolyte rinsed off first, so this is the electrode itself
        </Label>
        <Label x={300} y={420} size={11} color={C.dim}>
          data: TA Instruments technical note TA467
        </Label>
      </Reveal>

      <Reveal show={is("soc")}>
        <Title y={40}>Heat release vs state of charge</Title>
        <Axes box={box} xLabel="SOC (%)" yLabel="ΔH (J/g)" xLabelDy={40} />
        {SOC.map((x) => (
          <Label key={x} x={s.sx(x)} y={box.y + box.h + 16} size={11} color={C.dim}>
            {x}
          </Label>
        ))}
        <DrawPath d={s.path(SOC.map((x, i) => [x, NMC[i]]))} show={is("soc")} color={C.hot} />
        <DrawPath d={s.path(SOC.map((x, i) => [x, GR[i]]))} show={is("soc")} color={C.zinc} delay={0.4} />
        {SOC.map((x, i) => (
          <g key={x}>
            <circle cx={s.sx(x)} cy={s.sy(NMC[i])} r={5} fill={C.hot} />
            <circle cx={s.sx(x)} cy={s.sy(GR[i])} r={5} fill={C.zinc} />
          </g>
        ))}
        <Label x={s.sx(70)} y={s.sy(1300)} size={13} weight={700} color={C.hot}>
          NMC811
        </Label>
        <Label x={s.sx(80)} y={s.sy(250) + 22} size={13} weight={700} color={C.zinc}>
          graphite
        </Label>
        <Table
          x={410}
          y={90}
          cols={[60, 60, 60]}
          rowH={36}
          size={12}
          show={is("soc")}
          rows={[
            ["SOC", "NMC", "Gr"],
            ["0 %", "72", "50"],
            ["50 %", "625", "216"],
            ["100 %", "1618", "345"],
          ]}
          highlight={3}
        />
        <Chip x={300} y={405} text="cathode = bigger runaway risk → Ni-rich needs thermal management" w={480} color={C.hot} />
      </Reveal>

      <Reveal show={is("arc")}>
        <Title y={40}>ARC: heat, wait, search</Title>
        <Axes box={aBox} xLabel="time →" yLabel="cell temperature (°C)" />
        <DrawPath d={as.path(ARC)} show={is("arc")} color={C.electron} dur={2.5} />
        <Label x={as.sx(25)} y={as.sy(110)} size={12} color={C.dim}>
          heat · wait · search, repeat
        </Label>
        <circle cx={as.sx(54)} cy={as.sy(100.6)} r={7} fill="none" stroke={C.hot} strokeWidth={2.5} />
        <Label x={as.sx(54)} y={as.sy(100.6) + 26} size={12} color={C.hot}>
          onset: &gt; 0.02 °C/min
        </Label>
        <Label x={as.sx(82)} y={as.sy(230)} size={13} weight={700} color={C.hot}>
          runaway
        </Label>
        <Label x={300} y={385} size={14}>
          adiabatic bomb: the calorimeter tracks the cell so no heat escapes
        </Label>
        <Label x={300} y={410} size={12} color={C.dim}>
          gives onset temperature, self-heating rate and maximum temperature
        </Label>
      </Reveal>
    </Stage>
  );
}
