import type { ComponentType } from "react";
import IntroVisual from "./IntroVisual";
import VoltaicPileVisual from "./VoltaicPileVisual";
import LiIonVisual from "./LiIonVisual";
import EdlVisual from "./EdlVisual";
import CvVisual from "./CvVisual";
import ControlledCurrentVisual from "./ControlledCurrentVisual";
import SupercapVisual from "./SupercapVisual";
import FuelCellVisual from "./FuelCellVisual";
import CapacityFadeVisual from "./CapacityFadeVisual";
import EisVisual from "./EisVisual";
import KineticsVisual from "./KineticsVisual";
import OutroVisual from "./OutroVisual";

/** Chapter id -> visual for the electrochemistry course. */
export const visuals: Record<string, ComponentType<{ visual: string }>> = {
  intro: IntroVisual,
  "voltaic-pile": VoltaicPileVisual,
  "li-ion": LiIonVisual,
  edl: EdlVisual,
  cv: CvVisual,
  "controlled-current": ControlledCurrentVisual,
  supercaps: SupercapVisual,
  "fuel-cells": FuelCellVisual,
  "capacity-fade": CapacityFadeVisual,
  eis: EisVisual,
  kinetics: KineticsVisual,
  outro: OutroVisual,
};
