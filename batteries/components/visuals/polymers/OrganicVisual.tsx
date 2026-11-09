"use client";

import { motion } from "framer-motion";
import { C, Chip, Label, Reveal, Stage } from "../primitives";
import { Card, Title } from "../blocks";
import { Atom, Backbone, Bond, zigzag } from "./mol";

/** A carbon with up to four substituents drawn at N/E/S/W. */
function Center({ x, y, groups }: { x: number; y: number; groups: [string, string, string, string] }) {
  const dirs: [number, number][] = [
    [0, -38],
    [38, 0],
    [0, 38],
    [-38, 0],
  ];
  return (
    <g>
      {groups.map((g, i) => g && <Bond key={i} x1={x} y1={y} x2={x + dirs[i][0]} y2={y + dirs[i][1]} />)}
      {groups.map((g, i) => g && <Atom key={`a${i}`} x={x + dirs[i][0]} y={y + dirs[i][1]} el={g} />)}
      <Atom x={x} y={y} el="C" />
    </g>
  );
}

function Ethane({ y, order }: { y: number; order: 1 | 2 | 3 }) {
  const x1 = 200;
  const x2 = 280;
  const hs = order === 1 ? [-1, 0, 1] : order === 2 ? [-1, 1] : [0];
  const ang = (k: number) => (order === 3 ? 0 : k * 0.85);
  return (
    <g>
      <Bond x1={x1} y1={y} x2={x2} y2={y} order={order} color={order > 1 ? C.electron : C.dim} />
      {hs.map((k) => {
        const a = ang(k);
        const lx = x1 - Math.cos(a) * 40;
        const ly = y - Math.sin(a) * 34;
        const rx = x2 + Math.cos(a) * 40;
        const ry = y - Math.sin(a) * 34;
        return (
          <g key={k}>
            <Bond x1={x1} y1={y} x2={lx} y2={ly} />
            <Bond x1={x2} y1={y} x2={rx} y2={ry} />
            <Atom x={lx} y={ly} el="H" />
            <Atom x={rx} y={ry} el="H" />
          </g>
        );
      })}
      <Atom x={x1} y={y} el="C" />
      <Atom x={x2} y={y} el="C" />
    </g>
  );
}

function Radical({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={5} fill={C.electron} />;
}

export default function OrganicVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  const butane = zigzag(4, 70, 290, 40);
  const decane = zigzag(10, 250, 290, 33);
  const chainA = zigzag(6, 60, 150, 34, 12);
  const chainB = zigzag(6, 330, 150, 34, 12);
  return (
    <Stage label="Organic structures and reactions">
      <Reveal show={is("structures")}>
        <Title>Carbon makes four bonds</Title>
        <Center x={110} y={140} groups={["H", "H", "H", "H"]} />
        <Center x={300} y={140} groups={["H", "N", "H", "H"]} />
        <Center x={490} y={140} groups={["H", "O", "H", "H"]} />
        <Label x={110} y={210} size={14} weight={700}>
          methane CH₄
        </Label>
        <Label x={300} y={210} size={14} weight={700}>
          methanamine CH₃NH₂
        </Label>
        <Label x={490} y={210} size={14} weight={700}>
          methanol CH₃OH
        </Label>
        <Backbone pts={butane} />
        {butane.map(([x, y], i) => (
          <Atom key={i} x={x} y={y} el="C" r={12} />
        ))}
        <Backbone pts={decane} />
        {decane.map(([x, y], i) => (
          <Atom key={i} x={x} y={y} el="C" r={11} />
        ))}
        <Label x={130} y={340} size={14} weight={700}>
          butane C₄H₁₀
        </Label>
        <Label x={400} y={340} size={14} weight={700}>
          decane C₁₀H₂₂
        </Label>
        <Chip x={300} y={400} text="the functional group (–NH₂, –OH) decides the chemistry" w={430} />
      </Reveal>

      <Reveal show={is("bonds")}>
        <Title>Single, double, triple</Title>
        <Ethane y={120} order={1} />
        <Ethane y={230} order={2} />
        <Ethane y={340} order={3} />
        {[
          ["ethane C₂H₆", "single bond, free rotation", 120],
          ["ethene C₂H₄", "double bond: the monomer handle", 230],
          ["ethyne C₂H₂", "triple bond, linear", 340],
        ].map(([n, s, y]) => (
          <g key={n as string}>
            <Label x={360} y={(y as number) - 2} anchor="start" size={15} weight={700}>
              {n}
            </Label>
            <Label x={360} y={(y as number) + 18} anchor="start" size={13} color={C.dim}>
              {s}
            </Label>
          </g>
        ))}
        <Chip x={300} y={420} text="open C=C → each monomer joins two neighbours" color={C.electron} w={380} />
      </Reveal>

      <Reveal show={is("polar")}>
        <Title>Electrons flow from rich to poor</Title>
        <ellipse cx={140} cy={220} rx={70} ry={60} fill={C.anion} opacity={0.22} />
        <Atom x={140} y={220} el="O" r={22} />
        <Label x={140} y={180} size={14}>
          ⁻
        </Label>
        {[
          [110, 198],
          [170, 198],
          [110, 244],
          [170, 244],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x - 4} cy={y} r={3} fill={C.electron} />
            <circle cx={x + 4} cy={y} r={3} fill={C.electron} />
          </g>
        ))}
        <Label x={140} y={310} size={15} weight={700} color={C.anion}>
          nucleophile δ−
        </Label>
        <Label x={140} y={330} size={12} color={C.dim}>
          lone pairs, negative charge
        </Label>
        <Bond x1={390} y1={220} x2={480} y2={220} />
        <ellipse cx={480} cy={220} rx={52} ry={46} fill={C.anion} opacity={0.22} />
        <Atom x={390} y={220} el="C" r={20} />
        <Atom x={480} y={220} el="Br" r={22} />
        <Label x={390} y={180} size={15} weight={800} color={C.lfp}>
          δ+
        </Label>
        <Label x={480} y={180} size={15} weight={800} color={C.anion}>
          δ−
        </Label>
        <Label x={390} y={310} size={15} weight={700} color={C.lfp}>
          electrophile δ+
        </Label>
        <Label x={390} y={330} size={12} color={C.dim}>
          carbon next to a halogen
        </Label>
        <motion.path
          d="M175 205 Q280 140 370 205"
          fill="none"
          stroke={C.electron}
          strokeWidth={3}
          markerEnd="url(#arrow-e)"
          initial={false}
          animate={{ pathLength: is("polar") ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
        <Label x={275} y={150} size={13} color={C.electron}>
          electron pair attacks
        </Label>
      </Reveal>

      <Reveal show={is("substitution")}>
        <Title>Nucleophilic substitution</Title>
        <Atom x={70} y={160} el="O" r={18} />
        <Atom x={70} y={122} el="H" />
        <Label x={95} y={150} size={14}>
          ⁻
        </Label>
        <Center x={200} y={160} groups={["H", "Br", "H", "H"]} />
        <motion.path
          d="M90 160 Q130 200 160 165"
          fill="none"
          stroke={C.electron}
          strokeWidth={2.5}
          markerEnd="url(#arrow-e)"
          initial={false}
          animate={{ pathLength: is("substitution") ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        />
        <line x1={280} y1={160} x2={330} y2={160} stroke={C.ink} strokeWidth={2} markerEnd="url(#arrow)" />
        <Center x={400} y={160} groups={["H", "O", "H", "H"]} />
        <Atom x={540} y={160} el="Br" r={18} />
        <Label x={562} y={150} size={14}>
          ⁻
        </Label>
        <Label x={135} y={230} size={13} color={C.dim}>
          OH⁻ + CH₃Br
        </Label>
        <Label x={460} y={230} size={13} color={C.dim}>
          CH₃OH + Br⁻ (leaving group)
        </Label>
        <Card
          x={90}
          y={275}
          w={420}
          h={120}
          show={is("substitution")}
          delay={0.4}
          title="Carbonyl C=O is electrophilic too"
          color={C.hot}
          lines={["acid + alcohol → ester  (polyesters, e.g. PET)", "acid + amine → amide  (polyamides, e.g. nylon)", "condensation: small molecule (H₂O) released"]}
        />
      </Reveal>

      <Reveal show={is("radical")}>
        <Title>Radical reactions in three stages</Title>
        {[
          { t: "Initiation", c: C.electron, l: ["R–R → R• + •R", "homolytic cleavage", "heat, UV, catalyst"] },
          { t: "Propagation", c: C.accent, l: ["R• + C=C → R–C–C•", "radical passed on", "repeats many times"] },
          { t: "Termination", c: C.hot, l: ["R• + •R → R–R", "two radicals meet", "stable, non-radical"] },
        ].map((s, i) => (
          <Card key={s.t} x={25 + i * 190} y={80} w={170} h={140} title={s.t} color={s.c} lines={s.l} show={is("radical")} delay={i * 0.2} />
        ))}
        <g>
          <path d="M60 400 L60 260 M60 400 L560 400" stroke={C.dim} strokeWidth={1.5} fill="none" />
          <Label x={50} y={255} size={12} color={C.dim} anchor="end">
            E
          </Label>
          <motion.path
            d="M70 390 C110 390 120 280 150 280 C180 280 190 340 230 340 C270 340 280 320 300 320 C330 320 340 340 370 340 C410 340 420 380 470 385 L550 385"
            fill="none"
            stroke={C.accent}
            strokeWidth={3}
            initial={false}
            animate={{ pathLength: is("radical") ? 1 : 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          <Label x={150} y={270} size={12} color={C.electron}>
            initiation barrier
          </Label>
          <Label x={300} y={308} size={12} color={C.accent}>
            propagation
          </Label>
          <Label x={480} y={375} size={12} color={C.hot}>
            termination
          </Label>
        </g>
      </Reveal>

      <Reveal show={is("termination")}>
        <Title>Two ways to stop a growing chain</Title>
        <Label x={300} y={88} size={15} weight={700} color={C.accent}>
          Combination: ends join
        </Label>
        <Backbone pts={chainA} />
        <Backbone pts={chainB} />
        <motion.line
          x1={chainA[5][0]}
          y1={chainA[5][1]}
          x2={chainB[0][0]}
          y2={chainB[0][1]}
          stroke={C.accent}
          strokeWidth={3}
          initial={false}
          animate={{ pathLength: is("termination") ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />
        <Radical x={chainA[5][0] + 6} y={chainA[5][1] - 14} />
        <Radical x={chainB[0][0] - 6} y={chainB[0][1] - 14} />
        <Label x={300} y={200} size={13} color={C.dim}>
          one long dead chain
        </Label>

        <Label x={300} y={258} size={15} weight={700} color={C.hot}>
          Disproportionation: a hydrogen moves
        </Label>
        <Backbone pts={zigzag(6, 60, 320, 34, 12)} />
        <Backbone pts={zigzag(6, 330, 320, 34, 12)} />
        <Bond x1={60 + 4 * 34} y1={332} x2={60 + 5 * 34} y2={308} order={2} color={C.electron} />
        <Atom x={330} y={350} el="H" />
        <motion.path
          d="M330 350 Q260 400 236 330"
          fill="none"
          stroke={C.electron}
          strokeWidth={2}
          strokeDasharray="4 4"
          markerEnd="url(#arrow-e)"
          initial={false}
          animate={{ pathLength: is("termination") ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        />
        <Label x={150} y={385} size={13} color={C.electron}>
          ends with C=C
        </Label>
        <Label x={430} y={385} size={13} color={C.dim}>
          saturated end
        </Label>
        <Label x={300} y={425} size={13} color={C.dim}>
          two dead chains, neither longer
        </Label>
      </Reveal>
    </Stage>
  );
}
