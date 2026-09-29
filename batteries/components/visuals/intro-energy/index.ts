import type { ComponentType } from "react";
import IntroVisual from "./IntroVisual";
import SocietyVisual from "./SocietyVisual";
import ThermoVisual from "./ThermoVisual";
import WhyStorageVisual from "./WhyStorageVisual";
import CompareVisual from "./CompareVisual";
import HydroVisual from "./HydroVisual";
import MechThermalVisual from "./MechThermalVisual";
import FuelsVisual from "./FuelsVisual";
import ElectromagneticVisual from "./ElectromagneticVisual";
import EconomicsVisual from "./EconomicsVisual";
import ChemistriesVisual from "./ChemistriesVisual";
import TestingVisual from "./TestingVisual";
import OutroVisual from "./OutroVisual";

/** Chapter id -> visual for the intro-energy course. */
export const visuals: Record<string, ComponentType<{ visual: string }>> = {
  intro: IntroVisual,
  society: SocietyVisual,
  thermo: ThermoVisual,
  "why-storage": WhyStorageVisual,
  compare: CompareVisual,
  hydro: HydroVisual,
  "mech-thermal": MechThermalVisual,
  fuels: FuelsVisual,
  electromagnetic: ElectromagneticVisual,
  economics: EconomicsVisual,
  chemistries: ChemistriesVisual,
  testing: TestingVisual,
  outro: OutroVisual,
};
