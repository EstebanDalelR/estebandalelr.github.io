"use client";

import { useState, useEffect } from "react";

// ASL alphabet data with descriptions
const ASL_ALPHABET = {
  A: { emoji: "✊", description: "Closed fist with thumb to the side" },
  B: { emoji: "🖐️", description: "Flat hand, fingers together, thumb across palm" },
  C: { emoji: "🤌", description: "Curved hand forming a C shape" },
  D: { emoji: "☝️", description: "Index finger up, other fingers touch thumb" },
  E: { emoji: "✊", description: "Fingers curled, thumb across fingers" },
  F: { emoji: "👌", description: "OK sign - thumb and index touch, others straight" },
  G: { emoji: "👈", description: "Index finger and thumb extended sideways" },
  H: { emoji: "✌️", description: "Index and middle finger extended sideways" },
  I: { emoji: "🤙", description: "Pinky finger extended up" },
  J: { emoji: "🤙", description: "Pinky extended, trace a J motion" },
  K: { emoji: "✌️", description: "Index and middle up, thumb touches middle finger" },
  L: { emoji: "👍", description: "L shape - thumb and index extended" },
  M: { emoji: "✊", description: "Thumb under first three fingers" },
  N: { emoji: "✊", description: "Thumb under first two fingers" },
  O: { emoji: "👌", description: "All fingers curved to touch thumb, forming O" },
  P: { emoji: "👇", description: "Like K, but pointed downward" },
  Q: { emoji: "👇", description: "Like G, but pointed downward" },
  R: { emoji: "🤞", description: "Index and middle finger crossed" },
  S: { emoji: "✊", description: "Fist with thumb across fingers" },
  T: { emoji: "👊", description: "Thumb between index and middle finger" },
  U: { emoji: "✌️", description: "Index and middle finger together, pointing up" },
  V: { emoji: "✌️", description: "Index and middle finger apart, forming V" },
  W: { emoji: "🤟", description: "Index, middle, and ring finger up" },
  X: { emoji: "☝️", description: "Index finger bent in hook shape" },
  Y: { emoji: "🤙", description: "Thumb and pinky extended (shaka sign)" },
  Z: { emoji: "☝️", description: "Index finger traces a Z in the air" },
};

const ASL_NUMBERS = {
  "0": { emoji: "👌", description: "O shape with all fingers" },
  "1": { emoji: "☝️", description: "Index finger up" },
  "2": { emoji: "✌️", description: "Index and middle finger up" },
  "3": { emoji: "🤟", description: "Thumb, index, and middle finger up" },
  "4": { emoji: "🖖", description: "Four fingers up, thumb folded" },
  "5": { emoji: "🖐️", description: "All five fingers spread" },
  "6": { emoji: "🤙", description: "Thumb and pinky touch, others up" },
  "7": { emoji: "👌", description: "Thumb and ring finger touch" },
  "8": { emoji: "👌", description: "Thumb and middle finger touch" },
  "9": { emoji: "👌", description: "Thumb and index touch, palm forward" },
};

type Mode = "reference" | "flashcard" | "quiz";

export default function ASLLearning() {
  const [mode, setMode] = useState<Mode>("reference");
  const [currentCard, setCurrentCard] = useState<string>("A");
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [usedCards, setUsedCards] = useState<Set<string>>(new Set());
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);

  const allSigns = { ...ASL_ALPHABET, ...(includeNumbers ? ASL_NUMBERS : {}) };
  const allKeys = Object.keys(allSigns);

  useEffect(() => {
    if (mode === "flashcard" || mode === "quiz") {
      getRandomCard();
    }
  }, [mode, includeNumbers]);

  const getRandomCard = () => {
    const availableKeys = allKeys.filter((key) => !usedCards.has(key));
    let nextCard: string;

    if (availableKeys.length === 0) {
      // Reset if all cards have been used
      setUsedCards(new Set());
      nextCard = allKeys[Math.floor(Math.random() * allKeys.length)];
      setUsedCards(new Set([nextCard]));
    } else {
      nextCard = availableKeys[Math.floor(Math.random() * availableKeys.length)];
      setUsedCards(new Set([...Array.from(usedCards), nextCard]));
    }
    setCurrentCard(nextCard);
    setShowAnswer(false);
    setLastAnswerCorrect(null);

    // Generate quiz options with the correct answer included
    const options = allKeys
      .filter((key) => key !== nextCard)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    options.push(nextCard);
    options.sort(() => Math.random() - 0.5);
    setQuizOptions(options);
  };

  const handleQuizAnswer = (selectedLetter: string) => {
    setQuizAttempts(quizAttempts + 1);
    const isCorrect = selectedLetter === currentCard;
    setLastAnswerCorrect(isCorrect);
    setShowAnswer(true);
    if (isCorrect) {
      setScore(score + 1);
      setTimeout(() => {
        getRandomCard();
      }, 1500);
    }
  };

  const resetQuiz = () => {
    setScore(0);
    setQuizAttempts(0);
    setUsedCards(new Set());
    getRandomCard();
  };

  const renderReference = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">ASL Alphabet</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(ASL_ALPHABET).map(([letter, data]) => (
            <div
              key={letter}
              className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-700 transition-colors cursor-pointer"
              title={data.description}
            >
              <div className="text-5xl mb-2">{data.emoji}</div>
              <div className="text-2xl font-bold text-white">{letter}</div>
              <div className="text-xs text-gray-400 mt-2">{data.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">ASL Numbers (0-9)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.entries(ASL_NUMBERS).map(([number, data]) => (
            <div
              key={number}
              className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-700 transition-colors cursor-pointer"
              title={data.description}
            >
              <div className="text-5xl mb-2">{data.emoji}</div>
              <div className="text-2xl font-bold text-white">{number}</div>
              <div className="text-xs text-gray-400 mt-2">{data.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFlashcard = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Flashcard Mode</h2>
          <p className="text-gray-400">
            Click the card to reveal the letter/number
          </p>
        </div>

        <div
          onClick={() => setShowAnswer(!showAnswer)}
          className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-12 cursor-pointer hover:scale-105 transition-transform min-h-[300px] flex flex-col items-center justify-center"
        >
          {!showAnswer ? (
            <>
              <div className="text-9xl mb-4">{allSigns[currentCard].emoji}</div>
              <div className="text-gray-200 text-sm">
                {allSigns[currentCard].description}
              </div>
            </>
          ) : (
            <div className="text-9xl font-bold text-white">{currentCard}</div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={getRandomCard}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Next Card
          </button>
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {showAnswer ? "Hide" : "Reveal"} Answer
          </button>
        </div>

        <div className="mt-4 text-center text-gray-400 text-sm">
          Card {usedCards.size} of {allKeys.length}
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Quiz Mode</h2>
            <div className="text-gray-400">
              Score: {score} / {quizAttempts} (
              {quizAttempts > 0 ? Math.round((score / quizAttempts) * 100) : 0}
              %)
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-12 mb-6 min-h-[250px] flex flex-col items-center justify-center">
            <div className="text-9xl mb-4">{allSigns[currentCard].emoji}</div>
            <div className="text-gray-100 text-sm text-center">
              {allSigns[currentCard].description}
            </div>
          </div>

          {showAnswer && (
            <div
              className={`mb-4 p-4 rounded-lg text-center font-bold text-lg ${
                lastAnswerCorrect
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {lastAnswerCorrect
                ? `Correct! This is "${currentCard}"`
                : `Wrong! The correct answer is "${currentCard}"`}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-4">
            {quizOptions.map((letter) => (
              <button
                key={letter}
                onClick={() => handleQuizAnswer(letter)}
                disabled={showAnswer}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-2xl transition-colors"
              >
                {letter}
              </button>
            ))}
          </div>

          {showAnswer && !lastAnswerCorrect && (
            <button
              onClick={getRandomCard}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4"
            >
              Next Question
            </button>
          )}

          <button
            onClick={resetQuiz}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Reset Quiz
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            🤟 ASL Learning Tool
          </h1>
          <p className="text-gray-400 text-lg">
            Learn American Sign Language alphabet and numbers
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setMode("reference")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              mode === "reference"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Reference
          </button>
          <button
            onClick={() => setMode("flashcard")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              mode === "flashcard"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setMode("quiz")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              mode === "quiz"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Quiz
          </button>
        </div>

        {/* Include Numbers Toggle */}
        {mode !== "reference" && (
          <div className="flex justify-center mb-8">
            <label className="flex items-center cursor-pointer bg-gray-800 px-4 py-2 rounded-lg">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => {
                  setIncludeNumbers(e.target.checked);
                  setUsedCards(new Set());
                }}
                className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 mr-2"
              />
              <span className="text-gray-300 font-medium">
                Include Numbers (0-9)
              </span>
            </label>
          </div>
        )}

        {/* Content */}
        {mode === "reference" && renderReference()}
        {mode === "flashcard" && renderFlashcard()}
        {mode === "quiz" && renderQuiz()}

        {/* Info Section */}
        <div className="mt-12 bg-blue-900/30 border border-blue-700 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">
            💡 Learning Tips:
          </h3>
          <ul className="text-blue-200 space-y-2">
            <li>
              • <strong>Reference Mode:</strong> Browse all ASL letters and
              numbers with descriptions
            </li>
            <li>
              • <strong>Flashcard Mode:</strong> Practice recognizing signs -
              click to reveal the answer
            </li>
            <li>
              • <strong>Quiz Mode:</strong> Test your knowledge by identifying
              the correct letter/number
            </li>
            <li>
              • Practice regularly - muscle memory is key to learning sign
              language!
            </li>
            <li>
              • The emojis are simplified representations - watch real ASL videos
              for accurate hand positions
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
