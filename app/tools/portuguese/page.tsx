"use client";

import { useState, useEffect } from "react";

type VocabularyCategory = "common" | "food" | "colors" | "numbers" | "greetings";
type LearningMode = "vocabulary" | "verbs" | "phrases" | "quiz";

interface VocabWord {
  pt: string;
  en: string;
  audio?: string;
}

interface Verb {
  infinitive: string;
  english: string;
  conjugations: {
    eu: string;
    tu: string;
    ele: string;
    nos: string;
    vos: string;
    eles: string;
  };
}

const vocabularyData: Record<VocabularyCategory, VocabWord[]> = {
  common: [
    { pt: "Olá", en: "Hello" },
    { pt: "Obrigado/Obrigada", en: "Thank you (m/f)" },
    { pt: "Por favor", en: "Please" },
    { pt: "Sim", en: "Yes" },
    { pt: "Não", en: "No" },
    { pt: "Desculpe", en: "Sorry/Excuse me" },
    { pt: "Bom dia", en: "Good morning" },
    { pt: "Boa tarde", en: "Good afternoon" },
    { pt: "Boa noite", en: "Good evening/night" },
    { pt: "Até logo", en: "See you later" },
  ],
  food: [
    { pt: "Pão", en: "Bread" },
    { pt: "Água", en: "Water" },
    { pt: "Café", en: "Coffee" },
    { pt: "Leite", en: "Milk" },
    { pt: "Arroz", en: "Rice" },
    { pt: "Feijão", en: "Beans" },
    { pt: "Carne", en: "Meat" },
    { pt: "Frango", en: "Chicken" },
    { pt: "Peixe", en: "Fish" },
    { pt: "Queijo", en: "Cheese" },
  ],
  colors: [
    { pt: "Vermelho", en: "Red" },
    { pt: "Azul", en: "Blue" },
    { pt: "Verde", en: "Green" },
    { pt: "Amarelo", en: "Yellow" },
    { pt: "Preto", en: "Black" },
    { pt: "Branco", en: "White" },
    { pt: "Laranja", en: "Orange" },
    { pt: "Rosa", en: "Pink" },
    { pt: "Roxo", en: "Purple" },
    { pt: "Cinza", en: "Gray" },
  ],
  numbers: [
    { pt: "Zero", en: "Zero" },
    { pt: "Um", en: "One" },
    { pt: "Dois", en: "Two" },
    { pt: "Três", en: "Three" },
    { pt: "Quatro", en: "Four" },
    { pt: "Cinco", en: "Five" },
    { pt: "Seis", en: "Six" },
    { pt: "Sete", en: "Seven" },
    { pt: "Oito", en: "Eight" },
    { pt: "Nove", en: "Nine" },
    { pt: "Dez", en: "Ten" },
  ],
  greetings: [
    { pt: "Como está?", en: "How are you? (formal)" },
    { pt: "Como estás?", en: "How are you? (informal)" },
    { pt: "Tudo bem?", en: "Everything good?" },
    { pt: "De nada", en: "You're welcome" },
    { pt: "Com licença", en: "Excuse me" },
    { pt: "Tchau", en: "Bye" },
    { pt: "Adeus", en: "Goodbye" },
    { pt: "Até amanhã", en: "See you tomorrow" },
    { pt: "Prazer em conhecê-lo", en: "Nice to meet you" },
    { pt: "Bem-vindo", en: "Welcome" },
  ],
};

const verbsData: Verb[] = [
  {
    infinitive: "Ser",
    english: "To be (permanent)",
    conjugations: {
      eu: "sou",
      tu: "és",
      ele: "é",
      nos: "somos",
      vos: "sois",
      eles: "são",
    },
  },
  {
    infinitive: "Estar",
    english: "To be (temporary)",
    conjugations: {
      eu: "estou",
      tu: "estás",
      ele: "está",
      nos: "estamos",
      vos: "estais",
      eles: "estão",
    },
  },
  {
    infinitive: "Ter",
    english: "To have",
    conjugations: {
      eu: "tenho",
      tu: "tens",
      ele: "tem",
      nos: "temos",
      vos: "tendes",
      eles: "têm",
    },
  },
  {
    infinitive: "Fazer",
    english: "To do/make",
    conjugations: {
      eu: "faço",
      tu: "fazes",
      ele: "faz",
      nos: "fazemos",
      vos: "fazeis",
      eles: "fazem",
    },
  },
  {
    infinitive: "Ir",
    english: "To go",
    conjugations: {
      eu: "vou",
      tu: "vais",
      ele: "vai",
      nos: "vamos",
      vos: "ides",
      eles: "vão",
    },
  },
];

const phrasesData = [
  { pt: "Onde fica o banheiro?", en: "Where is the bathroom?" },
  { pt: "Quanto custa?", en: "How much does it cost?" },
  { pt: "Eu não entendo", en: "I don't understand" },
  { pt: "Você fala inglês?", en: "Do you speak English?" },
  { pt: "Eu estou aprendendo português", en: "I am learning Portuguese" },
  { pt: "Pode repetir, por favor?", en: "Can you repeat, please?" },
  { pt: "Como se diz... em português?", en: "How do you say... in Portuguese?" },
  { pt: "Qual é o seu nome?", en: "What is your name?" },
  { pt: "Meu nome é...", en: "My name is..." },
  { pt: "Prazer em conhecê-lo", en: "Nice to meet you" },
];

export default function PortugueseLearning() {
  const [mode, setMode] = useState<LearningMode>("vocabulary");
  const [category, setCategory] = useState<VocabularyCategory>("common");
  const [selectedVerb, setSelectedVerb] = useState<number>(0);
  const [showEnglish, setShowEnglish] = useState<boolean>(true);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizTotal, setQuizTotal] = useState<number>(0);

  const startQuiz = () => {
    setQuizMode(true);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizTotal(0);
    setUserAnswer("");
  };

  const checkAnswer = () => {
    const currentWords = vocabularyData[category];
    const correctAnswer = currentWords[currentQuizIndex].en.toLowerCase();
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer;

    if (isCorrect) {
      setQuizScore(quizScore + 1);
    }
    setQuizTotal(quizTotal + 1);

    // Move to next question
    if (currentQuizIndex < currentWords.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setUserAnswer("");
    } else {
      setQuizMode(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-green-800 mb-2">
            🇧🇷 Learn Portuguese 🇵🇹
          </h1>
          <p className="text-gray-600">
            Master Portuguese vocabulary, verbs, and common phrases
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setMode("vocabulary")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === "vocabulary"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-white text-green-600 hover:bg-green-50"
            }`}
          >
            📚 Vocabulary
          </button>
          <button
            onClick={() => setMode("verbs")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === "verbs"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-white text-green-600 hover:bg-green-50"
            }`}
          >
            🔤 Verb Conjugations
          </button>
          <button
            onClick={() => setMode("phrases")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === "phrases"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-white text-green-600 hover:bg-green-50"
            }`}
          >
            💬 Common Phrases
          </button>
          <button
            onClick={() => {
              setMode("quiz");
              startQuiz();
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === "quiz"
                ? "bg-yellow-600 text-white shadow-lg scale-105"
                : "bg-white text-yellow-600 hover:bg-yellow-50"
            }`}
          >
            🎯 Quiz
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Vocabulary Mode */}
          {mode === "vocabulary" && (
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-4">
                Vocabulary Practice
              </h2>

              {/* Category Selection */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(Object.keys(vocabularyData) as VocabularyCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg capitalize transition-all ${
                      category === cat
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Toggle Button */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setShowEnglish(!showEnglish)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {showEnglish ? "Hide English" : "Show English"}
                </button>
              </div>

              {/* Word List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vocabularyData[category].map((word, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-md"
                  >
                    <div className="text-2xl font-bold text-green-800 mb-2">
                      {word.pt}
                    </div>
                    {showEnglish && (
                      <div className="text-gray-600 italic">{word.en}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verbs Mode */}
          {mode === "verbs" && (
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-4">
                Verb Conjugations (Present Tense)
              </h2>

              {/* Verb Selection */}
              <div className="flex flex-wrap gap-2 mb-6">
                {verbsData.map((verb, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVerb(index)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedVerb === index
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {verb.infinitive} ({verb.english})
                  </button>
                ))}
              </div>

              {/* Conjugation Table */}
              <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg p-6 border-2 border-green-200">
                <h3 className="text-3xl font-bold text-green-800 mb-2 text-center">
                  {verbsData[selectedVerb].infinitive}
                </h3>
                <p className="text-gray-600 text-center mb-6 italic">
                  {verbsData[selectedVerb].english}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(verbsData[selectedVerb].conjugations).map(
                    ([pronoun, conjugation]) => (
                      <div
                        key={pronoun}
                        className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                      >
                        <span className="font-semibold text-gray-700 capitalize">
                          {pronoun}
                        </span>
                        <span className="text-2xl font-bold text-green-700">
                          {conjugation}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Phrases Mode */}
          {mode === "phrases" && (
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-4">
                Common Phrases
              </h2>

              {/* Toggle Button */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setShowEnglish(!showEnglish)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {showEnglish ? "Hide English" : "Show English"}
                </button>
              </div>

              <div className="space-y-4">
                {phrasesData.map((phrase, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-md"
                  >
                    <div className="text-xl font-bold text-green-800 mb-1">
                      {phrase.pt}
                    </div>
                    {showEnglish && (
                      <div className="text-gray-600 italic">{phrase.en}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Mode */}
          {mode === "quiz" && (
            <div>
              <h2 className="text-2xl font-bold text-yellow-700 mb-4">
                Vocabulary Quiz
              </h2>

              {quizMode ? (
                <div>
                  {/* Quiz Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">
                        Question {currentQuizIndex + 1} of {vocabularyData[category].length}
                      </span>
                      <span className="text-green-600 font-semibold">
                        Score: {quizScore}/{quizTotal}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${((currentQuizIndex + 1) / vocabularyData[category].length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Question */}
                  <div className="bg-gradient-to-br from-yellow-50 to-green-50 rounded-lg p-8 border-2 border-yellow-300 mb-6">
                    <p className="text-gray-600 mb-2">Translate to English:</p>
                    <h3 className="text-4xl font-bold text-yellow-700 text-center">
                      {vocabularyData[category][currentQuizIndex].pt}
                    </h3>
                  </div>

                  {/* Answer Input */}
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
                      placeholder="Type your answer..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-yellow-500 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={checkAnswer}
                      className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                    >
                      Check Answer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-3xl font-bold text-green-800 mb-4">
                    Quiz Complete!
                  </h3>
                  <p className="text-2xl text-gray-700 mb-6">
                    Final Score: {quizScore}/{quizTotal} (
                    {quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0}%)
                  </p>
                  <button
                    onClick={startQuiz}
                    className="px-8 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            💡 Learning Tips:
          </h3>
          <ul className="text-blue-700 space-y-2">
            <li>• Practice daily for best results - consistency is key!</li>
            <li>• Use the quiz mode to test your knowledge</li>
            <li>• Focus on one category at a time before moving to the next</li>
            <li>• Try to form sentences using the verbs and vocabulary you learn</li>
            <li>
              • Portuguese has two verbs for "to be": Ser (permanent) and Estar
              (temporary)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
