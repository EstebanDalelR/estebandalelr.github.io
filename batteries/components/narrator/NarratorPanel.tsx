"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Avatar from "./Avatar";
import SubtitleBar from "./SubtitleBar";
import { audioSrc, buildCues, fallbackDuration, stepKey, timingsSrc, type Cue, type Step } from "@batteries/lib/narration";

type Props = {
  courseId: string;
  chapterId: string;
  step: Step;
  paused: boolean;
  subtitles: boolean;
  onToggleSubtitles: () => void;
  onFinished?: () => void;
  /** Called with the sentence being spoken ("" between sentences). */
  onCue?: (text: string) => void;
};

type Timings = Record<string, { duration: number; cues: Cue[] }>;

const SEEK_SECONDS = 5;

export const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * Plays the active step's clip, drives lip sync from an AnalyserNode and
 * shows timed subtitles. Steps without a recording fall back to a timed
 * "reading" so the page works before any audio exists.
 */
export default function NarratorPanel({ courseId, chapterId, step, paused, subtitles, onToggleSubtitles, onFinished, onCue }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timingsRef = useRef<Timings>({});
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const [mouth, setMouth] = useState(0);
  const [cue, setCue] = useState<string>("");
  const [speaking, setSpeaking] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const onCueRef = useRef(onCue);
  onCueRef.current = onCue;
  useEffect(() => onCueRef.current?.(cue), [cue]);

  useEffect(() => {
    fetch(timingsSrc(courseId))
      .then((r) => (r.ok ? r.json() : {}))
      .then((t) => (timingsRef.current = t))
      .catch(() => {});
  }, [courseId]);

  // Mounted only after the Start click, so the AudioContext is allowed to start.
  useEffect(() => {
    if (audioRef.current) return;
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioRef.current = audio;
    analyserRef.current = analyser;
  }, []);

  useEffect(() => {
    const key = stepKey(chapterId, step.id);
    const audio = audioRef.current;
    let raf = 0;
    let cancelled = false;
    let fallbackStart = 0;
    let pauseOffset = 0; // ms spent paused, shifts the fallback clock forward
    let pausedSince = 0;
    let useFallback = !audio;
    let duration = fallbackDuration(step.text);
    let cues = buildCues(step.text, duration);
    const buf = new Uint8Array(256);

    let done = false;

    const finish = () => {
      done = true;
      setSpeaking(false);
      setMouth(0);
      onFinishedRef.current?.();
    };

    const elapsed = () => {
      if (!useFallback) return audio!.currentTime;
      const now = pausedSince || performance.now();
      return (now - fallbackStart - pauseOffset) / 1000;
    };

    const seek = (delta: number) => {
      const t = Math.max(0, Math.min(duration, elapsed() + delta));
      if (useFallback) fallbackStart -= (t - elapsed()) * 1000;
      else audio!.currentTime = t;
      setCue(cues.find((c) => t >= c.start && t < c.end)?.text ?? "");
      if (done && t < duration) {
        done = false;
        setSpeaking(true);
        if (!useFallback && !pausedRef.current) audio!.play().catch(() => {});
        raf = requestAnimationFrame(tick);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      e.preventDefault();
      seek(e.key === "ArrowLeft" ? -SEEK_SECONDS : SEEK_SECONDS);
    };
    window.addEventListener("keydown", onKey);

    const startFallback = () => {
      useFallback = true;
      duration = fallbackDuration(step.text);
      cues = buildCues(step.text, duration);
      fallbackStart = performance.now();
      pauseOffset = 0;
    };

    const tick = () => {
      if (cancelled) return;
      if (pausedRef.current) {
        if (!pausedSince) pausedSince = performance.now();
        raf = requestAnimationFrame(tick);
        return;
      }
      if (pausedSince) {
        pauseOffset += performance.now() - pausedSince;
        pausedSince = 0;
      }
      let t: number;
      let level: number;
      if (useFallback) {
        t = (performance.now() - fallbackStart - pauseOffset) / 1000;
        // No voice to analyse: fake a talking rhythm.
        level = 0.35 + 0.35 * Math.sin(t * 17) * Math.sin(t * 5.3);
        if (t >= duration) {
          setCue("");
          finish();
          return;
        }
      } else {
        t = audio!.currentTime;
        analyserRef.current!.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += ((buf[i] - 128) / 128) ** 2;
        level = Math.min(1, Math.sqrt(sum / buf.length) * 5);
      }
      setMouth(level);
      setCue(cues.find((c) => t >= c.start && t < c.end)?.text ?? "");
      raf = requestAnimationFrame(tick);
    };

    setSpeaking(true);
    if (useFallback) {
      startFallback();
    } else {
      audio!.pause();
      audio!.src = audioSrc(courseId, chapterId, step.id);
      audio!.onloadedmetadata = () => {
        const exact = timingsRef.current[key];
        duration = audio!.duration;
        cues = buildCues(step.text, duration, exact?.cues);
      };
      audio!.onended = () => {
        cancelAnimationFrame(raf);
        setCue("");
        finish();
      };
      audio!.onerror = () => startFallback();
      if (!pausedRef.current) audio!.play().catch(() => startFallback());
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      if (audio) {
        audio.onended = audio.onerror = audio.onloadedmetadata = null;
        audio.pause();
      }
    };
  }, [courseId, chapterId, step]);

  // Pause/resume the underlying audio element when the transport pause toggles.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (paused) audio.pause();
    else audio.play().catch(() => {});
  }, [paused]);

  return (
    <>
      {subtitles && <SubtitleBar text={cue} />}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="relative h-28 w-28 rounded-full border border-white/10 bg-panel shadow-2xl shadow-black/40 sm:h-36 sm:w-36"
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ boxShadow: speaking ? `0 0 ${10 + mouth * 30}px rgba(61,214,198,0.55)` : "0 0 0px rgba(0,0,0,0)" }}
                transition={{ duration: 0.08 }}
              />
              <div className="h-full w-full overflow-hidden rounded-full">
                <Avatar mouth={mouth} speaking={speaking} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex gap-2">
          <button
            onClick={onToggleSubtitles}
            aria-pressed={subtitles}
            title="Subtitles (C)"
            className={`rounded-full border px-3 py-1.5 text-xs ${
              subtitles ? "border-accent bg-accent/20 text-accent" : "border-white/10 bg-panel text-ink/80 hover:text-ink"
            }`}
          >
            {subtitles ? "CC on" : "CC off"}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-full border border-white/10 bg-panel px-3 py-1.5 text-xs text-ink/80 hover:text-ink"
            aria-label={collapsed ? "Show narrator" : "Hide narrator"}
          >
            {collapsed ? "Show tutor" : "Hide"}
          </button>
        </div>
      </div>
    </>
  );
}
