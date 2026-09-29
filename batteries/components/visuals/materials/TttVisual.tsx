"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

/* Temperature is normalised: u = 0 cold, u = 1 the equilibrium transformation temperature. */
const kinetic = (u: number) => Math.exp(4 * (u - 1)); // diffusion: fast when hot
const thermo = (u: number) => (1 - u) ** 1.3; // driving force: grows with undercooling
const US = Array.from({ length: 91 }, (_, i) => 0.03 + (i / 90) * 0.94);
const PMAX = Math.max(...US.map((u) => kinetic(u) * thermo(u)));
const rate = (u: number) => (kinetic(u) * thermo(u)) / PMAX;
const uNose = US.reduce((a, b) => (rate(b) > rate(a) ? b : a));
const startLog = (u: number) => 0.5 + Math.log10(1 / rate(u));
const LOGMAX = 3;

function cCurve(sc: ReturnType<typeof makeScale>, offset: number) {
  return sc.path(US.filter((u) => startLog(u) + offset <= LOGMAX).map((u) => [startLog(u) + offset, u] as [number, number]));
}

const rBox = { x: 60, y: 80, w: 200, h: 260 };
const rs = makeScale(rBox, [0, 1.05], [0, 1.05]);
const tBox = { x: 340, y: 80, w: 230, h: 260 };
const ts = makeScale(tBox, [0, LOGMAX], [0, 1.05]);
const mBox = { x: 70, y: 70, w: 260, h: 280 };
const ms = makeScale(mBox, [0, LOGMAX], [0, 1.05]);

/* Avrami */
const aBox = { x: 80, y: 70, w: 440, h: 260 };
const as = makeScale(aBox, [-0.5, 2.5], [0, 1.05]);
const AVRAMI = [
  { k: 0.3, label: "T₁", color: C.lithium },
  { k: 0.06, label: "T₂", color: C.electron },
  { k: 0.02, label: "T₃", color: C.hot },
];
const N = 3;
const avrami = (k: number) =>
  as.path(Array.from({ length: 121 }, (_, i) => {
    const lg = -0.5 + (i / 120) * 3;
    return [lg, 1 - Math.exp(-((k * 10 ** lg) ** N))] as [number, number];
  }));
const logAt = (k: number, y: number) => Math.log10((-Math.log(1 - y)) ** (1 / N) / k);

/* age hardening */
const sBox = { x: 60, y: 60, w: 220, h: 140 };
const ss = makeScale(sBox, [0, 10], [0, 1]);
const hBox = { x: 80, y: 262, w: 420, h: 118 };
const hs = makeScale(hBox, [0, 1], [0, 1]);
const hard = hs.path(Array.from({ length: 81 }, (_, i) => {
  const x = i / 80;
  return [x, 0.15 + 0.8 * Math.exp(-(((x - 0.5) / 0.22) ** 2))] as [number, number];
}));

export default function TttVisual({ visual }: { visual: string }) {
  const nose = visual === "nose";
  const mart = visual === "martensite";
  return (
    <Stage label="TTT diagrams, martensite and age hardening">
      {/* nose */}
      <Reveal show={nose}>
        <Axes box={rBox} xLabel="rate" yLabel="T" />
        <DrawPath d={rs.path(US.map((u) => [kinetic(u), u]))} show={nose} color={C.lfp} width={2} dash="6 5" />
        <DrawPath d={rs.path(US.map((u) => [thermo(u), u]))} show={nose} color={C.hot} width={2} dash="6 5" delay={0.2} />
        <DrawPath d={rs.path(US.map((u) => [rate(u), u]))} show={nose} color={C.accent} width={3.5} delay={0.5} />
        <Label x={rs.sx(0.82)} y={rs.sy(1.0)} anchor="end" size={12} color={C.lfp}>
          diffusion
        </Label>
        <Label x={rs.sx(thermo(0.1)) + 6} y={rs.sy(0.1)} anchor="start" size={12} color={C.hot}>
          driving force
        </Label>
        <Label x={rs.sx(rate(uNose)) + 6} y={rs.sy(uNose) + 4} anchor="start" size={12} color={C.accent} weight={700}>
          product
        </Label>
        <Label x={160} y={40} size={14} weight={700}>
          rate = kinetics × thermodynamics
        </Label>

        <Axes box={tBox} xLabel="log time" yLabel="T" />
        <line x1={tBox.x} x2={tBox.x + tBox.w} y1={ts.sy(1)} y2={ts.sy(1)} stroke={C.dim} strokeDasharray="4 4" />
        <Label x={tBox.x + tBox.w} y={ts.sy(1) - 6} anchor="end" size={12} color={C.dim}>
          equilibrium T
        </Label>
        <DrawPath d={cCurve(ts, 0)} show={nose} color={C.accent} width={3} delay={0.6} />
        <DrawPath d={cCurve(ts, 0.9)} show={nose} color={C.electron} width={3} delay={0.8} />
        <Label x={ts.sx(startLog(uNose)) - 12} y={ts.sy(uNose) + 4} anchor="end" size={13} color={C.accent} weight={700}>
          nose
        </Label>
        <Label x={ts.sx(startLog(0.12) + 0.9) + 6} y={ts.sy(0.12)} anchor="start" size={12} color={C.electron}>
          finish
        </Label>
        <Label x={ts.sx(startLog(0.12)) - 6} y={ts.sy(0.12)} anchor="end" size={12} color={C.accent}>
          start
        </Label>
        <Label x={455} y={40} size={14} weight={700}>
          time = 1 / rate
        </Label>
        <Chip x={300} y={420} text="hot: no driving force · cold: no diffusion → fastest in between" w={460} />
      </Reveal>

      {/* Avrami */}
      <Reveal show={visual === "avrami"}>
        <Axes box={aBox} xLabel="log time" yLabel="fraction transformed y" />
        {[0, 0.5, 1].map((v) => (
          <Label key={v} x={aBox.x - 8} y={as.sy(v) + 4} anchor="end" size={12} color={C.dim}>
            {v}
          </Label>
        ))}
        {AVRAMI.map((a, i) => (
          <g key={a.label}>
            <DrawPath d={avrami(a.k)} show={visual === "avrami"} color={a.color} width={3} delay={i * 0.25} />
            <circle cx={as.sx(logAt(a.k, 0.01))} cy={as.sy(0.01)} r={5} fill={a.color} />
            <circle cx={as.sx(logAt(a.k, 0.99))} cy={as.sy(0.99)} r={5} fill={a.color} />
            <Label x={as.sx(logAt(a.k, 0.5)) + 10} y={as.sy(0.5) + 4} anchor="start" size={13} color={a.color} weight={700}>
              {a.label}
            </Label>
          </g>
        ))}
        <Label x={90} y={372} anchor="start" size={12} color={C.dim}>
          dots: start (1 %) and finish (99 %)
        </Label>
        <Chip x={300} y={405} text="each temperature → one start and one finish time on the TTT diagram" w={500} />
      </Reveal>

      {/* martensite */}
      <Reveal show={mart}>
        <Axes box={mBox} xLabel="log time" yLabel="T" />
        <DrawPath d={cCurve(ms, 0)} show={mart} color={C.accent} width={2.5} />
        <DrawPath d={cCurve(ms, 0.9)} show={mart} color={C.electron} width={2.5} delay={0.2} />
        <line x1={mBox.x} x2={mBox.x + mBox.w} y1={ms.sy(0.25)} y2={ms.sy(0.25)} stroke={C.anion} strokeDasharray="5 4" />
        <Label x={mBox.x + mBox.w} y={ms.sy(0.25) - 6} anchor="end" size={12} color={C.anion}>
          M_s
        </Label>
        <DrawPath d={ms.path([[0.02, 0.98], [0.3, 0.04]])} show={mart} color={C.hot} width={3.5} delay={0.5} />
        <DrawPath d={ms.path([[0.02, 0.98], [1.2, 0.86], [2.2, 0.72], [2.9, 0.58]])} show={mart} color={C.lfp} width={3} delay={0.7} />
        <line x1={80} x2={104} y1={400} y2={400} stroke={C.hot} strokeWidth={3.5} />
        <Label x={112} y={404} anchor="start" size={12} color={C.hot} weight={700}>
          quench misses the nose → martensite
        </Label>
        <line x1={80} x2={104} y1={422} y2={422} stroke={C.lfp} strokeWidth={3} />
        <Label x={112} y={426} anchor="start" size={12} color={C.lfp} weight={700}>
          slow cooling crosses it → pearlite
        </Label>

        <Label x={465} y={60} size={14} weight={700}>
          fcc → bct by shear
        </Label>
        <rect x={380} y={100} width={60} height={60} fill="none" stroke={C.lfp} strokeWidth={2} />
        {[[380, 100], [440, 100], [380, 160], [440, 160], [410, 130]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill={C.lfp} />
        ))}
        <motion.g initial={false} animate={{ x: mart ? [0, 6, 0] : 0 }} transition={{ duration: 1.2, repeat: Infinity }}>
          <line x1={452} x2={498} y1={130} y2={130} stroke={C.ink} strokeWidth={2} markerEnd="url(#arrow)" />
        </motion.g>
        <rect x={510} y={88} width={48} height={84} fill="none" stroke={C.hot} strokeWidth={2} />
        {[[510, 88], [558, 88], [510, 172], [558, 172], [534, 130]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill={C.hot} />
        ))}
        <Label x={410} y={192} size={12} color={C.lfp}>
          austenite
        </Label>
        <Label x={534} y={192} size={12} color={C.hot}>
          martensite
        </Label>
        <Label x={465} y={235} size={13}>
          no diffusion: C is trapped,
        </Label>
        <Label x={465} y={255} size={13}>
          atoms move together
        </Label>
        <Chip x={465} y={300} text="very hard but brittle" color={C.hot} w={200} />
        <Chip x={465} y={340} text="temper → tougher" color={C.lithium} w={200} />
      </Reveal>

      {/* age hardening */}
      <Reveal show={visual === "age-hardening"}>
        <Axes box={sBox} xLabel="time" yLabel="T" />
        <DrawPath
          d={ss.path([[0, 0.2], [1, 0.9], [3, 0.9], [3.1, 0.08], [4.5, 0.08], [4.6, 0.45], [9, 0.45], [9.1, 0.08], [10, 0.08]])}
          show={visual === "age-hardening"}
          color={C.electron}
          width={3}
        />
        <Label x={ss.sx(2)} y={ss.sy(0.9) - 8} size={12} color={C.electron}>
          solution treat
        </Label>
        <Label x={ss.sx(3.1) + 4} y={ss.sy(0.62)} anchor="start" size={12} color={C.hot}>
          quench
        </Label>
        <Label x={ss.sx(6.8)} y={ss.sy(0.45) - 8} size={12} color={C.accent}>
          age at low T
        </Label>

        <rect x={330} y={55} width={240} height={150} rx={8} fill={C.graphite} opacity={0.3} stroke={C.dim} />
        {Array.from({ length: 18 }, (_, i) => (
          <rect key={i} x={345 + (i % 6) * 38} y={70 + Math.floor(i / 6) * 42} width={12} height={12} fill={C.anion} opacity={0.9} />
        ))}
        <motion.path
          d="M330 185 Q 400 150 450 170 T 570 150"
          fill="none"
          stroke={C.electron}
          strokeWidth={3}
          initial={false}
          animate={{ d: visual === "age-hardening" ? ["M330 185 Q 400 150 450 170 T 570 150", "M330 180 Q 400 125 450 160 T 570 140", "M330 185 Q 400 150 450 170 T 570 150"] : "M330 185 Q 400 150 450 170 T 570 150" }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <Label x={450} y={225} size={12}>
          coherent zones pin the dislocation (yellow)
        </Label>

        <Axes box={hBox} xLabel="ageing time (log)" yLabel="hardness" />
        <DrawPath d={hard} show={visual === "age-hardening"} color={C.lithium} width={3} delay={0.3} />
        <Label x={hs.sx(0.12)} y={hs.sy(0.5)} size={12} color={C.dim}>
          underaged
        </Label>
        <Label x={hs.sx(0.5)} y={hs.sy(0.95) - 8} anchor="middle" size={12} color={C.lithium} weight={700}>
          peak: coherent precipitates
        </Label>
        <Label x={hs.sx(0.9)} y={hs.sy(0.5)} size={12} color={C.dim}>
          overaged
        </Label>
      </Reveal>
    </Stage>
  );
}
