import type { ComponentType } from "react";
import IntroVisual from "./IntroVisual";
import HistoryVisual from "./HistoryVisual";
import PolicyVisual from "./PolicyVisual";
import LevelsVisual from "./LevelsVisual";
import TechVisual from "./TechVisual";
import SmartVisual from "./SmartVisual";
import V2xVisual from "./V2xVisual";
import FlexVisual from "./FlexVisual";
import RangeVisual from "./RangeVisual";
import DynamicsVisual from "./DynamicsVisual";
import PropulsionVisual from "./PropulsionVisual";
import OutroVisual from "./OutroVisual";

/** Chapter id -> visual for the introduction to electromobility course. */
export const visuals: Record<string, ComponentType<{ visual: string }>> = {
  intro: IntroVisual,
  history: HistoryVisual,
  policy: PolicyVisual,
  levels: LevelsVisual,
  tech: TechVisual,
  smart: SmartVisual,
  v2x: V2xVisual,
  flex: FlexVisual,
  range: RangeVisual,
  dynamics: DynamicsVisual,
  propulsion: PropulsionVisual,
  outro: OutroVisual,
};
