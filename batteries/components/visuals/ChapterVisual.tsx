"use client";

import type { ComponentType } from "react";
import { visuals as electrochemistry } from "./electrochemistry";
import { visuals as introCircuits } from "./intro-circuits";
import { visuals as introEnergy } from "./intro-energy";
import { visuals as materials } from "./materials";

export const VISUALS: Record<string, Record<string, ComponentType<{ visual: string }>>> = {
  electrochemistry,
  "intro-circuits": introCircuits,
  "intro-energy": introEnergy,
  materials,
};

export default function ChapterVisual({ courseId, chapterId, visual }: { courseId: string; chapterId: string; visual: string }) {
  const Visual = VISUALS[courseId]?.[chapterId];
  return Visual ? <Visual visual={visual} /> : null;
}
