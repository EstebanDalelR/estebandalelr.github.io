import { getCourse } from "./courses";
import { stepKey } from "./narration";
import { electrochemistry } from "./references/electrochemistry";
import { introCircuits } from "./references/intro-circuits";
import { introEnergy } from "./references/intro-energy";
import { materials } from "./references/materials";

export type Formula = { chapterId: string; stepId?: string; label: string; tex: string };
export type Definition = { term: string; chapterId: string; text: string };

/** Per-course content for the reference slide; slide equations are collected automatically. */
export type CourseReference = {
  /** Names for the equations shown on the slides, keyed by chapter/step. */
  formulaLabels: Record<string, string>;
  /** Formulas worth listing that no slide shows. */
  extraFormulas: Formula[];
  definitions: Definition[];
};

const REFERENCES: Record<string, CourseReference> = {
  electrochemistry,
  "intro-circuits": introCircuits,
  "intro-energy": introEnergy,
  materials,
};

export function getReference(courseId: string): { formulas: Formula[]; definitions: Definition[] } {
  const { chapters } = getCourse(courseId).narration;
  const ref = REFERENCES[courseId] ?? { formulaLabels: {}, extraFormulas: [], definitions: [] };
  const order = (id: string) => chapters.findIndex((c) => c.id === id);
  const formulas = [
    ...chapters.flatMap((c) =>
      c.steps
        .filter((s) => s.equation)
        .map((s) => ({ chapterId: c.id, stepId: s.id, label: ref.formulaLabels[stepKey(c.id, s.id)] ?? c.title, tex: s.equation! }))
    ),
    ...ref.extraFormulas,
  ].sort((a, b) => order(a.chapterId) - order(b.chapterId));
  return { formulas, definitions: ref.definitions };
}
