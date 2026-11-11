"use client";

import { motion } from "framer-motion";
import { C, Chip, Label, Reveal, Stage, SvgLoop } from "../primitives";
import { Table, Title } from "../blocks";

function Node({ x, y, w, t, c, sub }: { x: number; y: number; w: number; t: string; c: string; sub?: string[] }) {
  const h = sub ? 36 + sub.length * 15 : 38;
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={h} rx={10} fill="#111a2c" stroke={c} strokeWidth={2} />
      <Label x={x} y={y + 24} size={14} weight={700} color={c}>
        {t}
      </Label>
      {sub?.map((s, i) => (
        <Label key={s} x={x} y={y + 42 + i * 15} size={11} color={C.dim}>
          {s}
        </Label>
      ))}
    </g>
  );
}

function Car({ x, y, color = C.lfp }: { x: number; y: number; color?: string }) {
  return (
    <g>
      <path d={`M${x} ${y} l 10 -22 h 60 l 14 22 h 16 v 18 h -110 z`} fill={color} opacity={0.85} />
      <circle cx={x + 18} cy={y + 20} r={9} fill="#0b1220" stroke={C.dim} strokeWidth={2} />
      <circle cx={x + 80} cy={y + 20} r={9} fill="#0b1220" stroke={C.dim} strokeWidth={2} />
    </g>
  );
}

function Coil({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={2.5}>
      {[0, 1, 2].map((k) => (
        <ellipse key={k} cx={x} cy={y} rx={46 - k * 12} ry={7 - k * 2} />
      ))}
    </g>
  );
}

export default function TechVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Charging technologies">
      <Reveal show={is("tree")}>
        <Title>Charging technology</Title>
        <Node x={300} y={66} w={200} t="how energy gets in" c={C.accent} />
        {[
          { x: 110, t: "Static", c: C.lfp, sub: ["while parked"] },
          { x: 300, t: "Dynamic", c: C.electron, sub: ["while driving"] },
          { x: 490, t: "Battery swapping", c: C.hot, sub: ["exchange the pack"] },
        ].map((n, i) => (
          <motion.g key={n.t} initial={false} animate={{ opacity: is("tree") ? 1 : 0 }} transition={{ delay: is("tree") ? 0.2 + i * 0.15 : 0 }}>
            <line x1={300} y1={104} x2={n.x} y2={150} stroke={n.c} strokeWidth={2} />
            <Node x={n.x} y={150} w={160} t={n.t} c={n.c} sub={n.sub} />
          </motion.g>
        ))}
        {[
          { x: 60, p: 110, t: "Conductive", sub: ["AC level 1 & 2", "DC"], c: C.lfp },
          { x: 170, p: 110, t: "Wireless", sub: ["inductive", "capacitive"], c: C.lfp },
          { x: 300, p: 300, t: "Electric road", sub: ["inductive ERS", "conductive: rail", "or overhead"], c: C.electron },
        ].map((n, i) => (
          <motion.g key={n.t} initial={false} animate={{ opacity: is("tree") ? 1 : 0 }} transition={{ delay: is("tree") ? 0.7 + i * 0.15 : 0 }}>
            <line x1={n.p} y1={201} x2={n.x} y2={260} stroke={n.c} strokeWidth={1.5} />
            <Node x={n.x} y={260} w={n.x === 300 ? 150 : 104} t={n.t} c={n.c} sub={n.sub} />
          </motion.g>
        ))}
      </Reveal>

      <Reveal show={is("wireless")}>
        <Title>Wireless charging</Title>
        <Label x={150} y={84} size={15} weight={700} color={C.lfp}>
          Inductive
        </Label>
        <Car x={95} y={180} />
        <Coil x={150} y={214} color={C.lfp} />
        <Coil x={150} y={262} color={C.electron} />
        <rect x={60} y={268} width={180} height={14} fill={C.grid} />
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M${120 + k * 30} 250 L${120 + k * 30} 224`} stroke={C.accent} strokeWidth={2} strokeDasharray="3 3">
            <SvgLoop attr="stroke-dashoffset" values={[0, -12]} dur={0.6} active={is("wireless")} />
          </path>
        ))}
        <Label x={150} y={310} size={13}>
          magnetic field between coils
        </Label>
        <Label x={150} y={328} size={13} color={C.dim}>
          most common · ≈ 85–90 % efficient
        </Label>
        <Label x={150} y={346} size={13} color={C.dim}>
          parked or dynamic (in-road)
        </Label>

        <Label x={450} y={84} size={15} weight={700} color={C.anion}>
          Capacitive
        </Label>
        <Car x={395} y={180} color={C.anion} />
        <rect x={405} y={206} width={90} height={6} fill={C.anion} />
        <rect x={405} y={256} width={90} height={6} fill={C.electron} />
        {[0, 1, 2, 3].map((k) => (
          <line key={k} x1={415 + k * 24} y1={214} x2={415 + k * 24} y2={254} stroke={C.anion} strokeWidth={1.5} opacity={0.6} />
        ))}
        <rect x={360} y={268} width={180} height={14} fill={C.grid} />
        <Label x={450} y={310} size={13}>
          electric field between plates
        </Label>
        <Label x={450} y={328} size={13} color={C.dim}>
          still experimental
        </Label>
        <Label x={450} y={346} size={13} color={C.dim}>
          potentially lightweight
        </Label>
        <Chip x={300} y={400} text="SAE J2954 standardises wireless power classes WPT1–WPT4" w={440} color={C.accent} />
      </Reveal>

      <Reveal show={is("ers")}>
        <Title>Electric road systems in Sweden</Title>
        <rect x={30} y={250} width={540} height={40} fill={C.grid} />
        <line x1={30} y1={270} x2={570} y2={270} stroke={C.dim} strokeDasharray="14 10" />
        <line x1={30} y1={150} x2={570} y2={150} stroke={C.electron} strokeWidth={2} />
        <line x1={30} y1={162} x2={570} y2={162} stroke={C.electron} strokeWidth={2} />
        <g>
          <SvgLoop attr="translate" values={["-140 0", "540 0"]} dur={7} active={is("ers")} />
          <rect x={20} y={200} width={100} height={50} rx={6} fill={C.lfp} />
          <line x1={50} y1={200} x2={60} y2={162} stroke={C.ink} strokeWidth={2} />
          <line x1={90} y1={200} x2={80} y2={150} stroke={C.ink} strokeWidth={2} />
        </g>
        <Label x={300} y={130} size={13} color={C.electron}>
          overhead catenary · Sandviken
        </Label>
        <rect x={30} y={266} width={540} height={8} fill={C.copper} opacity={0.6} />
        <Label x={300} y={312} size={13} color={C.copper}>
          conductive rail · Arlanda, Lund — inductive coils · Visby
        </Label>
        <rect x={60} y={340} width={480} height={80} rx={14} fill="#0b1220" stroke={C.hot} />
        <Label x={300} y={366} size={15} weight={700} color={C.hot}>
          E20 Hallsberg–Örebro: first permanent ERS
        </Label>
        <Label x={300} y={388} size={13}>
          removed from the national plan in 2025 (cost)
        </Label>
        <Label x={300} y={406} size={12} color={C.dim}>
          promising, but expensive to build at scale
        </Label>
      </Reveal>

      <Reveal show={is("swap")}>
        <Title>Battery swapping</Title>
        <rect x={150} y={90} width={300} height={190} rx={14} fill="#111a2c" stroke={C.dim} />
        <Label x={300} y={112} size={13} color={C.dim}>
          swap station
        </Label>
        <Car x={245} y={190} />
        <rect x={258} y={212} width={84} height={10} rx={3} fill={C.hot}>
          <SvgLoop attr="y" values={[212, 212, 262, 262, 212]} keyTimes={[0, 0.2, 0.45, 0.55, 1]} dur={4} active={is("swap")} />
          <SvgLoop attr="fill" values={[C.hot, C.hot, C.hot, C.lithium, C.lithium]} keyTimes={[0, 0.2, 0.45, 0.55, 1]} dur={4} active={is("swap")} />
        </rect>
        <Label x={300} y={300} size={13} color={C.dim}>
          empty pack out · full pack in
        </Label>
        {[
          ["3–5 min", "per swap", C.accent],
          ["fleets, taxis", "best fit", C.lfp],
          ["standard packs", "required", C.hot],
        ].map(([t, s, c], i) => (
          <g key={t}>
            <Label x={110 + i * 190} y={355} size={16} weight={800} color={c}>
              {t}
            </Label>
            <Label x={110 + i * 190} y={375} size={12} color={C.dim}>
              {s}
            </Label>
          </g>
        ))}
        <Label x={300} y={420} size={12} color={C.dim}>
          e.g. Nio ES8 stations; Mitsubishi Fuso with Ample for trucks
        </Label>
      </Reveal>

      <Reveal show={is("compare")}>
        <Title>Side by side</Title>
        <Table
          x={15}
          y={70}
          cols={[110, 115, 115, 105, 125]}
          show={is("compare")}
          size={12}
          rowH={52}
          rows={[
            ["", "Static", "Dynamic", "Wireless", "Swapping"],
            ["Speed", "medium", "continuous", "slow", "very fast"],
            ["Convenience", "plug in", "hands-free", "hands-free", "hands-free"],
            ["Cost", "low at home", "very high", "high", "high"],
            ["Scales to", "home, public", "long-haul", "urban fleets", "fleets, taxis"],
          ]}
        />
        <Chip x={300} y={370} text="which will dominate in ten years, and why?" w={360} color={C.electron} />
      </Reveal>
    </Stage>
  );
}
