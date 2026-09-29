/**
 * Spotlight: while the tutor speaks a sentence, light up the slide labels it
 * names ("pumped storage", "Coal", "Nernst"...). Matching is by whole words so
 * no slide needs per-sentence annotations.
 */

// Labels longer than this are captions, not things the tutor points at.
const MAX_LABEL_WORDS = 4;

const STOPWORDS = new Set(
  "the and for with not but from into per are was were has have its this that than then all any can our you".split(" "),
);

const tokens = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    // crude plural folding so "batteries" finds "Battery" and "dams" finds "Dam"
    .map((w) => (w.length > 4 && w.endsWith("ies") ? w.slice(0, -3) + "y" : w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));

/** Word list for a label, or null when it isn't something worth spotlighting. */
export function labelWords(label: string): string[] | null {
  const words = tokens(label);
  if (!words.length || words.length > MAX_LABEL_WORDS) return null;
  const meaningful = words.filter((w) => /[a-z]{3,}/.test(w) && !STOPWORDS.has(w));
  return meaningful.length ? words : null;
}

/** True when the sentence says the label's words, in order and next to each other. */
export function mentions(sentence: string[], label: string[]): boolean {
  outer: for (let i = 0; i + label.length <= sentence.length; i++) {
    for (let j = 0; j < label.length; j++) if (sentence[i + j] !== label[j]) continue outer;
    return true;
  }
  return false;
}

export const SPOT_CLASS = "bm-spot";

/** Mark every SVG label under `root` that the spoken sentence mentions; clears the rest. */
export function spotlight(root: Element, spoken: string) {
  const sentence = tokens(spoken);
  root.querySelectorAll("text").forEach((el) => {
    const words = sentence.length ? labelWords(el.textContent ?? "") : null;
    el.classList.toggle(SPOT_CLASS, !!words && mentions(sentence, words));
  });
}
