"use client";

import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

interface Segment {
  url: string;
  name: string;
}

export default function AudioSplitter() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [splitPoints, setSplitPoints] = useState<string[]>(["30"]);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setSegments([]);
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
      setAudioDuration(audioRef.current.duration);
    }
  };

  const addSplitPoint = () => setSplitPoints([...splitPoints, ""]);

  const removeSplitPoint = (index: number) =>
    setSplitPoints(splitPoints.filter((_, i) => i !== index));

  const updateSplitPoint = (index: number, value: string) => {
    const updated = [...splitPoints];
    updated[index] = value;
    setSplitPoints(updated);
  };

  const splitAudio = async () => {
    if (!audioFile || !ffmpegRef.current) return;
    setProcessing(true);
    setError(null);
    setProgress(0);
    setSegments([]);
    try {
      const ffmpeg = ffmpegRef.current;
      const ext = audioFile.name.split(".").pop()?.toLowerCase() || "mp3";
      const baseName = audioFile.name.replace(/\.[^/.]+$/, "");
      await ffmpeg.writeFile(`input.${ext}`, await fetchFile(audioFile));

      const sortedPoints = splitPoints
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0)
        .sort((a, b) => a - b);

      const duration = audioDuration ?? 0;
      const boundaries = [0, ...sortedPoints, duration];
      const newSegments: Segment[] = [];

      for (let i = 0; i < boundaries.length - 1; i++) {
        const start = boundaries[i];
        const end = boundaries[i + 1];
        const outName = `segment_${i}.${ext}`;
        await ffmpeg.exec([
          "-i", `input.${ext}`,
          "-ss", String(start),
          "-to", String(end),
          "-c", "copy",
          outName,
        ]);
        const data = await ffmpeg.readFile(outName);
        const blob = new Blob([data], { type: audioFile.type });
        newSegments.push({
          url: URL.createObjectURL(blob),
          name: `${baseName}_part${i + 1}.${ext}`,
        });
        setProgress(Math.round(((i + 1) / (boundaries.length - 1)) * 100));
      }
      setSegments(newSegments);
    } catch {
      setError("Failed to split audio. Please try a different file.");
    } finally {
      setProcessing(false);
    }
  };

  const downloadSegment = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
  };

  const reset = () => {
    setAudioFile(null);
    setAudioPreviewUrl(null);
    setSegments([]);
    setProgress(0);
    setError(null);
    setSplitPoints(["30"]);
    setAudioDuration(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-blue-800 to-sky-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Audio Splitter</h1>
          <p className="text-gray-300">
            Split an audio file into multiple segments at custom time points
          </p>
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
              className="bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
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
            className="border-4 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-sky-500 transition-colors bg-gray-800/50"
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

              <h2 className="text-xl font-semibold text-white mb-3">Split Points (seconds)</h2>
              <p className="text-gray-400 text-sm mb-4">
                Define where to cut the audio. The file will be split into {splitPoints.length + 1} segments.
              </p>
              <div className="space-y-3 mb-4">
                {splitPoints.map((point, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <input
                      type="number"
                      min="0"
                      value={point}
                      onChange={(e) => updateSplitPoint(i, e.target.value)}
                      placeholder="Split at (seconds)"
                      className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-sky-500 focus:outline-none"
                    />
                    <button
                      onClick={() => removeSplitPoint(i)}
                      disabled={splitPoints.length === 1}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addSplitPoint}
                className="text-sm text-sky-400 hover:text-sky-300 transition-colors mb-6"
              >
                + Add split point
              </button>

              {processing && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Processing segments...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-sky-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={splitAudio}
                  disabled={processing}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {processing ? "Splitting..." : "Split Audio"}
                </button>
                <button
                  onClick={reset}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {segments.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Segments ({segments.length})
                </h3>
                {segments.map((seg, i) => (
                  <div key={i} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white font-medium">Part {i + 1}</span>
                      <button
                        onClick={() => downloadSegment(seg.url, seg.name)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1 rounded-lg transition-colors"
                      >
                        Download
                      </button>
                    </div>
                    <audio src={seg.url} controls className="w-full" />
                  </div>
                ))}
              </div>
            )}

            <div className="bg-sky-900/30 border border-sky-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-sky-300 mb-2">About this tool:</h3>
              <ul className="text-sm text-sky-200 space-y-1">
                <li>• All processing happens in your browser — no files are uploaded</li>
                <li>• Add as many split points as needed</li>
                <li>• Each segment can be previewed and downloaded independently</li>
                <li>• Uses stream copy for fast, lossless splitting</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
