"use client";

import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

// Tight-binding band E(k) = α + 2β cos(ka) with β = −1 (energy in units of |β|, α = 0).
const band = (x: number) => -2 * Math.cos(x);

// Energy levels of an open chain of N atoms: E_j = −2 cos(jπ/(N+1)).
const chain = (n: number) => Array.from({ length: n }, (_, j) => -2 * Math.cos(((j + 1) * Math.PI) / (n + 1)));

const levelsY = (e: number) => 215 - e * 62;

const dispBox = { x: 100, y: 70, w: 400, h: 270 };
const disp = makeScale(dispBox, [0, Math.PI], [-2.4, 2.4]);
const dispPts = Array.from({ length: 80 }, (_, i) => {
  const x = (i / 79) * Math.PI;
  return [x, band(x)] as [number, number];
});
const freePts = Array.from({ length: 50 }, (_, i) => {
  const x = (i / 49) * 2.1;
  return [x, -2 + x * x] as [number, number];
});

// Width of the band for three interatomic distances (half widths in arbitrary units).
const widths = [
  { a: "a = 3 Å", w: 0.35, color: C.dim },
  { a: "a = 2 Å", w: 1.1, color: C.lfp },
  { a: "a = 1 Å", w: 2.1, color: C.accent },
];
const widthBox = { x: 100, y: 70, w: 400, h: 250 };
const wScale = makeScale(widthBox, [0, Math.PI], [-2.4, 2.4]);

// DOS of the 1D band: g(E) ∝ 1 / sqrt(4 − E²).
const dosE = Array.from({ length: 90 }, (_, i) => -1.93 + (i / 89) * 3.86);
const leftBox = { x: 60, y: 70, w: 190, h: 280 };
const rightBox = { x: 340, y: 70, w: 200, h: 280 };
const kS = makeScale(leftBox, [0, Math.PI], [-2.4, 2.4]);
const dS = makeScale(rightBox, [0, 2.2], [-2.4, 2.4]);

// Fermi–Dirac distribution.
const fermiBox = { x: 90, y: 70, w: 440, h: 270 };
const fScale = makeScale(fermiBox, [-4, 4], [0, 1.1]);
const fd = (x: number, kT: number) => 1 / (1 + Math.exp(x / kT));
const fdPts = (kT: number) =>
  Array.from({ length: 120 }, (_, i) => {
    const x = -4 + (i / 119) * 8;
    return [x, fd(x, kT)] as [number, number];
  });
const boltzPts = Array.from({ length: 60 }, (_, i) => {
  const x = 0.2 + (i / 59) * 3.8;
  return [x, Math.exp(-x / 0.9)] as [number, number];
});

function Rect({ x, y, w, h, fill, stroke, op = 1 }: { x: number; y: number; w: number; h: number; fill: string; stroke?: string; op?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} opacity={op} stroke={stroke ?? fill} strokeWidth={1.5} />;
}

function DopingPanel({ x, title, ef, extra }: { x: number; title: string; ef: number; extra: "none" | "donor" | "acceptor" }) {
  const cbY = 120;
  const vbY = 250;
  return (
    <g>
      <Label x={x + 70} y={70} size={15} weight={700}>
        {title}
      </Label>
      <Rect x={x} y={cbY - 30} w={140} h={30} fill={C.accent} op={0.18} stroke={C.accent} />
      <Rect x={x} y={vbY} w={140} h={46} fill={C.lfp} op={0.7} />
      <line x1={x - 6} y1={ef} x2={x + 146} y2={ef} stroke={C.electron} strokeWidth={2} strokeDasharray="6 4" />
      <Label x={x + 70} y={ef - 6} size={12} color={C.electron}>
        E_F
      </Label>
      {extra === "donor" && (
        <>
          <line x1={x + 30} y1={cbY + 14} x2={x + 110} y2={cbY + 14} stroke={C.cation} strokeWidth={2} />
          <circle cx={x + 70} cy={cbY - 14} r={5} fill={C.electron} />
          <circle cx={x + 90} cy={cbY - 10} r={5} fill={C.electron} />
          <Label x={x + 70} y={cbY + 32} size={12} color={C.cation}>
            donor level
          </Label>
        </>
      )}
      {extra === "acceptor" && (
        <>
          <line x1={x + 30} y1={vbY - 14} x2={x + 110} y2={vbY - 14} stroke={C.anion} strokeWidth={2} />
          <circle cx={x + 70} cy={vbY + 8} r={5} fill="none" stroke={C.ink} strokeWidth={1.5} />
          <circle cx={x + 95} cy={vbY + 12} r={5} fill="none" stroke={C.ink} strokeWidth={1.5} />
          <Label x={x + 70} y={vbY - 22} size={12} color={C.anion}>
            acceptor level
          </Label>
        </>
      )}
      <Label x={x + 70} y={cbY - 38} size={12} color={C.dim}>
        conduction band
      </Label>
      <Label x={x + 70} y={vbY + 64} size={12} color={C.dim}>
        valence band
      </Label>
    </g>
  );
}

const GAP_BARS = [
  { m: "Diamond", eg: 5.4 },
  { m: "Silicon", eg: 1.1 },
  { m: "Germanium", eg: 0.7 },
  { m: "Grey tin", eg: 0 },
];
const barX = (ev: number) => 160 + (ev / 6) * 380;

export default function ElectronicVisual({ visual }: { visual: string }) {
  return (
    <Stage label="Electronic structure of solids">
      {/* why: LiCoO2 vs LiMnO2 */}
      <Reveal show={visual === "why"}>
        <Label x={300} y={44} size={17} weight={700}>
          Why electronic structure matters for cathodes
        </Label>
        <rect x={40} y={80} width={240} height={130} rx={14} fill={C.lfp} opacity={0.14} stroke={C.lfp} />
        <Label x={160} y={112} size={18} weight={800} color={C.lfp}>
          LiCoO₂
        </Label>
        <Label x={160} y={142} size={14}>
          first Li-ion cathode
        </Label>
        <Label x={160} y={166} size={14} color={C.dim}>
          stable, but expensive
        </Label>
        <Label x={160} y={190} size={13} color={C.dim}>
          Nobel Prize 2019
        </Label>
        <rect x={320} y={80} width={240} height={130} rx={14} fill={C.hot} opacity={0.12} stroke={C.hot} />
        <Label x={440} y={112} size={18} weight={800} color={C.hot}>
          LiMnO₂
        </Label>
        <Label x={440} y={142} size={14}>
          cheap alternative
        </Label>
        <Label x={440} y={166} size={14} color={C.dim}>
          layered → spinel on cycling
        </Label>
        <Label x={440} y={190} size={13} color={C.dim}>
          structure not stable
        </Label>
        <line x1={440} y1={214} x2={440} y2={258} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />
        <rect x={110} y={264} width={380} height={96} rx={14} fill="#111a2c" stroke={C.grid} />
        <Label x={300} y={296} size={16} weight={700}>
          Quantum chemistry: the electrons rearrange
        </Label>
        <Label x={300} y={330} size={20} weight={800} color={C.electron}>
          2 Mn³⁺ → Mn²⁺ + Mn⁴⁺
        </Label>
        <Chip x={300} y={410} text="to understand this, we need bands" color={C.accent} w={280} />
      </Reveal>

      {/* levels -> band */}
      <Reveal show={visual === "levels"}>
        <line x1={30} y1={levelsY(-2.4)} x2={30} y2={levelsY(2.4)} stroke={C.dim} strokeWidth={1.5} markerEnd="url(#arrow)" />
        <Label x={20} y={70} size={13} color={C.dim} anchor="start">
          Energy
        </Label>
        {[1, 2, 4, 8].map((n, i) => {
          const x = 70 + i * 100;
          return (
            <g key={n}>
              {(n === 1 ? [0] : chain(n)).map((e, j) => (
                <line key={j} x1={x} y1={levelsY(e)} x2={x + 56} y2={levelsY(e)} stroke={n === 1 ? C.electron : C.accent} strokeWidth={3} strokeLinecap="round" />
              ))}
              <Label x={x + 28} y={levelsY(-2.4) + 28} size={14} weight={700}>
                {n === 1 ? "1 atom" : `${n} atoms`}
              </Label>
            </g>
          );
        })}
        <Rect x={470} y={levelsY(2)} w={90} h={levelsY(-2) - levelsY(2)} fill={C.accent} op={0.25} stroke={C.accent} />
        {Array.from({ length: 24 }, (_, j) => (
          <line key={j} x1={474} y1={levelsY(-2 + (j + 0.5) * (4 / 24))} x2={556} y2={levelsY(-2 + (j + 0.5) * (4 / 24))} stroke={C.accent} strokeWidth={1} opacity={0.7} />
        ))}
        <Label x={515} y={levelsY(-2.4) + 28} size={14} weight={700}>
          ~10²³ atoms
        </Label>
        <Label x={515} y={levelsY(0) + 5} size={16} weight={800} color={C.accent}>
          band
        </Label>
        <Label x={126} y={levelsY(2.2)} size={13} color={C.dim}>
          antibonding
        </Label>
        <Label x={126} y={levelsY(-2.2) + 4} size={13} color={C.dim}>
          bonding
        </Label>
        <Label x={300} y={44} size={16} weight={700}>
          Every added atom adds one more level
        </Label>
      </Reveal>

      {/* E(k) */}
      <Reveal show={visual === "dispersion"}>
        <Axes box={dispBox} xLabel="k" yLabel="E(k)" xLabelDy={64} />
        <line x1={disp.sx(Math.PI)} y1={dispBox.y} x2={disp.sx(Math.PI)} y2={dispBox.y + dispBox.h} stroke={C.dim} strokeDasharray="4 4" />
        <DrawPath d={disp.path(freePts)} show={visual === "dispersion"} color={C.dim} width={2} dash="6 5" />
        <DrawPath d={disp.path(dispPts)} show={visual === "dispersion"} color={C.accent} width={3.5} delay={0.3} />
        <Label x={disp.sx(0)} y={dispBox.y + dispBox.h + 20} size={13} color={C.dim}>
          0
        </Label>
        <Label x={disp.sx(Math.PI)} y={dispBox.y + dispBox.h + 20} size={13} color={C.dim}>
          π/a
        </Label>
        {[0, 1, 2, 3].map((n) => (
          <g key={n}>
            <circle cx={disp.sx(0) + 6 + n * 20} cy={dispBox.y + dispBox.h + 46} r={7} fill={C.lfp} />
            <circle cx={disp.sx(Math.PI) - 66 + n * 20} cy={dispBox.y + dispBox.h + 46} r={7} fill={n % 2 ? "none" : C.lfp} stroke={C.lfp} strokeWidth={1.5} />
          </g>
        ))}
        <Label x={disp.sx(0) + 16} y={dispBox.y + dispBox.h + 74} size={12} color={C.dim} anchor="start">
          k = 0: all in phase, bonding
        </Label>
        <Label x={disp.sx(Math.PI) + 6} y={dispBox.y + dispBox.h + 74} size={12} color={C.dim} anchor="end">
          k = π/a: alternating, antibonding
        </Label>
        <Label x={disp.sx(1.5)} y={dispBox.y + 40} size={14} weight={700} color={C.accent} anchor="start">
          E = α + 2β cos(ka)
        </Label>
        <Label x={disp.sx(1.5)} y={dispBox.y + 62} size={13} color={C.dim} anchor="start">
          free electron: ħ²k²/2m
        </Label>
        <Label x={dispBox.x + 12} y={dispBox.y + 14} size={13} color={C.dim} anchor="start">
          first Brillouin zone
        </Label>
      </Reveal>

      {/* band width and effective mass */}
      <Reveal show={visual === "width"}>
        <Axes box={widthBox} xLabel="k" yLabel="E (atomic level at the dashed line)" />
        <line x1={widthBox.x} y1={wScale.sy(0)} x2={widthBox.x + widthBox.w} y2={wScale.sy(0)} stroke={C.dim} strokeDasharray="4 4" />
        {widths.map((w, i) => (
          <DrawPath
            key={w.a}
            d={wScale.path(
              Array.from({ length: 60 }, (_, j) => {
                const x = (j / 59) * Math.PI;
                return [x, -w.w * Math.cos(x)] as [number, number];
              }),
            )}
            show={visual === "width"}
            color={w.color}
            width={3}
            delay={i * 0.3}
          />
        ))}
        {widths.map((w) => (
          <Label key={w.a} x={wScale.sx(Math.PI) - 8} y={wScale.sy(w.w) - 8} size={13} weight={700} color={w.color} anchor="end">
            {w.a}
          </Label>
        ))}
        <Chip x={190} y={382} text="wide band: small m*, mobile" color={C.accent} w={250} />
        <Chip x={430} y={382} text="narrow band: large m*, poor" color={C.dim} w={250} />
        <Label x={300} y={424} size={14}>
          m* = −ħ² / (2βa²)
        </Label>
      </Reveal>

      {/* density of states */}
      <Reveal show={visual === "dos"}>
        <Axes box={leftBox} xLabel="k" yLabel="E" />
        <Axes box={rightBox} xLabel="DOS" yLabel="E" />
        <DrawPath d={kS.path(Array.from({ length: 60 }, (_, i) => [(i / 59) * Math.PI, band((i / 59) * Math.PI)] as [number, number]))} show={visual === "dos"} color={C.accent} width={3} />
        <DrawPath d={dS.path(dosE.map((e) => [1 / Math.sqrt(4 - e * e), e] as [number, number]))} show={visual === "dos"} color={C.electron} width={3} delay={0.4} />
        <rect x={leftBox.x} y={kS.sy(-1.7)} width={rightBox.x + rightBox.w - leftBox.x} height={kS.sy(-1.9) - kS.sy(-1.7)} fill={C.accent} opacity={0.18} />
        <Label x={leftBox.x + leftBox.w / 2} y={kS.sy(-1.9) + 24} size={12} color={C.dim}>
          same dE
        </Label>
        <Label x={dS.sx(1.1)} y={dS.sy(2.15)} size={13} color={C.electron} weight={700}>
          flat band: many states
        </Label>
        <Label x={dS.sx(0.55)} y={dS.sy(0.5)} size={13} color={C.dim}>
          steep: few states
        </Label>
        <Label x={300} y={44} size={15} weight={700}>
          density of states ∝ 1 / slope of the band
        </Label>
      </Reveal>

      {/* band gap */}
      <Reveal show={visual === "gap"}>
        <g>
          <line x1={50} y1={102} x2={140} y2={102} stroke={C.ink} strokeWidth={3} />
          <Label x={95} y={92} size={13}>
            LUMO
          </Label>
          <line x1={50} y1={188} x2={140} y2={188} stroke={C.ink} strokeWidth={3} />
          <Label x={95} y={208} size={13}>
            HOMO
          </Label>
          <Label x={95} y={238} size={13} color={C.dim}>
            molecule
          </Label>
          <Rect x={300} y={70} w={110} h={36} fill={C.accent} op={0.18} stroke={C.accent} />
          <Rect x={300} y={170} w={110} h={46} fill={C.lfp} op={0.7} />
          <Label x={355} y={94} size={12} color={C.accent}>
            CBM
          </Label>
          <Label x={355} y={198} size={12}>
            VBM
          </Label>
          <line x1={430} y1={170} x2={430} y2={106} stroke={C.hot} strokeWidth={2} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          <Label x={448} y={143} size={16} weight={800} color={C.hot} anchor="start">
            E_g
          </Label>
          <Label x={470} y={90} size={12} color={C.dim} anchor="start">
            conduction band
          </Label>
          <Label x={470} y={194} size={12} color={C.dim} anchor="start">
            valence band
          </Label>
          <Label x={355} y={238} size={13} color={C.dim}>
            solid
          </Label>
        </g>
        <rect x={barX(1.7)} y={262} width={barX(3.1) - barX(1.7)} height={140} fill={C.electron} opacity={0.14} />
        <Label x={(barX(1.7) + barX(3.1)) / 2} y={258} size={12} color={C.electron}>
          visible photons
        </Label>
        {GAP_BARS.map((b, i) => (
          <g key={b.m}>
            <Label x={20} y={290 + i * 34} size={13} anchor="start">
              {b.m}
            </Label>
            <rect x={barX(0)} y={276 + i * 34} width={Math.max(2, barX(b.eg) - barX(0))} height={20} rx={4} fill={C.accent} opacity={0.8} />
            <Label x={barX(b.eg) + 8} y={291 + i * 34} size={13} color={C.dim} anchor="start">
              {`${b.eg.toFixed(1)} eV`}
            </Label>
          </g>
        ))}
        <Label x={barX(0)} y={420} size={12} color={C.dim} anchor="start">
          0
        </Label>
        <Label x={barX(6)} y={420} size={12} color={C.dim} anchor="end">
          6 eV
        </Label>
      </Reveal>

      {/* metals vs non-metals */}
      <Reveal show={visual === "metals"}>
        <Label x={300} y={40} size={15} weight={700}>
          Band filling decides who conducts
        </Label>
        <Rect x={50} y={190} w={100} h={80} fill={C.lfp} op={0.7} />
        <Rect x={50} y={80} w={100} h={80} fill={C.accent} op={0.12} stroke={C.accent} />
        <Label x={100} y={240} size={12} weight={700}>
          full
        </Label>
        <Label x={100} y={124} size={12} color={C.accent}>
          empty
        </Label>
        <Label x={100} y={180} size={12} color={C.hot}>
          band gap
        </Label>
        <Label x={100} y={292} size={13} weight={700}>
          non-metal
        </Label>
        <Label x={100} y={310} size={12} color={C.dim}>
          no free states: no net current
        </Label>
        <Rect x={250} y={80} w={100} h={190} fill={C.accent} op={0.12} stroke={C.accent} />
        <Rect x={250} y={175} w={100} h={95} fill={C.lfp} op={0.7} />
        <line x1={240} y1={175} x2={360} y2={175} stroke={C.electron} strokeWidth={2} strokeDasharray="6 4" />
        <Label x={365} y={180} size={13} color={C.electron} anchor="start">
          Fermi level
        </Label>
        <Label x={300} y={292} size={13} weight={700}>
          metal: partly filled
        </Label>
        <Label x={300} y={310} size={12} color={C.dim}>
          field can shift electrons
        </Label>
        {/* conductivity scale */}
        <line x1={40} y1={372} x2={560} y2={372} stroke={C.dim} strokeWidth={2} />
        {[
          { v: "10⁻²⁰", x: 40 },
          { v: "10⁻⁸", x: 245 },
          { v: "10³", x: 430 },
          { v: "10⁶", x: 560 },
        ].map((t) => (
          <g key={t.v}>
            <line x1={t.x} y1={366} x2={t.x} y2={378} stroke={C.dim} strokeWidth={2} />
            <Label x={t.x} y={396} size={12} color={C.dim}>
              {t.v}
            </Label>
          </g>
        ))}
        <Label x={142} y={360} size={13} color={C.hot} weight={700}>
          insulators
        </Label>
        <Label x={337} y={360} size={13} color={C.electron} weight={700}>
          semiconductors
        </Label>
        <Label x={495} y={360} size={13} color={C.accent} weight={700}>
          metals
        </Label>
        <Label x={300} y={420} size={12} color={C.dim}>
          σ (S/cm) at room temperature
        </Label>
      </Reveal>

      {/* Fermi-Dirac */}
      <Reveal show={visual === "fermi"}>
        <Axes box={fermiBox} xLabel="E − E_F" yLabel="f(E)" />
        <line x1={fScale.sx(0)} y1={fermiBox.y} x2={fScale.sx(0)} y2={fermiBox.y + fermiBox.h} stroke={C.dim} strokeDasharray="4 4" />
        <line x1={fermiBox.x} y1={fScale.sy(0.5)} x2={fermiBox.x + fermiBox.w} y2={fScale.sy(0.5)} stroke={C.grid} strokeDasharray="3 4" />
        <DrawPath d={`M${fScale.sx(-4)},${fScale.sy(1)} L${fScale.sx(0)},${fScale.sy(1)} L${fScale.sx(0)},${fScale.sy(0)} L${fScale.sx(4)},${fScale.sy(0)}`} show={visual === "fermi"} color={C.dim} width={2.5} />
        <DrawPath d={fScale.path(fdPts(0.3))} show={visual === "fermi"} color={C.lfp} width={3} delay={0.3} />
        <DrawPath d={fScale.path(fdPts(0.9))} show={visual === "fermi"} color={C.accent} width={3} delay={0.6} />
        <DrawPath d={fScale.path(boltzPts)} show={visual === "fermi"} color={C.hot} width={2} dash="5 5" delay={0.9} />
        <Label x={fScale.sx(0)} y={fermiBox.y + fermiBox.h + 20} size={13} color={C.electron}>
          E_F
        </Label>
        <Label x={fermiBox.x - 8} y={fScale.sy(0.5) + 4} size={12} color={C.dim} anchor="end">
          ½
        </Label>
        <Label x={fScale.sx(-3.9)} y={fScale.sy(1) - 8} size={12} color={C.dim} anchor="start">
          T = 0: a step
        </Label>
        <Label x={fScale.sx(-1.2)} y={fScale.sy(0.2)} size={12} color={C.lfp} anchor="end">
          warm
        </Label>
        <Label x={fScale.sx(1.1)} y={fScale.sy(0.6)} size={12} color={C.accent} anchor="start">
          hotter
        </Label>
        <Label x={fScale.sx(1.6)} y={fScale.sy(0.18) - 10} size={12} color={C.hot} anchor="start">
          Boltzmann tail
        </Label>
        <Label x={300} y={44} size={14} color={C.dim}>
          occupancy of a level of energy E
        </Label>
      </Reveal>

      {/* doping */}
      <Reveal show={visual === "doping"}>
        <DopingPanel x={30} title="Intrinsic" ef={185} extra="none" />
        <DopingPanel x={230} title="n-type" ef={138} extra="donor" />
        <DopingPanel x={430} title="p-type" ef={236} extra="acceptor" />
        <Chip x={300} y={400} text="E_F tracks the electrochemical potential of the electrons" color={C.electron} w={440} />
      </Reveal>
    </Stage>
  );
}
