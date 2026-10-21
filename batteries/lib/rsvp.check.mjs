// Self-check for rsvp.ts: `node batteries/lib/rsvp.check.mjs` (Node 22.6+ strips the types).
import assert from "node:assert/strict";
import { tokenize, orpIndex, delayFactor, endsSentence, clampWpm } from "./rsvp.ts";

const toks = (s) => tokenize(s).map((t) => t.text);
assert.deepEqual(toks("The cell gives 3.45 V at 160 mAh/g, then 25 °C."), ["The", "cell", "gives", "3.45 V", "at", "160 mAh/g,", "then", "25 °C."]);
assert.deepEqual(toks("LiCoO₂ stores 10²³ ions - a lot"), ["LiCoO₂", "stores", "10²³", "ions", "a", "lot"]);
assert.equal(tokenize("ions - a")[0].dashAfter, true);
assert.deepEqual(toks("We have 3 batteries"), ["We", "have", "3", "batteries"]); // no unit: not merged
assert.deepEqual(toks("  spaced \n out  "), ["spaced", "out"]);

// ORP: 1->0, 2-5->1, 6-9->2, 10-13->3, else 4; leading punctuation shifts the pivot, trailing does not count.
const orp = (s) => orpIndex(s);
assert.equal(orp("a"), 0);
assert.equal(orp("is"), 1);
assert.equal(orp("cells,"), 1); // core "cells" = 5
assert.equal(orp("anodes"), 2);
assert.equal(orp("(anodes)"), 3); // lead 1 + 2
assert.equal(orp("“the"), 2); // lead 1 + 1
assert.equal(orp("electrolyte"), 3); // 11
assert.equal(orp("electrochemical"), 4); // 15
assert.equal(orp("..."), 2); // all punctuation: falls back, stays in range

assert.ok(endsSentence("end.") && endsSentence('said."') && endsSentence("why?"));
assert.ok(!endsSentence("e.g.") && !endsSentence("3.45") && !endsSentence("vs."));
const f = (text, o = {}) => delayFactor({ text, dashAfter: false, stepEnd: false, ...o });
assert.equal(f("cat"), 1);
assert.ok(Math.abs(f("electrolyte") - 1.2) < 1e-9); // len 11 -> 1 + 0.04*5
assert.equal(f("electrochemically-stable-thing"), 1.6); // cap
assert.equal(f("cat,"), 1.5);
assert.equal(f("cat.") , 2.2);
assert.equal(f("cat.", { stepEnd: true }), 3);
assert.equal(f("cat", { dashAfter: true }), 1.5);
assert.deepEqual([clampWpm(10), clampWpm(5000), clampWpm(312), clampWpm(NaN)], [100, 1000, 300, 300]);
console.log("rsvp checks passed");
