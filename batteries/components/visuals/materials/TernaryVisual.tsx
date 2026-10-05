"use client";

import { C, Chip, Label, Reveal, Stage } from "../primitives";

// Equilateral Gibbs triangle: corners A (bottom-left), B (bottom-right), C (top).
const A: [number, number] = [90, 370];
const B: [number, number] = [510, 370];
const Ctop: [number, number] = [300, 370 - 420 * (Math.sqrt(3) / 2)];
// composition (a, b, c) fractions → point
const P = (a: number, b: number, c: number): [number, number] => [a * A[0] + b * B[0] + c * Ctop[0], a * A[1] + b * B[1] + c * Ctop[1]];
const tri = `${A.join(",")} ${B.join(",")} ${Ctop.join(",")}`;

// three-phase region: phases X, Y, Z and alloy point Q inside
const X = P(0.62, 0.1, 0.28);
const Y = P(0.3, 0.55, 0.15);
const Z = P(0.25, 0.12, 0.63);
const Q: [number, number] = [(X[0] + Y[0] + Z[0]) / 3 + 6, (X[1] + Y[1] + Z[1]) / 3 + 6];

// intersection of line corner→Q with the opposite side (for the 2D lever)
function through(from: [number, number], p: [number, number], s1: [number, number], s2: [number, number]): [number, number] {
  const [x1, y1] = from;
  const [x2, y2] = p;
  const [x3, y3] = s1;
  const [x4, y4] = s2;
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}
const dist = (p: [number, number], q: [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const LEVERS = [
  { name: "MoB", corner: X, side: through(X, Q, Y, Z), color: C.lfp },
  { name: "T1", corner: Y, side: through(Y, Q, X, Z), color: C.copper },
  { name: "MoSi₂", corner: Z, side: through(Z, Q, X, Y), color: C.lithium },
].map((l) => ({ ...l, frac: dist(Q, l.side) / dist(l.corner, l.side) }));

// 2025 exam, Sn–Sb–Cu (schematic): A corner = Sb, B = Cu, C (top) = Sn
const E_SNSB = P(0.5, 0, 0.5);
const E_CU2SB = P(1 / 3, 2 / 3, 0);
const E_CU3SN = P(0, 0.75, 0.25);
const mix = (w: number[], pts: [number, number][]): [number, number] => {
  const t = w.reduce((n, x) => n + x, 0);
  return [pts.reduce((n, p, i) => n + p[0] * w[i], 0) / t, pts.reduce((n, p, i) => n + p[1] * w[i], 0) / t];
};
const EP = mix([0.19, 0.33, 0.47], [E_SNSB, E_CU2SB, E_CU3SN]);
const EXAM_LEVERS = [
  { name: "SnSb", corner: E_SNSB, side: through(E_SNSB, EP, E_CU2SB, E_CU3SN), color: C.lfp },
  { name: "Cu2Sb", corner: E_CU2SB, side: through(E_CU2SB, EP, E_SNSB, E_CU3SN), color: C.copper },
  { name: "Cu3Sn", corner: E_CU3SN, side: through(E_CU3SN, EP, E_SNSB, E_CU2SB), color: C.lithium },
];

export default function TernaryVisual({ visual }: { visual: string }) {
  const read = visual === "gibbs-triangle";
  const three = visual === "three-phase" || visual === "amounts";
  const amounts = visual === "amounts";
  const exam = visual === "exam-2025";
  const R = P(0.4, 0.2, 0.4);

  return (
    <Stage label="Ternary phase diagrams">
      <polygon points={tri} fill={C.accent} fillOpacity={0.05} stroke={C.dim} strokeWidth={2} />
      <Label x={A[0] - 6} y={A[1] + 24} size={15} weight={700}>
        {exam ? "Sb" : "A"}
      </Label>
      <Label x={B[0] + 6} y={B[1] + 24} size={15} weight={700}>
        {exam ? "Cu" : "B"}
      </Label>
      <Label x={Ctop[0] + 14} y={Ctop[1] + 14} size={15} weight={700} anchor="start">
        {exam ? "Sn" : "C"}
      </Label>

      <Reveal show={exam}>
        <polygon points={`${E_SNSB.join(",")} ${E_CU2SB.join(",")} ${E_CU3SN.join(",")}`} fill={C.electron} fillOpacity={0.12} stroke={C.electron} strokeWidth={2} />
        {EXAM_LEVERS.map((l) => (
          <g key={l.name}>
            <line x1={l.corner[0]} y1={l.corner[1]} x2={l.side[0]} y2={l.side[1]} stroke={l.color} strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={EP[0]} y1={EP[1]} x2={l.side[0]} y2={l.side[1]} stroke={l.color} strokeWidth={4} />
            <circle cx={l.corner[0]} cy={l.corner[1]} r={6} fill={l.color} />
          </g>
        ))}
        <Label x={E_SNSB[0] - 10} y={E_SNSB[1]} size={14} weight={700} color={C.lfp} anchor="end">
          SnSb
        </Label>
        <Label x={E_CU2SB[0]} y={E_CU2SB[1] + 22} size={14} weight={700} color={C.copper}>
          Cu₂Sb
        </Label>
        <Label x={E_CU3SN[0] + 10} y={E_CU3SN[1]} size={14} weight={700} color={C.lithium} anchor="start">
          Cu₃Sn
        </Label>
        <circle cx={EP[0]} cy={EP[1]} r={7} fill={C.hot} />
        <Label x={EP[0] - 10} y={EP[1] - 10} size={13} color={C.hot} weight={700} anchor="end">
          P
        </Label>
        <g transform="translate(20 40)">
          <rect x={0} y={0} width={170} height={112} rx={10} fill="#0b1220" stroke={C.electron} />
          <Label x={85} y={20} size={12} color={C.dim}>
            2025 exam, read off the figure
          </Label>
          {[
            { t: "SnSb ≈ 19 %", c: C.lfp },
            { t: "Cu₂Sb ≈ 33 %", c: C.copper },
            { t: "Cu₃Sn ≈ 47 %", c: C.lithium },
          ].map((r, i) => (
            <Label key={r.t} x={85} y={44 + i * 20} size={14} weight={700} color={r.c}>
              {r.t}
            </Label>
          ))}
          <Label x={85} y={104} size={12}>
            sum 99 % (reading accuracy)
          </Label>
        </g>
      </Reveal>

      <Reveal show={read}>
        {/* parallel reading lines through R = 40 % A, 20 % B, 40 % C */}
        <line x1={P(0.4, 0.6, 0)[0]} y1={P(0.4, 0.6, 0)[1]} x2={P(0.4, 0, 0.6)[0]} y2={P(0.4, 0, 0.6)[1]} stroke={C.lfp} strokeWidth={2} strokeDasharray="5 4" />
        <line x1={P(0.8, 0.2, 0)[0]} y1={P(0.8, 0.2, 0)[1]} x2={P(0, 0.2, 0.8)[0]} y2={P(0, 0.2, 0.8)[1]} stroke={C.lithium} strokeWidth={2} strokeDasharray="5 4" />
        <line x1={P(0.6, 0, 0.4)[0]} y1={P(0.6, 0, 0.4)[1]} x2={P(0, 0.6, 0.4)[0]} y2={P(0, 0.6, 0.4)[1]} stroke={C.hot} strokeWidth={2} strokeDasharray="5 4" />
        <circle cx={R[0]} cy={R[1]} r={7} fill={C.electron} />
        <line x1={162} y1={172} x2={R[0] - 8} y2={R[1] - 4} stroke={C.electron} strokeWidth={1.5} />
        <Label x={156} y={150} size={13} color={C.electron} anchor="end" weight={700}>
          40 % A
        </Label>
        <Label x={156} y={168} size={13} color={C.electron} anchor="end" weight={700}>
          20 % B
        </Label>
        <Label x={156} y={186} size={13} color={C.electron} anchor="end" weight={700}>
          40 % C
        </Label>
        <Label x={300} y={410} size={13} color={C.dim}>
          corners: pure elements · sides: the three binary systems
        </Label>
        <Label x={300} y={432} size={13} color={C.dim}>
          read each amount along lines parallel to the sides
        </Label>
      </Reveal>

      <Reveal show={three}>
        <polygon points={`${X.join(",")} ${Y.join(",")} ${Z.join(",")}`} fill={C.electron} fillOpacity={0.12} stroke={C.electron} strokeWidth={2} />
        {LEVERS.map((l) => (
          <g key={l.name}>
            <circle cx={l.corner[0]} cy={l.corner[1]} r={6} fill={l.color} />
          </g>
        ))}
        <Label x={X[0] - 10} y={X[1] + 20} size={14} weight={700} color={C.lfp} anchor="end">
          MoB
        </Label>
        <Label x={Y[0] + 10} y={Y[1] + 18} size={14} weight={700} color={C.copper} anchor="start">
          T1
        </Label>
        <Label x={Z[0] + 10} y={Z[1] - 6} size={14} weight={700} color={C.lithium} anchor="start">
          MoSi₂
        </Label>
        <circle cx={Q[0]} cy={Q[1]} r={7} fill={C.hot} />
        <Label x={Q[0] - 12} y={Q[1] + 22} size={13} color={C.hot} weight={700} anchor="end">
          alloy
        </Label>
        <Reveal show={!amounts}>
          <Label x={300} y={410} size={13}>
            the point lies in a three-phase triangle
          </Label>
          <Label x={300} y={432} size={13} color={C.electron}>
            the equilibrium phases are its three corners (schematic)
          </Label>
        </Reveal>
      </Reveal>

      <Reveal show={amounts}>
        {LEVERS.map((l) => (
          <g key={l.name}>
            <line x1={l.corner[0]} y1={l.corner[1]} x2={l.side[0]} y2={l.side[1]} stroke={l.color} strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={Q[0]} y1={Q[1]} x2={l.side[0]} y2={l.side[1]} stroke={l.color} strokeWidth={4} />
          </g>
        ))}
        <g transform="translate(385 70)">
          <rect x={0} y={0} width={200} height={146} rx={10} fill="#0b1220" stroke={C.electron} />
          <Label x={100} y={20} size={12} color={C.dim}>
            fraction =
          </Label>
          <Label x={100} y={36} size={12} color={C.dim}>
            (point → side) / (corner → side)
          </Label>
          {LEVERS.map((l, i) => (
            <Label key={l.name} x={100} y={64 + i * 22} size={14} color={l.color} weight={700}>
              {`${l.name}: ${Math.round(l.frac * 100)} %`}
            </Label>
          ))}
          <Label x={100} y={134} size={13}>
            {`sum = ${Math.round(LEVERS.reduce((n, l) => n + l.frac, 0) * 100)} %`}
          </Label>
        </g>
        <Chip x={300} y={425} text="the lever rule in 2D: the fractions add up to 100 %" color={C.electron} w={400} />
      </Reveal>
    </Stage>
  );
}
