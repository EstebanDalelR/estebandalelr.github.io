'use client';
import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent as RMouseEvent, ReactNode } from 'react';

/* ───────────────────────── Types ───────────────────────── */

type Pt = [number, number]; // [wt% C, °C]
type DiagramId = 'metastable' | 'stable';
type Opt = { t: string; ok: boolean };
type Q =
  | { kind: 'multi'; topic: Topic; q: string; opts: Opt[]; why: string; figure?: ReactNode }
  | { kind: 'single'; topic: Topic; q: string; opts: Opt[]; why: string }
  | { kind: 'number'; topic: Topic; q: string; answer: number; why: string }
  | { kind: 'order'; topic: Topic; q: string; steps: string[]; why: string }
  | { kind: 'match'; topic: Topic; q: string; left: string[]; right: string[]; answer: number[]; why: string; figure?: ReactNode; renderLeft?: (i: number) => ReactNode }
  | { kind: 'point'; topic: Topic; q: string; diagram: DiagramId; target: Pt; tol: Pt; why: string };
type Topic = 'Fe–C' | 'Phase rules' | 'Cu–Zn' | 'Pb–Sn' | 'Lab' | 'Crystals';
type Answer = number[] | number | string | Pt | null;

/* ───────────────────────── Fe–C diagrams ───────────────────────── */
/* Simplified from the ASM diagrams used in the quiz. Stable = iron–graphite, metastable = iron–cementite. */

type FeC = { name: string; title: string; lines: Pt[][]; labels: { at: Pt; t: string }[]; eut: Pt; eud: Pt; gMax: Pt };

const METASTABLE: FeC = {
  name: 'Metastable · Fe–Fe₃C',
  title: 'The metastable system iron–iron carbide',
  eut: [4.3, 1148], eud: [0.76, 727], gMax: [2.11, 1148],
  lines: [
    [[0, 1538], [0.53, 1495], [4.3, 1148], [6.69, 1227]], // liquidus
    [[0, 1538], [0.09, 1495], [0, 1394]], // δ
    [[0.09, 1495], [0.53, 1495]], // peritectic
    [[0.17, 1495], [2.11, 1148]], // γ solidus
    [[0, 1394], [0.17, 1495]],
    [[2.11, 1148], [6.69, 1148]], // eutectic line
    [[0, 912], [0.76, 727], [2.11, 1148]], // A3 + Acm
    [[0, 912], [0.022, 727]],
    [[0.022, 727], [6.69, 727]], // eutectoid line
    [[0.022, 727], [0, 20]],
    [[6.69, 0], [6.69, 1227]], // Fe3C
  ],
  labels: [
    { at: [2.6, 1400], t: 'L' }, { at: [0.75, 1000], t: 'γ (austenite)' }, { at: [0.25, 450], t: 'α' },
    { at: [3.6, 450], t: 'α + Fe₃C' }, { at: [3.8, 950], t: 'γ + Fe₃C' }, { at: [2.3, 1250], t: 'L + γ' },
  ],
};

const STABLE: FeC = {
  name: 'Stable · Fe–graphite',
  title: 'The stable system iron–graphite',
  eut: [4.26, 1154], eud: [0.68, 738], gMax: [2.08, 1154],
  lines: [
    [[0, 1538], [0.53, 1495], [4.26, 1154], [6.4, 1600]], // liquidus to graphite
    [[0, 1538], [0.09, 1495], [0, 1394]],
    [[0.09, 1495], [0.53, 1495]],
    [[0.17, 1495], [2.08, 1154]],
    [[0, 1394], [0.17, 1495]],
    [[2.08, 1154], [7, 1154]], // eutectic line
    [[0, 912], [0.68, 738], [2.08, 1154]],
    [[0, 912], [0.02, 738]],
    [[0.02, 738], [7, 738]],
    [[0.02, 738], [0, 20]],
  ],
  labels: [
    { at: [1.8, 1420], t: 'L' }, { at: [6.3, 1300], t: 'L + graphite' }, { at: [0.75, 1000], t: 'γ (austenite)' },
    { at: [0.25, 450], t: 'α' }, { at: [3.9, 450], t: 'α + graphite' }, { at: [4, 950], t: 'γ + graphite' },
  ],
};

const FEC: Record<DiagramId, FeC> = { metastable: METASTABLE, stable: STABLE };

const DW = 560, DH = 380, ML = 52, MR = 16, MT = 22, MB = 40;
const PW = DW - ML - MR, PH = DH - MT - MB;
const X1 = 7, T0 = 0, T1 = 1700;
const sx = (x: number) => ML + (x / X1) * PW;
const sy = (T: number) => MT + (1 - (T - T0) / (T1 - T0)) * PH;
const ix = (px: number) => ((px - ML) / PW) * X1;
const iy = (py: number) => T0 + (1 - (py - MT) / PH) * (T1 - T0);

function FeCDiagram({ id, pick, target, reveal, onPick }: { id: DiagramId; pick: Pt | null; target?: Pt; reveal?: boolean; onPick?: (p: Pt) => void }) {
  const d = FEC[id];
  const click = (e: RMouseEvent<SVGSVGElement>) => {
    if (!onPick) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * DW, py = ((e.clientY - r.top) / r.height) * DH;
    if (px < ML || px > ML + PW || py < MT || py > MT + PH) return;
    onPick([ix(px), iy(py)]);
  };
  return (
    <svg viewBox={`0 0 ${DW} ${DH}`} className={`mg-svg ${onPick ? 'pickable' : ''}`} onClick={click} role="img" aria-label={d.title}>
      <rect x={ML} y={MT} width={PW} height={PH} className="mg-plot" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((x) => (
        <text key={x} x={sx(x)} y={MT + PH + 18} textAnchor="middle" className="mg-axis">{x}</text>
      ))}
      {[0, 400, 800, 1200, 1600].map((T) => (
        <text key={T} x={ML - 8} y={sy(T) + 4} textAnchor="end" className="mg-axis">{T}</text>
      ))}
      <text x={ML + PW / 2} y={DH - 6} textAnchor="middle" className="mg-axis">Weight percent carbon</text>
      <text transform={`translate(14 ${MT + PH / 2}) rotate(-90)`} textAnchor="middle" className="mg-axis">Temperature °C</text>
      <text x={ML + 8} y={MT + 16} className="mg-axis strong">{d.title}</text>
      {d.lines.map((l, i) => (
        <polyline key={i} points={l.map(([x, T]) => `${sx(x)},${sy(T)}`).join(' ')} className="mg-line" />
      ))}
      {d.labels.map((l) => (
        <text key={l.t} x={sx(l.at[0])} y={sy(l.at[1])} textAnchor="middle" className="mg-phase">{l.t}</text>
      ))}
      <text x={sx(6.2)} y={sy(d.eut[1]) - 5} textAnchor="middle" className="mg-axis">{d.eut[1]} °C</text>
      <text x={sx(6.2)} y={sy(d.eud[1]) - 5} textAnchor="middle" className="mg-axis">{d.eud[1]} °C</text>
      {reveal && target && <circle cx={sx(target[0])} cy={sy(target[1])} r={11} className="mg-target" />}
      {pick && <circle cx={sx(pick[0])} cy={sy(pick[1])} r={6} className="mg-pick" />}
    </svg>
  );
}

/* ───────────────────────── Pb–Sn microstructures ───────────────────────── */
/* Schematic, like the quiz: grey = Pb-rich α, white = Sn-rich β, stripes = eutectic. */

type Micro = 'A' | 'B' | 'C' | 'D' | 'E';
const BLOBS: Record<'few' | 'many', Pt[]> = { few: [[30, 34], [62, 58], [36, 70]], many: [[24, 28], [52, 22], [70, 50], [30, 60], [56, 76], [42, 44]] };

function Microstructure({ m }: { m: Micro }) {
  const id = `mg-clip-${m}`;
  const stripes = (angle: number, cx: number, cy: number) => (
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-20 + i * 5} y={-20} width={2.4} height={140} fill="#5b6b7d" />)}
    </g>
  );
  return (
    <svg viewBox="0 0 100 100" className="mg-micro" aria-label={`Microstructure ${m}`}>
      <defs><clipPath id={id}><circle cx={50} cy={50} r={46} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        {m === 'A' && (
          <>
            <rect width={100} height={100} fill="#f4f6f8" />
            <path d="M4 40 L40 30 L56 4 M40 30 L48 62 L96 54 M48 62 L30 96 M48 62 L70 96" stroke="#555" strokeWidth={1.5} fill="none" />
            {[[20, 22], [72, 30], [30, 72]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={4} ry={2} fill="#9aa5b1" />)}
          </>
        )}
        {(m === 'B' || m === 'D' || m === 'E') && (
          <>
            <rect width={100} height={100} fill="#eef1f4" />
            <clipPath id={`${id}-a`}><path d="M0 0 L60 0 L40 50 L0 60 Z" /></clipPath>
            <clipPath id={`${id}-b`}><path d="M60 0 L100 0 L100 70 L40 50 Z" /></clipPath>
            <clipPath id={`${id}-c`}><path d="M0 60 L40 50 L100 70 L100 100 L0 100 Z" /></clipPath>
            <g clipPath={`url(#${id}-a)`}>{stripes(35, 30, 30)}</g>
            <g clipPath={`url(#${id}-b)`}>{stripes(-30, 75, 30)}</g>
            <g clipPath={`url(#${id}-c)`}>{stripes(80, 50, 80)}</g>
            {m === 'D' && BLOBS.few.map(([x, y], i) => <rect key={i} x={x - 9} y={y - 7} width={18} height={14} rx={3} fill="#8a96a3" stroke="#444" strokeWidth={0.8} />)}
            {m === 'E' && BLOBS.many.map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={10} ry={7} fill="#ffffff" stroke="#444" strokeWidth={0.8} />)}
          </>
        )}
        {m === 'C' && (
          <>
            <rect width={100} height={100} fill="#9aa5b1" />
            <path d="M4 44 L42 38 L54 4 M42 38 L58 64 L96 58 M58 64 L44 96" stroke="#eef1f4" strokeWidth={5} fill="none" />
            <path d="M4 44 L42 38 L54 4 M42 38 L58 64 L96 58 M58 64 L44 96" stroke="#5b6b7d" strokeWidth={1.2} strokeDasharray="1.5 1.5" fill="none" />
          </>
        )}
      </g>
      <circle cx={50} cy={50} r={46} fill="none" stroke="#444" strokeWidth={1.5} />
    </svg>
  );
}

function PbSnDiagram() {
  const W = 360, H = 200, l = 30, r = 340, t = 20, b = 170;
  const px = (pb: number) => l + ((100 - pb) / 100) * (r - l); // axis runs 100 % Pb → 0 % Pb
  const ty = (T: number) => b - (T / 340) * (b - t);
  const regions: [string, number][] = [['I', 95], ['II', 85], ['III', 55], ['IV', 38.1], ['V', 20], ['VI', 6]];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mg-svg small" aria-label="Pb–Sn phase diagram with regions I to VII">
      <rect x={l} y={t} width={r - l} height={b - t} className="mg-plot" />
      <polyline className="mg-line" points={`${px(100)},${ty(327)} ${px(38.1)},${ty(183)} ${px(0)},${ty(232)}`} />
      <polyline className="mg-line" points={`${px(100)},${ty(327)} ${px(81.7)},${ty(183)} ${px(98)},${ty(0)}`} />
      <polyline className="mg-line" points={`${px(0)},${ty(232)} ${px(2.2)},${ty(183)} ${px(1)},${ty(0)}`} />
      <line className="mg-line" x1={px(81.7)} y1={ty(183)} x2={px(2.2)} y2={ty(183)} />
      <line className="mg-dash" x1={px(81.7)} y1={ty(183)} x2={px(81.7)} y2={b} />
      <line className="mg-dash" x1={px(38.1)} y1={ty(183)} x2={px(38.1)} y2={b} />
      <line className="mg-dash" x1={px(2.2)} y1={ty(183)} x2={px(2.2)} y2={b} />
      {regions.map(([n, pb]) => <text key={n} x={px(pb)} y={ty(140)} textAnchor="middle" className="mg-phase">{n}</text>)}
      <text x={px(0.6)} y={ty(110)} textAnchor="middle" className="mg-axis">VII</text>
      {[100, 80, 60, 40, 20, 0].map((pb) => <text key={pb} x={px(pb)} y={b + 14} textAnchor="middle" className="mg-axis">{pb}</text>)}
      <text x={(l + r) / 2} y={H - 2} textAnchor="middle" className="mg-axis">wt% Pb · eutectic 38 % Pb (62 % Sn), 183 °C</text>
    </svg>
  );
}

/* ───────────────────────── Gibbs stability figure ───────────────────────── */
/* Same shape as the quiz figure: a shallow valley (I), a hump (II), a slope (III) and the deepest valley (IV). */

const gLand = (x: number) => 3.2 * (x - 0.5) ** 2 - 0.55 * Math.exp(-(((x - 0.25) / 0.11) ** 2)) - 0.8 * Math.exp(-(((x - 0.72) / 0.11) ** 2));
const LAND: Pt[] = Array.from({ length: 121 }, (_, i) => [i / 120, gLand(i / 120)]);
const extreme = (a: number, b: number, sign: 1 | -1) => LAND.filter(([x]) => x >= a && x <= b).reduce((best, p) => (sign * p[1] < sign * best[1] ? p : best));
const GIBBS_POINTS: { n: string; p: Pt }[] = [
  { n: 'I', p: extreme(0.1, 0.4, 1) },
  { n: 'II', p: extreme(0.35, 0.6, -1) },
  { n: 'III', p: [0.6, gLand(0.6)] },
  { n: 'IV', p: extreme(0.6, 0.9, 1) },
];

function GibbsFigure() {
  const W = 360, H = 220, l = 40, r = 340, t = 20, b = 180;
  const gx = (x: number) => +(l + x * (r - l)).toFixed(1);
  const gy = (g: number) => +(b - ((g + 0.75) / 1.6) * (b - t)).toFixed(1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mg-svg small" aria-label="Gibbs free energy curve with points I to IV">
      <line x1={l} y1={b} x2={r} y2={b} className="mg-plot" />
      <line x1={l} y1={t} x2={l} y2={b} className="mg-plot" />
      <text transform={`translate(18 ${(t + b) / 2}) rotate(-90)`} textAnchor="middle" className="mg-axis">Gibbs free energy</text>
      <text x={(l + r) / 2} y={H - 14} textAnchor="middle" className="mg-axis">phase space coordinate</text>
      <text x={gx(GIBBS_POINTS[0].p[0])} y={b + 14} textAnchor="middle" className="mg-axis">state A</text>
      <text x={gx(GIBBS_POINTS[3].p[0])} y={b + 14} textAnchor="middle" className="mg-axis">state B</text>
      <polyline points={LAND.map(([x, g]) => `${gx(x)},${gy(g)}`).join(' ')} className="mg-line" />
      {GIBBS_POINTS.map(({ n, p }) => (
        <g key={n}>
          <circle cx={gx(p[0])} cy={gy(p[1]) - 7} r={7} fill="#9aa5b1" stroke="#0b2240" strokeWidth={1.5} />
          <text x={gx(p[0]) + (n === 'III' ? 14 : n === 'IV' ? 18 : 0)} y={n === 'I' ? gy(p[1]) + 18 : n === 'IV' ? gy(p[1]) - 2 : gy(p[1]) - 20} textAnchor="middle" className="mg-phase">{n}</text>
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────────── Questions ───────────────────────── */

const QUESTIONS: Q[] = [
  {
    kind: 'multi', topic: 'Fe–C',
    q: 'In the metastable Fe–C diagram, austenite (γ-Fe) decomposes in the eutectoid reaction into…',
    opts: [{ t: 'Pearlite + cementite', ok: false }, { t: 'δ-Fe + melt', ok: false }, { t: 'Ferrite (α-Fe) + cementite', ok: true }, { t: 'Pearlite + ferrite (α-Fe)', ok: false }],
    why: 'γ (0.76 wt% C) → α (0.022 %) + Fe₃C (6.7 %) at 727 °C. The question asks for phases. Pearlite is the lamellar microstructure those two phases form, not a phase.',
  },
  {
    kind: 'multi', topic: 'Lab',
    q: 'When using a light optical microscope, be sure to…',
    opts: [
      { t: '…adjust the focus on the Bakelite around the sample.', ok: false },
      { t: '…always change the objective revolver at the lowest magnification.', ok: true },
      { t: '…make the diaphragm as small as possible to enhance contrast.', ok: true },
      { t: '…open the diaphragm as much as possible to enhance contrast.', ok: false },
      { t: '…always change the objective revolver at the highest magnification.', ok: false },
      { t: '…take a photo at the magnification which best depicts the region of interest.', ok: true },
    ],
    why: 'Start low: the low-power objective has the longest working distance, so swapping there cannot crash a lens into the sample. Closing the aperture diaphragm raises contrast and depth of field. Focus on the metal, not the mount, and photograph at whatever magnification shows the feature best.',
  },
  {
    kind: 'number', topic: 'Phase rules',
    q: 'Gibbs phase rule: what is the maximum number of phases that can coexist in equilibrium at constant pressure in a 2-component system?',
    answer: 3,
    why: 'At constant pressure F = C − P + 1. The minimum is F = 0, so P = C + 1 = 3. That happens only at invariant points: eutectic, eutectoid, peritectic.',
  },
  {
    kind: 'multi', topic: 'Lab',
    q: 'What can you do to enhance the contrast in metallography?',
    opts: [{ t: 'Increase the magnification', ok: false }, { t: 'Etch the surface', ok: true }, { t: 'Tilt the sample', ok: false }, { t: 'Use polarised light', ok: true }],
    why: 'Magnification enlarges the image but adds no contrast. Etching attacks grains and phases differently. Polarised light separates grains of anisotropic (non-cubic) metals such as Zn.',
  },
  {
    kind: 'multi', topic: 'Lab',
    q: 'How does etching work on metallic samples?',
    opts: [
      { t: 'The etchant reacts differently with grains of different crystallographic orientation or with different phases, which changes how much light each reflects back.', ok: true },
      { t: 'Etching discolours the surface so it is easier to see.', ok: false },
      { t: 'As a last step it gives a smooth, even surface for light absorption.', ok: false },
      { t: 'The etchant roughens the surface to increase light absorption.', ok: false },
    ],
    why: 'The point is selectivity. Grain boundaries and differently oriented grains dissolve at different rates, so they reflect light differently. The key counts a uniform "roughening" as wrong.',
  },
  {
    kind: 'multi', topic: 'Fe–C',
    q: 'An iron sample with 5 wt% C at 900 °C, read from the stable iron–graphite diagram. Which phases does it contain?',
    opts: [{ t: 'Ferrite (α-Fe)', ok: false }, { t: 'Austenite (γ-Fe)', ok: true }, { t: 'Graphite', ok: true }, { t: 'L (melt)', ok: false }, { t: 'δ-Fe', ok: false }],
    why: '900 °C is between the eutectoid (738 °C) and eutectic (1154 °C) lines, right of 2.08 % C. That is the γ + graphite field.',
    figure: <FeCDiagram id="stable" pick={[5, 900]} />,
  },
  {
    kind: 'point', topic: 'Fe–C', diagram: 'metastable', target: METASTABLE.eud, tol: [0.45, 70],
    q: 'Mark the eutectoid point in the metastable Fe–C diagram.',
    why: 'Eutectoid: 0.76 wt% C, 727 °C, where γ → α + Fe₃C. Easy to mix up with the eutectic (4.3 %, 1148 °C), where the liquid freezes.',
  },
  {
    kind: 'point', topic: 'Fe–C', diagram: 'stable', target: STABLE.gMax, tol: [0.45, 70],
    q: 'Mark the maximum solubility of carbon in austenite (stable diagram).',
    why: 'Austenite dissolves the most carbon at the left end of the eutectic line: ≈2.1 wt% C at 1154 °C (2.11 % at 1148 °C in the metastable diagram). That is the steel / cast iron border.',
  },
  {
    kind: 'point', topic: 'Fe–C', diagram: 'metastable', target: METASTABLE.eut, tol: [0.45, 70],
    q: 'Mark the eutectic point in the metastable Fe–C diagram.',
    why: 'Eutectic: 4.3 wt% C, 1148 °C, where L → γ + Fe₃C (ledeburite). A eutectic is liquid → two solids, and it is a local minimum of the liquidus.',
  },
  {
    kind: 'single', topic: 'Cu–Zn',
    q: 'Cu–Zn: which phases are stable at 700 °C for 75 at% Zn / 25 at% Cu? (Cu₅Zn₈ lies at about 58–68 at% Zn; above it the liquid reaches down to about 690 °C.)',
    opts: [
      { t: 'Liquid only', ok: false },
      { t: 'Liquid + Cu₅Zn₈ (γ)', ok: true },
      { t: 'Cu₅Zn₈ only', ok: false },
      { t: 'Cu₀.₇Zn₀.₂ ht + liquid', ok: false },
    ],
    why: 'On the real diagram, 75 at% Zn at 700 °C sits in the two-phase field between the γ (Cu₅Zn₈) field and the liquidus. Two-phase fields are the white gaps between single-phase regions.',
  },
  {
    kind: 'single', topic: 'Cu–Zn',
    q: 'Cu–Zn: where are both (Zn) and Cu₀.₂Zn₀.₈ (ε) stable?',
    opts: [
      { t: 'About 88–97 at% Zn, below 425 °C', ok: true },
      { t: 'About 75–85 at% Zn, above 550 °C', ok: false },
      { t: 'Exactly at 420 °C, pure Zn', ok: false },
      { t: 'About 60–70 at% Zn, at room temperature', ok: false },
    ],
    why: 'The ε + η (Zn) two-phase field lies between the ε field (~80–87 % Zn) and the nearly pure Zn field, below the 425 °C peritectic.',
  },
  {
    kind: 'single', topic: 'Lab',
    q: 'In the lab you compare samples IV5 and IV6 from the Fe–C system. How do they differ?',
    opts: [{ t: 'Different cooling rates', ok: true }, { t: 'Annealed at different temperatures', ok: false }, { t: 'Different compositions', ok: false }],
    why: 'Same steel, different cooling. The microstructure (pearlite spacing, or martensite after quenching) depends on cooling rate. The phase diagram only covers slow, near-equilibrium cooling.',
  },
  {
    kind: 'single', topic: 'Fe–C',
    q: 'Which phase is NOT present in the equilibrium (stable) Fe–C diagram?',
    opts: [{ t: 'Cementite (Fe₃C)', ok: true }, { t: 'Ferrite (α-Fe)', ok: false }, { t: 'Graphite', ok: false }, { t: 'Austenite (γ-Fe)', ok: false }],
    why: 'In true equilibrium the carbon phase is graphite. Cementite is metastable: it forms because it nucleates faster, and it decomposes to graphite only over very long times (or with Si present, as in grey cast iron).',
  },
  {
    kind: 'single', topic: 'Crystals',
    q: 'True or false: HCP is a close-packed structure with the stacking sequence ABABAB… of close-packed layers.',
    opts: [{ t: 'True', ok: true }, { t: 'False', ok: false }],
    why: 'True. HCP stacks ABAB. FCC (ccp) stacks ABCABC. Both reach 74 % packing.',
  },
  {
    kind: 'order', topic: 'Lab',
    q: 'Put the sample preparation steps in order.',
    steps: ['Encapsulate the sample in Bakelite or another mounting plastic', 'Grind with coarse grinding paper', 'Grind with fine grinding paper', 'Polish', 'Etch with a suitable solution, e.g. a weak acid'],
    why: 'Mount → coarse grind → fine grind → polish → etch. You etch last because etching only works on a scratch-free polished surface, and polishing afterwards would remove the etch.',
  },
  {
    kind: 'multi', topic: 'Phase rules',
    q: 'Which statements are true for a eutectic?',
    opts: [
      { t: 'The eutectic transition often gives a lamellar structure.', ok: true },
      { t: 'A eutectic is a local temperature minimum in the phase diagram.', ok: true },
      { t: 'It has a clearly defined melting point.', ok: true },
      { t: 'The eutectic transition often gives dendrites.', ok: false },
      { t: 's₁ → s₂ + s₃', ok: false },
      { t: 'l → s₁ + s₂', ok: true },
      { t: 'A eutectic is a local temperature maximum in the phase diagram.', ok: false },
      { t: 'It has a clearly defined melting interval.', ok: false },
    ],
    why: 'Eutectic = liquid → two solids at a single temperature, at the lowest point of the liquidus, usually as lamellae. s₁ → s₂ + s₃ is a eutectoid. Dendrites belong to primary (pro-eutectic) solidification.',
  },
  {
    kind: 'multi', topic: 'Fe–C',
    q: 'Which statements about pearlite are true?',
    opts: [
      { t: 'Pearlite is a microstructure that contains cementite and ferrite.', ok: true },
      { t: 'Pearlite consists of graphite and ferrite.', ok: false },
      { t: 'Pearlite is a lamellar microstructure.', ok: true },
      { t: 'Pearlite consists of two different phases.', ok: true },
      { t: 'Pearlite is a phase in the Fe–C system.', ok: false },
      { t: 'Pearlite forms when austenite is cooled extremely fast (quenching).', ok: false },
      { t: 'Pearlite consists of ferrite and cementite.', ok: true },
    ],
    why: 'Pearlite = α + Fe₃C lamellae from the eutectoid reaction on slow cooling. It is a microconstituent, not a phase. Quenching gives martensite instead.',
  },
  {
    kind: 'match', topic: 'Pb–Sn',
    q: 'Match each microstructure to its region (II–VI) of the Pb–Sn diagram. Grey = Pb-rich (region I), white = Sn-rich (region VII), stripes = eutectic.',
    left: ['A', 'B', 'C', 'D', 'E'],
    right: ['II', 'III', 'IV', 'V', 'VI'],
    answer: [4, 2, 0, 1, 3],
    renderLeft: (i) => <Microstructure m={(['A', 'B', 'C', 'D', 'E'] as Micro[])[i]} />,
    figure: <PbSnDiagram />,
    why: 'II: Pb grains with a little eutectic at the boundaries (C). III: hypoeutectic, primary Pb in eutectic (D). IV: fully eutectic lamellae (B). V: hypereutectic, primary Sn in eutectic (E). VI: Sn grains with a few Pb precipitates from the solvus (A).',
  },
  {
    kind: 'match', topic: 'Phase rules',
    q: 'Consider the Gibbs free energy diagram. Match I–IV to the different states of equilibrium.',
    figure: <GibbsFigure />,
    left: ['I', 'II', 'III', 'IV'],
    right: ['Stable equilibrium', 'Unstable equilibrium', 'Metastable equilibrium', 'Non-equilibrium'],
    answer: [2, 1, 3, 0],
    why: 'Local minimum = metastable (cementite!). Maximum = unstable. On a slope = not in equilibrium. Global minimum = stable (graphite).',
  },
  {
    kind: 'single', topic: 'Crystals',
    q: 'One lab sample is pure zinc. What crystal structure does Zn have?',
    opts: [{ t: 'bcc', ok: false }, { t: 'ccp', ok: false }, { t: 'hcp', ok: true }, { t: 'bct', ok: false }],
    why: 'Zn is hcp, with an unusually large c/a of about 1.86. Being non-cubic is also why polarised light shows its grains.',
  },
];

/* ───────────────────────── Grading ───────────────────────── */

const shuffle = <T,>(a: T[], seed: number): number[] => {
  const idx = a.map((_, i) => i);
  let s = seed;
  for (let i = idx.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
};

/** Canvas-style partial credit: right picks minus wrong picks, over the number of right options. */
function grade(q: Q, a: Answer): number {
  if (a === null) return 0;
  switch (q.kind) {
    case 'multi': {
      const picked = a as number[];
      const right = q.opts.filter((o) => o.ok).length;
      const hits = picked.filter((i) => q.opts[i].ok).length;
      const misses = picked.length - hits;
      return Math.max(0, (hits - misses) / right);
    }
    case 'single':
      return q.opts[a as number].ok ? 1 : 0;
    case 'number':
      return Number(a) === q.answer ? 1 : 0;
    case 'order':
      return (a as number[]).every((v, i) => v === i) ? 1 : 0;
    case 'match': {
      const m = a as number[];
      return m.filter((v, i) => v === q.answer[i]).length / q.answer.length;
    }
    case 'point': {
      const [x, T] = a as Pt;
      return Math.abs(x - q.target[0]) <= q.tol[0] && Math.abs(T - q.target[1]) <= q.tol[1] ? 1 : 0;
    }
  }
}

const initial = (q: Q, seed: number): Answer => {
  if (q.kind === 'multi') return [];
  if (q.kind === 'order') return shuffle(q.steps, seed + 7);
  if (q.kind === 'match') return q.left.map(() => -1);
  return null;
};

/* ───────────────────────── Question card ───────────────────────── */

function QuestionCard({ q, n, a, setA, checked, seed }: { q: Q; n: number; a: Answer; setA: (a: Answer) => void; checked: boolean; seed: number }) {
  const score = checked ? grade(q, a) : 0;
  const optOrder = useMemo(() => ('opts' in q && q.kind !== 'single' ? shuffle(q.opts, seed + n) : 'opts' in q ? q.opts.map((_, i) => i) : []), [q, seed, n]);
  const state = (ok: boolean, chosen: boolean) => (!checked ? (chosen ? 'chosen' : '') : ok ? 'right' : chosen ? 'wrong' : '');

  let body: ReactNode = null;
  if (q.kind === 'multi' || q.kind === 'single') {
    const picked = q.kind === 'multi' ? (a as number[]) : a === null ? [] : [a as number];
    body = (
      <div className="mg-opts">
        {optOrder.map((i) => {
          const chosen = picked.includes(i);
          return (
            <button
              key={i}
              disabled={checked}
              className={`mg-opt ${state(q.opts[i].ok, chosen)}`}
              onClick={() => setA(q.kind === 'single' ? i : chosen ? picked.filter((p) => p !== i) : [...picked, i])}
            >
              <span className={`mg-box ${q.kind === 'single' ? 'round' : ''}`}>{chosen ? '✓' : ''}</span>
              {q.opts[i].t}
            </button>
          );
        })}
      </div>
    );
  } else if (q.kind === 'number') {
    body = (
      <label className="mg-num">
        <input type="number" disabled={checked} value={(a as string) ?? ''} onChange={(e) => setA(e.target.value)} />
        {checked && <span className={score ? 'ok' : 'bad'}>{score ? '✓' : `✗ correct: ${q.answer}`}</span>}
      </label>
    );
  } else if (q.kind === 'order') {
    const order = a as number[];
    const move = (i: number, d: number) => {
      const next = [...order];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      setA(next);
    };
    body = (
      <ol className="mg-order">
        {order.map((s, i) => (
          <li key={s} className={checked ? (s === i ? 'right' : 'wrong') : ''}>
            <span>{q.steps[s]}</span>
            {checked ? (
              s !== i && <em>should be: {q.steps[i]}</em>
            ) : (
              <span className="mg-arrows">
                <button disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                <button disabled={i === order.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
              </span>
            )}
          </li>
        ))}
      </ol>
    );
  } else if (q.kind === 'match') {
    const m = a as number[];
    body = (
      <div className="mg-match">
        {q.left.map((l, i) => (
          <div key={l} className={`mg-pair ${checked ? (m[i] === q.answer[i] ? 'right' : 'wrong') : ''}`}>
            <div className="mg-left">{q.renderLeft ? q.renderLeft(i) : null}<b>{l}</b></div>
            <select disabled={checked} value={m[i]} onChange={(e) => setA(m.map((v, j) => (j === i ? +e.target.value : v)))}>
              <option value={-1}>choose…</option>
              {q.right.map((r, j) => <option key={r} value={j}>{r}</option>)}
            </select>
            {checked && m[i] !== q.answer[i] && <em>→ {q.right[q.answer[i]]}</em>}
          </div>
        ))}
      </div>
    );
  } else if (q.kind === 'point') {
    const p = a as Pt | null;
    body = (
      <div>
        <FeCDiagram id={q.diagram} pick={p} target={q.target} reveal={checked} onPick={checked ? undefined : (pt) => setA(pt)} />
        <p className="mg-small">{p ? `Your point: ${p[0].toFixed(2)} wt% C, ${p[1].toFixed(0)} °C` : 'Click on the diagram.'}</p>
      </div>
    );
  }

  return (
    <article className={`mg-card ${checked ? (score >= 0.999 ? 'good' : score > 0 ? 'part' : 'bad') : ''}`}>
      <header className="mg-qhead">
        <span className="mg-n">{n + 1}</span>
        <span className="mg-tag">{q.topic}</span>
        {checked && <span className="mg-score">{+score.toFixed(2)} / 1</span>}
      </header>
      <p className="mg-q">{q.q}</p>
      {'figure' in q && q.figure && <div className="mg-figure">{q.figure}</div>}
      {body}
      {checked && <p className="mg-why">{q.why}</p>}
    </article>
  );
}

/* ───────────────────────── Lab notes ───────────────────────── */

const NOTES: { h: string; items: ReactNode[] }[] = [
  {
    h: 'Sample preparation',
    items: [
      <><b>Mount</b> in Bakelite (hot) or epoxy (cold) so you can hold and grind the sample flat.</>,
      <><b>Grind coarse → fine</b> (e.g. P220 → P1200), rotating 90° between papers until the old scratches are gone.</>,
      <><b>Polish</b> with diamond paste or alumina until the surface is a scratch-free mirror.</>,
      <><b>Etch</b> last (Nital for steel). It attacks grain boundaries and phases selectively.</>,
    ],
  },
  {
    h: 'Microscope',
    items: [
      <>Change objectives at the <b>lowest</b> magnification (longest working distance).</>,
      <>Focus on the metal, not on the Bakelite.</>,
      <>A smaller aperture diaphragm gives <b>more contrast</b> and depth of field but less light.</>,
      <>Photograph at the magnification that best shows the feature, and always include a scale bar.</>,
    ],
  },
  {
    h: 'Contrast',
    items: [
      <><b>Etching</b>: grains and phases dissolve at different rates and reflect light differently.</>,
      <><b>Polarised light</b>: shows grains of non-cubic metals such as hcp Zn without etching.</>,
      <>Magnification does <b>not</b> add contrast.</>,
    ],
  },
  {
    h: 'Fe–C numbers',
    items: [
      <>Eutectoid: <b>0.76 % C, 727 °C</b>: γ → α + Fe₃C (pearlite). Stable diagram: 0.68 %, 738 °C.</>,
      <>Eutectic: <b>4.3 % C, 1148 °C</b>: L → γ + Fe₃C (ledeburite). Stable diagram: 4.26 %, 1154 °C.</>,
      <>Max C in γ: <b>2.11 % at 1148 °C</b> (steel / cast iron border). Max C in α: 0.022 % at 727 °C.</>,
      <>Peritectic: 0.17 % C, 1495 °C: δ + L → γ.</>,
    ],
  },
  {
    h: 'Phases vs microconstituents',
    items: [
      <>Phases: <b>α, γ, δ, L, Fe₃C</b> (metastable) or <b>graphite</b> (stable). Cementite is <b>not</b> in the stable diagram.</>,
      <>Microconstituents: <b>pearlite</b> (α + Fe₃C lamellae), ledeburite, proeutectoid ferrite or cementite.</>,
      <>Quenching gives <b>martensite</b>, not pearlite. Samples like IV5 / IV6 differ in <b>cooling rate</b>.</>,
    ],
  },
  {
    h: 'Phase rule and invariants',
    items: [
      <>F = C − P + 1 at fixed pressure. Binary: <b>max 3 phases</b>, only at invariant points.</>,
      <>Eutectic l → s₁ + s₂ (local minimum, lamellae). Eutectoid s₁ → s₂ + s₃. Peritectic s₁ + l → s₂.</>,
      <>Gibbs curve: global minimum = stable, local minimum = metastable, maximum = unstable, slope = not in equilibrium.</>,
    ],
  },
  {
    h: 'Crystals',
    items: [<>hcp: ABAB… (Zn, Mg, Ti). fcc / ccp: ABCABC… (Cu, Al, γ-Fe). bcc (α-Fe) is not close packed.</>],
  },
];

/* ───────────────────────── Page ───────────────────────── */

const STORE = 'battery-masters:metallography';
type Saved = { best: number; missed: number[] };

export default function Metallography() {
  const [tab, setTab] = useState<'quiz' | 'notes'>('quiz');
  const [seed, setSeed] = useState(1);
  const [only, setOnly] = useState<number[] | null>(null);
  const [answers, setAnswers] = useState<Answer[]>(() => QUESTIONS.map((q) => initial(q, 1)));
  const [checked, setChecked] = useState(false);
  const [saved, setSaved] = useState<Saved | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  const shown = only ?? QUESTIONS.map((_, i) => i);
  const scores = shown.map((i) => grade(QUESTIONS[i], answers[i]));
  const total = scores.reduce((s, v) => s + v, 0);

  const check = () => {
    setChecked(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (only) return;
    const missed = shown.filter((_, k) => scores[k] < 0.999);
    const next = { best: Math.max(saved?.best ?? 0, total), missed };
    setSaved(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {}
  };

  const restart = (subset: number[] | null) => {
    const s = seed + 1;
    setSeed(s);
    setOnly(subset);
    setAnswers(QUESTIONS.map((q) => initial(q, s)));
    setChecked(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const missedNow = shown.filter((_, k) => scores[k] < 0.999);

  return (
    <div className="mg">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="mg-head">
        <div>
          <p className="mg-kicker">Materials Chemistry · lab 1</p>
          <h1 className="mg-title">Metallography Lab</h1>
          <p className="mg-sub">The pre-lab quiz with explanations, plus a one-page cheat sheet for the lab.</p>
        </div>
        <div className="mg-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'quiz'} className={tab === 'quiz' ? 'on' : ''} onClick={() => setTab('quiz')}>Practice</button>
          <button role="tab" aria-selected={tab === 'notes'} className={tab === 'notes' ? 'on' : ''} onClick={() => setTab('notes')}>Lab notes</button>
        </div>
      </header>

      {tab === 'notes' ? (
        <div className="mg-notes">
          {NOTES.map((s) => (
            <section key={s.h} className="mg-note">
              <h2>{s.h}</h2>
              <ul>{s.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
            </section>
          ))}
        </div>
      ) : (
        <>
          <div className="mg-bar">
            {checked ? (
              <>
                <b className="mg-big">{+total.toFixed(2)} / {shown.length}</b>
                <span>{Math.round((total / shown.length) * 100)} %</span>
                {missedNow.length > 0 && <button className="mg-btn on" onClick={() => restart(missedNow)}>Retry the {missedNow.length} I missed</button>}
                <button className="mg-btn" onClick={() => restart(null)}>Start over</button>
              </>
            ) : (
              <>
                <span>{only ? `Retrying ${only.length} questions` : `${QUESTIONS.length} questions · partial credit like Canvas`}</span>
                {saved && !only && <span className="mg-small">best {+saved.best.toFixed(2)} / {QUESTIONS.length}</span>}
                {saved && saved.missed.length > 0 && !only && (
                  <button className="mg-btn" onClick={() => restart(saved.missed)}>Only last time's misses ({saved.missed.length})</button>
                )}
              </>
            )}
          </div>

          {shown.map((i) => (
            <QuestionCard
              key={`${seed}-${i}`}
              q={QUESTIONS[i]}
              n={i}
              a={answers[i]}
              setA={(v) => setAnswers((all) => all.map((x, j) => (j === i ? v : x)))}
              checked={checked}
              seed={seed}
            />
          ))}

          {!checked && (
            <button className="mg-btn on mg-check" onClick={check}>Check answers</button>
          )}
        </>
      )}
      <p className="mg-foot">Diagrams simplified from ASM / Callister. Questions follow the course's pre-lab quiz.</p>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;500;600;700&display=swap');
body{margin:0;background:#0f2a47}
.mg{--bg:#0f2a47;--panel:#13345a;--line:rgba(190,215,240,.12);--ink:#eaf2fa;--muted:#8fb0cc;--accent:#7fe3c6;--hot:#ffc15e;--bad:#ff7a7a;
  background:var(--bg);color:var(--ink);font-family:'Barlow Semi Condensed',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
  min-height:100vh;padding:24px max(16px, calc(50% - 420px));line-height:1.45}
.mg *{box-sizing:border-box}
.mg p{margin:0 0 8px;font-size:16px}
.mg-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}
.mg-kicker{color:var(--accent);font-size:13px!important;letter-spacing:.12em;text-transform:uppercase}
.mg-title{font-size:34px;line-height:1;font-weight:700;margin:0 0 6px}
.mg-sub,.mg-small,.mg-foot{color:var(--muted)}
.mg-small{font-size:14px!important}
.mg-foot{font-size:13px!important;margin-top:24px!important}
.mg-tabs{display:flex;gap:2px;padding:3px;border-radius:10px;border:1px solid var(--line)}
.mg-tabs button{font:inherit;font-size:15px;font-weight:600;color:var(--muted);background:none;border:0;border-radius:7px;padding:6px 14px;cursor:pointer}
.mg-tabs button.on{background:var(--ink);color:var(--bg)}
.mg-bar{position:sticky;top:0;z-index:5;display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:10px 0;margin-bottom:8px;background:var(--bg);border-bottom:1px solid var(--line)}
.mg-big{font-size:24px}
.mg-btn{font:inherit;font-size:15px;font-weight:600;color:var(--ink);background:transparent;border:1px solid var(--line);border-radius:8px;padding:6px 12px;cursor:pointer}
.mg-btn:hover{border-color:var(--muted)}
.mg-btn.on{background:var(--accent);color:var(--bg);border-color:var(--accent)}
.mg-check{display:block;margin:20px auto 0;font-size:18px;padding:10px 26px}
.mg button:focus-visible,.mg input:focus-visible,.mg select:focus-visible{outline:2px solid var(--hot);outline-offset:2px}
.mg-card{background:var(--panel);border:1px solid var(--line);border-left:3px solid var(--line);border-radius:12px;padding:16px;margin:14px 0}
.mg-card.good{border-left-color:var(--accent)}
.mg-card.part{border-left-color:var(--hot)}
.mg-card.bad{border-left-color:var(--bad)}
.mg-qhead{display:flex;gap:10px;align-items:center;margin-bottom:8px}
.mg-n{background:var(--ink);color:var(--bg);font-weight:700;border-radius:6px;padding:0 8px}
.mg-tag{color:var(--muted);font-size:13px;text-transform:uppercase;letter-spacing:.08em}
.mg-score{margin-left:auto;font-weight:600}
.mg-q{font-size:17px!important;font-weight:500}
.mg-figure{margin:8px 0 12px}
.mg-opts{display:flex;flex-direction:column;gap:6px}
.mg-opt{font:inherit;font-size:15px;text-align:left;color:var(--ink);background:transparent;border:1px solid var(--line);border-radius:8px;padding:8px 10px;cursor:pointer;display:flex;gap:10px;align-items:flex-start}
.mg-opt:disabled{cursor:default}
.mg-opt.chosen{border-color:var(--muted);background:rgba(255,255,255,.04)}
.mg-opt.right{border-color:var(--accent);background:rgba(127,227,198,.1)}
.mg-opt.wrong{border-color:var(--bad);background:rgba(255,122,122,.1)}
.mg-box{flex:none;width:18px;height:18px;border:1.5px solid var(--muted);border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;margin-top:2px}
.mg-box.round{border-radius:50%}
.mg-num{display:flex;gap:12px;align-items:center}
.mg-num input{font:inherit;font-size:18px;width:100px;padding:6px 10px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}
.mg-num .ok{color:var(--accent)} .mg-num .bad{color:var(--bad)}
.mg-order{list-style:none;padding:0;margin:0;counter-reset:s}
.mg-order li{counter-increment:s;display:flex;gap:10px;align-items:center;flex-wrap:wrap;border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin-bottom:6px}
.mg-order li::before{content:counter(s);color:var(--muted);font-weight:700;width:14px}
.mg-order li.right{border-color:var(--accent)} .mg-order li.wrong{border-color:var(--bad)}
.mg-order em,.mg-pair em{color:var(--hot);font-style:normal;font-size:14px}
.mg-arrows{margin-left:auto;display:flex;gap:4px}
.mg-arrows button{font:inherit;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:6px;width:30px;height:28px;cursor:pointer}
.mg-arrows button:disabled{opacity:.3;cursor:default}
.mg-match{display:flex;flex-direction:column;gap:8px}
.mg-pair{display:flex;gap:12px;align-items:center;flex-wrap:wrap;border:1px solid var(--line);border-radius:8px;padding:6px 10px}
.mg-pair.right{border-color:var(--accent)} .mg-pair.wrong{border-color:var(--bad)}
.mg-left{display:flex;gap:10px;align-items:center;min-width:140px}
.mg-pair select{font:inherit;font-size:15px;padding:5px 8px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}
.mg-micro{width:64px;height:64px;flex:none}
.mg-why{margin-top:12px!important;padding:10px 12px;border-radius:8px;background:rgba(255,193,94,.08);border-left:2px solid var(--hot);font-size:15px!important}
.mg-svg{display:block;width:100%;height:auto;max-width:620px;background:#0b2240;border-radius:10px;user-select:none}
.mg-svg.small{max-width:420px}
.mg-svg.pickable{cursor:crosshair}
.mg-plot{fill:none;stroke:var(--muted);stroke-opacity:.5}
.mg-line{fill:none;stroke:var(--ink);stroke-width:1.6}
.mg-dash{stroke:var(--muted);stroke-dasharray:3 3}
.mg-axis{font-size:11px;fill:var(--muted);font-family:inherit}
.mg-axis.strong{fill:var(--ink);font-weight:600}
.mg-phase{font-size:13px;font-weight:600;fill:var(--ink);font-family:inherit}
.mg-pick{fill:var(--hot);stroke:var(--bg);stroke-width:2}
.mg-target{fill:rgba(127,227,198,.35);stroke:var(--accent);stroke-width:2}
.mg-notes{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}
.mg-note{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.mg-note h2{font-size:18px;margin:0 0 8px;color:var(--accent)}
.mg-note ul{margin:0;padding-left:18px}
.mg-note li{margin-bottom:6px;font-size:15px}
`;
