export type Step = {
  id: string;
  visual: string;
  text: string;
  equation?: string;
  /** Optional external resource shown as a button on the slide (e.g. a practice tool). */
  link?: { href: string; label: string };
};

export type Chapter = {
  id: string;
  title: string;
  exam: string[];
  steps: Step[];
};

export type Narration = {
  title: string;
  course: string;
  /** Where the exam questions in `Chapter.exam` come from, shown in the footer. */
  examSource: string;
  chapters: Chapter[];
};

export type Cue = { start: number; end: number; text: string };

export const stepKey = (chapterId: string, stepId: string) => `${chapterId}/${stepId}`;
export const audioSrc = (courseId: string, chapterId: string, stepId: string) =>
  `/batteries/audio/${courseId}/${chapterId}/${stepId}.mp3`;
export const timingsSrc = (courseId: string) => `/batteries/audio/${courseId}/timings.json`;

/**
 * Split a step's narration into subtitle-sized sentences. A sentence ends at
 * . ! or ? followed by whitespace, so decimals like "0.1 V" stay whole.
 * Must match split_sentences() in tts/speech.py.
 */
export function splitSentences(text: string): string[] {
  const parts = text.split(/(?<=[.!?]["')\]]?)\s+/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [text];
}

// Reading speed used when a step has no audio yet (chars per second).
const FALLBACK_CPS = 15;

export function fallbackDuration(text: string) {
  return Math.max(2, text.length / FALLBACK_CPS);
}

/**
 * Subtitle cues for a step. Exact timings come from public/audio/<course>/timings.json
 * (written by tts/generate.py); otherwise sentences are spread over the clip
 * duration in proportion to their length.
 */
export function buildCues(text: string, duration: number, exact?: Cue[]): Cue[] {
  if (exact?.length) return exact;
  const sentences = splitSentences(text);
  const total = sentences.reduce((n, s) => n + s.length, 0);
  let t = 0;
  return sentences.map((s) => {
    const len = (s.length / total) * duration;
    const cue = { start: t, end: t + len, text: s };
    t += len;
    return cue;
  });
}
