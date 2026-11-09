"use client";

import { C, Chip, Flow, Label, Reveal, Stage } from "../primitives";
import { Bars, Card, Title } from "../blocks";

export default function IntroVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="Why analyse battery materials">
      <Reveal show={is("nobel")}>
        <Title>Nobel Prize in Chemistry 2019</Title>
        <Label x={300} y={388} size={13} color={C.dim}>
          Goodenough · Whittingham · Yoshino
        </Label>
        <rect x={60} y={100} width={150} height={220} rx={10} fill={C.graphite} />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={70} x2={200} y1={120 + i * 35} y2={120 + i * 35} stroke="#1e293b" strokeWidth={6} />
        ))}
        <rect x={390} y={100} width={150} height={220} rx={10} fill={C.lfp} opacity={0.5} />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={400} x2={530} y1={120 + i * 35} y2={120 + i * 35} stroke={C.lfp} strokeWidth={6} />
        ))}
        <rect x={240} y={100} width={120} height={220} fill={C.cation} opacity={0.08} />
        <Flow path="M200 210 L390 210" count={5} dur={2.5} color={C.lithium} r={7} label="+" />
        <path d="M135 100 L135 70 L465 70 L465 100" fill="none" stroke={C.electron} strokeWidth={2} strokeDasharray="4 4" />
        <Flow path="M135 100 L135 82 L465 82 L465 100" count={4} dur={2.5} color={C.electron} r={4} />
        <Label x={135} y={345} size={14} weight={700}>
          graphite anode
        </Label>
        <Label x={135} y={363} size={12} color={C.dim}>
          LiC₆ → C₆ + Li⁺ + e⁻
        </Label>
        <Label x={465} y={345} size={14} weight={700}>
          LiCoO₂ cathode
        </Label>
        <Label x={465} y={363} size={12} color={C.dim}>
          Li₁₋ₓCoO₂ + xLi⁺ + xe⁻ → LiCoO₂
        </Label>
        <Chip x={300} y={420} text="discharge: ≈ 3.8 V" color={C.lithium} w={180} />
      </Reveal>

      <Reveal show={is("anatomy")}>
        <Title>Inside a cylindrical cell</Title>
        {[
          { t: "Cu foil", c: C.copper, h: 6 },
          { t: "anode (graphite + Si)", c: C.graphite, h: 36 },
          { t: "separator (PP, ~40 % porous)", c: C.cloth, h: 12 },
          { t: "cathode (LCO, LFP, NMC)", c: C.lfp, h: 36 },
          { t: "Al foil", c: C.zinc, h: 6 },
        ].reduce<{ y: number; els: JSX.Element[] }>(
          (acc, l) => {
            acc.els.push(
              <g key={l.t}>
                <rect x={40} y={acc.y} width={240} height={l.h} fill={l.c} opacity={0.9} />
                <Label x={290} y={acc.y + l.h / 2 + 5} anchor="start" size={13}>
                  {l.t}
                </Label>
              </g>
            );
            acc.y += l.h + 2;
            return acc;
          },
          { y: 90, els: [] }
        ).els}
        <Label x={300} y={74} size={12} color={C.dim}>
          one stack ≈ 100–200 µm per electrode, wound into a jelly roll
        </Label>
        <Label x={300} y={262} size={15} weight={700}>
          Porous electrode, ≈ 30 % porosity
        </Label>
        <Bars
          items={[
            { label: "active material", value: 90, color: C.lfp, note: "> 90 wt%" },
            { label: "conductive carbon", value: 5, color: C.graphite, note: "< 5 wt%" },
            { label: "binder (PVDF)", value: 5, color: C.anion, note: "< 5 wt%" },
          ]}
          x={190}
          y={282}
          w={280}
          gap={44}
          max={100}
          show={is("anatomy")}
          format={() => ""}
        />
      </Reveal>

      <Reveal show={is("sei")}>
        <Title>Interfaces decide how it ages</Title>
        <rect x={60} y={90} width={140} height={230} fill={C.graphite} rx={8} />
        <rect x={200} y={90} width={18} height={230} fill={C.electron} opacity={0.7} />
        <rect x={218} y={90} width={160} height={230} fill={C.cation} opacity={0.1} />
        <Label x={130} y={210} size={14} weight={700}>
          anode
        </Label>
        <Label x={209} y={80} size={12} color={C.electron}>
          SEI
        </Label>
        <Label x={298} y={210} size={14} color={C.dim}>
          electrolyte
        </Label>
        {[
          [300, 130],
          [330, 260],
          [340, 160],
          [270, 290],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={6} fill={C.hot}>
            <animate attributeName="cx" values={`${x};210`} dur={`${3 + i}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <Card
          x={400}
          y={90}
          w={180}
          h={230}
          show={is("sei")}
          title="On cycling"
          color={C.hot}
          lines={["particles crack", "electrolyte decomposes", "SEI grows", "materials dissolve", "", "2D interface or", "3D interphase"]}
        />
        <Chip x={300} y={380} text="materials analysis tells us how the battery works, and fails" w={460} color={C.accent} />
      </Reveal>
    </Stage>
  );
}
