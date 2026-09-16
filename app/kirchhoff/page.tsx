'use client';
import { useState, useMemo } from 'react';

/* ---------------------------------------------------------------- grid */
const COLS = 7, ROWS = 5, SP = 90, PAD = 48;
const VW = PAD * 2 + (COLS - 1) * SP;
const VH = PAD * 2 + (ROWS - 1) * SP;
const PREFIX = { R: 'R', V: 'Vs', I: 'Is' };
const UNIT = { R: 'Ω', V: 'V', I: 'A' };
const DEFAULTS = { R: 4, V: 12, I: 1 };

const nid = (x, y) => y * COLS + x;
const nxy = (id) => [id % COLS, Math.floor(id / COLS)];
const pos = (id) => { const [x, y] = nxy(id); return [PAD + x * SP, PAD + y * SP]; };
const nodeName = (id) => { const [x, y] = nxy(id); return String.fromCharCode(65 + x) + (y + 1); };
const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const fmt = (v) => (Math.abs(v) < 1e-9 ? '0' : String(+v.toFixed(3)));
let uid = 0;

// ---- ENGINE START
function gauss(A, z) {
  const N = z.length;
  for (let col = 0; col < N; col++) {
    let piv = col, best = Math.abs(A[col][col]);
    for (let r = col + 1; r < N; r++) { const v = Math.abs(A[r][col]); if (v > best) { best = v; piv = r; } }
    if (best < 1e-10) return null;
    if (piv !== col) { [A[col], A[piv]] = [A[piv], A[col]]; [z[col], z[piv]] = [z[piv], z[col]]; }
    for (let r = col + 1; r < N; r++) {
      const f = A[r][col] / A[col][col];
      if (!f) continue;
      for (let k = col; k < N; k++) A[r][k] -= f * A[col][k];
      z[r] -= f * z[col];
    }
  }
  const x = new Array(N).fill(0);
  for (let r = N - 1; r >= 0; r--) {
    let s = z[r];
    for (let k = r + 1; k < N; k++) s -= A[r][k] * x[k];
    x[r] = s / A[r][r];
  }
  return x;
}

/* Modified nodal analysis. Wires are ideal: merged into nets, their currents
   recovered afterwards from KCL over a spanning tree of each wire net. */
function solve(comps) {
  if (!comps.length) return { ok: false, empty: true, msg: 'Board is empty. Click between two dots to place a part.' };
  const parent = new Map();
  const find = (n) => {
    if (!parent.has(n)) parent.set(n, n);
    let r = n;
    while (parent.get(r) !== r) r = parent.get(r);
    parent.set(n, r);
    return r;
  };
  const wires = comps.filter((c) => c.type === 'W');
  const parts = comps.filter((c) => c.type !== 'W');
  comps.forEach((c) => { find(c.a); find(c.b); });
  wires.forEach((w) => parent.set(find(w.a), find(w.b)));
  const net = (n) => find(n);

  for (const c of parts) {
    if (c.type === 'V' && net(c.a) === net(c.b) && c.value !== 0)
      return { ok: false, msg: `Short circuit: a wire connects both terminals of ${c.name}.` };
  }

  const nets = [...new Set(comps.flatMap((c) => [net(c.a), net(c.b)]))];
  const ip = new Map(nets.map((n) => [n, n]));
  const ifind = (n) => { while (ip.get(n) !== n) n = ip.get(n); return n; };
  parts.forEach((c) => { const x = ifind(net(c.a)), y = ifind(net(c.b)); if (x !== y) ip.set(x, y); });
  const ground = new Map();
  parts.forEach((c) => { if (c.type === 'V') { const r = ifind(net(c.a)); if (!ground.has(r)) ground.set(r, net(c.a)); } });
  nets.forEach((n) => { const r = ifind(n); if (!ground.has(r)) ground.set(r, n); });
  const groundNets = new Set(ground.values());

  const idx = new Map();
  let n = 0;
  nets.forEach((nt) => { if (!groundNets.has(nt)) idx.set(nt, n++); });
  const vs = parts.filter((c) => c.type === 'V');
  const N = n + vs.length;
  const A = Array.from({ length: N }, () => new Array(N).fill(0));
  const z = new Array(N).fill(0);

  parts.forEach((c) => {
    const i = idx.get(net(c.a)), j = idx.get(net(c.b));
    if (c.type === 'R') {
      if (net(c.a) === net(c.b)) return;
      const g = 1 / c.value;
      if (i !== undefined) A[i][i] += g;
      if (j !== undefined) A[j][j] += g;
      if (i !== undefined && j !== undefined) { A[i][j] -= g; A[j][i] -= g; }
    } else if (c.type === 'I') {
      if (i !== undefined) z[i] -= c.value;
      if (j !== undefined) z[j] += c.value;
    }
  });
  vs.forEach((c, k) => {
    const r = n + k, i = idx.get(net(c.a)), j = idx.get(net(c.b));
    if (i !== undefined) { A[i][r] += 1; A[r][i] -= 1; }
    if (j !== undefined) { A[j][r] -= 1; A[r][j] += 1; }
    z[r] = c.value;
  });

  const x = N ? gauss(A, z) : [];
  if (!x) return { ok: false, msg: 'Unsolvable: a current source has no return path, or voltage sources are in parallel.' };

  const vNet = (nt) => (idx.has(nt) ? x[idx.get(nt)] : 0);
  const volt = {};
  comps.forEach((c) => { volt[c.a] = vNet(net(c.a)); volt[c.b] = vNet(net(c.b)); });

  const res = {};
  parts.forEach((c) => {
    const V = volt[c.a] - volt[c.b];
    const I = c.type === 'R' ? V / c.value : c.type === 'I' ? c.value : x[n + vs.indexOf(c)];
    res[c.id] = { I, V };
  });

  // wire currents: required wire outflow at each point = -(outflow through parts)
  const inj = new Map();
  parts.forEach((c) => {
    const I = res[c.id].I;
    inj.set(c.a, (inj.get(c.a) || 0) + I);
    inj.set(c.b, (inj.get(c.b) || 0) - I);
  });
  const adj = new Map();
  wires.forEach((w) => {
    res[w.id] = { I: 0, V: 0 };
    [[w.a, w.b], [w.b, w.a]].forEach(([p, q]) => { if (!adj.has(p)) adj.set(p, []); adj.get(p).push([q, w]); });
  });
  const seen = new Set();
  for (const start of adj.keys()) {
    if (seen.has(start)) continue;
    const order = [start], par = new Map();
    seen.add(start);
    for (let k = 0; k < order.length; k++) {
      for (const [q, w] of adj.get(order[k])) if (!seen.has(q)) { seen.add(q); par.set(q, [order[k], w]); order.push(q); }
    }
    const acc = new Map(order.map((p) => [p, -(inj.get(p) || 0)]));
    for (let k = order.length - 1; k > 0; k--) {
      const p = order[k], [pp, w] = par.get(p), o = acc.get(p);
      res[w.id].I = w.a === p ? o : -o;
      acc.set(pp, acc.get(pp) + o);
    }
  }

  return { ok: true, res, volt, groundNames: [...groundNets].map(nodeName).join(', ') };
}

/* spec: ['W', [x,y], [x,y], ...] polyline of wires, or [type, [x,y] a, [x,y] b, value] */
function build(spec) {
  const comps = [], counts = { R: 0, V: 0, I: 0 };
  let i = 0;
  const add = (type, a, b, value) => {
    const c = { id: `c${i++}`, type, a, b };
    if (type !== 'W') { counts[type]++; c.value = value; c.name = PREFIX[type] + counts[type]; }
    comps.push(c);
  };
  spec.forEach((s) => {
    if (s[0] === 'W') {
      const pts = s.slice(1);
      for (let k = 0; k < pts.length - 1; k++) {
        let [x1, y1] = pts[k];
        const [x2, y2] = pts[k + 1];
        const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
        while (x1 !== x2 || y1 !== y2) { add('W', nid(x1, y1), nid(x1 + dx, y1 + dy)); x1 += dx; y1 += dy; }
      }
    } else {
      const [t, [x1, y1], [x2, y2], v] = s;
      add(t, nid(x1, y1), nid(x2, y2), v);
    }
  });
  return comps;
}

const LEVELS = [
  {
    title: "Ohm's law",
    concept: 'Current through a resistor equals the voltage across it divided by its resistance: I = V / R.',
    hint: 'All 12 V of the source sits across the 4 Ω resistor.',
    q: { kind: 'I', target: 'R1' },
    spec: [['V', [1, 3], [1, 2], 12], ['W', [1, 2], [1, 1], [3, 1]], ['R', [3, 1], [4, 1], 4], ['W', [4, 1], [5, 1], [5, 3], [1, 3]]],
  },
  {
    title: 'Series',
    concept: 'Parts in series carry the same current. Voltage drops around a closed loop add up to the source voltage (KVL).',
    hint: 'Loop current I = 12 / (2 + 4). Then V = I · R2.',
    q: { kind: 'V', target: 'R2' },
    spec: [['V', [1, 3], [1, 2], 12], ['W', [1, 2], [1, 1], [2, 1]], ['R', [2, 1], [3, 1], 2], ['W', [3, 1], [5, 1]], ['R', [5, 1], [5, 2], 4], ['W', [5, 2], [5, 3], [1, 3]]],
  },
  {
    title: 'Parallel',
    concept: 'Parallel branches share the same voltage. Current entering a node equals current leaving it (KCL).',
    hint: 'Each branch sees 12 V. Source current is the sum of both branch currents.',
    q: { kind: 'I', target: 'Vs1' },
    spec: [['V', [1, 3], [1, 2], 12], ['W', [1, 2], [1, 1], [5, 1]], ['R', [3, 1], [3, 2], 6], ['R', [5, 1], [5, 2], 3], ['W', [3, 2], [3, 3]], ['W', [5, 2], [5, 3], [1, 3]]],
  },
  {
    title: 'Series and parallel',
    concept: 'Collapse the parallel pair into one equivalent resistor, solve the single loop, then expand back out.',
    hint: 'R2 ‖ R3 = 2 Ω, total 5 Ω. Voltage across the pair = total current · 2 Ω.',
    q: { kind: 'I', target: 'R2' },
    spec: [['V', [1, 3], [1, 2], 18], ['W', [1, 2], [1, 1]], ['R', [1, 1], [2, 1], 3], ['W', [2, 1], [5, 1]], ['R', [3, 1], [3, 2], 6], ['R', [5, 1], [5, 2], 3], ['W', [3, 2], [3, 3]], ['W', [5, 2], [5, 3], [1, 3]]],
  },
  {
    title: 'Current divider',
    concept: 'A current source forces a fixed current. At the top node it splits, with more going through the smaller resistor.',
    hint: 'Both resistors share voltage V: 3 = V/6 + V/3.',
    q: { kind: 'I', target: 'R1' },
    spec: [['I', [1, 3], [1, 2], 3], ['W', [1, 2], [1, 1], [5, 1]], ['R', [3, 1], [3, 2], 6], ['R', [5, 1], [5, 2], 3], ['W', [3, 2], [3, 3]], ['W', [5, 2], [5, 3], [1, 3]]],
  },
  {
    title: 'Two sources',
    concept: 'With two sources, pick a reference node, name the unknown node voltage, and write KCL there. The sign of the answer tells you the direction.',
    hint: 'Bottom rail = 0 V, node D2 = Vm. KCL: (10 − Vm)/2 + (5 − Vm)/2 = Vm/4.',
    q: { kind: 'I', target: 'R2' },
    spec: [['V', [1, 3], [1, 2], 10], ['W', [1, 2], [1, 1]], ['R', [1, 1], [2, 1], 2], ['W', [2, 1], [4, 1]], ['R', [4, 1], [5, 1], 2], ['R', [3, 1], [3, 2], 4], ['W', [5, 1], [5, 2]], ['V', [5, 3], [5, 2], 5], ['W', [3, 2], [3, 3]], ['W', [5, 3], [1, 3]]],
  },
  {
    title: 'Mixed sources',
    concept: 'A current source can push current backwards through a branch, even back into a voltage source.',
    hint: 'KCL at D2: (12 − Vm)/4 + 3 = Vm/6. Current along the arrow in R1 is (12 − Vm)/4.',
    q: { kind: 'I', target: 'R1' },
    spec: [['V', [1, 3], [1, 2], 12], ['W', [1, 2], [1, 1]], ['R', [1, 1], [2, 1], 4], ['W', [2, 1], [3, 1]], ['R', [3, 1], [3, 2], 6], ['W', [3, 1], [5, 1], [5, 2]], ['I', [5, 3], [5, 2], 3], ['W', [3, 2], [3, 3]], ['W', [5, 3], [1, 3]]],
  },
  {
    title: 'Wheatstone bridge',
    concept: 'An unbalanced bridge has no series or parallel shortcut. Two unknown nodes means two KCL equations.',
    hint: 'Unknowns at D2 and D4. Left rail is 10 V, right rail 0 V. Write KCL at both, then I = (V_D2 − V_D4) / R5.',
    q: { kind: 'I', target: 'R5' },
    spec: [['W', [1, 1], [1, 4], [2, 4]], ['R', [1, 1], [2, 1], 2], ['W', [2, 1], [4, 1]], ['R', [4, 1], [5, 1], 4], ['R', [1, 3], [2, 3], 4], ['W', [2, 3], [4, 3]], ['R', [4, 3], [5, 3], 2], ['R', [3, 1], [3, 2], 4], ['W', [3, 2], [3, 3]], ['W', [5, 1], [5, 4], [3, 4]], ['V', [3, 4], [2, 4], 10]],
  },
];
// ---- ENGINE END

const TOOLS = [
  { k: 'W', label: 'Wire', help: 'Click between two dots to draw a wire.' },
  { k: 'R', label: 'Resistor', help: 'Click between two dots to place a resistor. Placing on an occupied spot replaces it.' },
  { k: 'V', label: 'Voltage source', help: 'The + terminal faces right or up. Use Flip to reverse it.' },
  { k: 'I', label: 'Current source', help: 'The arrow points right or up. Use Flip to reverse it.' },
  { k: 'flip', label: 'Flip', help: 'Click a part to reverse its direction.' },
  { k: 'erase', label: 'Erase', help: 'Click a part to remove it.' },
  { k: 'inspect', label: 'Inspect', help: 'Click a dot to check KCL, or a part to read its current, voltage and power.' },
];

const geom = (c) => {
  const [ax, ay] = pos(c.a), [bx, by] = pos(c.b);
  return { ax, ay, bx, by, mx: (ax + bx) / 2, my: (ay + by) / 2, ux: (bx - ax) / SP, uy: (by - ay) / SP, horiz: ay === by };
};
const arrowChar = (ux, uy) => (ux > 0 ? '→' : ux < 0 ? '←' : uy > 0 ? '↓' : '↑');
const qText = (q) =>
  q.kind === 'I'
    ? `What current flows through ${q.target} in the direction of its arrow, in amps? Answer negative if it flows the other way.`
    : `What is the voltage across ${q.target}, measured from + to −, in volts?`;

function PartGlyph({ c, stroke }) {
  const g = geom(c);
  const ang = (Math.atan2(g.by - g.ay, g.bx - g.ax) * 180) / Math.PI;
  const s = { stroke, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  let body;
  if (c.type === 'W') body = <line x1={-45} y1={0} x2={45} y2={0} {...s} />;
  else if (c.type === 'R') {
    const pts = [];
    for (let i = 0; i <= 8; i++) pts.push(`${-24 + i * 6},${i === 0 || i === 8 ? 0 : i % 2 ? -8 : 8}`);
    body = (<><line x1={-45} y1={0} x2={-24} y2={0} {...s} /><polyline points={pts.join(' ')} {...s} /><line x1={24} y1={0} x2={45} y2={0} {...s} /></>);
  } else {
    body = (
      <>
        <line x1={-45} y1={0} x2={-17} y2={0} {...s} />
        <line x1={17} y1={0} x2={45} y2={0} {...s} />
        <circle r={17} {...s} fill="var(--kl-panel)" />
        {c.type === 'I' && (<><line x1={-9} y1={0} x2={8} y2={0} {...s} /><polyline points="2,-6 9,0 2,6" {...s} /></>)}
      </>
    );
  }
  return <g transform={`translate(${g.mx} ${g.my}) rotate(${ang})`}>{body}</g>;
}

function Inspector({ inspect, comps, sol }) {
  if (!inspect || !sol.ok) return <p className="kl-small">Click a dot to check KCL at that node, or a part to read its current, voltage and power.</p>;
  if (inspect.k === 'n') {
    const id = inspect.id;
    const rows = comps.filter((c) => c.a === id || c.b === id).map((c) => {
      const I = sol.res[c.id].I;
      return { key: c.id, label: c.type === 'W' ? `Wire to ${nodeName(c.a === id ? c.b : c.a)}` : c.name, out: c.a === id ? I : -I };
    });
    const sin = rows.reduce((t, r) => t + Math.max(0, -r.out), 0);
    const sout = rows.reduce((t, r) => t + Math.max(0, r.out), 0);
    return (
      <>
        <h3 className="kl-h4">Node {nodeName(id)} at <span className="kl-num">{fmt(sol.volt[id])} V</span></h3>
        <table className="kl-table"><tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{r.label}</td>
              <td className="kl-num" style={{ color: Math.abs(r.out) < 1e-9 ? 'var(--kl-muted)' : r.out < 0 ? 'var(--kl-target)' : 'var(--kl-flow)' }}>
                {Math.abs(r.out) < 1e-9 ? '0 A' : r.out < 0 ? `in ${fmt(-r.out)} A` : `out ${fmt(r.out)} A`}
              </td>
            </tr>
          ))}
        </tbody></table>
        <p className="kl-small kl-gap">Total in {fmt(sin)} A equals total out {fmt(sout)} A. Voltages are measured from {sol.groundNames} (0 V).</p>
      </>
    );
  }
  const c = comps.find((x) => x.id === inspect.id);
  if (!c) return null;
  const { I, V } = sol.res[c.id];
  const [from, to] = I >= 0 ? [c.a, c.b] : [c.b, c.a];
  let p = null;
  if (c.type === 'R') p = `absorbs ${fmt(V * I)} W`;
  else if (c.type === 'V') { const d = c.value * I; p = d >= 0 ? `delivers ${fmt(d)} W` : `absorbs ${fmt(-d)} W`; }
  else if (c.type === 'I') { const d = -V * c.value; p = d >= 0 ? `delivers ${fmt(d)} W` : `absorbs ${fmt(-d)} W`; }
  return (
    <>
      <h3 className="kl-h4">{c.type === 'W' ? `Wire ${nodeName(c.a)} to ${nodeName(c.b)}` : `${c.name}, ${fmt(c.value)} ${UNIT[c.type]}`}</h3>
      <table className="kl-table"><tbody>
        <tr><td>Current</td><td className="kl-num">{fmt(Math.abs(I))} A, {nodeName(from)} to {nodeName(to)}</td></tr>
        <tr><td>V({nodeName(c.a)}) − V({nodeName(c.b)})</td><td className="kl-num">{fmt(V)} V</td></tr>
        {p && <tr><td>Power</td><td className="kl-num">{p}</td></tr>}
      </tbody></table>
    </>
  );
}

export default function KirchhoffLab() {
  const [mode, setMode] = useState('levels');
  const [lvl, setLvl] = useState(0);
  const [solved, setSolved] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [fb, setFb] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [inspect, setInspect] = useState(null);

  const [sbComps, setSbComps] = useState([]);
  const [tool, setTool] = useState('R');
  const [vals, setVals] = useState(DEFAULTS);
  const [showSol, setShowSol] = useState(false);
  const [quiz, setQuiz] = useState(null);

  const level = LEVELS[lvl];
  const levelComps = useMemo(() => build(LEVELS[lvl].spec), [lvl]);
  const comps = mode === 'levels' ? levelComps : sbComps;
  const sol = useMemo(() => solve(comps), [comps]);
  const question = mode === 'levels' ? level.q : quiz;
  const target = question ? comps.find((c) => c.name === question.target) : null;

  const showFlow = sol.ok && (mode === 'levels' ? revealed : showSol);
  const canInspect = sol.ok && (showFlow || (mode === 'sandbox' && tool === 'inspect'));
  const usedNodes = new Set(comps.flatMap((c) => [c.a, c.b]));

  const edges = useMemo(() => {
    const e = [];
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        if (x < COLS - 1) e.push([nid(x, y), nid(x + 1, y)]);
        if (y < ROWS - 1) e.push([nid(x, y + 1), nid(x, y)]);
      }
    return e;
  }, []);

  const resetQuestion = () => { setAnswer(''); setFb(null); setShowHint(false); setInspect(null); };
  const goLevel = (i) => { setLvl(i); setRevealed(false); resetQuestion(); };
  const switchMode = (m) => { setMode(m); resetQuestion(); };

  const check = () => {
    if (!sol.ok || !target) return;
    const r = sol.res[target.id];
    const correct = question.kind === 'I' ? r.I : r.V;
    const u = parseFloat(String(answer).replace(',', '.'));
    if (Number.isNaN(u)) return setFb({ t: 'bad', m: 'Enter a number, e.g. 1.5 or -0.25.' });
    const tol = Math.max(0.02 * Math.abs(correct), 0.005);
    const unit = question.kind === 'I' ? 'A' : 'V';
    if (Math.abs(u - correct) <= tol) {
      setFb({ t: 'ok', m: `Correct: ${fmt(correct)} ${unit}. Click any dot to see KCL hold.` });
      if (mode === 'levels') { setRevealed(true); setSolved((s) => (s.includes(lvl) ? s : [...s, lvl])); }
      else setShowSol(true);
    } else if (Math.abs(u + correct) <= tol) {
      setFb({ t: 'warn', m: 'Right magnitude, wrong sign. Check the arrow or the + and − marks.' });
    } else {
      setFb({ t: 'bad', m: 'Not quite. Write KCL at a node or KVL around a loop and try again.' });
    }
  };

  const reveal = () => {
    if (!sol.ok || !target) return;
    const r = sol.res[target.id];
    setFb({ t: 'warn', m: `Answer: ${fmt(question.kind === 'I' ? r.I : r.V)} ${question.kind === 'I' ? 'A' : 'V'}. Click dots and parts to trace why.` });
    if (mode === 'levels') setRevealed(true);
    else setShowSol(true);
  };

  const nextName = (list, type) => {
    const p = PREFIX[type];
    const nums = list.filter((c) => c.type === type).map((c) => parseInt(c.name.slice(p.length), 10) || 0);
    return p + (Math.max(0, ...nums) + 1);
  };

  const clickEdge = (a, b) => {
    const key = edgeKey(a, b);
    const existing = comps.find((c) => edgeKey(c.a, c.b) === key);
    if (mode === 'levels' || tool === 'inspect') { if (existing && canInspect) setInspect({ k: 'c', id: existing.id }); return; }
    setQuiz(null); setFb(null); setInspect(null); setAnswer('');
    if (tool === 'erase') { if (existing) setSbComps(sbComps.filter((c) => c !== existing)); return; }
    if (tool === 'flip') { if (existing && existing.type !== 'W') setSbComps(sbComps.map((c) => (c === existing ? { ...c, a: c.b, b: c.a } : c))); return; }
    const rest = sbComps.filter((c) => c !== existing);
    const c = { id: `s${uid++}`, type: tool, a, b };
    if (tool !== 'W') {
      let v = parseFloat(vals[tool]);
      if (!Number.isFinite(v)) v = DEFAULTS[tool];
      if (tool === 'R') v = Math.min(10000, Math.max(0.1, Math.abs(v)));
      c.value = v;
      c.name = existing && existing.type === tool ? existing.name : nextName(rest, tool);
    }
    setSbComps([...rest, c]);
  };

  const makeQuiz = () => {
    const cands = sbComps.filter((c) => c.type !== 'W');
    if (!sol.ok || !cands.length) return;
    const c = cands[Math.floor(Math.random() * cands.length)];
    const kind = c.type === 'R' ? (Math.random() < 0.5 ? 'I' : 'V') : c.type === 'V' ? 'I' : 'V';
    setQuiz({ kind, target: c.name });
    setShowSol(false);
    resetQuestion();
  };

  const openInSandbox = () => {
    setSbComps(levelComps.map((c) => ({ ...c, id: `s${uid++}` })));
    setQuiz(null); setShowSol(false); setTool('inspect');
    switchMode('sandbox');
  };

  /* ------------------------------------------------------------ board */
  const board = (
    <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label="Circuit board">
      <defs>
        <pattern id="kl-grid" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M18 0H0V18" fill="none" stroke="var(--kl-line)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={VW} height={VH} fill="url(#kl-grid)" />
      {Array.from({ length: COLS }, (_, x) => (
        <text key={`cx${x}`} x={PAD + x * SP} y={20} textAnchor="middle" className="kl-axis">{String.fromCharCode(65 + x)}</text>
      ))}
      {Array.from({ length: ROWS }, (_, y) => (
        <text key={`ry${y}`} x={16} y={PAD + y * SP + 4} textAnchor="middle" className="kl-axis">{y + 1}</text>
      ))}

      {comps.map((c) => {
        const isT = target && c.id === target.id;
        const isI = inspect && inspect.k === 'c' && inspect.id === c.id;
        return <PartGlyph key={c.id} c={c} stroke={isI ? 'var(--kl-flow)' : isT ? 'var(--kl-target)' : 'var(--kl-ink)'} />;
      })}

      {showFlow && comps.filter((c) => c.type === 'W').map((c) => {
        const I = sol.res[c.id].I;
        if (Math.abs(I) < 1e-6) return null;
        const g = geom(c);
        const [x1, y1, x2, y2] = I > 0 ? [g.ax, g.ay, g.bx, g.by] : [g.bx, g.by, g.ax, g.ay];
        const dur = Math.min(3, Math.max(0.3, 1.5 / Math.abs(I)));
        return <line key={`f${c.id}`} x1={x1} y1={y1} x2={x2} y2={y2} className="kl-flowline" style={{ animationDuration: `${dur}s` }} />;
      })}

      {comps.filter((c) => c.type !== 'W').map((c) => {
        const g = geom(c);
        const isT = target && c.id === target.id;
        const r = sol.ok ? sol.res[c.id] : null;
        const lab = g.horiz ? { x: g.mx, y: g.my - 26, textAnchor: 'middle' } : { x: g.mx + 26, y: g.my + 4, textAnchor: 'start' };
        const fl = g.horiz ? { x: g.mx, y: g.my + 38, textAnchor: 'middle' } : { x: g.mx - 26, y: g.my + 4, textAnchor: 'end' };
        const col = isT ? 'var(--kl-target)' : 'var(--kl-ink)';
        let flow = null;
        if (isT && question.kind === 'I') {
          flow = <text {...fl} className="kl-val" fill="var(--kl-target)">{arrowChar(g.ux, g.uy)} I = {showFlow && r ? `${fmt(r.I)} A` : '?'}</text>;
        } else if (isT) {
          const pa = g.horiz ? [g.mx - g.ux * 36, g.my + 20] : [g.mx - 14, g.my - g.uy * 34 + 4];
          const pb = g.horiz ? [g.mx + g.ux * 36, g.my + 20] : [g.mx - 14, g.my + g.uy * 34 + 4];
          flow = (
            <>
              <text x={pa[0]} y={pa[1]} textAnchor="middle" className="kl-sign" fill="var(--kl-target)">+</text>
              <text x={pb[0]} y={pb[1]} textAnchor="middle" className="kl-sign" fill="var(--kl-target)">−</text>
              <text {...fl} className="kl-val" fill="var(--kl-target)">V = {showFlow && r ? `${fmt(r.V)} V` : '?'}</text>
            </>
          );
        } else if (showFlow && r) {
          const s = r.I >= 0 ? 1 : -1;
          flow = <text {...fl} className="kl-val" fill="var(--kl-flow)">{arrowChar(g.ux * s, g.uy * s)} {fmt(Math.abs(r.I))} A</text>;
        }
        return (
          <g key={`t${c.id}`}>
            <text {...lab} className="kl-lab" fill={isT ? 'var(--kl-target)' : 'var(--kl-muted)'}>{c.name} {fmt(c.value)} {UNIT[c.type]}</text>
            {c.type === 'V' && (
              <>
                <text x={g.mx + g.ux * 8} y={g.my + g.uy * 8 + 4} textAnchor="middle" className="kl-sign" fill={col}>+</text>
                <text x={g.mx - g.ux * 8} y={g.my - g.uy * 8 + 4} textAnchor="middle" className="kl-sign" fill={col}>−</text>
              </>
            )}
            {flow}
          </g>
        );
      })}

      {Array.from({ length: COLS * ROWS }, (_, id) => {
        const [x, y] = pos(id);
        const used = usedNodes.has(id);
        const on = inspect && inspect.k === 'n' && inspect.id === id;
        return <circle key={`d${id}`} cx={x} cy={y} r={on ? 6 : used ? 4 : 2.5} fill={on ? 'var(--kl-flow)' : used ? 'var(--kl-ink)' : 'var(--kl-muted)'} opacity={used || on ? 1 : 0.45} />;
      })}

      {mode === 'sandbox' && tool !== 'inspect' && edges.map(([a, b]) => {
        const [ax, ay] = pos(a), [bx, by] = pos(b);
        const mx = (ax + bx) / 2, my = (ay + by) / 2, h = ay === by;
        return <rect key={`h${a}-${b}`} className="kl-hit" x={h ? mx - 30 : mx - 16} y={h ? my - 16 : my - 30} width={h ? 60 : 32} height={h ? 32 : 60} rx={6} onClick={() => clickEdge(a, b)} />;
      })}
      {canInspect && comps.map((c) => {
        const g = geom(c);
        return <rect key={`hc${c.id}`} className="kl-hit" x={g.horiz ? g.mx - 30 : g.mx - 16} y={g.horiz ? g.my - 16 : g.my - 30} width={g.horiz ? 60 : 32} height={g.horiz ? 32 : 60} rx={6} onClick={() => clickEdge(c.a, c.b)} />;
      })}
      {canInspect && [...usedNodes].map((id) => {
        const [x, y] = pos(id);
        return <circle key={`hn${id}`} className="kl-hit" cx={x} cy={y} r={13} onClick={() => setInspect({ k: 'n', id })} />;
      })}
    </svg>
  );

  const questionCard = question && target && (
    <section className="kl-card">
      <p className="kl-q">{qText(question)}</p>
      <div className="kl-row">
        <input
          className="kl-input kl-num"
          inputMode="decimal"
          aria-label="Your answer"
          placeholder={question.kind === 'I' ? 'Amps' : 'Volts'}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && check()}
        />
        <button className="kl-btn primary" onClick={check}>Check answer</button>
      </div>
      {fb && <p className={`kl-fb ${fb.t}`} role="status">{fb.m}</p>}
      <div className="kl-row kl-gap">
        {mode === 'levels' && <button className="kl-btn" onClick={() => setShowHint((h) => !h)}>{showHint ? 'Hide hint' : 'Show hint'}</button>}
        <button className="kl-btn" onClick={reveal} disabled={showFlow}>Reveal answer</button>
        {mode === 'levels' && lvl < LEVELS.length - 1 && revealed && <button className="kl-btn primary" onClick={() => goLevel(lvl + 1)}>Next level</button>}
      </div>
      {mode === 'levels' && showHint && <p className="kl-hint">{level.hint}</p>}
    </section>
  );

  return (
    <div className="kl">
      <style>{CSS}</style>
      <header className="kl-head">
        <div>
          <h1 className="kl-title">Kirchhoff Lab</h1>
          <p className="kl-sub">Solve circuits by hand, then watch the current prove you right.</p>
        </div>
        <div className="kl-tabs" role="tablist">
          <button role="tab" aria-selected={mode === 'levels'} className={`kl-tab ${mode === 'levels' ? 'on' : ''}`} onClick={() => switchMode('levels')}>Levels</button>
          <button role="tab" aria-selected={mode === 'sandbox'} className={`kl-tab ${mode === 'sandbox' ? 'on' : ''}`} onClick={() => switchMode('sandbox')}>Sandbox</button>
        </div>
      </header>

      <div className="kl-grid">
        <div className="kl-board">{board}</div>

        <aside>
          {mode === 'levels' ? (
            <>
              <section className="kl-card">
                <div className="kl-levels">
                  {LEVELS.map((L, i) => (
                    <button key={i} className={`kl-lv ${i === lvl ? 'cur' : ''} ${solved.includes(i) ? 'done' : ''}`} onClick={() => goLevel(i)} title={L.title} aria-label={`Level ${i + 1}: ${L.title}${solved.includes(i) ? ', solved' : ''}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <h2 className="kl-h3">{lvl + 1}. {level.title}</h2>
                <p>{level.concept}</p>
                <button className="kl-link" onClick={openInSandbox}>Edit this circuit in the sandbox</button>
              </section>
              {questionCard}
              <section className="kl-card">
                <h3 className="kl-h4 muted">Inspector</h3>
                {revealed ? <Inspector inspect={inspect} comps={comps} sol={sol} /> : <p className="kl-small">Answer or reveal to inspect nodes and parts.</p>}
              </section>
            </>
          ) : (
            <>
              <section className="kl-card">
                <div className="kl-row">
                  {TOOLS.map((t) => (
                    <button key={t.k} aria-pressed={tool === t.k} className={`kl-btn ${tool === t.k ? 'on' : ''}`} onClick={() => { setTool(t.k); if (t.k !== 'inspect') setInspect(null); }}>{t.label}</button>
                  ))}
                </div>
                {['R', 'V', 'I'].includes(tool) && (
                  <label className="kl-row kl-gap">
                    <span className="kl-small">Value</span>
                    <input type="number" step="any" className="kl-input kl-num" value={vals[tool]} onChange={(e) => setVals({ ...vals, [tool]: e.target.value })} />
                    <span className="kl-small">{UNIT[tool]}</span>
                  </label>
                )}
                <p className="kl-small kl-gap">{TOOLS.find((t) => t.k === tool).help}</p>
              </section>
              <section className="kl-card">
                <div className="kl-row">
                  <button className={`kl-btn ${showSol ? 'on' : ''}`} aria-pressed={showSol} onClick={() => setShowSol(!showSol)} disabled={!sol.ok}>Show currents</button>
                  <button className="kl-btn primary" onClick={makeQuiz} disabled={!sol.ok}>Quiz me</button>
                  <button className="kl-btn" onClick={() => { setSbComps([]); setQuiz(null); resetQuestion(); }}>Clear board</button>
                </div>
                {!sol.ok && <p className={`kl-fb ${sol.empty ? 'muted' : 'bad'}`}>{sol.msg}</p>}
              </section>
              {questionCard}
              <section className="kl-card">
                <h3 className="kl-h4 muted">Inspector</h3>
                <Inspector inspect={inspect} comps={comps} sol={sol} />
              </section>
            </>
          )}
        </aside>
      </div>
      <p className="kl-foot">Amber dashes show conventional current, from + to −. Speed scales with magnitude.</p>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;500;600;700&display=swap');
.kl{--kl-bg:#0f2a47;--kl-panel:#13345a;--kl-line:rgba(190,215,240,.13);--kl-ink:#eaf2fa;--kl-muted:#8fb0cc;--kl-flow:#ffc15e;--kl-target:#7fe3c6;--kl-bad:#ff8a7a;
  background:var(--kl-bg);color:var(--kl-ink);font-family:'Barlow Semi Condensed',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
  border-radius:18px;padding:24px;max-width:1080px;margin:0 auto;line-height:1.45}
.kl *{box-sizing:border-box}
.kl p{margin:0 0 8px;font-size:15px}
.kl-num{font-variant-numeric:tabular-nums}
.kl-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}
.kl-title{font-size:34px;line-height:1;font-weight:700;letter-spacing:-.01em;margin:0 0 6px}
.kl-sub{color:var(--kl-muted)}
.kl-tabs{display:flex;gap:2px;padding:3px;border-radius:10px;border:1px solid var(--kl-line)}
.kl-tab{font:inherit;font-size:15px;font-weight:600;color:var(--kl-muted);background:none;border:0;border-radius:7px;padding:6px 14px;cursor:pointer}
.kl-tab.on{background:var(--kl-ink);color:var(--kl-bg)}
.kl-grid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:18px;align-items:start}
@media (max-width:880px){.kl-grid{grid-template-columns:1fr}.kl{padding:16px}}
.kl-board{border:1px solid var(--kl-line);border-radius:14px;overflow:hidden;background:var(--kl-panel)}
.kl-board svg{display:block;width:100%;height:auto;touch-action:manipulation;user-select:none}
.kl-card{padding:14px 16px;border-left:2px solid var(--kl-line);margin-bottom:14px}
.kl-card + .kl-card{padding-top:4px}
.kl-h3{font-size:22px;font-weight:700;margin:4px 0 6px}
.kl-h4{font-size:16px;font-weight:600;margin:0 0 8px}
.kl-h4.muted{color:var(--kl-muted);font-weight:500}
.kl-q{font-size:16px!important;font-weight:500}
.kl-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.kl-gap{margin-top:10px!important}
.kl-btn{font:inherit;font-size:14px;font-weight:500;color:var(--kl-ink);background:transparent;border:1px solid var(--kl-line);border-radius:8px;padding:6px 11px;cursor:pointer}
.kl-btn:hover:not(:disabled){border-color:var(--kl-muted)}
.kl-btn.on{background:var(--kl-ink);color:var(--kl-bg);border-color:var(--kl-ink)}
.kl-btn.primary{background:var(--kl-flow);color:#2a1a00;border-color:var(--kl-flow);font-weight:600}
.kl-btn:disabled{opacity:.4;cursor:default}
.kl-link{font:inherit;font-size:14px;color:var(--kl-target);background:none;border:0;padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.kl button:focus-visible,.kl input:focus-visible{outline:2px solid var(--kl-flow);outline-offset:2px}
.kl-input{font:inherit;font-size:15px;background:var(--kl-bg);color:var(--kl-ink);border:1px solid var(--kl-line);border-radius:8px;padding:6px 10px;width:110px}
.kl-fb{font-size:15px;margin-top:10px!important}
.kl-fb.ok{color:var(--kl-target)}.kl-fb.bad{color:var(--kl-bad)}.kl-fb.warn{color:var(--kl-flow)}.kl-fb.muted{color:var(--kl-muted)}
.kl-hint{margin-top:10px!important;color:var(--kl-muted);font-style:italic}
.kl-small{font-size:14px!important;color:var(--kl-muted)}
.kl-levels{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}
.kl-lv{font:inherit;font-size:15px;font-weight:600;width:34px;height:34px;border-radius:50%;border:1px solid var(--kl-line);background:none;color:var(--kl-muted);cursor:pointer}
.kl-lv.done{border-color:var(--kl-target);color:var(--kl-target)}
.kl-lv.cur{background:var(--kl-ink);color:var(--kl-bg);border-color:var(--kl-ink)}
.kl-table{width:100%;font-size:14px;border-collapse:collapse}
.kl-table td{padding:4px 0;border-bottom:1px solid var(--kl-line)}
.kl-table td:last-child{text-align:right;padding-left:10px}
.kl-foot{color:var(--kl-muted);font-size:13px!important;margin-top:4px!important}
.kl-axis{font-size:12px;fill:var(--kl-muted);font-family:inherit}
.kl-lab{font-size:14px;font-weight:500;font-family:inherit}
.kl-val{font-size:14px;font-weight:600;font-family:inherit;font-variant-numeric:tabular-nums}
.kl-sign{font-size:14px;font-weight:700;font-family:inherit}
.kl-hit{fill:transparent;cursor:pointer}
.kl-hit:hover{fill:rgba(255,255,255,.07)}
.kl-flowline{stroke:var(--kl-flow);stroke-width:3;stroke-dasharray:4 8;stroke-linecap:round;animation:kl-flow 1s linear infinite}
@keyframes kl-flow{to{stroke-dashoffset:-24}}
@media (prefers-reduced-motion:reduce){.kl-flowline{animation:none}}
`;
