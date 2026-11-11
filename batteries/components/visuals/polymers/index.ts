import type { ComponentType } from "react";
import IntroVisual from "./IntroVisual";
import OrganicVisual from "./OrganicVisual";
import StereoVisual from "./StereoVisual";
import HistoryVisual from "./HistoryVisual";
import BasicsVisual from "./BasicsVisual";
import MwVisual from "./MwVisual";
import OutroVisual from "./OutroVisual";

/** Chapter id -> visual for the polymer technology course. */
export const visuals: Record<string, ComponentType<{ visual: string }>> = {
  intro: IntroVisual,
  organic: OrganicVisual,
  stereo: StereoVisual,
  history: HistoryVisual,
  basics: BasicsVisual,
  mw: MwVisual,
  outro: OutroVisual,
};
