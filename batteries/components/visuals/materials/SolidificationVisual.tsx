"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale, SvgLoop } from "../primitives";

/* ---- schematic Pb–Sn-type eutectic diagram ---- */
const eBox = { x: 70, y: 60, w: 260, h: 300 };
const e = makeScale(eBox, [0, 100], [100, 350]);
const TE = 183;
const liqL = e.path([[0, 327], [61.9, TE]]);
const liqR = e.path([[100, 232], [61.9, TE]]);
const solL = e.path([[0, 327], [18.3, TE]]);
const solR = e.path([[100, 232], [97.8, TE]]);
const solvL = e.path([[18.3, TE], [2, 100]]);
const solvR = e.path([[97.8, TE], [99, 100]]);
const eutLine = e.path([[18.3, TE], [97.8, TE]]);
const X0 = 40;

const WALK = [
  { text: "1 · melt only", color: C.hot },
  { text: "2 · liquidus: primary α forms", color: C.lfp },
  { text: "3 · melt follows the liquidus,", color: C.ink },
  { text: "     α follows the solidus", color: C.ink },
  { text: "4 · 183 °C eutectic: L → α + β", color: C.electron },
  { text: "     3 phases, f = 0", color: C.electron },
  { text: "5 · solid α + β cools", color: C.accent },
];

/* ---- schematic peritectic diagram ---- */
const pBox = { x: 70, y: 70, w: 250, h: 280 };
const p = makeScale(pBox, [0, 100], [300, 1100]);
const TP = 700;
const X1 = 30;

function Lamellae({ x, y, w, h, angle, n }: { x: number; y: number; w: number; h: number; angle: number; n: number }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g>
      <clipPath id={`lam-${x}-${y}`}>
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      <g clipPath={`url(#lam-${x}-${y})`}>
        <g transform={`rotate(${angle} ${cx} ${cy})`}>
          {Array.from({ length: n }, (_, i) => (
            <rect key={i} x={cx - w} y={cy - h * 1.2 + (i * h * 2.4) / n} width={w * 2} height={(h * 2.4) / n / 2} fill={i % 2 ? C.lfp : C.electron} opacity={0.8} />
          ))}
        </g>
      </g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.dim} />
    </g>
  );
}

type Grain = { cx: number; cy: number; r: number };

const HYPO: Grain[] = [
  { cx: 0.2, cy: 0.25, r: 0.17 },
  { cx: 0.62, cy: 0.2, r: 0.18 },
  { cx: 0.42, cy: 0.62, r: 0.19 },
  { cx: 0.85, cy: 0.58, r: 0.16 },
  { cx: 0.15, cy: 0.85, r: 0.14 },
  { cx: 0.75, cy: 0.9, r: 0.13 },
];

/** Primary grains in a eutectic matrix. With `animated`, grains grow in the melt, then the melt freezes as lamellae. */
function Primary({
  box,
  grains,
  color,
  id,
  animated,
}: {
  box: { x: number; y: number; w: number; h: number };
  grains: Grain[];
  color: string;
  id: string;
  animated: boolean;
}) {
  const dur = 8;
  return (
    <g>
      <defs>
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <rect width="8" height="4" fill={C.electron} opacity={0.85} />
          <rect y="4" width="8" height="4" fill={C.lfp} opacity={0.85} />
        </pattern>
        <clipPath id={`${id}-clip`}>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={C.hot} opacity={0.2} />
        <motion.rect
          x={box.x}
          y={box.y}
          width={box.w}
          height={box.h}
          fill={`url(#${id})`}
          initial={false}
          animate={animated ? { opacity: [0, 0, 1, 1] } : { opacity: 1 }}
          transition={animated ? { duration: dur, times: [0, 0.55, 0.75, 1], repeat: Infinity } : { duration: 0 }}
        />
        {grains.map((g, i) => {
          const r = g.r * box.w;
          return (
            <motion.circle
              key={i}
              cx={box.x + g.cx * box.w}
              cy={box.y + g.cy * box.h}
              fill={color}
              stroke="#0b1220"
              strokeWidth={1.5}
              initial={false}
              animate={animated ? { r: [4, r, r, r] } : { r }}
              transition={animated ? { duration: dur, times: [0, 0.5, 0.75, 1], repeat: Infinity } : { duration: 0 }}
            />
          );
        })}
      </g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="none" stroke={C.dim} />
    </g>
  );
}

export default function SolidificationVisual({ visual }: { visual: string }) {
  const eut = visual === "eutectic-walk";
  const three = visual === "hypo-hyper";
  return (
    <Stage label="Solidification">
      {/* eutectic walk */}
      <Reveal show={eut}>
        <Axes box={eBox} xLabel="wt % B →" yLabel="T (°C)" />
        {[TE, 232, 327].map((t) => (
          <Label key={t} x={eBox.x - 8} y={e.sy(t) + 4} anchor="end" size={12} color={C.dim}>
            {t}
          </Label>
        ))}
        {[liqL, liqR].map((d) => (
          <DrawPath key={d} d={d} show={eut} color={C.hot} width={3} />
        ))}
        {[solL, solR, solvL, solvR].map((d) => (
          <DrawPath key={d} d={d} show={eut} color={C.lfp} width={2.5} delay={0.3} />
        ))}
        <DrawPath d={eutLine} show={eut} color={C.electron} width={3} delay={0.5} />
        <Label x={e.sx(50)} y={e.sy(300)} size={14} weight={700} color={C.hot}>
          L
        </Label>
        <Label x={e.sx(24)} y={e.sy(236)} size={12}>
          L + α
        </Label>
        <Label x={e.sx(88)} y={e.sy(192)} size={12}>
          L + β
        </Label>
        <Label x={e.sx(4)} y={e.sy(160)} size={13} weight={700} color={C.lfp}>
          α
        </Label>
        <Label x={e.sx(100) + 8} y={e.sy(160)} anchor="start" size={13} weight={700} color={C.lfp}>
          β
        </Label>
        <Label x={e.sx(55)} y={e.sy(140)} size={13}>
          α + β
        </Label>
        <Label x={e.sx(61.9)} y={e.sy(TE) + 18} size={12} color={C.electron}>
          eutectic
        </Label>
        {/* alloy line, tie line and moving temperature marker */}
        <line x1={e.sx(X0)} x2={e.sx(X0)} y1={e.sy(340)} y2={e.sy(110)} stroke={C.dim} strokeDasharray="4 4" />
        <line x1={e.sx(14.9)} x2={e.sx(50.3)} y1={e.sy(210)} y2={e.sy(210)} stroke={C.ink} strokeWidth={1.5} />
        <circle cx={e.sx(14.9)} cy={e.sy(210)} r={4} fill={C.lfp} />
        <circle cx={e.sx(50.3)} cy={e.sy(210)} r={4} fill={C.hot} />
        <circle cx={e.sx(X0)} cy={e.sy(330)} r={7} fill={C.accent}>
          <SvgLoop
            attr="cy"
            values={[e.sy(330), e.sy(234), e.sy(TE), e.sy(TE), e.sy(120)]}
            keyTimes={[0, 0.3, 0.55, 0.75, 1]}
            dur={7}
            active={eut}
          />
        </circle>
        {WALK.map((w, i) => (
          <motion.g key={w.text} initial={false} animate={{ opacity: eut ? 1 : 0 }} transition={{ delay: eut ? 0.3 + i * 0.25 : 0 }}>
            <Label x={362} y={110 + i * 30} anchor="start" size={13} color={w.color}>
              {w.text}
            </Label>
          </motion.g>
        ))}
        <Chip x={300} y={425} text="tie line: phase compositions · lever rule: amounts" w={380} />
      </Reveal>

      {/* lamellar eutectic */}
      <Reveal show={visual === "lamellae"}>
        <Label x={300} y={45} size={15} weight={700}>
          Eutectic microstructure: lamellae
        </Label>
        <Lamellae x={60} y={75} w={150} h={140} angle={20} n={14} />
        <Lamellae x={210} y={75} w={140} h={140} angle={-35} n={14} />
        <Lamellae x={60} y={215} w={170} h={130} angle={70} n={14} />
        <Lamellae x={230} y={215} w={120} h={130} angle={5} n={12} />
        <rect x={378} y={95} width={16} height={16} fill={C.electron} />
        <Label x={402} y={108} anchor="start" size={13}>
          α
        </Label>
        <rect x={440} y={95} width={16} height={16} fill={C.lfp} />
        <Label x={464} y={108} anchor="start" size={13}>
          β
        </Label>
        <Label x={378} y={160} anchor="start" size={13}>
          L → α + β side by side:
        </Label>
        <Label x={378} y={180} anchor="start" size={13}>
          short diffusion distances
        </Label>
        <Label x={378} y={230} anchor="start" size={13} color={C.electron}>
          faster growth → finer lamellae
        </Label>
        <Label x={378} y={250} anchor="start" size={13} color={C.electron}>
          λ² R = constant
        </Label>
        <Chip x={300} y={400} text="only lamellae, no primary crystals → eutectic composition" color={C.accent} w={440} />
      </Reveal>

      {/* hypo / eutectic / hypereutectic compositions */}
      <Reveal show={three}>
        <Axes box={eBox} xLabel="wt % B →" yLabel="T (°C)" />
        {[liqL, liqR].map((d) => (
          <DrawPath key={d} d={d} show={three} color={C.hot} width={3} />
        ))}
        {[solL, solR, solvL, solvR].map((d) => (
          <DrawPath key={d} d={d} show={three} color={C.lfp} width={2.5} delay={0.3} />
        ))}
        <DrawPath d={eutLine} show={three} color={C.electron} width={3} delay={0.5} />
        {[
          { x: 40, c: C.lfp, t: "hypo", d: 0.8 },
          { x: 61.9, c: C.electron, t: "eutectic", d: 1.1 },
          { x: 85, c: C.anion, t: "hyper", d: 1.4 },
        ].map((a) => (
          <g key={a.t}>
            <DrawPath d={e.path([[a.x, 345], [a.x, 110]])} show={three} color={a.c} width={2.5} dash="5 4" delay={a.d} />
            <Label x={e.sx(a.x)} y={e.sy(345) - 8} size={12} weight={700} color={a.c}>
              {a.t}
            </Label>
          </g>
        ))}
        <Label x={e.sx(61.9)} y={e.sy(TE) + 18} size={12} color={C.electron}>
          E
        </Label>
        <Label x={362} y={120} anchor="start" size={13} weight={700} color={C.lfp}>
          hypoeutectic: left of E
        </Label>
        <Label x={362} y={142} anchor="start" size={13} color={C.dim}>
          primary α, then eutectic
        </Label>
        <Label x={362} y={190} anchor="start" size={13} weight={700} color={C.electron}>
          eutectic: at E
        </Label>
        <Label x={362} y={212} anchor="start" size={13} color={C.dim}>
          all melt → α + β at 183 °C
        </Label>
        <Label x={362} y={260} anchor="start" size={13} weight={700} color={C.anion}>
          hypereutectic: right of E
        </Label>
        <Label x={362} y={282} anchor="start" size={13} color={C.dim}>
          primary β, then eutectic
        </Label>
        <Chip x={300} y={425} text="vertical line = cooling path · microstructure depends on where it sits" w={470} />
      </Reveal>

      {/* hypoeutectic microstructure forming */}
      <Reveal show={visual === "hypo-micro"}>
        <Label x={300} y={40} size={15} weight={700}>
          Hypoeutectic: primary α, eutectic in between
        </Label>
        <Primary box={{ x: 40, y: 65, w: 270, h: 270 }} grains={HYPO} color={C.lfp} id="hypo-eut" animated={visual === "hypo-micro"} />
        <Label x={175} y={355} size={12} color={C.dim}>
          melt → α grows → leftover melt freezes
        </Label>
        {[
          { t: "1 · α grains grow in the melt", c: C.lfp },
          { t: "2 · melt gets richer in B", c: C.hot },
          { t: "3 · at E it reaches 61.9 wt%", c: C.hot },
          { t: "4 · it freezes as α + β lamellae", c: C.electron },
          { t: "     at the grain interfaces", c: C.electron },
        ].map((w, i) => (
          <Label key={w.t} x={335} y={110 + i * 28} anchor="start" size={13} color={w.c}>
            {w.t}
          </Label>
        ))}
        <rect x={335} y={270} width={14} height={14} fill={C.lfp} />
        <Label x={357} y={282} anchor="start" size={12}>
          primary α
        </Label>
        <rect x={335} y={294} width={14} height={14} fill={C.electron} />
        <Label x={357} y={306} anchor="start" size={12}>
          eutectic (α + β lamellae)
        </Label>
        <Chip x={300} y={405} text="hypoeutectic = primary α grains + eutectic in the spaces between" color={C.lfp} w={500} />
      </Reveal>

      {/* three microstructures + lever rule */}
      <Reveal show={visual === "hyper-micro"}>
        <Label x={300} y={38} size={15} weight={700}>
          Three alloys, three microstructures
        </Label>
        <Primary box={{ x: 25, y: 60, w: 165, h: 165 }} grains={HYPO} color={C.lfp} id="m-hypo" animated={false} />
        <Lamellae x={218} y={60} w={165} h={165} angle={25} n={16} />
        <Primary box={{ x: 410, y: 60, w: 165, h: 165 }} grains={HYPO.map((g) => ({ ...g, cx: 1 - g.cx }))} color={C.anion} id="m-hyper" animated={false} />
        <Label x={107} y={246} size={13} weight={700} color={C.lfp}>
          hypoeutectic
        </Label>
        <Label x={107} y={264} size={12} color={C.dim}>
          primary α + eutectic
        </Label>
        <Label x={300} y={246} size={13} weight={700} color={C.electron}>
          eutectic
        </Label>
        <Label x={300} y={264} size={12} color={C.dim}>
          colonies, no primary phase
        </Label>
        <Label x={492} y={246} size={13} weight={700} color={C.anion}>
          hypereutectic
        </Label>
        <Label x={492} y={264} size={12} color={C.dim}>
          primary β + eutectic
        </Label>
        <Label x={300} y={305} size={13} weight={700}>
          Lever rule at T_E⁺ (Pb–40Sn)
        </Label>
        <Label x={300} y={328} size={13}>
          primary α = (61.9 − 40) / (61.9 − 18.3) ≈ 50%
        </Label>
        <Label x={300} y={350} size={13}>
          eutectic melt = (40 − 18.3) / (61.9 − 18.3) ≈ 50%
        </Label>
        <Chip x={300} y={402} text="the melt left at T_E⁺ becomes eutectic: its share is the lever arm" color={C.accent} w={470} />
      </Reveal>

      {/* peritectic walk */}
      <Reveal show={visual === "peritectic-walk"}>
        <Axes box={pBox} xLabel="wt % B →" yLabel="T" />
        <DrawPath d={p.path([[0, 1050], [60, TP], [100, 500]])} show={visual === "peritectic-walk"} color={C.hot} width={3} />
        <DrawPath d={p.path([[0, 1050], [20, TP]])} show={visual === "peritectic-walk"} color={C.lfp} width={2.5} delay={0.3} />
        <DrawPath d={p.path([[20, TP], [15, 320]])} show={visual === "peritectic-walk"} color={C.lfp} width={2} delay={0.4} />
        <DrawPath d={p.path([[40, TP], [40, 320]])} show={visual === "peritectic-walk"} color={C.anion} width={2.5} delay={0.4} />
        <DrawPath d={p.path([[20, TP], [60, TP]])} show={visual === "peritectic-walk"} color={C.electron} width={3} delay={0.5} />
        <Label x={p.sx(55)} y={p.sy(950)} size={14} weight={700} color={C.hot}>
          L
        </Label>
        <Label x={p.sx(22)} y={p.sy(820)} size={12}>
          L + α
        </Label>
        <Label x={p.sx(7)} y={p.sy(520)} size={13} weight={700} color={C.lfp}>
          α
        </Label>
        <Label x={p.sx(29)} y={p.sy(520)} size={12}>
          α + β
        </Label>
        <Label x={p.sx(40) + 8} y={p.sy(330) - 6} anchor="start" size={13} weight={700} color={C.anion}>
          β
        </Label>
        <Label x={p.sx(70)} y={p.sy(520)} size={12}>
          β + L
        </Label>
        <Label x={p.sx(30)} y={p.sy(630)} size={12} color={C.electron}>
          peritectic line ↑
        </Label>
        <line x1={p.sx(X1)} x2={p.sx(X1)} y1={p.sy(1080)} y2={p.sy(330)} stroke={C.dim} strokeDasharray="4 4" />
        <circle cx={p.sx(X1)} cy={p.sy(TP)} r={6} fill={C.accent} />

        {/* primary α with a β shell growing into the melt */}
        <rect x={360} y={80} width={220} height={200} rx={12} fill={C.hot} opacity={0.12} />
        <Label x={570} y={100} anchor="end" size={12} color={C.hot}>
          melt
        </Label>
        <motion.circle cx={470} cy={180} fill={C.anion} opacity={0.8} initial={false} animate={{ r: visual === "peritectic-walk" ? [52, 72, 72] : 52 }} transition={{ duration: 4, repeat: Infinity }} />
        <motion.circle cx={470} cy={180} fill={C.lfp} initial={false} animate={{ r: visual === "peritectic-walk" ? [52, 38, 38] : 52 }} transition={{ duration: 4, repeat: Infinity }} />
        <Label x={470} y={185} size={13} weight={700} color="#0b1220">
          α
        </Label>
        <Label x={470} y={300} size={13} color={C.anion} weight={700}>
          β shell grows between α and L
        </Label>
        <Chip x={470} y={340} text="L + α → β" color={C.electron} w={140} />
        <Label x={470} y={378} size={12} color={C.dim}>
          when the melt is used up: α + β cool
        </Label>
      </Reveal>

      {/* coring */}
      <Reveal show={visual === "coring"}>
        <Label x={300} y={45} size={15} weight={700}>
          Coring: a grain like an onion
        </Label>
        {[95, 78, 60, 42, 24].map((r, i) => (
          <circle key={r} cx={160} cy={190} r={r} fill={C.lfp} opacity={0.25 + i * 0.15} stroke={C.lfp} strokeOpacity={0.6} />
        ))}
        <line x1={65} x2={255} y1={190} y2={190} stroke={C.electron} strokeDasharray="4 4" />
        <Label x={160} y={310} size={12} color={C.dim}>
          centre formed first, shells later
        </Label>
        <Axes box={{ x: 340, y: 100, w: 220, h: 170 }} xLabel="across the grain" yLabel="high-Tm element" />
        <DrawPath
          d={makeScale({ x: 340, y: 100, w: 220, h: 170 }, [-1, 1], [0, 1]).path(
            Array.from({ length: 41 }, (_, i) => {
              const u = -1 + i / 20;
              return [u, 0.9 - 0.65 * u * u] as [number, number];
            })
          )}
          show={visual === "coring"}
          color={C.electron}
          width={3}
        />
        <Label x={450} y={320} size={12} color={C.dim}>
          equilibrium would be flat
        </Label>
        <Label x={300} y={360} size={13}>
          peritectic: β forms as a shell, atoms must diffuse through solid β
        </Label>
        <Chip x={300} y={400} text="solid diffusion too slow → the eutectic alloy is closer to equilibrium" color={C.hot} w={500} />
      </Reveal>

      {/* dendrites */}
      <Reveal show={visual === "dendrites"}>
        <Label x={160} y={45} size={15} weight={700}>
          Constitutional undercooling
        </Label>
        {(() => {
          const b = { x: 70, y: 80, w: 220, h: 230 };
          const s = makeScale(b, [0, 1], [0, 1]);
          const liq = Array.from({ length: 41 }, (_, i) => [i / 40, 0.25 + 0.6 * (1 - Math.exp((-i / 40) * 6))] as [number, number]);
          const real = [[0, 0.25], [1, 0.62]] as [number, number][];
          const area = s.path(liq) + real.slice().reverse().map(([a, c]) => `L${s.sx(a).toFixed(1)},${s.sy(c).toFixed(1)}`).join("");
          return (
            <g>
              <path d={`${area}Z`} fill={C.hot} opacity={0.18} />
              <Axes box={b} xLabel="distance ahead of front" yLabel="T" />
              <DrawPath d={s.path(liq)} show={visual === "dendrites"} color={C.electron} width={3} />
              <DrawPath d={s.path(real)} show={visual === "dendrites"} color={C.accent} width={2.5} dash="6 5" delay={0.3} />
              <Label x={s.sx(0.95)} y={s.sy(0.97)} anchor="end" size={12} color={C.electron}>
                liquidus T (solute pile-up)
              </Label>
              <Label x={s.sx(1)} y={s.sy(0.42)} anchor="end" size={12} color={C.accent}>
                actual T
              </Label>
              <Label x={s.sx(0.28)} y={s.sy(0.47)} size={12} color={C.hot} weight={700}>
                undercooled
              </Label>
            </g>
          );
        })()}
        <line x1={320} x2={320} y1={60} y2={390} stroke={C.grid} strokeWidth={2} />
        <Label x={455} y={45} size={15} weight={700}>
          A bump runs ahead
        </Label>
        <rect x={340} y={330} width={230} height={50} fill={C.lfp} opacity={0.7} />
        <Label x={455} y={360} size={12} color="#0b1220" weight={700}>
          solid
        </Label>
        <DrawPath
          d="M455 330 L455 110 M455 290 L420 260 M455 290 L490 260 M455 240 L425 205 M455 240 L485 205 M455 190 L430 160 M455 190 L480 160 M420 260 L405 250 M490 260 L505 250"
          show={visual === "dendrites"}
          color={C.lfp}
          width={6}
          dur={2.4}
          delay={0.4}
        />
        <Label x={540} y={120} size={12} color={C.hot}>
          melt
        </Label>
        <Chip x={300} y={420} text="any bump reaches colder melt, grows faster → dendrite (tree)" color={C.lfp} w={440} />
      </Reveal>
    </Stage>
  );
}
