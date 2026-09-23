"use client";

import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Data — radar values eyeballed from 1KB744 L4–L6 charts (Acar 2018)  */
/* Scale 0–10, higher = better. Cost axes: higher = cheaper.           */
/* Self-discharge: higher = less leakage.                              */
/* ------------------------------------------------------------------ */

const AXES = [
  "Specific energy",
  "Energy density",
  "Specific power",
  "Power density",
  "Efficiency",
  "Lifespan",
  "Self discharge rate",
  "Energy capital cost",
  "Power capital cost",
  "Technical maturity",
  "Environmental impact",
] as const;

type Scores = [number, number, number, number, number, number, number, number, number, number, number];

type Family = "Mechanical" | "Thermal" | "Chemical" | "Electromagnetic" | "Electrochemical";

type Tech = {
  id: string;
  name: string;
  family: Family;
  tagline: string;
  scores: Scores;
  facts: [string, string][];
  verdict: string;
};

const FAMILY_HUE: Record<Family, string> = {
  Mechanical: "#1F5FAD",
  Thermal: "#C8421B",
  Chemical: "#7A5AB8",
  Electromagnetic: "#0E8F86",
  Electrochemical: "#B7860B",
};

const FAMILY_NOTE: Record<Family, string> = {
  Mechanical: "Kinetic and potential energy",
  Thermal: "Storing heat as heat",
  Chemical: "The high-energy corner",
  Electromagnetic: "The high-power corner",
  Electrochemical: "Batteries",
};

const TECHS: Tech[] = [
  // Mechanical
  {
    id: "pumped-hydro",
    name: "Pumped hydro",
    family: "Mechanical",
    tagline: "W = mgh, two-way turbines",
    scores: [10, 1.5, 1, 5, 9.5, 4, 9.5, 1.5, 7, 4.5, 6],
    facts: [
      ["Global", "~129 GW, 9000 GWh"],
      ["Efficiency", "80–90%"],
      ["Duration", "Hours – months"],
      ["Lifetime", "~50 years"],
      ["Response", "Seconds – minutes"],
    ],
    verdict: "Huge, efficient, 50-year life, siting-constrained",
  },
  {
    id: "gravity",
    name: "Gravity (Energy Vault)",
    family: "Mechanical",
    tagline: "35 t concrete blocks, 120 m tower",
    scores: [2, 1.5, 1.5, 4, 9, 6, 9.5, 3, 5, 2, 5],
    facts: [
      ["Example", "Ticino, 5 MW / 20 MWh"],
      ["Efficiency", "~90%"],
      ["Duration", "Hours – days"],
      ["1 t × 100 m", "≈ 0.27 kWh ≈ 1 kg Li-ion"],
    ],
    verdict: "Same physics as hydro, defeated by materials accounting",
  },
  {
    id: "flywheel",
    name: "Flywheel",
    family: "Mechanical",
    tagline: "W = ½Iω², vacuum housing",
    scores: [4, 5, 8, 1, 5, 5, 6, 8.5, 5, 1.5, 2],
    facts: [
      ["Per unit", "0.5–1 kWh"],
      ["Discharge", "5 s – 30 min"],
      ["Efficiency", "70–80%"],
      ["Self-discharge", "20–100% / day"],
      ["Lifetime", ">10 years w/ bearings"],
    ],
    verdict: "Superb power and response, hopeless energy and self-discharge",
  },
  {
    id: "caes",
    name: "Compressed air (CAES)",
    family: "Mechanical",
    tagline: "Salt caverns, ~70 bar",
    scores: [1, 8, 1, 2, 4, 2, 3, 4, 4, 9.5, 8],
    facts: [
      ["Diabatic", "Huntorf 1978, ~42%, burns gas"],
      ["Adiabatic", "Goderich 2019, ~70%, no fuel"],
      ["Response", "Minutes"],
    ],
    verdict: "Diabatic proven but burns fuel; adiabatic clean, not yet mature",
  },
  // Thermal
  {
    id: "sensible",
    name: "Sensible heat",
    family: "Thermal",
    tagline: "q = ρCₚVΔT",
    scores: [3, 3, 6, 6.5, 2, 2.5, 1, 5, 5, 1.5, 8],
    facts: [
      ["Water", "4.17 MJ/m³K, 5–95 °C"],
      ["Molten salt", "Andasol 3, 280–570 °C"],
      ["Heat→heat", "~99%"],
      ["Seasonal", "BTES, rock caverns (Hudiksvall 4100 MWh)"],
    ],
    verdict: "Cheapest, simplest, limited by temperature range",
  },
  {
    id: "latent",
    name: "Latent heat (PCM)",
    family: "Thermal",
    tagline: "Phase change at constant T",
    scores: [3.5, 4, 8, 7, 2, 3, 5, 5.5, 4, 2, 8],
    facts: [
      ["Examples", "Ice/water, sodium acetate trihydrate"],
      ["Upside", "Heat delivered at constant temperature"],
      ["Catch", "Melting point must match application"],
    ],
    verdict: "Constant-temperature delivery, material selection is hard",
  },
  {
    id: "thermochemical",
    name: "Thermochemical",
    family: "Thermal",
    tagline: "CaCl₂·6H₂O ⇌ CaCl₂·2H₂O + 4H₂O",
    scores: [2, 2, 6, 7.5, 2.5, 2.5, 5, 5.5, 5.5, 1, 8],
    facts: [
      ["Mechanism", "Salt hydration / dehydration"],
      ["NL household", "6.7 GJ: 23 m³ water vs 4–8 m³ salt"],
      ["Storage", "Years, transportable, no loss"],
    ],
    verdict: "Densest and lossless, but immature",
  },
  {
    id: "laes",
    name: "Liquid air (LAES)",
    family: "Thermal",
    tagline: "Air liquefied at −196 °C",
    scores: [3, 5, 4, 4, 4, 6, 7, 5, 4, 3, 8],
    facts: [
      ["Example", "Pilsworth, 5 MW / 15 MWh"],
      ["Efficiency", "~50%, up to 70% w/ waste heat"],
      ["Density", "4× compressed air"],
    ],
    verdict: "Siteable anywhere, needs waste heat to compete",
  },
  // Chemical
  {
    id: "hydrogen",
    name: "Hydrogen",
    family: "Chemical",
    tagline: "~33 000 Wh/kg",
    scores: [4, 5.5, 6, 1.5, 1, 10, 10, 5, 1, 1, 7],
    facts: [
      ["700 bar", "~40 kg/m³, compression 10–15%"],
      ["Liquid −253 °C", "~71 kg/m³, liquefaction ≥30%"],
      ["Round trip", "10–30%"],
      ["Today", "~96% from fossil sources"],
    ],
    verdict: "Unbeatable density and duration, worst round-trip efficiency",
  },
  {
    id: "ammonia",
    name: "Ammonia",
    family: "Chemical",
    tagline: "NH₃, no carbon",
    scores: [5, 6, 3, 6, 1, 5, 4, 9, 1, 9, 9],
    facts: [
      ["Energy", "~5200 Wh/kg, 18.6 MJ/kg"],
      ["Liquid", "−33 °C or 10 bar"],
      ["Downside", "Toxic, NOₓ on combustion"],
    ],
    verdict: "Leading candidate for intercontinental energy trade",
  },
  {
    id: "methane",
    name: "Synthetic methane",
    family: "Chemical",
    tagline: "CO₂ + H₂ → CH₄",
    scores: [2, 1, 9, 4, 3, 1.5, 1.5, 6, 3, 5, 5],
    facts: [
      ["Upside", "Drops into existing gas infrastructure"],
      ["Catch", "Needs a CO₂ source to close the cycle"],
    ],
    verdict: "Infrastructure-compatible, each conversion step costs",
  },
  // Electromagnetic
  {
    id: "capacitor",
    name: "Capacitors",
    family: "Electromagnetic",
    tagline: "W = ½CV²",
    scores: [2, 8, 3, 8, 5, 4, 5, 1, 6, 2, 2],
    facts: [
      ["Capacitance", "pF → µF → >100 mF per cm²"],
      ["Response", "<50 ms"],
      ["V → V/2", "75% of energy gone"],
      ["Example", "Maxwell grid system, 200 MW"],
    ],
    verdict: "Bought for speed, never for capacity",
  },
  {
    id: "smes",
    name: "SMES",
    family: "Electromagnetic",
    tagline: "W = ½LI², superconducting coil",
    scores: [5, 5, 8, 1, 5, 10, 7, 6, 8, 1, 6],
    facts: [
      ["Installed", "325 MW worldwide"],
      ["Response", "~5 ms"],
      ["Efficiency", "~95%"],
      ["1 m³ at 10 T", "40 MJ ≈ 11 kWh"],
    ],
    verdict: "Instant power, cryogenics and cost kill it vs Li-ion",
  },
  // Electrochemical
  {
    id: "conventional",
    name: "Conventional batteries",
    family: "Electrochemical",
    tagline: "Li-ion, lead-acid",
    scores: [3, 1, 2.5, 2, 2, 2, 2, 8, 2.5, 6, 3],
    facts: [
      ["Li-ion", "~250 Wh/kg, >90% round trip"],
      ["Hornsdale", "150 MW / 129 MWh"],
      ["Edwards & Sanborn", "~1 GW / 3.3 GWh"],
      ["Pack price", "$806 → $115/kWh (2013–24)"],
    ],
    verdict: "Cost collapse made grid storage viable",
  },
  {
    id: "high-temp",
    name: "High-temperature batteries",
    family: "Electrochemical",
    tagline: "NaS at 350 °C",
    scores: [5.5, 3, 1.5, 2, 8.5, 3, 9, 7, 6, 3, 6],
    facts: [
      ["Reaction", "2Na + 4S → Na₂S₄, ~2 V"],
      ["Fukuoka", "50 MW / 300 MWh"],
      ["Efficiency", "75–85%, 3000–4000 cycles"],
    ],
    verdict: "Efficient and long-duration, must stay hot",
  },
  {
    id: "flow",
    name: "Flow batteries",
    family: "Electrochemical",
    tagline: "Vanadium redox, ~1.3 V",
    scores: [4.5, 1, 2.5, 10, 3, 1, 4, 1, 1.5, 1, 6],
    facts: [
      ["Rongke", "200 MW / 800 MWh"],
      ["Life", "~20 000 cycles, ~20 years"],
      ["Scaling", "Energy = tank size, power = stack"],
      ["Iron-air cousin", "Form Energy, ~100 h, ~50%"],
    ],
    verdict: "Decoupled energy and power, low density",
  },
];

const FAMILY_AVG: Tech[] = (
  [
    ["Mechanical", [5, 5, 1.5, 3, 6, 4, 7, 4, 7, 6, 6]],
    ["Electrochemical", [4, 2, 2, 5, 5, 2, 5, 5, 4, 3, 4]],
    ["Chemical", [3, 3, 6, 6, 2, 7, 5, 7, 3, 6, 6]],
    ["Thermal", [3, 2, 6, 7, 2, 2, 3, 5, 5, 1, 7]],
    ["Electromagnetic", [3, 6, 5, 4, 6, 7, 6, 3, 8, 5, 5]],
  ] as [Family, Scores][]
).map(([family, scores]) => ({
  id: `family-${family}`,
  name: `${family} (family)`,
  family,
  tagline: FAMILY_NOTE[family],
  scores,
  facts: [],
  verdict: "Family-level overview from L4",
}));

const FAMILIES: Family[] = ["Mechanical", "Thermal", "Chemical", "Electromagnetic", "Electrochemical"];

const SERIES_COLORS = ["#1F5FAD", "#C8421B", "#0E8F86", "#7A5AB8", "#B7860B", "#B8336A", "#4F7A28", "#2B2F36"];

/* ------------------------------------------------------------------ */
/* Radar                                                               */
/* ------------------------------------------------------------------ */

type Series = { tech: Tech; color: string };

function Radar({
  series,
  focusId,
  onFocus,
}: {
  series: Series[];
  focusId: string | null;
  onFocus: (id: string | null) => void;
}) {
  const [hoverAxis, setHoverAxis] = useState<number | null>(null);
  const size = 560;
  const c = size / 2;
  const R = 180;
  const padX = 150; // room for longest end-anchored labels ("Environmental impact")
  const padY = 30;
  const n = AXES.length;

  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + Math.cos(a) * R * (v / 10), c + Math.sin(a) * R * (v / 10)] as const;
  };
  const poly = (vals: readonly number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");

  return (
    <div className="relative">
      <svg
        viewBox={`${-padX} ${-padY} ${size + padX * 2} ${size + padY * 2}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="Radar comparison"
      >
        {/* rings */}
        {[2, 4, 6, 8].map((r) => (
          <polygon key={r} points={poly(Array(n).fill(r))} fill="none" stroke="#CBD3DC" strokeWidth={1} />
        ))}
        {/* ideal */}
        <polygon points={poly(Array(n).fill(10))} fill="none" stroke="#3B8C4A" strokeWidth={2.5} />
        {/* spokes + labels */}
        {AXES.map((label, i) => {
          const [x, y] = pt(i, 10);
          const [lx, ly] = pt(i, 11.6);
          const anchor = Math.abs(lx - c) < 8 ? "middle" : lx > c ? "start" : "end";
          const active = hoverAxis === i;
          return (
            <g key={label} onMouseEnter={() => setHoverAxis(i)} onMouseLeave={() => setHoverAxis(null)} className="cursor-default">
              <line x1={c} y1={c} x2={x} y2={y} stroke={active ? "#1C2733" : "#CBD3DC"} strokeWidth={active ? 1.5 : 1} />
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={13}
                fontWeight={active ? 600 : 400}
                fill={active ? "#1C2733" : "#4A5868"}
              >
                {label}
              </text>
              {/* wide invisible hit area */}
              <line x1={c} y1={c} x2={lx} y2={ly} stroke="transparent" strokeWidth={22} />
            </g>
          );
        })}
        {[2, 4, 6, 8, 10].map((r) => {
          const [x, y] = pt(0, r);
          return (
            <text key={r} x={x + 4} y={y} fontSize={10} fill="#8A96A3" dominantBaseline="middle">
              {r}
            </text>
          );
        })}
        {/* series */}
        {series.map(({ tech, color }) => {
          const dim = focusId !== null && focusId !== tech.id;
          return (
            <g key={tech.id} style={{ opacity: dim ? 0.15 : 1, transition: "opacity 150ms" }}>
              <polygon points={poly(tech.scores)} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={2.25} strokeLinejoin="round" />
              {tech.scores.map((v, i) => {
                const [x, y] = pt(i, v);
                return <circle key={i} cx={x} cy={y} r={hoverAxis === i ? 5 : 3.2} fill={color} />;
              })}
            </g>
          );
        })}
      </svg>

      {/* axis readout */}
      {hoverAxis !== null && series.length > 0 && (
        <div className="absolute right-0 top-0 bg-white/95 border border-[#CBD3DC] rounded-md px-3 py-2 text-sm shadow-sm pointer-events-none">
          <div className="font-semibold text-[#1C2733] mb-1">{AXES[hoverAxis]}</div>
          {[...series]
            .sort((a, b) => b.tech.scores[hoverAxis] - a.tech.scores[hoverAxis])
            .map(({ tech, color }) => (
              <div key={tech.id} className="flex items-center gap-2 tabular-nums">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="flex-1 text-[#4A5868]">{tech.name}</span>
                <span className="font-medium text-[#1C2733]">{tech.scores[hoverAxis]}</span>
              </div>
            ))}
        </div>
      )}

      {/* legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
        {series.map(({ tech, color }) => (
          <button
            key={tech.id}
            onMouseEnter={() => onFocus(tech.id)}
            onMouseLeave={() => onFocus(null)}
            onFocus={() => onFocus(tech.id)}
            onBlur={() => onFocus(null)}
            className="flex items-center gap-2 text-sm text-[#1C2733] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5FAD]"
          >
            <span className="inline-block w-4 h-[3px] rounded" style={{ background: color }} />
            {tech.name}
          </button>
        ))}
        <span className="flex items-center gap-2 text-sm text-[#4A5868]">
          <span className="inline-block w-4 h-[3px] rounded bg-[#3B8C4A]" />
          Ideal
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function EnergyStorageRadarPage() {
  const [mode, setMode] = useState<"tech" | "family">("tech");
  const [selected, setSelected] = useState<string[]>(["pumped-hydro", "flywheel", "conventional"]);
  const [focusId, setFocusId] = useState<string | null>(null);

  const series: Series[] = useMemo(() => {
    const list = mode === "family" ? FAMILY_AVG : TECHS.filter((t) => selected.includes(t.id));
    return list.map((tech, i) => ({ tech, color: SERIES_COLORS[i % SERIES_COLORS.length] }));
  }, [mode, selected]);

  const toggle = (id: string) => {
    setMode("tech");
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 8 ? s : [...s, id]));
  };

  const selectFamily = (f: Family) => {
    setMode("tech");
    setSelected(TECHS.filter((t) => t.family === f).map((t) => t.id));
  };

  const jumpTo = (id: string) => {
    if (!selected.includes(id)) setSelected((s) => [...s, id].slice(-8));
    setMode("tech");
    requestAnimationFrame(() => document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const colorOf = (id: string) => series.find((s) => s.tech.id === id)?.color;

  return (
    <div className="min-h-screen bg-[#EEF1F4] text-[#1C2733] flex flex-col md:flex-row" style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside className="md:w-72 md:h-screen md:sticky md:top-0 overflow-y-auto border-b md:border-b-0 md:border-r border-[#CBD3DC] bg-[#E3E8ED]">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-lg font-semibold leading-tight">Energy storage</h1>
          <p className="text-sm text-[#4A5868] mt-1">1KB744, lectures 4–6</p>
          <div className="mt-4 flex rounded-md border border-[#B8C2CD] overflow-hidden text-sm">
            {(["tech", "family"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1F5FAD] ${
                  mode === m ? "bg-[#1C2733] text-white" : "bg-transparent text-[#1C2733] hover:bg-[#D6DDE4]"
                }`}
              >
                {m === "tech" ? "Technologies" : "Families"}
              </button>
            ))}
          </div>
        </div>

        <nav className="pb-8">
          {FAMILIES.map((f) => (
            <section key={f} className="mb-2">
              <div className="sticky top-0 bg-[#E3E8ED] px-5 py-2 flex items-baseline justify-between border-t border-[#CBD3DC]">
                <div>
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-sm" style={{ background: FAMILY_HUE[f] }} />
                    {f}
                  </h2>
                  <p className="text-xs text-[#4A5868] ml-4">{FAMILY_NOTE[f]}</p>
                </div>
                <button onClick={() => selectFamily(f)} className="text-xs text-[#1F5FAD] hover:underline focus:outline-none focus-visible:underline">
                  Compare all
                </button>
              </div>
              <ul>
                {TECHS.filter((t) => t.family === f).map((t) => {
                  const on = mode === "tech" && selected.includes(t.id);
                  const col = colorOf(t.id);
                  return (
                    <li key={t.id} className="flex items-start gap-2 px-5 py-1.5 hover:bg-[#D6DDE4]">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(t.id)}
                        aria-label={`Compare ${t.name}`}
                        className="mt-1 h-4 w-4 cursor-pointer"
                        style={{ accentColor: col ?? FAMILY_HUE[f] }}
                      />
                      <button onClick={() => jumpTo(t.id)} className="text-left flex-1 focus:outline-none focus-visible:underline">
                        <span className="block text-sm leading-snug" style={{ color: on && col ? col : undefined, fontWeight: on ? 600 : 400 }}>
                          {t.name}
                        </span>
                        <span className="block text-xs text-[#4A5868]">{t.tagline}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 px-5 md:px-10 py-8">
        <header className="mb-4">
          <h2 className="text-2xl font-semibold leading-tight">
            {mode === "family" ? "Storage families compared" : series.length ? "Selected technologies" : "Pick technologies to compare"}
          </h2>
          <p className="text-sm text-[#4A5868] mt-1 max-w-prose">
            Scale 0–10, outer ring is ideal. Cost axes read as cheaper outward; self-discharge reads as less leakage outward. Hover an axis for values, hover a legend entry to isolate it.
          </p>
        </header>

        <div className="bg-white rounded-lg border border-[#CBD3DC] p-4 md:p-6">
          {series.length ? (
            <Radar series={series} focusId={focusId} onFocus={setFocusId} />
          ) : (
            <p className="text-[#4A5868] py-24 text-center">Tick up to 8 technologies in the sidebar, or use Compare all on a family.</p>
          )}
        </div>

        {mode === "tech" && series.length > 0 && (
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            {series.map(({ tech, color }) => (
              <article
                key={tech.id}
                id={`card-${tech.id}`}
                className="bg-white rounded-lg border border-[#CBD3DC] p-5 scroll-mt-6"
                style={{ borderLeft: `4px solid ${color}` }}
                onMouseEnter={() => setFocusId(tech.id)}
                onMouseLeave={() => setFocusId(null)}
              >
                <p className="text-xs" style={{ color: FAMILY_HUE[tech.family] }}>
                  {tech.family}
                </p>
                <h3 className="text-lg font-semibold leading-tight">{tech.name}</h3>
                <p className="text-sm text-[#4A5868]">{tech.tagline}</p>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                  {tech.facts.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-[#4A5868]">{k}</dt>
                      <dd className="tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-sm italic text-[#1C2733]">{tech.verdict}</p>
                <button onClick={() => toggle(tech.id)} className="mt-3 text-xs text-[#1F5FAD] hover:underline focus:outline-none focus-visible:underline">
                  Remove from comparison
                </button>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
