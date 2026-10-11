'use client';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type Pt = [number, number];
type Mode = 'cv' | 'ca' | 'cp';
type Cell = { n: number; C: number; D: number }; // C in mM, D in cm²/s
type Run = { v: number; k0: number; n: number; C: number; D: number; pts: Pt[]; peaks: Peaks };
type Peaks = { Epa: number; ipa: number; Epc: number; ipc: number };

// ---- ENGINE START
const F = 96485, RG = 8.314, TK = 298.15;
const f = F / (RG * TK); // 1/V
const AREA = 0.0707; // cm², 3 mm disk electrode
const E0 = 0.25; // V, formal potential of the R/O couple
const EI = -0.15, EV = 0.65; // CV start and vertex potentials
const ALPHA = 0.5;

/* Cyclic voltammetry of R → O + ne⁻, only R in solution at the start.
   Explicit finite differences for semi-infinite linear diffusion (equal D),
   Butler–Volmer at the surface. Large k⁰ gives the reversible (Nernstian) duck. */
function simulateCV(cell: Cell, v: number, k0: number): { pts: Pt[]; peaks: Peaks } {
  const { n, C, D } = cell;
  const tTot = (2 * (EV - EI)) / v, N = 2000, dt = tTot / N;
  const lam = 0.45, dx = Math.sqrt((D * dt) / lam);
  const M = Math.ceil((6 * Math.sqrt(D * tTot)) / dx) + 2;
  let cR = new Float64Array(M).fill(1), cO = new Float64Array(M);
  let nR = new Float64Array(M), nO = new Float64Array(M);
  const scale = n * F * AREA * C * 1e-6 * 1e6; // normalised flux → µA
  const pts: Pt[] = [];
  const peaks: Peaks = { Epa: 0, ipa: -Infinity, Epc: 0, ipc: Infinity };
  for (let k = 1; k <= N; k++) {
    const t = k * dt;
    const fwd = t <= tTot / 2;
    const E = fwd ? EI + v * t : EV - v * (t - tTot / 2);
    for (let j = 1; j < M - 1; j++) {
      nR[j] = cR[j] + lam * (cR[j + 1] - 2 * cR[j] + cR[j - 1]);
      nO[j] = cO[j] + lam * (cO[j + 1] - 2 * cO[j] + cO[j - 1]);
    }
    nR[M - 1] = 1; nO[M - 1] = 0;
    const eta = E - E0;
    const kf = k0 * Math.exp((1 - ALPHA) * n * f * eta), kb = k0 * Math.exp(-ALPHA * n * f * eta);
    // Second-order surface gradient: D(−3c₀ + 4c₁ − c₂)/2Δx = ±J, solved together with Butler–Volmer.
    const a = (4 * nR[1] - nR[2]) / 3, b = (4 * nO[1] - nO[2]) / 3, g = (2 * dx) / (3 * D);
    const J = (kf * a - kb * b) / (1 + (kf + kb) * g);
    nR[0] = a - J * g;
    nO[0] = b + J * g;
    [cR, nR] = [nR, cR];
    [cO, nO] = [nO, cO];
    const i = J * scale;
    if (k % 4 === 0) pts.push([E, i]);
    if (fwd && i > peaks.ipa) { peaks.ipa = i; peaks.Epa = E; }
    if (!fwd && i < peaks.ipc) { peaks.ipc = i; peaks.Epc = E; }
  }
  return { pts, peaks };
}

/* Randles–Ševčík, reversible, 25 °C. µA */
const randlesSevcik = ({ n, C, D }: Cell, v: number) => 0.4463 * n * F * AREA * C * 1e-6 * Math.sqrt((n * F * v * D) / (RG * TK)) * 1e6;

/* Matsuda–Ayabe parameter: Λ ≥ 15 reversible, Λ ≤ 10^-(2(1+α)) irreversible. */
const matsuda = ({ n, D }: Cell, v: number, k0: number) => k0 / Math.sqrt(D * n * f * v);
const regime = (L: number) => (L >= 15 ? 'Reversible' : L <= 10 ** (-2 * (1 + ALPHA)) ? 'Irreversible' : 'Quasi-reversible');

/* Cottrell: potential stepped to the diffusion limit at t = 0. µA */
const cottrellK = ({ n, C, D }: Cell) => n * F * AREA * C * 1e-6 * Math.sqrt(D / Math.PI) * 1e6; // µA·s½
const T_CA = 10;

/* Sand: transition time for a current step i (µA). s */
const sandTau = ({ n, C, D }: Cell, i: number) => ((n * F * AREA * C * 1e-6 * Math.sqrt(Math.PI * D)) / (2 * i * 1e-6)) ** 2;
/* Reversible chronopotentiogram for oxidation of R: E = E_τ/4 + (RT/nF) ln(√t / (√τ − √t)). */
function cpCurve(cell: Cell, tau: number): Pt[] {
  const pts: Pt[] = [];
  const top = E0 + 0.4;
  for (let k = 1; k <= 300; k++) {
    const t = (tau * k) / 300;
    const E = E0 + Math.log(Math.sqrt(t) / Math.max(Math.sqrt(tau) - Math.sqrt(t), 1e-12)) / (cell.n * f);
    if (E > top - 0.08) break;
    pts.push([t, E]);
  }
  // Past τ the surface runs out of R and the potential jumps to the next process.
  pts.push([tau, top - 0.06], [tau * 1.01, top - 0.03], [tau * 1.2, top - 0.02]);
  return pts;
}
// ---- ENGINE END

const niceStep = (span: number, count: number) => {
  const raw = span / count, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
};
const ticks = (lo: number, hi: number, count = 6) => {
  const s = niceStep(hi - lo, count), out: number[] = [];
  for (let t = Math.ceil(lo / s - 1e-9) * s; t <= hi + 1e-9; t += s) out.push(+t.toFixed(10));
  return out;
};
const tickFmt = (t: number) => String(+t.toPrecision(4));
const fx = (v: number, d = 2) => v.toFixed(d);

const COLORS = ['#7fe3c6', '#ffc15e', '#ff8a7a', '#9ab8ff', '#e3a6ff'];

type Series = { pts: Pt[]; color: string; width?: number; dash?: string; opacity?: number };
type Mark = { x: number; y: number; color: string; label?: string; dy?: number };
type VLine = { x: number; label: string };

function Chart(props: {
  xDom: Pt; yDom: Pt; xLabel: string; yLabel: string; series: Series[];
  marks?: Mark[]; vlines?: VLine[]; zeroY?: boolean; children?: ReactNode;
}) {
  const { xDom, yDom, xLabel, yLabel, series, marks = [], vlines = [], zeroY } = props;
  const W = 760, H = 440, ML = 66, MR = 18, MT = 18, MB = 52, PW = W - ML - MR, PH = H - MT - MB;
  // Rounded so server and client agree to the pixel (Math.exp differs in the last bits between engines).
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const sx = (x: number) => r2(ML + ((x - xDom[0]) / (xDom[1] - xDom[0])) * PW);
  const sy = (y: number) => r2(MT + PH - ((y - yDom[0]) / (yDom[1] - yDom[0])) * PH);
  const xt = ticks(xDom[0], xDom[1], 8), yt = ticks(yDom[0], yDom[1], 6);
  const path = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x)},${sy(Math.max(yDom[0], Math.min(yDom[1], y)))}`).join('');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${yLabel} against ${xLabel}`}>
      <defs><clipPath id="ec-plot"><rect x={ML} y={MT} width={PW} height={PH} /></clipPath></defs>
      {yt.map((t) => <line key={`gy${t}`} x1={ML} x2={ML + PW} y1={sy(t)} y2={sy(t)} stroke="var(--ec-line)" />)}
      {xt.map((t) => <line key={`gx${t}`} y1={MT} y2={MT + PH} x1={sx(t)} x2={sx(t)} stroke="var(--ec-line)" />)}
      {zeroY && yDom[0] < 0 && yDom[1] > 0 && <line x1={ML} x2={ML + PW} y1={sy(0)} y2={sy(0)} stroke="var(--ec-muted)" strokeOpacity={0.5} />}
      {vlines.map((l) => (
        <g key={l.label}>
          <line x1={sx(l.x)} x2={sx(l.x)} y1={MT} y2={MT + PH} stroke="var(--ec-hot)" strokeDasharray="4 5" strokeOpacity={0.8} />
          <text x={sx(l.x) - 6} y={MT + 16} textAnchor="end" className="ec-tag" fill="var(--ec-hot)">{l.label}</text>
        </g>
      ))}
      <g clipPath="url(#ec-plot)">
        {series.map((s, i) => (
          <path key={i} d={path(s.pts)} fill="none" stroke={s.color} strokeWidth={s.width ?? 2.4} strokeDasharray={s.dash} strokeOpacity={s.opacity ?? 1} strokeLinejoin="round" strokeLinecap="round" />
        ))}
      </g>
      {marks.map((m, i) => (
        <g key={i}>
          <circle cx={sx(m.x)} cy={sy(m.y)} r={5} fill={m.color} stroke="var(--ec-panel)" strokeWidth={2} />
          {m.label && <text x={sx(m.x) + 9} y={sy(m.y) + (m.dy ?? 4)} className="ec-tag" fill={m.color}>{m.label}</text>}
        </g>
      ))}
      {props.children}
      <rect x={ML} y={MT} width={PW} height={PH} fill="none" stroke="var(--ec-muted)" strokeOpacity={0.6} />
      {xt.map((t) => <text key={`xt${t}`} x={sx(t)} y={MT + PH + 20} textAnchor="middle" className="ec-axis">{tickFmt(t)}</text>)}
      {yt.map((t) => <text key={`yt${t}`} x={ML - 10} y={sy(t) + 4} textAnchor="end" className="ec-axis">{tickFmt(t)}</text>)}
      <text x={ML + PW / 2} y={H - 10} textAnchor="middle" className="ec-axis-title">{xLabel}</text>
      <text transform={`translate(16 ${MT + PH / 2}) rotate(-90)`} textAnchor="middle" className="ec-axis-title">{yLabel}</text>
    </svg>
  );
}

function Slider(p: { label: string; value: string; min: number; max: number; step: number; v: number; set: (v: number) => void }) {
  return (
    <label>
      <span>{p.label} <b className="ec-num">{p.value}</b></span>
      <input type="range" min={p.min} max={p.max} step={p.step} value={p.v} onChange={(e) => p.set(+e.target.value)} />
    </label>
  );
}

const TABS: { id: Mode; name: string; long: string; sub: string }[] = [
  { id: 'cv', name: 'CV', long: 'Cyclic voltammetry', sub: 'Sweep the potential up and back, record the current.' },
  { id: 'ca', name: 'CA', long: 'Chronoamperometry', sub: 'Step the potential, watch the current decay.' },
  { id: 'cp', name: 'CP', long: 'Chronopotentiometry', sub: 'Fix the current, watch the potential climb.' },
];

export default function ElectrochemistryLab() {
  const [mode, setMode] = useState<Mode>('cv');
  const [n, setN] = useState(1);
  const [C, setC] = useState(5); // mM
  const [Dm, setDm] = useState(10); // ×10⁻⁶ cm²/s
  const [logV, setLogV] = useState(Math.log10(50)); // mV/s
  const [logK, setLogK] = useState(0); // cm/s
  const [iStep, setIStep] = useState(50); // µA
  const [cottrellPlot, setCottrellPlot] = useState(false);
  const [pinned, setPinned] = useState<Run[]>([]);

  const cell: Cell = useMemo(() => ({ n, C, D: Dm * 1e-6 }), [n, C, Dm]);
  const vmV = Math.round(10 ** logV), v = vmV / 1000, k0 = 10 ** logK;
  const tab = TABS.find((t) => t.id === mode)!;

  const cv = useMemo(() => simulateCV(cell, v, k0), [cell, v, k0]);
  const ipRS = randlesSevcik(cell, v);
  const L = matsuda(cell, v, k0);

  const K = cottrellK(cell);
  const tau = sandTau(cell, iStep);

  const pin = () => setPinned((p) => [...p, { v: vmV, k0, n, C, D: cell.D, ...cv }].slice(-4));

  const cvChart = () => {
    const all = [cv.pts, ...pinned.map((r) => r.pts)];
    const hi = Math.max(...all.flat().map((p) => p[1])), lo = Math.min(...all.flat().map((p) => p[1]));
    const pad = (hi - lo) * 0.08;
    return (
      <Chart
        xDom={[EI, EV]} yDom={[lo - pad, hi + pad]} xLabel="Potential E (V)" yLabel="Current i (µA)" zeroY
        series={[
          ...pinned.map((r, i) => ({ pts: r.pts, color: COLORS[(i + 1) % COLORS.length], width: 1.6, opacity: 0.7 })),
          { pts: cv.pts, color: COLORS[0] },
        ]}
        marks={[
          { x: cv.peaks.Epa, y: cv.peaks.ipa, color: 'var(--ec-ink)', label: 'Epa' },
          { x: cv.peaks.Epc, y: cv.peaks.ipc, color: 'var(--ec-ink)', label: 'Epc', dy: 16 },
        ]}
        vlines={[{ x: E0, label: "E°'" }]}
      />
    );
  };

  const caChart = () => {
    const pts: Pt[] = [];
    if (cottrellPlot) {
      for (let k = 0; k <= 60; k++) { const s = 0.3 + (k / 60) * (3.2 - 0.3); pts.push([s, K * s]); }
      return (
        <Chart xDom={[0, 3.2]} yDom={[0, K * 3.4]} xLabel="t^(−1/2) (s^(−1/2))" yLabel="Current i (µA)"
          series={[{ pts: [[0, 0], [0.3, K * 0.3]], color: COLORS[0], dash: '4 6', width: 1.6 }, { pts, color: COLORS[0] }]}
          marks={[{ x: 1, y: K, color: 'var(--ec-ink)', label: `t = 1 s · ${fx(K, 1)} µA` }]} />
      );
    }
    for (let k = 1; k <= 400; k++) { const t = (k / 400) * T_CA; pts.push([t, K / Math.sqrt(t)]); }
    return (
      <Chart xDom={[0, T_CA]} yDom={[0, K * 3.4]} xLabel="Time t (s)" yLabel="Current i (µA)"
        series={[{ pts, color: COLORS[1] }]}
        marks={[{ x: 1, y: K, color: 'var(--ec-ink)', label: `${fx(K, 1)} µA at 1 s` }]} />
    );
  };

  const cpChart = () => {
    const pts = cpCurve(cell, tau);
    return (
      <Chart xDom={[0, tau * 1.2]} yDom={[E0 - 0.25, E0 + 0.4]} xLabel="Time t (s)" yLabel="Potential E (V)"
        series={[{ pts, color: COLORS[2] }]}
        marks={[{ x: tau / 4, y: E0, color: 'var(--ec-ink)', label: "E(τ/4) = E°'", dy: 18 }]}
        vlines={[{ x: tau, label: `τ = ${fx(tau, tau < 10 ? 2 : 1)} s` }]} />
    );
  };

  return (
    <div className="ec">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="ec-head">
        <div>
          <h1 className="ec-title">Electrochemistry Lab</h1>
          <p className="ec-sub">{tab.long}. {tab.sub}</p>
        </div>
        <div className="ec-tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={t.id === mode} title={t.long} className={`ec-tab ${t.id === mode ? 'on' : ''}`} onClick={() => setMode(t.id)}>{t.name}</button>
          ))}
        </div>
      </header>

      <div className="ec-grid">
        <div>
          <div className="ec-board">{mode === 'cv' ? cvChart() : mode === 'ca' ? caChart() : cpChart()}</div>

          <div className="ec-sliders">
            {mode === 'cv' && <>
              <Slider label="Scan rate v" value={`${vmV} mV/s`} min={Math.log10(5)} max={3} step={0.01} v={logV} set={setLogV} />
              <Slider label="Rate constant k⁰" value={`${k0 < 0.01 ? k0.toExponential(1) : fx(k0, 2)} cm/s`} min={-5} max={0} step={0.05} v={logK} set={setLogK} />
            </>}
            {mode === 'cp' && <Slider label="Applied current i" value={`${iStep} µA`} min={10} max={300} step={5} v={iStep} set={setIStep} />}
            <Slider label="Concentration C" value={`${C} mM`} min={1} max={20} step={1} v={C} set={setC} />
            <Slider label="Diffusion coefficient D" value={`${Dm} × 10⁻⁶ cm²/s`} min={1} max={30} step={1} v={Dm} set={setDm} />
            <label>
              <span>Electrons n <b className="ec-num">{n}</b></span>
              <span className="ec-row">
                {[1, 2].map((k) => <button key={k} aria-pressed={n === k} className={`ec-btn ${n === k ? 'on' : ''}`} onClick={() => setN(k)}>n = {k}</button>)}
              </span>
            </label>
          </div>
          <p className="ec-foot">
            R → O + ne⁻ at a 3 mm disk (A = 0.0707 cm²), 25 °C, E°&apos; = {E0} V, only R in solution at the start. Semi-infinite linear diffusion with supporting electrolyte, no iR drop, no double-layer charging.
          </p>
        </div>

        <aside>
          {mode === 'cv' && <>
            <section className="ec-card hot">
              <h2 className="ec-h2">{regime(L)}</h2>
              <p className="ec-small">Matsuda–Ayabe Λ = k⁰ / √(D·nfv) = <b className="ec-num">{L < 0.01 ? L.toExponential(1) : fx(L, L < 10 ? 2 : 0)}</b>. Above 15 the electrode keeps up with the sweep; far below 10⁻³ it never does.</p>
            </section>
            <section className="ec-card">
              <table className="ec-table">
                <tbody>
                  <tr><td>E<sub>pa</sub> / E<sub>pc</sub></td><td className="ec-num">{fx(cv.peaks.Epa, 3)} / {fx(cv.peaks.Epc, 3)} V</td></tr>
                  <tr><td>ΔE<sub>p</sub></td><td className="ec-num">{((cv.peaks.Epa - cv.peaks.Epc) * 1000).toFixed(0)} mV <span className="ec-dim">(rev. ≈ {(57 / n).toFixed(0)})</span></td></tr>
                  <tr><td>E<sub>1/2</sub> = (E<sub>pa</sub> + E<sub>pc</sub>)/2</td><td className="ec-num">{fx((cv.peaks.Epa + cv.peaks.Epc) / 2, 3)} V</td></tr>
                  <tr><td>i<sub>pa</sub></td><td className="ec-num">{fx(cv.peaks.ipa, 1)} µA</td></tr>
                  <tr><td>Randles–Ševčík i<sub>p</sub></td><td className="ec-num">{fx(ipRS, 1)} µA</td></tr>
                  <tr><td>|i<sub>pc</sub>| from zero</td><td className="ec-num">{fx(-cv.peaks.ipc, 1)} µA</td></tr>
                </tbody>
              </table>
              <p className="ec-eq">i<sub>p</sub> = 0.4463 nFAC √(nFvD / RT)</p>
              <p className="ec-small">Peak current grows with √v; ΔE<sub>p</sub> stays put while the couple is reversible. Slow k⁰ pushes the peaks apart and shrinks them. |i<sub>pc</sub>| looks small because it should be read from the decaying anodic baseline, not from zero.</p>
            </section>
            <section className="ec-card">
              <h3 className="ec-h3">Compare runs</h3>
              <div className="ec-row">
                <button className="ec-btn" onClick={pin}>Pin this curve</button>
                {pinned.length > 0 && <button className="ec-btn" onClick={() => setPinned([])}>Clear</button>}
              </div>
              {pinned.length > 0 && (
                <table className="ec-table ec-gap">
                  <thead><tr><td>Run</td><td>v</td><td>√v</td><td>i<sub>pa</sub></td><td>ΔE<sub>p</sub></td></tr></thead>
                  <tbody>
                    {pinned.map((r, i) => (
                      <tr key={i}>
                        <td><span className="ec-dot" style={{ background: COLORS[(i + 1) % COLORS.length] }} />{i + 1}</td>
                        <td className="ec-num">{r.v}</td>
                        <td className="ec-num">{fx(Math.sqrt(r.v / 1000), 3)}</td>
                        <td className="ec-num">{fx(r.peaks.ipa, 1)}</td>
                        <td className="ec-num">{((r.peaks.Epa - r.peaks.Epc) * 1000).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="ec-small ec-gap">Pin a few scan rates: if i<sub>pa</sub>/√v stays constant the current is diffusion controlled. Current proportional to v instead means adsorption or capacitive current.</p>
            </section>
          </>}

          {mode === 'ca' && <>
            <section className="ec-card hot">
              <h2 className="ec-h2">Cottrell decay</h2>
              <p className="ec-eq">i(t) = nFAC √(D / πt)</p>
              <p className="ec-small">The step drives the surface concentration of R to zero. The depleted layer grows as √(Dt), so the current falls as 1/√t.</p>
            </section>
            <section className="ec-card">
              <table className="ec-table">
                <tbody>
                  <tr><td>i at 1 s</td><td className="ec-num">{fx(K, 1)} µA</td></tr>
                  <tr><td>i at 10 s</td><td className="ec-num">{fx(K / Math.sqrt(10), 1)} µA</td></tr>
                  <tr><td>Slope of i vs t<sup>−1/2</sup></td><td className="ec-num">{fx(K, 1)} µA·s<sup>1/2</sup></td></tr>
                  <tr><td>Diffusion layer √(πDt) at 10 s</td><td className="ec-num">{fx(Math.sqrt(Math.PI * cell.D * 10) * 1e4, 0)} µm</td></tr>
                </tbody>
              </table>
              <div className="ec-row ec-gap">
                <button aria-pressed={!cottrellPlot} className={`ec-btn ${!cottrellPlot ? 'on' : ''}`} onClick={() => setCottrellPlot(false)}>i vs t</button>
                <button aria-pressed={cottrellPlot} className={`ec-btn ${cottrellPlot ? 'on' : ''}`} onClick={() => setCottrellPlot(true)}>Cottrell plot</button>
              </div>
              <p className="ec-small ec-gap">Plot i against t<sup>−1/2</sup>: a straight line through the origin confirms diffusion control, and its slope nFAC√(D/π) gives D or n.</p>
            </section>
          </>}

          {mode === 'cp' && <>
            <section className="ec-card hot">
              <h2 className="ec-h2">Sand transition time</h2>
              <p className="ec-eq">τ<sup>1/2</sup> = nFAC√(πD) / 2i</p>
              <p className="ec-small">A constant current eats R at the surface at a fixed rate. At τ it hits zero, and the potential shoots up to whatever reaction can carry the current next.</p>
            </section>
            <section className="ec-card">
              <table className="ec-table">
                <tbody>
                  <tr><td>τ</td><td className="ec-num">{fx(tau, tau < 10 ? 2 : 1)} s</td></tr>
                  <tr><td>iτ<sup>1/2</sup></td><td className="ec-num">{fx(iStep * Math.sqrt(tau), 1)} µA·s<sup>1/2</sup></td></tr>
                  <tr><td>Charge passed iτ</td><td className="ec-num">{fx(iStep * tau, 0)} µC</td></tr>
                  <tr><td>E at τ/4</td><td className="ec-num">{fx(E0, 3)} V</td></tr>
                </tbody>
              </table>
              <p className="ec-eq">E = E<sub>τ/4</sub> + (RT/nF) ln[ t<sup>1/2</sup> / (τ<sup>1/2</sup> − t<sup>1/2</sup>) ]</p>
              <p className="ec-small">iτ<sup>1/2</sup> does not change with the current: that is the diffusion control test. Double the current and τ drops by four. For a reversible couple E(τ/4) is the formal potential.</p>
            </section>
          </>}

          <section className="ec-card">
            <p className="ec-small"><b>Exam trap.</b> Randles–Ševčík, Cottrell and Sand all assume semi-infinite diffusion to a flat electrode with supporting electrolyte. A thin porous battery electrode breaks every one of those, so they do not apply to it directly.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;500;600;700&display=swap');
body{margin:0;background:#0f2a47}
.ec{--ec-bg:#0f2a47;--ec-panel:#13345a;--ec-line:rgba(190,215,240,.08);--ec-ink:#eaf2fa;--ec-muted:#8fb0cc;--ec-accent:#7fe3c6;--ec-hot:#ffc15e;
  background:var(--ec-bg);color:var(--ec-ink);font-family:'Barlow Semi Condensed',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
  min-height:100vh;padding:24px max(16px, calc(50% - 600px));line-height:1.45}
.ec *{box-sizing:border-box}
.ec p{margin:0 0 8px;font-size:15px}
.ec-num{font-variant-numeric:tabular-nums}
.ec-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}
.ec-title{font-size:34px;line-height:1;font-weight:700;letter-spacing:-.01em;margin:0 0 6px}
.ec-sub{color:var(--ec-muted)}
.ec-tabs{display:flex;gap:2px;padding:3px;border-radius:10px;border:1px solid var(--ec-line)}
.ec-tab{font:inherit;font-size:15px;font-weight:600;color:var(--ec-muted);background:none;border:0;border-radius:7px;padding:6px 14px;cursor:pointer}
.ec-tab.on{background:var(--ec-ink);color:var(--ec-bg)}
.ec-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:20px;align-items:start}
@media (max-width:920px){.ec-grid{grid-template-columns:1fr}}
.ec-board{border:1px solid var(--ec-line);border-radius:14px;overflow:hidden;background:var(--ec-panel)}
.ec-board svg{display:block;width:100%;height:auto}
.ec-sliders{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:14px 0 10px}
@media (max-width:560px){.ec-sliders{grid-template-columns:1fr}}
.ec-sliders label{display:flex;flex-direction:column;gap:6px;font-size:14px;color:var(--ec-muted)}
.ec-sliders b{color:var(--ec-ink);font-weight:600;margin-left:6px}
.ec-sliders input{width:100%;accent-color:var(--ec-accent)}
.ec-card{padding:12px 16px;border-left:2px solid var(--ec-line);margin-bottom:12px}
.ec-card.hot{border-left-color:var(--ec-hot)}
.ec-h2{font-size:24px;font-weight:700;margin:0 0 8px}
.ec-h3{font-size:16px;font-weight:600;margin:0 0 8px;color:var(--ec-muted)}
.ec-eq{font-size:18px!important;font-weight:600;color:var(--ec-hot);margin:10px 0!important}
.ec-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.ec-gap{margin-top:10px!important}
.ec-btn{font:inherit;font-size:14px;font-weight:500;color:var(--ec-ink);background:transparent;border:1px solid var(--ec-line);border-radius:8px;padding:5px 11px;cursor:pointer}
.ec-btn:hover{border-color:var(--ec-muted)}
.ec-btn.on{background:var(--ec-ink);color:var(--ec-bg);border-color:var(--ec-ink)}
.ec button:focus-visible,.ec input:focus-visible{outline:2px solid var(--ec-hot);outline-offset:2px}
.ec-dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;vertical-align:1px}
.ec-table{width:100%;font-size:15px;border-collapse:collapse}
.ec-table thead td{color:var(--ec-muted);font-size:13px}
.ec-table td{padding:4px 0;border-bottom:1px solid var(--ec-line)}
.ec-table td:not(:first-child){text-align:right}
.ec-dim{color:var(--ec-muted)}
.ec-small{font-size:14px!important;color:var(--ec-muted)}
.ec-small b{color:var(--ec-ink)}
.ec-foot{color:var(--ec-muted);font-size:13px!important}
.ec-axis{font-size:12px;fill:var(--ec-muted);font-family:inherit;font-variant-numeric:tabular-nums}
.ec-axis-title{font-size:14px;fill:var(--ec-muted);font-family:inherit}
.ec-tag{font-size:13px;font-weight:600;font-family:inherit;paint-order:stroke;stroke:var(--ec-panel);stroke-width:3px}
`;
