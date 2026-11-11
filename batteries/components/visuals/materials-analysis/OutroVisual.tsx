"use client";

import { RecapGrid } from "../blocks";

const CARDS = [
  { t: "Why", id: "intro", k: ["foils, powders, liquids", "and their interfaces"] },
  { t: "Framework", id: "framework", k: ["probe → interaction", "→ detection"] },
  { t: "Principle", id: "thermal", k: ["property vs T(t)", "in a furnace"] },
  { t: "TGA", id: "tga", k: ["mass steps match", "theoretical losses"] },
  { t: "DTA / DSC", id: "dsc", k: ["Tg step, Tm peak,", "χ = ΔHm / ΔH100%"] },
  { t: "Runaway", id: "safety", k: ["charged NMC811:", "1618 J/g"] },
  { t: "DMA", id: "mech", k: ["E′, E″, tan δ;", "peak at Tg"] },
];

export default function OutroVisual({ visual }: { visual: string }) {
  return (
    <RecapGrid
      courseId="materials-analysis"
      cards={CARDS}
      show={visual === "recap"}
      takeaway={{
        title: "Pick the probe for the question",
        lines: ["mass (TGA), heat (DSC), stiffness (DMA):", "each tells a different part of how a cell works and fails"],
      }}
    />
  );
}
