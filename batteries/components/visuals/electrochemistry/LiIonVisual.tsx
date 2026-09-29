"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Ion, Label, Reveal, Stage } from "../primitives";

// Potential axis for li-potentials: 0 V at y=400, 4 V at y=60.
const vy = (v: number) => 400 - v * 85;

function PotentialLadder() {
  return (
    <g>
      <line x1={140} y1={vy(0)} x2={140} y2={vy(4) - 10} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />
      <Label x={150} y={vy(4) - 16} anchor="start" size={14} color={C.dim}>
        E vs Li⁺/Li (V)
      </Label>
      {[0, 1, 2, 3, 4].map((v) => (
        <g key={v}>
          <line x1={134} y1={vy(v)} x2={146} y2={vy(v)} stroke={C.dim} strokeWidth={2} />
          <Label x={124} y={vy(v) + 5} anchor="end" size={13} color={C.dim}>
            {v}
          </Label>
        </g>
      ))}
      {/* graphite */}
      <motion.rect x={160} width={170} height={22} rx={6} fill={C.graphite} initial={{ y: vy(0.1) - 11 }} animate={{ y: vy(0.1) - 11 }} />
      <Label x={245} y={vy(0.1) + 5} size={14} weight={700}>
        graphite ≈ 0.1 V
      </Label>
      <Label x={345} y={vy(0.1) + 5} anchor="start" size={14} color={C.ink} weight={700}>
        → negative (−)
      </Label>
      {/* LFP */}
      <rect x={160} y={vy(3.45) - 11} width={170} height={22} rx={6} fill={C.lfp} />
      <Label x={245} y={vy(3.45) + 5} size={14} weight={700} color="#0b1220">
        LFP ≈ 3.45 V
      </Label>
      <Label x={345} y={vy(3.45) + 5} anchor="start" size={14} weight={700}>
        → positive (+)
      </Label>
      {/* cell voltage */}
      <line x1={470} y1={vy(0.1)} x2={470} y2={vy(3.45)} stroke={C.accent} strokeWidth={2.5} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <Label x={480} y={vy(1.8)} anchor="start" size={15} color={C.accent} weight={700}>
        ≈ 3.3 V
      </Label>
      <Label x={480} y={vy(1.8) + 20} anchor="start" size={13} color={C.dim}>
        cell voltage
      </Label>
    </g>
  );
}

function Intercalation() {
  const graphiteLayers = [110, 150, 190, 230, 270, 310];
  return (
    <g>
      <Label x={300} y={40} size={16} weight={700}>
        Discharge: Li⁺ shuttles, hosts stay intact
      </Label>
      {/* current collectors */}
      <rect x={40} y={90} width={16} height={250} fill={C.copper} />
      <rect x={544} y={90} width={16} height={250} fill="#cbd5e1" />
      <Label x={48} y={360} size={12} color={C.dim}>Cu</Label>
      <Label x={552} y={360} size={12} color={C.dim}>Al</Label>
      {/* graphite layers */}
      {graphiteLayers.map((y) => (
        <line key={y} x1={60} y1={y} x2={240} y2={y} stroke={C.graphite} strokeWidth={6} strokeLinecap="round" />
      ))}
      {graphiteLayers.slice(0, -1).map((y, i) =>
        [90, 140, 190].map((x, j) =>
          (i + j) % 2 === 0 ? <circle key={`${x}-${y}`} cx={x + (i % 2) * 20} cy={y + 20} r={6} fill={C.lithium} /> : null,
        ),
      )}
      <Label x={150} y={380} size={14} weight={700}>
        graphite (LiC₆)
      </Label>
      {/* separator */}
      <rect x={285} y={90} width={30} height={250} fill={C.dim} opacity={0.18} />
      <Label x={300} y={380} size={12} color={C.dim}>
        separator
      </Label>
      {/* LFP chains */}
      {[120, 180, 240, 300].map((y) => (
        <g key={y}>
          {[370, 410, 450, 490].map((x) => (
            <rect key={x} x={x} y={y - 12} width={26} height={24} rx={4} fill={C.lfp} opacity={0.8} transform={`rotate(45 ${x + 13} ${y})`} />
          ))}
        </g>
      ))}
      <Label x={450} y={380} size={14} weight={700}>
        LFP (FePO₄ → LiFePO₄)
      </Label>
      {/* Li+ through electrolyte */}
      <Flow path="M230 170 L380 170" color={C.lithium} count={3} dur={2.4} r={6} />
      <Flow path="M230 250 L380 250" color={C.lithium} count={3} dur={2.8} r={6} />
      <Label x={300} y={150} size={13} color={C.lithium} weight={700}>
        Li⁺ →
      </Label>
      {/* electrons outside */}
      <path d="M48 90 L48 70 L552 70 L552 90" fill="none" stroke={C.dim} strokeWidth={2.5} />
      <Flow path="M48 90 L48 70 L552 70 L552 90" count={7} dur={3.5} r={4} />
      <Label x={300} y={62} size={13} color={C.electron}>
        e⁻ →
      </Label>
      <Label x={300} y={420} size={13} color={C.dim}>
        Li⁺ is only a counter-ion: it balances the electrons the host gains or loses
      </Label>
    </g>
  );
}

function Bar({ y, value, max, color, label, text }: { y: number; value: number; max: number; color: string; label: string; text: string }) {
  const w = (value / max) * 300;
  return (
    <g>
      <Label x={150} y={y + 20} anchor="end" size={14}>
        {label}
      </Label>
      <motion.rect x={165} y={y} height={30} rx={6} fill={color} initial={{ width: 0 }} animate={{ width: w }} transition={{ duration: 0.8 }} />
      <Label x={175 + w} y={y + 20} anchor="start" size={14} weight={700}>
        {text}
      </Label>
    </g>
  );
}

function Balance() {
  // Equal capacity with N/P = 1.1: m_graphite / m_LFP = 1.1 * 170 / 372 ≈ 0.50
  return (
    <g>
      <Label x={300} y={50} size={16} weight={700}>
        Match capacity, not mass
      </Label>
      <Label x={40} y={95} anchor="start" size={14} color={C.dim}>
        Specific capacity (mAh/g)
      </Label>
      <Bar y={110} value={372} max={372} color={C.graphite} label="graphite" text="372" />
      <Bar y={150} value={170} max={372} color={C.lfp} label="LFP" text="≈170" />
      <Label x={40} y={235} anchor="start" size={14} color={C.dim}>
        Mass needed in one cell (relative)
      </Label>
      <Bar y={250} value={0.5} max={1} color={C.graphite} label="graphite" text="≈ 0.5" />
      <Bar y={290} value={1} max={1} color={C.lfp} label="LFP" text="1" />
      <Chip x={300} y={370} text="N/P ≈ 1.1: negative gets ~10% extra capacity" color={C.accent} w={380} />
      <Label x={300} y={410} size={13} color={C.dim}>
        extra negative capacity → no Li plating on graphite
      </Label>
    </g>
  );
}

function Upd() {
  const atoms = [
    [180, 300],
    [230, 318],
    [290, 296],
    [350, 322],
    [410, 305],
  ];
  return (
    <g>
      <Label x={300} y={40} size={16} weight={700}>
        Underpotential deposition of Li on Cu
      </Label>
      {/* electrolyte */}
      {[150, 250, 350, 450].map((x, i) => (
        <motion.g key={x} animate={{ y: [0, 36, 36] }} transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}>
          <Ion x={x} y={120} sign="+" color={C.lithium} r={10} />
        </motion.g>
      ))}
      <Label x={520} y={125} size={13} color={C.dim}>
        Li⁺
      </Label>
      {/* copper */}
      <rect x={100} y={250} width={400} height={120} fill={C.copper} opacity={0.85} />
      <Label x={300} y={395} size={14} weight={700}>
        Cu
      </Label>
      {atoms.map(([x, y], i) => (
        <motion.circle key={x} cx={x} r={6} fill={C.lithium} animate={{ cy: [250, y] }} transition={{ repeat: Infinity, duration: 3, delay: i * 0.4, repeatType: "loop" }} />
      ))}
      <Label x={300} y={355} size={13} color="#0b1220" weight={700}>
        Li dissolves into Cu → a(Li) ≪ 1
      </Label>
      <rect x={110} y={175} width={380} height={50} rx={10} fill="#0b1220" opacity={0.9} stroke={C.accent} />
      <Label x={300} y={197} size={14}>
        E = E⁰ − (RT/F)·ln(a(Li)/[Li⁺])
      </Label>
      <Label x={300} y={217} size={14} color={C.accent} weight={700}>
        a(Li) &lt; 1 ⇒ E &gt; 0 V vs Li⁺/Li
      </Label>
      <Label x={300} y={430} size={13} color={C.dim}>
        as Li builds up, a(Li) → 1 and the potential moves down towards 0 V
      </Label>
    </g>
  );
}

function Aluminium() {
  const cols = [100, 300, 500];
  return (
    <g>
      <Label x={300} y={36} size={16} weight={700}>
        Al current collector above ~3.5 V vs Li⁺/Li
      </Label>
      {cols.map((x, i) => (
        <g key={x}>
          <rect x={x - 85} y={70} width={60} height={250} fill="#cbd5e1" />
          <Label x={x - 55} y={340} size={13} weight={700}>
            Al
          </Label>
          <motion.rect
            x={x - 25}
            y={70}
            height={250}
            fill={i === 2 ? C.anion : "#f8fafc"}
            opacity={0.85}
            initial={false}
            animate={{ width: i === 1 ? 3 : 10 }}
          />
          <Label x={x + 30} y={340} size={12} color={C.dim}>
            {i === 0 ? "Al₂O₃" : i === 1 ? "oxide dissolved" : "AlF₃"}
          </Label>
        </g>
      ))}
      {/* 1: solvent oxidation releases H+ */}
      <Flow path="M170 150 L90 150" color={C.hot} count={3} dur={2} r={6} label="H" />
      <Label x={100} y={380} size={13}>
        1 · solvent oxidised
      </Label>
      <Label x={100} y={400} size={13}>
        → releases H⁺
      </Label>
      {/* 2: oxide attacked */}
      <Flow path="M370 150 L290 150" color={C.hot} count={3} dur={2} r={6} label="H" />
      <Flow path="M280 240 L370 240" color={C.zinc} count={2} dur={2.5} r={7} />
      <Label x={300} y={380} size={13}>
        2 · Al₂O₃ + 6H⁺ →
      </Label>
      <Label x={300} y={400} size={13}>
        2Al³⁺ + 3H₂O
      </Label>
      {/* 3: LiPF6 re-passivates */}
      <Flow path="M570 180 L490 180" color={C.anion} count={3} dur={2} r={6} label="F" />
      <Label x={500} y={380} size={13}>
        3 · LiPF₆: PF₆⁻ → PF₅ + F⁻
      </Label>
      <Label x={500} y={400} size={13} color={C.accent} weight={700}>
        AlF₃ re-passivates
      </Label>
      <Label x={300} y={436} size={12} color={C.dim}>
        Mitigate (LiTFSI / LiFSI): F⁻ additive · high salt concentration · carbon-coated Al
      </Label>
    </g>
  );
}

function SiliconLithium() {
  return (
    <g>
      {/* silicon */}
      <Label x={150} y={40} size={16} weight={700}>
        Silicon
      </Label>
      <motion.circle cx={150} cy={200} fill="#a78bfa" opacity={0.85} animate={{ r: [48, 76, 48] }} transition={{ repeat: Infinity, duration: 4 }} />
      <motion.path
        d="M130 160 L150 190 L140 215 M170 170 L160 205 L180 235"
        stroke="#0b1220"
        strokeWidth={3}
        fill="none"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      />
      <Chip x={150} y={310} text="≈ 300 % volume change" color={C.hot} w={200} />
      <Label x={150} y={350} size={13}>
        cracking · lost contact
      </Label>
      <Label x={150} y={370} size={13}>
        new SEI every cycle
      </Label>
      <Label x={150} y={390} size={13}>
        diffusion-controlled Li trapping
      </Label>
      <Label x={150} y={425} size={12} color={C.dim}>
        ~3800 mAh/g vs 372 for graphite
      </Label>

      <line x1={300} y1={60} x2={300} y2={420} stroke={C.grid} strokeWidth={2} />

      {/* lithium metal */}
      <Label x={450} y={40} size={16} weight={700}>
        Lithium metal
      </Label>
      <rect x={340} y={250} width={220} height={40} fill="#d9f99d" opacity={0.9} />
      <Label x={450} y={276} size={13} color="#0b1220" weight={700}>
        Li
      </Label>
      <rect x={340} y={90} width={220} height={12} fill={C.dim} opacity={0.35} />
      <Label x={450} y={82} size={12} color={C.dim}>
        separator
      </Label>
      <motion.path
        d="M450 250 L450 170 M450 205 L425 180 M450 190 L472 160 M425 180 L415 150"
        stroke={C.lithium}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
        animate={{ pathLength: [0, 1] }}
        transition={{ repeat: Infinity, duration: 3, repeatDelay: 0.8 }}
      />
      <Chip x={450} y={330} text="dendrites → short circuit" color={C.hot} w={220} />
      <Label x={450} y={370} size={13}>
        few nuclei at low overpotential
      </Label>
      <Label x={450} y={390} size={13}>
        reacts with electrolyte (SEI)
      </Label>
    </g>
  );
}

export default function LiIonVisual({ visual }: { visual: string }) {
  return (
    <Stage label="Lithium-ion battery with graphite and LFP">
      <Reveal show={visual === "li-potentials"}>
        <PotentialLadder />
      </Reveal>
      <Reveal show={visual === "li-intercalation"}>
        <Intercalation />
      </Reveal>
      <Reveal show={visual === "li-balance"}>
        {visual === "li-balance" && <Balance />}
      </Reveal>
      <Reveal show={visual === "li-upd"}>
        <Upd />
      </Reveal>
      <Reveal show={visual === "li-aluminium"}>
        <Aluminium />
      </Reveal>
      <Reveal show={visual === "li-silicon"}>
        <SiliconLithium />
      </Reveal>
    </Stage>
  );
}
