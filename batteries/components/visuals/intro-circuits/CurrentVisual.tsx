"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage, SvgLoop } from "../primitives";

// Copper: 2, 8, 18, 1 electrons per shell.
const SHELLS = [
  { r: 42, n: 2 },
  { r: 70, n: 8 },
  { r: 100, n: 18 },
];

// Log scale for body current: 0.1 mA .. 1000 mA
const lx = (mA: number) => 60 + ((Math.log10(mA) + 1) / 4) * 480;
const ZONES = [
  { from: 0.1, to: 1, color: C.lithium, name: "not felt" },
  { from: 1, to: 10, color: C.electron, name: "felt" },
  { from: 10, to: 50, color: C.copper, name: "cramp" },
  { from: 50, to: 1000, color: C.hot, name: "fibrillation" },
];

export default function CurrentVisual({ visual }: { visual: string }) {
  const atom = visual === "charge";
  const wire = visual === "definition";
  const coulomb = visual === "coulomb";
  const danger = visual === "danger";

  return (
    <Stage label="Charge and current">
      <Reveal show={atom}>
        <Label x={300} y={40} size={16} weight={700}>
          A copper atom: 2, 8, 18, 1
        </Label>
        {SHELLS.map((s) => (
          <g key={s.r}>
            <circle cx={260} cy={235} r={s.r} fill="none" stroke={C.grid} strokeDasharray="4 4" />
            {Array.from({ length: s.n }, (_, k) => {
              const a = (k / s.n) * Math.PI * 2;
              return <circle key={k} cx={260 + Math.cos(a) * s.r} cy={235 + Math.sin(a) * s.r} r={4} fill={C.electron} opacity={0.75} />;
            })}
          </g>
        ))}
        <circle cx={260} cy={235} r={24} fill={C.hot} />
        <Label x={260} y={241} size={14} color="#0b1220" weight={800}>
          29+
        </Label>
        <circle cx={260} cy={235} r={130} fill="none" stroke={C.grid} strokeDasharray="4 4" />
        {/* the lone 4s electron: sits on the outer shell, then leaves the atom */}
        <circle cx={390} cy={235} r={7} fill={C.electron}>
          <SvgLoop attr="cx" values={[390, 390, 560]} keyTimes={[0, 0.4, 1]} dur={3} active={atom} />
          <SvgLoop attr="opacity" values={[1, 1, 0]} keyTimes={[0, 0.4, 1]} dur={3} active={atom} />
        </circle>
        <Label x={470} y={205} size={13} color={C.electron} weight={700}>
          loosely bound
        </Label>
        <Label x={470} y={222} size={13} color={C.electron} weight={700}>
          outer electron
        </Label>
        <Chip x={300} y={410} text="free electrons carry charge, moving charge carries energy" w={420} />
      </Reveal>

      <Reveal show={wire}>
        <rect x={60} y={170} width={480} height={80} rx={40} fill={C.copper} opacity={0.22} stroke={C.copper} />
        <Flow path="M540 195 L60 195" count={8} dur={4} color={C.electron} r={5} label="−" />
        <Flow path="M540 226 L60 226" count={8} dur={4.6} color={C.electron} r={5} label="−" />
        <line x1={300} y1={150} x2={300} y2={270} stroke={C.ink} strokeDasharray="5 4" />
        <Label x={300} y={292} size={13} color={C.dim}>
          count the charge passing per second
        </Label>
        <line x1={150} y1={125} x2={450} y2={125} stroke={C.accent} strokeWidth={3} markerEnd="url(#arrow)" />
        <Label x={300} y={112} size={14} color={C.accent} weight={700}>
          conventional current I →
        </Label>
        <Label x={300} y={322} size={14} color={C.electron} weight={700}>
          ← electrons drift the other way
        </Label>
        <Chip x={300} y={380} text="1 A = 1 C/s" color={C.accent} w={140} />
      </Reveal>

      <Reveal show={coulomb}>
        <Label x={300} y={60} size={16} weight={700}>
          Classic exam slip
        </Label>
        <rect x={120} y={95} width={360} height={60} rx={12} fill={C.hot} opacity={0.12} stroke={C.hot} />
        <Label x={300} y={133} size={20} color={C.hot} weight={700}>
          1 C = 1 mol of electrons
        </Label>
        <motion.line
          x1={140}
          y1={126}
          x2={460}
          y2={126}
          stroke={C.hot}
          strokeWidth={4}
          initial={false}
          animate={{ pathLength: coulomb ? 1 : 0 }}
          transition={{ delay: coulomb ? 0.5 : 0, duration: 0.5 }}
        />
        <Label x={500} y={135} size={26} color={C.hot} weight={800}>
          ✗
        </Label>
        <rect x={90} y={185} width={420} height={150} rx={12} fill={C.lithium} opacity={0.08} stroke={C.lithium} />
        <Label x={300} y={222} size={19} color={C.lithium} weight={700}>
          1 C ≈ 6.24 × 10¹⁸ electrons
        </Label>
        <Label x={300} y={262} size={19} color={C.lithium} weight={700}>
          1 mol e⁻ = 96 485 C
        </Label>
        <Label x={300} y={300} size={14} color={C.dim}>
          (the Faraday constant F)
        </Label>
        <Label x={300} y={380} size={14} color={C.dim}>
          F = N_A · e = 6.022 × 10²³ × 1.602 × 10⁻¹⁹ C
        </Label>
      </Reveal>

      <Reveal show={danger}>
        <Label x={300} y={50} size={16} weight={700}>
          Current through the body (log scale)
        </Label>
        {ZONES.map((z) => (
          <motion.rect
            key={z.name}
            x={lx(z.from)}
            y={220}
            height={34}
            fill={z.color}
            opacity={0.75}
            initial={false}
            animate={{ width: danger ? lx(z.to) - lx(z.from) : 0 }}
            transition={{ duration: 0.8 }}
          />
        ))}
        {[0.1, 1, 10, 100, 1000].map((v) => (
          <g key={v}>
            <line x1={lx(v)} x2={lx(v)} y1={254} y2={262} stroke={C.dim} />
            <Label x={lx(v)} y={280} size={12} color={C.dim}>
              {v < 1 ? "0.1 mA" : v >= 1000 ? "1 A" : `${v} mA`}
            </Label>
          </g>
        ))}
        <line x1={lx(1)} x2={lx(1)} y1={196} y2={220} stroke={C.electron} />
        <Label x={lx(1)} y={190} size={13} color={C.electron} weight={700}>
          ≈1 mA: you feel it
        </Label>
        <line x1={lx(10)} x2={lx(10)} y1={166} y2={220} stroke={C.copper} />
        <Label x={lx(10)} y={160} size={13} color={C.copper} weight={700}>
          ≈10 mA: can&apos;t let go
        </Label>
        <line x1={lx(70)} x2={lx(70)} y1={196} y2={220} stroke={C.hot} />
        <Label x={lx(70) + 20} y={190} size={13} color={C.hot} weight={700}>
          50–100 mA: fibrillation
        </Label>
        <Chip x={300} y={340} text="the current kills; the voltage decides how much flows" color={C.hot} w={420} />
        <Label x={300} y={380} size={14} color={C.dim}>
          I = V / R_body
        </Label>
      </Reveal>
    </Stage>
  );
}
