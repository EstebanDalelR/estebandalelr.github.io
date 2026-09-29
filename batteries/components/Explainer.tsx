"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import scrollama from "scrollama";
import { AnimatePresence, motion } from "framer-motion";
import NarratorPanel, { isTyping } from "@batteries/components/narrator/NarratorPanel";
import ProgressBar from "@batteries/components/scrolly/ProgressBar";
import ReferenceSlide from "@batteries/components/reference/ReferenceSlide";
import ScrollSection from "@batteries/components/scrolly/ScrollSection";
import { getCourse } from "@batteries/lib/courses";

/** A narrated, full-screen slide video for one course. */
export default function Explainer({ courseId }: { courseId: string }) {
  const { narration } = getCourse(courseId);
  const { chapters } = narration;
  const [pos, setPos] = useState({ chapter: 0, step: 0 });
  const [started, setStarted] = useState(false);
  const [subtitles, setSubtitles] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [paused, setPaused] = useState(false);
  const [spoken, setSpoken] = useState("");
  // Slide a skip is scrolling towards; `pos` lags until the smooth scroll lands.
  const pendingRef = useRef<number | null>(null);

  useEffect(() => {
    const scroller = scrollama();
    scroller
      .setup({ step: ".step", offset: 0.6 })
      .onStepEnter(({ element, index }) => {
        if (index === pendingRef.current) pendingRef.current = null;
        setPos({ chapter: Number(element.dataset.chapter), step: Number(element.dataset.step) });
      });
    const onResize = () => scroller.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      scroller.destroy();
    };
  }, []);

  useEffect(() => {
    const clear = () => (pendingRef.current = null);
    const events = ["scrollend", "wheel", "touchmove"] as const;
    events.forEach((e) => window.addEventListener(e, clear, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, clear));
  }, []);

  // Slide stops: every narrated step plus the un-narrated reference slide.
  const goToStep = useCallback((delta: number) => {
    const stops = Array.from(document.querySelectorAll<HTMLElement>(".step, [data-stop]"));
    const current =
      pendingRef.current ?? Math.max(
        0,
        stops.reduce((last, el, i) => (el.getBoundingClientRect().top <= window.innerHeight / 2 ? i : last), -1),
      );
    const target = stops[current + delta];
    if (!target) return;
    pendingRef.current = current + delta;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
  }, []);

  // Auto-advance: when the tutor finishes a step, scroll to the next one.
  const next = useCallback(() => {
    if (!autoAdvance) return;
    setTimeout(() => goToStep(1), 600);
  }, [autoAdvance, goToStep]);

  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === " ") setPaused((p) => !p);
      else if (e.key === "ArrowUp") goToStep(-1);
      else if (e.key === "ArrowDown") goToStep(1);
      else if (e.key === "c" || e.key === "C") setSubtitles((v) => !v);
      else return;
      // Also stops a focused button from treating Space as a click (double toggle).
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, goToStep]);

  const chapter = chapters[pos.chapter];
  const step = chapter.steps[pos.step];

  return (
    <main className="min-h-screen bg-bg">
      <ProgressBar chapters={chapters} chapterIndex={pos.chapter} stepIndex={pos.step} />

      {chapters.map((c, i) => (
        <ScrollSection
          key={c.id}
          courseId={courseId}
          chapter={c}
          index={i}
          // Chapters already passed keep their last slide so the stage doesn't jump while scrolling away.
          activeStep={i === pos.chapter ? pos.step : i < pos.chapter ? c.steps.length - 1 : 0}
          spoken={i === pos.chapter ? spoken : ""}
        />
      ))}

      <ReferenceSlide courseId={courseId} />

      {started && (
        <>
          <NarratorPanel
            courseId={courseId}
            chapterId={chapter.id}
            step={step}
            paused={paused}
            subtitles={subtitles}
            onToggleSubtitles={() => setSubtitles((v) => !v)}
            onFinished={next}
            onCue={setSpoken}
          />
          <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
            <button
              onClick={() => goToStep(-1)}
              aria-label="Previous slide"
              title="Previous slide (↑)"
              className="rounded-full border border-white/10 bg-panel px-3 py-1.5 text-xs text-ink/80 hover:text-ink"
            >
              ⏮
            </button>
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play" : "Pause"}
              title={`${paused ? "Play" : "Pause"} (Space) · ←/→ seek 5s`}
              className="rounded-full border border-white/10 bg-panel px-3 py-1.5 text-xs text-ink/80 hover:text-ink"
            >
              {paused ? "▶" : "⏸"}
            </button>
            <button
              onClick={() => goToStep(1)}
              aria-label="Next slide"
              title="Next slide (↓)"
              className="rounded-full border border-white/10 bg-panel px-3 py-1.5 text-xs text-ink/80 hover:text-ink"
            >
              ⏭
            </button>
            <button
              onClick={() => setAutoAdvance((a) => !a)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                autoAdvance ? "border-accent bg-accent/20 text-accent" : "border-white/10 bg-panel text-ink/80"
              }`}
            >
              {autoAdvance ? "▶ Auto-play on" : "▶ Auto-play off"}
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {!started && (
          <motion.div
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-bg/90 px-4 backdrop-blur-sm"
          >
            <div className="max-w-md rounded-2xl border border-white/10 bg-panel p-6 text-center shadow-2xl sm:p-8">
              <p className="text-sm uppercase tracking-widest text-accent">Exam explainer</p>
              <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">{narration.title}</h1>
              <p className="mt-3 text-ink/70">Your tutor talks you through every exam topic, slide by slide.</p>
              <button
                onClick={() => {
                  setAutoAdvance(true);
                  setStarted(true);
                }}
                className="mt-6 rounded-full bg-accent px-6 py-2.5 font-semibold text-bg hover:brightness-110"
              >
                ▶ Start
              </button>
              <p className="mt-4 text-xs text-ink/50">Space pause · ←/→ seek · ↑/↓ slides · C subtitles</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
