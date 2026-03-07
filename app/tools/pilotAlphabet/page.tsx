"use client";

import { useState, useEffect, useCallback } from "react";

const natoAlphabet: { [key: string]: string } = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
  D: "Delta",
  E: "Echo",
  F: "Foxtrot",
  G: "Golf",
  H: "Hotel",
  I: "India",
  J: "Juliet",
  K: "Kilo",
  L: "Lima",
  M: "Mike",
  N: "November",
  O: "Oscar",
  P: "Papa",
  Q: "Quebec",
  R: "Romeo",
  S: "Sierra",
  T: "Tango",
  U: "Uniform",
  V: "Victor",
  W: "Whiskey",
  X: "X-ray",
  Y: "Yankee",
  Z: "Zulu",
};

const natoNumbers: { [key: string]: string } = {
  "0": "Zero",
  "1": "One",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Niner",
};

const allNato = { ...natoAlphabet, ...natoNumbers };

type QuizMode = "letterToWord" | "wordToLetter";

export default function PilotAlphabet() {
  const [textInput, setTextInput] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Quiz state
  const [quizMode, setQuizMode] = useState<QuizMode>("letterToWord");
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(
    null
  );
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  const generateQuestion = useCallback(() => {
    const letters = Object.keys(natoAlphabet);
    const letter = letters[Math.floor(Math.random() * letters.length)];
    setQuizQuestion(
      quizMode === "letterToWord" ? letter : natoAlphabet[letter]
    );
    setQuizAnswer("");
    setQuizFeedback(null);
  }, [quizMode]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const checkAnswer = () => {
    const trimmed = quizAnswer.trim();
    if (!trimmed) return;

    let correct = false;
    if (quizMode === "letterToWord") {
      correct =
        trimmed.toLowerCase() === natoAlphabet[quizQuestion].toLowerCase();
    } else {
      const expectedLetter = Object.entries(natoAlphabet).find(
        ([, word]) => word === quizQuestion
      )?.[0];
      correct = trimmed.toUpperCase() === expectedLetter;
    }

    setQuizFeedback(correct ? "correct" : "wrong");
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
    setStreak(correct ? (s) => s + 1 : 0);

    setTimeout(() => {
      generateQuestion();
    }, 1200);
  };

  const convertToNato = (text: string) => {
    return text
      .toUpperCase()
      .split("")
      .map((char) => {
        if (allNato[char]) return allNato[char];
        if (char === " ") return " | ";
        return char;
      })
      .join("  ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
          NATO Phonetic Alphabet
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Learn the pilot alphabet used in aviation and military communications
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Text to NATO converter */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
              Text to Phonetic
            </h2>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your text here..."
              className="w-full h-32 p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none resize-none mb-4"
            />
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-32 text-lg break-words">
              {textInput ? (
                convertToNato(textInput)
              ) : (
                <span className="text-gray-500">
                  Phonetic alphabet will appear here...
                </span>
              )}
            </div>
          </div>

          {/* Quiz section */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
              Quiz Mode
            </h2>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setQuizMode("letterToWord")}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  quizMode === "letterToWord"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Letter &rarr; Word
              </button>
              <button
                onClick={() => setQuizMode("wordToLetter")}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  quizMode === "wordToLetter"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Word &rarr; Letter
              </button>
            </div>

            <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
              <span>
                Score: {score.correct}/{score.total}
              </span>
              <span>Streak: {streak}</span>
            </div>

            <div
              className={`text-center p-6 rounded-lg mb-4 border-2 transition-all ${
                quizFeedback === "correct"
                  ? "bg-green-900/50 border-green-500"
                  : quizFeedback === "wrong"
                  ? "bg-red-900/50 border-red-500"
                  : "bg-gray-900 border-gray-700"
              }`}
            >
              <p className="text-sm text-gray-400 mb-2">
                {quizMode === "letterToWord"
                  ? "What is the NATO word for:"
                  : "What letter does this represent:"}
              </p>
              <p className="text-5xl font-bold">{quizQuestion}</p>
              {quizFeedback === "wrong" && (
                <p className="text-sm text-red-400 mt-2">
                  Answer:{" "}
                  {quizMode === "letterToWord"
                    ? natoAlphabet[quizQuestion]
                    : Object.entries(natoAlphabet).find(
                        ([, w]) => w === quizQuestion
                      )?.[0]}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                placeholder={
                  quizMode === "letterToWord"
                    ? "Type the NATO word..."
                    : "Type the letter..."
                }
                className="flex-1 p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none"
                autoFocus
              />
              <button
                onClick={checkAnswer}
                className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition-all"
              >
                Check
              </button>
            </div>

            <button
              onClick={() => {
                setScore({ correct: 0, total: 0 });
                setStreak(0);
                generateQuestion();
              }}
              className="mt-3 w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Reset Score
            </button>
          </div>
        </div>

        {/* Reference chart */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-emerald-400">
            Phonetic Alphabet Reference
          </h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-300">
              Letters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
              {Object.entries(natoAlphabet).map(([letter, word]) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedLetter === letter
                      ? "bg-emerald-600 border-emerald-400"
                      : "bg-gray-900 border-gray-700 hover:border-emerald-500"
                  }`}
                >
                  <div className="text-2xl font-bold">{letter}</div>
                  <div className="text-sm mt-1 text-emerald-300">{word}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-300">
              Numbers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {Object.entries(natoNumbers).map(([num, word]) => (
                <button
                  key={num}
                  onClick={() => setSelectedLetter(num)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedLetter === num
                      ? "bg-emerald-600 border-emerald-400"
                      : "bg-gray-900 border-gray-700 hover:border-emerald-500"
                  }`}
                >
                  <div className="text-2xl font-bold">{num}</div>
                  <div className="text-sm mt-1 text-emerald-300">{word}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
            Learning Tips
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-emerald-400 mr-2">&bull;</span>
              <span>
                The NATO phonetic alphabet is used by pilots, military, and
                emergency services to spell out words clearly over radio
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-400 mr-2">&bull;</span>
              <span>
                Each code word was chosen to be easily distinguishable from the
                others, even with poor audio quality
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-400 mr-2">&bull;</span>
              <span>
                &quot;Niner&quot; is used instead of &quot;Nine&quot; to avoid
                confusion with the German word &quot;Nein&quot; (no)
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-400 mr-2">&bull;</span>
              <span>
                Practice by spelling out license plates, names, or addresses
                using the phonetic alphabet
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-400 mr-2">&bull;</span>
              <span>
                Use the quiz mode to test yourself — try to get a streak going!
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
