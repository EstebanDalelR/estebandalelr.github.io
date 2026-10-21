"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

// ---- potentials diagram (anodes + electrolyte window) ----
const potBox = { x: 70, y: 50, w: 480, h: 340 };
const pot = makeScale(potBox, [0, 1], [0, 5]);
const ANODES = [
  { t: "Li metal", v: 0, c: C.lithium },
  { t: "graphite LiC₆", v: 0.1, c: "#94a3b8" },
  { t: "hard carbon Li₀.₅C₆", v: 0.5, c: "#94a3b8" },
  { t: "LTO", v: 1.5, c: C.cation },
];
const CATHODES = [
  { t: "LFP", v: 3.45, c: C.lfp },
  { t: "NMC", v: 3.7, c: C.lfp },
  { t: "LCO", v: 3.9, c: C.lfp },
  { t: "LNMO", v: 4.7, c: C.lfp },
];

// ---- ternary composition triangle ----
const TRI = { cx: 300, top: 70, base: 360, half: 190 };
const corner = { Co: [TRI.cx, TRI.top], Ni: [TRI.cx - TRI.half, TRI.base], Mn: [TRI.cx + TRI.half, TRI.base] } as const;
const pt = (co: number, ni: number, mn: number): [number, number] => [
  co * corner.Co[0] + ni * corner.Ni[0] + mn * corner.Mn[0],
  co * corner.Co[1] + ni * corner.Ni[1] + mn * corner.Mn[1],
];
const NMC = [
  { t: "LiCoO₂", p: pt(1, 0, 0), a: "start" as const, dx: 12, dy: 0 },
  { t: "LiNiO₂", p: pt(0, 1, 0), a: "end" as const, dx: -10, dy: 20 },
  { t: "LiMnO₂", p: pt(0, 0, 1), a: "start" as const, dx: 10, dy: 20 },
  { t: "NMC 111", p: pt(1 / 3, 1 / 3, 1 / 3), a: "start" as const, dx: 12, dy: 4 },
  { t: "NMC 622", p: pt(0.2, 0.6, 0.2), a: "end" as const, dx: -12, dy: 4 },
  { t: "NMC 811", p: pt(0.1, 0.8, 0.1), a: "end" as const, dx: -12, dy: 4 },
  { t: "NCA", p: pt(0.15, 0.8, 0.05 + 0), a: "start" as const, dx: 12, dy: 18 },
];

// ---- capacity bars ----
const CAP = [
  { t: "graphite (LiC₆)", v: 372, c: "#94a3b8" },
  { t: "tin (Li₄.₄Sn)", v: 994, c: C.copper },
  { t: "silicon (Li₁₅Si₄)", v: 3579, c: C.hot },
  { t: "lithium metal", v: 3860, c: C.lithium },
];

function Lattice({ x, kind }: { x: number; kind: "layered" | "spinel" | "olivine" }) {
  // 150 x 120 sketch: grey = host framework, green dots = Li
  const dots: [number, number][] = [];
  if (kind === "layered") for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) dots.push([x + 15 + c * 30, 205 + r * 40]);
  if (kind === "spinel") for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) dots.push([x + 20 + c * 36, 190 + r * 28 + (c % 2) * 8]);
  if (kind === "olivine") for (let r = 0; r < 5; r++) dots.push([x + 75, 180 + r * 24]);
  return (
    <g>
      <rect x={x} y={165} width={150} height={130} rx={10} fill="#111a2c" stroke={C.grid} />
      {kind === "layered" &&
        [0, 1, 2, 3].map((r) => <rect key={r} x={x + 6} y={178 + r * 40} width={138} height={12} rx={3} fill={C.lfp} opacity={0.7} />)}
      {kind === "spinel" &&
        [0, 1, 2].map((r) => <line key={r} x1={x + 8} y1={196 + r * 28} x2={x + 142} y2={196 + r * 28} stroke={C.lfp} strokeWidth={5} opacity={0.5} />)}
      {kind === "olivine" && (
        <>
          <rect x={x + 6} y={172} width={52} height={116} rx={6} fill={C.lfp} opacity={0.6} />
          <rect x={x + 92} y={172} width={52} height={116} rx={6} fill={C.lfp} opacity={0.6} />
        </>
      )}
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={5} fill={C.lithium} />
      ))}
    </g>
  );
}

const barBox = { x: 150, y: 70, w: 380, h: 200 };

export default function BatteryMaterialsVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  const potentials = is("anodes-insertion") || is("electrolyte");
  return (
    <Stage label="Battery materials">
      {/* why lithium */}
      <Reveal show={is("why-lithium")}>
        <Label x={300} y={40} size={17} weight={700}>
          Why lithium?
        </Label>
        {[
          { t: "Light", s: "small weight", c: C.lithium },
          { t: "Small ion", s: "short ion radius", c: C.cation },
          { t: "−3.04 V", s: "most negative redox potential", c: C.electron },
        ].map((p, i) => (
          <motion.g key={p.t} initial={false} animate={{ opacity: is("why-lithium") ? 1 : 0, x: is("why-lithium") ? 0 : -20 }} transition={{ delay: is("why-lithium") ? i * 0.12 : 0 }}>
            <rect x={40} y={70 + i * 80} width={230} height={64} rx={12} fill={p.c} opacity={0.14} stroke={p.c} />
            <Label x={155} y={100 + i * 80} size={18} weight={800} color={p.c}>
              {p.t}
            </Label>
            <Label x={155} y={122 + i * 80} size={12} color={C.dim}>
              {p.s}
            </Label>
          </motion.g>
        ))}
        <Axes box={{ x: 330, y: 80, w: 230, h: 200 }} xLabel="time" yLabel="Wh/kg" />
        <DrawPath
          d={makeScale({ x: 330, y: 80, w: 230, h: 200 }, [0, 3], [0, 1]).path(Array.from({ length: 40 }, (_, i) => [(i / 39) * 3, Math.pow(2, (i / 39) * 3) / 8] as [number, number]))}
          show={is("why-lithium")}
          color={C.accent}
          width={3.5}
        />
        <Label x={445} y={310} size={13} weight={700} color={C.accent}>
          ×2 every 10 years
        </Label>
        <Label x={445} y={332} size={12} color={C.dim}>
          best cells ≈ 270 Wh/kg
        </Label>
        <Chip x={300} y={400} text="voltage = ΔE of the electrodes · capacity Q = I·t" color={C.electron} w={400} />
      </Reveal>

      {/* families */}
      <Reveal show={is("families")}>
        <Label x={300} y={40} size={17} weight={700}>
          Cathodes: three structural families
        </Label>
        {[
          { x: 20, kind: "layered" as const, t: "Layered oxide", d: "2D diffusion planes", e: "LiCoO₂", p: "high V, high capacity · expensive", c: C.lfp },
          { x: 225, kind: "spinel" as const, t: "Spinel oxide", d: "3D diffusion channels", e: "LiNi₀.₅Mn₁.₅O₄", p: "high V · cheaper", c: C.accent },
          { x: 430, kind: "olivine" as const, t: "Polyanionic", d: "1D diffusion channels", e: "LiFePO₄", p: "high power · cheap", c: C.electron },
        ].map((f) => (
          <g key={f.t}>
            <Label x={f.x + 75} y={80} size={15} weight={700} color={f.c}>
              {f.t}
            </Label>
            <Label x={f.x + 75} y={104} size={12} color={C.dim}>
              {f.d}
            </Label>
            <Label x={f.x + 75} y={140} size={13}>
              {f.e}
            </Label>
            <Lattice x={f.x} kind={f.kind} />
            <Label x={f.x + 75} y={322} size={11} color={C.dim}>
              {f.p}
            </Label>
          </g>
        ))}
        <Chip x={300} y={380} text="Li⁺ moves in and out, host atoms stay put (topotactic)" color={C.lithium} w={420} />
      </Reveal>

      {/* layered: composition triangle */}
      <Reveal show={is("layered")}>
        <polygon points={`${corner.Co.join(",")} ${corner.Ni.join(",")} ${corner.Mn.join(",")}`} fill={C.accent} opacity={0.07} stroke={C.dim} strokeWidth={2} />
        {NMC.map((n) => (
          <g key={n.t}>
            <circle cx={n.p[0]} cy={n.p[1]} r={n.t.startsWith("Li") ? 7 : 5} fill={n.t.startsWith("Li") ? C.electron : C.lithium} />
            <Label x={n.p[0] + n.dx} y={n.p[1] + n.dy} size={12} anchor={n.a} weight={n.t.startsWith("Li") ? 700 : 500}>
              {n.t}
            </Label>
          </g>
        ))}
        <Label x={300} y={48} size={13} weight={700} color={C.lfp}>
          Co: stability, high cost
        </Label>
        <Label x={corner.Ni[0] + 6} y={corner.Ni[1] + 44} size={13} weight={700} color={C.hot} anchor="start">
          Ni: capacity, reactive
        </Label>
        <Label x={corner.Mn[0] - 6} y={corner.Mn[1] + 44} size={13} weight={700} color={C.copper} anchor="end">
          Mn: cheap, unstable
        </Label>
        <Label x={300} y={410} size={13} color={C.dim}>
          LiCoO₂ ≈ 3.9 V, 140–150 mAh/g · NMC 111 ≈ 3.7 V, 170 mAh/g · NCA ≈ 200 mAh/g
        </Label>
      </Reveal>

      {/* spinel / olivine */}
      <Reveal show={is("spinel-olivine")}>
        <Label x={300} y={36} size={16} weight={700}>
          NMC vs LNMO vs LFP
        </Label>
        {[
          { t: "NMC", v: 3.7, q: 170 },
          { t: "LNMO", v: 4.7, q: 147 },
          { t: "LFP", v: 3.45, q: 160 },
        ].map((m, i) => (
          <g key={m.t}>
            <Label x={60} y={86 + i * 34} size={14} weight={700} anchor="start">
              {m.t}
            </Label>
            <rect x={120} y={70 + i * 34} width={(m.v / 5) * 200} height={12} rx={3} fill={C.lfp} opacity={0.85} />
            <Label x={126 + (m.v / 5) * 200} y={81 + i * 34} size={11} color={C.dim} anchor="start">
              {`${m.v} V`}
            </Label>
            <rect x={120} y={84 + i * 34} width={(m.q / 200) * 200} height={12} rx={3} fill={C.lithium} opacity={0.85} />
            <Label x={126 + (m.q / 200) * 200} y={95 + i * 34} size={11} color={C.dim} anchor="start">
              {`${m.q} mAh/g`}
            </Label>
          </g>
        ))}
        {/* 1D channel with antisite defect */}
        <rect x={380} y={64} width={190} height={118} rx={10} fill="#111a2c" stroke={C.grid} />
        <rect x={388} y={72} width={70} height={102} rx={5} fill={C.lfp} opacity={0.5} />
        <rect x={492} y={72} width={70} height={102} rx={5} fill={C.lfp} opacity={0.5} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={475} cy={84 + i * 28} r={5} fill={i === 2 ? C.hot : C.lithium} />
        ))}
        <Label x={475} y={196} size={12} color={C.hot}>
          antisite Fe blocks the 1D channel
        </Label>
        {[
          { t: "carbon coating", s: "poor electronic conductivity", c: C.electron },
          { t: "nanoparticles", s: "slow 1D Li⁺ diffusion", c: C.accent },
          { t: "optimised synthesis", s: "antisite defects", c: C.anion },
        ].map((f, i) => (
          <g key={f.t}>
            <rect x={30 + i * 190} y={236} width={180} height={52} rx={10} fill={f.c} opacity={0.12} stroke={f.c} />
            <Label x={120 + i * 190} y={258} size={13} weight={700} color={f.c}>
              {f.t}
            </Label>
            <Label x={120 + i * 190} y={277} size={11} color={C.dim}>
              {f.s}
            </Label>
          </g>
        ))}
        <Label x={300} y={336} size={15} weight={700}>
          diffusion time t ≈ L² / 4D
        </Label>
        <Label x={300} y={362} size={13} color={C.dim}>
          particle 50× smaller: 2,500× faster
        </Label>
        <Chip x={300} y={406} text="mind the 1D channels: defects matter" color={C.hot} w={290} />
      </Reveal>

      {/* potentials: anodes + electrolyte window */}
      <Reveal show={potentials}>
        <Axes box={potBox} xLabel="" yLabel="V vs Li/Li⁺" />
        <Reveal show={is("electrolyte")}>
          <rect x={potBox.x} y={pot.sy(4)} width={potBox.w} height={pot.sy(1) - pot.sy(4)} fill={C.accent} opacity={0.12} />
          <Label x={potBox.x + potBox.w - 8} y={pot.sy(2.5)} size={14} weight={700} color={C.accent} anchor="end">
            electrolyte stable ≈ 1 – 4 V
          </Label>
          <Label x={potBox.x + potBox.w - 8} y={pot.sy(2.5) + 18} size={12} color={C.dim} anchor="end">
            outside it: decomposition, SEI
          </Label>
        </Reveal>
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <Label key={v} x={potBox.x - 10} y={pot.sy(v) + 4} size={11} color={C.dim} anchor="end">
            {v}
          </Label>
        ))}
        {ANODES.map((a) => (
          <g key={a.t}>
            <line x1={potBox.x + 20} y1={pot.sy(a.v)} x2={potBox.x + 150} y2={pot.sy(a.v)} stroke={a.c} strokeWidth={4} strokeLinecap="round" />
            <Label x={potBox.x + 160} y={pot.sy(a.v) - 3} size={12} anchor="start" color={a.c}>
              {`${a.t} ${a.v} V`}
            </Label>
          </g>
        ))}
        {CATHODES.map((a) => (
          <g key={a.t}>
            <line x1={potBox.x + 260} y1={pot.sy(a.v)} x2={potBox.x + 340} y2={pot.sy(a.v)} stroke={a.c} strokeWidth={4} strokeLinecap="round" />
            <Label x={potBox.x + 350} y={pot.sy(a.v) + 4} size={12} anchor="start" color={a.c}>
              {`${a.t} ${a.v} V`}
            </Label>
          </g>
        ))}
        <Label x={potBox.x + 85} y={potBox.y + potBox.h + 22} size={13} weight={700}>
          negative electrodes
        </Label>
        <Label x={potBox.x + 300} y={potBox.y + potBox.h + 22} size={13} weight={700}>
          positive electrodes
        </Label>
        <Reveal show={is("anodes-insertion")}>
          <Chip x={potBox.x + 300} y={pot.sy(1.2)} text="lower V = more energy, less safe" color={C.dim} w={250} />
        </Reveal>
      </Reveal>

      {/* high capacity anodes */}
      <Reveal show={is("anodes-high")}>
        <Label x={300} y={38} size={16} weight={700}>
          Alloying, conversion and lithium metal
        </Label>
        <Label x={barBox.x + barBox.w / 2} y={62} size={12} color={C.dim}>
          theoretical specific capacity (mAh/g)
        </Label>
        {CAP.map((c, i) => (
          <g key={c.t}>
            <Label x={barBox.x - 10} y={barBox.y + 20 + i * 44} size={13} anchor="end">
              {c.t}
            </Label>
            <rect x={barBox.x} y={barBox.y + 4 + i * 44} width={(c.v / 4000) * barBox.w} height={28} rx={5} fill={c.c} opacity={0.85} />
            <Label x={barBox.x + (c.v / 4000) * barBox.w + 8} y={barBox.y + 24 + i * 44} size={12} color={C.dim} anchor="start">
              {c.v}
            </Label>
          </g>
        ))}
        {[
          { t: "Si, Sn", s: "huge volume change, poor cycle life", c: C.hot },
          { t: "Conversion (MₓXᵧ)", s: "large capacity, voltage hysteresis", c: C.anion },
          { t: "Li metal", s: "dendrites, poor SEI, low CE", c: C.lithium },
        ].map((f, i) => (
          <g key={f.t}>
            <rect x={30 + i * 190} y={286} width={180} height={64} rx={10} fill={f.c} opacity={0.12} stroke={f.c} />
            <Label x={120 + i * 190} y={312} size={13} weight={700} color={f.c}>
              {f.t}
            </Label>
            <Label x={120 + i * 190} y={334} size={11} color={C.dim}>
              {f.s}
            </Label>
          </g>
        ))}
        <Label x={300} y={384} size={13} color={C.dim}>
          fixes: amorphous · porous · small particles · thin films · elastic binders
        </Label>
      </Reveal>

      {/* challenges */}
      <Reveal show={is("challenges")}>
        <Label x={300} y={38} size={16} weight={700}>
          Recurring materials challenges
        </Label>
        {["volume change", "phase transformations", "mechanical degradation", "thermal stability", "critical raw materials: Li, Co, Ni"].map((t, i) => (
          <Chip key={t} x={i < 3 ? 110 + i * 190 : 200 + (i - 3) * 230} y={i < 3 ? 76 : 114} text={t} color={C.hot} w={t.length * 8 + 28} />
        ))}
        {[
          { t: "LFP", d: "1D channels", i: "two-phase reaction, transport limits", c: C.electron },
          { t: "Graphite", d: "2D transport", i: "staging, Li plating, SEI", c: "#94a3b8" },
          { t: "NMC", d: "2D layers", i: "solid solution; cation mixing, cracks, O loss", c: C.lfp },
        ].map((m, i) => (
          <g key={m.t}>
            <rect x={30 + i * 190} y={160} width={180} height={150} rx={14} fill={m.c} opacity={0.12} stroke={m.c} />
            <Label x={120 + i * 190} y={192} size={18} weight={800} color={m.c}>
              {m.t}
            </Label>
            <Label x={120 + i * 190} y={218} size={13}>
              {m.d}
            </Label>
            <Label x={120 + i * 190} y={248} size={11} color={C.dim}>
              {m.i.split(";")[0]}
            </Label>
            {m.i.includes(";") && (
              <Label x={120 + i * 190} y={266} size={11} color={C.dim}>
                {m.i.split(";")[1].trim()}
              </Label>
            )}
          </g>
        ))}
        <Chip x={300} y={366} text="defects · diffusion · phase behaviour: the course in one cell" color={C.accent} w={440} />
      </Reveal>
    </Stage>
  );
}
