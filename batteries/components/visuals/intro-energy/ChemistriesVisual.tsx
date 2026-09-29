"use client";

import { motion } from "framer-motion";
import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";

const ZINC = "#cbd5e1";
const MNO2 = "#44403c";

function Mistake({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g>
      <Label x={x} y={y} size={14} color={C.hot}>
        {text}
      </Label>
      <line x1={x - text.length * 3.6} x2={x + text.length * 3.6} y1={y - 5} y2={y - 5} stroke={C.hot} strokeWidth={2.5} />
    </g>
  );
}

/** Alkaline cell cross-section: MnO2 cathode ring, separator, Zn powder gel core. */
function AlkalineCell({ x, y, h, label }: { x: number; y: number; h: number; label: string }) {
  return (
    <g>
      <rect x={x - 40} y={y} width={80} height={h} rx={10} fill={MNO2} stroke={C.dim} strokeWidth={2} />
      <rect x={x - 26} y={y + 10} width={52} height={h - 20} rx={6} fill="#e5e7eb" opacity={0.3} />
      <rect x={x - 20} y={y + 14} width={40} height={h - 28} rx={5} fill={ZINC} opacity={0.9} />
      {Array.from({ length: Math.floor((h - 36) / 12) }, (_, i) => (
        <g key={i}>
          <circle cx={x - 9} cy={y + 24 + i * 12} r={3} fill="#94a3b8" />
          <circle cx={x + 8} cy={y + 30 + i * 12} r={3} fill="#94a3b8" />
        </g>
      ))}
      <rect x={x - 10} y={y - 10} width={20} height={10} rx={2} fill={C.dim} />
      <Label x={x} y={y + h + 22} size={14} weight={700}>
        {label}
      </Label>
    </g>
  );
}

const PROS = ["higher energy density", "cheap, abundant metals", "cathode reactant not carried"];
const CONS = ["poor rechargeability", "slow O₂ reactions → low power", "dries out, absorbs CO₂"];

export default function ChemistriesVisual({ visual }: { visual: string }) {
  return (
    <Stage label="Battery chemistries: alkaline, metal–air and nickel–cadmium">
      <Reveal show={visual === "alkaline"}>
        <AlkalineCell x={110} y={110} h={220} label="AA" />
        <AlkalineCell x={230} y={170} h={160} label="AAA" />
        <Label x={170} y={70} size={22} weight={800} color={C.lithium}>
          1.5 V for both
        </Label>
        <Label x={170} y={92} size={13} color={C.dim}>
          size changes capacity, not voltage
        </Label>
        <g>
          <path d="M240 205 L330 140" stroke={C.dim} />
          <Label x={336} y={144} anchor="start" size={14} weight={700}>
            anode: Zn powder (gel)
          </Label>
          <path d="M268 250 L330 190" stroke={C.dim} />
          <Label x={336} y={194} anchor="start" size={14} weight={700}>
            cathode: MnO₂ + graphite
          </Label>
          <path d="M256 296 L330 240" stroke={C.dim} />
          <Label x={336} y={244} anchor="start" size={14} weight={700}>
            electrolyte: KOH (aq)
          </Label>
          <Label x={336} y={272} anchor="start" size={13} color={C.dim}>
            primary: used once, not recharged
          </Label>
        </g>
        <rect x={335} y={300} width={235} height={84} rx={12} fill={C.hot} opacity={0.1} stroke={C.hot} />
        <Label x={452} y={322} size={13} weight={700} color={C.hot}>
          common exam mistakes
        </Label>
        <Mistake x={452} y={346} text="1.2 V, depends on size" />
        <Mistake x={452} y={370} text="cathode = carbon" />
      </Reveal>

      <Reveal show={visual === "zn-c"}>
        <Label x={300} y={42} size={17} weight={700}>
          Why alkaline beats zinc–carbon
        </Label>
        {[
          { x: 160, name: "Zinc–carbon", zinc: "Zn can (sheet)", elec: "NH₄Cl / ZnCl₂", note: "less active material used", color: C.dim, e: 0.45 },
          { x: 440, name: "Alkaline", zinc: "Zn powder: huge surface", elec: "KOH: conducts better", note: "more active material, high current", color: C.lithium, e: 0.9 },
        ].map((b) => (
          <g key={b.name}>
            <Label x={b.x} y={85} size={16} weight={700} color={b.color}>
              {b.name}
            </Label>
            <rect x={b.x - 110} y={100} width={220} height={36} rx={8} fill="#111a2c" stroke={C.grid} />
            <Label x={b.x} y={123} size={13}>
              {b.zinc}
            </Label>
            <rect x={b.x - 110} y={144} width={220} height={36} rx={8} fill="#111a2c" stroke={C.grid} />
            <Label x={b.x} y={167} size={13}>
              {b.elec}
            </Label>
            <motion.rect
              x={b.x - 40}
              width={80}
              rx={8}
              fill={b.color}
              opacity={0.8}
              initial={false}
              animate={{ y: visual === "zn-c" ? 360 - b.e * 150 : 360, height: visual === "zn-c" ? b.e * 150 : 0 }}
              transition={{ duration: 0.8 }}
            />
            <Label x={b.x} y={380} size={13} color={C.dim}>
              {b.note}
            </Label>
          </g>
        ))}
        <Label x={300} y={300} size={13} color={C.dim}>
          delivered energy
        </Label>
        <Chip x={300} y={420} text="more of the Zn and MnO₂ actually reacts, especially at high current" color={C.lithium} w={500} />
      </Reveal>

      <Reveal show={visual === "metal-air" || visual === "metal-air-vs"}>
        <Label x={300} y={40} size={17} weight={700}>
          Metal–air: the cathode breathes
        </Label>
        <rect x={80} y={80} width={130} height={200} rx={10} fill={ZINC} opacity={0.8} />
        <Label x={145} y={185} size={15} weight={800} color="#0b1220">
          metal
        </Label>
        <rect x={210} y={80} width={150} height={200} fill={C.accent} opacity={0.15} />
        <Label x={285} y={185} size={13} color={C.accent}>
          electrolyte
        </Label>
        <rect x={360} y={80} width={40} height={200} fill={C.graphite} />
        {[110, 160, 210, 250].map((y, i) => (
          <circle key={y} cx={372 + (i % 2) * 16} cy={y} r={4} fill="#0b1220" />
        ))}
        <Label x={380} y={300} size={12} color={C.dim}>
          porous air electrode
        </Label>
        <Flow path="M520 180 L405 180" count={4} dur={1.8} color="#fca5a5" r={6} label="O" />
        <Label x={470} y={160} size={14} weight={700} color="#fca5a5">
          O₂ from air
        </Label>
        <Reveal show={visual === "metal-air"}>
          {[
            { m: "Zn–air", e: "aqueous KOH", c: C.lfp },
            { m: "Al–air", e: "aqueous (lab)", c: C.zinc },
            { m: "Li–air", e: "non-aqueous", c: C.lithium },
          ].map((r, i) => (
            <g key={r.m}>
              <rect x={40 + i * 180} y={330} width={160} height={52} rx={10} fill={r.c} opacity={0.15} stroke={r.c} />
              <Label x={120 + i * 180} y={352} size={14} weight={700} color={r.c}>
                {r.m}
              </Label>
              <Label x={120 + i * 180} y={372} size={12}>
                {r.e}
              </Label>
            </g>
          ))}
          <Label x={300} y={420} size={13} color={C.dim}>
            same idea, different metal, electrolyte, voltage and rechargeability
          </Label>
        </Reveal>
        <Reveal show={visual === "metal-air-vs"}>
          <rect x={40} y={318} width={250} height={100} rx={10} fill={C.lithium} opacity={0.1} stroke={C.lithium} />
          <rect x={310} y={318} width={250} height={100} rx={10} fill={C.hot} opacity={0.1} stroke={C.hot} />
          {PROS.map((p, i) => (
            <Label key={p} x={165} y={346 + i * 26} size={13}>
              {`+ ${p}`}
            </Label>
          ))}
          {CONS.map((p, i) => (
            <Label key={p} x={435} y={346 + i * 26} size={13}>
              {`− ${p}`}
            </Label>
          ))}
          <Chip x={500} y={120} text="Zn–air: hearing aids" color={C.lfp} w={170} />
        </Reveal>
      </Reveal>

      <Reveal show={visual === "nicd"}>
        <Label x={300} y={40} size={17} weight={700}>
          Nickel–cadmium, ≈ 1.2 V
        </Label>
        <rect x={90} y={70} width={120} height={170} rx={10} fill="#a8a29e" opacity={0.8} />
        <Label x={150} y={150} size={15} weight={800} color="#0b1220">
          Cd (−)
        </Label>
        <Label x={150} y={172} size={12} color="#0b1220">
          → Cd(OH)₂
        </Label>
        <rect x={210} y={70} width={180} height={170} fill={C.accent} opacity={0.15} />
        <Label x={300} y={160} size={13} color={C.accent}>
          KOH (aq)
        </Label>
        <rect x={390} y={70} width={120} height={170} rx={10} fill="#65a30d" opacity={0.7} />
        <Label x={450} y={150} size={15} weight={800} color="#0b1220">
          NiOOH (+)
        </Label>
        <Label x={450} y={172} size={12} color="#0b1220">
          → Ni(OH)₂
        </Label>
        <Chip x={300} y={268} text="energy efficiency ≈ 70–80 %" color={C.accent} w={250} />
        <rect x={30} y={296} width={270} height={120} rx={10} fill={C.lithium} opacity={0.1} stroke={C.lithium} />
        <rect x={310} y={296} width={260} height={120} rx={10} fill={C.hot} opacity={0.1} stroke={C.hot} />
        {["+ robust, long cycle life", "+ high current, works in cold", "power tools · emergency light", "aviation"].map((p, i) => (
          <Label key={p} x={165} y={322 + i * 24} size={13} color={i < 2 ? C.ink : C.dim}>
            {p}
          </Label>
        ))}
        {["− cadmium is toxic", "− low energy density", "− memory effect"].map((p, i) => (
          <Label key={p} x={440} y={322 + i * 24} size={13}>
            {p}
          </Label>
        ))}
      </Reveal>
    </Stage>
  );
}
