"use client";

import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Bars, Card, Timeline, Title } from "../blocks";

/* Schematic EV interest over time: rise, decline, return. */
const box = { x: 70, y: 290, w: 480, h: 110 };
const s = makeScale(box, [1880, 2025], [0, 1]);
const INTEREST: [number, number][] = [
  [1880, 0.05],
  [1895, 0.35],
  [1905, 0.6],
  [1915, 0.45],
  [1925, 0.12],
  [1950, 0.04],
  [1968, 0.06],
  [1975, 0.18],
  [1990, 0.15],
  [2000, 0.25],
  [2010, 0.45],
  [2025, 0.98],
];

function InterestCurve({ show, upTo }: { show: boolean; upTo: number }) {
  const pts = INTEREST.filter(([y]) => y <= upTo);
  return (
    <g>
      <Axes box={box} xLabel="year" yLabel="interest in EVs (schematic)" />
      {[1900, 1950, 2000].map((y) => (
        <Label key={y} x={s.sx(y)} y={box.y + box.h + 16} size={11} color={C.dim}>
          {y}
        </Label>
      ))}
      <path d={s.path(INTEREST)} fill="none" stroke={C.grid} strokeWidth={3} />
      <DrawPath d={s.path(pts)} show={show} color={C.accent} />
    </g>
  );
}

export default function HistoryVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="History of electric vehicles">
      <Reveal show={is("rise")}>
        <Title y={32}>Rise: electric was first</Title>
        <Timeline
          events={[
            { year: 1881, label: "tricycle, Paris", color: C.electron },
            { year: 1888, label: "first practical car", color: C.lithium },
            { year: 1890, label: "6 passengers, 22.5 km/h", color: C.lfp },
          ]}
          from={1878}
          to={1895}
          y={140}
          x0={90}
          x1={510}
          show={is("rise")}
        />
        <InterestCurve show={is("rise")} upTo={1905} />
      </Reveal>

      <Reveal show={is("decline")}>
        <Title>Decline in the 1920s</Title>
        {["large oil discoveries → cheap petrol", "better roads → longer trips", "combustion cars had the range"].map((t, i) => (
          <Chip key={t} x={300} y={90 + i * 42} text={t} color={C.hot} w={330} />
        ))}
        <InterestCurve show={is("decline")} upTo={1950} />
        <Label x={s.sx(1945)} y={s.sy(0.62)} size={13} color={C.hot}>
          trams survive in cities
        </Label>
      </Reveal>

      <Reveal show={is("return")}>
        <Title y={32}>Return: oil shocks and clean air</Title>
        <Timeline
          events={[
            { year: 1968, label: "oil prices, smog", color: C.hot },
            { year: 1971, label: "Apollo 15 rover", color: C.lfp },
            { year: 1997, label: "Toyota Prius", sub: "hybrid", color: C.electron },
            { year: 2008, label: "Tesla Roadster", sub: "322 km", color: C.lithium },
            { year: 2010, label: "Nissan Leaf", sub: "mass market", color: C.accent },
          ]}
          from={1962}
          to={2016}
          y={150}
          x0={70}
          x1={530}
          show={is("return")}
          even
        />
        <InterestCurve show={is("return")} upTo={2025} />
      </Reveal>

      <Reveal show={is("now")}>
        <Title>Now: cheap packs, heavy transport</Title>
        <Label x={160} y={86} size={14} weight={700}>
          Li-ion pack price ($/kWh)
        </Label>
        <Bars
          items={[
            { label: "2013", value: 780, color: C.hot },
            { label: "2018", value: 180, color: C.electron },
            { label: "today", value: 108, color: C.lithium },
          ]}
          x={70}
          y={100}
          w={200}
          gap={42}
          show={is("now")}
        />
        <Label x={160} y={244} size={11} color={C.dim}>
          approximate BNEF averages
        </Label>
        <Card
          x={320}
          y={70}
          w={250}
          h={180}
          show={is("now")}
          delay={0.3}
          title="Volvo FH Aero Electric"
          color={C.lfp}
          lines={["up to 600 km range", "20 → 80 % in ≈ 40 min", "with MCS", "launch planned 2026"]}
          size={14}
        />
        <rect x={60} y={290} width={480} height={110} rx={14} fill="#0b1220" stroke={C.electron} />
        <Label x={300} y={320} size={16} weight={800} color={C.electron}>
          Megawatt Charging System (MCS)
        </Label>
        <Label x={300} y={348} size={14}>
          up to 1.44 MW · first public demo: Milence hub, Landvetter
        </Label>
        <Label x={300} y={372} size={12} color={C.dim}>
          part of a European corridor for long-haul electric freight
        </Label>
      </Reveal>

      <Reveal show={is("water-air")}>
        <Title>On water and in the air</Title>
        <Card
          x={30}
          y={70}
          w={260}
          h={230}
          show={is("water-air")}
          title="Candela P-12 hydrofoil"
          color={C.lfp}
          lines={["SL line 89, Ekerö–City Hall", "55 → 30 min", "−66 % energy", "−94 % CO₂", "+22.5 % ridership", "~30 passengers, ~46 km/h"]}
        />
        <Card
          x={310}
          y={70}
          w={260}
          h={230}
          show={is("water-air")}
          delay={0.25}
          title="Electric flight"
          color={C.electron}
          lines={["Heart Aerospace ES-30:", "30 seats, hybrid-electric, ~2031", "", "Elysian E9X:", "90–100 seats, fully electric, ~2033"]}
        />
        <Chip x={300} y={360} text="autonomous: Waymo robotaxis, EasyMile shuttles, Zeam ferry" w={460} color={C.accent} />
        <Label x={300} y={405} size={12} color={C.dim}>
          Stockholm's self-driving Zeam ferry (Kungsholmen–Södermalm) runs since 2023
        </Label>
      </Reveal>
    </Stage>
  );
}
