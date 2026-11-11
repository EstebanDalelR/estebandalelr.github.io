import type { CourseReference } from "../reference";

export const polymers: CourseReference = {
  formulaLabels: {
    "mw/number-average": "Number-average molar mass",
    "mw/weight-average": "Weight-average molar mass and dispersity",
    "mw/example": "Worked example: 1 : 1 mixture of 10 000 and 30 000 g/mol",
    "mw/measure": "Intrinsic viscosity and Mark–Houwink",
  },
  extraFormulas: [
    { chapterId: "mw", label: "End-group analysis", tex: "\\bar M_n = M_0\\,\\frac{[\\text{repeating units}]}{[\\text{end groups}]} = M_0\\,X_n" },
  ],
  definitions: [
    { term: "Nucleophile", chapterId: "organic", text: "A species with a region of high electron density (δ−), such as a lone pair or negative charge, that donates electrons." },
    { term: "Electrophile", chapterId: "organic", text: "A species with a region of low electron density (δ+), such as a carbon bonded to a halogen or a carbonyl carbon, that accepts electrons." },
    { term: "Nucleophilic substitution", chapterId: "organic", text: "A nucleophile attacks an electrophilic carbon and replaces a leaving group, e.g. OH⁻ + CH₃Br → CH₃OH + Br⁻." },
    { term: "Homolytic cleavage", chapterId: "organic", text: "A bond breaks evenly so each fragment keeps one electron: the initiation step of a radical reaction (heat, UV, metal catalyst)." },
    { term: "Combination vs disproportionation", chapterId: "organic", text: "The two radical terminations: two chain ends join into one chain, or a hydrogen transfers to give two dead chains, one ending in C=C." },
    { term: "Isomers", chapterId: "stereo", text: "Molecules with the same formula but a different arrangement in space, e.g. cis- and trans-2-butene." },
    { term: "Chiral centre / enantiomers", chapterId: "stereo", text: "A carbon with four different groups; its two non-superimposable mirror-image forms are enantiomers." },
    { term: "Tacticity", chapterId: "stereo", text: "Relative stereochemistry of adjacent stereocentres along a chain: isotactic (same side), syndiotactic (alternating), atactic (random). Set by synthesis; regular chains can crystallise." },
    { term: "Macromolecular hypothesis", chapterId: "history", text: "Staudinger (1920): polymers are long covalent chains, not colloidal clusters of small molecules. Accepted around 1930." },
    { term: "Polymer / macromolecule (IUPAC)", chapterId: "basics", text: "A polymer is a substance composed of macromolecules; a macromolecule has high relative molecular mass built from many repetitions of units derived from small molecules." },
    { term: "Monomer vs repeating unit", chapterId: "basics", text: "The monomer is the starting molecule (CH₂=CH₂); the repeating unit is what repeats in the chain (–CH₂–). They are not the same." },
    { term: "Copolymer types", chapterId: "basics", text: "Two monomers in one chain: alternating, random, block (long runs of each) or graft (side chains of B on a backbone of A)." },
    { term: "Thermoplastic, thermoset, elastomer", chapterId: "basics", text: "Uncrosslinked chains that melt and remould; a dense rigid network that chars rather than melts; a lightly crosslinked rubber that stretches and recovers." },
    { term: "Gel", chapterId: "basics", text: "A polymer network swollen in a solvent." },
    { term: "Dispersity (Đ)", chapterId: "mw", text: "Mw / Mn ≥ 1; equal to 1 only for a perfectly monodisperse sample." },
    { term: "Degree of polymerisation (Xn)", chapterId: "mw", text: "Average number of repeating units per chain; Mn = Xn · M₀." },
    { term: "GPC / SEC", chapterId: "mw", text: "Gel permeation (size exclusion) chromatography: separates by hydrodynamic volume; large coils elute first. Calibrated with narrow standards to give the full distribution." },
    { term: "Oligomer vs polymer", chapterId: "mw", text: "A chain is a polymer once adding or removing one unit no longer noticeably changes its properties." },
  ],
};
