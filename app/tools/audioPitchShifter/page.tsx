"use client";

import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

export default function AudioPitchShifter() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [semitones, setSemitones] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const loadFFmpeg = async () => {
    if (ffmpegLoaded) return;
    setLoadingFFmpeg(true);
    setError(null);
    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      ffmpeg.on("progress", ({ progress: prog }) => {
        setProgress(Math.round(prog * 100));
      });
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      setFfmpegLoaded(true);
    } catch {
      setError("Failed to load audio processor. Please try again.");
    } finally {
      setLoadingFFmpeg(false);
    }
  };

  const setFile = (file: File) => {
    setAudioFile(file);
    setAudioPreviewUrl(URL.createObjectURL(file));
    setOutputUrl(null);
    setError(null);
    setProgress(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) setFile(file);
  };

  const shiftPitch = async () => {
    if (!audioFile || !ffmpegRef.current || semitones === 0) return;
    setProcessing(true);
    setError(null);
    setProgress(0);
    try {
      const ffmpeg = ffmpegRef.current;
      const ext = audioFile.name.split(".").pop()?.toLowerCase() || "mp3";
      await ffmpeg.writeFile(`input.${ext}`, await fetchFile(audioFile));

      // asetrate shifts pitch + speed; atempo compensates speed back to original
      const rateMultiplier = Math.pow(2, semitones / 12);
      const tempoMultiplier = 1 / rateMultiplier;
      // atempo is limited to 0.5–2.0; clamp to valid range
      const clampedTempo = Math.max(0.5, Math.min(2.0, tempoMultiplier));
      const filter = `asetrate=44100*${rateMultiplier.toFixed(6)},aresample=44100,atempo=${clampedTempo.toFixed(6)}`;

      await ffmpeg.exec(["-i", `input.${ext}`, "-af", filter, `output.${ext}`]);
      const data = await ffmpeg.readFile(`output.${ext}`);
      const blob = new Blob([data], { type: audioFile.type });
      setOutputUrl(URL.createObjectURL(blob));
      setProgress(100);
    } catch {
      setError("Failed to shift pitch. Please try a different file.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!outputUrl || !audioFile) return;
    const link = document.createElement("a");
    link.href = outputUrl;
    const base = audioFile.name.replace(/\.[^/.]+$/, "");
    const ext = audioFile.name.split(".").pop() || "mp3";
    const sign = semitones > 0 ? "+" : "";
    link.download = `${base}_pitch${sign}${semitones}.${ext}`;
    link.click();
  };

  const reset = () => {
    setAudioFile(null);
    setAudioPreviewUrl(null);
    setOutputUrl(null);
    setProgress(0);
    setError(null);
    setSemitones(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const semitoneLabel = semitones === 0
    ? "No change"
    : semitones > 0
    ? `+${semitones} semitone${Math.abs(semitones) !== 1 ? "s" : ""} (higher)`
    : `${semitones} semitone${Math.abs(semitones) !== 1 ? "s" : ""} (lower)`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-violet-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Audio Pitch Shifter</h1>
          <p className="text-gray-300">Raise or lower the pitch of any audio file by semitones</p>
        </div>

        {!ffmpegLoaded && (
          <div className="bg-gray-800 rounded-lg p-8 text-center shadow-xl mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Initialize Audio Processor</h2>
            <p className="text-gray-300 mb-6">
              Click below to load the audio engine. No files are uploaded — everything runs locally.
            </p>
            <button
              onClick={loadFFmpeg}
              disabled={loadingFFmpeg}
              className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {loadingFFmpeg ? "Loading..." : "Load Audio Processor"}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {ffmpegLoaded && !audioFile && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-violet-500 transition-colors bg-gray-800/50"
          >
            <p className="text-xl text-gray-300 mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">MP3, WAV, OGG, AAC, FLAC, and more</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {ffmpegLoaded && audioFile && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Original Audio</h2>
              <audio
                src={audioPreviewUrl ?? undefined}
                controls
                className="w-full mb-6"
              />

              <h2 className="text-xl font-semibold text-white mb-4">Pitch Shift</h2>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400 text-sm">−12 (octave down)</span>
                  <span className="text-white font-semibold text-xl">{semitoneLabel}</span>
                  <span className="text-gray-400 text-sm">+12 (octave up)</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={semitones}
                  onChange={(e) => {
                    setSemitones(Number(e.target.value));
                    setOutputUrl(null);
                  }}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-0.5">
                  {[-12, -6, 0, 6, 12].map((v) => (
                    <span key={v}>{v > 0 ? `+${v}` : v}</span>
                  ))}
                </div>
              </div>

              {processing && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-violet-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                {!outputUrl ? (
                  <button
                    onClick={shiftPitch}
                    disabled={processing || semitones === 0}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {processing ? "Processing..." : semitones === 0 ? "Move slider to shift pitch" : "Shift Pitch"}
                  </button>
                ) : (
                  <button
                    onClick={download}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Download Shifted Audio
                  </button>
                )}
                <button
                  onClick={reset}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {outputUrl && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Shifted Audio ({semitoneLabel})
                </h3>
                <audio src={outputUrl} controls className="w-full" />
              </div>
            )}

            <div className="bg-violet-900/30 border border-violet-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-violet-300 mb-2">About this tool:</h3>
              <ul className="text-sm text-violet-200 space-y-1">
                <li>• All processing happens in your browser — no files are uploaded</li>
                <li>• 12 semitones = 1 octave (double or half the frequency)</li>
                <li>• Tempo is compensated to stay close to the original speed</li>
                <li>• Large shifts (&gt;6 semitones) may introduce slight artifacts</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
