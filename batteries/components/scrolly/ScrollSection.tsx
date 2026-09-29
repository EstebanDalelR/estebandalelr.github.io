"use client";

import { useEffect, useRef } from "react";
import AnimatedEquation from "@batteries/components/equations/AnimatedEquation";
import ChapterVisual from "@batteries/components/visuals/ChapterVisual";
import type { Chapter } from "@batteries/lib/narration";
import { spotlight } from "@batteries/lib/spotlight";

type Props = {
  courseId: string;
  chapter: Chapter;
  index: number;
  activeStep: number;
  /** Sentence the tutor is saying; labels it names are highlighted on the slide. */
  spoken: string;
};

export const stepAnchor = (chapterId: string, stepId: string) => `${chapterId}--${stepId}`;

/**
 * One chapter: a full-screen sticky stage (title, visual, formula) with one
 * invisible full-screen scroll stop per narrated step on top of it.
 */
export default function ScrollSection({ courseId, chapter, index, activeStep, spoken }: Props) {
  const current = chapter.steps[activeStep];
  const total = chapter.steps.length;
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visualRef.current) spotlight(visualRef.current, spoken);
  }, [spoken, current.visual]);

  return (
    <section id={chapter.id} className="relative">
      <div className="sticky top-0 h-slide flex flex-col px-4 pb-[var(--caption-space)] pt-14 sm:px-8">
        <header className="mx-auto w-full max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {index === 0 ? "Start" : `Chapter ${index}`}
            {total > 1 && (
              <span className="ml-3 font-normal tracking-normal text-ink/50">
                {activeStep + 1} / {total}
              </span>
            )}
          </p>
          <h2 className="mt-1 text-3xl font-bold leading-tight text-ink sm:text-5xl">{chapter.title}</h2>
          {chapter.exam.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {chapter.exam.map((q) => (
                <span key={q} className="rounded-full border border-accent/40 bg-accent/10 px-3 py-0.5 text-xs text-accent">
                  Exam {q}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="mx-auto mt-4 flex min-h-0 w-full max-w-6xl flex-1 items-center justify-center">
          <div ref={visualRef} className="aspect-[4/3] h-full max-w-full rounded-2xl border border-white/5 bg-panel/60 p-2">
            <ChapterVisual courseId={courseId} chapterId={chapter.id} visual={current.visual} />
          </div>
        </div>
        <div className="mx-auto flex min-h-14 w-full max-w-4xl items-center justify-center">
          {current.equation && <AnimatedEquation tex={current.equation} className="w-full text-sm sm:text-lg" />}
        </div>
      </div>

      <div className="-mt-slide">
        {chapter.steps.map((s, i) => (
          <div
            key={s.id}
            id={stepAnchor(chapter.id, s.id)}
            className="step h-slide pointer-events-none"
            data-chapter={index}
            data-step={i}
          >
            <p className="sr-only">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
