"use client";

import { useState, useEffect, useRef } from "react";

// Morse code mapping
const morseCodeMap: { [key: string]: string } = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
  " ": "/",
};

// Reverse mapping for morse to text
const textFromMorseMap: { [key: string]: string } = Object.entries(
  morseCodeMap
).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {} as { [key: string]: string });

export default function MorseCodeLearning() {
  const [textInput, setTextInput] = useState("");
  const [morseInput, setMorseInput] = useState("");
  const [morseOutput, setMorseOutput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Convert text to morse
  useEffect(() => {
    const converted = textInput
      .toUpperCase()
      .split("")
      .map((char) => morseCodeMap[char] || "")
      .join(" ");
    setMorseOutput(converted);
  }, [textInput]);

  // Convert morse to text
  useEffect(() => {
    const words = morseInput.split(" / ");
    const converted = words
      .map((word) => {
        const letters = word.split(" ");
        return letters.map((morse) => textFromMorseMap[morse] || "").join("");
      })
      .join(" ");
    setTextOutput(converted);
  }, [morseInput]);

  // Initialize audio context
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Play morse code sound
  const playMorseSound = async (morse: string) => {
    if (isPlaying) return;
    setIsPlaying(true);

    const audioContext = getAudioContext();
    if (audioContext.resume) {
      await audioContext.resume();
    }

    const dotDuration = 60 / playbackSpeed; // milliseconds
    const dashDuration = dotDuration * 3;
    const symbolGap = dotDuration;
    const letterGap = dotDuration * 3;
    const wordGap = dotDuration * 7;

    const playBeep = (duration: number) => {
      return new Promise<void>((resolve) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 600;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          resolve();
        }, duration);
      });
    };

    const wait = (duration: number) => {
      return new Promise<void>((resolve) => setTimeout(resolve, duration));
    };

    const letters = morse.split(" ");
    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];

      if (letter === "/") {
        await wait(wordGap);
        continue;
      }

      for (let j = 0; j < letter.length; j++) {
        const symbol = letter[j];
        if (symbol === ".") {
          await playBeep(dotDuration);
        } else if (symbol === "-") {
          await playBeep(dashDuration);
        }

        if (j < letter.length - 1) {
          await wait(symbolGap);
        }
      }

      if (i < letters.length - 1 && letters[i + 1] !== "/") {
        await wait(letterGap);
      }
    }

    setIsPlaying(false);
  };

  // Play selected letter
  const playLetter = (letter: string) => {
    const morse = morseCodeMap[letter];
    if (morse) {
      playMorseSound(morse);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Morse Code Learning Tool
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Learn, practice, and master Morse code
        </p>

        {/* Main converter section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Text to Morse */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              Text to Morse
            </h2>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your text here..."
              className="w-full h-32 p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none resize-none mb-4"
            />
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-32 font-mono text-lg break-all">
              {morseOutput || (
                <span className="text-gray-500">Morse code will appear here...</span>
              )}
            </div>
            <button
              onClick={() => playMorseSound(morseOutput)}
              disabled={!morseOutput || isPlaying}
              className={`mt-4 w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                !morseOutput || isPlaying
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-700 text-white"
              }`}
            >
              {isPlaying ? "Playing..." : "🔊 Play Morse Code"}
            </button>
          </div>

          {/* Morse to Text */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              Morse to Text
            </h2>
            <textarea
              value={morseInput}
              onChange={(e) => setMorseInput(e.target.value)}
              placeholder="Enter morse code (use spaces between letters, / for word breaks)..."
              className="w-full h-32 p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none resize-none mb-4 font-mono"
            />
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-32 text-lg break-all">
              {textOutput || (
                <span className="text-gray-500">Decoded text will appear here...</span>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <p>💡 Tip: Use spaces between letters and " / " for word breaks</p>
              <p className="mt-1">Example: .... . .-.. .-.. --- / .-- --- .-. .-.. -..</p>
            </div>
          </div>
        </div>

        {/* Playback speed control */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-cyan-400">
            Playback Speed
          </h3>
          <div className="flex items-center gap-4">
            <label className="text-gray-300">Speed:</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-cyan-400 font-mono w-12 text-right">
              {playbackSpeed.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Morse code reference chart */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-cyan-400">
            Morse Code Reference
          </h2>

          {/* Letters */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-300">Letters</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
              {Object.entries(morseCodeMap)
                .filter(([key]) => /[A-Z]/.test(key))
                .map(([letter, morse]) => (
                  <button
                    key={letter}
                    onClick={() => {
                      setSelectedLetter(letter);
                      playLetter(letter);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedLetter === letter
                        ? "bg-cyan-600 border-cyan-400"
                        : "bg-gray-900 border-gray-700 hover:border-cyan-500"
                    }`}
                  >
                    <div className="text-2xl font-bold">{letter}</div>
                    <div className="text-sm font-mono mt-1 text-cyan-300">
                      {morse}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Numbers */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-300">Numbers</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {Object.entries(morseCodeMap)
                .filter(([key]) => /[0-9]/.test(key))
                .map(([number, morse]) => (
                  <button
                    key={number}
                    onClick={() => {
                      setSelectedLetter(number);
                      playLetter(number);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedLetter === number
                        ? "bg-cyan-600 border-cyan-400"
                        : "bg-gray-900 border-gray-700 hover:border-cyan-500"
                    }`}
                  >
                    <div className="text-2xl font-bold">{number}</div>
                    <div className="text-sm font-mono mt-1 text-cyan-300">
                      {morse}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Special characters */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-300">
              Punctuation & Special Characters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
              {Object.entries(morseCodeMap)
                .filter(([key]) => !/[A-Z0-9]/.test(key))
                .map(([char, morse]) => (
                  <button
                    key={char}
                    onClick={() => {
                      setSelectedLetter(char);
                      if (char !== " ") playLetter(char);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedLetter === char
                        ? "bg-cyan-600 border-cyan-400"
                        : "bg-gray-900 border-gray-700 hover:border-cyan-500"
                    }`}
                  >
                    <div className="text-2xl font-bold">
                      {char === " " ? "Space" : char}
                    </div>
                    <div className="text-sm font-mono mt-1 text-cyan-300">
                      {morse}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Learning tips */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            Learning Tips
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span>
                Start by learning the most common letters: E, T, A, O, I, N, S, H
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span>
                A dot (dit) is one unit, a dash (dah) is three units
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span>
                The space between parts of the same letter is one unit
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span>
                The space between letters is three units
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span>
                The space between words is seven units
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span>
                Practice by clicking the letters in the reference chart to hear their sounds
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span>
                Try typing your name and listening to it in Morse code!
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
