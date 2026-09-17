"use client";
import { useMemo, useRef, useState } from "react";
const reg = (phases, poly, label, bounds, callout) => ({ id: phases.join(" + "), phases, poly, label, bounds, callout });
const rev = (p) => [...p].reverse();
const cuLiq = [[0, 1085], [10, 1140], [20, 1195], [30, 1245], [40, 1282], [50, 1320], [60, 1360], [70, 1395], [80, 1425], [90, 1445], [100, 1455]];
const cuSol = [[0, 1085], [10, 1100], [20, 1135], [30, 1175], [40, 1240], [50, 1280], [60, 1312], [70, 1350], [80, 1390], [90, 1425], [100, 1455]];
const pbLiqA = [[0, 327], [15, 295], [30, 260], [46, 220], [61.9, 183]];
const pbSolA = [[0, 327], [8, 280], [13, 250], [17, 220], [18.3, 183]];
const pbSolvA = [[18.3, 183], [11, 150], [7, 100], [4, 50], [2, 0]];
const pbLiqB = [[61.9, 183], [80, 205], [100, 232]];
const pbSolB = [[97.8, 183], [100, 232]];
const pbSolvB = [[97.8, 183], [99, 150], [99.5, 50], [99.7, 0]];
const feLiqD = [[0, 1538], [0.53, 1493]];
const feSolD = [[0, 1538], [0.09, 1493]];
const feDG = [[0.09, 1493], [0, 1394]];
const feGD = [[0.17, 1493], [0, 1394]];
const feLiqG = [[0.53, 1493], [4.3, 1147]];
const feSolG = [[0.17, 1493], [2.14, 1147]];
const feLiqC = [[4.3, 1147], [6.7, 1227]];
const feAcm = [[0.76, 727], [2.14, 1147]];
const feA3 = [[0, 912], [0.76, 727]];
const feA3a = [[0, 912], [0.022, 727]];
const feSolvA = [[0.022, 727], [5e-3, 400]];
const feCem = [[6.7, 400], [6.7, 1600]];
const DIAGRAMS = [
  {
    id: "cuni",
    name: "Cu\u2013Ni",
    xLabel: "Composition (wt% Ni)",
    unit: "wt% Ni",
    xDigits: 1,
    start: [35, 1250],
    blurb: "Isomorphous system. Cu and Ni are fully soluble in each other as solids, so there is one solid phase and a single two-phase lens. No invariant points: every alloy freezes over a temperature range.",
    views: [{ label: "Full", x0: 0, x1: 100, T0: 1e3, T1: 1500, xStep: 10, TStep: 100 }],
    phases: {
      L: "Liquid solution of Cu and Ni.",
      "\u03B1": "Substitutional FCC solid solution. Complete miscibility follows the Hume-Rothery rules: similar atomic radii, same FCC structure, similar electronegativity and valence."
    },
    regions: [
      reg(["L"], [...cuLiq, [100, 1500], [0, 1500]], [30, 1410]),
      reg(["L", "\u03B1"], [...cuLiq, ...rev(cuSol)], [58, 1336], [cuLiq, cuSol]),
      reg(["\u03B1"], [...cuSol, [100, 1e3], [0, 1e3]], [60, 1120])
    ],
    invariants: [],
    classify: () => null,
    micro: () => null
  },
  {
    id: "pbsn",
    name: "Pb\u2013Sn",
    xLabel: "Composition (wt% Sn)",
    unit: "wt% Sn",
    xDigits: 1,
    start: [40, 150],
    blurb: "Binary eutectic with limited solid solubility. Two terminal solid solutions, three two-phase fields, and one eutectic where liquid freezes at a single temperature. The basis of classic 63/37 solder.",
    views: [{ label: "Full", x0: 0, x1: 100, T0: 0, T1: 350, xStep: 10, TStep: 50 }],
    phases: {
      L: "Liquid solution of Pb and Sn.",
      "\u03B1": "Pb-rich FCC solid solution. Dissolves at most 18.3 wt% Sn, at 183 \xB0C; solubility drops on cooling (solvus).",
      "\u03B2": "Sn-rich body-centred tetragonal (white tin) solid solution. Dissolves at most 2.2 wt% Pb."
    },
    regions: [
      reg(["L"], [...pbLiqA, ...pbLiqB.slice(1), [100, 350], [0, 350]], [50, 300]),
      reg(["\u03B1"], [...pbSolA, ...pbSolvA.slice(1), [0, 0]], [6, 170]),
      reg(["\u03B2"], [...rev(pbSolB), ...pbSolvB.slice(1), [100, 0]], [99.4, 110], void 0, [91, 125]),
      reg(["\u03B1", "L"], [...pbLiqA, ...rev(pbSolA)], [30, 218], [pbSolA, pbLiqA]),
      reg(["L", "\u03B2"], [...pbLiqB, ...rev(pbSolB)], [85, 197], [pbLiqB, pbSolB]),
      reg(["\u03B1", "\u03B2"], [[18.3, 183], ...pbSolvB, [2, 0], ...rev(pbSolvA)], [55, 80], [pbSolvA, pbSolvB])
    ],
    invariants: [
      { kind: "Eutectic", T: 183, x: 61.9, line: [18.3, 97.8], reaction: "L \u2192 \u03B1 + \u03B2", comps: [{ phase: "L", x: 61.9 }, { phase: "\u03B1", x: 18.3 }, { phase: "\u03B2", x: 97.8 }] }
    ],
    classify: (x) => {
      if (Math.abs(x - 61.9) <= 0.3) return "Eutectic alloy: freezes at one temperature into lamellar \u03B1 + \u03B2.";
      if (x < 2) return "Stays single-phase \u03B1 down to room temperature.";
      if (x <= 18.3) return "No eutectic forms. Freezes to \u03B1, then \u03B2 precipitates when it crosses the solvus.";
      if (x < 61.9) return "Hypoeutectic: primary \u03B1 forms first, remaining liquid becomes eutectic at 183 \xB0C.";
      if (x < 97.8) return "Hypereutectic: primary \u03B2 forms first, remaining liquid becomes eutectic at 183 \xB0C.";
      return "No eutectic forms. Freezes to \u03B2, with \u03B1 precipitating below the solvus.";
    },
    micro: (x) => {
      const title = "Microconstituents just below 183 \xB0C";
      if (x > 18.3 && x < 61.9) {
        const we = (x - 18.3) / (61.9 - 18.3);
        return { title, rows: [{ name: "Primary \u03B1", frac: 1 - we }, { name: "Eutectic (\u03B1 + \u03B2 lamellae)", frac: we }] };
      }
      if (x >= 61.9 && x < 97.8) {
        const we = (97.8 - x) / (97.8 - 61.9);
        return { title, rows: [{ name: "Eutectic (\u03B1 + \u03B2 lamellae)", frac: we }, { name: "Primary \u03B2", frac: 1 - we }] };
      }
      return null;
    }
  },
  {
    id: "fec",
    name: "Fe\u2013Fe\u2083C",
    xLabel: "Composition (wt% C)",
    unit: "wt% C",
    xDigits: 3,
    start: [0.4, 800],
    blurb: "The metastable iron\u2013carbon diagram. Steels sit below 2.14 wt% C, cast irons above. Three invariant reactions: peritectic, eutectic and eutectoid. Zoom into the steel region to see the \u03B4 corner.",
    views: [
      { label: "Full", x0: 0, x1: 6.7, T0: 400, T1: 1600, xStep: 1, TStep: 200 },
      { label: "Steel region", x0: 0, x1: 2.2, T0: 500, T1: 1600, xStep: 0.2, TStep: 100 }
    ],
    phases: {
      L: "Liquid iron\u2013carbon solution.",
      "\u03B4": "\u03B4-ferrite, BCC. Stable only at high temperature; dissolves at most 0.09 wt% C.",
      "\u03B3": "Austenite, FCC. Its octahedral interstices are larger than BCC ones, so it dissolves up to 2.14 wt% C. Non-magnetic.",
      "\u03B1": "Ferrite, BCC. Small interstitial sites limit carbon to 0.022 wt%. Soft and ductile.",
      "Fe\u2083C": "Cementite, an orthorhombic intermetallic compound at 6.70 wt% C. Hard and brittle. Metastable: graphite is the true equilibrium phase."
    },
    regions: [
      reg(["L"], [[0, 1538], [0.53, 1493], [4.3, 1147], [6.7, 1227], [6.7, 1600], [0, 1600]], [1.5, 1450]),
      reg(["\u03B4"], [[0, 1538], [0.09, 1493], [0, 1394]], [0.035, 1470]),
      reg(["\u03B4", "L"], [[0, 1538], [0.53, 1493], [0.09, 1493]], [0.22, 1508], [feSolD, feLiqD]),
      reg(["\u03B4", "\u03B3"], [[0.09, 1493], [0.17, 1493], [0, 1394]], [0.1, 1472], [feDG, feGD]),
      reg(["\u03B3", "L"], [[0.17, 1493], [0.53, 1493], [4.3, 1147], [2.14, 1147]], [1.6, 1320], [feSolG, feLiqG]),
      reg(["\u03B3"], [[0, 1394], [0.17, 1493], [2.14, 1147], [0.76, 727], [0, 912]], [0.6, 1e3]),
      reg(["L", "Fe\u2083C"], [[4.3, 1147], [6.7, 1147], [6.7, 1227]], [6, 1175], [feLiqC, feCem]),
      reg(["\u03B3", "Fe\u2083C"], [[2.14, 1147], [6.7, 1147], [6.7, 727], [0.76, 727]], [1.9, 850], [feAcm, feCem]),
      reg(["\u03B1", "\u03B3"], [[0, 912], [0.76, 727], [0.022, 727]], [0.3, 790], [feA3a, feA3]),
      reg(["\u03B1"], [[0, 912], [0.022, 727], [5e-3, 400], [0, 400]], [8e-3, 650]),
      reg(["\u03B1", "Fe\u2083C"], [[0.022, 727], [6.7, 727], [6.7, 400], [5e-3, 400]], [1.5, 600], [feSolvA, feCem])
    ],
    invariants: [
      { kind: "Peritectic", T: 1493, x: 0.17, line: [0.09, 0.53], reaction: "\u03B4 + L \u2192 \u03B3", comps: [{ phase: "\u03B4", x: 0.09 }, { phase: "L", x: 0.53 }, { phase: "\u03B3", x: 0.17 }] },
      { kind: "Eutectic", T: 1147, x: 4.3, line: [2.14, 6.7], reaction: "L \u2192 \u03B3 + Fe\u2083C", comps: [{ phase: "L", x: 4.3 }, { phase: "\u03B3", x: 2.14 }, { phase: "Fe\u2083C", x: 6.7 }] },
      { kind: "Eutectoid", T: 727, x: 0.76, line: [0.022, 6.7], reaction: "\u03B3 \u2192 \u03B1 + Fe\u2083C", comps: [{ phase: "\u03B3", x: 0.76 }, { phase: "\u03B1", x: 0.022 }, { phase: "Fe\u2083C", x: 6.7 }] }
    ],
    classify: (x) => {
      if (x <= 0.022) return "Commercially pure iron.";
      if (Math.abs(x - 0.76) <= 0.01) return "Eutectoid steel: transforms fully to pearlite at 727 \xB0C.";
      if (x < 0.76) return "Hypoeutectoid steel: proeutectoid ferrite forms first, then pearlite.";
      if (x < 2.14) return "Hypereutectoid steel: proeutectoid cementite forms on grain boundaries, then pearlite.";
      if (Math.abs(x - 4.3) <= 0.02) return "Eutectic cast iron: liquid freezes directly to ledeburite at 1147 \xB0C.";
      if (x < 4.3) return "Hypoeutectic cast iron: primary austenite, then ledeburite.";
      return "Hypereutectic cast iron: primary cementite, then ledeburite.";
    },
    micro: (x) => {
      if (x > 0.022 && x < 0.76) {
        const wp = (x - 0.022) / (0.76 - 0.022);
        return { title: "Microconstituents just below 727 \xB0C", rows: [{ name: "Proeutectoid ferrite", frac: 1 - wp }, { name: "Pearlite (\u03B1 + Fe\u2083C)", frac: wp }] };
      }
      if (x >= 0.76 && x < 2.14) {
        const wp = (6.7 - x) / (6.7 - 0.76);
        return { title: "Microconstituents just below 727 \xB0C", rows: [{ name: "Pearlite (\u03B1 + Fe\u2083C)", frac: wp }, { name: "Proeutectoid cementite", frac: 1 - wp }] };
      }
      if (x >= 2.14 && x < 4.3) {
        const we = (x - 2.14) / (4.3 - 2.14);
        return { title: "Microconstituents just below 1147 \xB0C", rows: [{ name: "Primary austenite", frac: 1 - we }, { name: "Ledeburite (\u03B3 + Fe\u2083C)", frac: we }] };
      }
      if (x >= 4.3 && x < 6.7) {
        const we = (6.7 - x) / (6.7 - 4.3);
        return { title: "Microconstituents just below 1147 \xB0C", rows: [{ name: "Ledeburite (\u03B3 + Fe\u2083C)", frac: we }, { name: "Primary cementite", frac: 1 - we }] };
      }
      return null;
    }
  }
];
const lerpX = (poly, T) => {
  for (let i = 0; i < poly.length - 1; i++) {
    const [x1, t1] = poly[i], [x2, t2] = poly[i + 1];
    if (t1 === t2) continue;
    if ((T - t1) * (T - t2) <= 0) return x1 + (T - t1) / (t2 - t1) * (x2 - x1);
  }
  return null;
};
const inPoly = (poly, x, y) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const regionAt = (d, x, T) => {
  const v = d.views[0];
  const cx = Math.min(Math.max(x, v.x0 + 1e-9), v.x1 - 1e-9);
  const cT = Math.min(Math.max(T, v.T0 + 1e-9), v.T1 - 1e-9);
  return d.regions.find((r) => inPoly(r.poly, cx, cT)) ?? null;
};
const stateAt = (d, x, T) => {
  const region = regionAt(d, x, T);
  if (!region) return { region: null, rows: [], tie: null };
  if (region.phases.length === 1 || !region.bounds) return { region, rows: [{ phase: region.phases[0], x, w: 1 }], tie: null };
  const xl = lerpX(region.bounds[0], T), xr = lerpX(region.bounds[1], T);
  if (xl === null || xr === null || xr - xl < 1e-9) return { region, rows: region.phases.map((p) => ({ phase: p, x, w: NaN })), tie: null };
  const wl = Math.min(1, Math.max(0, (xr - x) / (xr - xl)));
  return { region, rows: [{ phase: region.phases[0], x: xl, w: wl }, { phase: region.phases[1], x: xr, w: 1 - wl }], tie: [xl, xr] };
};
const coolingPath = (d, x) => {
  const v = d.views[0];
  const N = 1500, dt = (v.T1 - v.T0) / N;
  const key = (T) => regionAt(d, x, T)?.id ?? "\u2014";
  const ev = [];
  let prevT = v.T1, prev = key(prevT);
  for (let i = 1; i <= N; i++) {
    const T = v.T1 - i * dt;
    const k = key(T);
    if (k !== prev) {
      let hi = prevT, lo = T;
      for (let j = 0; j < 32; j++) {
        const m = (hi + lo) / 2;
        if (key(m) === prev) hi = m;
        else lo = m;
      }
      const Tb = (hi + lo) / 2;
      const inv = d.invariants.find((q) => Math.abs(q.T - Tb) < 0.5 && x >= q.line[0] - 1e-9 && x <= q.line[1] + 1e-9) ?? null;
      ev.push({ T: Tb, from: prev, to: k, inv });
      prev = k;
    }
    prevT = T;
  }
  return ev;
};
const COLOR = { L: "#ff8a7a", "\u03B1": "#7fe3c6", "\u03B2": "#9db4ff", "\u03B3": "#ffc15e", "\u03B4": "#e39bff", "Fe\u2083C": "#e6dcc6" };
const W = 720, H = 500, ML = 66, MR = 18, MT = 18, MB = 54;
const PW = W - ML - MR, PH = H - MT - MB;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pct = (w) => Number.isFinite(w) ? `${(w * 100).toFixed(1)}%` : "\u2014";
const tickFmt = (v, step) => step < 1 ? v.toFixed(1) : String(Math.round(v));
function PhaseDiagramExplorer() {
  const [di, setDi] = useState(0);
  const [vi, setVi] = useState(0);
  const [pt, setPt] = useState(DIAGRAMS[0].start);
  const [phaseSel, setPhaseSel] = useState(null);
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const d = DIAGRAMS[di];
  const v = d.views[vi];
  const [x, T] = pt;
  const sx = (cx) => ML + (cx - v.x0) / (v.x1 - v.x0) * PW;
  const sy = (cT) => MT + (v.T1 - cT) / (v.T1 - v.T0) * PH;
  const st = useMemo(() => stateAt(d, x, T), [d, x, T]);
  const path = useMemo(() => coolingPath(d, x), [d, x]);
  const fullRange = d.views[0].T1 - d.views[0].T0;
  const nearInv = d.invariants.find((q) => Math.abs(q.T - T) <= fullRange * 6e-3 && x >= q.line[0] && x <= q.line[1]) ?? null;
  const cls = d.classify(x);
  const micro = d.micro(x);
  const fx = (cx) => cx.toFixed(d.xDigits);
  const pickDiagram = (i) => {
    setDi(i);
    setVi(0);
    setPt(DIAGRAMS[i].start);
    setPhaseSel(null);
  };
  const setFromPointer = (e) => {
    const svg2 = svgRef.current;
    const ctm = svg2?.getScreenCTM();
    if (!svg2 || !ctm) return;
    const p = svg2.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const q = p.matrixTransform(ctm.inverse());
    setPt([clamp(v.x0 + (q.x - ML) / PW * (v.x1 - v.x0), v.x0, v.x1), clamp(v.T1 - (q.y - MT) / PH * (v.T1 - v.T0), v.T0, v.T1)]);
  };
  const xTicks = [];
  for (let t = Math.ceil(v.x0 / v.xStep - 1e-9) * v.xStep; t <= v.x1 + 1e-9; t += v.xStep) xTicks.push(t);
  const TTicks = [];
  for (let t = Math.ceil(v.T0 / v.TStep) * v.TStep; t <= v.T1; t += v.TStep) TTicks.push(t);
  const inView = (cx, cT) => cx >= v.x0 && cx <= v.x1 && cT >= v.T0 && cT <= v.T1;
  const svg = <svg
    ref={svgRef}
    viewBox={`0 0 ${W} ${H}`}
    role="img"
    aria-label={`${d.name} phase diagram`}
    onPointerDown={(e) => {
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setFromPointer(e);
    }}
    onPointerMove={(e) => {
      if (dragging.current) setFromPointer(e);
    }}
    onPointerUp={() => {
      dragging.current = false;
    }}
    onPointerCancel={() => {
      dragging.current = false;
    }}
  >
      <defs>
        <pattern id="pd-tie" width="8" height="7" patternUnits="userSpaceOnUse">
          <line x1="0" y1="3.5" x2="8" y2="3.5" stroke="rgba(234,242,250,.18)" strokeWidth="1" />
        </pattern>
        <clipPath id="pd-clip"><rect x={ML} y={MT} width={PW} height={PH} /></clipPath>
      </defs>

      {TTicks.map((t) => <line key={`gt${t}`} x1={ML} x2={ML + PW} y1={sy(t)} y2={sy(t)} stroke="var(--pd-line)" />)}
      {xTicks.map((t) => <line key={`gx${t}`} y1={MT} y2={MT + PH} x1={sx(t)} x2={sx(t)} stroke="var(--pd-line)" />)}

      <g clipPath="url(#pd-clip)">
        {d.regions.map((r) => {
    const pts = r.poly.map(([a, b]) => `${sx(a)},${sy(b)}`).join(" ");
    const hit = !phaseSel || r.phases.includes(phaseSel);
    const cur = st.region?.id === r.id;
    return <g key={r.id} opacity={hit ? 1 : 0.3}>
              {r.phases.length === 1 ? <polygon points={pts} fill={COLOR[r.phases[0]]} fillOpacity={phaseSel && hit ? 0.34 : 0.2} /> : <>
                    {phaseSel && hit && <polygon points={pts} fill={COLOR[phaseSel]} fillOpacity={0.14} />}
                    <polygon points={pts} fill="url(#pd-tie)" />
                  </>}
              <polygon points={pts} fill="none" stroke={cur ? "var(--pd-ink)" : "rgba(234,242,250,.55)"} strokeWidth={cur ? 2.4 : 1.2} strokeLinejoin="round" />
            </g>;
  })}

        {d.regions.map((r) => {
    const px = r.poly.map((p) => sx(p[0])), py = r.poly.map((p) => sy(p[1]));
    const wpx = Math.max(...px) - Math.min(...px), hpx = Math.max(...py) - Math.min(...py);
    if (!inView(r.label[0], r.label[1])) return null;
    const text = r.phases.join(" + ");
    if (r.callout) {
      return <g key={`l${r.id}`} className="pd-label">
                <line x1={sx(r.callout[0]) + 8} y1={sy(r.callout[1]) - 4} x2={sx(r.label[0])} y2={sy(r.label[1])} stroke="var(--pd-muted)" />
                <text x={sx(r.callout[0])} y={sy(r.callout[1])} textAnchor="end">{text}</text>
              </g>;
    }
    if (wpx < 30 || hpx < 16) return null;
    return <text key={`l${r.id}`} className="pd-label" x={sx(r.label[0])} y={sy(r.label[1]) + 5} textAnchor="middle">{text}</text>;
  })}

        <line x1={sx(x)} x2={sx(x)} y1={MT} y2={MT + PH} stroke="var(--pd-ink)" strokeOpacity={0.35} strokeDasharray="3 5" />
        <line x1={ML} x2={ML + PW} y1={sy(T)} y2={sy(T)} stroke="var(--pd-ink)" strokeOpacity={0.12} />

        {st.tie && <g>
            <line x1={sx(st.tie[0])} x2={sx(st.tie[1])} y1={sy(T)} y2={sy(T)} stroke="var(--pd-accent)" strokeWidth={2.4} />
            {st.rows.map((r, i) => <g key={`te${i}`}>
                <circle cx={sx(r.x)} cy={sy(T)} r={4.5} fill="var(--pd-accent)" />
                <text x={sx(r.x)} y={sy(T) - 10} textAnchor={i === 0 ? "end" : "start"} className="pd-tie">{r.phase} {fx(r.x)}</text>
              </g>)}
          </g>}
      </g>

      {d.invariants.filter((q) => inView(q.x, q.T)).map((q) => <g key={q.kind} className="pd-inv" onPointerDown={(e) => {
    e.stopPropagation();
    setPt([q.x, q.T + 0.01]);
  }}>
          <circle cx={sx(q.x)} cy={sy(q.T)} r={12} fill="transparent" />
          <circle cx={sx(q.x)} cy={sy(q.T)} r={5.5} fill="var(--pd-hot)" stroke="var(--pd-bg)" strokeWidth={2} />
        </g>)}

      <circle cx={sx(x)} cy={sy(T)} r={7} fill="none" stroke="var(--pd-ink)" strokeWidth={2} />
      <circle cx={sx(x)} cy={sy(T)} r={2.5} fill="var(--pd-ink)" />

      <rect x={ML} y={MT} width={PW} height={PH} fill="none" stroke="var(--pd-muted)" strokeOpacity={0.6} />
      {xTicks.map((t) => <text key={`xt${t}`} x={sx(t)} y={MT + PH + 20} textAnchor="middle" className="pd-axis">{tickFmt(t, v.xStep)}</text>)}
      {TTicks.map((t) => <text key={`tt${t}`} x={ML - 10} y={sy(t) + 4} textAnchor="end" className="pd-axis">{t}</text>)}
      <text x={ML + PW / 2} y={H - 10} textAnchor="middle" className="pd-axis-title">{d.xLabel}</text>
      <text transform={`translate(16 ${MT + PH / 2}) rotate(-90)`} textAnchor="middle" className="pd-axis-title">Temperature (°C)</text>
    </svg>;
  const P = st.region ? st.region.phases.length : 0;
  return <div className="pd">
      <style>{CSS}</style>
      <header className="pd-head">
        <div>
          <h1 className="pd-title">Phase Diagram Explorer</h1>
          <p className="pd-sub">Drag across the diagram. Tie lines and the lever rule update as you go.</p>
        </div>
        <div className="pd-tabs" role="tablist">
          {DIAGRAMS.map((D, i) => <button key={D.id} role="tab" aria-selected={i === di} className={`pd-tab ${i === di ? "on" : ""}`} onClick={() => pickDiagram(i)}>{D.name}</button>)}
        </div>
      </header>

      <div className="pd-grid">
        <div>
          <div className="pd-board">{svg}</div>
          <div className="pd-sliders">
            <label>
              <span>Composition <b className="pd-num">{fx(x)} {d.unit}</b></span>
              <input type="range" min={v.x0} max={v.x1} step={d.xDigits === 3 ? 1e-3 : 0.1} value={x} onChange={(e) => setPt([+e.target.value, T])} />
            </label>
            <label>
              <span>Temperature <b className="pd-num">{T.toFixed(0)} °C</b></span>
              <input type="range" min={v.T0} max={v.T1} step={1} value={T} onChange={(e) => setPt([x, +e.target.value])} />
            </label>
          </div>
          <p className="pd-foot">Curves are simplified from standard references (Callister, ASM). Readings are approximate. Fe–Fe₃C composition axis ends at cementite, 6.70 wt% C.</p>
        </div>

        <aside>
          <section className="pd-card">
            <p>{d.blurb}</p>
            {d.views.length > 1 && <div className="pd-row">
                {d.views.map((V, i) => <button key={V.label} aria-pressed={i === vi} className={`pd-btn ${i === vi ? "on" : ""}`} onClick={() => {
    setVi(i);
    setPt([clamp(x, V.x0, V.x1), clamp(T, V.T0, V.T1)]);
  }}>{V.label}</button>)}
              </div>}
          </section>

          <section className="pd-card">
            <h2 className="pd-h2">{st.region ? st.region.id : "On a boundary"}</h2>
            <table className="pd-table">
              <thead><tr><td>Phase</td><td>Composition</td><td>Mass fraction</td></tr></thead>
              <tbody>
                {st.rows.map((r) => <tr key={r.phase}>
                    <td><span className="pd-dot" style={{ background: COLOR[r.phase] }} />{r.phase}</td>
                    <td className="pd-num">{fx(r.x)}</td>
                    <td className="pd-num">{pct(r.w)}</td>
                  </tr>)}
              </tbody>
            </table>
            {st.tie && <p className="pd-small pd-gap">
                Lever rule: W<sub>{st.rows[0].phase}</sub> = ({fx(st.tie[1])} − {fx(x)}) / ({fx(st.tie[1])} − {fx(st.tie[0])}).
              </p>}
            {st.region && <p className="pd-small">Degrees of freedom at fixed pressure: F = C − P + 1 = 2 − {P} + 1 = {3 - P}.</p>}
            {cls && <p className="pd-gap">{cls}</p>}
          </section>

          {nearInv && <section className="pd-card hot">
              <h2 className="pd-h2">{nearInv.kind} at {nearInv.T} °C</h2>
              <p className="pd-reaction">{nearInv.reaction}</p>
              <p className="pd-small">
                {nearInv.comps.map((c) => `${c.phase} ${fx(c.x)}`).join(" \xB7 ")} {d.unit}
              </p>
              <p className="pd-small">Three phases coexist, so F = 2 − 3 + 1 = 0: temperature and all phase compositions are fixed until the reaction completes.</p>
            </section>}

          {micro && <section className="pd-card">
              <h3 className="pd-h3">{micro.title}</h3>
              <table className="pd-table"><tbody>
                {micro.rows.map((r) => <tr key={r.name}><td>{r.name}</td><td className="pd-num">{pct(r.frac)}</td></tr>)}
              </tbody></table>
            </section>}

          <section className="pd-card">
            <h3 className="pd-h3">Invariant points</h3>
            {d.invariants.length === 0 ? <p className="pd-small">None. An isomorphous system has no three-phase equilibria.</p> : <div className="pd-row">
                {d.invariants.map((q) => <button key={q.kind} className="pd-btn" onClick={() => {
    if (!inView(q.x, q.T)) setVi(Math.max(0, d.views.findIndex((w) => q.x >= w.x0 && q.x <= w.x1 && q.T >= w.T0 && q.T <= w.T1)));
    setPt([q.x, q.T + 0.01]);
  }}>{q.kind} · {q.T} °C</button>)}
              </div>}
          </section>

          <section className="pd-card">
            <h3 className="pd-h3">Phases</h3>
            <div className="pd-row">
              {Object.keys(d.phases).map((p) => <button key={p} aria-pressed={phaseSel === p} className={`pd-btn ${phaseSel === p ? "on" : ""}`} onClick={() => setPhaseSel(phaseSel === p ? null : p)}>
                  <span className="pd-dot" style={{ background: COLOR[p] }} />{p}
                </button>)}
            </div>
            <p className="pd-small pd-gap">{phaseSel ? d.phases[phaseSel] : "Select a phase to highlight every field it appears in."}</p>
          </section>

          <section className="pd-card">
            <h3 className="pd-h3">Slow cooling at {fx(x)} {d.unit}</h3>
            <ol className="pd-path">
              {path.map((e, i) => <li key={i}>
                  <span className="pd-num">{e.T.toFixed(0)} °C</span>
                  <span>{e.from} → {e.to}{e.inv ? <em> · {e.inv.kind.toLowerCase()}: {e.inv.reaction}</em> : null}</span>
                </li>)}
            </ol>
          </section>
        </aside>
      </div>
    </div>;
}
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;500;600;700&display=swap');
body{margin:0;background:#0f2a47}
.pd{--pd-bg:#0f2a47;--pd-panel:#13345a;--pd-line:rgba(190,215,240,.08);--pd-ink:#eaf2fa;--pd-muted:#8fb0cc;--pd-accent:#7fe3c6;--pd-hot:#ffc15e;
  background:var(--pd-bg);color:var(--pd-ink);font-family:'Barlow Semi Condensed',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
  min-height:100vh;padding:24px max(24px, calc(50% - 600px));line-height:1.45}
.pd *{box-sizing:border-box}
.pd p{margin:0 0 8px;font-size:15px}
.pd-num{font-variant-numeric:tabular-nums}
.pd-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}
.pd-title{font-size:34px;line-height:1;font-weight:700;letter-spacing:-.01em;margin:0 0 6px}
.pd-sub{color:var(--pd-muted)}
.pd-tabs{display:flex;gap:2px;padding:3px;border-radius:10px;border:1px solid var(--pd-line)}
.pd-tab{font:inherit;font-size:15px;font-weight:600;color:var(--pd-muted);background:none;border:0;border-radius:7px;padding:6px 14px;cursor:pointer}
.pd-tab.on{background:var(--pd-ink);color:var(--pd-bg)}
.pd-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:20px;align-items:start}
@media (max-width:920px){.pd-grid{grid-template-columns:1fr}}
.pd-board{border:1px solid var(--pd-line);border-radius:14px;overflow:hidden;background:var(--pd-panel)}
.pd-board svg{display:block;width:100%;height:auto;touch-action:none;user-select:none;cursor:crosshair}
.pd-sliders{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:14px 0 6px}
@media (max-width:560px){.pd-sliders{grid-template-columns:1fr}}
.pd-sliders label{display:flex;flex-direction:column;gap:6px;font-size:14px;color:var(--pd-muted)}
.pd-sliders b{color:var(--pd-ink);font-weight:600;margin-left:6px}
.pd-sliders input{width:100%;accent-color:var(--pd-accent)}
.pd-card{padding:12px 16px;border-left:2px solid var(--pd-line);margin-bottom:12px}
.pd-card.hot{border-left-color:var(--pd-hot)}
.pd-h2{font-size:24px;font-weight:700;margin:0 0 8px}
.pd-h3{font-size:16px;font-weight:600;margin:0 0 8px;color:var(--pd-muted)}
.pd-reaction{font-size:20px!important;font-weight:600;color:var(--pd-hot)}
.pd-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.pd-gap{margin-top:10px!important}
.pd-btn{font:inherit;font-size:14px;font-weight:500;color:var(--pd-ink);background:transparent;border:1px solid var(--pd-line);border-radius:8px;padding:5px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.pd-btn:hover{border-color:var(--pd-muted)}
.pd-btn.on{background:var(--pd-ink);color:var(--pd-bg);border-color:var(--pd-ink)}
.pd button:focus-visible,.pd input:focus-visible{outline:2px solid var(--pd-hot);outline-offset:2px}
.pd-dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;vertical-align:1px}
.pd-btn .pd-dot{margin-right:0}
.pd-table{width:100%;font-size:15px;border-collapse:collapse}
.pd-table thead td{color:var(--pd-muted);font-size:13px}
.pd-table td{padding:4px 0;border-bottom:1px solid var(--pd-line)}
.pd-table td:not(:first-child){text-align:right}
.pd-small{font-size:14px!important;color:var(--pd-muted)}
.pd-path{list-style:none;margin:0;padding:0;font-size:14px}
.pd-path li{display:grid;grid-template-columns:64px 1fr;gap:8px;padding:4px 0;border-bottom:1px solid var(--pd-line)}
.pd-path li span:first-child{color:var(--pd-muted);text-align:right}
.pd-path em{color:var(--pd-hot);font-style:normal}
.pd-foot{color:var(--pd-muted);font-size:13px!important}
.pd-axis{font-size:12px;fill:var(--pd-muted);font-family:inherit;font-variant-numeric:tabular-nums}
.pd-axis-title{font-size:14px;fill:var(--pd-muted);font-family:inherit}
.pd-label{font-size:16px;font-weight:600;fill:var(--pd-ink);font-family:inherit;pointer-events:none}
.pd-tie{font-size:13px;font-weight:600;fill:var(--pd-accent);font-family:inherit;paint-order:stroke;stroke:var(--pd-bg);stroke-width:3px}
.pd-inv{cursor:pointer}
`;
export {
  PhaseDiagramExplorer as default
};
