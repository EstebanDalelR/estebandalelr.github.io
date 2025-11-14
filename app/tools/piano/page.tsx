"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Piano note frequencies (A4 = 440Hz)
const noteFrequencies: { [key: string]: number } = {
  C3: 130.81, "C#3": 138.59, D3: 146.83, "D#3": 155.56, E3: 164.81,
  F3: 174.61, "F#3": 185.0, G3: 196.0, "G#3": 207.65, A3: 220.0,
  "A#3": 233.08, B3: 246.94,
  C4: 261.63, "C#4": 277.18, D4: 293.66, "D#4": 311.13, E4: 329.63,
  F4: 349.23, "F#4": 369.99, G4: 392.0, "G#4": 415.3, A4: 440.0,
  "A#4": 466.16, B4: 493.88,
  C5: 523.25, "C#5": 554.37, D5: 587.33, "D#5": 622.25, E5: 659.25,
  F5: 698.46, "F#5": 739.99, G5: 783.99, "G#5": 830.61, A5: 880.0,
  "A#5": 932.33, B5: 987.77,
};

// Keyboard to piano key mapping
const keyboardMap: { [key: string]: string } = {
  a: "C3", w: "C#3", s: "D3", e: "D#3", d: "E3", f: "F3", t: "F#3",
  g: "G3", y: "G#3", h: "A3", u: "A#3", j: "B3",
  k: "C4", o: "C#4", l: "D4", p: "D#4", ";": "E4", "'": "F4",
  z: "C5", x: "D5", c: "E5", v: "F5", b: "G5", n: "A5", m: "B5",
};

// Common chords for learning
const chords: { [key: string]: string[] } = {
  "C Major": ["C4", "E4", "G4"],
  "D Major": ["D4", "F#4", "A4"],
  "E Major": ["E4", "G#4", "B4"],
  "F Major": ["F4", "A4", "C5"],
  "G Major": ["G4", "B4", "D5"],
  "A Major": ["A4", "C#5", "E5"],
  "C Minor": ["C4", "D#4", "G4"],
  "D Minor": ["D4", "F4", "A4"],
  "E Minor": ["E4", "G4", "B4"],
};

// Simple melodies for practice
const melodies: { [key: string]: { notes: string[]; timing: number[] } } = {
  "Twinkle Twinkle": {
    notes: ["C4", "C4", "G4", "G4", "A4", "A4", "G4"],
    timing: [500, 500, 500, 500, 500, 500, 1000],
  },
  "Mary Had a Little Lamb": {
    notes: ["E4", "D4", "C4", "D4", "E4", "E4", "E4"],
    timing: [500, 500, 500, 500, 500, 500, 1000],
  },
};

interface PianoKeyProps {
  note: string;
  isBlack: boolean;
  isActive: boolean;
  isHighlighted: boolean;
  showNoteNames: boolean;
  onPlay: (note: string) => void;
  onStop: (note: string) => void;
}

const PianoKey = ({
  note,
  isBlack,
  isActive,
  isHighlighted,
  showNoteNames,
  onPlay,
  onStop,
}: PianoKeyProps) => {
  const baseClass = isBlack
    ? "h-32 w-10 mx-[-5px] z-10 rounded-b-md shadow-lg transition-all"
    : "h-48 w-14 border-2 border-gray-300 rounded-b-md shadow-md transition-all";

  const colorClass = isBlack
    ? isActive
      ? "bg-gray-600"
      : "bg-black hover:bg-gray-800"
    : isActive
    ? "bg-blue-300"
    : isHighlighted
    ? "bg-yellow-200 hover:bg-yellow-300"
    : "bg-white hover:bg-gray-100";

  const textColorClass = isBlack ? "text-white" : "text-gray-800";

  return (
    <div
      className={`${baseClass} ${colorClass} cursor-pointer select-none flex flex-col items-center justify-end pb-2 relative`}
      onMouseDown={() => onPlay(note)}
      onMouseUp={() => onStop(note)}
      onMouseLeave={() => onStop(note)}
      onTouchStart={(e) => {
        e.preventDefault();
        onPlay(note);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onStop(note);
      }}
    >
      {showNoteNames && (
        <span className={`text-xs font-mono ${textColorClass}`}>
          {note.replace("#", "♯")}
        </span>
      )}
    </div>
  );
};

export default function Piano() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [highlightedNotes, setHighlightedNotes] = useState<Set<string>>(
    new Set()
  );
  const [showNoteNames, setShowNoteNames] = useState(true);
  const [selectedChord, setSelectedChord] = useState<string>("");
  const [selectedMelody, setSelectedMelody] = useState<string>("");
  const [isPlayingMelody, setIsPlayingMelody] = useState(false);
  const [sustainEnabled, setSustainEnabled] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());
  const gainNodesRef = useRef<Map<string, GainNode>>(new Map());

  // Initialize Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playNote = useCallback((note: string) => {
    if (!audioContextRef.current || oscillatorsRef.current.has(note)) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = noteFrequencies[note];

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();

    oscillatorsRef.current.set(note, oscillator);
    gainNodesRef.current.set(note, gainNode);

    setActiveNotes((prev) => new Set(prev).add(note));
  }, []);

  const stopNote = useCallback((note: string) => {
    if (sustainEnabled) return;

    const oscillator = oscillatorsRef.current.get(note);
    const gainNode = gainNodesRef.current.get(note);

    if (oscillator && gainNode && audioContextRef.current) {
      const audioContext = audioContextRef.current;
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
        oscillatorsRef.current.delete(note);
        gainNodesRef.current.delete(note);
      }, 300);
    }

    setActiveNotes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  }, [sustainEnabled]);

  const stopAllNotes = useCallback(() => {
    oscillatorsRef.current.forEach((oscillator, note) => {
      const gainNode = gainNodesRef.current.get(note);
      if (gainNode && audioContextRef.current) {
        gainNode.gain.setValueAtTime(
          gainNode.gain.value,
          audioContextRef.current.currentTime
        );
        gainNode.gain.linearRampToValueAtTime(
          0,
          audioContextRef.current.currentTime + 0.1
        );
      }
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gainNode?.disconnect();
      }, 100);
    });
    oscillatorsRef.current.clear();
    gainNodesRef.current.clear();
    setActiveNotes(new Set());
  }, []);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const note = keyboardMap[e.key.toLowerCase()];
      if (note && !e.repeat) {
        playNote(note);
      }
      if (e.key === " ") {
        e.preventDefault();
        setSustainEnabled(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = keyboardMap[e.key.toLowerCase()];
      if (note) {
        stopNote(note);
      }
      if (e.key === " ") {
        e.preventDefault();
        setSustainEnabled(false);
        stopAllNotes();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playNote, stopNote, stopAllNotes]);

  // Chord highlight
  useEffect(() => {
    if (selectedChord) {
      setHighlightedNotes(new Set(chords[selectedChord]));
    } else {
      setHighlightedNotes(new Set());
    }
  }, [selectedChord]);

  // Play chord
  const playChord = () => {
    if (selectedChord) {
      const chordNotes = chords[selectedChord];
      chordNotes.forEach((note) => playNote(note));
      setTimeout(() => {
        chordNotes.forEach((note) => stopNote(note));
      }, 1500);
    }
  };

  // Play melody
  const playMelody = async () => {
    if (!selectedMelody || isPlayingMelody) return;

    setIsPlayingMelody(true);
    const melody = melodies[selectedMelody];

    for (let i = 0; i < melody.notes.length; i++) {
      const note = melody.notes[i];
      const duration = melody.timing[i];

      playNote(note);
      await new Promise((resolve) => setTimeout(resolve, duration));
      stopNote(note);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    setIsPlayingMelody(false);
  };

  // Render piano keys
  const renderKeys = () => {
    const notes = Object.keys(noteFrequencies);
    return notes.map((note) => {
      const isBlack = note.includes("#");
      return (
        <PianoKey
          key={note}
          note={note}
          isBlack={isBlack}
          isActive={activeNotes.has(note)}
          isHighlighted={highlightedNotes.has(note)}
          showNoteNames={showNoteNames}
          onPlay={playNote}
          onStop={stopNote}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            Piano Learning Tool
          </h1>
          <p className="text-gray-300 text-lg">
            Learn piano with interactive keyboard, chords, and melodies
          </p>
        </div>

        {/* Piano Keyboard */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl mb-6">
          <div className="flex justify-center items-end mb-4 overflow-x-auto pb-4">
            <div className="flex items-end">{renderKeys()}</div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <label className="flex items-center text-white cursor-pointer bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              <input
                type="checkbox"
                checked={showNoteNames}
                onChange={(e) => setShowNoteNames(e.target.checked)}
                className="w-4 h-4 mr-2"
              />
              <span className="text-sm font-medium">Show Note Names</span>
            </label>

            <div className="flex items-center text-white bg-gray-700 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">
                Sustain (Hold Space): {sustainEnabled ? "ON" : "OFF"}
              </span>
            </div>

            <button
              onClick={stopAllNotes}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Stop All Notes
            </button>
          </div>
        </div>

        {/* Learning Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Chords */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              Learn Chords
            </h2>
            <select
              value={selectedChord}
              onChange={(e) => setSelectedChord(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-4 border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select a chord...</option>
              {Object.keys(chords).map((chord) => (
                <option key={chord} value={chord}>
                  {chord}
                </option>
              ))}
            </select>

            {selectedChord && (
              <div className="space-y-3">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-300 text-sm mb-2">
                    Notes in {selectedChord}:
                  </p>
                  <div className="flex gap-2">
                    {chords[selectedChord].map((note) => (
                      <span
                        key={note}
                        className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-md font-mono font-semibold text-sm"
                      >
                        {note.replace("#", "♯")}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={playChord}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Play Chord
                </button>
              </div>
            )}
          </div>

          {/* Melodies */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              Practice Melodies
            </h2>
            <select
              value={selectedMelody}
              onChange={(e) => setSelectedMelody(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-4 border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select a melody...</option>
              {Object.keys(melodies).map((melody) => (
                <option key={melody} value={melody}>
                  {melody}
                </option>
              ))}
            </select>

            {selectedMelody && (
              <div className="space-y-3">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-300 text-sm mb-2">Notes sequence:</p>
                  <div className="flex flex-wrap gap-2">
                    {melodies[selectedMelody].notes.map((note, idx) => (
                      <span
                        key={idx}
                        className="bg-green-500 text-gray-900 px-3 py-1 rounded-md font-mono font-semibold text-sm"
                      >
                        {note.replace("#", "♯")}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={playMelody}
                  disabled={isPlayingMelody}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {isPlayingMelody ? "Playing..." : "Play Melody"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-blue-300 mb-3">
            How to Use
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-200">
            <div>
              <h4 className="font-semibold mb-2">Playing Notes:</h4>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Click/tap piano keys to play notes</li>
                <li>• Use computer keyboard keys (a-z) to play</li>
                <li>• Hold Space bar for sustain pedal effect</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Learning Features:</h4>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Select chords to see highlighted keys</li>
                <li>• Play chords automatically to hear them</li>
                <li>• Practice simple melodies step by step</li>
                <li>• Toggle note names for learning</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 bg-blue-800/50 p-3 rounded-lg">
            <h4 className="font-semibold text-blue-200 mb-2">
              Keyboard Mapping:
            </h4>
            <p className="text-sm text-blue-300">
              Lower octave: A W S E D F T G Y H U J | Middle octave: K O L P ;
              &apos; | Upper octave: Z X C V B N M
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
