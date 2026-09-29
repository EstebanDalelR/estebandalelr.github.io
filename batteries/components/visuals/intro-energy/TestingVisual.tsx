"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";

/* potential ladder vs SHE: y = 230 - E * 60 */
const py = (e: number) => 230 - e * 60;
const COUPLES = [
  { name: "Li⁺/Li", e: -3.04, color: C.lithium },
  { name: "Zn²⁺/Zn", e: -0.76, color: C.zinc },
  { name: "H⁺/H₂ (SHE)", e: 0, color: C.ink },
  { name: "Cu²⁺/Cu", e: 0.34, color: C.copper },
  { name: "O₂/H₂O", e: 1.23, color: "#fca5a5" },
];

/* capacity vs cycle */
const cBox = { x: 90, y: 70, w: 450, h: 250 };
const cs = makeScale(cBox, [0, 500], [0, 180]);

/* charge / discharge curves over the same charge */
const eBox = { x: 90, y: 60, w: 450, h: 270 };
const es = makeScale(eBox, [0, 1], [2.6, 4.3]);
const qs = Array.from({ length: 81 }, (_, i) => i / 80);
const ocv = (q: number) => 3.4 + 0.35 * q + 0.12 * Math.log((q + 0.02) / (1.02 - q)) * 0.4;
const charge: [number, number][] = qs.map((q) => [q, ocv(q) + 0.18]);
// Both plotted against state of charge: charge sits ~2η above the OCV, discharge ~2η below.
const discharge: [number, number][] = qs.map((q) => [q, ocv(q) - 0.18]);
const area = (pts: [number, number][]) => es.path(pts) + `L${es.sx(1)},${es.sy(2.6)}L${es.sx(0)},${es.sy(2.6)}Z`;

/* current-interrupt relaxation */
const rBox = { x: 90, y: 60, w: 450, h: 270 };
const rs = makeScale(rBox, [0, 10], [3.0, 3.8]);
const tInt = 2;
const relax = (t: number) => {
  if (t < tInt) return 3.2;
  const dt = t - tInt;
  return 3.2 + 0.2 + 0.15 * (1 - Math.exp(-dt / 0.15)) + 0.2 * (1 - Math.exp(-dt / 2.5));
};
const relaxPts: [number, number][] = Array.from({ length: 201 }, (_, i) => {
  const t = (i / 200) * 10;
  return [t, t === tInt ? 3.2 : relax(t)];
});

export default function TestingVisual({ visual }: { visual: string }) {
  return (
    <Stage label="Testing batteries and voltage losses">
      <Reveal show={visual === "cell-voltage"}>
        <Label x={300} y={40} size={17} weight={700}>
          Standard potentials vs the hydrogen electrode
        </Label>
        <line x1={200} y1={py(1.6)} x2={200} y2={py(-3.3)} stroke={C.dim} strokeWidth={2} />
        {COUPLES.map((c) => (
          <g key={c.name}>
            <line x1={190} x2={210} y1={py(c.e)} y2={py(c.e)} stroke={c.color} strokeWidth={3} />
            <Label x={180} y={py(c.e) + 5} anchor="end" size={13} color={c.color}>
              {`${c.e > 0 ? "+" : ""}${c.e.toFixed(2)} V`}
            </Label>
            <Label x={220} y={py(c.e) + 5} anchor="start" size={13} weight={700} color={c.color}>
              {c.name}
            </Label>
          </g>
        ))}
        <path d={`M430 ${py(-0.76)} L430 ${py(0.34)}`} stroke={C.accent} strokeWidth={3} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <Label x={440} y={(py(-0.76) + py(0.34)) / 2 - 6} anchor="start" size={14} weight={700} color={C.accent}>
          Daniell cell
        </Label>
        <Label x={440} y={(py(-0.76) + py(0.34)) / 2 + 14} anchor="start" size={14} color={C.accent}>
          0.34 − (−0.76) = 1.10 V
        </Label>
        <Chip x={300} y={82} text="one number per half reaction → any cell by subtraction" color={C.accent} w={440} />
      </Reveal>

      <Reveal show={visual === "cycling"}>
        <Axes box={cBox} xLabel="cycle number" yLabel="discharge capacity (mAh/g)" xLabelDy={40} />
        {[0, 100, 200, 300, 400, 500].map((n) => (
          <Label key={n} x={cs.sx(n)} y={cBox.y + cBox.h + 18} size={12} color={C.dim}>
            {n}
          </Label>
        ))}
        {Array.from({ length: 50 }, (_, i) => {
          const n = i * 10 + 5;
          const cap = 160 * (1 - 0.18 * (n / 500) ** 0.9) + (i % 3) * 0.8;
          return <motion.circle key={n} cx={cs.sx(n)} cy={cs.sy(cap)} r={3.5} fill={C.lithium} initial={false} animate={{ opacity: visual === "cycling" ? 1 : 0 }} transition={{ delay: i * 0.02 }} />;
        })}
        <Chip x={300} y={250} text="constant current between fixed voltage limits" color={C.accent} w={380} />
        <Label x={300} y={430} size={13} color={C.dim}>
          constant current = constant reaction rate · capacity = I × t
        </Label>
      </Reveal>

      <Reveal show={visual === "ce-vs-ee"}>
        <Axes box={eBox} xLabel="state of charge 0 → 100 % (same Q)" yLabel="cell voltage (V)" />
        <motion.path d={area(charge)} fill={C.hot} initial={false} animate={{ opacity: visual === "ce-vs-ee" ? 0.15 : 0 }} />
        <motion.path d={area(discharge)} fill={C.lithium} initial={false} animate={{ opacity: visual === "ce-vs-ee" ? 0.25 : 0 }} />
        <DrawPath d={es.path(charge)} show={visual === "ce-vs-ee"} color={C.hot} width={3} />
        <DrawPath d={es.path(discharge)} show={visual === "ce-vs-ee"} color={C.lithium} width={3} delay={0.3} />
        <Label x={es.sx(0.3)} y={es.sy(ocv(0.3) + 0.18) - 12} size={13} weight={700} color={C.hot}>
          charge
        </Label>
        <Label x={es.sx(0.7)} y={es.sy(ocv(0.7) - 0.18) + 24} size={13} weight={700} color={C.lithium}>
          discharge
        </Label>
        <rect x={100} y={70} width={200} height={62} rx={10} fill="#0b1220" opacity={0.9} stroke={C.grid} />
        <Label x={200} y={94} size={13}>
          CE = Q_out / Q_in ≈ 100 %
        </Label>
        <Label x={200} y={118} size={13} color={C.lithium}>
          EE = green area / red area
        </Label>
        <Chip x={300} y={420} text="charge voltage > discharge voltage → EE < CE, always" color={C.hot} w={430} />
      </Reveal>

      <Reveal show={visual === "losses"}>
        <Axes box={rBox} xLabel="time →" yLabel="cell voltage" />
        <line x1={rs.sx(tInt)} x2={rs.sx(tInt)} y1={rBox.y} y2={rBox.y + rBox.h} stroke={C.dim} strokeDasharray="4 4" />
        <Label x={rs.sx(tInt) - 6} y={rBox.y + 14} anchor="end" size={12} color={C.dim}>
          current switched off
        </Label>
        <DrawPath d={rs.path(relaxPts)} show={visual === "losses"} color={C.accent} width={3.5} />
        <path d={`M${rs.sx(tInt) + 14} ${rs.sy(3.2)} L${rs.sx(tInt) + 14} ${rs.sy(3.4)}`} stroke={C.electron} strokeWidth={3} />
        <Label x={rs.sx(tInt) + 22} y={rs.sy(3.3) + 5} anchor="start" size={13} weight={700} color={C.electron}>
          instant: ohmic (iR)
        </Label>
        <Label x={rs.sx(3.2)} y={rs.sy(3.55) - 4} anchor="start" size={13} weight={700} color={C.hot}>
          ms: activation
        </Label>
        <Label x={rs.sx(7.5)} y={190} size={13} weight={700} color={C.anion}>
          seconds+: concentration
        </Label>
        <Chip x={300} y={415} text="the same three processes limit the current · EIS separates them" color={C.accent} w={480} />
      </Reveal>
    </Stage>
  );
}
