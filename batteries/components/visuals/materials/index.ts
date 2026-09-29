import type { ComponentType } from "react";
import IntroVisual from "./IntroVisual";
import BondingVisual from "./BondingVisual";
import PackingVisual from "./PackingVisual";
import MillerVisual from "./MillerVisual";
import DefectsVisual from "./DefectsVisual";
import ThermoVisual from "./ThermoVisual";
import BinaryVisual from "./BinaryVisual";
import TernaryVisual from "./TernaryVisual";
import DiffusionVisual from "./DiffusionVisual";
import NucleationVisual from "./NucleationVisual";
import SolidificationVisual from "./SolidificationVisual";
import TttVisual from "./TttVisual";
import SteelsVisual from "./SteelsVisual";
import AlloysVisual from "./AlloysVisual";
import OutroVisual from "./OutroVisual";

/** Chapter id -> visual for the materials chemistry course. */
export const visuals: Record<string, ComponentType<{ visual: string }>> = {
  intro: IntroVisual,
  bonding: BondingVisual,
  packing: PackingVisual,
  miller: MillerVisual,
  defects: DefectsVisual,
  thermo: ThermoVisual,
  binary: BinaryVisual,
  ternary: TernaryVisual,
  diffusion: DiffusionVisual,
  nucleation: NucleationVisual,
  solidification: SolidificationVisual,
  ttt: TttVisual,
  steels: SteelsVisual,
  alloys: AlloysVisual,
  outro: OutroVisual,
};
