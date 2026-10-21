"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { prefersReducedMotion, useWakeLock } from "@batteries/lib/browser";
import { CARD_MS, MAX_WPM, MIN_WPM, WPM_STEP, buildWords, clampWpm, delayFactor, delayMs, endsSentence, orpIndex } from "@batteries/lib/rsvp";

const PRESETS = [250, 300, 350, 400];
const WPM_KEY = "battery-masters:rsvp-wpm";
const SWIPE_PX = 40;
const BTN = "h-10 min-w-10 rounded-full border px-3 text-sm";
const IDLE = "border-white/10 bg-panel text-ink/80 hover:text-ink";
const ON = "border-accent bg-accent/20 text-accent";
const TICK = "h-3 w-px bg-accent/60";

type Chapter = { id: string; title: string; steps: { id: string; text: string }[] };

/** RSVP reader: one word at a time on a fixed pivot letter (ORP), so the eyes never move. */
export default function SpeedReader({
  chapters,
  start,
  onClose,
  onShowScript,
}: {
  chapters: Chapter[];
  /** Where to begin: chapter index and optional step index. */
  start: { chapter: number; step?: number };
  onClose: () => void;
  onShowScript: () => void;
}) {
  const words = useMemo(() => buildWords(chapters), [chapters]);
  // prefix[i] = sum of delay factors before word i, so time remaining is O(1).
  const prefix = useMemo(() => {
    const p = [0];
    words.forEach((w) => p.push(p[p.length - 1] + delayFactor(w)));
    return p;
  }, [words]);
  const chapterStart = useMemo(() => chapters.map((_, ci) => words.findIndex((w) => w.chapter === ci)), [chapters, words]);
  const sentenceStarts = useMemo(
    () => words.reduce<number[]>((acc, w, i) => (i === 0 || words[i - 1].stepEnd || endsSentence(words[i - 1].text) ? [...acc, i] : acc), []),
    [words],
  );
  const first = useMemo(() => {
    if (start.step == null) return Math.max(0, chapterStart[start.chapter]);
    return Math.max(0, words.findIndex((w) => w.chapter === start.chapter && w.step === start.step));
  }, [start, words, chapterStart]);

  const [idx, setIdx] = useState(first);
  const [wpm, setWpm] = useState(300);
  const [draft, setDraft] = useState("300");
  const [playing, setPlaying] = useState(true);
  const [card, setCard] = useState(() => chapterStart[words[first]?.chapter] === first);
  const [done, setDone] = useState(false);
  const [reduced, setReduced] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const dueRef = useRef(0);
  // True only when the timer itself advanced; after a pause or a jump there is no lateness to repay.
  const chainedRef = useRef(false);

  // Remember the reader's speed (best effort: storage may be blocked).
  useEffect(() => {
    setReduced(prefersReducedMotion());
    try {
      const saved = Number(localStorage.getItem(WPM_KEY));
      if (saved) {
        const w = clampWpm(saved);
        setWpm(w);
        setDraft(String(w));
      }
    } catch {}
  }, []);

  const changeWpm = useCallback((next: number) => {
    const w = clampWpm(next);
    setWpm(w);
    setDraft(String(w));
    try {
      localStorage.setItem(WPM_KEY, String(w));
    } catch {}
  }, []);

  useWakeLock(playing && !done);

  // Timer chain: one timeout per word or title card, re-armed by each state change. Lateness of
  // the previous tick is taken off the next delay so jitter does not accumulate.
  useEffect(() => {
    if (!playing || done) return;
    const w = words[idx];
    if (!w) return;
    const want = card ? CARD_MS : delayMs(w, wpm);
    const late = chainedRef.current ? Math.min(want / 2, Math.max(0, performance.now() - dueRef.current)) : 0;
    chainedRef.current = false;
    const wait = Math.max(0, want - late);
    dueRef.current = performance.now() + wait;
    const t = setTimeout(() => {
      chainedRef.current = true;
      if (card) return setCard(false);
      if (idx + 1 >= words.length) return setDone(true);
      setIdx(idx + 1);
      if (words[idx + 1].chapter !== w.chapter) setCard(true);
    }, wait);
    return () => clearTimeout(t);
  }, [playing, done, idx, card, wpm, words]);

  const jump = useCallback(
    (i: number) => {
      setIdx(Math.min(words.length - 1, Math.max(0, i)));
      setCard(false);
      setDone(false);
      dueRef.current = performance.now();
    },
    [words.length],
  );

  const bySentence = useCallback(
    (dir: 1 | -1) => {
      let s = 0;
      sentenceStarts.forEach((v, k) => {
        if (v <= idx) s = k;
      });
      if (dir === 1) jump(sentenceStarts[s + 1] ?? words.length - 1);
      else jump(sentenceStarts[idx > sentenceStarts[s] ? s : s - 1] ?? 0);
    },
    [idx, jump, sentenceStarts, words.length],
  );

  const toChapterStart = useCallback(() => {
    jump(chapterStart[words[idx].chapter]);
    setCard(true);
  }, [chapterStart, idx, jump, words]);

  const toggle = useCallback(() => setPlaying((p) => !p), []);

  const restart = () => {
    jump(first);
    setCard(chapterStart[words[first].chapter] === first);
    setPlaying(true);
  };

  // Keys: capture on window and stop propagation, so the Explainer and NarratorPanel handlers
  // (Space, arrows) never see them while the reader is open. The wpm field keeps normal typing.
  const keyRef = useRef({ toggle, bySentence, changeWpm, onClose, wpm });
  keyRef.current = { toggle, bySentence, changeWpm, onClose, wpm };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      e.stopPropagation();
      const k = keyRef.current;
      const el = e.target as HTMLElement;
      if (e.key === "Escape") {
        e.preventDefault();
        return k.onClose();
      }
      if (e.key === "Tab") {
        const f = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input") ?? []);
        if (!f.length) return;
        const at = f.indexOf(el);
        e.preventDefault();
        f[e.shiftKey ? (at <= 0 ? f.length - 1 : at - 1) : at === f.length - 1 ? 0 : at + 1].focus();
        return;
      }
      if (el instanceof HTMLInputElement && el.type === "number") return;
      if (e.key === " ") k.toggle();
      else if (e.key === "ArrowLeft") k.bySentence(-1);
      else if (e.key === "ArrowRight") k.bySentence(1);
      else if (e.key === "ArrowUp") k.changeWpm(k.wpm + WPM_STEP);
      else if (e.key === "ArrowDown") k.changeWpm(k.wpm - WPM_STEP);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, []);

  // Focus the dialog on open and give focus back on close.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => prev?.focus?.();
  }, []);

  const w = words[idx];
  const chapter = chapters[w?.chapter ?? 0];
  const remainingMs = (prefix[words.length] - prefix[idx]) * (60000 / wpm) + (chapters.length - 1 - (w?.chapter ?? 0)) * CARD_MS;
  const fmt = (ms: number) => {
    const s = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const p = w ? orpIndex(w.text) : 0;
  const left = w?.text.slice(0, p) ?? "";
  const pivot = w?.text[p] ?? "";
  const right = w?.text.slice(p + 1) ?? "";
  // Shrink long tokens so the longer side fits half the stage (monospace glyph is ~0.62em wide).
  const side = Math.max(4, left.length, right.length);
  const fontSize = `min(3.75rem, ${(44 / (0.62 * side)).toFixed(2)}cqw)`;
  const minutes = words.length / wpm;

  const onPointerDown = (e: React.PointerEvent) => {
    downRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = downRef.current;
    downRef.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (e.pointerType === "touch" && Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(e.clientY - d.y)) bySentence(dx < 0 ? 1 : -1);
    else toggle();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-bg/95 p-3 sm:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Speed reader"
        tabIndex={-1}
        className="flex max-h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto rounded-2xl border border-white/10 bg-panel p-4 shadow-2xl outline-none sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">⚡ Speed read</p>
            <p className="truncate text-xs text-ink/60">{chapter.title}</p>
          </div>
          <button onClick={onClose} aria-label="Close speed reader" title="Close (Esc)" className={`${BTN} ${IDLE}`}>
            ✕
          </button>
        </div>

        {done ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-4 text-center">
            <p className="text-lg font-semibold text-ink" role="status">
              Done: {words.length} words in {minutes.toFixed(1)} min at {wpm} wpm
            </p>
            <div className="flex gap-2">
              <button onClick={restart} className={`${BTN} ${ON}`}>
                ↺ Restart
              </button>
              <button onClick={onClose} className={`${BTN} ${IDLE}`}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (downRef.current = null)}
            title="Tap to play or pause"
            className="relative flex min-h-48 cursor-pointer select-none items-center justify-center rounded-xl bg-bg/60 [container-type:inline-size] [touch-action:pan-y]"
          >
            {card ? (
              <p key={chapter.id} className={`px-4 text-center text-xl font-bold text-ink sm:text-3xl ${reduced ? "" : "animate-pulse"}`}>
                {chapter.title}
              </p>
            ) : (
              <div className="flex w-full flex-col items-center gap-1" aria-hidden="true">
                <span className={TICK} />
                <div className="flex w-full items-baseline font-mono leading-none text-ink" style={{ fontSize, whiteSpace: "pre" }}>
                  <span className="flex-1 text-right">{left}</span>
                  <span className="text-accent">{pivot}</span>
                  <span className="flex-1 text-left">{right}</span>
                </div>
                <span className={TICK} />
              </div>
            )}
            {!playing && <span className="absolute bottom-2 right-3 text-xs text-ink/50">paused</span>}
          </div>
        )}

        <div>
          <input
            type="range"
            min={0}
            max={words.length - 1}
            value={done ? words.length - 1 : idx}
            onChange={(e) => jump(Number(e.target.value))}
            aria-label="Reading position"
            aria-valuetext={`word ${idx + 1} of ${words.length}`}
            className="h-2 w-full cursor-pointer accent-accent"
          />
          <div className="mt-1 flex justify-between text-xs tabular-nums text-ink/60">
            <span>{Math.round(((done ? words.length : idx + 1) / words.length) * 100)}%</span>
            <span>
              {done ? "0:00" : fmt(remainingMs)} left at {wpm} wpm
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button onClick={toChapterStart} aria-label="Back to chapter start" title="Chapter start" className={`${BTN} ${IDLE}`}>
            ⏮
          </button>
          <button onClick={() => bySentence(-1)} aria-label="Back one sentence" title="Back one sentence (←)" className={`${BTN} ${IDLE}`}>
            ◀
          </button>
          <button
            onClick={done ? restart : toggle}
            aria-label={playing && !done ? "Pause" : "Play"}
            title="Play/pause (Space)"
            className={`${BTN} min-w-14 ${ON}`}
          >
            {playing && !done ? "⏸" : "▶"}
          </button>
          <button onClick={() => bySentence(1)} aria-label="Forward one sentence" title="Forward one sentence (→)" className={`${BTN} ${IDLE}`}>
            ▶
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button onClick={() => changeWpm(wpm - WPM_STEP)} aria-label="Slower" title="Slower (↓)" className={`${BTN} ${IDLE}`}>
            −
          </button>
          {PRESETS.map((v) => (
            <button key={v} onClick={() => changeWpm(v)} aria-pressed={wpm === v} className={`${BTN} tabular-nums ${wpm === v ? ON : IDLE}`}>
              {v}
            </button>
          ))}
          <button onClick={() => changeWpm(wpm + WPM_STEP)} aria-label="Faster" title="Faster (↑)" className={`${BTN} ${IDLE}`}>
            +
          </button>
          <label className="flex items-center gap-1 text-xs text-ink/60">
            <input
              type="number"
              inputMode="numeric"
              min={MIN_WPM}
              max={MAX_WPM}
              step={WPM_STEP}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => changeWpm(Number(draft))}
              onKeyDown={(e) => e.key === "Enter" && changeWpm(Number(draft))}
              aria-label="Words per minute"
              className="h-10 w-20 rounded-full border border-white/10 bg-bg px-3 text-center text-sm tabular-nums text-ink"
            />
            wpm
          </label>
        </div>

        <p className="text-center text-xs text-ink/50">
          Space play/pause · ←/→ sentence · ↑/↓ speed · Esc close. This display is silent for screen readers on purpose;{" "}
          <button onClick={onShowScript} className="text-accent underline underline-offset-2">
            use the normal script
          </button>
          .
        </p>
        <div aria-live="off" className="sr-only">
          {w?.text}
        </div>
      </div>
    </div>
  );
}
