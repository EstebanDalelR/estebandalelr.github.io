import type { Narration } from "./narration";
import electrochemistry from "@batteries/data/courses/electrochemistry.json";
import introCircuits from "@batteries/data/courses/intro-circuits.json";
import introEnergy from "@batteries/data/courses/intro-energy.json";
import materials from "@batteries/data/courses/materials.json";

export type Course = {
  id: string;
  route: string;
  /** Short label for the home page card. */
  label: string;
  blurb: string;
  narration: Narration;
};

export const COURSES: Course[] = [
  {
    id: "intro-energy",
    route: "/batteries/introduction/energy-storage",
    label: "Energy in Society & Energy Storage",
    blurb: "Thermodynamics, hydro, fuels, electromagnetic storage, economics and battery chemistries.",
    narration: introEnergy as Narration,
  },
  {
    id: "intro-circuits",
    route: "/batteries/introduction/electric-circuits",
    label: "Electric Circuits & the Grid",
    blurb: "Current, voltage, Kirchhoff, impedance, synchronised generators and frequency regulation.",
    narration: introCircuits as Narration,
  },
  {
    id: "materials",
    route: "/batteries/materials",
    label: "Materials Chemistry",
    blurb: "Bonding, crystal structures, phase diagrams, diffusion, nucleation, TTT diagrams and alloys.",
    narration: materials as Narration,
  },
  {
    id: "electrochemistry",
    route: "/batteries/electrochemistry",
    label: "Applied Electrochemistry",
    blurb: "Voltaic pile to Butler–Volmer: every question of the March 2023 exam.",
    narration: electrochemistry as Narration,
  },
];

export function getCourse(id: string): Course {
  const course = COURSES.find((c) => c.id === id);
  if (!course) throw new Error(`Unknown course: ${id}`);
  return course;
}
