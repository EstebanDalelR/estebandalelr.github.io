import type { ComponentType } from "react";
import IntroVisual from "./IntroVisual";
import CurrentVisual from "./CurrentVisual";
import VoltageVisual from "./VoltageVisual";
import ResistanceVisual from "./ResistanceVisual";
import SeriesVisual from "./SeriesVisual";
import ParallelVisual from "./ParallelVisual";
import AcVisual from "./AcVisual";
import ImpedanceVisual from "./ImpedanceVisual";
import SyncVisual from "./SyncVisual";
import FrequencyVisual from "./FrequencyVisual";
import PowerElectronicsVisual from "./PowerElectronicsVisual";
import OutroVisual from "./OutroVisual";

/** Chapter id -> visual for the electric circuits & grid course. */
export const visuals: Record<string, ComponentType<{ visual: string }>> = {
  intro: IntroVisual,
  current: CurrentVisual,
  voltage: VoltageVisual,
  resistance: ResistanceVisual,
  series: SeriesVisual,
  parallel: ParallelVisual,
  ac: AcVisual,
  impedance: ImpedanceVisual,
  sync: SyncVisual,
  frequency: FrequencyVisual,
  "power-electronics": PowerElectronicsVisual,
  outro: OutroVisual,
};
