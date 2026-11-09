"use client";

import { RecapGrid } from "../blocks";

const CARDS = [
  { t: "Intro", id: "intro", k: ["vehicles + charging", "+ policy + economy"] },
  { t: "History", id: "history", k: ["rise, decline, return", "oil price & climate"] },
  { t: "Policy", id: "policy", k: ["EU −55 % by 2030,", "no new ICE cars 2035"] },
  { t: "Levels", id: "levels", k: ["AC: on-board limits", "DC: station limits"] },
  { t: "Technologies", id: "tech", k: ["wireless, ERS,", "swapping: niches"] },
  { t: "Smart", id: "smart", k: ["charge when cheap,", "trucks need MW"] },
];

export default function OutroVisual({ visual }: { visual: string }) {
  return (
    <RecapGrid
      courseId="electromobility"
      cards={CARDS}
      show={visual === "recap"}
      takeaway={{
        title: "The vehicle is only half the system",
        lines: ["charging power, location and timing decide", "what electric transport asks of the grid"],
      }}
    />
  );
}
