"use client";

import { motion } from "framer-motion";
import { C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

const HOST = "#64748b";

/* ---- two-ways lattice ---- */
const GX = (i: number) => 70 + i * 50;
const GY = (j: number) => 90 + j * 50;
const SUB = { i: 6, j: 2 };
const INT = { x: GX(2.5), y: GY(0.5) };

/* ---- Cu–Ni lens thumbnail ---- */
const lBox = { x: 385, y: 95, w: 180, h: 170 };
const ls = makeScale(lBox, [0, 100], [1000, 1500]);
const liquidus = ls.path(Array.from({ length: 21 }, (_, i) => [i * 5, 1085 + 3.7 * i * 5 + 0.009 * i * 5 * (100 - i * 5)] as [number, number]));
const solidus = ls.path(Array.from({ length: 21 }, (_, i) => [i * 5, 1085 + 3.7 * i * 5 - 0.009 * i * 5 * (100 - i * 5)] as [number, number]));

/* ---- carbon in iron ---- */
const R = 42; // Fe radius in px

function Cube({ x, y, s, color = C.dim }: { x: number; y: number; s: number; color?: string }) {
  const d = s * 0.35;
  return (
    <g fill="none" stroke={color} strokeWidth={2}>
      <rect x={x + d} y={y - d} width={s} height={s} opacity={0.5} />
      <rect x={x} y={y} width={s} height={s} />
      {[[0, 0], [s, 0], [0, s], [s, s]].map(([a, b]) => (
        <line key={`${a}-${b}`} x1={x + a} y1={y + b} x2={x + a + d} y2={y + b - d} opacity={0.7} />
      ))}
    </g>
  );
}

export default function SolutionsVisual({ visual }: { visual: string }) {
  const diff = visual === "diffusion-link";
  return (
    <Stage label="Solid solutions">
      {/* two ways in */}
      <Reveal show={visual === "two-ways"}>
        <Label x={300} y={45} size={15} weight={700}>
          Two ways to dissolve an atom
        </Label>
        {Array.from({ length: 35 }, (_, k) => {
          const i = k % 7;
          const j = Math.floor(k / 7);
          const sub = i === SUB.i && j === SUB.j;
          return <circle key={k} cx={GX(i)} cy={GY(j)} r={sub ? 20 : 18} fill={sub ? C.anion : HOST} />;
        })}
        <motion.circle
          cx={INT.x}
          cy={INT.y}
          r={8}
          fill={C.hot}
          initial={false}
          animate={{ scale: visual === "two-ways" ? [1, 1.25, 1] : 1 }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        <line x1={INT.x + 10} x2={430} y1={INT.y} y2={INT.y} stroke={C.hot} strokeDasharray="3 3" />
        <Label x={436} y={INT.y - 4} anchor="start" size={14} weight={700} color={C.hot}>
          interstitial
        </Label>
        <Label x={436} y={INT.y + 14} anchor="start" size={12} color={C.dim}>
          squeezed into a void
        </Label>
        <line x1={GX(SUB.i) + 22} x2={430} y1={GY(SUB.j)} y2={GY(SUB.j)} stroke={C.anion} strokeDasharray="3 3" />
        <Label x={436} y={GY(SUB.j) - 4} anchor="start" size={14} weight={700} color={C.anion}>
          substitutional
        </Label>
        <Label x={436} y={GY(SUB.j) + 14} anchor="start" size={12} color={C.dim}>
          replaces a host atom
        </Label>
        <Label x={220} y={330} size={12} color={C.dim}>
          host crystal (grey)
        </Label>
        <Chip x={300} y={400} text="a solid solution: one crystal, foreign atoms dissolved in it" w={440} />
      </Reveal>

      {/* Hume-Rothery */}
      <Reveal show={visual === "substitutional"}>
        <Label x={190} y={45} size={15} weight={700}>
          Hume-Rothery rules: Cu–Ni
        </Label>
        {[
          { rule: "radii within ~15 %", detail: "Cu 128 pm, Ni 125 pm: ≈ 2 %" },
          { rule: "same crystal structure", detail: "both fcc" },
          { rule: "similar electronegativity", detail: "Cu 1.90, Ni 1.91" },
          { rule: "similar valence", detail: "both typically +2" },
        ].map((r, i) => (
          <motion.g key={r.rule} initial={false} animate={{ opacity: visual === "substitutional" ? 1 : 0 }} transition={{ delay: visual === "substitutional" ? 0.2 + i * 0.25 : 0 }}>
            <circle cx={55} cy={95 + i * 62} r={13} fill={C.lithium} />
            <Label x={55} y={100 + i * 62} size={14} color="#0b1220" weight={800}>
              ✓
            </Label>
            <Label x={78} y={92 + i * 62} anchor="start" size={14} weight={700}>
              {r.rule}
            </Label>
            <Label x={78} y={112 + i * 62} anchor="start" size={12} color={C.dim}>
              {r.detail}
            </Label>
          </motion.g>
        ))}
        <rect x={lBox.x} y={lBox.y} width={lBox.w} height={lBox.h} fill="none" stroke={C.grid} />
        <DrawPath d={liquidus} show={visual === "substitutional"} color={C.hot} width={2.5} />
        <DrawPath d={solidus} show={visual === "substitutional"} color={C.lfp} width={2.5} delay={0.2} />
        <Label x={ls.sx(30)} y={ls.sy(1420)} size={13} color={C.hot} weight={700}>
          L
        </Label>
        <Label x={ls.sx(75)} y={ls.sy(1150)} size={13} color={C.lfp} weight={700}>
          α (fcc)
        </Label>
        <Label x={lBox.x} y={lBox.y + lBox.h + 18} anchor="start" size={12} color={C.dim}>
          Cu
        </Label>
        <Label x={lBox.x + lBox.w} y={lBox.y + lBox.h + 18} anchor="end" size={12} color={C.dim}>
          Ni
        </Label>
        <Label x={lBox.x + lBox.w / 2} y={lBox.y - 10} size={12} color={C.dim}>
          Cu–Ni: one lens
        </Label>
        <Chip x={300} y={400} text="all four met → complete miscibility, Cu₁₋ₓNiₓ for any x" color={C.lithium} w={440} />
      </Reveal>

      {/* interstitial atoms */}
      <Reveal show={visual === "interstitial"}>
        <Label x={300} y={45} size={15} weight={700}>
          Interstitial atoms must be small
        </Label>
        <circle cx={110} cy={150} r={60} fill={HOST} />
        <Label x={110} y={155} size={13} weight={700}>
          Fe
        </Label>
        <Label x={110} y={232} size={12} color={C.dim}>
          host ≈ 126 pm
        </Label>
        {[
          { el: "H", pm: 31, x: 230 },
          { el: "C", pm: 77, x: 320 },
          { el: "N", pm: 71, x: 420 },
          { el: "B", pm: 85, x: 520 },
        ].map((a) => (
          <g key={a.el}>
            <circle cx={a.x} cy={150} r={(a.pm / 126) * 60} fill={a.el === "C" ? C.hot : C.electron} />
            <Label x={a.x} y={155} size={13} weight={700} color="#0b1220">
              {a.el}
            </Label>
            <Label x={a.x} y={232} size={12} color={C.dim}>
              {`≈ ${a.pm} pm`}
            </Label>
          </g>
        ))}
        <Label x={60} y={300} anchor="start" size={14}>
          H in Ti → hydride (TiH₂)
        </Label>
        <Label x={60} y={330} anchor="start" size={14}>
          C in Fe → steel
        </Label>
        <Label x={60} y={360} anchor="start" size={12} color={C.dim}>
          they sit in octahedral or tetrahedral voids
        </Label>
        <Cube x={400} y={290} s={100} />
        {[[400, 290], [500, 290], [400, 390], [500, 390], [435, 255], [535, 255], [435, 355], [535, 355], [450, 340], [485, 305], [417, 322], [517, 322], [467, 272], [467, 372]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill={HOST} />
        ))}
        <circle cx={467} cy={322} r={9} fill={C.hot} />
        <Label x={467} y={420} size={12} color={C.hot}>
          C in the centre: octahedral site
        </Label>
      </Reveal>

      {/* carbon in iron */}
      <Reveal show={visual === "carbon-iron"}>
        <Label x={155} y={42} size={14} weight={700} color={C.lfp}>
          austenite (fcc): octahedral
        </Label>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => (
          <circle key={`${a}${b}`} cx={155 + a * 42 * Math.SQRT1_2 * 1.414} cy={160 + b * 42 * Math.SQRT1_2 * 1.414} r={R} fill={HOST} opacity={0.85} />
        ))}
        <circle cx={155} cy={160} r={0.414 * R} fill={C.lfp} />
        <circle cx={155} cy={160} r={0.62 * R} fill="none" stroke={C.hot} strokeWidth={2} strokeDasharray="4 3" />
        <Label x={155} y={262} size={12}>
          void fits 0.414 R
        </Label>

        <Label x={445} y={42} size={14} weight={700} color={C.electron}>
          ferrite (bcc): tetrahedral
        </Label>
        {[[-50, 21], [50, 21]].map(([a, b]) => (
          <circle key={a} cx={445 + a} cy={160 + b} r={R} fill={HOST} opacity={0.85} />
        ))}
        <circle cx={445} cy={106} r={R} fill={HOST} opacity={0.45} />
        <circle cx={445} cy={160} r={0.291 * R} fill={C.electron} />
        <circle cx={445} cy={160} r={0.62 * R} fill="none" stroke={C.hot} strokeWidth={2} strokeDasharray="4 3" />
        <Label x={445} y={240} size={12}>
          void fits 0.291 R (octahedral 0.155 R)
        </Label>
        <Label x={300} y={110} size={12} color={C.hot}>
          C ≈ 0.62 R
        </Label>
        <Label x={300} y={126} size={12} color={C.hot}>
          (dashed)
        </Label>

        <Chip x={300} y={292} text="carbon strains bcc far more → little dissolves" color={C.hot} w={360} />
        {[
          { name: "γ (fcc)", v: 2.1, color: C.lfp },
          { name: "α (bcc)", v: 0.02, color: C.electron },
        ].map((b, i) => {
          const w = (Math.log10(b.v / 0.01) / 3) * 300;
          return (
            <g key={b.name}>
              <Label x={150} y={337 + i * 28} anchor="end" size={13}>
                {b.name}
              </Label>
              <motion.rect
                x={160}
                y={324 + i * 28}
                height={18}
                rx={4}
                fill={b.color}
                initial={false}
                animate={{ width: visual === "carbon-iron" ? w : 0 }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
              />
              <Label x={168 + w} y={338 + i * 28} anchor="start" size={13} weight={700}>
                {`${b.v} wt % C`}
              </Label>
            </g>
          );
        })}
        {[0.01, 0.1, 1, 10].map((v, i) => (
          <Label key={v} x={160 + i * 100} y={402} size={12} color={C.dim}>
            {v}
          </Label>
        ))}
        <Label x={460} y={422} anchor="end" size={12} color={C.dim}>
          max. solubility, wt % C (log scale)
        </Label>
      </Reveal>

      {/* diffusion link */}
      <Reveal show={diff}>
        {[
          { x0: 40, title: "substitutional: waits for a vacancy", color: C.anion },
          { x0: 320, title: "interstitial: hops void to void", color: C.hot },
        ].map((p) => (
          <g key={p.x0}>
            <Label x={p.x0 + 120} y={55} size={13} weight={700} color={p.color}>
              {p.title}
            </Label>
            {Array.from({ length: 15 }, (_, k) => {
              const i = k % 5;
              const j = Math.floor(k / 5);
              const isVacancy = p.x0 === 40 && i === 3 && j === 1;
              const isAtom = p.x0 === 40 && i === 2 && j === 1;
              if (isVacancy || isAtom) return null;
              return <circle key={k} cx={p.x0 + 20 + i * 50} cy={110 + j * 60} r={18} fill={HOST} />;
            })}
          </g>
        ))}
        <motion.circle
          cx={160}
          cy={170}
          r={18}
          fill="none"
          stroke={C.dim}
          strokeDasharray="4 3"
          initial={false}
          animate={diff ? { cx: [210, 210, 160, 160, 210] } : { cx: 210 }}
          transition={diff ? { duration: 5, times: [0, 0.6, 0.7, 0.9, 1], repeat: Infinity } : { duration: 0 }}
        />
        <motion.circle
          cx={160}
          cy={170}
          r={19}
          fill={C.anion}
          initial={false}
          animate={diff ? { cx: [160, 160, 210, 210, 160] } : { cx: 160 }}
          transition={diff ? { duration: 5, times: [0, 0.6, 0.7, 0.9, 1], repeat: Infinity } : { duration: 0 }}
        />
        <Label x={160} y={268} size={12} color={C.dim}>
          dashed = vacancy; most of the time it waits
        </Label>
        <motion.circle
          r={8}
          fill={C.hot}
          initial={false}
          animate={diff ? { cx: [365, 415, 465, 515, 465, 415, 365], cy: [140, 200, 140, 200, 140, 200, 140] } : { cx: 365, cy: 140 }}
          transition={diff ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        />
        <Label x={440} y={268} size={12} color={C.dim}>
          no vacancy needed, hops constantly
        </Label>
        <Chip x={300} y={330} text="D(interstitial) ≫ D(substitutional)" color={C.hot} w={320} />
        <Label x={300} y={375} size={13}>
          carbon moves fast in steel → carburisation works at all
        </Label>
      </Reveal>

      {/* explorer */}
      <Reveal show={visual === "explore"}>
        <rect x={70} y={90} width={460} height={240} rx={18} fill={C.accent} opacity={0.08} stroke={C.accent} strokeWidth={2} />
        <motion.g initial={false} animate={{ rotate: visual === "explore" ? [0, 8, 0, -8, 0] : 0 }} transition={{ duration: 6, repeat: Infinity }} style={{ originX: "160px", originY: "210px" }}>
          <Cube x={115} y={180} s={80} color={C.accent} />
          <circle cx={155} cy={220} r={6} fill={C.lfp} />
          <circle cx={169} cy={206} r={5} fill={C.electron} />
        </motion.g>
        <Label x={262} y={170} anchor="start" size={15} weight={800} color={C.accent}>
          Interstitial Sites explorer
        </Label>
        <Label x={262} y={205} anchor="start" size={13}>
          rotate fcc and bcc cells
        </Label>
        <Label x={262} y={228} anchor="start" size={13}>
          compare octahedral and
        </Label>
        <Label x={262} y={250} anchor="start" size={13}>
          tetrahedral sites in 3D
        </Label>
        <Label x={300} y={380} size={13} color={C.dim}>
          open it with the link below this slide
        </Label>
      </Reveal>
    </Stage>
  );
}
