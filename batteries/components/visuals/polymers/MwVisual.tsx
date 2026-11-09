"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Card, Title } from "../blocks";

/* A log-normal-ish molar mass distribution, M in kg/mol. */
const box = { x: 80, y: 70, w: 460, h: 260 };
const s = makeScale(box, [0, 200], [0, 1.05]);
const dist = (m: number) => Math.exp(-((Math.log(m / 55) / 0.55) ** 2));
const DIST: [number, number][] = Array.from({ length: 101 }, (_, i) => {
  const m = 2 + i * 1.98;
  return [m, dist(m)];
});
// Number- and weight-weighted averages of that distribution.
const sumN = DIST.reduce((a, [, n]) => a + n, 0);
const sumNM = DIST.reduce((a, [m, n]) => a + n * m, 0);
const sumNM2 = DIST.reduce((a, [m, n]) => a + n * m * m, 0);
const MN = sumNM / sumN;
const MW = sumNM2 / sumNM;

/* Property vs chain length: rises then plateaus. */
const pBox = { x: 90, y: 90, w: 430, h: 220 };
const ps = makeScale(pBox, [0, 100], [0, 1.05]);
const PROP: [number, number][] = Array.from({ length: 51 }, (_, i) => {
  const x = i * 2;
  return [x, 1 - Math.exp(-x / 14)];
});

function Avg({ m, label, color, show, y }: { m: number; label: string; color: string; show: boolean; y: number }) {
  return (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ delay: show ? 0.5 : 0 }}>
      <line x1={s.sx(m)} x2={s.sx(m)} y1={box.y + box.h} y2={box.y + 20} stroke={color} strokeWidth={2.5} strokeDasharray="6 4" />
      <Label x={s.sx(m) + 6} y={y} anchor="start" size={15} weight={800} color={color}>
        {label}
      </Label>
    </motion.g>
  );
}

function Distribution({ show, mn, mw }: { show: boolean; mn?: boolean; mw?: boolean }) {
  return (
    <g>
      <Axes box={box} xLabel="molar mass M" yLabel="number of chains Nᵢ" />
      <path d={s.path(DIST) + `L${s.sx(200)},${s.sy(0)} L${s.sx(2)},${s.sy(0)}Z`} fill={C.accent} opacity={0.15} />
      <DrawPath d={s.path(DIST)} show={show} color={C.accent} />
      {mn && <Avg m={MN} label="Mn" color={C.electron} show={show} y={box.y + 30} />}
      {mw && <Avg m={MW} label="Mw" color={C.hot} show={show} y={box.y + 52} />}
    </g>
  );
}

const COLUMN_BEADS = [
  [40, 30],
  [80, 50],
  [30, 90],
  [75, 120],
  [45, 160],
  [85, 190],
  [35, 230],
  [70, 260],
];

export default function MwVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Molecular weight of polymers">
      <Reveal show={is("size")}>
        <Title>Same unit, different length, different material</Title>
        {[
          { m: "400 g/mol", n: "≈ 9 units", st: "liquid", c: C.lfp, len: 2 },
          { m: "4000 g/mol", n: "≈ 90 units", st: "waxy solid", c: C.electron, len: 4 },
          { m: "> 100 000 g/mol", n: "thousands", st: "tough plastic film", c: C.hot, len: 7 },
        ].map((p, i) => (
          <motion.g key={p.m} initial={false} animate={{ opacity: is("size") ? 1 : 0 }} transition={{ delay: is("size") ? i * 0.3 : 0 }}>
            <Label x={110} y={130 + i * 100} size={15} weight={700} color={p.c}>
              {p.m}
            </Label>
            <Label x={110} y={150 + i * 100} size={12} color={C.dim}>
              {p.n}
            </Label>
            <path
              d={`M200 ${125 + i * 100} ` + Array.from({ length: p.len }, () => "q 12 -12 24 0 t 24 0").join(" ")}
              fill="none"
              stroke={p.c}
              strokeWidth={4}
            />
            <Label x={560} y={160 + i * 100} anchor="end" size={14} weight={700}>
              {p.st}
            </Label>
          </motion.g>
        ))}
        <Label x={300} y={420} size={13} color={C.dim}>
          poly(ethylene glycol), –[CH₂–CH₂–O]ₙ–
        </Label>
      </Reveal>

      <Reveal show={is("distribution")}>
        <Title y={40}>Polydisperse: chains of many lengths</Title>
        <Distribution show={is("distribution")} />
        <Label x={300} y={400} size={14}>
          Nᵢ chains have molar mass Mᵢ
        </Label>
        <Label x={300} y={422} size={12} color={C.dim}>
          so a single number needs an average
        </Label>
      </Reveal>

      <Reveal show={is("mn")}>
        <Title y={40}>Number average: every chain counts once</Title>
        <Distribution show={is("mn")} mn />
        <Label x={300} y={400} size={14}>
          Mn = total mass / number of chains = Xn · M₀
        </Label>
      </Reveal>

      <Reveal show={is("mw")}>
        <Title y={40}>Weight average: heavy chains count more</Title>
        <Distribution show={is("mw")} mn mw />
        <Chip x={300} y={400} text={`Đ = Mw / Mn ≈ ${(MW / MN).toFixed(2)} here · always ≥ 1`} color={C.hot} w={330} />
      </Reveal>

      <Reveal show={is("example")}>
        <Title>Worked example: a 1 : 1 mixture</Title>
        {[
          { m: 10, c: C.lfp, x: 150 },
          { m: 30, c: C.electron, x: 400 },
        ].map((g) => (
          <g key={g.m}>
            {Array.from({ length: 4 }, (_, i) => (
              <path
                key={i}
                d={`M${g.x - g.m * 2.2} ${100 + i * 22} l ${g.m * 4.4} 0`}
                stroke={g.c}
                strokeWidth={6}
                strokeLinecap="round"
              />
            ))}
            <Label x={g.x} y={205} size={14} weight={700} color={g.c}>
              {`1 mol × ${g.m} 000 g/mol`}
            </Label>
          </g>
        ))}
        <Card x={40} y={235} w={250} h={150} show={is("example")} title="Mn" color={C.electron} lines={["(10 000 + 30 000) / 2", "= 20 000 g/mol", "", "count the chains"]} size={14} />
        <Card
          x={310}
          y={235}
          w={250}
          h={150}
          show={is("example")}
          delay={0.3}
          title="Mw"
          color={C.hot}
          lines={["(10 000² + 30 000²) / 40 000", "= 25 000 g/mol", "", "weigh the chains"]}
          size={14}
        />
        <Chip x={300} y={415} text="Đ = 25 000 / 20 000 = 1.25" color={C.accent} w={260} />
      </Reveal>

      <Reveal show={is("units")}>
        <Title>g/mol, not Da</Title>
        <Card
          x={40}
          y={90}
          w={240}
          h={180}
          show={is("units")}
          title="g/mol ✓"
          color={C.lithium}
          lines={["molar mass of an average", "chain in a real sample", "", "Mn = 20 000 g/mol"]}
          size={14}
        />
        <Card
          x={320}
          y={90}
          w={240}
          h={180}
          show={is("units")}
          delay={0.2}
          title="Da / kDa ✗"
          color={C.hot}
          lines={["mass of one molecule", "implies all chains equal", "(monodisperse)", "never true for polymers"]}
          size={14}
        />
        <Label x={300} y={330} size={15}>
          Đ = 1 only for a perfectly monodisperse sample
        </Label>
        <Label x={300} y={355} size={13} color={C.dim}>
          (proteins come close; synthetic polymers do not)
        </Label>
      </Reveal>

      <Reveal show={is("measure")}>
        <Title>Measuring Mn and M</Title>
        <Card
          x={30}
          y={80}
          w={260}
          h={250}
          show={is("measure")}
          title="End-group analysis"
          color={C.electron}
          lines={["known number of ends per chain", "count ends (NMR, titration)", "", "Mn = M₀ · [units] / [ends]", "", "works for short chains:", "ends get too dilute for long"]}
        />
        <Card
          x={310}
          y={80}
          w={260}
          h={250}
          show={is("measure")}
          delay={0.25}
          title="Viscometry"
          color={C.lfp}
          lines={["viscosity rises with M:", "big coils sweep more solvent", "", "extrapolate to c → 0:", "intrinsic viscosity [η]", "", "Mark–Houwink: [η] = K·Mᵃ"]}
        />
        <Label x={300} y={380} size={13} color={C.dim}>
          K and a are tabulated for each polymer–solvent pair
        </Label>
      </Reveal>

      <Reveal show={is("gpc")}>
        <Title>GPC / SEC: separating by size</Title>
        <rect x={60} y={70} width={130} height={300} rx={14} fill="#111a2c" stroke={C.dim} />
        {COLUMN_BEADS.map(([x, y], i) => (
          <g key={i}>
            <circle cx={60 + x} cy={70 + y + 10} r={18} fill="none" stroke={C.dim} strokeWidth={2} strokeDasharray="3 3" />
          </g>
        ))}
        <circle r={11} fill={C.hot}>
          <animateMotion dur="3s" repeatCount="indefinite" path="M125 70 L125 370" />
        </circle>
        <circle r={5} fill={C.lfp}>
          <animateMotion dur="6s" repeatCount="indefinite" path="M125 70 Q100 100 100 110 Q140 130 140 140 Q90 180 105 200 Q145 220 130 240 Q95 280 110 300 L125 370" />
        </circle>
        <Label x={125} y={395} size={12} color={C.dim}>
          porous gel beads
        </Label>
        <g>
          <Axes box={{ x: 260, y: 110, w: 290, h: 200 }} xLabel="elution volume →" yLabel="detector" />
          <DrawPath d="M262 308 C300 308 310 180 340 180 C370 180 380 308 410 308" show={is("gpc")} color={C.hot} />
          <DrawPath d="M400 308 C430 308 440 220 470 220 C500 220 510 308 540 308" show={is("gpc")} color={C.lfp} delay={0.6} />
          <Label x={340} y={170} size={13} color={C.hot}>
            large: excluded, first
          </Label>
          <Label x={470} y={210} size={13} color={C.lfp}>
            small: enter pores, last
          </Label>
        </g>
        <Label x={405} y={370} size={13}>
          calibrate with narrow standards
        </Label>
        <Label x={405} y={390} size={12} color={C.dim}>
          detect by RI, viscosity, light scattering
        </Label>
      </Reveal>

      <Reveal show={is("oligomer")}>
        <Title>When is it a polymer?</Title>
        <Axes box={pBox} xLabel="number of repeating units →" yLabel="property (Tg, strength, Tm)" xLabelDy={64} />
        <DrawPath d={ps.path(PROP)} show={is("oligomer")} color={C.accent} />
        {[
          [0, 12, "small molecule", C.lfp],
          [12, 40, "oligomer", C.electron],
          [40, 100, "polymer", C.hot],
        ].map(([a, b, t, c]) => (
          <g key={t as string}>
            <rect x={ps.sx(a as number)} y={pBox.y + pBox.h + 8} width={ps.sx(b as number) - ps.sx(a as number) - 3} height={8} fill={c as string} rx={4} />
            <Label x={(ps.sx(a as number) + ps.sx(b as number)) / 2} y={pBox.y + pBox.h + 36} size={13} color={c as string}>
              {t as string}
            </Label>
          </g>
        ))}
        <Chip x={300} y={400} text="polymer: one more unit no longer changes the properties" w={430} />
        <Label x={300} y={428} size={13} color={C.dim}>
          crosslinked network: effectively one molecule, M → ∞
        </Label>
      </Reveal>
    </Stage>
  );
}
