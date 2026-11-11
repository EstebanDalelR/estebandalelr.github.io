import type { CourseReference } from "../reference";

export const electromobility: CourseReference = {
  formulaLabels: {},
  extraFormulas: [
    { chapterId: "levels", label: "Charging time (ideal)", tex: "t \\approx \\frac{\\Delta\\text{SOC}\\cdot E_{battery}}{P_{charge}}" },
    { chapterId: "levels", label: "Charging power", tex: "P = V\\,I \\quad (\\text{3-phase AC: } P = \\sqrt{3}\\,V_{LL} I)" },
  ],
  definitions: [
    { term: "Electromobility", chapterId: "intro", text: "Electric powertrains, connected vehicles and charging infrastructure used to propel vehicles and fleets: BEVs, plug-in hybrids and fuel cell vehicles." },
    { term: "BEV / PHEV / FCEV", chapterId: "intro", text: "Battery electric vehicle; plug-in hybrid with both a battery and a combustion engine; hydrogen fuel cell vehicle." },
    { term: "EV decline (1920s)", chapterId: "history", text: "Cheap oil from large discoveries, better roads and the range of combustion cars pushed electric cars out." },
    { term: "European Green Deal", chapterId: "policy", text: "Net-zero greenhouse gas emissions by 2050; at least −55 % by 2030 vs 1990." },
    { term: "Fit for 55", chapterId: "policy", text: "The 2021 legislation package: CO₂ standards (no new combustion cars and vans from 2035), AFIR for charging and refuelling, ReFuelEU Aviation." },
    { term: "Sweden's climate framework", chapterId: "policy", text: "Domestic transport −70 % by 2030 vs 2010, −75 % by 2040 vs 1990, net zero by 2045, then negative emissions." },
    { term: "Charging levels", chapterId: "levels", text: "Level 1 AC 1–2 kW (8–20 h), Level 2 AC 7–22 kW (3–8 h), DC fast 50–350+ kW (15–45 min to 80 %)." },
    { term: "On-board vs off-board charging", chapterId: "levels", text: "AC charging converts to DC in the car's on-board charger, which limits the power; DC charging converts in the station." },
    { term: "Connectors", chapterId: "levels", text: "Type 1 (1-phase AC), Type 2 / Mennekes (EU AC), CCS (Type 2 + DC pins, global), CHAdeMO (early DC, phasing out), GB/T (China)." },
    { term: "Inductive vs capacitive charging", chapterId: "tech", text: "Wireless power through a magnetic field between coils (common, ≈ 85–90 %) or an electric field between plates (experimental)." },
    { term: "Electric road system (ERS)", chapterId: "tech", text: "Dynamic charging while driving via overhead lines, a conductive rail or inductive coils. Trialled in Sandviken, Arlanda, Lund and Visby; E20 project cancelled in 2025." },
    { term: "Battery swapping", chapterId: "tech", text: "Exchanging the empty pack for a full one in ≈ 3–5 min; suits fleets and taxis but needs standardised packs." },
    { term: "Charging automation levels", chapterId: "smart", text: "0: human plugs in; 1–3: assistance; 4: autonomous positioning with a robot connecting the cable; 5: fully autonomous." },
    { term: "Smart charging", chapterId: "smart", text: "Shifting charging to hours with low spot prices and low grid load." },
    { term: "Megawatt Charging System (MCS)", chapterId: "smart", text: "Heavy-duty charging standard up to ≈ 1.44 MW (demonstrated); about 40 min from 20 to 80 % for a long-haul truck." },
  ],
};
