import type { CourseReference, Definition, Formula } from "../reference";

// Names for the equations shown on the slides, keyed by chapter/step.
const formulaLabels: Record<string, string> = {
  "li-ion/which-negative": "Graphite and LFP electrode reactions",
  "li-ion/upd": "Nernst equation for lithium deposition",
  "edl/potential": "Double-layer capacitance (compact + diffuse in series)",
  "cv/reverse": "Reversible CV: peak separation and formal potential",
  "cv/info": "Randles–Ševčík peak current (25 °C)",
  "controlled-current/cons": "Effective cut-off potentials with iR drop",
  "supercaps/power": "Energy stored in a capacitor",
  "fuel-cells/pem": "PEM fuel cell anode and cathode reactions",
  "capacity-fade/diffusion": "Diffusion layer thickness",
  "eis/basics": "Impedance",
  "eis/why": "Time constant and characteristic frequency",
  "kinetics/bv": "Butler–Volmer equation",
  "kinetics/particles": "Diffusion time vs particle size",
};

const extraFormulas: Formula[] = [
  { chapterId: "controlled-current", label: "Capacity from a constant-current test", tex: "Q = I\\,t" },
];

const definitions: Definition[] = [
  { term: "Anode", chapterId: "voltaic-pile", text: "The electrode where oxidation happens. In a discharging cell it is the negative electrode (zinc in the Voltaic pile)." },
  { term: "Cathode", chapterId: "voltaic-pile", text: "The electrode where reduction happens. In a discharging cell it is the positive electrode (copper in the Voltaic pile)." },
  { term: "Electrolyte", chapterId: "voltaic-pile", text: "An ionic conductor that is an electronic insulator. Ions carry the current inside the cell, electrons carry it in the outer circuit." },
  { term: "Series connection", chapterId: "voltaic-pile", text: "Cells stacked so the positive of one touches the negative of the next; their voltages add up." },
  { term: "Intercalation", chapterId: "li-ion", text: "Reversible insertion of ions (here Li⁺) into a host structure that stays roughly unchanged, with the ions balancing the electrons the host gains or loses." },
  { term: "Cell balancing", chapterId: "li-ion", text: "Matching the capacity (not the mass) of the negative and positive electrodes. The negative is given about 10 % extra so lithium metal never plates." },
  { term: "Underpotential deposition", chapterId: "li-ion", text: "Deposition of a metal at potentials positive of its standard potential, because the first atoms dissolve into the substrate and have an activity far below one." },
  { term: "Passivation", chapterId: "li-ion", text: "Protection of a metal by a thin surface layer, such as the oxide or AlF₃ layer on an aluminium current collector." },
  { term: "SEI (solid electrolyte interphase)", chapterId: "li-ion", text: "A layer formed by electrolyte reduction on the negative electrode. It conducts Li⁺ but not electrons, and consumes lithium as it grows." },
  { term: "Dendrites", chapterId: "li-ion", text: "Needle-like lithium metal growths that can pierce the separator and short-circuit the cell." },
  { term: "Electric double layer", chapterId: "edl", text: "The charge separation at an electrode–electrolyte interface: excess charge on the metal and an equal, opposite layer of ions in solution." },
  { term: "Helmholtz model", chapterId: "edl", text: "The simplest double-layer picture: a parallel-plate capacitor with a fixed layer of ions at the surface." },
  { term: "Stern model", chapterId: "edl", text: "A compact layer (inner and outer Helmholtz planes) at the surface plus a diffuse layer beyond it; the two capacitances act in series." },
  { term: "Diffuse layer", chapterId: "edl", text: "The region where thermal motion spreads out the ions and the potential decays exponentially into the bulk. It is thin at high concentration." },
  { term: "Potential of zero charge", chapterId: "edl", text: "The electrode potential at which the surface carries no excess charge; the diffuse-layer capacitance has its minimum there." },
  { term: "Cyclic voltammetry", chapterId: "cv", text: "Sweeping the working-electrode potential linearly in time, reversing it, and recording the current." },
  { term: "Formal potential (E°′)", chapterId: "cv", text: "The equilibrium potential of a redox couple under the actual experimental conditions; for a reversible couple it is the midpoint of the two CV peaks." },
  { term: "Semi-infinite diffusion", chapterId: "cv", text: "Diffusion to a flat electrode from an effectively unlimited solution. Randles–Ševčík, Cottrell and Sand all assume it, so they do not hold in thin porous battery cells." },
  { term: "Supporting electrolyte", chapterId: "cv", text: "An excess of inert salt that carries the current so the reacting species move by diffusion only, not migration." },
  { term: "Galvanostatic (controlled current)", chapterId: "controlled-current", text: "Fixing the current and recording the potential. Constant current means constant reaction rate, and capacity is current × time." },
  { term: "Potentiostatic (controlled potential)", chapterId: "controlled-current", text: "Fixing the potential and recording the current, which lets you choose which reaction can happen." },
  { term: "iR drop", chapterId: "controlled-current", text: "The ohmic potential loss, current × resistance. It shrinks the usable cycling window by 2iR." },
  { term: "Ragone plot", chapterId: "supercaps", text: "Specific energy against specific power: fuel cells at high energy, supercapacitors at high power, batteries in between." },
  { term: "Supercapacitor (EDLC)", chapterId: "supercaps", text: "A device that stores charge in the electric double layer of high-surface-area carbon: very fast and long-lived, but low energy density." },
  { term: "Pseudocapacitance", chapterId: "supercaps", text: "Capacitor-like charge storage from fast surface redox reactions, e.g. surface groups, RuO₂ or conducting polymers." },
  { term: "PEM fuel cell", chapterId: "fuel-cells", text: "A fuel cell with a proton exchange membrane (e.g. Nafion): H₂ is oxidised at the anode and O₂ is reduced to water at the cathode." },
  { term: "Oxygen reduction reaction (ORR)", chapterId: "fuel-cells", text: "The sluggish cathode reaction O₂ + 4H⁺ + 4e⁻ → 2H₂O, the main source of activation loss in a PEM fuel cell." },
  { term: "Polarisation curve", chapterId: "fuel-cells", text: "Cell voltage against current density, showing activation, ohmic and mass-transport losses in turn." },
  { term: "Three-phase boundary", chapterId: "fuel-cells", text: "Where catalyst (electrons), ionomer (protons) and gas meet; the reaction can only happen there." },
  { term: "Transference number", chapterId: "capacity-fade", text: "The fraction of the current carried by one ion. For Li⁺ it is below one, which can limit transport at high rates." },
  { term: "Coulombic efficiency", chapterId: "kinetics", text: "Charge out on discharge divided by charge in on charge; side reactions such as SEI growth lower it." },
  { term: "Impedance spectroscopy (EIS)", chapterId: "eis", text: "Applying a small sine-wave perturbation over a range of frequencies and measuring the amplitude ratio and phase of the response." },
  { term: "Nyquist plot", chapterId: "eis", text: "−Z″ (imaginary part) plotted against Z′ (real part) of the impedance." },
  { term: "Blocking electrode", chapterId: "eis", text: "An electrode where no charge crosses the interface, so it only charges the double layer and looks like a capacitor." },
  { term: "Time constant (τ = RC)", chapterId: "eis", text: "The characteristic response time of a process; it only responds to signals with a period longer than τ." },
  { term: "Overpotential (η)", chapterId: "kinetics", text: "The extra potential beyond equilibrium needed to drive a current." },
  { term: "Exchange current density (j₀)", chapterId: "kinetics", text: "The equal forward and backward reaction rate at equilibrium. A large j₀ means small overpotentials." },
  { term: "Symmetry factor (β)", chapterId: "kinetics", text: "Sets how symmetric the oxidation and reduction branches of Butler–Volmer are; β ≈ 0.5 gives similar overpotentials on charge and discharge." },
];

export const electrochemistry: CourseReference = { formulaLabels, extraFormulas, definitions };
