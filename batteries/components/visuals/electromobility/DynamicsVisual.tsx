"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Flow, Label, Reveal, Stage, makeScale } from "../primitives";
import { Bars, Card, Table, Title } from "../blocks";

/** A side-view car, about 120 × 50, origin at the bottom-left of the wheels. */
function Car({ x, y, color = C.accent, rot = 0 }: { x: number; y: number; color?: string; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M4 -14 L8 -28 L34 -32 L50 -48 L86 -48 L104 -32 L116 -28 L118 -14 Z" fill={color} opacity={0.25} stroke={color} strokeWidth={2} />
      <path d="M54 -44 L84 -44 L96 -32 L46 -32 Z" fill={color} opacity={0.35} />
      <circle cx={30} cy={-10} r={10} fill="#0b1220" stroke={C.ink} strokeWidth={2} />
      <circle cx={92} cy={-10} r={10} fill="#0b1220" stroke={C.ink} strokeWidth={2} />
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color, label, lx, ly }: { x1: number; y1: number; x2: number; y2: number; color: string; label: string; lx: number; ly: number }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3.5} markerEnd="url(#arrow)" />
      <Label x={lx} y={ly} size={14} weight={800} color={color}>
        {label}
      </Label>
    </g>
  );
}

/* Coast-down: deceleration from road load only, F = A + Bv + Cv² with the course's coefficients. */
const A = 130,
  B = 0.71,
  Cc = 0.49,
  M = 1645;
const coast: [number, number][] = (() => {
  const pts: [number, number][] = [];
  let v = 120 / 3.6;
  for (let t = 0; t <= 120; t += 0.5) {
    pts.push([t, v * 3.6]);
    v = Math.max(0, v - ((A + B * v + Cc * v * v) / M) * 0.5);
  }
  return pts;
})();
const cBox = { x: 70, y: 80, w: 220, h: 200 };
const cs = makeScale(cBox, [0, 120], [0, 130]);
const rBox = { x: 350, y: 80, w: 210, h: 200 };
const rs = makeScale(rBox, [0, 40], [0, 1100]);
const VS = Array.from({ length: 41 }, (_, i) => i);

/* Power vs speed for a Tesla-Model-3-like car (m ≈ 1850 kg, CR = 0.01, CD·A ≈ 0.51 m²). */
const pBox = { x: 80, y: 70, w: 450, h: 250 };
const ps = makeScale(pBox, [0, 140], [0, 40]);
const KMH = Array.from({ length: 71 }, (_, i) => i * 2);
const pRoll = (k: number) => (0.01 * 1850 * 9.81 * (k / 3.6)) / 1000;
const pDrag = (k: number) => (0.5 * 1.2 * 0.51 * (k / 3.6) ** 3) / 1000;
const pClimb = (k: number) => (1850 * 9.81 * Math.sin(Math.PI / 180) * (k / 3.6)) / 1000;
const ppath = (f: (k: number) => number) => ps.path(KMH.map((k) => [k, Math.min(40, f(k))] as [number, number]));

export default function DynamicsVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Vehicle dynamics: the forces on an electric car">
      <Reveal show={is("power-energy")}>
        <Title>Power, energy, distance</Title>
        <rect x={40} y={110} width={110} height={70} rx={10} fill={C.lithium} opacity={0.18} stroke={C.lithium} />
        <Label x={95} y={142} size={16} weight={800} color={C.lithium}>
          E
        </Label>
        <Label x={95} y={162} size={12} color={C.dim}>
          battery energy
        </Label>
        <Flow path="M150 145 L250 145" count={3} dur={1.2} color={C.electron} r={4} />
        <Label x={200} y={130} size={12} color={C.electron}>
          P drawn
        </Label>
        <Car x={270} y={170} />
        <path d="M400 140 L470 140" stroke={C.ink} strokeWidth={2.5} markerEnd="url(#arrow)" />
        <Label x={435} y={128} size={14} weight={700}>
          v
        </Label>
        <line x1={270} y1={210} x2={560} y2={210} stroke={C.dim} strokeDasharray="5 5" />
        <Label x={415} y={232} size={13} color={C.dim}>
          distance S
        </Label>
        <Card x={60} y={270} w={150} h={90} show={is("power-energy")} title="P = F·v" color={C.accent} lines={["force × speed"]} />
        <Card x={225} y={270} w={150} h={90} show={is("power-energy")} delay={0.15} title="E = P·t" color={C.lithium} lines={["power × time"]} />
        <Card x={390} y={270} w={150} h={90} show={is("power-energy")} delay={0.3} title="S = E·v / P" color={C.electron} lines={["more P → less range"]} />
      </Reveal>

      <Reveal show={is("forces")}>
        <Title>Four forces the motor must supply</Title>
        <line x1={40} y1={340} x2={560} y2={230} stroke={C.dim} strokeWidth={3} />
        <path d="M480 340 A 60 60 0 0 0 470 300" fill="none" stroke={C.dim} />
        <Label x={455} y={330} size={14} color={C.dim}>
          θ
        </Label>
        <line x1={40} y1={340} x2={560} y2={340} stroke={C.grid} />
        <Car x={240} y={295} rot={-12} />
        <Arrow x1={360} y1={240} x2={450} y2={221} color={C.lithium} label="Fa" lx={470} ly={214} />
        <Arrow x1={240} y1={285} x2={160} y2={302} color={C.anion} label="FR" lx={140} ly={318} />
        <Arrow x1={250} y1={240} x2={160} y2={259} color={C.lfp} label="FD" lx={140} ly={256} />
        <Arrow x1={310} y1={280} x2={290} y2={350} color={C.hot} label="FC" lx={318} ly={360} />
        <Label x={300} y={100} size={14} color={C.lithium}>
          Fa acceleration · m·a
        </Label>
        <Label x={300} y={122} size={14} color={C.anion}>
          FR rolling resistance · tyres + drivetrain
        </Label>
        <Label x={300} y={144} size={14} color={C.lfp}>
          FD aerodynamic drag · air
        </Label>
        <Label x={300} y={166} size={14} color={C.hot}>
          FC climbing · slope
        </Label>
        <Chip x={300} y={405} text="motive force Fm = Fa + FR + FD + FC" w={330} color={C.accent} />
      </Reveal>

      <Reveal show={is("acceleration")}>
        <Title>Acceleration force: F = m·a</Title>
        <Car x={150} y={230} color={C.lithium} />
        <Arrow x1={290} y1={195} x2={420} y2={195} color={C.lithium} label="a = dv/dt" lx={355} ly={180} />
        <Card x={60} y={280} w={230} h={110} show={is("acceleration")} title="Linear" color={C.lithium} lines={["mass × acceleration", "(Newton's second law)"]} />
        <Card x={310} y={280} w={230} h={110} show={is("acceleration")} delay={0.2} title="+ rotating parts" color={C.electron} lines={["wheels, motor, gears", "≈ 5 % extra: 1.05·Fa"]} />
      </Reveal>

      <Reveal show={is("drag")}>
        <Title>Aerodynamic drag</Title>
        <Car x={240} y={238} color={C.lfp} />
        {[110, 135, 160, 185].map((y, i) => (
          <path key={y} d={`M60 ${y} C 180 ${y} 220 ${y - 30 + i * 6} 300 ${y - 34 + i * 8} S 420 ${y} 540 ${y}`} fill="none" stroke={C.lfp} strokeOpacity={0.5} strokeDasharray="6 6" />
        ))}
        <Flow path="M60 110 C 180 110 220 80 300 76 S 420 110 540 110" count={3} dur={2.4} color={C.lfp} r={3} />
        <Flow path="M60 160 C 180 160 220 142 300 142 S 420 160 540 160" count={3} dur={2.4} color={C.lfp} r={3} />
        <Label x={300} y={262} size={13} color={C.dim}>
          speed relative to the air: v + headwind, v − tailwind
        </Label>
        <Table
          x={60}
          y={278}
          cols={[90, 390]}
          rowH={30}
          size={12.5}
          show={is("drag")}
          rows={[
            ["ρ air", "1.13–1.51 kg/m³ · temperature, humidity, altitude"],
            ["C D", "drag coefficient · how streamlined the car is"],
            ["A", "frontal (cross-sectional) area, m²"],
            ["(v ± v air)²", "doubling speed → four times the force"],
          ]}
        />
      </Reveal>

      <Reveal show={is("drag-example")}>
        <Title y={36}>Worked example: wind and range</Title>
        <Label x={300} y={60} size={12.5} color={C.dim}>
          CD = 0.25 · A = 2 m² · 20 kWh · 120 km/h · ρ = 1.2 kg/m³ · drag only
        </Label>
        <Table
          x={60}
          y={80}
          cols={[120, 120, 120, 120]}
          rowH={36}
          size={13}
          show={is("drag-example")}
          highlight={2}
          rows={[
            ["", "Force", "Power", "Range"],
            ["headwind 12", "403 N", "13.4 kW", "179 km"],
            ["calm", "333 N", "11.1 kW", "216 km"],
            ["tailwind 12", "270 N", "9.0 kW", "267 km"],
          ]}
        />
        <Bars
          x={170}
          y={250}
          w={300}
          gap={42}
          max={267}
          show={is("drag-example")}
          format={(v) => `${v} km`}
          items={[
            { label: "headwind", value: 179, color: C.hot },
            { label: "calm", value: 216, color: C.accent },
            { label: "tailwind", value: 267, color: C.lithium },
          ]}
        />
        <Label x={300} y={400} size={13}>
          S = E·v / P = (20 × 3.6 MJ × 33.3 m/s) / 11.1 kW = 216 km
        </Label>
      </Reveal>

      <Reveal show={is("rolling")}>
        <Title>Rolling resistance: FR = CR·m·g</Title>
        <circle cx={170} cy={180} r={70} fill="#0b1220" stroke={C.ink} strokeWidth={10} />
        <circle cx={170} cy={180} r={30} fill={C.grid} />
        <path d="M110 245 Q170 262 230 245" fill="none" stroke={C.anion} strokeWidth={6} />
        <line x1={60} y1={256} x2={300} y2={256} stroke={C.dim} strokeWidth={3} />
        <Label x={170} y={285} size={12} color={C.anion}>
          tyre flattens at the contact patch
        </Label>
        <Card
          x={330}
          y={90}
          w={240}
          h={140}
          show={is("rolling")}
          title="What it is"
          color={C.anion}
          size={12.5}
          lines={["tyre deformation", "+ drivetrain friction", "barely depends on speed", "g = 9.81 m/s²"]}
        />
        <rect x={60} y={310} width={480} height={100} rx={12} fill="#111a2c" stroke={C.anion} />
        <Label x={300} y={336} size={13} color={C.dim}>
          example: CR = 0.0085 · m = 2000 kg · 10 km/h
        </Label>
        <Label x={300} y={364} size={15} weight={700}>
          FR = 0.0085 × 2000 × 9.81 ≈ 167 N
        </Label>
        <Label x={300} y={390} size={15} weight={700} color={C.anion}>
          P = FR·v = 167 × 2.78 ≈ 464 W
        </Label>
      </Reveal>

      <Reveal show={is("climb")}>
        <Title>Climbing force: FC = m·g·sin θ</Title>
        <line x1={30} y1={250} x2={280} y2={150} stroke={C.dim} strokeWidth={3} />
        <Car x={100} y={222} rot={-22} color={C.hot} />
        <Label x={155} y={285} size={14} weight={700} color={C.hot}>
          uphill: FC &gt; 0
        </Label>
        <Label x={155} y={305} size={12} color={C.dim}>
          extra force from the motor
        </Label>
        <line x1={320} y1={150} x2={570} y2={250} stroke={C.dim} strokeWidth={3} />
        <Car x={400} y={182} rot={22} color={C.lithium} />
        <Flow path="M420 120 L360 96" count={3} dur={1.2} color={C.lithium} r={4} />
        <Label x={445} y={285} size={14} weight={700} color={C.lithium}>
          downhill: FC &lt; 0
        </Label>
        <Label x={445} y={305} size={12} color={C.dim}>
          regenerate into the battery
        </Label>
        <rect x={60} y={330} width={480} height={86} rx={12} fill="#111a2c" stroke={C.lithium} />
        <Label x={300} y={354} size={13} color={C.dim}>
          1645 kg · down 6° · 120 km/h (33.3 m/s)
        </Label>
        <Label x={300} y={384} size={15} weight={700} color={C.lithium}>
          P = m·g·sin(−6°)·v ≈ −56 kW: energy to recover
        </Label>
      </Reveal>

      <Reveal show={is("coastdown")}>
        <Title y={36}>Coast-down test</Title>
        <Axes box={cBox} xLabel="time (s)" yLabel="speed (km/h)" xLabelDy={28} />
        <DrawPath d={cs.path(coast)} show={is("coastdown")} color={C.electron} />
        <Label x={cs.sx(60)} y={cs.sy(95)} size={12} color={C.electron}>
          neutral, let it roll
        </Label>
        <Axes box={rBox} xLabel="speed (m/s)" yLabel="road-load force (N)" xLabelDy={28} />
        <path d={`${rs.path(VS.map((v) => [v, A + B * v + Cc * v * v] as [number, number]))}L${rs.sx(40)},${rs.sy(0)}L${rs.sx(0)},${rs.sy(0)}Z`} fill={C.lfp} opacity={0.25} />
        <path d={`${rs.path(VS.map((v) => [v, A + B * v] as [number, number]))}L${rs.sx(40)},${rs.sy(0)}L${rs.sx(0)},${rs.sy(0)}Z`} fill={C.anion} opacity={0.4} />
        <DrawPath d={rs.path(VS.map((v) => [v, A + B * v + Cc * v * v] as [number, number]))} show={is("coastdown")} color={C.lfp} />
        <Label x={rs.sx(4)} y={rs.sy(800)} anchor="start" size={12} weight={700} color={C.lfp}>
          C·v²: drag
        </Label>
        <Label x={rs.sx(20)} y={rs.sy(60)} size={12} weight={700} color={C.anion}>
          A + B·v
        </Label>
        <Table
          x={90}
          y={320}
          cols={[60, 360]}
          rowH={30}
          size={12.5}
          show={is("coastdown")}
          rows={[
            ["A", "≈ rolling resistance (130 N)"],
            ["B", "spinning / rotational losses, small"],
            ["C", "≈ aerodynamic drag (0.49 N·s²/m²)"],
          ]}
        />
      </Reveal>

      <Reveal show={is("speed-power")}>
        <Title y={36}>Why highway speed eats range</Title>
        <Axes box={pBox} xLabel="speed (km/h)" yLabel="power at the wheels (kW)" xLabelDy={30} />
        {[0, 40, 80, 120].map((k) => (
          <Label key={k} x={ps.sx(k)} y={pBox.y + pBox.h + 16} size={11} color={C.dim}>
            {k}
          </Label>
        ))}
        {[10, 20, 30, 40].map((p) => (
          <Label key={p} x={pBox.x - 8} y={ps.sy(p) + 4} anchor="end" size={11} color={C.dim}>
            {p}
          </Label>
        ))}
        <DrawPath d={ppath(pRoll)} show={is("speed-power")} color={C.anion} />
        <DrawPath d={ppath(pDrag)} show={is("speed-power")} color={C.lfp} delay={0.3} />
        <DrawPath d={ppath((k) => pRoll(k) + pDrag(k))} show={is("speed-power")} color={C.ink} delay={0.6} width={3.5} />
        <DrawPath d={ppath((k) => pRoll(k) + pDrag(k) + pClimb(k))} show={is("speed-power")} color={C.hot} delay={0.9} dash="6 5" />
        <Label x={ps.sx(136)} y={ps.sy(pRoll(136)) - 8} anchor="end" size={12} weight={700} color={C.anion}>
          rolling ∝ v
        </Label>
        <Label x={ps.sx(128)} y={ps.sy(pDrag(128)) + 18} anchor="start" size={12} weight={700} color={C.lfp}>
          drag ∝ v³
        </Label>
        <Label x={ps.sx(92)} y={ps.sy(pRoll(92) + pDrag(92)) - 8} anchor="end" size={12} weight={700}>
          total, flat road
        </Label>
        <Label x={ps.sx(70)} y={ps.sy(pRoll(70) + pDrag(70) + pClimb(70)) - 10} anchor="end" size={12} weight={700} color={C.hot}>
          + 1° incline
        </Label>
        <Chip x={300} y={395} text="above ≈ 90 km/h, air resistance dominates" w={360} color={C.lfp} />
        <Label x={300} y={428} size={11} color={C.dim}>
          Model-3-like car, after Per Enge, Electric Vehicle Engineering
        </Label>
      </Reveal>

      <Reveal show={is("hvac")}>
        <Title y={40}>Problem: heating costs range</Title>
        <Label x={300} y={66} size={13} color={C.dim}>
          24 kWh battery · 170 km at a steady 88 km/h · heating/AC draws 6 kW
        </Label>
        <Label x={160} y={106} size={14} weight={700}>
          power drawn
        </Label>
        <motion.rect x={80} y={120} width={160} height={124} fill={C.accent} opacity={0.85} initial={false} animate={{ opacity: is("hvac") ? 0.85 : 0 }} />
        <motion.rect x={80} y={244} width={160} height={60} fill={C.hot} opacity={0.85} initial={false} animate={{ opacity: is("hvac") ? 0.85 : 0 }} transition={{ delay: 0.4 }} />
        <Label x={160} y={188} size={14} weight={700} color="#0b1220">
          driving 12.4 kW
        </Label>
        <Label x={160} y={280} size={14} weight={700} color="#0b1220">
          + HVAC 6 kW
        </Label>
        <Label x={160} y={326} size={14} weight={700}>
          = 18.4 kW
        </Label>
        <Bars
          x={390}
          y={130}
          w={150}
          gap={60}
          max={170}
          show={is("hvac")}
          format={(v) => `${v} km`}
          items={[
            { label: "off", value: 170, color: C.accent },
            { label: "on", value: 114, color: C.hot },
          ]}
        />
        <Label x={450} y={106} size={14} weight={700}>
          range
        </Label>
        <Table
          x={300}
          y={260}
          cols={[270]}
          rowH={30}
          size={12.5}
          show={is("hvac")}
          rows={[["t = 170 / 88 = 1.93 h"], ["P = 24 / 1.93 = 12.4 kW"], ["t′ = 24 / 18.4 = 1.30 h"], ["S′ = 88 × 1.30 ≈ 114 km"]]}
        />
      </Reveal>

      <Reveal show={is("grade")}>
        <Title y={36}>Problem: find the road grade</Title>
        <Label x={300} y={60} size={12.5} color={C.dim}>
          1645 kg · 126 km/h = 35 m/s · A = 130 · B = 0.71 · C = 0.49 · η = 92 % · 85 kW
        </Label>
        <Bars
          x={210}
          y={90}
          w={300}
          gap={48}
          max={85}
          show={is("grade")}
          format={(v) => `${v} kW`}
          items={[
            { label: "battery", value: 85, color: C.lithium },
            { label: "at the wheels", value: 78.2, color: C.accent, note: "× 0.92" },
            { label: "road load", value: 26.4, color: C.lfp, note: "755 N × 35 m/s" },
            { label: "climbing", value: 51.8, color: C.hot, note: "the rest" },
          ]}
        />
        <rect x={60} y={300} width={480} height={110} rx={12} fill="#111a2c" stroke={C.hot} />
        <Label x={300} y={328} size={14}>
          FC = 51.8 kW / 35 m/s ≈ 1479 N
        </Label>
        <Label x={300} y={354} size={14}>
          sin θ = 1479 / (1645 × 9.81) ≈ 0.092
        </Label>
        <Label x={300} y={386} size={17} weight={800} color={C.hot}>
          θ ≈ 5.3°, an incline
        </Label>
      </Reveal>
    </Stage>
  );
}
