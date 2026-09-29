"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale, SvgLoop } from "../primitives";

/* ---- Fe–C corner (schematic, metastable) ---- */
const fBox = { x: 70, y: 60, w: 250, h: 280 };
const f = makeScale(fBox, [0, 2], [500, 1200]);

/* ---- Schaeffler (schematic) ---- */
const sBox = { x: 80, y: 60, w: 440, h: 290 };
const s = makeScale(sBox, [0, 40], [0, 32]);
const poly = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${s.sx(x)},${s.sy(y)}`).join("") + "Z";
const REGIONS: { name: string; pts: [number, number][]; at: [number, number]; color: string }[] = [
  { name: "A", pts: [[0, 12], [40, 32], [0, 32]], at: [9, 25], color: C.lfp },
  { name: "A + M", pts: [[0, 9], [0, 12], [14, 19], [14, 15]], at: [6, 13.2], color: C.anion },
  { name: "M", pts: [[0, 4], [0, 9], [14, 15], [14, 8]], at: [6, 8.6], color: C.hot },
  { name: "M + F", pts: [[0, 0], [0, 4], [14, 8], [18, 0]], at: [7, 2.2], color: C.copper },
  { name: "A + F", pts: [[14, 8], [14, 19], [40, 32], [40, 18], [18, 0]], at: [27, 16], color: C.accent },
  { name: "F", pts: [[18, 0], [40, 18], [40, 0]], at: [34, 5], color: C.electron },
];

function Pearlite({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <clipPath id="pearlite-clip">
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      <g clipPath="url(#pearlite-clip)">
        <rect x={x} y={y} width={w} height={h} fill={C.zinc} opacity={0.5} />
        <g transform={`rotate(-25 ${x + w / 2} ${y + h / 2})`}>
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={x - w / 2} y={y - h / 2 + i * 16} width={w * 2} height={5} fill={C.graphite} />
          ))}
        </g>
      </g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.dim} />
    </g>
  );
}

export default function SteelsVisual({ visual }: { visual: string }) {
  const fe = visual === "fe-c";
  return (
    <Stage label="Steels">
      {/* Fe–C */}
      <Reveal show={fe}>
        <Axes box={fBox} xLabel="wt % C" yLabel="T (°C)" xLabelDy={40} />
        {[0, 0.76, 2].map((v) => (
          <Label key={v} x={f.sx(v)} y={fBox.y + fBox.h + 18} size={12} color={C.dim}>
            {v}
          </Label>
        ))}
        {[727, 912].map((v) => (
          <Label key={v} x={fBox.x - 8} y={f.sy(v) + 4} anchor="end" size={12} color={C.dim}>
            {v}
          </Label>
        ))}
        <DrawPath d={f.path([[0, 912], [0.76, 727]])} show={fe} color={C.lfp} width={3} />
        <DrawPath d={f.path([[0.76, 727], [2, 1148]])} show={fe} color={C.lfp} width={3} delay={0.2} />
        <DrawPath d={f.path([[0, 912], [0.022, 727], [0.01, 500]])} show={fe} color={C.zinc} width={2} delay={0.3} />
        <DrawPath d={f.path([[0.022, 727], [2, 727]])} show={fe} color={C.electron} width={3} delay={0.4} />
        <circle cx={f.sx(0.76)} cy={f.sy(727)} r={6} fill={C.electron} />
        <Label x={f.sx(0.7)} y={f.sy(1050)} size={14} weight={700} color={C.lfp}>
          γ austenite (fcc)
        </Label>
        <Label x={f.sx(1.55)} y={f.sy(850)} size={12}>
          γ + Fe₃C
        </Label>
        <Label x={f.sx(1.1)} y={f.sy(600)} size={13} weight={700}>
          α + Fe₃C
        </Label>
        <Label x={f.sx(0.76)} y={f.sy(727) + 20} size={12} color={C.electron}>
          eutectoid: 0.76 wt %, 727 °C
        </Label>
        <Label x={f.sx(0.05) + 4} y={f.sy(560)} anchor="start" size={12} color={C.zinc}>
          α (bcc)
        </Label>

        <Label x={465} y={55} size={14} weight={700}>
          Pearlite: γ → α + Fe₃C
        </Label>
        <Pearlite x={360} y={75} w={210} h={140} />
        <Label x={465} y={238} size={12} color={C.dim}>
          light ferrite + dark cementite
        </Label>
        <Label x={465} y={285} size={13}>
          fcc: larger octahedral voids
        </Label>
        <Label x={465} y={305} size={13}>
          → up to ~2 wt % C dissolves
        </Label>
        <Label x={465} y={335} size={13}>
          bcc: only ~0.02 wt % C
        </Label>
        <Chip x={300} y={420} text="slow cooling at 0.76 wt % C → pearlite at 727 °C" w={380} />
      </Reveal>

      {/* stainless */}
      <Reveal show={visual === "stainless"}>
        <Label x={300} y={45} size={15} weight={700}>
          Stainless: more than 11 wt % Cr
        </Label>
        <rect x={120} y={70} width={360} height={36} fill={C.zinc} opacity={0.5} />
        <rect x={120} y={62} width={360} height={8} fill={C.lithium} opacity={0.5}>
          <SvgLoop attr="opacity" values={[0.5, 1, 0.5]} dur={2} active={visual === "stainless"} />
        </rect>
        <Label x={300} y={93} size={12} color="#0b1220" weight={700}>
          steel
        </Label>
        <Label x={490} y={70} anchor="start" size={12} color={C.lithium}>
          Cr₂O₃ film
        </Label>
        {[
          { x: 110, title: "Austenitic", color: C.lfp, lines: ["Ni stabilises fcc", "e.g. 304: 18 Cr / 8 Ni", "non-magnetic", "most common (~2/3)"] },
          { x: 300, title: "Ferritic", color: C.electron, lines: ["Cr stabilises bcc", "e.g. 430", "magnetic", "cheaper (no Ni)"] },
          { x: 490, title: "Martensitic", color: C.hot, lines: ["C + Cr", "can be hardened", "magnetic", "less corrosion-proof"] },
        ].map((k) => (
          <g key={k.title}>
            <rect x={k.x - 85} y={130} width={170} height={150} rx={12} fill={k.color} opacity={0.12} stroke={k.color} />
            <Label x={k.x} y={156} size={14} weight={700} color={k.color}>
              {k.title}
            </Label>
            {k.lines.map((l, i) => (
              <Label key={l} x={k.x} y={186 + i * 22} size={12}>
                {l}
              </Label>
            ))}
          </g>
        ))}
        <Label x={300} y={320} size={13} color={C.dim}>
          price ratio Fe : Cr : Ni
        </Label>
        {[
          { name: "Fe", v: 1, color: C.zinc },
          { name: "Cr", v: 4, color: C.electron },
          { name: "Ni", v: 10, color: C.lfp },
        ].map((b, i) => (
          <g key={b.name}>
            <Label x={170} y={348 + i * 26} anchor="end" size={12}>
              {b.name}
            </Label>
            <motion.rect
              x={180}
              y={336 + i * 26}
              height={16}
              rx={4}
              fill={b.color}
              initial={false}
              animate={{ width: visual === "stainless" ? b.v * 28 : 0 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            />
            <Label x={188 + b.v * 28} y={348 + i * 26} anchor="start" size={12} weight={700}>
              {b.v}
            </Label>
          </g>
        ))}
      </Reveal>

      {/* Schaeffler */}
      <Reveal show={visual === "schaeffler"}>
        {REGIONS.map((r, i) => (
          <motion.g key={r.name} initial={false} animate={{ opacity: visual === "schaeffler" ? 1 : 0 }} transition={{ delay: visual === "schaeffler" ? i * 0.1 : 0 }}>
            <path d={poly(r.pts)} fill={r.color} opacity={0.18} stroke={r.color} strokeOpacity={0.6} />
            <Label x={s.sx(r.at[0])} y={s.sy(r.at[1]) + 5} size={14} weight={700} color={r.color}>
              {r.name}
            </Label>
          </motion.g>
        ))}
        <Axes box={sBox} xLabel="Cr equivalent (wt %)" yLabel="Ni equivalent (wt %)" xLabelDy={40} />
        {[0, 10, 20, 30, 40].map((v) => (
          <Label key={v} x={s.sx(v)} y={sBox.y + sBox.h + 18} size={12} color={C.dim}>
            {v}
          </Label>
        ))}
        {[10, 20, 30].map((v) => (
          <Label key={v} x={sBox.x - 8} y={s.sy(v) + 4} anchor="end" size={12} color={C.dim}>
            {v}
          </Label>
        ))}
        <circle cx={s.sx(18.8)} cy={s.sy(10.3)} r={7} fill={C.ink} stroke="#0b1220" strokeWidth={2} />
        <Label x={s.sx(18.8) + 12} y={s.sy(10.3) + 4} anchor="start" size={13} weight={700}>
          304 steel
        </Label>
        <Label x={300} y={432} size={12} color={C.dim}>
          Cr_eq = Cr + Mo + 1.5 Si + 0.5 Nb · Ni_eq = Ni + 30 C + 0.5 Mn (schematic regions)
        </Label>
      </Reveal>

      {/* duplex */}
      <Reveal show={visual === "duplex"}>
        <Label x={300} y={45} size={15} weight={700}>
          Duplex: ≈ 50 % austenite + 50 % ferrite
        </Label>
        <rect x={40} y={70} width={320} height={220} fill={C.graphite} />
        {Array.from({ length: 9 }, (_, i) => (
          <motion.path
            key={i}
            d={`M40 ${86 + i * 23} C 120 ${80 + i * 23}, 200 ${94 + i * 23}, 360 ${84 + i * 23}`}
            stroke={C.zinc}
            strokeWidth={11}
            fill="none"
            initial={false}
            animate={{ pathLength: visual === "duplex" ? 1 : 0 }}
            transition={{ duration: 0.8, delay: i * 0.06 }}
          />
        ))}
        <Label x={200} y={315} size={12} color={C.dim}>
          rolled: light = austenite, dark = ferrite
        </Label>
        <Chip x={480} y={110} text="high strength" color={C.lithium} w={180} />
        <Chip x={480} y={155} text="excellent corrosion resistance" color={C.accent} w={230} />
        <Label x={480} y={210} size={13}>
          Cr, Mo, N alloyed
        </Label>
        <Label x={300} y={360} size={13}>
          used offshore, in chemical plants and in bridges
        </Label>
        <Chip x={300} y={405} text="two phases together: best of both" w={320} />
      </Reveal>
    </Stage>
  );
}
