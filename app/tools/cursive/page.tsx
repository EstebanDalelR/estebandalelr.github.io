"use client";
import { useState, useRef, useEffect } from "react";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const ALPHABET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const CursiveLetter = ({
  letter,
  isSelected,
  onClick,
}: {
  letter: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-16 h-16 border-2 rounded-md flex items-center justify-center text-4xl transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-100"
          : "border-gray-300 hover:border-gray-400"
      }`}
      style={{ fontFamily: "cursive" }}
    >
      {letter}
    </button>
  );
};

export default function CursiveLearning() {
  const [selectedLetter, setSelectedLetter] = useState("a");
  const [practiceText, setPracticeText] = useState("");
  const [isUppercase, setIsUppercase] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const currentAlphabet = isUppercase ? ALPHABET_UPPER : ALPHABET;

  // Canvas drawing functionality
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw guides
    if (showGuides) {
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 1;
      const lineHeight = canvas.height / 4;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, lineHeight * i);
        ctx.lineTo(canvas.width, lineHeight * i);
        ctx.stroke();
      }
    }
  }, [showGuides]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw guides if enabled
    if (showGuides) {
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 1;
      const lineHeight = canvas.height / 4;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, lineHeight * i);
        ctx.lineTo(canvas.width, lineHeight * i);
        ctx.stroke();
      }
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-4 gap-6">
      <h1 className="text-3xl font-bold">Cursive Learning Tool</h1>

      {/* Alphabet Selection */}
      <div className="w-full max-w-6xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Select a Letter:</h2>
          <button
            onClick={() => setIsUppercase(!isUppercase)}
            className="px-4 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-100"
          >
            {isUppercase ? "Lowercase" : "Uppercase"}
          </button>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-13 gap-2">
          {currentAlphabet.map((letter) => (
            <CursiveLetter
              key={letter}
              letter={letter}
              isSelected={selectedLetter === letter}
              onClick={() => setSelectedLetter(letter)}
            />
          ))}
        </div>
      </div>

      {/* Selected Letter Display */}
      <div className="w-full max-w-6xl border-2 border-gray-300 rounded-lg p-8 bg-white">
        <h2 className="text-xl font-semibold mb-4">Practice Letter:</h2>
        <div
          className="text-9xl text-center"
          style={{ fontFamily: "cursive" }}
        >
          {selectedLetter}
        </div>
      </div>

      {/* Practice Canvas */}
      <div className="w-full max-w-6xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Practice Area:</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGuides(!showGuides)}
              className="px-4 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-100"
            >
              {showGuides ? "Hide Guides" : "Show Guides"}
            </button>
            <button
              onClick={clearCanvas}
              className="px-4 py-2 border-2 border-red-300 rounded-md hover:bg-red-100 text-red-600"
            >
              Clear
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-64 border-2 border-gray-300 rounded-lg bg-white cursor-crosshair"
        />
      </div>

      {/* Practice Text Input */}
      <div className="w-full max-w-6xl flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Practice Writing:</h2>
        <textarea
          value={practiceText}
          onChange={(e) => setPracticeText(e.target.value)}
          className="w-full h-32 border-2 border-gray-300 rounded-lg p-4 text-2xl resize-none"
          style={{ fontFamily: "cursive" }}
          placeholder="Type here to see your text in cursive..."
        />

        {practiceText && (
          <div className="w-full border-2 border-gray-300 rounded-lg p-8 bg-white">
            <p className="text-4xl leading-relaxed" style={{ fontFamily: "cursive" }}>
              {practiceText}
            </p>
          </div>
        )}
      </div>

      {/* Common Words Practice */}
      <div className="w-full max-w-6xl flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Common Words Practice:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["hello", "world", "thank you", "goodbye", "please", "welcome", "friend", "family"].map(
            (word) => (
              <button
                key={word}
                onClick={() => setPracticeText(word)}
                className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-100 text-2xl"
                style={{ fontFamily: "cursive" }}
              >
                {word}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="w-full max-w-6xl border-2 border-blue-300 rounded-lg p-6 bg-blue-50">
        <h2 className="text-xl font-semibold mb-3">Cursive Writing Tips:</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Start with lowercase letters before moving to uppercase</li>
          <li>Practice letter connections to make words flow smoothly</li>
          <li>Maintain consistent letter slant (usually 15-20 degrees)</li>
          <li>Keep letters on the baseline with proper ascenders and descenders</li>
          <li>Practice slowly at first, then gradually increase speed</li>
          <li>Use lined paper or guides to maintain consistent letter height</li>
        </ul>
      </div>
    </div>
  );
}
