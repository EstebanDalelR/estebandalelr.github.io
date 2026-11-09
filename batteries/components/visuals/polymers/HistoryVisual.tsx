"use client";

import { motion } from "framer-motion";
import { C, Chip, Label, Reveal, Stage, SvgLoop } from "../primitives";
import { Card, Timeline, Title } from "../blocks";

const EVENTS = [
  { year: 1839, label: "polystyrene", color: C.lfp },
  { year: 1845, label: "vulcanised rubber", color: C.electron },
  { year: 1868, label: "celluloid", color: C.lithium },
  { year: 1909, label: "Bakelite", sub: "first synthetic", color: C.copper },
  { year: 1928, label: "polyesters", color: C.anion },
  { year: 1935, label: "nylon", color: C.accent },
  { year: 1938, label: "PTFE (Teflon)", color: C.hot },
  { year: 1941, label: "PET", color: C.lfp },
];

export default function HistoryVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="History of polymers">
      <Reveal show={is("timeline")}>
        <Title>Used long before understood</Title>
        <Timeline events={EVENTS} from={1839} to={1941} y={230} show={is("timeline")} even />
        <motion.rect
          x={296}
          y={150}
          width={8}
          height={200}
          fill={C.electron}
          opacity={0.25}
          initial={false}
          animate={{ opacity: is("timeline") ? 0.25 : 0 }}
        />
        <Label x={300} y={372} size={12} color={C.electron}>
          1920: macromolecules
        </Label>
        <Label x={300} y={420} size={13} color={C.dim}>
          natural polymers (cellulose, proteins, rubber) came first; synthesis exploded after 1930
        </Label>
      </Reveal>

      <Reveal show={is("staudinger")}>
        <Title>Clusters, or giant molecules?</Title>
        <Card
          x={30}
          y={80}
          w={260}
          h={220}
          show={is("staudinger")}
          title="Before: colloid view"
          color={C.hot}
          lines={["small molecules held together", "by physical forces", "", "“there can be no such thing", "as a macromolecule”"]}
        />
        <g>
          {[
            [90, 250],
            [120, 240],
            [105, 270],
            [140, 262],
            [160, 245],
            [175, 272],
            [200, 252],
            [220, 268],
          ].map(([x, y], i) => (
            <circle key={i} cx={x + 10} cy={y + 10} r={9} fill={C.hot} opacity={0.6} />
          ))}
        </g>
        <Card
          x={310}
          y={80}
          w={260}
          h={220}
          show={is("staudinger")}
          delay={0.3}
          title="Staudinger, 1920"
          color={C.accent}
          lines={["long chains of covalent bonds", "“if it behaves like large", "molecules, it is large molecules”", "", "accepted by ~1930"]}
        />
        <path d="M340 270 q 20 -18 40 0 t 40 0 t 40 0 t 40 0 t 40 0" fill="none" stroke={C.accent} strokeWidth={4} />
        <Chip x={300} y={350} text="viscous · slow diffusion · reluctant to crystallise" w={400} color={C.dim} />
        <Label x={300} y={400} size={14}>
          then Carothers (DuPont): neoprene, polyesters, polyamides
        </Label>
      </Reveal>

      <Reveal show={is("today")}>
        <Title>Polymers enable modern technology</Title>
        <Card
          x={30}
          y={80}
          w={260}
          h={200}
          show={is("today")}
          title="Aircraft composites"
          color={C.lfp}
          lines={["Airbus A350 airframe:", "> 50 % carbon-fibre composite", "fibres in a polymer matrix", "light, stiff, fatigue resistant"]}
        />
        <Card
          x={310}
          y={80}
          w={260}
          h={200}
          show={is("today")}
          delay={0.25}
          title="3D printing (CLIP)"
          color={C.electron}
          lines={["UV light cures resin", "through an O₂-permeable window", "O₂ inhibits curing → liquid", "“dead zone”, continuous print"]}
        />
        <g>
          <rect x={390} y={360} width={100} height={10} fill={C.lfp} opacity={0.5} />
          <rect x={410} y={300} width={60} height={60} fill={C.electron} opacity={0.8}>
            <SvgLoop attr="y" values={[350, 300, 350]} dur={4} active={is("today")} />
            <SvgLoop attr="height" values={[10, 60, 10]} dur={4} active={is("today")} />
          </rect>
          <Label x={540} y={370} size={12} color={C.dim}>
            window
          </Label>
        </g>
        <Label x={160} y={330} size={14}>
          also: binders, separators
        </Label>
        <Label x={160} y={350} size={14}>
          and electrolytes in batteries
        </Label>
      </Reveal>
    </Stage>
  );
}
