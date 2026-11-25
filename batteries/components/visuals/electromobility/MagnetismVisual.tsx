"use client";

import { motion } from "framer-motion";
import { C, Chip, DrawPath, Flow, Label, Reveal, Stage, makeScale } from "../primitives";
import { Bars, Card, Title } from "../blocks";

/* Schematic B–H loops: the two branches are shifted tanh curves, Hc sets the width. */
function loop(hc: number, bs = 1.8, a = 0.7, hmax = 3): { up: [number, number][]; down: [number, number][] } {
  const hs = Array.from({ length: 61 }, (_, i) => -hmax + (i * 2 * hmax) / 60);
  return {
    up: hs.map((h) => [h, bs * Math.tanh((h + hc) / a)]),
    down: hs.map((h) => [h, bs * Math.tanh((h - hc) / a)]),
  };
}

const bhBox = { x: 120, y: 80, w: 360, h: 260 };
const bh = makeScale(bhBox, [-3, 3], [-2.1, 2.1]);
const main = loop(0.6);
const area = bh.path([...main.down, ...[...main.up].reverse()]) + "Z";
const br = 1.8 * Math.tanh(0.6 / 0.7);

function MiniLoop({ x, hc, color, show }: { x: number; hc: number; color: string; show: boolean }) {
  const s = makeScale({ x, y: 80, w: 220, h: 150 }, [-3, 3], [-2.1, 2.1]);
  const l = loop(hc);
  return (
    <g>
      <line x1={x} y1={155} x2={x + 220} y2={155} stroke={C.grid} />
      <line x1={x + 110} y1={80} x2={x + 110} y2={230} stroke={C.grid} />
      <DrawPath d={s.path(l.up)} show={show} color={color} />
      <DrawPath d={s.path(l.down)} show={show} color={color} delay={0.3} />
    </g>
  );
}

export default function MagnetismVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Electromagnetism and magnetic materials in electric machines">
      <Reveal show={is("motor-share")}>
        <Title>Share of electricity used by electric motors (2023)</Title>
        <Bars
          show={is("motor-share")}
          y={90}
          gap={50}
          max={100}
          format={(v) => `${v} %`}
          items={[
            { label: "World", value: 53, color: C.accent, note: "13 462 TWh" },
            { label: "Agriculture", value: 87, color: C.lithium },
            { label: "Transport", value: 86, color: C.electron },
            { label: "Industry", value: 72, color: C.copper },
            { label: "Buildings", value: 36, color: C.lfp },
          ]}
        />
        <Label x={300} y={385} size={13} color={C.dim}>
          IEA estimate in 2011: about 45 % — the share keeps growing
        </Label>
      </Reveal>

      <Reveal show={is("laws")}>
        <Title>Three cause-and-effect pairs</Title>
        <Card x={20} y={75} w={180} h={200} show={is("laws")} title="Ampère" color={C.lfp} lines={["current → field", "", "coil: N·I", "ampere-turns", "iron core multiplies it"]} />
        <Card
          x={210}
          y={75}
          w={180}
          h={200}
          show={is("laws")}
          delay={0.15}
          title="Faraday"
          color={C.electron}
          lines={["changing flux → voltage", "", "e = −dΦ/dt", "back-EMF, eddy currents", "Lenz: opposes change"]}
        />
        <Card
          x={400}
          y={75}
          w={180}
          h={200}
          show={is("laws")}
          delay={0.3}
          title="Lorentz"
          color={C.hot}
          lines={["field + current → force", "", "F = B·I·L", "force × radius", "= torque on rotor"]}
        />
        <Label x={300} y={315} size={14}>
          Gauss for B: field lines never end — flux runs in closed paths
        </Label>
        <Label x={300} y={345} size={13} color={C.dim}>
          that is all of Maxwell a machine needs at its frequencies
        </Label>
      </Reveal>

      <Reveal show={is("core")}>
        <Title>The core is a magnetic circuit</Title>
        <path
          d="M140 90 H460 V330 H330 V280 H410 V140 H190 V280 H270 V330 H140 Z"
          fill={C.zinc}
          opacity={0.25}
          stroke={C.zinc}
          strokeWidth={2}
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx={165} cy={160 + i * 18} rx={36} ry={7} fill="none" stroke={C.copper} strokeWidth={3} />
        ))}
        <Label x={80} y={210} size={13} color={C.copper}>
          coil N·I
        </Label>
        <Flow path="M165 115 H435 V305 H165 Z" count={8} dur={4} color={C.accent} r={4} />
        <rect x={270} y={285} width={60} height={45} fill="#0b1220" stroke={C.hot} strokeDasharray="4 3" />
        <Label x={300} y={365} size={14} color={C.hot} weight={700}>
          air gap: μr ≈ 1
        </Label>
        <Label x={300} y={385} size={12} color={C.dim}>
          costs many ampere-turns — keep it small
        </Label>
        <Label x={300} y={215} size={14} color={C.zinc} weight={700}>
          electrical steel
        </Label>
        <Label x={300} y={235} size={13} color={C.dim}>
          μr in the thousands
        </Label>
        <Chip x={500} y={60} text="B = μ₀ μr H" />
      </Reveal>

      <Reveal show={is("bh-loop")}>
        <Title>B–H loop: saturation and hysteresis</Title>
        <motion.path d={area} fill={C.hot} initial={false} animate={{ opacity: is("bh-loop") ? 0.12 : 0 }} transition={{ delay: 1.2 }} />
        <line x1={bh.sx(-3)} y1={bh.sy(0)} x2={bh.sx(3)} y2={bh.sy(0)} stroke={C.dim} />
        <line x1={bh.sx(0)} y1={bh.sy(-2.1)} x2={bh.sx(0)} y2={bh.sy(2.1)} stroke={C.dim} />
        <Label x={bh.sx(3) + 10} y={bh.sy(0) + 5} anchor="start" size={14} color={C.dim}>
          H
        </Label>
        <Label x={bh.sx(0) + 8} y={bh.sy(2.1)} anchor="start" size={14} color={C.dim}>
          B
        </Label>
        <DrawPath d={bh.path(main.up)} show={is("bh-loop")} color={C.accent} />
        <DrawPath d={bh.path(main.down)} show={is("bh-loop")} color={C.accent} delay={0.5} />
        <line x1={bh.sx(1.3)} y1={bh.sy(1.8)} x2={bh.sx(3)} y2={bh.sy(1.8)} stroke={C.electron} strokeDasharray="5 4" />
        <Label x={bh.sx(3)} y={bh.sy(1.8) - 8} anchor="end" size={13} color={C.electron}>
          saturation ≈ 1.5–2 T
        </Label>
        <circle cx={bh.sx(0)} cy={bh.sy(br)} r={5} fill={C.lithium} />
        <Label x={bh.sx(0) - 10} y={bh.sy(br) - 6} anchor="end" size={13} color={C.lithium}>
          remanence Br
        </Label>
        <circle cx={bh.sx(-0.6)} cy={bh.sy(0)} r={5} fill={C.copper} />
        <Label x={bh.sx(-0.6) - 8} y={bh.sy(0) + 20} anchor="end" size={13} color={C.copper}>
          coercivity Hc
        </Label>
        <Label x={300} y={400} size={13} color={C.hot}>
          loop area = energy lost every cycle (hysteresis loss)
        </Label>
      </Reveal>

      <Reveal show={is("soft-hard")}>
        <Title>Soft cores, hard magnets</Title>
        <MiniLoop x={50} hc={0.12} color={C.lfp} show={is("soft-hard")} />
        <MiniLoop x={330} hc={1.3} color={C.hot} show={is("soft-hard")} />
        <Card
          x={40}
          y={250}
          w={240}
          h={170}
          show={is("soft-hard")}
          title="Soft: electrical steel"
          color={C.lfp}
          lines={["narrow loop, low coercivity", "easy to (de)magnetise", "low loss per cycle", "role: guide the flux"]}
        />
        <Card
          x={320}
          y={250}
          w={240}
          h={170}
          show={is("soft-hard")}
          delay={0.15}
          title="Hard: permanent magnets"
          color={C.hot}
          lines={["wide loop, high coercivity", "keeps its magnetisation", "NdFeB, SmCo, ferrite, AlNiCo", "role: rotor field, no current"]}
        />
      </Reveal>

      <Reveal show={is("lamination")}>
        <Title>Laminate the core against eddy currents</Title>
        <rect x={60} y={100} width={200} height={160} rx={6} fill={C.zinc} opacity={0.25} stroke={C.zinc} />
        <ellipse cx={160} cy={180} rx={70} ry={55} fill="none" stroke={C.hot} strokeWidth={3} strokeDasharray="8 5" />
        <Flow path="M230 180 A70 55 0 1 1 229.9 179" count={4} dur={2.5} color={C.hot} r={4} />
        <Label x={160} y={290} size={14} weight={700} color={C.hot}>
          solid: one big shorted turn
        </Label>
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <rect x={340 + i * 22} y={100} width={18} height={160} fill={C.zinc} opacity={0.3} stroke={C.zinc} />
            <ellipse cx={349 + i * 22} cy={180} rx={5} ry={55} fill="none" stroke={C.hot} strokeWidth={1.5} />
          </g>
        ))}
        <Label x={437} y={290} size={14} weight={700} color={C.lithium}>
          laminated: tiny loops
        </Label>
        <Label x={437} y={310} size={12} color={C.dim}>
          insulated sheets, 0.2–0.5 mm
        </Label>
        <Chip x={300} y={350} text="P_eddy ∝ f² · t²" color={C.electron} w={170} />
        <Label x={300} y={400} size={13} color={C.dim}>
          steel core · copper windings · magnets · polymer insulation + air, water or oil cooling
        </Label>
      </Reveal>
    </Stage>
  );
}
