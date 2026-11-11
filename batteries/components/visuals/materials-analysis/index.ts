import type { ComponentType } from "react";
import IntroVisual from "./IntroVisual";
import FrameworkVisual from "./FrameworkVisual";
import ThermalVisual from "./ThermalVisual";
import TgaVisual from "./TgaVisual";
import DscVisual from "./DscVisual";
import SafetyVisual from "./SafetyVisual";
import MechVisual from "./MechVisual";
import OutroVisual from "./OutroVisual";

/** Chapter id -> visual for the materials analysis for batteries course. */
export const visuals: Record<string, ComponentType<{ visual: string }>> = {
  intro: IntroVisual,
  framework: FrameworkVisual,
  thermal: ThermalVisual,
  tga: TgaVisual,
  dsc: DscVisual,
  safety: SafetyVisual,
  mech: MechVisual,
  outro: OutroVisual,
};
