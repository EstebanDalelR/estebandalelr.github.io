"use client";

import { motion } from "framer-motion";
import { C, Chip, Label, Reveal, Stage } from "../primitives";
import { Card, Title } from "../blocks";
import { Atom, Backbone, Bond, zigzag } from "./mol";

const A = C.lfp;
const B = C.electron;

function Beads({ seq, x, y, step = 24 }: { seq: string; x: number; y: number; step?: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + (seq.length - 1) * step} y2={y} stroke={C.dim} strokeWidth={2} />
      {seq.split("").map((s, i) => (
        <circle key={i} cx={x + i * step} cy={y} r={9} fill={s === "A" ? A : B} stroke="#0b1220" strokeWidth={1.5} />
      ))}
    </g>
  );
}

/** Network: a few chains with crosslink rungs. */
function Network({ x, y, density, color }: { x: number; y: number; density: number; color: string }) {
  const rows = [0, 40, 80];
  return (
    <g>
      {rows.map((dy) => (
        <path key={dy} d={`M${x} ${y + dy} q 20 -10 40 0 t 40 0 t 40 0 t 40 0`} fill="none" stroke={C.dim} strokeWidth={3} />
      ))}
      {Array.from({ length: density }, (_, i) => {
        const cx = x + 20 + (i * 120) / Math.max(density - 1, 1);
        const r = i % 2;
        return <line key={i} x1={cx} y1={y + r * 40 + 4} x2={cx} y2={y + r * 40 + 36} stroke={color} strokeWidth={4} />;
      })}
    </g>
  );
}

export default function BasicsVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  const pe = zigzag(12, 120, 300, 34, 12);
  return (
    <Stage label="Polymer basics">
      <Reveal show={is("definition")}>
        <Title>Polymer vs macromolecule (IUPAC)</Title>
        <Card
          x={30}
          y={75}
          w={260}
          h={150}
          show={is("definition")}
          title="Polymer"
          color={C.accent}
          lines={["a substance", "composed of macromolecules"]}
          size={14}
        />
        <Card
          x={310}
          y={75}
          w={260}
          h={150}
          show={is("definition")}
          delay={0.2}
          title="Macromolecule"
          color={C.electron}
          lines={["high relative molecular mass,", "multiple repetition of units", "derived from small molecules"]}
          size={14}
        />
        <Label x={300} y={270} size={15} weight={700}>
          Example: cellulose, a polysaccharide (polyacetal)
        </Label>
        {Array.from({ length: 6 }, (_, i) => {
          const x = 70 + i * 82;
          return (
            <g key={i}>
              <polygon
                points={[0, 1, 2, 3, 4, 5].map((k) => `${x + 26 * Math.cos((k * Math.PI) / 3)},${330 + 22 * Math.sin((k * Math.PI) / 3)}`).join(" ")}
                fill="#111a2c"
                stroke={C.lithium}
                strokeWidth={2.5}
              />
              {i < 5 && <line x1={x + 26} y1={330} x2={x + 56} y2={330} stroke={C.hot} strokeWidth={3} />}
              {i < 5 && <circle cx={x + 41} cy={330} r={5} fill={C.hot} />}
            </g>
          );
        })}
        <Label x={300} y={385} size={13} color={C.dim}>
          D-glucose rings joined by acetal (C–O–C) links
        </Label>
      </Reveal>

      <Reveal show={is("repeat")}>
        <Title>Monomer ≠ repeating unit</Title>
        <Bond x1={110} y1={130} x2={170} y2={130} order={2} color={C.electron} />
        {[
          [80, 105],
          [80, 155],
          [200, 105],
          [200, 155],
        ].map(([x, y], i) => (
          <g key={i}>
            <Bond x1={x < 140 ? 110 : 170} y1={130} x2={x} y2={y} />
            <Atom x={x} y={y} el="H" />
          </g>
        ))}
        <Atom x={110} y={130} el="C" />
        <Atom x={170} y={130} el="C" />
        <Label x={140} y={200} size={14} weight={700}>
          ethylene CH₂=CH₂ (monomer)
        </Label>
        <line x1={250} y1={130} x2={340} y2={130} stroke={C.ink} strokeWidth={2} markerEnd="url(#arrow)" />
        <Label x={295} y={118} size={12} color={C.dim}>
          polymerise
        </Label>
        <Label x={460} y={125} size={22} weight={700}>
          –[CH₂–CH₂]ₙ–
        </Label>
        <Label x={460} y={155} size={13} color={C.dim}>
          double bond is gone
        </Label>
        <Backbone pts={pe} />
        {pe.map(([x, y], i) => (
          <Atom key={i} x={x} y={y} el="C" r={11} />
        ))}
        <motion.rect
          x={pe[4][0] - 17}
          y={270}
          width={34 + 17 * 2 - 0}
          height={60}
          rx={10}
          fill="none"
          stroke={C.electron}
          strokeWidth={2}
          strokeDasharray="5 4"
          initial={false}
          animate={{ opacity: is("repeat") ? 1 : 0 }}
          transition={{ delay: 0.5 }}
        />
        <motion.rect
          x={pe[8][0] - 17}
          y={270}
          width={34}
          height={60}
          rx={10}
          fill="none"
          stroke={C.accent}
          strokeWidth={2.5}
          initial={false}
          animate={{ opacity: is("repeat") ? 1 : 0 }}
          transition={{ delay: 1 }}
        />
        <Label x={pe[4][0] + 17} y={355} size={13} color={C.electron}>
          CH₂–CH₂ (from one monomer)
        </Label>
        <Label x={pe[8][0]} y={385} size={13} color={C.accent}>
          CH₂: smallest repeating unit
        </Label>
      </Reveal>

      <Reveal show={is("architectures")}>
        <Title>Architectures and copolymers</Title>
        <g>
          <path d="M30 110 q 20 -12 40 0 t 40 0 t 40 0" fill="none" stroke={C.accent} strokeWidth={4} />
          <Label x={90} y={150} size={13}>
            linear
          </Label>
          <path d="M170 110 q 20 -12 40 0 t 40 0 t 40 0 M210 108 l -10 -30 M250 110 l 12 28 M230 112 l 4 -26" fill="none" stroke={C.accent} strokeWidth={4} />
          <Label x={230} y={150} size={13}>
            branched
          </Label>
          {[0, 1, 2, 3, 4].map((k) => {
            const a = (k * 2 * Math.PI) / 5 - Math.PI / 2;
            return <line key={k} x1={345} y1={105} x2={345 + 38 * Math.cos(a)} y2={105 + 38 * Math.sin(a)} stroke={C.accent} strokeWidth={4} />;
          })}
          <Label x={345} y={160} size={13}>
            star
          </Label>
          <Network x={410} y={75} density={4} color={C.accent} />
          <Label x={490} y={175} size={13}>
            network
          </Label>
        </g>
        <Label x={300} y={210} size={15} weight={700} color={C.dim}>
          copolymers of A and B
        </Label>
        {[
          ["homopolymer", "AAAAAAAAAA"],
          ["alternating", "ABABABABAB"],
          ["random", "AABABBBABA"],
          ["block", "AAAAABBBBB"],
        ].map(([n, s], i) => (
          <g key={n}>
            <Label x={150} y={245 + i * 40} anchor="end" size={14}>
              {n}
            </Label>
            <Beads seq={s} x={170} y={240 + i * 40} />
          </g>
        ))}
        <Label x={510} y={232} size={14}>
          graft
        </Label>
        <Beads seq="AAAAA" x={455} y={262} step={26} />
        {[468, 520].map((x) => (
          <g key={x}>
            {[1, 2, 3].map((k) => (
              <circle key={k} cx={x} cy={262 + k * 24} r={8} fill={B} stroke="#0b1220" strokeWidth={1.5} />
            ))}
            <line x1={x} y1={271} x2={x} y2={326} stroke={C.dim} strokeWidth={2} />
          </g>
        ))}
        <Label x={300} y={425} size={12} color={C.dim}>
          blue = monomer A, yellow = monomer B
        </Label>
      </Reveal>

      <Reveal show={is("crosslink")}>
        <Title>Tying chains together</Title>
        {[
          { t: "Gel", s: "network swollen in solvent", d: 3, c: C.lfp, x: 30 },
          { t: "Rubber", s: "loose network, elastic", d: 3, c: C.electron, x: 220 },
          { t: "Thermoset", s: "dense, rigid network", d: 7, c: C.hot, x: 410 },
        ].map((n, i) => (
          <motion.g key={n.t} initial={false} animate={{ opacity: is("crosslink") ? 1 : 0 }} transition={{ delay: is("crosslink") ? i * 0.25 : 0 }}>
            <rect x={n.x} y={80} width={160} height={190} rx={14} fill="#111a2c" stroke={n.c} />
            {n.t === "Gel" && <rect x={n.x + 6} y={86} width={148} height={178} rx={10} fill={C.lfp} opacity={0.12} />}
            <Network x={n.x + 12} y={130} density={n.d} color={n.c} />
            <Label x={n.x + 80} y={108} size={16} weight={700} color={n.c}>
              {n.t}
            </Label>
            <Label x={n.x + 80} y={258} size={12} color={C.dim}>
              {n.s}
            </Label>
          </motion.g>
        ))}
        <Card
          x={90}
          y={300}
          w={420}
          h={110}
          show={is("crosslink")}
          delay={0.6}
          title="Chemical vs physical crosslinks"
          lines={["chemical: covalent bonds, permanent", "physical: intermolecular interactions, reversible"]}
        />
      </Reveal>

      <Reveal show={is("classes")}>
        <Title>The main families</Title>
        {[
          { t: "Thermoplastic", c: C.lfp, l: ["no crosslinks", "soften and melt on heating", "remould, recycle", "e.g. polyethylene"] },
          { t: "Thermoset", c: C.hot, l: ["crosslinked for good", "char, do not melt", "rigid, heat resistant", "e.g. epoxy, Bakelite"] },
          { t: "Elastomer", c: C.electron, l: ["lightly crosslinked", "above Tg: rubbery", "stretch and snap back", "e.g. vulcanised rubber"] },
        ].map((f, i) => (
          <Card key={f.t} x={25 + i * 190} y={80} w={170} h={200} title={f.t} color={f.c} lines={f.l} show={is("classes")} delay={i * 0.2} />
        ))}
        <Chip x={300} y={330} text="plastics = thermoplastics + thermosets" w={320} />
        <Label x={300} y={380} size={14} color={C.dim}>
          crosslink density runs from none → light → dense
        </Label>
      </Reveal>
    </Stage>
  );
}
