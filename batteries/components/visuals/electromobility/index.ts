import type { ComponentType } from "react";
import IntroVisual from "./IntroVisual";
import HistoryVisual from "./HistoryVisual";
import PolicyVisual from "./PolicyVisual";
import LevelsVisual from "./LevelsVisual";
import TechVisual from "./TechVisual";
import SmartVisual from "./SmartVisual";
import OutroVisual from "./OutroVisual";

/** Chapter id -> visual for the introduction to electromobility course. */
export const visuals: Record<string, ComponentType<{ visual: string }>> = {
  intro: IntroVisual,
  history: HistoryVisual,
  policy: PolicyVisual,
  levels: LevelsVisual,
  tech: TechVisual,
  smart: SmartVisual,
  outro: OutroVisual,
};
