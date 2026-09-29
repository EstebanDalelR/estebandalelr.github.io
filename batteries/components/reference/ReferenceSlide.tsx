"use client";

import { useState } from "react";
import AnimatedEquation from "@batteries/components/equations/AnimatedEquation";
import { stepAnchor } from "@batteries/components/scrolly/ScrollSection";
import { getCourse } from "@batteries/lib/courses";
import { getReference } from "@batteries/lib/reference";

const TABS = ["Formulas", "Definitions", "Full script"] as const;
type Tab = (typeof TABS)[number];

export default function ReferenceSlide({ courseId }: { courseId: string }) {
  const { narration } = getCourse(courseId);
  const { chapters } = narration;
  const { formulas, definitions } = getReference(courseId);
  const chapterLabel = (id: string) => {
    const i = chapters.findIndex((c) => c.id === id);
    return `${i === 0 ? "Start" : `Ch. ${i}`} · ${chapters[i].title}`;
  };
  const [tab, setTab] = useState<Tab>("Formulas");

  return (
    <section id="reference" data-stop className="h-slide flex flex-col px-4 pb-[var(--caption-space)] pt-14 sm:px-8">
      <header className="mx-auto w-full max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Reference</p>
        <h2 className="mt-1 text-3xl font-bold leading-tight text-ink sm:text-5xl">Formulas, definitions & script</h2>
        <div role="tablist" className="mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full border px-4 py-1.5 text-sm ${
                tab === t ? "border-accent bg-accent/20 text-accent" : "border-white/10 bg-panel text-ink/80 hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div role="tabpanel" className="mx-auto mt-4 min-h-0 w-full max-w-6xl flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-white/5 bg-panel/60 p-4 sm:p-6">
        {tab === "Formulas" && (
          <div className="grid gap-4 lg:grid-cols-2">
            {formulas.map((f) => (
              <a
                key={f.label}
                href={`#${f.stepId ? stepAnchor(f.chapterId, f.stepId) : f.chapterId}`}
                className="block rounded-xl border border-white/10 bg-bg/60 p-4 hover:border-accent/50"
              >
                <p className="text-sm font-semibold text-ink">{f.label}</p>
                <p className="text-xs text-ink/50">{chapterLabel(f.chapterId)}</p>
                <AnimatedEquation tex={f.tex} className="mt-2 text-sm sm:text-base" />
              </a>
            ))}
          </div>
        )}

        {tab === "Definitions" && (
          <dl className="grid gap-x-8 gap-y-4 lg:grid-cols-2">
            {definitions.map((d) => (
              <div key={d.term}>
                <dt className="font-semibold text-ink">
                  {d.term}{" "}
                  <a href={`#${d.chapterId}`} className="ml-1 text-xs font-normal text-accent hover:underline">
                    {chapterLabel(d.chapterId)}
                  </a>
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-ink/75">{d.text}</dd>
              </div>
            ))}
          </dl>
        )}

        {tab === "Full script" && (
          <div className="mx-auto max-w-3xl space-y-8">
            {chapters.map((c) => (
              <div key={c.id}>
                <h3 className="text-lg font-bold text-ink">
                  <a href={`#${c.id}`} className="hover:text-accent">
                    {chapterLabel(c.id)}
                  </a>
                </h3>
                <div className="mt-2 space-y-2">
                  {c.steps.map((s) => (
                    <a
                      key={s.id}
                      href={`#${stepAnchor(c.id, s.id)}`}
                      className="block rounded-lg px-2 py-1 leading-relaxed text-ink/80 hover:bg-white/5 hover:text-ink"
                    >
                      {s.text}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-ink/50">
              Based on the course material for {narration.course}. {narration.examSource}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
