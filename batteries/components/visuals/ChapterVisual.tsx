"use client";

import type { ComponentType } from "react";
import { visuals as electrochemistry } from "./electrochemistry";
import { visuals as introCircuits } from "./intro-circuits";
import { visuals as introEnergy } from "./intro-energy";
import { visuals as materials } from "./materials";
import { visuals as polymers } from "./polymers";
import { visuals as electromobility } from "./electromobility";
import { visuals as materialsAnalysis } from "./materials-analysis";

export const VISUALS: Record<string, Record<string, ComponentType<{ visual: string }>>> = {
  electrochemistry,
  "intro-circuits": introCircuits,
  "intro-energy": introEnergy,
  materials,
  polymers,
  electromobility,
  "materials-analysis": materialsAnalysis,
};

export default function ChapterVisual({ courseId, chapterId, visual }: { courseId: string; chapterId: string; visual: string }) {
  const Visual = VISUALS[courseId]?.[chapterId];
  return Visual ? <Visual visual={visual} /> : null;
}
