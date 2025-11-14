"use client";

import { useState } from "react";

// Braille mapping for letters, numbers, and common punctuation
const brailleMap: { [key: string]: string } = {
  a: "⠁",
  b: "⠃",
  c: "⠉",
  d: "⠙",
  e: "⠑",
  f: "⠋",
  g: "⠛",
  h: "⠓",
  i: "⠊",
  j: "⠚",
  k: "⠅",
  l: "⠇",
  m: "⠍",
  n: "⠝",
  o: "⠕",
  p: "⠏",
  q: "⠟",
  r: "⠗",
  s: "⠎",
  t: "⠞",
  u: "⠥",
  v: "⠧",
  w: "⠺",
  x: "⠭",
  y: "⠽",
  z: "⠵",
  "1": "⠼⠁",
  "2": "⠼⠃",
  "3": "⠼⠉",
  "4": "⠼⠙",
  "5": "⠼⠑",
  "6": "⠼⠋",
  "7": "⠼⠛",
  "8": "⠼⠓",
  "9": "⠼⠊",
  "0": "⠼⠚",
  " ": " ",
  ",": "⠂",
  ".": "⠲",
  "?": "⠦",
  "!": "⠖",
  ";": "⠆",
  ":": "⠒",
  "-": "⠤",
  "'": "⠄",
};

// Reverse mapping for Braille to text
const reverseBrailleMap: { [key: string]: string } = {};
Object.entries(brailleMap).forEach(([key, value]) => {
  reverseBrailleMap[value] = key;
});

// Braille dot patterns (which dots are filled for each letter)
const brailleDots: { [key: string]: number[] } = {
  a: [1],
  b: [1, 2],
  c: [1, 4],
  d: [1, 4, 5],
  e: [1, 5],
  f: [1, 2, 4],
  g: [1, 2, 4, 5],
  h: [1, 2, 5],
  i: [2, 4],
  j: [2, 4, 5],
  k: [1, 3],
  l: [1, 2, 3],
  m: [1, 3, 4],
  n: [1, 3, 4, 5],
  o: [1, 3, 5],
  p: [1, 2, 3, 4],
  q: [1, 2, 3, 4, 5],
  r: [1, 2, 3, 5],
  s: [2, 3, 4],
  t: [2, 3, 4, 5],
  u: [1, 3, 6],
  v: [1, 2, 3, 6],
  w: [2, 4, 5, 6],
  x: [1, 3, 4, 6],
  y: [1, 3, 4, 5, 6],
  z: [1, 3, 5, 6],
};

interface BrailleCellProps {
  dots: number[];
  size?: "small" | "medium" | "large";
}

const BrailleCell = ({ dots, size = "medium" }: BrailleCellProps) => {
  const sizeClasses = {
    small: "w-3 h-3",
    medium: "w-4 h-4",
    large: "w-6 h-6",
  };

  const gapClasses = {
    small: "gap-1",
    medium: "gap-1.5",
    large: "gap-2",
  };

  const dotSize = sizeClasses[size];
  const gap = gapClasses[size];

  return (
    <div className={`grid grid-cols-2 ${gap} p-2`}>
      {[1, 2, 3, 4, 5, 6].map((dotNum) => (
        <div
          key={dotNum}
          className={`${dotSize} rounded-full ${
            dots.includes(dotNum) ? "bg-blue-600" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export default function BrailleLearning() {
  const [inputText, setInputText] = useState("");
  const [brailleOutput, setBrailleOutput] = useState("");
  const [brailleInput, setBrailleInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [activeTab, setActiveTab] = useState<
    "learn" | "textToBraille" | "brailleToText" | "practice"
  >("learn");
  const [practiceChar, setPracticeChar] = useState<string>("a");
  const [userDots, setUserDots] = useState<number[]>([]);
  const [practiceResult, setPracticeResult] = useState<string>("");

  const convertTextToBraille = (text: string) => {
    return text
      .toLowerCase()
      .split("")
      .map((char) => brailleMap[char] || char)
      .join("");
  };

  const convertBrailleToText = (braille: string) => {
    let result = "";
    let i = 0;
    while (i < braille.length) {
      // Check for two-character patterns (numbers)
      if (i < braille.length - 1) {
        const twoChar = braille[i] + braille[i + 1];
        if (reverseBrailleMap[twoChar]) {
          result += reverseBrailleMap[twoChar];
          i += 2;
          continue;
        }
      }
      // Single character
      const oneChar = braille[i];
      result += reverseBrailleMap[oneChar] || oneChar;
      i++;
    }
    return result;
  };

  const handleTextInput = (text: string) => {
    setInputText(text);
    setBrailleOutput(convertTextToBraille(text));
  };

  const handleBrailleInput = (braille: string) => {
    setBrailleInput(braille);
    setTextOutput(convertBrailleToText(braille));
  };

  const toggleDot = (dotNum: number) => {
    if (userDots.includes(dotNum)) {
      setUserDots(userDots.filter((d) => d !== dotNum));
    } else {
      setUserDots([...userDots, dotNum]);
    }
  };

  const checkPractice = () => {
    const correctDots = brailleDots[practiceChar] || [];
    const userDotsSet = new Set(userDots);
    const correctDotsSet = new Set(correctDots);

    if (
      userDotsSet.size === correctDotsSet.size &&
      Array.from(userDotsSet).every((dot) => correctDotsSet.has(dot))
    ) {
      setPracticeResult("Correct! Well done!");
    } else {
      setPracticeResult("Not quite right. Try again!");
    }
  };

  const getNewPracticeChar = () => {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const newChar = letters[Math.floor(Math.random() * letters.length)];
    setPracticeChar(newChar);
    setUserDots([]);
    setPracticeResult("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">
            Learn Braille
          </h1>
          <p className="text-gray-600 text-lg">
            Interactive Braille alphabet learning tool
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: "learn", label: "Alphabet Chart" },
            { id: "textToBraille", label: "Text → Braille" },
            { id: "brailleToText", label: "Braille → Text" },
            { id: "practice", label: "Practice" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Learn Tab - Alphabet Chart */}
        {activeTab === "learn" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Braille Alphabet
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(brailleDots).map(([char, dots]) => (
                <div
                  key={char}
                  className="flex flex-col items-center bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {char.toUpperCase()}
                  </div>
                  <BrailleCell dots={dots} size="medium" />
                  <div className="text-4xl mt-2">{brailleMap[char]}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                How to Read Braille Dots
              </h3>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-lg">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <div
                        key={num}
                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-gray-700">
                  <p className="mb-2">
                    Each Braille character is made up of 6 dots arranged in two
                    columns of three.
                  </p>
                  <p>
                    The dots are numbered 1-6, with dots 1, 2, 3 on the left
                    and dots 4, 5, 6 on the right.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Text to Braille Converter */}
        {activeTab === "textToBraille" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Convert Text to Braille
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter text:
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => handleTextInput(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
                  rows={4}
                  placeholder="Type something to convert to Braille..."
                />
              </div>

              {brailleOutput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Braille output:
                  </label>
                  <div className="w-full p-6 bg-gray-50 rounded-lg border-2 border-gray-200 text-4xl leading-relaxed break-all">
                    {brailleOutput}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(brailleOutput)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Copy Braille
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Braille to Text Converter */}
        {activeTab === "brailleToText" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Convert Braille to Text
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Braille characters:
                </label>
                <textarea
                  value={brailleInput}
                  onChange={(e) => handleBrailleInput(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-4xl"
                  rows={4}
                  placeholder="Paste Braille characters here..."
                />
              </div>

              {textOutput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text output:
                  </label>
                  <div className="w-full p-6 bg-gray-50 rounded-lg border-2 border-gray-200 text-xl">
                    {textOutput}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(textOutput)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Copy Text
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Practice Mode */}
        {activeTab === "practice" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Practice Braille
            </h2>

            <div className="text-center mb-8">
              <p className="text-gray-600 mb-4">
                Click the dots to create the Braille pattern for:
              </p>
              <div className="text-6xl font-bold text-blue-600 mb-6">
                {practiceChar.toUpperCase()}
              </div>

              <div className="inline-block bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((dotNum) => (
                    <button
                      key={dotNum}
                      onClick={() => toggleDot(dotNum)}
                      className={`w-16 h-16 rounded-full transition-all ${
                        userDots.includes(dotNum)
                          ? "bg-blue-600 shadow-lg"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    >
                      <span
                        className={`font-bold ${
                          userDots.includes(dotNum)
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      >
                        {dotNum}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-center mb-4">
                <button
                  onClick={checkPractice}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Check Answer
                </button>
                <button
                  onClick={getNewPracticeChar}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Next Letter
                </button>
              </div>

              {practiceResult && (
                <div
                  className={`text-xl font-semibold p-4 rounded-lg ${
                    practiceResult.includes("Correct")
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {practiceResult}
                </div>
              )}

              {practiceResult.includes("Correct") && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-700 mb-2">
                    The correct pattern for{" "}
                    <strong>{practiceChar.toUpperCase()}</strong> is:
                  </p>
                  <div className="flex justify-center">
                    <BrailleCell
                      dots={brailleDots[practiceChar] || []}
                      size="large"
                    />
                  </div>
                  <div className="text-5xl mt-2">
                    {brailleMap[practiceChar]}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            About Braille
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Braille is a tactile writing system used by people who are blind or
            visually impaired. It was developed by Louis Braille in 1824 in
            France. Each Braille character consists of six dots arranged in two
            columns of three dots each. Different combinations of raised dots
            represent different letters, numbers, and punctuation marks.
          </p>
        </div>
      </div>
    </div>
  );
}
