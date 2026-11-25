"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Flow, Label, Reveal, Stage, makeScale } from "../primitives";
import { Card, Table, Title } from "../blocks";

/* Induction torque–speed curve (Kloss): T = 2 Tmax / (s/sk + sk/s), zero at synchronous speed. */
const iBox = { x: 70, y: 90, w: 300, h: 190 };
const ind = makeScale(iBox, [0, 1.05], [0, 1.1]);
const sk = 0.2;
const kloss: [number, number][] = Array.from({ length: 101 }, (_, i) => {
  const n = i / 100;
  const s = Math.max(1 - n, 1e-6);
  return [n, 2 / (s / sk + sk / s)];
});

function Rotor({ cx, cy, kind }: { cx: number; cy: number; kind: "surface" | "interior" | "spoke" }) {
  const r = 62;
  const mags = Array.from({ length: 4 }, (_, i) => (i * Math.PI) / 2);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={C.zinc} opacity={0.22} stroke={C.zinc} />
      <circle cx={cx} cy={cy} r={12} fill="#0b1220" stroke={C.dim} />
      {kind === "surface" &&
        mags.map((a, i) => {
          const a0 = a - 0.55,
            a1 = a + 0.55;
          const p = (rad: number, t: number) => `${cx + rad * Math.cos(t)} ${cy + rad * Math.sin(t)}`;
          return <path key={i} d={`M${p(r, a0)} A${r} ${r} 0 0 1 ${p(r, a1)} L${p(r + 10, a1)} A${r + 10} ${r + 10} 0 0 0 ${p(r + 10, a0)} Z`} fill={i % 2 ? C.lfp : C.hot} />;
        })}
      {kind === "interior" &&
        mags.map((a, i) => (
          <rect key={i} x={-22} y={-5} width={44} height={10} fill={i % 2 ? C.lfp : C.hot} transform={`translate(${cx + 42 * Math.cos(a)} ${cy + 42 * Math.sin(a)}) rotate(${(a * 180) / Math.PI + 90})`} />
        ))}
      {kind === "spoke" &&
        Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4).map((a, i) => (
          <rect key={i} x={-20} y={-4} width={40} height={8} fill={i % 2 ? C.lfp : C.hot} transform={`translate(${cx + 38 * Math.cos(a)} ${cy + 38 * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`} />
        ))}
    </g>
  );
}

const LOSSES = [
  { t: "Copper", s: "I²R in windings", c: C.copper },
  { t: "Iron", s: "hysteresis + eddy", c: C.zinc },
  { t: "Mechanical", s: "bearings, windage", c: C.lfp },
  { t: "Magnet, stray", s: "eddy in magnets", c: C.hot },
];

export default function MachinesVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Types of electric machines, magnets and losses">
      <Reveal show={is("classes")}>
        <Title>How does the rotor get its field?</Title>
        {[
          { t: "Induced currents", m: ["Induction", "(asynchronous)"], c: C.electron },
          { t: "Permanent magnets", m: ["PM synchronous", "(PMSM)"], c: C.hot },
          { t: "DC in a rotor winding", m: ["Wound-field", "synchronous"], c: C.copper },
          { t: "Nothing: shaped iron", m: ["Reluctance", "machine"], c: C.zinc },
        ].map((k, i) => (
          <Card key={k.t} x={20 + i * 142} y={90} w={132} h={190} show={is("classes")} delay={i * 0.12} title={k.m[0]} color={k.c} lines={[k.m[1], "", "rotor field from:", k.t]} size={12} />
        ))}
        <Label x={300} y={330} size={14}>
          same stator and rotating field in all of them
        </Label>
        <Label x={300} y={356} size={13} color={C.dim}>
          DC machines differ: the commutator on the rotor acts as a mechanical inverter
        </Label>
      </Reveal>

      <Reveal show={is("induction")}>
        <Title>Induction machine: the rotor slips behind</Title>
        <Axes box={iBox} xLabel="speed n / nₛ" yLabel="torque" />
        <DrawPath d={ind.path(kloss)} show={is("induction")} color={C.electron} />
        <circle cx={ind.sx(1)} cy={ind.sy(0)} r={6} fill={C.hot} />
        <Label x={ind.sx(1) - 10} y={ind.sy(0) - 12} anchor="end" size={12} color={C.hot}>
          no slip, no torque
        </Label>
        <Chip x={220} y={330} text="s = (nₛ − n) / nₛ" color={C.electron} w={170} />
        <Card x={400} y={80} w={180} h={130} show={is("induction")} title="Pros" color={C.lithium} lines={["robust and simple", "no magnets", "no back-EMF at fault"]} size={12} />
        <Card x={400} y={220} w={180} h={130} show={is("induction")} delay={0.15} title="Cons" color={C.hot} lines={["rotor copper loss", "lower efficiency", "magnetising current"]} size={12} />
        <Label x={300} y={400} size={13} color={C.dim}>
          slip induces rotor currents (Faraday) → force in the field (Lorentz) → torque
        </Label>
      </Reveal>

      <Reveal show={is("pmsm")}>
        <Title>Permanent-magnet synchronous machine</Title>
        <g>
          <Rotor cx={150} cy={210} kind="surface" />
          <animateTransform attributeName="transform" type="rotate" from="0 150 210" to="360 150 210" dur="5s" repeatCount="indefinite" />
        </g>
        <circle cx={150} cy={210} r={100} fill="none" stroke={C.grid} strokeWidth={12} />
        <Label x={150} y={345} size={13} color={C.dim}>
          magnets lock onto the field
        </Label>
        <Card x={290} y={80} w={290} h={140} show={is("pmsm")} title="Why most EVs use it" color={C.lithium} lines={["no rotor current → no rotor copper loss", "highest efficiency and power density", "Toyota Prius, Chevrolet Volt"]} size={12} />
        <Card x={290} y={230} w={290} h={140} show={is("pmsm")} delay={0.15} title="Watch out" color={C.hot} lines={["back-EMF whenever it spins, even at a fault", "magnet cost and supply risk", "demagnetisation limits"]} size={12} />
      </Reveal>

      <Reveal show={is("wound")}>
        <Title>Wound-field synchronous machine</Title>
        <circle cx={150} cy={200} r={70} fill={C.zinc} opacity={0.22} stroke={C.zinc} />
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx={150} cy={160 + i * 20} rx={46} ry={6} fill="none" stroke={C.copper} strokeWidth={3} />
        ))}
        <rect x={230} y={185} width={14} height={30} rx={3} fill={C.electron} />
        <rect x={252} y={185} width={14} height={30} rx={3} fill={C.electron} />
        <path d="M220 200 H230" stroke={C.copper} strokeWidth={3} />
        <Label x={248} y={240} size={12} color={C.electron}>
          slip rings
        </Label>
        <Flow path="M300 200 H266" count={3} dur={1.2} color={C.electron} r={4} />
        <Label x={318} y={205} anchor="start" size={13} color={C.electron}>
          DC
        </Label>
        <Card x={360} y={80} w={220} h={140} show={is("wound")} title="Pros" color={C.lithium} lines={["field adjustable", "switch it off at a fault", "no magnets"]} size={12} />
        <Card x={360} y={230} w={220} h={140} show={is("wound")} delay={0.15} title="Costs" color={C.hot} lines={["rotor copper loss", "extra parts", "complexity"]} size={12} />
        <Label x={180} y={330} size={13} color={C.dim}>
          power-station generators, Renault ZOE
        </Label>
      </Reveal>

      <Reveal show={is("magnets")}>
        <Title>Magnet materials</Title>
        <Table
          x={20}
          y={75}
          cols={[90, 110, 120, 240]}
          show={is("magnets")}
          highlight={1}
          rowH={52}
          size={13}
          rows={[
            ["Magnet", "Br", "Max temp.", "Trade-off"],
            ["NdFeB", "1.0–1.4 T", "80–200 °C", "strongest; rare-earth supply risk"],
            ["SmCo", "0.8–1.1 T", "250–350 °C", "stable when hot; costly"],
            ["Ferrite", "0.2–0.45 T", "≤ 250 °C", "cheap, no rare earths; weak"],
            ["AlNiCo", "0.6–1.3 T", "≤ 500 °C", "very stable; easily demagnetised"],
          ]}
        />
        <Label x={300} y={370} size={13} color={C.dim}>
          remanence Br, coercivity Hc and energy product (BH)max all shift with temperature
        </Label>
      </Reveal>

      <Reveal show={is("rotor-topologies")}>
        <Title>Where the magnets sit</Title>
        {(
          [
            { k: "surface", t: "Surface (SPM)", l: ["simple, no reluctance torque", "needs a retaining sleeve"] },
            { k: "interior", t: "Interior (IPM)", l: ["adds reluctance torque", "wide field weakening"] },
            { k: "spoke", t: "Spoke", l: ["concentrates the flux", "ferrite can do the job"] },
          ] as const
        ).map((r, i) => (
          <motion.g key={r.k} initial={false} animate={{ opacity: is("rotor-topologies") ? 1 : 0 }} transition={{ delay: is("rotor-topologies") ? i * 0.15 : 0 }}>
            <Rotor cx={100 + i * 200} cy={170} kind={r.k} />
            <Label x={100 + i * 200} y={270} size={15} weight={700} color={C.accent}>
              {r.t}
            </Label>
            {r.l.map((line, j) => (
              <Label key={j} x={100 + i * 200} y={294 + j * 18} size={12} color={C.dim}>
                {line}
              </Label>
            ))}
          </motion.g>
        ))}
        <Label x={300} y={385} size={14}>
          case study: a rare-earth-free ferrite spoke rotor
        </Label>
        <Label x={300} y={407} size={13} color={C.dim}>
          replaces an NdFeB IPM in the same stator — bigger magnets, protected against demagnetisation
        </Label>
      </Reveal>

      <Reveal show={is("machine-compare")}>
        <Title>Comparing the machine types</Title>
        <Table
          x={20}
          y={70}
          cols={[110, 150, 150, 150]}
          show={is("machine-compare")}
          rowH={42}
          size={12}
          rows={[
            ["", "Induction", "Permanent magnet", "Wound-field"],
            ["Rotor field", "slip currents", "magnets", "DC winding"],
            ["Rotor losses", "significant", "small", "field copper"],
            ["Magnets", "none", "yes", "none"],
            ["Power density", "medium", "high", "medium–high"],
            ["Efficiency", "good", "highest", "high, adjustable"],
            ["At a fault", "no back-EMF", "back-EMF", "field off"],
            ["Examples", "early Tesla", "Prius, most EVs", "Renault ZOE"],
          ]}
        />
        <Label x={300} y={420} size={12} color={C.dim}>
          reluctance: robust but noisy · DC: simple control, but brushes wear
        </Label>
      </Reveal>

      <Reveal show={is("losses")}>
        <Title>Where the energy goes: η = P_out / P_in</Title>
        <rect x={30} y={90} width={90} height={160} rx={8} fill={C.electron} opacity={0.8} />
        <Label x={75} y={175} size={14} weight={700} color="#0b1220">
          P_in
        </Label>
        <path d="M120 90 L480 110 L480 230 L120 250 Z" fill={C.electron} opacity={0.15} />
        <rect x={480} y={110} width={90} height={120} rx={8} fill={C.lithium} opacity={0.8} />
        <Label x={525} y={175} size={14} weight={700} color="#0b1220">
          P_out
        </Label>
        {LOSSES.map((l, i) => (
          <motion.g key={l.t} initial={false} animate={{ opacity: is("losses") ? 1 : 0, y: is("losses") ? 0 : -8 }} transition={{ delay: is("losses") ? 0.2 + i * 0.12 : 0 }}>
            <path d={`M${150 + i * 100} 245 L${150 + i * 100} 285`} stroke={l.c} strokeWidth={3} markerEnd="url(#arrow)" />
            <Label x={150 + i * 100} y={308} size={13} weight={700} color={l.c}>
              {l.t}
            </Label>
            <Label x={150 + i * 100} y={326} size={11} color={C.dim}>
              {l.s}
            </Label>
          </motion.g>
        ))}
        <Label x={300} y={375} size={14}>
          low speed, high torque: copper loss dominates
        </Label>
        <Label x={300} y={398} size={14}>
          high speed: iron and magnet losses take over
        </Label>
        <Label x={300} y={425} size={13} color={C.accent}>
          design for the drive cycle, not only the peak point
        </Label>
      </Reveal>
    </Stage>
  );
}
