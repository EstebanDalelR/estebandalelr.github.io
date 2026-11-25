"use client";

import { RecapGrid } from "../blocks";

const CARDS = [
  { t: "Intro & history", id: "intro", k: ["vehicles + charging", "rise, decline, return"] },
  { t: "Policy", id: "policy", k: ["EU −55 % by 2030,", "no new ICE cars 2035"] },
  { t: "Charging", id: "levels", k: ["AC: on-board limits", "DC: station limits"] },
  { t: "Smart & V2X", id: "v2x", k: ["dumb → tariff →", "smart → V2G"] },
  { t: "Flexibility", id: "flex", k: ["peaks, frequency,", "congestion, solar"] },
  { t: "Dynamics", id: "dynamics", k: ["Fa + FR + FD + FC", "drag power ∝ v³"] },
  { t: "Magnetism", id: "magnetism", k: ["field, voltage, force;", "soft cores, magnets"] },
  { t: "Rotating field", id: "rotating", k: ["n = 120 f / P;", "motor or generator"] },
  { t: "Machines", id: "machines", k: ["induction, PM, wound;", "PMSM in most EVs"] },
  { t: "EV batteries", id: "ev-batteries", k: ["HEV < 3, PHEV 5–15,", "EV 30–100 kWh"] },
  { t: "Pack design", id: "pack-design", k: ["power, energy, heat,", "EOL at 80 %, BMS"] },
  { t: "Cells", id: "cells", k: ["8S2P; bigger cells;", "NCM and LFP lead"] },
];

export default function OutroVisual({ visual }: { visual: string }) {
  return (
    <RecapGrid
      courseId="electromobility"
      cards={CARDS}
      show={visual === "recap"}
      takeaway={{
        title: "The vehicle is only half the system",
        lines: ["charging timing decides what EVs ask of the grid,", "physics how far they go, and motor and battery how well"],
      }}
    />
  );
}
