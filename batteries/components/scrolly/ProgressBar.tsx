"use client";

import Link from "next/link";
import type { Chapter } from "@batteries/lib/narration";

export default function ProgressBar({ chapters, chapterIndex, stepIndex }: { chapters: Chapter[]; chapterIndex: number; stepIndex: number }) {
  const last = chapters.length - 1;
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-10 items-center gap-1 bg-bg/80 px-3 backdrop-blur" aria-label="Chapters">
      <Link href="/batteries" className="mr-2 text-xs text-ink/60 hover:text-ink" aria-label="All videos">
        ← All
      </Link>
      {chapters.map((c, i) => {
        const fill = i < chapterIndex ? 1 : i === chapterIndex ? (stepIndex + 1) / c.steps.length : 0;
        // Pin edge tooltips to the side they sit on so they never leave the viewport.
        const align = i === 0 ? "left-0" : i === last ? "right-0" : "left-1/2 -translate-x-1/2";
        return (
          <a key={c.id} href={`#${c.id}`} aria-label={c.title} className="group relative flex h-full flex-1 items-center">
            <span className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10 transition-[height] group-hover:h-2.5">
              <span className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-500" style={{ width: `${fill * 100}%` }} />
            </span>
            <span
              className={`pointer-events-none absolute top-full mt-1 whitespace-nowrap rounded-md border border-white/10 bg-panel px-2.5 py-1 text-xs text-ink opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${align}`}
            >
              <span className="text-accent">{i === 0 ? "Start" : `Chapter ${i}`}</span> · {c.title}
            </span>
          </a>
        );
      })}
      <a
        href="#reference"
        className="ml-2 shrink-0 rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-ink/70 hover:border-accent/50 hover:text-accent"
      >
        Reference
      </a>
    </nav>
  );
}
