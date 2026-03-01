"use client";

import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

export default function AudioTrimmer() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("0");
  const [endTime, setEndTime] = useState("");
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    setTrimmedUrl(null);
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

  const handleAudioLoaded = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      setAudioDuration(duration);
      setEndTime(Math.floor(duration).toString());
    }
  };

  const trimAudio = async () => {
    if (!audioFile || !ffmpegRef.current) return;
    setProcessing(true);
    setError(null);
    setProgress(0);
    try {
      const ffmpeg = ffmpegRef.current;
      const ext = audioFile.name.split(".").pop()?.toLowerCase() || "mp3";
      await ffmpeg.writeFile(`input.${ext}`, await fetchFile(audioFile));
      await ffmpeg.exec([
        "-i", `input.${ext}`,
        "-ss", startTime,
        ...(endTime ? ["-to", endTime] : []),
        "-c", "copy",
        `output.${ext}`,
      ]);
      const data = await ffmpeg.readFile(`output.${ext}`);
      const blob = new Blob([data], { type: audioFile.type });
      setTrimmedUrl(URL.createObjectURL(blob));
      setProgress(100);
    } catch {
      setError("Failed to trim audio. Please try a different file.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!trimmedUrl || !audioFile) return;
    const link = document.createElement("a");
    link.href = trimmedUrl;
    const base = audioFile.name.replace(/\.[^/.]+$/, "");
    const ext = audioFile.name.split(".").pop() || "mp3";
    link.download = `${base}_trimmed.${ext}`;
    link.click();
  };

  const reset = () => {
    setAudioFile(null);
    setAudioPreviewUrl(null);
    setTrimmedUrl(null);
    setProgress(0);
    setError(null);
    setStartTime("0");
    setEndTime("");
    setAudioDuration(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-amber-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Audio Trimmer</h1>
          <p className="text-gray-300">Cut audio to any start and end point — runs entirely in your browser</p>
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
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
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
            className="border-4 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-amber-500 transition-colors bg-gray-800/50"
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
                ref={audioRef}
                src={audioPreviewUrl ?? undefined}
                controls
                onLoadedMetadata={handleAudioLoaded}
                className="w-full mb-2"
              />
              {audioDuration !== null && (
                <p className="text-gray-400 text-sm mb-6">
                  Duration: {audioDuration.toFixed(1)}s
                </p>
              )}

              <h2 className="text-xl font-semibold text-white mb-4">Trim Settings</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="End of file"
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                  />
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
                      className="bg-amber-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                {!trimmedUrl ? (
                  <button
                    onClick={trimAudio}
                    disabled={processing}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {processing ? "Trimming..." : "Trim Audio"}
                  </button>
                ) : (
                  <button
                    onClick={download}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Download Trimmed Audio
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

            {trimmedUrl && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Trimmed Audio</h3>
                <audio src={trimmedUrl} controls className="w-full" />
              </div>
            )}

            <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-300 mb-2">About this tool:</h3>
              <ul className="text-sm text-amber-200 space-y-1">
                <li>• All processing happens in your browser — no files are uploaded</li>
                <li>• Supports MP3, WAV, OGG, AAC, FLAC, and more</li>
                <li>• Uses stream copy for fast, lossless trimming</li>
                <li>• Leave the end time blank to trim from start to end of file</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
