"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import scrollama from "scrollama";
import { AnimatePresence, motion } from "framer-motion";
import NarratorPanel, { isTyping } from "@batteries/components/narrator/NarratorPanel";
import ProgressBar from "@batteries/components/scrolly/ProgressBar";
import ReferenceSlide from "@batteries/components/reference/ReferenceSlide";
import ScrollSection, { stepAnchor } from "@batteries/components/scrolly/ScrollSection";
import { getCourse } from "@batteries/lib/courses";
import { isCoarsePointer, enterFullscreen, prefersReducedMotion, useFullscreen, useMediaSession, useWakeLock } from "@batteries/lib/browser";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SPEED_KEY = "battery-masters:speed";
const SEEK_SECONDS = 5;
const BTN = "h-10 min-w-10 rounded-full border px-3 text-xs sm:h-auto sm:min-w-0 sm:py-1.5 [@media(max-height:500px)]:h-10 [@media(max-height:500px)]:min-w-10";
const IDLE = "border-white/10 bg-panel text-ink/80 hover:text-ink";
const ON = "border-accent bg-accent/20 text-accent";
const formatSpeed = (s: number) => `${s}×`;

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
  const [speed, setSpeed] = useState(1);

  // Remember the listener's speed between visits (best effort: storage may be blocked).
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(SPEED_KEY));
      if (SPEEDS.includes(saved)) setSpeed(saved);
    } catch {}
  }, []);
  const changeSpeed = useCallback((delta: number) => {
    setSpeed((s) => {
      const next = SPEEDS[(SPEEDS.indexOf(s) + delta + SPEEDS.length) % SPEEDS.length];
      try {
        localStorage.setItem(SPEED_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);
  // Slide a skip is scrolling towards; `pos` lags until the smooth scroll lands.
  const pendingRef = useRef<number | null>(null);
  // Set once scrollama reports a real position, so the #chapter in a shared link isn't overwritten.
  const locatedRef = useRef(false);
  const [copied, setCopied] = useState(false);
  const seekRef = useRef<((delta: number) => void) | null>(null);
  const fullscreen = useFullscreen();

  useEffect(() => {
    const scroller = scrollama();
    scroller
      .setup({ step: ".step", offset: 0.6 })
      .onStepEnter(({ element, index }) => {
        if (index === pendingRef.current) pendingRef.current = null;
        locatedRef.current = true;
        setPos({ chapter: Number(element.dataset.chapter), step: Number(element.dataset.step) });
      });
    const onResize = () => scroller.resize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
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
    // Switch slides now rather than when the scroll lands: a hidden tab never runs the smooth
    // scroll, so waiting on scrollama would stop the narration while the audio is in the background.
    if (target.classList.contains("step")) {
      setPos({ chapter: Number(target.dataset.chapter), step: Number(target.dataset.step) });
    }
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: document.hidden || prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  // Background tabs don't scroll, so catch the page up with the narration on return.
  const posRef = useRef(pos);
  posRef.current = pos;
  useEffect(() => {
    const onVisible = () => {
      if (document.hidden) return;
      const { chapter, step } = posRef.current;
      const el = document.querySelector<HTMLElement>(`.step[data-chapter="${chapter}"][data-step="${step}"]`);
      if (!el || Math.abs(el.getBoundingClientRect().top) < 2) return;
      pendingRef.current = null;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "auto" });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
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
      else if (e.key === "f" || e.key === "F") fullscreen.toggle();
      else if (e.key === ">") changeSpeed(1);
      else if (e.key === "<") changeSpeed(-1);
      else return;
      // Also stops a focused button from treating Space as a click (double toggle).
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, goToStep, changeSpeed, fullscreen.toggle]);

  const chapter = chapters[pos.chapter];
  const step = chapter.steps[pos.step];

  // Keep the address bar on the current slide (#chapter, or #chapter--step past a chapter's
  // first slide) so the URL always points at what is on screen and can be shared as is.
  useEffect(() => {
    if (!locatedRef.current) return;
    const c = chapters[pos.chapter];
    const hash = pos.step > 0 ? `#${stepAnchor(c.id, c.steps[pos.step].id)}` : pos.chapter > 0 ? `#${c.id}` : "";
    if (window.location.hash === hash) return;
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search + hash);
  }, [pos.chapter, pos.step, chapters]);

  useWakeLock(started && !paused);
  useMediaSession(
    started,
    { title: `${chapter.title}${chapter.steps.length > 1 ? ` (${pos.step + 1}/${chapter.steps.length})` : ""}`, artist: "Battery Masters", album: narration.title },
    paused,
    {
      play: () => setPaused(false),
      pause: () => setPaused(true),
      previous: () => goToStep(-1),
      next: () => goToStep(1),
      seek: (d) => seekRef.current?.(d),
    },
  );

  const chapterLabel = (i: number) => `${i === 0 ? "Start" : `Chapter ${i}`} · ${chapters[i].title}`;

  const shareChapter = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}#${chapter.id}`;
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: `${narration.title}: ${chapter.title}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }, [chapter, narration.title]);

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
            rate={speed}
            subtitles={subtitles}
            onToggleSubtitles={() => setSubtitles((v) => !v)}
            onFinished={next}
            onCue={setSpoken}
            seekRef={seekRef}
          />
          <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-[max(0.75rem,env(safe-area-inset-left))] right-[max(0.75rem,env(safe-area-inset-right))] z-40 flex items-center justify-between gap-1.5 sm:bottom-[max(1rem,env(safe-area-inset-bottom))] sm:left-[max(1rem,env(safe-area-inset-left))] sm:right-auto sm:justify-start sm:gap-2">
            <button
              onClick={() => goToStep(-1)}
              aria-label="Previous slide"
              title="Previous slide (↑)"
              className={`${BTN} ${IDLE}`}
            >
              ⏮
            </button>
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play" : "Pause"}
              title={`${paused ? "Play" : "Pause"} (Space) · ←/→ seek ${SEEK_SECONDS}s`}
              className={`${BTN} ${IDLE}`}
            >
              {paused ? "▶" : "⏸"}
            </button>
            <button
              onClick={() => goToStep(1)}
              aria-label="Next slide"
              title="Next slide (↓)"
              className={`${BTN} ${IDLE}`}
            >
              ⏭
            </button>
            <button
              onClick={() => changeSpeed(1)}
              aria-label={`Playback speed ${formatSpeed(speed)}`}
              title="Playback speed (< / >)"
              className={`${BTN} tabular-nums sm:min-w-[3.25rem] ${speed === 1 ? IDLE : ON}`}
            >
              {formatSpeed(speed)}
            </button>
            <button
              onClick={shareChapter}
              aria-label={copied ? "Link copied" : "Share chapter"}
              title={`Copy a link to ${chapterLabel(pos.chapter)}`}
              className={`${BTN} ${copied ? ON : IDLE}`}
            >
              {copied ? "✓" : "🔗"}
              <span className="max-sm:hidden [@media(max-height:500px)]:hidden">{copied ? " Link copied" : " Share chapter"}</span>
            </button>
            <button
              onClick={() => setAutoAdvance((a) => !a)}
              aria-label={autoAdvance ? "Auto-play on" : "Auto-play off"}
              aria-pressed={autoAdvance}
              title="Auto-play next slide"
              className={`${BTN} ${autoAdvance ? ON : "border-white/10 bg-panel text-ink/80"}`}
            >
              ▶<span className="max-sm:hidden [@media(max-height:500px)]:hidden"> {autoAdvance ? "Auto-play on" : "Auto-play off"}</span>
            </button>
            {fullscreen.supported && (
              <button
                onClick={fullscreen.toggle}
                aria-label={fullscreen.active ? "Exit full screen" : "Full screen"}
                aria-pressed={fullscreen.active}
                title="Full screen (F)"
                className={`${BTN} ${fullscreen.active ? ON : IDLE}`}
              >
                {fullscreen.active ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" /></svg>
                )}
              </button>
            )}
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
              {(pos.chapter > 0 || pos.step > 0) && (
                <p className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
                  Starts at {chapterLabel(pos.chapter)}
                  {pos.step > 0 && ` · slide ${pos.step + 1} of ${chapter.steps.length}`}
                </p>
              )}
              <button
                onClick={() => {
                  setAutoAdvance(true);
                  setStarted(true);
                  // Taps on phones are the only chance to go full screen; keyboard users can press F.
                  if (isCoarsePointer()) enterFullscreen();
                }}
                className="mt-6 rounded-full bg-accent px-6 py-2.5 font-semibold text-bg hover:brightness-110"
              >
                ▶ Start
              </button>
              {(pos.chapter > 0 || pos.step > 0) && (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "auto" })}
                  className="mt-3 block w-full text-xs text-ink/60 underline underline-offset-2 hover:text-ink"
                >
                  or go back to the beginning
                </button>
              )}
              <p className="mt-4 text-xs text-ink/50">Space pause · ←/→ seek · ↑/↓ slides · &lt;/&gt; speed · C subtitles · F full screen</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
