"use client";

import { useState, useEffect } from "react";

interface Word {
  swedish: string;
  english: string;
  pronunciation: string;
  category: string;
}

const vocabulary: Word[] = [
  // Greetings
  { swedish: "Hej", english: "Hello", pronunciation: "hey", category: "Greetings" },
  { swedish: "God morgon", english: "Good morning", pronunciation: "goo mor-on", category: "Greetings" },
  { swedish: "God kväll", english: "Good evening", pronunciation: "goo kvel", category: "Greetings" },
  { swedish: "God natt", english: "Good night", pronunciation: "goo nat", category: "Greetings" },
  { swedish: "Hej då", english: "Goodbye", pronunciation: "hey daw", category: "Greetings" },
  { swedish: "Tack", english: "Thank you", pronunciation: "tack", category: "Greetings" },
  { swedish: "Varsågod", english: "You're welcome", pronunciation: "var-shaw-goo", category: "Greetings" },
  { swedish: "Ursäkta", english: "Excuse me", pronunciation: "oor-sek-ta", category: "Greetings" },

  // Numbers
  { swedish: "Ett", english: "One", pronunciation: "ett", category: "Numbers" },
  { swedish: "Två", english: "Two", pronunciation: "tvaw", category: "Numbers" },
  { swedish: "Tre", english: "Three", pronunciation: "tray", category: "Numbers" },
  { swedish: "Fyra", english: "Four", pronunciation: "fee-ra", category: "Numbers" },
  { swedish: "Fem", english: "Five", pronunciation: "fem", category: "Numbers" },
  { swedish: "Sex", english: "Six", pronunciation: "sex", category: "Numbers" },
  { swedish: "Sju", english: "Seven", pronunciation: "shoo", category: "Numbers" },
  { swedish: "Åtta", english: "Eight", pronunciation: "aw-ta", category: "Numbers" },
  { swedish: "Nio", english: "Nine", pronunciation: "nee-oh", category: "Numbers" },
  { swedish: "Tio", english: "Ten", pronunciation: "tee-oh", category: "Numbers" },

  // Common Phrases
  { swedish: "Jag heter...", english: "My name is...", pronunciation: "yaw heh-ter", category: "Common Phrases" },
  { swedish: "Hur mår du?", english: "How are you?", pronunciation: "hoor mawr doo", category: "Common Phrases" },
  { swedish: "Jag mår bra", english: "I'm fine", pronunciation: "yaw mawr bra", category: "Common Phrases" },
  { swedish: "Talar du engelska?", english: "Do you speak English?", pronunciation: "tah-lar doo eng-el-ska", category: "Common Phrases" },
  { swedish: "Jag förstår inte", english: "I don't understand", pronunciation: "yaw fur-stawr in-teh", category: "Common Phrases" },
  { swedish: "Var ligger...?", english: "Where is...?", pronunciation: "var lig-ger", category: "Common Phrases" },
  { swedish: "Hur mycket kostar det?", english: "How much does it cost?", pronunciation: "hoor mee-ket kos-tar deh", category: "Common Phrases" },

  // Food & Drink
  { swedish: "Vatten", english: "Water", pronunciation: "vat-ten", category: "Food & Drink" },
  { swedish: "Kaffe", english: "Coffee", pronunciation: "kaf-feh", category: "Food & Drink" },
  { swedish: "Te", english: "Tea", pronunciation: "teh", category: "Food & Drink" },
  { swedish: "Bröd", english: "Bread", pronunciation: "brurd", category: "Food & Drink" },
  { swedish: "Smör", english: "Butter", pronunciation: "smur", category: "Food & Drink" },
  { swedish: "Ost", english: "Cheese", pronunciation: "oost", category: "Food & Drink" },
  { swedish: "Mjölk", english: "Milk", pronunciation: "myulk", category: "Food & Drink" },
  { swedish: "Äpple", english: "Apple", pronunciation: "ep-pleh", category: "Food & Drink" },

  // Time & Days
  { swedish: "Idag", english: "Today", pronunciation: "ee-dahg", category: "Time & Days" },
  { swedish: "Igår", english: "Yesterday", pronunciation: "ee-gawr", category: "Time & Days" },
  { swedish: "Imorgon", english: "Tomorrow", pronunciation: "ee-mor-on", category: "Time & Days" },
  { swedish: "Måndag", english: "Monday", pronunciation: "mawn-dahg", category: "Time & Days" },
  { swedish: "Tisdag", english: "Tuesday", pronunciation: "tees-dahg", category: "Time & Days" },
  { swedish: "Onsdag", english: "Wednesday", pronunciation: "oons-dahg", category: "Time & Days" },
  { swedish: "Torsdag", english: "Thursday", pronunciation: "torsh-dahg", category: "Time & Days" },
  { swedish: "Fredag", english: "Friday", pronunciation: "freh-dahg", category: "Time & Days" },

  // Common Words
  { swedish: "Ja", english: "Yes", pronunciation: "yah", category: "Common Words" },
  { swedish: "Nej", english: "No", pronunciation: "nay", category: "Common Words" },
  { swedish: "Kanske", english: "Maybe", pronunciation: "kan-sheh", category: "Common Words" },
  { swedish: "Var", english: "Where", pronunciation: "var", category: "Common Words" },
  { swedish: "När", english: "When", pronunciation: "nair", category: "Common Words" },
  { swedish: "Varför", english: "Why", pronunciation: "var-fur", category: "Common Words" },
  { swedish: "Vem", english: "Who", pronunciation: "vem", category: "Common Words" },
  { swedish: "Vad", english: "What", pronunciation: "vahd", category: "Common Words" },
];

export default function SwedishLearning() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<"flashcard" | "quiz">("flashcard");
  const [quizAnswer, setQuizAnswer] = useState("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const categories = ["All", ...Array.from(new Set(vocabulary.map(w => w.category)))];

  const filteredVocabulary = selectedCategory === "All"
    ? vocabulary
    : vocabulary.filter(w => w.category === selectedCategory);

  const currentWord = filteredVocabulary[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowResult(false);
  }, [selectedCategory]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredVocabulary.length);
    setIsFlipped(false);
    setQuizAnswer("");
    setShowResult(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredVocabulary.length) % filteredVocabulary.length);
    setIsFlipped(false);
    setQuizAnswer("");
    setShowResult(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleQuizSubmit = () => {
    const correct = quizAnswer.toLowerCase().trim() === currentWord.english.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * filteredVocabulary.length);
    setCurrentIndex(randomIndex);
    setIsFlipped(false);
    setQuizAnswer("");
    setShowResult(false);
  };

  const resetScore = () => {
    setScore({ correct: 0, total: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            Swedish Learning Tool
          </h1>
          <p className="text-gray-600 text-lg">
            Lär dig svenska! (Learn Swedish!)
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => { setMode("flashcard"); setShowResult(false); }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === "flashcard"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Flashcard Mode
          </button>
          <button
            onClick={() => { setMode("quiz"); setShowResult(false); }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === "quiz"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Quiz Mode
          </button>
        </div>

        {/* Score Display (Quiz Mode) */}
        {mode === "quiz" && score.total > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <p className="text-lg font-semibold">
                Score: {score.correct}/{score.total} ({score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%)
              </p>
              <button
                onClick={resetScore}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Reset Score
              </button>
            </div>
          </div>
        )}

        {/* Category Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Category:
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {filteredVocabulary.length} word{filteredVocabulary.length !== 1 ? "s" : ""} in this category
          </p>
        </div>

        {/* Main Card */}
        {currentWord && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
            {mode === "flashcard" ? (
              // Flashcard Mode
              <div className="min-h-[300px] flex flex-col items-center justify-center">
                <div
                  onClick={handleFlip}
                  className="w-full max-w-md cursor-pointer perspective-1000"
                >
                  <div
                    className={`relative w-full h-64 transition-transform duration-500 transform-style-3d ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front of card */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex flex-col items-center justify-center p-8 backface-hidden ${
                        isFlipped ? "invisible" : "visible"
                      }`}
                    >
                      <p className="text-sm text-gray-600 mb-2">Swedish</p>
                      <p className="text-5xl font-bold text-gray-800 mb-4 text-center">
                        {currentWord.swedish}
                      </p>
                      <p className="text-lg text-gray-500 italic">
                        [{currentWord.pronunciation}]
                      </p>
                      <p className="text-sm text-gray-400 mt-4">Click to flip</p>
                    </div>

                    {/* Back of card */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl flex flex-col items-center justify-center p-8 backface-hidden transform rotate-y-180 ${
                        isFlipped ? "visible" : "invisible"
                      }`}
                    >
                      <p className="text-sm text-gray-600 mb-2">English</p>
                      <p className="text-5xl font-bold text-gray-800 text-center">
                        {currentWord.english}
                      </p>
                      <p className="text-sm text-gray-400 mt-4">Click to flip</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {currentWord.category}
                  </span>
                </div>
              </div>
            ) : (
              // Quiz Mode
              <div className="min-h-[300px] flex flex-col items-center justify-center">
                <p className="text-sm text-gray-600 mb-2">Translate to English:</p>
                <p className="text-5xl font-bold text-gray-800 mb-4 text-center">
                  {currentWord.swedish}
                </p>
                <p className="text-lg text-gray-500 italic mb-8">
                  [{currentWord.pronunciation}]
                </p>

                {!showResult ? (
                  <div className="w-full max-w-md">
                    <input
                      type="text"
                      value={quizAnswer}
                      onChange={(e) => setQuizAnswer(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && quizAnswer && handleQuizSubmit()}
                      placeholder="Type your answer..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg text-center"
                      autoFocus
                    />
                    <button
                      onClick={handleQuizSubmit}
                      disabled={!quizAnswer.trim()}
                      className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                    >
                      Submit Answer
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-md text-center">
                    <div
                      className={`p-6 rounded-lg mb-4 ${
                        isCorrect
                          ? "bg-green-100 border-2 border-green-500"
                          : "bg-red-100 border-2 border-red-500"
                      }`}
                    >
                      <p className={`text-2xl font-bold mb-2 ${
                        isCorrect ? "text-green-700" : "text-red-700"
                      }`}>
                        {isCorrect ? "Correct! ✓" : "Incorrect ✗"}
                      </p>
                      <p className="text-lg text-gray-700">
                        Correct answer: <span className="font-bold">{currentWord.english}</span>
                      </p>
                      {!isCorrect && quizAnswer && (
                        <p className="text-gray-600 mt-2">
                          Your answer: <span className="font-semibold">{quizAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {currentWord.category}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={handlePrevious}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-semibold shadow-md transition-all"
          >
            ← Previous
          </button>
          <button
            onClick={handleShuffle}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-semibold shadow-md transition-all"
          >
            🔀 Random
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-semibold shadow-md transition-all"
          >
            Next →
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="text-center mt-6 text-gray-600">
          <p className="text-sm">
            Card {currentIndex + 1} of {filteredVocabulary.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-md mx-auto">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / filteredVocabulary.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
