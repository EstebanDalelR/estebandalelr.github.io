"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, Label, Reveal, Stage, makeScale } from "../primitives";

// Ragone plot: log10 specific energy (Wh/kg) vs log10 specific power (W/kg).
const box = { x: 90, y: 50, w: 460, h: 300 };
const sc = makeScale(box, [-2, 4], [0, 7]);

const regions = [
  { name: "Capacitors", ex: [-2, -0.6], py: [4.2, 6.8], color: C.dim },
  { name: "Supercapacitors", ex: [-0.6, 1], py: [2.8, 5.2], color: C.anion },
  { name: "Batteries", ex: [0.8, 2.6], py: [1.3, 3.6], color: C.lithium },
  { name: "Fuel cells", ex: [2.2, 3.4], py: [0.3, 2.4], color: "#93c5fd" },
];

function Ellipse({ ex, py, color, name, dim }: { ex: number[]; py: number[]; color: string; name: string; dim: boolean }) {
  const cx = (sc.sx(ex[0]) + sc.sx(ex[1])) / 2;
  const cy = (sc.sy(py[0]) + sc.sy(py[1])) / 2;
  const rx = (sc.sx(ex[1]) - sc.sx(ex[0])) / 2;
  const ry = (sc.sy(py[0]) - sc.sy(py[1])) / 2;
  return (
    <motion.g initial={false} animate={{ opacity: dim ? 0.25 : 1 }}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} opacity={0.22} stroke={color} strokeWidth={2} />
      <Label x={cx} y={cy + 5} size={14} weight={700} color={color}>
        {name}
      </Label>
    </motion.g>
  );
}

const PORES = [0, 1, 2, 3, 4, 5, 6];

export default function SupercapVisual({ visual }: { visual: string }) {
  const ragone = visual === "ragone";
  const charging = visual === "sc-charging";
  const strategies = visual === "sc-strategies";

  return (
    <Stage label="Supercapacitors">
      {/* Ragone plot */}
      <motion.g initial={false} animate={{ opacity: ragone ? 1 : 0 }} transition={{ duration: 0.5 }} style={{ pointerEvents: ragone ? "auto" : "none" }}>
        <Axes box={box} xLabel="specific energy (Wh/kg, log)" yLabel="specific power (W/kg, log)" xLabelDy={42} />
        {[-2, 0, 2].map((e) => (
          <Label key={e} x={sc.sx(e)} y={box.y + box.h + 18} size={12} color={C.dim}>
            {`10${e < 0 ? "⁻²" : e === 0 ? "⁰" : "²"}`}
          </Label>
        ))}
        {[0, 2, 4, 6].map((p) => (
          <Label key={p} x={box.x - 10} y={sc.sy(p) + 4} size={12} color={C.dim} anchor="end">
            {`10${p === 0 ? "⁰" : p === 2 ? "²" : p === 4 ? "⁴" : "⁶"}`}
          </Label>
        ))}
        {regions.map((r) => (
          <Ellipse key={r.name} {...r} dim={false} />
        ))}
        <Chip x={420} y={80} text="high power ↑   high energy →" color={C.accent} />
      </motion.g>

      {/* Charging: two porous carbon electrodes, ions pile up at the surfaces */}
      <Reveal show={charging}>
        <rect x={80} y={70} width={70} height={260} rx={6} fill={C.graphite} />
        <rect x={450} y={70} width={70} height={260} rx={6} fill={C.graphite} />
        <Label x={115} y={58} weight={700}>carbon (−)</Label>
        <Label x={485} y={58} weight={700}>carbon (+)</Label>
        {PORES.map((i) => {
          const y = 90 + i * 34;
          return (
            <g key={i}>
              <Label x={140} y={y + 5} size={14} color={C.electron} weight={800}>−</Label>
              <Label x={460} y={y + 5} size={14} color={C.hot} weight={800}>+</Label>
              <motion.circle
                r={9}
                fill={C.cation}
                initial={false}
                animate={{ cx: charging ? [270, 165] : 270, cy: y }}
                transition={{ duration: 1.2, delay: i * 0.05 }}
              />
              <motion.circle
                r={9}
                fill={C.anion}
                initial={false}
                animate={{ cx: charging ? [330, 435] : 330, cy: y + 14 }}
                transition={{ duration: 1.2, delay: i * 0.05 }}
              />
            </g>
          );
        })}
        <Chip x={300} y={362} text="no redox · charge rearranges in ~10⁻⁸ s" color={C.anion} />
        <Label x={300} y={400} size={16} weight={700}>E = ½ C V²</Label>
        <Label x={300} y={424} size={13} color={C.dim}>&gt; 10⁶ cycles · only the surface stores charge → low energy</Label>
      </Reveal>

      {/* Strategies */}
      <Reveal show={strategies}>
        <Label x={150} y={50} size={16} weight={700} color={C.accent}>1 · more capacitance</Label>
        <g transform="translate(150 150)">
          <circle r={70} fill={C.graphite} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <path
                key={i}
                d={`M${Math.cos(a) * 70} ${Math.sin(a) * 70} L${Math.cos(a + 0.12) * 30} ${Math.sin(a + 0.12) * 30}`}
                stroke="#0b1220"
                strokeWidth={6}
                strokeLinecap="round"
              />
            );
          })}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2 + 0.3;
            return <circle key={i} cx={Math.cos(a) * 52} cy={Math.sin(a) * 52} r={5} fill={C.cation} />;
          })}
        </g>
        <Label x={150} y={248} size={13}>high-surface-area porous carbon</Label>
        <Label x={150} y={268} size={13} color={C.dim}>+ pseudocapacitance:</Label>
        <Label x={150} y={286} size={13} color={C.dim}>surface groups, RuO₂, conducting polymers</Label>

        <Label x={450} y={50} size={16} weight={700} color={C.accent}>2 · higher voltage</Label>
        {(() => {
          const s = makeScale({ x: 370, y: 90, w: 160, h: 190 }, [0, 2], [0, 7.5]);
          const bars = [
            { i: 0, v: 1, e: 1, name: "aqueous ~1 V", color: "#93c5fd" },
            { i: 1, v: 2.7, e: 7.29, name: "organic 2.7 V", color: C.anion },
          ];
          return (
            <g>
              <line x1={370} y1={280} x2={540} y2={280} stroke={C.dim} />
              {bars.map((b) => (
                <g key={b.i}>
                  <motion.rect
                    x={s.sx(b.i) + 14}
                    width={52}
                    initial={false}
                    animate={{ y: strategies ? s.sy(b.e) : 280, height: strategies ? 280 - s.sy(b.e) : 0 }}
                    transition={{ duration: 0.9, delay: 0.3 + b.i * 0.2 }}
                    fill={b.color}
                    opacity={0.8}
                  />
                  <Label x={s.sx(b.i) + 40} y={300} size={12}>{b.name}</Label>
                  <Label x={s.sx(b.i) + 40} y={s.sy(b.e) - 8} size={13} weight={700}>{`E ∝ ${b.e === 1 ? "1" : "7.3"}`}</Label>
                </g>
              ))}
            </g>
          );
        })()}
        <Label x={450} y={330} size={13} color={C.dim}>energy ∝ V² → ≈7× more</Label>
        <Label x={300} y={400} size={15} weight={700}>E = ½ C V²: raise C, or raise V</Label>
      </Reveal>
    </Stage>
  );
}
