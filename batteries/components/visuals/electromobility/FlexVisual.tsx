"use client";

import { motion } from "framer-motion";
import { Axes, C, Chip, DrawPath, Label, Reveal, Stage, makeScale } from "../primitives";
import { Card, Table, Title } from "../blocks";

const bump = (h: number, mu: number, sig: number) => Math.exp(-(((h - mu) / sig) ** 2) / 2);
const HRS = Array.from({ length: 97 }, (_, i) => i / 4);

/* Load curve: base, uncoordinated EVs, V1G valley filling, V2G peak shaving (schematic). */
const lBox = { x: 80, y: 80, w: 460, h: 220 };
const ls = makeScale(lBox, [0, 24], [0, 1.25]);
const base = (h: number) => 0.32 + 0.16 * bump(h, 8, 1.5) + 0.3 * bump(h, 19, 1.8) + 0.05 * bump(h, 13, 3);
const unco = (h: number) => base(h) + 0.3 * bump(h, 19.5, 1.6);
const v1g = (h: number) => base(h) + 0.17 / (1 + Math.exp((h - 6.3) * 5)) + 0.17 / (1 + Math.exp(-(h - 22.7) * 5));
const v2g = (h: number) => v1g(h) - 0.2 * bump(h, 19, 1.5);
const lpath = (f: (h: number) => number) => ls.path(HRS.map((h) => [h, f(h)] as [number, number]));

/* Frequency dip and EV response. */
const fBox = { x: 80, y: 90, w: 460, h: 200 };
const fs = makeScale(fBox, [0, 10], [49.7, 50.15]);
const TS = Array.from({ length: 101 }, (_, i) => i / 10);
const dip = (t: number, k: number) => (t < 2 ? 50 : 50 - 0.25 * Math.exp(-(t - 2) * k) * (1 - Math.exp(-(t - 2) * 6)) * (k < 1 ? 1.4 : 0.6));

/* Solar and workplace charging. */
const solar = (h: number) => 0.9 * Math.max(0, Math.sin(((h - 6) / 12) * Math.PI)) ** 1.5;
const work = (h: number) => 0.55 / (1 + Math.exp(-(h - 8.5) * 6)) / (1 + Math.exp((h - 16) * 6));

/* V2G services by response time, on a log scale of seconds. */
const SVC = [
  { t: "voltage / reactive power", a: 0.005, b: 3, c: C.anion },
  { t: "frequency regulation", a: 0.1, b: 10, c: C.accent },
  { t: "operating reserves", a: 1, b: 900, c: C.lfp },
  { t: "peak shaving", a: 60, b: 4 * 3600, c: C.electron },
  { t: "renewable integration", a: 60, b: 6 * 3600, c: C.lithium },
  { t: "congestion management", a: 60, b: 4 * 3600, c: C.hot },
  { t: "valley filling", a: 3600, b: 10 * 3600, c: C.copper },
  { t: "capacity markets", a: 3600, b: 4 * 86400, c: C.zinc },
];
const tx = (sec: number) => 210 + ((Math.log10(sec) + 3) / 9) * 360;

export default function FlexVisual({ visual }: { visual: string }) {
  const is = (v: string) => visual === v;
  return (
    <Stage label="What EV flexibility offers the grid">
      <Reveal show={is("load-curve")}>
        <Title y={40}>#1 Reshaping the load curve</Title>
        <Axes box={lBox} xLabel="hour of day" yLabel="grid load" xLabelDy={40} />
        {[0, 6, 12, 18, 24].map((h) => (
          <Label key={h} x={ls.sx(h)} y={lBox.y + lBox.h + 16} size={11} color={C.dim}>
            {h}
          </Label>
        ))}
        <DrawPath d={lpath(unco)} show={is("load-curve")} color={C.hot} width={2.5} dash="6 5" />
        <DrawPath d={lpath(v1g)} show={is("load-curve")} color={C.lithium} delay={0.5} width={2.5} />
        <DrawPath d={lpath(v2g)} show={is("load-curve")} color={C.accent} delay={1} width={3.5} />
        <Label x={ls.sx(19.5)} y={ls.sy(unco(19.5)) - 10} size={12} weight={700} color={C.hot}>
          uncoordinated
        </Label>
        <Label x={ls.sx(3)} y={ls.sy(v1g(3)) - 12} size={12} weight={700} color={C.lithium}>
          V1G fills the valley
        </Label>
        <Label x={ls.sx(19)} y={ls.sy(v2g(19)) + 24} size={12} weight={700} color={C.accent}>
          V2G shaves the peak
        </Label>
        <Chip x={300} y={390} text="fewer fossil peak plants needed" w={280} color={C.accent} />
      </Reveal>

      <Reveal show={is("frequency")}>
        <Title y={40}>#2 Frequency and voltage support</Title>
        <Axes box={fBox} xLabel="time (s)" yLabel="frequency (Hz)" xLabelDy={30} />
        <line x1={fBox.x} x2={fBox.x + fBox.w} y1={fs.sy(50)} y2={fs.sy(50)} stroke={C.dim} strokeDasharray="4 4" />
        <Label x={fBox.x - 8} y={fs.sy(50) + 4} anchor="end" size={12} color={C.dim}>
          50
        </Label>
        <DrawPath d={fs.path(TS.map((t) => [t, dip(t, 0.35)] as [number, number]))} show={is("frequency")} color={C.hot} width={2.5} dash="6 5" />
        <DrawPath d={fs.path(TS.map((t) => [t, dip(t, 2.5)] as [number, number]))} show={is("frequency")} color={C.accent} delay={0.6} />
        <Label x={fs.sx(6.5)} y={fs.sy(49.86)} size={12} weight={700} color={C.hot}>
          thermal plants only
        </Label>
        <Label x={fs.sx(5.5)} y={fs.sy(50.06)} size={12} weight={700} color={C.accent}>
          + EV fleet reacting within 500 ms
        </Label>
        <Label x={fs.sx(2)} y={fBox.y + fBox.h + 16} size={11} color={C.dim}>
          trip
        </Label>
        <Chip x={190} y={370} text="primary reserve: FCR" w={200} color={C.accent} />
        <Chip x={430} y={370} text="inverters inject / absorb VAR" w={250} color={C.anion} />
        <Label x={300} y={415} size={12} color={C.dim}>
          ENTSO-E position paper, 2021
        </Label>
      </Reveal>

      <Reveal show={is("congestion")}>
        <Title>#3–5 Congestion, overload, voltage</Title>
        <line x1={40} y1={150} x2={560} y2={150} stroke={C.lfp} strokeWidth={4} />
        <rect x={20} y={120} width={44} height={60} rx={6} fill={C.lfp} opacity={0.3} stroke={C.lfp} />
        <Label x={42} y={200} size={11} color={C.dim}>
          substation
        </Label>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = 120 + i * 78;
          const hot = i >= 3;
          return (
            <g key={i}>
              <line x1={x + 22} y1={150} x2={x + 22} y2={196} stroke={hot ? C.hot : C.dim} strokeWidth={2} />
              <path d={`M${x} 240 L${x} 214 L${x + 22} 196 L${x + 44} 214 L${x + 44} 240 Z`} fill={hot ? C.hot : C.dim} opacity={0.2} stroke={hot ? C.hot : C.dim} />
              <Label x={x + 22} y={258} size={11} color={hot ? C.hot : C.dim}>
                11 kW
              </Label>
            </g>
          );
        })}
        <motion.rect
          x={340}
          y={140}
          width={220}
          height={20}
          rx={6}
          fill={C.hot}
          initial={false}
          animate={{ opacity: is("congestion") ? [0.15, 0.5, 0.15] : 0 }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        <Label x={450} y={130} size={12} weight={700} color={C.hot}>
          feeder overload
        </Label>
        <Card x={20} y={285} w={180} h={120} show={is("congestion")} title="Congestion" color={C.electron} size={12} lines={["pause or slow charging", "only where the line", "is overloaded"]} />
        <Card x={210} y={285} w={180} h={120} show={is("congestion")} delay={0.15} title="Overload" color={C.lithium} size={12} lines={["spread home charging", "across night slots", "defer cable upgrades"]} />
        <Card x={400} y={285} w={180} h={120} show={is("congestion")} delay={0.3} title="Voltage" color={C.anion} size={12} lines={["fast chargers inject", "reactive power to hold", "the feeder voltage"]} />
      </Reveal>

      <Reveal show={is("renewables")}>
        <Title y={40}>#6–7 Soak up renewables, behind the meter</Title>
        <Axes box={{ x: 80, y: 80, w: 460, h: 170 }} xLabel="hour of day" yLabel="power" xLabelDy={28} />
        {(() => {
          const sb = makeScale({ x: 80, y: 80, w: 460, h: 170 }, [0, 24], [0, 1]);
          return (
            <>
              <path d={`${sb.path(HRS.map((h) => [h, solar(h)] as [number, number]))}Z`} fill={C.electron} opacity={0.25} />
              <DrawPath d={sb.path(HRS.map((h) => [h, solar(h)] as [number, number]))} show={is("renewables")} color={C.electron} />
              <DrawPath d={sb.path(HRS.map((h) => [h, work(h)] as [number, number]))} show={is("renewables")} color={C.accent} delay={0.5} />
              <Label x={sb.sx(12)} y={sb.sy(0.95)} size={12} weight={700} color={C.electron}>
                midday solar
              </Label>
              <Label x={sb.sx(16.6)} y={sb.sy(0.5)} anchor="start" size={12} weight={700} color={C.accent}>
                workplace fleet charging
              </Label>
            </>
          );
        })()}
        <Label x={300} y={300} size={14} weight={700}>
          A household with a dynamic tariff
        </Label>
        {[
          { t: "02–05", d: "charge at the cheapest hours", c: C.lithium },
          { t: "17–21", d: "V2H runs the home at peak price", c: C.electron },
          { t: "result", d: "lower total cost of ownership", c: C.accent },
        ].map((r, i) => (
          <g key={r.t}>
            <Chip x={60 + i * 190} y={335} text={r.t} w={70} color={r.c} />
            <Label x={100 + i * 190} y={339} anchor="start" size={11.5}>
              {r.d.split(" ").slice(0, 3).join(" ")}
            </Label>
            <Label x={100 + i * 190} y={355} anchor="start" size={11.5}>
              {r.d.split(" ").slice(3).join(" ")}
            </Label>
          </g>
        ))}
        <Chip x={300} y={405} text="zero curtailment: clean power becomes driving distance" w={430} color={C.lithium} />
      </Reveal>

      <Reveal show={is("challenges")}>
        <Title y={36}>Who benefits, and what's missing</Title>
        <Table
          x={30}
          y={56}
          cols={[170, 120, 250]}
          rowH={38}
          size={12}
          show={is("challenges")}
          rows={[
            ["Opportunity", "Stakeholder", "Impact"],
            ["Load reshaping", "TSO / DSO", "fewer fossil peak plants"],
            ["Ancillary services", "TSO", "frequency held near 50 Hz"],
            ["Congestion relief", "DSO / TSO", "defers cable upgrades"],
            ["Distribution defence", "DSO", "no local feeder overload"],
            ["RES + behind meter", "consumer", "no curtailment, lower bill"],
          ]}
        />
        <rect x={30} y={296} width={540} height={130} rx={12} fill="#0b1220" stroke={C.hot} />
        <Label x={300} y={320} size={14} weight={700} color={C.hot}>
          Challenges: build the ecosystem
        </Label>
        {["plan charging and grid together", "define every actor's role", "regulation + business models for flexibility", "common standards · data rules"].map((t, i) => (
          <Label key={t} x={i % 2 ? 430 : 170} y={350 + Math.floor(i / 2) * 26} size={12.5}>
            {t}
          </Label>
        ))}
        <Label x={300} y={412} size={11} color={C.dim}>
          TSO: transmission system operator · DSO: distribution system operator
        </Label>
      </Reveal>

      <Reveal show={is("dsm")}>
        <Title>Demand-side flexibility</Title>
        <Label x={300} y={74} size={13} color={C.dim}>
          end users change consumption on purpose, in response to prices or the operator
        </Label>
        {/* 24 hour ring: parked 90 % */}
        <circle cx={150} cy={210} r={80} fill="none" stroke={C.accent} strokeWidth={22} opacity={0.85} />
        <motion.circle
          cx={150}
          cy={210}
          r={80}
          fill="none"
          stroke={C.hot}
          strokeWidth={22}
          strokeDasharray={`${0.1 * 2 * Math.PI * 80} ${2 * Math.PI * 80}`}
          transform="rotate(-90 150 210)"
        />
        <Label x={150} y={208} size={26} weight={800} color={C.accent}>
          90 %
        </Label>
        <Label x={150} y={230} size={12}>
          of the time parked
        </Label>
        <Label x={150} y={320} size={12} color={C.hot}>
          driving ≈ 10 %
        </Label>
        <Card x={290} y={110} w={280} h={88} show={is("dsm")} title="Goals" color={C.lithium} size={12} lines={["flatter load profile · more renewables", "lower operating costs"]} />
        <Card
          x={290}
          y={212}
          w={280}
          h={120}
          show={is("dsm")}
          delay={0.2}
          title="Smart meters + ICT"
          color={C.lfp}
          size={12}
          lines={["track real-time consumption", "send dynamic tariffs", "automate the adjustments"]}
        />
        <Chip x={300} y={385} text="EVs: a flexible resource via smart charging and V2G" w={420} color={C.accent} />
      </Reveal>

      <Reveal show={is("services")}>
        <Title y={34}>V2G services by response time</Title>
        {[
          [0.001, "ms"],
          [1, "s"],
          [60, "min"],
          [3600, "h"],
          [86400, "day"],
        ].map(([sec, l]) => (
          <g key={l as string}>
            <line x1={tx(sec as number)} x2={tx(sec as number)} y1={60} y2={380} stroke={C.grid} />
            <Label x={tx(sec as number)} y={398} size={12} color={C.dim}>
              {l as string}
            </Label>
          </g>
        ))}
        {SVC.map((v, i) => (
          <g key={v.t}>
            <Label x={200} y={82 + i * 38} anchor="end" size={12.5}>
              {v.t}
            </Label>
            <motion.rect
              x={tx(v.a)}
              y={68 + i * 38}
              height={20}
              rx={6}
              fill={v.c}
              opacity={0.85}
              initial={false}
              animate={{ width: is("services") ? tx(v.b) - tx(v.a) : 0 }}
              transition={{ duration: 0.7, delay: is("services") ? i * 0.08 : 0 }}
            />
          </g>
        ))}
        <Chip x={300} y={428} text="value stacking: one fleet earns from several services" w={420} color={C.accent} />
      </Reveal>

      <Reveal show={is("discuss")}>
        <Title>Discuss: energy or ancillary?</Title>
        <Card
          x={30}
          y={75}
          w={260}
          h={190}
          show={is("discuss")}
          title="Energy services"
          color={C.electron}
          lines={["move energy in time", "", "arbitrage", "peak shaving", "renewable integration", "congestion management"]}
        />
        <Card
          x={310}
          y={75}
          w={260}
          h={190}
          show={is("discuss")}
          delay={0.2}
          title="Ancillary services"
          color={C.anion}
          lines={["keep the grid stable", "", "frequency regulation", "operating reserves", "voltage support", "reactive power support"]}
        />
        <rect x={60} y={300} width={480} height={100} rx={14} fill="#0b1220" stroke={C.accent} />
        <Label x={300} y={334} size={15} weight={700} color={C.accent}>
          Would you join V2G with your own car?
        </Label>
        <Label x={300} y={362} size={13}>
          on what conditions: payment, guaranteed range,
        </Label>
        <Label x={300} y={382} size={13}>
          battery warranty, when you can unplug?
        </Label>
      </Reveal>
    </Stage>
  );
}
