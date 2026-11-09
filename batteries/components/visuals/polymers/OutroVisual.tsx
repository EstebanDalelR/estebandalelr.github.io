"use client";

import { RecapGrid } from "../blocks";

const CARDS = [
  { t: "Organic", id: "organic", k: ["nucleophile → electrophile", "radicals: init, prop, term"] },
  { t: "Stereo", id: "stereo", k: ["iso / syndio / atactic", "regular chains crystallise"] },
  { t: "History", id: "history", k: ["Staudinger, 1920:", "macromolecules are real"] },
  { t: "Basics", id: "basics", k: ["monomer ≠ repeating unit", "crosslinks set the family"] },
  { t: "Molar mass", id: "mw", k: ["Mw ≥ Mn, Đ ≥ 1", "end groups, viscosity, GPC"] },
];

export default function OutroVisual({ visual }: { visual: string }) {
  return (
    <RecapGrid
      courseId="polymers"
      cards={CARDS}
      show={visual === "recap"}
      takeaway={{
        title: "Chemistry of the unit + length of the chain",
        lines: ["tacticity and crosslinking decide the structure,", "Mn, Mw and Đ describe the length"],
      }}
    />
  );
}
