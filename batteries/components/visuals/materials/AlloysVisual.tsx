"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

/* creep curves */
const cBox = { x: 330, y: 150, w: 230, h: 180 };
const cs = makeScale(cBox, [0, 1], [0, 1]);
const creep = (rate: number) =>
  cs.path(Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    return [t, Math.min(1, 0.12 + 0.25 * (1 - Math.exp(-t * 8)) + rate * t)] as [number, number];
  }));

/* specific strength (typical values) */
const ALLOYS = [
  { name: "steel", s: 1000, rho: 7.9, color: C.zinc },
  { name: "Al 7075", s: 500, rho: 2.8, color: C.lfp },
  { name: "Ti-6Al-4V", s: 900, rho: 4.4, color: C.anion },
];

export default function AlloysVisual({ visual }: { visual: string }) {
  const sup = visual === "superalloys";
  return (
    <Stage label="Superalloys and light alloys">
      {/* superalloys */}
      <Reveal show={sup}>
        <Label x={170} y={45} size={15} weight={700}>
          γ matrix + coherent γ′
        </Label>
        <rect x={40} y={65} width={260} height={260} fill={C.lfp} opacity={0.25} stroke={C.dim} />
        {Array.from({ length: 25 }, (_, i) => (
          <rect key={i} x={50 + (i % 5) * 51} y={75 + Math.floor(i / 5) * 51} width={38} height={38} rx={3} fill={C.electron} opacity={0.85} />
        ))}
        <motion.path
          fill="none"
          stroke={C.hot}
          strokeWidth={4}
          initial={false}
          animate={{
            d: sup
              ? ["M40 295 L300 295", "M40 295 Q 110 270 112 295 Q 160 270 163 295 Q 215 270 214 295 L300 295", "M40 295 L300 295"]
              : "M40 295 L300 295",
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <Label x={170} y={348} size={12} color={C.hot}>
          dislocation (red) is blocked by γ′
        </Label>
        <Label x={330} y={90} anchor="start" size={13} color={C.lfp} weight={700}>
          γ: fcc Ni solid solution
        </Label>
        <Label x={330} y={120} anchor="start" size={13} color={C.electron} weight={700}>
          γ′: ordered Ni₃(Al,Ti)
        </Label>
        <Label x={330} y={140} anchor="start" size={12} color={C.dim}>
          coherent with the matrix
        </Label>
        <Label x={330} y={190} anchor="start" size={13}>
          strength up to ~1000 °C
        </Label>
        <Label x={330} y={212} anchor="start" size={13}>
          excellent creep resistance
        </Label>
        <Label x={330} y={234} anchor="start" size={13}>
          Cr, Al → protective oxide
        </Label>
        <Chip x={300} y={405} text="precipitates block dislocations → strength at high temperature" w={470} />
      </Reveal>

      {/* creep slip */}
      <Reveal show={visual === "creep-slip"}>
        <Label x={300} y={45} size={15} weight={700}>
          Careful: a slip in one answer key
        </Label>
        <rect x={40} y={70} width={250} height={60} rx={10} fill={C.hot} opacity={0.15} />
        <Label x={165} y={106} size={15} color={C.hot}>
          &quot;low creep resistance&quot;
        </Label>
        <line x1={55} x2={275} y1={101} y2={101} stroke={C.hot} strokeWidth={2.5} />
        <rect x={40} y={150} width={250} height={60} rx={10} fill={C.lithium} opacity={0.15} stroke={C.lithium} />
        <Label x={165} y={186} size={15} weight={700} color={C.lithium}>
          ✓ high creep resistance
        </Label>
        <Label x={165} y={250} size={13}>
          creep: slow deformation
        </Label>
        <Label x={165} y={270} size={13}>
          under load at high temperature
        </Label>
        <Label x={445} y={80} size={14} weight={700}>
          Creep curves at high T
        </Label>
        <Axes box={cBox} xLabel="time" yLabel="strain" />
        <DrawPath d={creep(0.9)} show={visual === "creep-slip"} color={C.hot} width={3} />
        <DrawPath d={creep(0.12)} show={visual === "creep-slip"} color={C.lithium} width={3} delay={0.3} />
        <Label x={cs.sx(0.5)} y={cs.sy(0.9)} anchor="end" size={12} color={C.hot}>
          ordinary alloy
        </Label>
        <Label x={cs.sx(0.98)} y={cs.sy(0.56) - 10} anchor="end" size={12} color={C.lithium}>
          superalloy
        </Label>
        <Chip x={300} y={405} text="that is why superalloys sit in the hot parts of jet engines" w={440} />
      </Reveal>

      {/* specific strength */}
      <Reveal show={visual === "specific"}>
        <Label x={300} y={42} size={15} weight={700}>
          Specific strength = strength / density
        </Label>
        {[
          { title: "strength (MPa)", x0: 60, val: (a: (typeof ALLOYS)[number]) => a.s, max: 1000, fmt: (v: number) => `${v}` },
          { title: "strength / density", x0: 330, val: (a: (typeof ALLOYS)[number]) => a.s / a.rho, max: 210, fmt: (v: number) => `${Math.round(v)}` },
        ].map((panel) => (
          <g key={panel.title}>
            <Label x={panel.x0 + 105} y={80} size={13} color={C.dim}>
              {panel.title}
            </Label>
            <line x1={panel.x0} x2={panel.x0 + 210} y1={330} y2={330} stroke={C.dim} />
            {ALLOYS.map((a, i) => {
              const v = panel.val(a);
              const h = (v / panel.max) * 210;
              return (
                <g key={a.name}>
                  <motion.rect
                    x={panel.x0 + 12 + i * 68}
                    width={50}
                    fill={a.color}
                    opacity={0.85}
                    initial={false}
                    animate={{ y: visual === "specific" ? 330 - h : 330, height: visual === "specific" ? h : 0 }}
                    transition={{ duration: 0.8, delay: i * 0.12 }}
                  />
                  <Label x={panel.x0 + 37 + i * 68} y={322 - h} size={12} weight={700}>
                    {panel.fmt(v)}
                  </Label>
                  <Label x={panel.x0 + 37 + i * 68} y={350} size={12}>
                    {a.name}
                  </Label>
                </g>
              );
            })}
          </g>
        ))}
        <Label x={300} y={382} size={12} color={C.dim}>
          typical values; steel is strongest, Ti and Al win per kilogram
        </Label>
        <Chip x={300} y={418} text="when mass matters (aircraft, cars, implants), compare per kg" color={C.accent} w={450} />
      </Reveal>

      {/* light alloys */}
      <Reveal show={visual === "light-alloys"}>
        <Label x={300} y={42} size={15} weight={700}>
          Density (g/cm³)
        </Label>
        {[
          { name: "steel", v: 7.9, color: C.zinc },
          { name: "Ti", v: 4.5, color: C.anion },
          { name: "Al", v: 2.7, color: C.lfp },
        ].map((b, i) => (
          <g key={b.name}>
            <Label x={130} y={82 + i * 34} anchor="end" size={13}>
              {b.name}
            </Label>
            <motion.rect
              x={140}
              y={68 + i * 34}
              height={20}
              rx={5}
              fill={b.color}
              initial={false}
              animate={{ width: visual === "light-alloys" ? b.v * 45 : 0 }}
              transition={{ duration: 0.8, delay: i * 0.12 }}
            />
            <Label x={148 + b.v * 45} y={83 + i * 34} anchor="start" size={13} weight={700}>
              {b.v}
            </Label>
          </g>
        ))}
        {[
          { x: 160, title: "Aluminium", color: C.lfp, lines: ["2.7 g/cm³, high specific strength", "protective Al₂O₃ layer", "melts at 660 °C", "precipitation hardened"] },
          { x: 440, title: "Titanium", color: C.anion, lines: ["4.5 g/cm³, high specific strength", "excellent corrosion resistance", "biocompatible (implants)", "expensive"] },
        ].map((k) => (
          <g key={k.title}>
            <rect x={k.x - 130} y={190} width={260} height={160} rx={12} fill={k.color} opacity={0.12} stroke={k.color} />
            <Label x={k.x} y={218} size={14} weight={700} color={k.color}>
              {k.title}
            </Label>
            {k.lines.map((l, i) => (
              <Label key={l} x={k.x} y={250 + i * 24} size={12}>
                {l}
              </Label>
            ))}
          </g>
        ))}
        <Chip x={300} y={400} text="Al: light but low melting point · Ti: light, strong, costly" w={440} />
      </Reveal>
    </Stage>
  );
}
