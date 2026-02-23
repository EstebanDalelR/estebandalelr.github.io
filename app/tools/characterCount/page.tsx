"use client";

import { useState, useMemo } from "react";

export default function CharacterCount() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter((s) => s.trim()).length;
    const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const lines = text === "" ? 0 : text.split("\n").length;

    const freq: Record<string, number> = {};
    for (const char of text.toLowerCase()) {
      if (char.trim()) {
        freq[char] = (freq[char] || 0) + 1;
      }
    }
    const topChars = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return { characters, charactersNoSpaces, words, sentences, paragraphs, lines, topChars };
  }, [text]);

  const handleClear = () => setText("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-2">
            Character Count
          </h1>
          <p className="text-gray-600 text-lg">
            Paste or type text to get detailed character and word statistics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Characters", value: stats.characters },
            { label: "No Spaces", value: stats.charactersNoSpaces },
            { label: "Words", value: stats.words },
            { label: "Sentences", value: stats.sentences },
            { label: "Paragraphs", value: stats.paragraphs },
            { label: "Lines", value: stats.lines },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white rounded-xl shadow-md p-4 text-center"
            >
              <p className="text-3xl font-bold text-gray-800">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Text Area */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700">
              Your Text
            </label>
            <button
              onClick={handleClear}
              className="px-4 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder="Start typing or paste your text here..."
            className="w-full border-2 border-gray-200 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-teal-400 transition-colors resize-y"
          />
        </div>

        {/* Top Characters */}
        {stats.topChars.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Most Frequent Characters
            </h2>
            <div className="space-y-2">
              {stats.topChars.map(([char, count]) => {
                const max = stats.topChars[0][1];
                const pct = (count / max) * 100;
                return (
                  <div key={char} className="flex items-center gap-3">
                    <span className="w-8 text-center font-mono text-sm bg-gray-100 rounded px-2 py-1">
                      {char}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-10 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
