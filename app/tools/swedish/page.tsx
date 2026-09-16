"use client";

import { useState, useEffect } from "react";

interface Word {
  swedish: string;
  english: string;
  pronunciation: string;
  category: string;
}

type Mode = "flashcard" | "quiz" | "svgquiz";

type SceneType =
  | "on"
  | "in"
  | "under"
  | "over"
  | "infront"
  | "behind"
  | "beside"
  | "between"
  | "through"
  | "around";

interface SVGQuizQuestion {
  scene: SceneType;
  swedish: string;
  english: string;
  sentence: string;
  sentenceEn: string;
  options: string[];
}

const svgQuizQuestions: SVGQuizQuestion[] = [
  { scene: "on",      swedish: "på",      english: "on",             sentence: "Bollen är ___ lådan.",      sentenceEn: "The ball is ___ the box.",     options: ["på", "i", "under", "över"] },
  { scene: "in",      swedish: "i",       english: "in",             sentence: "Bollen är ___ lådan.",      sentenceEn: "The ball is ___ the box.",     options: ["på", "i", "framför", "bredvid"] },
  { scene: "under",   swedish: "under",   english: "under / below",  sentence: "Bollen är ___ bordet.",     sentenceEn: "The ball is ___ the table.",   options: ["under", "på", "över", "mellan"] },
  { scene: "over",    swedish: "över",    english: "over / above",   sentence: "Bollen är ___ lådan.",      sentenceEn: "The ball is ___ the box.",     options: ["över", "under", "på", "bakom"] },
  { scene: "infront", swedish: "framför", english: "in front of",    sentence: "Bollen är ___ lådan.",      sentenceEn: "The ball is ___ the box.",     options: ["framför", "bakom", "bredvid", "mellan"] },
  { scene: "behind",  swedish: "bakom",   english: "behind",         sentence: "Bollen är ___ lådan.",      sentenceEn: "The ball is ___ the box.",     options: ["bakom", "framför", "under", "över"] },
  { scene: "beside",  swedish: "bredvid", english: "beside / next to", sentence: "Bollen är ___ lådan.",    sentenceEn: "The ball is ___ the box.",     options: ["bredvid", "mellan", "framför", "på"] },
  { scene: "between", swedish: "mellan",  english: "between",        sentence: "Bollen är ___ lådorna.",   sentenceEn: "The ball is ___ the boxes.",   options: ["mellan", "bredvid", "bakom", "i"] },
  { scene: "through", swedish: "genom",   english: "through",        sentence: "Bollen flyger ___ porten.",sentenceEn: "The ball flies ___ the gate.", options: ["genom", "mot", "längs", "runt"] },
  { scene: "around",  swedish: "runt",    english: "around",         sentence: "Bollen rör sig ___ lådan.",sentenceEn: "The ball moves ___ the box.",  options: ["runt", "genom", "mot", "längs"] },
];

const vocabulary: Word[] = [
  // Greetings
  { swedish: "Hej",           english: "Hello",              pronunciation: "hey",           category: "Greetings" },
  { swedish: "God morgon",    english: "Good morning",       pronunciation: "goo mor-on",    category: "Greetings" },
  { swedish: "God kväll",     english: "Good evening",       pronunciation: "goo kvel",      category: "Greetings" },
  { swedish: "God natt",      english: "Good night",         pronunciation: "goo nat",       category: "Greetings" },
  { swedish: "Hej då",        english: "Goodbye",            pronunciation: "hey daw",       category: "Greetings" },
  { swedish: "Tack",          english: "Thank you",          pronunciation: "tack",          category: "Greetings" },
  { swedish: "Varsågod",      english: "You're welcome",     pronunciation: "var-shaw-goo",  category: "Greetings" },
  { swedish: "Ursäkta",       english: "Excuse me",          pronunciation: "oor-sek-ta",    category: "Greetings" },

  // Numbers
  { swedish: "Ett",  english: "One",   pronunciation: "ett",    category: "Numbers" },
  { swedish: "Två",  english: "Two",   pronunciation: "tvaw",   category: "Numbers" },
  { swedish: "Tre",  english: "Three", pronunciation: "tray",   category: "Numbers" },
  { swedish: "Fyra", english: "Four",  pronunciation: "fee-ra", category: "Numbers" },
  { swedish: "Fem",  english: "Five",  pronunciation: "fem",    category: "Numbers" },
  { swedish: "Sex",  english: "Six",   pronunciation: "sex",    category: "Numbers" },
  { swedish: "Sju",  english: "Seven", pronunciation: "shoo",   category: "Numbers" },
  { swedish: "Åtta", english: "Eight", pronunciation: "aw-ta",  category: "Numbers" },
  { swedish: "Nio",  english: "Nine",  pronunciation: "nee-oh", category: "Numbers" },
  { swedish: "Tio",  english: "Ten",   pronunciation: "tee-oh", category: "Numbers" },

  // Common Phrases
  { swedish: "Jag heter...",          english: "My name is...",          pronunciation: "yaw heh-ter",           category: "Common Phrases" },
  { swedish: "Hur mår du?",           english: "How are you?",           pronunciation: "hoor mawr doo",         category: "Common Phrases" },
  { swedish: "Jag mår bra",           english: "I'm fine",               pronunciation: "yaw mawr bra",          category: "Common Phrases" },
  { swedish: "Talar du engelska?",    english: "Do you speak English?",  pronunciation: "tah-lar doo eng-el-ska",category: "Common Phrases" },
  { swedish: "Jag förstår inte",      english: "I don't understand",     pronunciation: "yaw fur-stawr in-teh",  category: "Common Phrases" },
  { swedish: "Var ligger...?",        english: "Where is...?",           pronunciation: "var lig-ger",           category: "Common Phrases" },
  { swedish: "Hur mycket kostar det?",english: "How much does it cost?", pronunciation: "hoor mee-ket kos-tar deh", category: "Common Phrases" },

  // Food & Drink
  { swedish: "Vatten", english: "Water",  pronunciation: "vat-ten", category: "Food & Drink" },
  { swedish: "Kaffe",  english: "Coffee", pronunciation: "kaf-feh", category: "Food & Drink" },
  { swedish: "Te",     english: "Tea",    pronunciation: "teh",     category: "Food & Drink" },
  { swedish: "Bröd",   english: "Bread",  pronunciation: "brurd",   category: "Food & Drink" },
  { swedish: "Smör",   english: "Butter", pronunciation: "smur",    category: "Food & Drink" },
  { swedish: "Ost",    english: "Cheese", pronunciation: "oost",    category: "Food & Drink" },
  { swedish: "Mjölk",  english: "Milk",   pronunciation: "myulk",   category: "Food & Drink" },
  { swedish: "Äpple",  english: "Apple",  pronunciation: "ep-pleh", category: "Food & Drink" },

  // Time & Days
  { swedish: "Idag",    english: "Today",     pronunciation: "ee-dahg",   category: "Time & Days" },
  { swedish: "Igår",    english: "Yesterday", pronunciation: "ee-gawr",   category: "Time & Days" },
  { swedish: "Imorgon", english: "Tomorrow",  pronunciation: "ee-mor-on", category: "Time & Days" },
  { swedish: "Måndag",  english: "Monday",    pronunciation: "mawn-dahg", category: "Time & Days" },
  { swedish: "Tisdag",  english: "Tuesday",   pronunciation: "tees-dahg", category: "Time & Days" },
  { swedish: "Onsdag",  english: "Wednesday", pronunciation: "oons-dahg", category: "Time & Days" },
  { swedish: "Torsdag", english: "Thursday",  pronunciation: "torsh-dahg",category: "Time & Days" },
  { swedish: "Fredag",  english: "Friday",    pronunciation: "freh-dahg", category: "Time & Days" },

  // Common Words
  { swedish: "Ja",     english: "Yes",   pronunciation: "yah",    category: "Common Words" },
  { swedish: "Nej",    english: "No",    pronunciation: "nay",    category: "Common Words" },
  { swedish: "Kanske", english: "Maybe", pronunciation: "kan-sheh",category: "Common Words" },
  { swedish: "Var",    english: "Where", pronunciation: "var",    category: "Common Words" },
  { swedish: "När",    english: "When",  pronunciation: "nair",   category: "Common Words" },
  { swedish: "Varför", english: "Why",   pronunciation: "var-fur",category: "Common Words" },
  { swedish: "Vem",    english: "Who",   pronunciation: "vem",    category: "Common Words" },
  { swedish: "Vad",    english: "What",  pronunciation: "vahd",   category: "Common Words" },

  // Prepositions
  { swedish: "På",        english: "On",               pronunciation: "paw",       category: "Prepositions" },
  { swedish: "I",         english: "In",               pronunciation: "ee",        category: "Prepositions" },
  { swedish: "Under",     english: "Under / Below",    pronunciation: "un-der",    category: "Prepositions" },
  { swedish: "Över",      english: "Over / Above",     pronunciation: "ur-ver",    category: "Prepositions" },
  { swedish: "Framför",   english: "In front of",      pronunciation: "fram-fur",  category: "Prepositions" },
  { swedish: "Bakom",     english: "Behind",           pronunciation: "bah-kom",   category: "Prepositions" },
  { swedish: "Bredvid",   english: "Beside / Next to", pronunciation: "bred-veed", category: "Prepositions" },
  { swedish: "Mellan",    english: "Between",          pronunciation: "mel-lan",   category: "Prepositions" },
  { swedish: "Till",      english: "To / Towards",     pronunciation: "till",      category: "Prepositions" },
  { swedish: "Från",      english: "From",             pronunciation: "frawn",     category: "Prepositions" },
  { swedish: "Med",       english: "With",             pronunciation: "mehd",      category: "Prepositions" },
  { swedish: "Utan",      english: "Without",          pronunciation: "oo-tan",    category: "Prepositions" },
  { swedish: "Om",        english: "About / Around",   pronunciation: "om",        category: "Prepositions" },
  { swedish: "Efter",     english: "After",            pronunciation: "ef-ter",    category: "Prepositions" },
  { swedish: "Innan",     english: "Before",           pronunciation: "in-an",     category: "Prepositions" },
  { swedish: "Genom",     english: "Through",          pronunciation: "yeh-nom",   category: "Prepositions" },
  { swedish: "Utanför",   english: "Outside",          pronunciation: "oo-tan-fur",category: "Prepositions" },
  { swedish: "Innanför",  english: "Inside / Within",  pronunciation: "in-an-fur", category: "Prepositions" },
  { swedish: "Mot",       english: "Towards / Against",pronunciation: "moot",      category: "Prepositions" },
  { swedish: "Längs",     english: "Along",            pronunciation: "lengs",     category: "Prepositions" },
  { swedish: "Runt",      english: "Around / Round",   pronunciation: "roont",     category: "Prepositions" },
  { swedish: "Vid",       english: "At / By",          pronunciation: "veed",      category: "Prepositions" },
];

// ─── SVG Scene Components ────────────────────────────────────────────────────

const SceneBall = ({ cx, cy, r = 19 }: { cx: number; cy: number; r?: number }) => (
  <g>
    <circle cx={cx + 2} cy={cy + 2} r={r} fill="rgba(0,0,0,0.12)" />
    <circle cx={cx} cy={cy} r={r} fill="#EF4444" />
    <circle cx={cx - r * 0.32} cy={cy - r * 0.32} r={r * 0.27} fill="rgba(255,255,255,0.45)" />
    <path
      d={`M ${cx - r * 0.7} ${cy} Q ${cx} ${cy - r * 0.4} ${cx + r * 0.7} ${cy}`}
      stroke="rgba(255,255,255,0.25)"
      strokeWidth={1.5}
      fill="none"
    />
  </g>
);

const SceneBox = ({ x, y, w = 68, h = 52 }: { x: number; y: number; w?: number; h?: number }) => (
  <g>
    <rect x={x + 2} y={y + 2} width={w} height={h} rx={3} fill="rgba(0,0,0,0.1)" />
    <rect x={x} y={y} width={w} height={h} rx={3} fill="#D97706" />
    <rect x={x} y={y} width={w} height={9} rx={3} fill="#F59E0B" />
    <rect x={x} y={y} width={7} height={h} rx={2} fill="rgba(0,0,0,0.12)" />
    <line x1={x + 7} y1={y + h * 0.42} x2={x + w} y2={y + h * 0.42} stroke="#92400E" strokeWidth={0.9} opacity={0.5} />
    <line x1={x + 7} y1={y + h * 0.72} x2={x + w} y2={y + h * 0.72} stroke="#92400E" strokeWidth={0.9} opacity={0.5} />
    <rect x={x} y={y} width={w} height={h} rx={3} fill="none" stroke="#92400E" strokeWidth={1.5} />
  </g>
);

function PrepositionScene({ scene }: { scene: SceneType }) {
  const bg = (
    <defs>
      <linearGradient id={`bg-${scene}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EFF6FF" />
        <stop offset="100%" stopColor="#DBEAFE" />
      </linearGradient>
    </defs>
  );
  const ground = <rect x="0" y="150" width="200" height="10" rx="2" fill="#CBD5E1" />;
  const bgRect = <rect x="0" y="0" width="200" height="160" fill={`url(#bg-${scene})`} />;

  switch (scene) {
    case "on":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full">
          {bg}{bgRect}{ground}
          <SceneBox x={66} y={96} />
          <ellipse cx={100} cy={97} rx={20} ry={4} fill="rgba(0,0,0,0.08)" />
          <SceneBall cx={100} cy={76} />
        </svg>
      );

    case "in":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full">
          {bg}{bgRect}{ground}
          {/* Interior of box - draw first */}
          <rect x="58" y="58" width="84" height="92" rx="3" fill="#FEF3C7" />
          {/* Ball inside (drawn before the walls) */}
          <SceneBall cx={100} cy={116} r={21} />
          {/* Left wall */}
          <rect x="55" y="55" width="11" height="95" rx="2" fill="#D97706" stroke="#92400E" strokeWidth={1} />
          {/* Right wall */}
          <rect x="134" y="55" width="11" height="95" rx="2" fill="#B45309" stroke="#92400E" strokeWidth={1} />
          {/* Bottom */}
          <rect x="55" y="148" width="90" height="7" rx="2" fill="#92400E" />
          {/* Open top rim */}
          <rect x="53" y="50" width="94" height={10} rx="3" fill="#F59E0B" stroke="#92400E" strokeWidth={1.5} />
        </svg>
      );

    case "under":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full">
          {bg}{bgRect}{ground}
          {/* Table legs */}
          <rect x="52" y="88" width="10" height="62" rx="2" fill="#92400E" />
          <rect x="138" y="88" width="10" height="62" rx="2" fill="#92400E" />
          {/* Table top */}
          <rect x="32" y="76" width="136" height="14" rx="3" fill="#D97706" stroke="#92400E" strokeWidth={1.5} />
          <rect x="32" y="76" width="136" height={5} rx="3" fill="#F59E0B" />
          {/* Ball under table */}
          <SceneBall cx={100} cy={120} />
        </svg>
      );

    case "over":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full">
          {bg}{bgRect}{ground}
          <SceneBox x={66} y={96} />
          <line x1={100} y1={67} x2={100} y2={96} stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4,3" />
          <SceneBall cx={100} cy={47} />
        </svg>
      );

    case "infront":
      return (
        <svg viewBox="0 0 200 165" className="w-full h-full">
          {bg}
          <rect x="0" y="0" width="200" height="165" fill={`url(#bg-${scene})`} />
          {/* Floor (top-down) */}
          <rect x="0" y="0" width="200" height="165" fill="#F1F5F9" />
          <text x="6" y="14" fontSize="9" fill="#94A3B8" fontFamily="sans-serif">bird&apos;s-eye view</text>
          {/* Box seen from above */}
          <rect x="70" y="45" width="60" height="52" rx="3" fill="#D97706" stroke="#92400E" strokeWidth={2} />
          <rect x="70" y="45" width="60" height="8" rx="3" fill="#F59E0B" />
          <line x1="70" y1="65" x2="130" y2="65" stroke="#92400E" strokeWidth={0.8} opacity={0.45} />
          <line x1="70" y1="80" x2="130" y2="80" stroke="#92400E" strokeWidth={0.8} opacity={0.45} />
          {/* Ball between viewer and box */}
          <SceneBall cx={100} cy={125} r={17} />
          {/* Viewer indicator */}
          <text x="100" y="157" textAnchor="middle" fontSize="11" fill="#64748B" fontFamily="sans-serif">👁  you (viewer)</text>
          {/* Arrow showing direction of view */}
          <line x1="100" y1="147" x2="100" y2="97" stroke="#94A3B8" strokeWidth={1} strokeDasharray="3,2" />
        </svg>
      );

    case "behind":
      return (
        <svg viewBox="0 0 200 165" className="w-full h-full">
          {bg}
          <rect x="0" y="0" width="200" height="165" fill="#F1F5F9" />
          <text x="6" y="14" fontSize="9" fill="#94A3B8" fontFamily="sans-serif">bird&apos;s-eye view</text>
          {/* Box seen from above */}
          <rect x="70" y="68" width="60" height="52" rx="3" fill="#D97706" stroke="#92400E" strokeWidth={2} />
          <rect x="70" y="68" width="60" height="8" rx="3" fill="#F59E0B" />
          <line x1="70" y1="88" x2="130" y2="88" stroke="#92400E" strokeWidth={0.8} opacity={0.45} />
          <line x1="70" y1="103" x2="130" y2="103" stroke="#92400E" strokeWidth={0.8} opacity={0.45} />
          {/* Ball behind the box (far side from viewer) */}
          <SceneBall cx={100} cy={32} r={17} />
          {/* Viewer indicator */}
          <text x="100" y="157" textAnchor="middle" fontSize="11" fill="#64748B" fontFamily="sans-serif">👁  you (viewer)</text>
          <line x1="100" y1="147" x2="100" y2="120" stroke="#94A3B8" strokeWidth={1} strokeDasharray="3,2" />
        </svg>
      );

    case "beside":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full">
          {bg}{bgRect}{ground}
          <SceneBox x={106} y={96} />
          <SceneBall cx={70} cy={131} r={17} />
          <line x1="87" y1="131" x2="106" y2="131" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="3,2" />
        </svg>
      );

    case "between":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full">
          {bg}{bgRect}{ground}
          <SceneBox x={12} y={100} w={58} h={50} />
          <SceneBox x={130} y={100} w={58} h={50} />
          <SceneBall cx={100} cy={130} r={17} />
        </svg>
      );

    case "through":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full">
          {bg}{bgRect}{ground}
          {/* Left post */}
          <rect x="38" y="55" width="22" height="95" rx="4" fill="#6B7280" stroke="#4B5563" strokeWidth={1.5} />
          <rect x="38" y="55" width="22" height="10" rx="3" fill="#9CA3AF" />
          {/* Right post */}
          <rect x="140" y="55" width="22" height="95" rx="4" fill="#6B7280" stroke="#4B5563" strokeWidth={1.5} />
          <rect x="140" y="55" width="22" height="10" rx="3" fill="#9CA3AF" />
          {/* Crossbar */}
          <rect x="38" y="55" width="124" height="14" rx="3" fill="#4B5563" />
          {/* Motion trail */}
          <line x1="22" y1="100" x2="60" y2="100" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7} />
          <line x1="140" y1="100" x2="178" y2="100" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7} />
          {/* Arrow */}
          <text x="18" y="105" fontSize="16" fill="#64748B">→</text>
          {/* Ball going through */}
          <SceneBall cx={100} cy={100} r={18} />
        </svg>
      );

    case "around":
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full">
          {bg}
          <rect x="0" y="0" width="200" height="160" fill="#F1F5F9" />
          <text x="6" y="14" fontSize="9" fill="#94A3B8" fontFamily="sans-serif">bird&apos;s-eye view</text>
          {/* Circular orbit path */}
          <circle cx="100" cy="88" r="52" fill="none" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="7,4" />
          {/* Directional arrows on path */}
          <text x="150" y="68" fontSize="13" fill="#94A3B8" transform="rotate(45,150,68)">▶</text>
          <text x="46" y="115" fontSize="13" fill="#94A3B8" transform="rotate(225,46,115)">▶</text>
          {/* Box in center */}
          <SceneBox x={73} y={68} w={54} h={42} />
          {/* Ball on orbit */}
          <SceneBall cx={100} cy={36} r={16} />
        </svg>
      );

    default:
      return <svg viewBox="0 0 200 160" className="w-full h-full" />;
  }
}

function getFinalMessage(correct: number, total: number): { emoji: string; sv: string; en: string } {
  const pct = correct / total;
  if (pct === 1)   return { emoji: "🏆", sv: "Perfekt! Du är ett geni!", en: "Perfect! You're a genius!" };
  if (pct >= 0.8)  return { emoji: "🌟", sv: "Bra jobbat!", en: "Well done!" };
  if (pct >= 0.6)  return { emoji: "👍", sv: "Inte illa!", en: "Not bad!" };
  return               { emoji: "📚", sv: "Öva mer!", en: "Keep practicing!" };
}

export default function SwedishLearning() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<Mode>("flashcard");
  const [quizAnswer, setQuizAnswer] = useState("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // SVG quiz state
  const [svgIndex, setSvgIndex] = useState(0);
  const [svgChosen, setSvgChosen] = useState<string | null>(null);
  const [svgScore, setSvgScore] = useState({ correct: 0, total: 0 });
  const [svgDone, setSvgDone] = useState(false);
  const [svgOrder, setSvgOrder] = useState<number[]>([]);
  const [svgShake, setSvgShake] = useState(false);

  useEffect(() => {
    const order = [...Array(svgQuizQuestions.length).keys()].sort(() => Math.random() - 0.5);
    setSvgOrder(order);
  }, []);

  const categories = ["All", ...Array.from(new Set(vocabulary.map((w) => w.category)))];
  const filteredVocabulary =
    selectedCategory === "All" ? vocabulary : vocabulary.filter((w) => w.category === selectedCategory);
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

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleQuizSubmit = () => {
    const correct = quizAnswer.toLowerCase().trim() === currentWord.english.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    setScore((prev) => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));
  };

  const handleShuffle = () => {
    setCurrentIndex(Math.floor(Math.random() * filteredVocabulary.length));
    setIsFlipped(false);
    setQuizAnswer("");
    setShowResult(false);
  };

  const resetScore = () => setScore({ correct: 0, total: 0 });

  // SVG quiz handlers
  const currentSvgQ = svgOrder.length > 0 ? svgQuizQuestions[svgOrder[svgIndex]] : svgQuizQuestions[svgIndex];

  const handleSvgAnswer = (answer: string) => {
    if (svgChosen !== null) return;
    const correct = answer === currentSvgQ.swedish;
    setSvgChosen(answer);
    if (!correct) setSvgShake(true);
    setSvgScore((prev) => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));
    setTimeout(() => setSvgShake(false), 600);
  };

  const handleSvgNext = () => {
    if (svgIndex + 1 >= svgQuizQuestions.length) {
      setSvgDone(true);
    } else {
      setSvgIndex((i) => i + 1);
      setSvgChosen(null);
    }
  };

  const restartSvgQuiz = () => {
    const order = [...Array(svgQuizQuestions.length).keys()].sort(() => Math.random() - 0.5);
    setSvgOrder(order);
    setSvgIndex(0);
    setSvgChosen(null);
    setSvgScore({ correct: 0, total: 0 });
    setSvgDone(false);
  };

  const optionStyle = (opt: string) => {
    if (svgChosen === null) {
      return "bg-white border-2 border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50 hover:scale-105";
    }
    if (opt === currentSvgQ.swedish) return "bg-green-100 border-2 border-green-500 text-green-800 scale-105 shadow-md";
    if (opt === svgChosen) return "bg-red-100 border-2 border-red-400 text-red-700";
    return "bg-gray-50 border-2 border-gray-200 text-gray-400";
  };

  const finalMsg = getFinalMessage(svgScore.correct, svgQuizQuestions.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            Swedish Learning Tool
          </h1>
          <p className="text-gray-600 text-lg">Lär dig svenska! (Learn Swedish!)</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-3 mb-6 flex-wrap">
          {(["flashcard", "quiz", "svgquiz"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setShowResult(false); }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                mode === m
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {m === "flashcard" ? "Flashcard Mode" : m === "quiz" ? "Quiz Mode" : "🎯 Preposition Quiz"}
            </button>
          ))}
        </div>

        {/* ── SVG QUIZ MODE ─────────────────────────────────────────────── */}
        {mode === "svgquiz" && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {svgDone ? (
              /* Final score screen */
              <div className="p-10 text-center">
                <div className="text-7xl mb-4">{finalMsg.emoji}</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">{finalMsg.sv}</h2>
                <p className="text-lg text-gray-500 mb-6">{finalMsg.en}</p>
                <div className="inline-flex items-center gap-3 bg-indigo-50 rounded-xl px-8 py-4 mb-8">
                  <span className="text-4xl font-bold text-indigo-600">{svgScore.correct}</span>
                  <span className="text-2xl text-gray-400">/</span>
                  <span className="text-4xl font-bold text-gray-400">{svgQuizQuestions.length}</span>
                  <span className="text-lg text-indigo-500 ml-2">correct</span>
                </div>
                {/* Mini result list */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8 max-w-lg mx-auto">
                  {svgQuizQuestions.map((q) => (
                    <div key={q.scene} className="bg-gray-50 rounded-lg p-2 text-center text-sm">
                      <div className="font-bold text-gray-700">{q.swedish}</div>
                      <div className="text-gray-400 text-xs">{q.english}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={restartSvgQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
                >
                  Play Again 🔄
                </button>
              </div>
            ) : (
              <>
                {/* Progress bar */}
                <div className="h-2 bg-gray-100">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${((svgIndex) / svgQuizQuestions.length) * 100}%` }}
                  />
                </div>

                <div className="p-6 sm:p-8">
                  {/* Question header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400 font-medium">
                      Question {svgIndex + 1} / {svgQuizQuestions.length}
                    </span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {svgScore.correct} correct
                    </span>
                  </div>

                  {/* Fill-in-blank sentence */}
                  <div className="text-center mb-5">
                    <p className="text-2xl font-bold text-gray-800 mb-1">
                      {currentSvgQ.sentence.replace("___",
                        svgChosen
                          ? `"${currentSvgQ.swedish}"`
                          : "___"
                      )}
                    </p>
                    <p className="text-gray-400 text-sm italic">{currentSvgQ.sentenceEn}</p>
                  </div>

                  {/* SVG Scene */}
                  <div
                    className={`rounded-xl overflow-hidden border-2 border-gray-100 mb-6 max-w-xs mx-auto bg-white transition-all ${
                      svgShake ? "animate-shake" : ""
                    } ${svgChosen === currentSvgQ.swedish ? "border-green-300" : ""}`}
                    style={{ height: 200 }}
                  >
                    <PrepositionScene scene={currentSvgQ.scene} />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
                    {currentSvgQ.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSvgAnswer(opt)}
                        disabled={svgChosen !== null}
                        className={`py-3 px-4 rounded-xl font-bold text-lg transition-all duration-200 ${optionStyle(opt)}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {/* Result feedback */}
                  {svgChosen && (
                    <div
                      className={`rounded-xl p-4 text-center mb-5 transition-all ${
                        svgChosen === currentSvgQ.swedish
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {svgChosen === currentSvgQ.swedish ? (
                        <p className="text-green-700 font-bold text-lg">
                          ✓ Rätt! &nbsp;
                          <span className="font-normal text-green-600">
                            &ldquo;{currentSvgQ.swedish}&rdquo; = {currentSvgQ.english}
                          </span>
                        </p>
                      ) : (
                        <p className="text-red-700 font-bold text-lg">
                          ✗ Fel! &nbsp;
                          <span className="font-normal text-red-600">
                            Rätt svar: &ldquo;{currentSvgQ.swedish}&rdquo; = {currentSvgQ.english}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Next button */}
                  {svgChosen && (
                    <div className="text-center">
                      <button
                        onClick={handleSvgNext}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
                      >
                        {svgIndex + 1 >= svgQuizQuestions.length ? "See Results 🏆" : "Next →"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── FLASHCARD / QUIZ MODE ─────────────────────────────────────── */}
        {mode !== "svgquiz" && (
          <>
            {/* Score Display (Quiz Mode) */}
            {mode === "quiz" && score.total > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-6 text-center">
                <div className="flex items-center justify-center gap-4">
                  <p className="text-lg font-semibold">
                    Score: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)
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
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select Category:</label>
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
                  <div className="min-h-[300px] flex flex-col items-center justify-center">
                    <div onClick={handleFlip} className="w-full max-w-md cursor-pointer perspective-1000">
                      <div
                        className={`relative w-full h-64 transition-transform duration-500 transform-style-3d ${
                          isFlipped ? "rotate-y-180" : ""
                        }`}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex flex-col items-center justify-center p-8 backface-hidden ${
                            isFlipped ? "invisible" : "visible"
                          }`}
                        >
                          <p className="text-sm text-gray-600 mb-2">Swedish</p>
                          <p className="text-5xl font-bold text-gray-800 mb-4 text-center">{currentWord.swedish}</p>
                          <p className="text-lg text-gray-500 italic">[{currentWord.pronunciation}]</p>
                          <p className="text-sm text-gray-400 mt-4">Click to flip</p>
                        </div>
                        <div
                          className={`absolute inset-0 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl flex flex-col items-center justify-center p-8 backface-hidden transform rotate-y-180 ${
                            isFlipped ? "visible" : "invisible"
                          }`}
                        >
                          <p className="text-sm text-gray-600 mb-2">English</p>
                          <p className="text-5xl font-bold text-gray-800 text-center">{currentWord.english}</p>
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
                  <div className="min-h-[300px] flex flex-col items-center justify-center">
                    <p className="text-sm text-gray-600 mb-2">Translate to English:</p>
                    <p className="text-5xl font-bold text-gray-800 mb-4 text-center">{currentWord.swedish}</p>
                    <p className="text-lg text-gray-500 italic mb-8">[{currentWord.pronunciation}]</p>
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
                            isCorrect ? "bg-green-100 border-2 border-green-500" : "bg-red-100 border-2 border-red-500"
                          }`}
                        >
                          <p className={`text-2xl font-bold mb-2 ${isCorrect ? "text-green-700" : "text-red-700"}`}>
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
                />
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
