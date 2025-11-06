"use client";
import { useState, useEffect } from "react";

type CardLevel = "light" | "medium" | "dark";

interface Question {
  id: string;
  question: string;
  level: CardLevel;
}

const questions: Question[] = [
  // Light Pink - Simple, fun questions
  { id: "l1", question: "What's a food you dislike that most people love?", level: "light" },
  { id: "l2", question: "What's your favorite way to spend a lazy Sunday?", level: "light" },
  { id: "l3", question: "What's a small thing that always makes you smile?", level: "light" },
  { id: "l4", question: "What's your go-to comfort food?", level: "light" },
  { id: "l5", question: "What's a movie you can watch over and over?", level: "light" },
  { id: "l6", question: "What's your favorite season and why?", level: "light" },
  { id: "l7", question: "What's a hobby you've always wanted to try?", level: "light" },
  { id: "l8", question: "What's your ideal date night?", level: "light" },
  { id: "l9", question: "What's a song that instantly puts you in a good mood?", level: "light" },
  { id: "l10", question: "What's your favorite childhood memory?", level: "light" },
  { id: "l11", question: "If you could travel anywhere right now, where would you go?", level: "light" },
  { id: "l12", question: "What's something you're really good at?", level: "light" },
  { id: "l13", question: "What's your favorite thing about our relationship?", level: "light" },
  { id: "l14", question: "What makes you laugh the hardest?", level: "light" },
  { id: "l15", question: "What's a guilty pleasure you enjoy?", level: "light" },

  // Medium Pink - Deeper, more thoughtful questions
  { id: "m1", question: "Who was your favorite teacher and why did they impact you?", level: "medium" },
  { id: "m2", question: "What's a mistake you made that taught you an important lesson?", level: "medium" },
  { id: "m3", question: "What does your ideal future look like in 5 years?", level: "medium" },
  { id: "m4", question: "What's something you're afraid of but haven't told many people?", level: "medium" },
  { id: "m5", question: "What's a dream you've given up on, and do you regret it?", level: "medium" },
  { id: "m6", question: "Who in your life do you wish you could thank but haven't?", level: "medium" },
  { id: "m7", question: "What's something about yourself you're working to improve?", level: "medium" },
  { id: "m8", question: "What's a belief you held strongly but later changed your mind about?", level: "medium" },
  { id: "m9", question: "What's the hardest decision you've ever had to make?", level: "medium" },
  { id: "m10", question: "What does love mean to you?", level: "medium" },
  { id: "m11", question: "What's something you wish your parents had done differently?", level: "medium" },
  { id: "m12", question: "When do you feel most like yourself?", level: "medium" },
  { id: "m13", question: "What's a part of your past that still affects you today?", level: "medium" },
  { id: "m14", question: "What do you need from a partner when you're struggling?", level: "medium" },
  { id: "m15", question: "What's something you've never felt fully understood about?", level: "medium" },

  // Dark Pink - Deep, vulnerable questions
  { id: "d1", question: "Have you ever considered suicide or seriously struggled with your will to live?", level: "dark" },
  { id: "d2", question: "What's your biggest regret in life?", level: "dark" },
  { id: "d3", question: "What's something you've never forgiven yourself for?", level: "dark" },
  { id: "d4", question: "What's your deepest fear about our relationship?", level: "dark" },
  { id: "d5", question: "Is there something about your past you're afraid to tell me?", level: "dark" },
  { id: "d6", question: "What's the most painful experience you've been through?", level: "dark" },
  { id: "d7", question: "Do you have any doubts about us? What are they?", level: "dark" },
  { id: "d8", question: "What's something you're deeply ashamed of?", level: "dark" },
  { id: "d9", question: "Have you ever felt truly alone, even when surrounded by people?", level: "dark" },
  { id: "d10", question: "What's a truth about yourself you find hard to accept?", level: "dark" },
  { id: "d11", question: "What would you do if you found out you only had one year to live?", level: "dark" },
  { id: "d12", question: "What's a wound from your childhood that hasn't healed?", level: "dark" },
  { id: "d13", question: "Have you ever felt like you weren't enough? When?", level: "dark" },
  { id: "d14", question: "What are you most afraid of losing?", level: "dark" },
  { id: "d15", question: "If you could change one thing about yourself, what would it be and why?", level: "dark" },
];

export default function DeepGame() {
  const [usedCards, setUsedCards] = useState<Set<string>>(new Set());
  const [currentCard, setCurrentCard] = useState<Question | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CardLevel | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  // Load used cards from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem("deepGameUsedCards");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUsedCards(new Set(parsed));
      } catch (error) {
        console.error("Error parsing stored cards:", error);
      }
    }
  }, []);

  // Save used cards to local storage whenever it changes
  useEffect(() => {
    if (usedCards.size > 0) {
      localStorage.setItem("deepGameUsedCards", JSON.stringify(Array.from(usedCards)));
    }
  }, [usedCards]);

  const getAvailableQuestions = (level: CardLevel) => {
    return questions.filter(q => q.level === level && !usedCards.has(q.id));
  };

  const drawCard = (level: CardLevel) => {
    const available = getAvailableQuestions(level);
    if (available.length === 0) {
      alert(`All ${level} cards have been used! Try another level or reset.`);
      return;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const selectedCard = available[randomIndex];

    setCurrentCard(selectedCard);
    setSelectedLevel(level);
    setIsFlipped(true);

    // Mark card as used
    setUsedCards(prev => new Set([...Array.from(prev), selectedCard.id]));
  };

  const resetGame = () => {
    if (confirm("Are you sure you want to reset all cards? This will clear your progress.")) {
      setUsedCards(new Set());
      setCurrentCard(null);
      setSelectedLevel(null);
      setIsFlipped(false);
      localStorage.removeItem("deepGameUsedCards");
    }
  };

  const closeCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard(null);
      setSelectedLevel(null);
    }, 300);
  };

  const getLevelColor = (level: CardLevel) => {
    switch (level) {
      case "light":
        return "bg-pink-200 hover:bg-pink-300";
      case "medium":
        return "bg-pink-400 hover:bg-pink-500";
      case "dark":
        return "bg-pink-700 hover:bg-pink-800";
    }
  };

  const getLevelTextColor = (level: CardLevel) => {
    switch (level) {
      case "light":
        return "text-gray-800";
      case "medium":
        return "text-gray-900";
      case "dark":
        return "text-white";
    }
  };

  const getStats = (level: CardLevel) => {
    const total = questions.filter(q => q.level === level).length;
    const used = Array.from(usedCards).filter(id =>
      questions.find(q => q.id === id)?.level === level
    ).length;
    return { used, total, remaining: total - used };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-pink-800 mb-4">Deep Connection</h1>
          <p className="text-lg text-gray-700">
            A game to strengthen your bond through meaningful conversations
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Choose a card level and answer the question together
          </p>
        </div>

        {/* Card Selection */}
        {!currentCard && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Light Card */}
            <div className="flex flex-col">
              <button
                onClick={() => drawCard("light")}
                className={`${getLevelColor("light")} ${getLevelTextColor("light")} rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 h-64 flex flex-col items-center justify-center`}
              >
                <div className="text-6xl mb-4">🌸</div>
                <h3 className="text-2xl font-bold mb-2">Light</h3>
                <p className="text-sm opacity-80">Fun & playful questions</p>
              </button>
              <div className="text-center mt-3 text-sm text-gray-600">
                {getStats("light").remaining} of {getStats("light").total} remaining
              </div>
            </div>

            {/* Medium Card */}
            <div className="flex flex-col">
              <button
                onClick={() => drawCard("medium")}
                className={`${getLevelColor("medium")} ${getLevelTextColor("medium")} rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 h-64 flex flex-col items-center justify-center`}
              >
                <div className="text-6xl mb-4">💕</div>
                <h3 className="text-2xl font-bold mb-2">Medium</h3>
                <p className="text-sm opacity-80">Thoughtful questions</p>
              </button>
              <div className="text-center mt-3 text-sm text-gray-600">
                {getStats("medium").remaining} of {getStats("medium").total} remaining
              </div>
            </div>

            {/* Dark Card */}
            <div className="flex flex-col">
              <button
                onClick={() => drawCard("dark")}
                className={`${getLevelColor("dark")} ${getLevelTextColor("dark")} rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 h-64 flex flex-col items-center justify-center`}
              >
                <div className="text-6xl mb-4">❤️</div>
                <h3 className="text-2xl font-bold mb-2">Deep</h3>
                <p className="text-sm opacity-90">Vulnerable questions</p>
              </button>
              <div className="text-center mt-3 text-sm text-gray-600">
                {getStats("dark").remaining} of {getStats("dark").total} remaining
              </div>
            </div>
          </div>
        )}

        {/* Current Card Display */}
        {currentCard && (
          <div className="mb-8">
            <div
              className={`${getLevelColor(currentCard.level)} ${getLevelTextColor(currentCard.level)} rounded-2xl p-12 shadow-2xl transform transition-all duration-300 ${
                isFlipped ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              <div className="text-center mb-6">
                <span className="text-sm font-semibold uppercase tracking-wider opacity-80">
                  {currentCard.level} question
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-medium text-center leading-relaxed mb-8">
                {currentCard.question}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={closeCard}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Button */}
        <div className="flex justify-center gap-4">
          <button
            onClick={resetGame}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Reset All Cards
          </button>
        </div>

        {/* Progress Summary */}
        <div className="mt-12 bg-white bg-opacity-50 backdrop-blur-sm rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Progress</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-pink-300">{getStats("light").used}</div>
              <div className="text-sm text-gray-600">Light cards used</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-500">{getStats("medium").used}</div>
              <div className="text-sm text-gray-600">Medium cards used</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-800">{getStats("dark").used}</div>
              <div className="text-sm text-gray-600">Deep cards used</div>
            </div>
          </div>
          <div className="mt-4 text-center text-gray-600">
            Total: {usedCards.size} of {questions.length} cards used
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white bg-opacity-40 backdrop-blur-sm rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-3">How to Play</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">🌸</span>
              <span><strong>Light:</strong> Start here for warm, playful questions to ease into conversation</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">💕</span>
              <span><strong>Medium:</strong> Dive deeper with thoughtful questions about values and experiences</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">❤️</span>
              <span><strong>Deep:</strong> Explore vulnerable topics that require trust and emotional safety</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">💡</span>
              <span>Take turns answering, and listen with an open heart. There are no wrong answers.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
