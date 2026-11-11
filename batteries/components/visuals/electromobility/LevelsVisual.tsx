"use client";

import { Axes, C, Chip, DrawPath, Flow, Label, Reveal, Stage, makeScale } from "../primitives";
import { Card, Table, Title } from "../blocks";

function Box({ x, y, w, h, t, c, sub }: { x: number; y: number; w: number; h: number; t: string; c: string; sub?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="#111a2c" stroke={c} strokeWidth={2} />
      <Label x={x + w / 2} y={y + h / 2 + (sub ? -2 : 5)} size={14} weight={700} color={c}>
        {t}
      </Label>
      {sub && (
        <Label x={x + w / 2} y={y + h / 2 + 16} size={11} color={C.dim}>
          {sub}
        </Label>
      )}
    </g>
  );
}

/* Chargeable cars in Sweden, schematic growth (thousands). */
const box = { x: 80, y: 90, w: 300, h: 220 };
const s = makeScale(box, [2013, 2025], [0, 1]);
const GROWTH: [number, number][] = Array.from({ length: 13 }, (_, i) => [2013 + i, (Math.exp(i / 3.2) - 1) / (Math.exp(12 / 3.2) - 1)]);

function Plug({ x, y, pins, label, sub, color }: { x: number; y: number; pins: [number, number, number][]; label: string; sub: string; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={42} fill="#111a2c" stroke={color} strokeWidth={2.5} />
      {pins.map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={r} fill={color} opacity={0.85} />
      ))}
      <Label x={x} y={y + 62} size={14} weight={700} color={color}>
        {label}
      </Label>
      <Label x={x} y={y + 78} size={11} color={C.dim}>
        {sub}
      </Label>
    </g>
  );
}

const RING = (n: number, r: number, size: number, off = 0): [number, number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i * 2 * Math.PI) / n - Math.PI / 2 + off;
    return [Math.cos(a) * r, Math.sin(a) * r, size];
  });

export default function LevelsVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Charging levels and connectors">
      <Reveal show={is("levels")}>
        <Title>Three charging levels</Title>
        <Table
          x={20}
          y={75}
          cols={[110, 60, 110, 130, 150]}
          show={is("levels")}
          rows={[
            ["Level", "Current", "Power", "0–80 %", "Typical use"],
            ["1 · slow", "AC", "1–2 kW", "8–20 h", "home, overnight"],
            ["2 · medium", "AC", "7–22 kW", "3–8 h", "home, work, public"],
            ["DC fast", "DC", "50–350+ kW", "15–45 min", "highways, fleets"],
          ]}
          rowH={48}
          highlight={3}
        />
        <Label x={300} y={300} size={13} color={C.dim}>
          Level 1 at 120 V is mostly a North American case; Level 2 at 230–240 V
        </Label>
        <Label x={300} y={322} size={13} color={C.dim}>
          DC fast chargers run at 400–800 V
        </Label>
        <Chip x={300} y={380} text="charging time depends on battery size and charger power" w={420} />
      </Reveal>

      <Reveal show={is("onboard")}>
        <Title>Where does AC become DC?</Title>
        <Label x={300} y={82} size={15} weight={700} color={C.lfp}>
          AC charging: on-board charger
        </Label>
        <Box x={30} y={100} w={110} h={60} t="grid / post" c={C.dim} sub="AC" />
        <rect x={190} y={92} width={380} height={76} rx={14} fill="none" stroke={C.lfp} strokeDasharray="6 4" />
        <Label x={566} y={184} anchor="end" size={11} color={C.lfp}>
          inside the car
        </Label>
        <Box x={210} y={105} w={150} h={50} t="on-board charger" c={C.lfp} sub="≈ 11 kW limit" />
        <Box x={420} y={105} w={120} h={50} t="battery" c={C.lithium} sub="DC" />
        <Flow path="M140 130 L210 130" count={3} dur={1.5} color={C.electron} r={4} />
        <Flow path="M360 130 L420 130" count={3} dur={1.5} color={C.lithium} r={4} />

        <Label x={300} y={232} size={15} weight={700} color={C.hot}>
          DC charging: off-board, in the station
        </Label>
        <Box x={30} y={250} w={110} h={60} t="grid" c={C.dim} sub="AC" />
        <Box x={170} y={250} w={160} h={60} t="station converter" c={C.hot} sub="50–350+ kW" />
        <rect x={380} y={242} width={190} height={76} rx={14} fill="none" stroke={C.lithium} strokeDasharray="6 4" />
        <Box x={420} y={255} w={120} h={50} t="battery" c={C.lithium} sub="DC" />
        <Flow path="M140 280 L170 280" count={2} dur={1} color={C.electron} r={4} />
        <Flow path="M330 280 L420 280" count={5} dur={0.8} color={C.lithium} r={5} />
        <Chip x={300} y={370} text="on-board charger limits AC; station and battery limit DC" w={440} color={C.accent} />
        <Label x={300} y={410} size={12} color={C.dim}>
          AC: Type 1 (SAE J1772), Type 2 (Mennekes) · DC: CCS, CHAdeMO, GB/T
        </Label>
      </Reveal>

      <Reveal show={is("connectors")}>
        <Title>Connector standards</Title>
        <Plug x={80} y={140} pins={[...RING(5, 22, 6)]} label="Type 1" sub="1-phase AC · US, Japan" color={C.lfp} />
        <Plug x={240} y={140} pins={[...RING(5, 24, 6), [0, 0, 6], [-12, -10, 3], [12, -10, 3]]} label="Type 2" sub="1- & 3-phase AC · EU" color={C.accent} />
        <g>
          <circle cx={400} cy={120} r={34} fill="#111a2c" stroke={C.lithium} strokeWidth={2.5} />
          {RING(5, 18, 5).map(([dx, dy], i) => (
            <circle key={i} cx={400 + dx} cy={120 + dy} r={5} fill={C.lithium} />
          ))}
          <rect x={372} y={158} width={56} height={32} rx={12} fill="#111a2c" stroke={C.lithium} strokeWidth={2.5} />
          <circle cx={388} cy={174} r={7} fill={C.lithium} />
          <circle cx={412} cy={174} r={7} fill={C.lithium} />
          <Label x={400} y={212} size={14} weight={700} color={C.lithium}>
            CCS
          </Label>
          <Label x={400} y={228} size={11} color={C.dim}>
            AC + 2 DC pins · global
          </Label>
        </g>
        <Plug x={160} y={320} pins={[[-14, -8, 7], [14, -8, 7], ...RING(6, 28, 3, 0.4)]} label="CHAdeMO" sub="early DC · being phased out" color={C.hot} />
        <Plug x={360} y={320} pins={[[-12, 0, 8], [12, 0, 8], ...RING(5, 28, 4)]} label="GB/T" sub="China · AC and DC" color={C.electron} />
        <Label x={520} y={290} size={13} color={C.dim}>
          schematic
        </Label>
        <Label x={520} y={308} size={13} color={C.dim}>
          pin layouts
        </Label>
      </Reveal>

      <Reveal show={is("where")}>
        <Title y={40}>Sweden charges up</Title>
        <Axes box={box} xLabel="year" yLabel="chargeable cars (schematic)" xLabelDy={40} />
        <DrawPath d={s.path(GROWTH)} show={is("where")} color={C.lithium} />
        {[2013, 2019, 2025].map((y) => (
          <Label key={y} x={s.sx(y)} y={box.y + box.h + 16} size={11} color={C.dim}>
            {y}
          </Label>
        ))}
        <Card x={410} y={80} w={170} h={100} show={is("where")} title="10.6 M" color={C.accent} lines={["inhabitants", "in Sweden"]} />
        <Card x={410} y={200} w={170} h={100} show={is("where")} delay={0.2} title="300+" color={C.electron} lines={["public charging", "points in Uppsala"]} />
        <Chip x={300} y={390} text="most charging happens at home and at work" w={360} color={C.lfp} />
        <Label x={300} y={424} size={12} color={C.dim}>
          data: Power Circle elbilsstatistik; Uppsala parkering
        </Label>
      </Reveal>
    </Stage>
  );
}
