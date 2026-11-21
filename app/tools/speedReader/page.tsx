"use client";

import { useMemo, useState } from "react";
import SpeedReader from "@batteries/components/reference/SpeedReader";
import { buildWords } from "@batteries/lib/rsvp";

/** Paragraphs become steps, so they get the long end-of-step pause. */
const toChapters = (text: string) => [
  {
    id: "pasted",
    title: "Speed read",
    steps: text
      .split(/\n\s*\n/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t, i) => ({ id: String(i), text: t })),
  },
];

export default function SpeedReaderTool() {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const chapters = useMemo(() => toChapters(text), [text]);
  const count = useMemo(() => buildWords(chapters).length, [chapters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
            Speed Reader
          </h1>
          <p className="text-lg text-gray-600">Paste text, then read it one word at a time.</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xl sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <label htmlFor="sr-text" className="text-sm font-semibold text-gray-700">
              Your text
            </label>
            <span className="text-sm tabular-nums text-gray-500">{count} words</span>
          </div>
          <textarea
            id="sr-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            placeholder="Paste your text here..."
            className="w-full resize-y rounded-lg border-2 border-gray-200 p-4 text-sm focus:border-teal-400 focus:outline-none"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setText("")}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(true)}
              disabled={count === 0}
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ⚡ Speed read
            </button>
          </div>
        </div>
      </div>

      {open && <SpeedReader chapters={chapters} start={{ chapter: 0 }} onClose={() => setOpen(false)} />}
    </div>
  );
}
