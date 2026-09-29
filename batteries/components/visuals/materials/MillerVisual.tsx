"use client";

import { motion } from "framer-motion";
import { C, Chip, Label, Reveal, Stage } from "../primitives";

// Oblique cube projection for the (101) example.
const S = 200;
const O: [number, number] = [120, 360];
const p = (x: number, y: number, z: number): [number, number] => [O[0] + x * S + y * S * 0.45, O[1] - z * S - y * S * 0.3];
const pt = (x: number, y: number, z: number) => p(x, y, z).join(",");

const EDGES: [number, number, number, number, number, number][] = [
  [0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0], [1, 0, 0, 1, 0, 1], [0, 1, 0, 1, 1, 0],
  [0, 1, 0, 0, 1, 1], [0, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 1],
  [1, 1, 0, 1, 1, 1], [1, 0, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1],
];

const STEPS = [
  { n: "1", t: "intercepts with a, b, c", ex: "1   ∞   1" },
  { n: "2", t: "take the reciprocals", ex: "1/1   1/∞   1/1  →  1  0  1" },
  { n: "3", t: "clear fractions", ex: "(1 0 1)" },
];

export default function MillerVisual({ visual }: { visual: string }) {
  const recipe = visual === "recipe";
  const example = visual === "example";
  return (
    <Stage label="Miller indices and X-ray diffraction">
      <Reveal show={recipe}>
        <Label x={300} y={50} size={16} weight={700}>
          Naming a plane (hkl)
        </Label>
        {["intercepts", "reciprocals", "clear fractions"].map((t, i) => (
          <motion.g key={t} initial={false} animate={{ opacity: recipe ? 1 : 0, y: recipe ? 0 : 10 }} transition={{ delay: recipe ? i * 0.25 : 0 }}>
            <rect x={40 + i * 180} y={110} width={160} height={90} rx={14} fill={C.accent} opacity={0.12} stroke={C.accent} />
            <circle cx={70 + i * 180} cy={135} r={13} fill={C.accent} />
            <Label x={70 + i * 180} y={140} size={13} color="#0b1220" weight={800}>
              {i + 1}
            </Label>
            <Label x={120 + i * 180} y={180} size={14} weight={700}>
              {t}
            </Label>
            {i < 2 && <line x1={202 + i * 180} y1={155} x2={218 + i * 180} y2={155} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />}
          </motion.g>
        ))}
        <Label x={300} y={250} size={14} color={C.dim}>
          in units of the cell edges a, b, c
        </Label>
        <rect x={140} y={280} width={320} height={60} rx={12} fill="#0b1220" stroke={C.electron} />
        <Label x={300} y={308} size={15} weight={700} color={C.electron}>
          parallel to an axis → intercept ∞
        </Label>
        <Label x={300} y={330} size={15} color={C.electron}>
          1/∞ = 0
        </Label>
        <Label x={300} y={392} size={13} color={C.dim}>
          (hkl) = a plane · [hkl] = a direction · {"{hkl}"} = a family of planes
        </Label>
      </Reveal>

      <Reveal show={example}>
        <g stroke={C.dim} strokeWidth={1.5}>
          {EDGES.map(([a, b, c, d, e, f], i) => {
            const [x1, y1] = p(a, b, c);
            const [x2, y2] = p(d, e, f);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>
        {/* the (101) plane: contains (1,0,0), (1,1,0), (0,1,1), (0,0,1) */}
        <motion.polygon
          points={`${pt(1, 0, 0)} ${pt(1, 1, 0)} ${pt(0, 1, 1)} ${pt(0, 0, 1)}`}
          fill={C.accent}
          stroke={C.accent}
          strokeWidth={2}
          initial={false}
          animate={{ fillOpacity: example ? 0.35 : 0 }}
          transition={{ duration: 0.8 }}
        />
        {/* axes labels */}
        <Label x={p(1, 0, 0)[0] + 10} y={p(1, 0, 0)[1] + 20} size={14} color={C.hot} weight={700}>
          x = 1
        </Label>
        <Label x={p(0, 0, 1)[0] - 12} y={p(0, 0, 1)[1] - 8} size={14} color={C.hot} weight={700} anchor="end">
          z = 1
        </Label>
        <circle cx={p(1, 0, 0)[0]} cy={p(1, 0, 0)[1]} r={6} fill={C.hot} />
        <circle cx={p(0, 0, 1)[0]} cy={p(0, 0, 1)[1]} r={6} fill={C.hot} />
        <Label x={108} y={292} size={12} color={C.dim} anchor="end">
          y: parallel → ∞
        </Label>
        <Label x={O[0] - 10} y={O[1] + 20} size={12} color={C.dim} anchor="end">
          origin
        </Label>

        <g transform="translate(430 90)">
          {STEPS.map((s, i) => (
            <g key={s.n}>
              <Label x={0} y={i * 62} size={13} color={C.dim} anchor="start">
                {`${s.n}. ${s.t}`}
              </Label>
              <Label x={0} y={i * 62 + 22} size={15} weight={700} anchor="start" color={i === 2 ? C.accent : C.ink}>
                {s.ex}
              </Label>
            </g>
          ))}
        </g>
        <Chip x={300} y={425} text="explain every step: the bare answer gives half the points" color={C.electron} w={420} />
      </Reveal>

      <Reveal show={visual === "bragg"}>
        {/* two planes */}
        {[250, 330].map((y, i) => (
          <g key={y}>
            <line x1={70} y1={y} x2={530} y2={y} stroke={C.dim} strokeWidth={2} />
            {Array.from({ length: 9 }, (_, k) => (
              <circle key={k} cx={90 + k * 55} cy={y} r={7} fill={C.copper} />
            ))}
            <Label x={540} y={y + 5} size={12} color={C.dim} anchor="start">
              {`plane ${i + 1}`}
            </Label>
          </g>
        ))}
        {/* incoming and reflected rays, angle ~30° */}
        <line x1={110} y1={134} x2={310} y2={250} stroke={C.electron} strokeWidth={2.5} />
        <line x1={310} y1={250} x2={510} y2={134} stroke={C.electron} strokeWidth={2.5} markerEnd="url(#arrow-e)" />
        <line x1={72} y1={192} x2={310} y2={330} stroke={C.lfp} strokeWidth={2.5} />
        <line x1={310} y1={330} x2={548} y2={192} stroke={C.lfp} strokeWidth={2.5} />
        {/* extra path highlighted: d sin θ on each side */}
        <line x1={275} y1={310} x2={310} y2={330} stroke={C.hot} strokeWidth={5} />
        <line x1={310} y1={330} x2={345} y2={310} stroke={C.hot} strokeWidth={5} />
        <line x1={310} y1={250} x2={310} y2={330} stroke={C.accent} strokeDasharray="4 4" />
        <Label x={318} y={296} size={14} color={C.accent} anchor="start" weight={700}>
          d
        </Label>
        <Label x={160} y={243} size={14} color={C.electron}>
          θ
        </Label>
        <Label x={300} y={370} size={14} color={C.hot} weight={700}>
          extra path = 2d sin θ
        </Label>
        <Label x={300} y={60} size={16} weight={700}>
          Constructive interference only when
        </Label>
        <rect x={190} y={78} width={220} height={40} rx={10} fill="#0b1220" stroke={C.accent} />
        <Label x={300} y={105} size={18} weight={800} color={C.accent}>
          2d sin θ = nλ
        </Label>
        <Chip x={300} y={420} text="the pattern of peaks is a fingerprint of the structure" color={C.accent} w={400} />
      </Reveal>
    </Stage>
  );
}
