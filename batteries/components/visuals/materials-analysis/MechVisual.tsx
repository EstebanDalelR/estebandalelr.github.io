"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Card, Title } from "../blocks";

/* stress–strain */
const ssBox = { x: 80, y: 80, w: 420, h: 250 };
const ss = makeScale(ssBox, [0, 1], [0, 1]);
const SS: [number, number][] = Array.from({ length: 41 }, (_, i) => {
  const e = i / 40;
  const y = e < 0.25 ? e * 3 : 0.75 + 0.2 * (1 - Math.exp(-(e - 0.25) * 6)) - (e > 0.85 ? (e - 0.85) * 2 : 0);
  return [e, y];
});

/* creep and relaxation */
const cBox = { x: 60, y: 110, w: 220, h: 180 };
const cs = makeScale(cBox, [0, 10], [0, 1.1]);
const rBox = { x: 340, y: 110, w: 220, h: 180 };
const rs = makeScale(rBox, [0, 10], [0, 1.1]);
const CREEP: [number, number][] = Array.from({ length: 41 }, (_, i) => {
  const t = i / 4;
  return [t, 0.35 + 0.4 * (1 - Math.exp(-t / 2)) + 0.025 * t];
});
const RELAX: [number, number][] = Array.from({ length: 41 }, (_, i) => {
  const t = i / 4;
  return [t, 0.25 + 0.7 * Math.exp(-t / 2.5)];
});

/* DMA waves */
const wBox = { x: 60, y: 90, w: 480, h: 180 };
const ws = makeScale(wBox, [0, 4 * Math.PI], [-1.2, 1.2]);
const wave = (phase: number, amp = 1): [number, number][] => Array.from({ length: 121 }, (_, i) => {
  const t = (i / 120) * 4 * Math.PI;
  return [t, amp * Math.sin(t - phase)];
});

/* Temperature sweep: log E' and tan δ */
const tBox = { x: 90, y: 80, w: 420, h: 240 };
const ts = makeScale(tBox, [-100, 200], [5, 9.6]);
const sig = (T: number, at: number, w: number) => 1 / (1 + Math.exp(-(T - at) / w));
const logE = (T: number, cryst: boolean) =>
  cryst ? 9.2 - 1.4 * sig(T, 0, 7) - 2 * sig(T, 160, 5) : 9.2 - 2.8 * sig(T, 0, 7) - 1.2 * sig(T, 120, 10);
const TAN = (T: number) => 5.3 + 2.1 * Math.exp(-(((T - 8) / 14) ** 2));
const pts = (f: (T: number) => number): [number, number][] => Array.from({ length: 151 }, (_, i) => [-100 + i * 2, f(-100 + i * 2)]);

export default function MechVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Thermomechanical analysis">
      <Reveal show={is("terms")}>
        <Title>Four mechanical words</Title>
        {[
          { t: "Elasticity", l: ["returns to its original", "shape after a force"], c: C.lfp },
          { t: "Stiffness", l: ["stress needed per strain:", "the modulus E"], c: C.electron },
          { t: "Strength", l: ["stress before permanent", "deformation or fracture"], c: C.hot },
          { t: "Hardness", l: ["resists local deformation:", "indent, scratch, cut"], c: C.lithium },
        ].map((w, i) => (
          <Card key={w.t} x={30 + (i % 2) * 280} y={75 + Math.floor(i / 2) * 140} w={260} h={120} title={w.t} lines={w.l} color={w.c} show={is("terms")} delay={i * 0.15} size={14} />
        ))}
        <Chip x={300} y={390} text="stiff ≠ strong: glass is stiff, rubber is tough" w={360} />
      </Reveal>

      <Reveal show={is("stress-strain")}>
        <Title y={40}>Stress–strain curve</Title>
        <Axes box={ssBox} xLabel="strain ε = ΔL / L₀" yLabel="stress σ = F / A" />
        <DrawPath d={ss.path(SS)} show={is("stress-strain")} color={C.accent} />
        <DrawPath d={ss.path([[0, 0], [0.3, 0.9]])} show={is("stress-strain")} color={C.electron} dash="5 4" width={2} delay={0.8} />
        <Label x={ss.sx(0.2)} y={ss.sy(0.72) - 16} anchor="end" size={13} color={C.electron}>
          slope = E
        </Label>
        <Label x={ss.sx(0.27)} y={ss.sy(0.75) + 24} anchor="start" size={12} color={C.dim}>
          yield
        </Label>
        <circle cx={ss.sx(1)} cy={ss.sy(SS[40][1])} r={6} fill={C.hot} />
        <Label x={ss.sx(1)} y={ss.sy(SS[40][1]) + 26} size={12} color={C.hot}>
          fracture
        </Label>
        <Label x={300} y={395} size={14}>
          shear: G = dτ/dγ at small strain
        </Label>
      </Reveal>

      <Reveal show={is("creep")}>
        <Title>Viscoelastic: part spring, part dashpot</Title>
        <Axes box={cBox} xLabel="time" yLabel="strain" />
        <DrawPath d={cs.path(CREEP)} show={is("creep")} color={C.electron} />
        <Label x={170} y={330} size={15} weight={700} color={C.electron}>
          Creep
        </Label>
        <Label x={170} y={350} size={12} color={C.dim}>
          constant stress → strain grows
        </Label>
        <Axes box={rBox} xLabel="time" yLabel="stress" />
        <DrawPath d={rs.path(RELAX)} show={is("creep")} color={C.hot} delay={0.3} />
        <Label x={450} y={330} size={15} weight={700} color={C.hot}>
          Stress relaxation
        </Label>
        <Label x={450} y={350} size={12} color={C.dim}>
          constant strain → stress decays
        </Label>
        <Chip x={300} y={400} text="matters for separators and polymer electrolytes under stack pressure" w={500} color={C.accent} />
      </Reveal>

      <Reveal show={is("dma")}>
        <Title y={40}>DMA: oscillate and watch the lag</Title>
        <Axes box={wBox} xLabel="time" yLabel="" origin={{ y: wBox.y + wBox.h / 2 }} xLabelDy={wBox.h / 2 + 22} />
        <DrawPath d={ws.path(wave(0))} show={is("dma")} color={C.electron} />
        <DrawPath d={ws.path(wave(0.6, 0.7))} show={is("dma")} color={C.hot} delay={0.4} />
        <Label x={200} y={78} size={13} weight={700} color={C.electron}>
          ━ stress (input)
        </Label>
        <Label x={410} y={78} size={13} weight={700} color={C.hot}>
          ━ strain (output), lags by δ
        </Label>
        {[
          ["elastic solid", "δ = 0°", C.lfp],
          ["real polymer", "0° < δ < 90°", C.accent],
          ["viscous liquid", "δ = 90°", C.copper],
        ].map(([t, d, c], i) => (
          <g key={t}>
            <Label x={110 + i * 190} y={320} size={14} weight={700} color={c}>
              {t}
            </Label>
            <Label x={110 + i * 190} y={340} size={13}>
              {d}
            </Label>
          </g>
        ))}
        <Label x={300} y={385} size={14}>
          E′ storage (in phase, elastic) · E″ loss (out of phase, dissipated)
        </Label>
      </Reveal>

      <Reveal show={is("sweep")}>
        <Title y={40}>Temperature sweep</Title>
        <Axes box={tBox} xLabel="temperature (°C)" yLabel="log E′ (Pa)" />
        {[6, 7, 8, 9].map((v) => (
          <Label key={v} x={tBox.x - 8} y={ts.sy(v) + 4} anchor="end" size={11} color={C.dim}>
            {`10${"⁶⁷⁸⁹"[v - 6]}`}
          </Label>
        ))}
        <DrawPath d={ts.path(pts((T) => logE(T, false)))} show={is("sweep")} color={C.accent} />
        <DrawPath d={ts.path(pts((T) => logE(T, true)))} show={is("sweep")} color={C.lithium} dash="6 4" delay={0.4} />
        <DrawPath d={ts.path(pts(TAN))} show={is("sweep")} color={C.hot} width={2} delay={0.8} />
        <Label x={ts.sx(-60)} y={ts.sy(9.2) - 10} size={13} color={C.dim}>
          glassy ≈ 1 GPa
        </Label>
        <Label x={ts.sx(24)} y={ts.sy(7.3)} anchor="start" size={13} weight={700} color={C.hot}>
          tan δ peak = Tg
        </Label>
        <Label x={ts.sx(40)} y={ts.sy(6.85)} anchor="start" size={13} color={C.accent}>
          rubbery plateau → flow
        </Label>
        <Label x={ts.sx(105)} y={ts.sy(8.15)} size={13} color={C.lithium}>
          semi-crystalline
        </Label>
        <Label x={300} y={415} size={12} color={C.dim}>
          crystallites hold the modulus up until they melt
        </Label>
      </Reveal>

      <Reveal show={is("electrolyte")}>
        <Title>Solid polymer electrolytes: the trade-off</Title>
        <defs>
          <linearGradient id="tradeoff" x1="0" x2="1">
            <stop offset="0%" stopColor={C.lfp} />
            <stop offset="100%" stopColor={C.hot} />
          </linearGradient>
        </defs>
        <rect x={60} y={160} width={480} height={18} rx={9} fill="url(#tradeoff)" />
        <Label x={70} y={145} anchor="start" size={15} weight={700} color={C.lfp}>
          stiff, below Tg
        </Label>
        <Label x={530} y={145} anchor="end" size={15} weight={700} color={C.hot}>
          soft, above Tg
        </Label>
        <Label x={70} y={205} anchor="start" size={13} color={C.dim}>
          separates electrodes
        </Label>
        <Label x={70} y={223} anchor="start" size={13} color={C.dim}>
          ions barely move
        </Label>
        <Label x={530} y={205} anchor="end" size={13} color={C.dim}>
          ions ride the chain motion
        </Label>
        <Label x={530} y={223} anchor="end" size={13} color={C.dim}>
          may creep, short-circuit
        </Label>
        <motion.g initial={false} animate={{ x: is("electrolyte") ? 0 : -120 }} transition={{ duration: 1.2 }}>
          <path d="M300 150 l -10 -22 h 20 z" fill={C.electron} />
          <Label x={300} y={118} size={13} weight={700} color={C.electron}>
            target window
          </Label>
        </motion.g>
        <Card
          x={90}
          y={260}
          w={420}
          h={120}
          show={is("electrolyte")}
          delay={0.4}
          title="Measure both sides"
          lines={["DSC: Tg and crystallinity (ion mobility)", "DMA: modulus and creep (mechanical stability)", "e.g. Mindemark et al., Electrochim. Acta 2017"]}
        />
      </Reveal>
    </Stage>
  );
}
