// Pure helpers for the RSVP speed reader (no React, so they can be self-checked in node).

export type Word = {
  text: string;
  chapter: number;
  step: number;
  /** Last word of a step: gets the longest pause. */
  stepEnd: boolean;
  /** A dash followed this token in the source. */
  dashAfter: boolean;
};

export const MIN_WPM = 100;
export const MAX_WPM = 1000;
export const WPM_STEP = 25;
export const CARD_MS = 1200;

export const clampWpm = (n: number) => {
  if (!Number.isFinite(n)) return 300;
  return Math.min(MAX_WPM, Math.max(MIN_WPM, Math.round(n / WPM_STEP) * WPM_STEP));
};

// Units that should stay glued to the number before them: 160 mAh/g, 3.45 V, 25 °C, 10 %.
const UNIT = /^(?:[kMGTmµnp]?(?:V|A|W|Wh|Ah|J|Hz|Ω|g|m|s|C|K|mol|L|eV|Pa|N)|°C|°|%)(?:\/[A-Za-z]+|·[A-Za-z]+|[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)*[.,;:!?)"”]*$/;
const NUMBER = /^[~≈<>≥≤±+\-−(]?\d[\d.,]*(?:[×x]10[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]*)?$/;
const DASH = /^[—–-]+$/;
const ABBREV = /^(?:(?:[a-z]\.){2,}|(?:e\.g|i\.e|vs|etc|fig|approx|ca|cf|no|dr)\.)$/i;

/** Split a text into display tokens; numbers keep their unit, bare dashes fold into the previous token. */
export function tokenize(text: string): { text: string; dashAfter: boolean }[] {
  const raw = text.split(/\s+/).filter(Boolean);
  const out: { text: string; dashAfter: boolean }[] = [];
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i];
    if (DASH.test(t) && out.length) {
      out[out.length - 1].dashAfter = true;
      continue;
    }
    const next = raw[i + 1];
    if (next && NUMBER.test(t) && UNIT.test(next)) {
      out.push({ text: `${t} ${next}`, dashAfter: false });
      i++;
    } else {
      out.push({ text: t, dashAfter: false });
    }
  }
  return out;
}

const LEAD = /^[^\p{L}\p{N}]*/u;
const TRAIL = /[.,;:!?"'”’)\]…—–-]*$/u;

/** Lead punctuation length and the length of the word proper (no lead/trail punctuation). */
export function parts(text: string) {
  const lead = LEAD.exec(text)![0].length;
  const rest = text.slice(lead);
  const core = rest.replace(TRAIL, "").length || rest.length;
  return { lead, core };
}

export const orpOf = (len: number) => (len <= 1 ? 0 : len <= 5 ? 1 : len <= 9 ? 2 : len <= 13 ? 3 : 4);

/** Index of the pivot letter in the full token (leading punctuation counts as offset). */
export function orpIndex(text: string) {
  const { lead, core } = parts(text);
  return Math.min(text.length - 1, lead + orpOf(core));
}

export const endsSentence = (text: string) => {
  const t = text.replace(/["'”’)\]]+$/, "");
  return /[.!?…]$/.test(t) && !ABBREV.test(t) && !/^\d+\.$/.test(t) ? true : false;
};
const endsClause = (w: Pick<Word, "text" | "dashAfter">) => w.dashAfter || /[,;:—–]["'”’)\]]*$/.test(w.text);

/** Delay multiplier on the base 60000/wpm: word length and trailing punctuation. */
export function delayFactor(w: Pick<Word, "text" | "dashAfter" | "stepEnd">) {
  const { core } = parts(w.text);
  let f = Math.min(1.6, 1 + 0.04 * Math.max(0, core - 6));
  if (w.stepEnd) f *= 3;
  else if (endsSentence(w.text)) f *= 2.2;
  else if (endsClause(w)) f *= 1.5;
  return f;
}

export const delayMs = (w: Pick<Word, "text" | "dashAfter" | "stepEnd">, wpm: number) => (60000 / wpm) * delayFactor(w);

/** Flatten chapters into words, in reading order. */
export function buildWords(chapters: { steps: { text: string }[] }[]): Word[] {
  const words: Word[] = [];
  chapters.forEach((c, ci) =>
    c.steps.forEach((s, si) => {
      const toks = tokenize(s.text);
      toks.forEach((t, k) => words.push({ ...t, chapter: ci, step: si, stepEnd: k === toks.length - 1 }));
    }),
  );
  return words;
}
