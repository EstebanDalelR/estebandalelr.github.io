import type { CourseReference } from "../reference";

export const materialsAnalysis: CourseReference = {
  formulaLabels: {
    "intro/hello": "LiCoO₂ / graphite full-cell reaction",
    "tga/oxalate": "Calcium oxalate monohydrate decomposition (TGA)",
    "dsc/crystallinity": "Degree of crystallinity from DSC",
    "mech/stress-strain": "Young's modulus and shear modulus",
    "mech/dma": "Loss tangent (DMA)",
  },
  extraFormulas: [
    { chapterId: "tga", label: "Theoretical mass loss", tex: "\\Delta m\\,(\\%) = 100 \\cdot \\frac{M_{\\text{released}}}{M_{\\text{start}}}" },
    { chapterId: "mech", label: "Complex modulus", tex: "E^* = E' + iE'' \\qquad |E^*| = \\sigma_0/\\varepsilon_0" },
  ],
  definitions: [
    { term: "Jelly roll", chapterId: "intro", text: "The spirally wound stack in a cylindrical cell: Cu foil + anode, porous separator, cathode + Al foil." },
    { term: "Electrode composition", chapterId: "intro", text: "> 90 wt% active material, < 5 wt% conductive carbon, < 5 wt% binder (PVDF or cellulose); ≈ 30 % porosity, 100–200 µm per stack." },
    { term: "SEI", chapterId: "intro", text: "Solid electrolyte interphase: a layer of electrolyte decomposition products on the anode; a 3D interphase rather than a 2D interface." },
    { term: "Probe – matter – interaction – detection", chapterId: "framework", text: "The chain behind every technique: what is sent in, the sample, what happens (scattering, absorption, emission) and what is measured." },
    { term: "Non-destructive vs destructive", chapterId: "framework", text: "The sample survives intact (e.g. X-ray scattering) or is permanently changed (e.g. ARC, most thermal analysis)." },
    { term: "Bulk vs surface", chapterId: "framework", text: "XRD and neutrons probe the bulk; XPS probes only the top few nm, where the SEI is." },
    { term: "Ex situ / post mortem / in situ / operando", chapterId: "framework", text: "Measured after removal; after the cell died; inside a working setup; during actual operation." },
    { term: "MAX IV and ESS", chapterId: "framework", text: "Lund's synchrotron X-ray source and the European Spallation Source for neutrons (first neutrons planned early 2027)." },
    { term: "Temperature program", chapterId: "thermal", text: "Isothermal, dynamic (constant rate), heat–cool cycles, ramps with holds, or a sinusoidal modulation on a ramp." },
    { term: "TGA / DTG", chapterId: "tga", text: "Thermogravimetric analysis: mass vs temperature; the derivative (DTG) turns each mass step into a peak." },
    { term: "Evolved gas analysis", chapterId: "tga", text: "TGA/STA coupled to MS or GC-MS to identify the gas released at each mass step." },
    { term: "DTA", chapterId: "dsc", text: "Differential thermal analysis: temperature difference between sample and reference; shows when events happen." },
    { term: "DSC", chapterId: "dsc", text: "Differential scanning calorimetry: heat flow into or out of the sample; peak area gives the enthalpy (J/g)." },
    { term: "Glass transition (Tg)", chapterId: "dsc", text: "A step in the DSC baseline where heat capacity rises as chains gain mobility; a tan δ peak in DMA." },
    { term: "Enthalpy relaxation", chapterId: "dsc", text: "An endothermic peak at Tg after a glass is aged below Tg; grows with aging time." },
    { term: "Thermal runaway", chapterId: "safety", text: "Exothermic reactions raise the temperature, which accelerates them further, until venting or fire. Strongly SOC dependent." },
    { term: "ARC", chapterId: "safety", text: "Accelerating rate calorimetry: heat–wait–search in an adiabatic bomb; once self-heating exceeds ≈ 0.02 °C/min the calorimeter tracks the cell." },
    { term: "Elasticity, stiffness, strength, hardness", chapterId: "mech", text: "Returning to shape; stress per strain (modulus); stress before permanent deformation or fracture; resistance to local deformation." },
    { term: "Creep / stress relaxation", chapterId: "mech", text: "Strain growing with time at constant stress / stress decaying with time at constant strain." },
    { term: "Storage and loss modulus", chapterId: "mech", text: "E′: elastic, in-phase response; E″: viscous, out-of-phase (dissipated) response; tan δ = E″/E′." },
  ],
};
