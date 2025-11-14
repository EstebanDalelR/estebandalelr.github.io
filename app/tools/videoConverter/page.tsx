"use client";

import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

export default function VideoConverter() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [converting, setConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [convertedVideoUrl, setConvertedVideoUrl] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState<boolean>(false);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputFormat, setInputFormat] = useState<string>("avi");
  const [outputFormat, setOutputFormat] = useState<string>("mp4");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const loadFFmpeg = async () => {
    if (ffmpegLoaded) return;

    setLoadingFFmpeg(true);
    setError(null);

    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on("log", ({ message }) => {
        console.log(message);
      });

      ffmpeg.on("progress", ({ progress: prog }) => {
        setProgress(Math.round(prog * 100));
      });

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setFfmpegLoaded(true);
      setLoadingFFmpeg(false);
    } catch (err) {
      console.error("Failed to load FFmpeg:", err);
      setError("Failed to load video converter. Please try again.");
      setLoadingFFmpeg(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setConvertedVideoUrl(null);
      setError(null);
      setProgress(0);

      // Detect input format from file extension
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension) {
        setInputFormat(extension);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setConvertedVideoUrl(null);
      setError(null);
      setProgress(0);

      // Detect input format from file extension
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension) {
        setInputFormat(extension);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const convertVideo = async () => {
    if (!videoFile || !ffmpegRef.current) return;

    setConverting(true);
    setError(null);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;

      // Write input file to FFmpeg file system
      const inputFileName = `input.${inputFormat}`;
      const outputFileName = `output.${outputFormat}`;

      await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

      // Run FFmpeg conversion command
      await ffmpeg.exec([
        "-i", inputFileName,
        "-c:v", "libx264",  // Video codec
        "-preset", "medium", // Encoding speed/quality tradeoff
        "-crf", "23",        // Quality (lower = better, 23 is default)
        "-c:a", "aac",       // Audio codec
        "-b:a", "128k",      // Audio bitrate
        outputFileName
      ]);

      // Read the output file
      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([data], { type: `video/${outputFormat}` });
      const url = URL.createObjectURL(blob);

      setConvertedVideoUrl(url);
      setConverting(false);
      setProgress(100);
    } catch (err) {
      console.error("Conversion error:", err);
      setError("Failed to convert video. Please try a different file.");
      setConverting(false);
      setProgress(0);
    }
  };

  const downloadVideo = () => {
    if (!convertedVideoUrl || !videoFile) return;

    const link = document.createElement("a");
    link.href = convertedVideoUrl;
    const originalName = videoFile.name.replace(/\.[^/.]+$/, "");
    link.download = `${originalName}.${outputFormat}`;
    link.click();
  };

  const resetConverter = () => {
    setVideoFile(null);
    setConvertedVideoUrl(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-purple-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Video Converter
          </h1>
          <p className="text-gray-300">
            Convert your videos between different formats (AVI, MP4, MOV, WebM, and more)
          </p>
        </div>

        {/* FFmpeg Loading */}
        {!ffmpegLoaded && (
          <div className="bg-gray-800 rounded-lg p-8 text-center shadow-xl mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Initialize Video Converter
            </h2>
            <p className="text-gray-300 mb-6">
              Click the button below to load the video conversion engine (FFmpeg).
              This is a one-time setup that runs entirely in your browser.
            </p>
            <button
              onClick={loadFFmpeg}
              disabled={loadingFFmpeg}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {loadingFFmpeg ? "Loading FFmpeg..." : "Load Video Converter"}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* File Upload */}
        {ffmpegLoaded && !videoFile && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-800/50"
          >
            <svg
              className="mx-auto h-16 w-16 text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xl text-gray-300 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              AVI, MP4, MOV, WebM, or other video formats
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Conversion Controls */}
        {ffmpegLoaded && videoFile && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">
                Video Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">File Name</p>
                  <p className="text-white font-medium">{videoFile.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">File Size</p>
                  <p className="text-white font-medium">
                    {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-white mb-4">
                Conversion Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Input Format
                  </label>
                  <input
                    type="text"
                    value={inputFormat}
                    onChange={(e) => setInputFormat(e.target.value.toLowerCase())}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="avi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="mp4">MP4</option>
                    <option value="webm">WebM</option>
                    <option value="avi">AVI</option>
                    <option value="mov">MOV</option>
                    <option value="mkv">MKV</option>
                  </select>
                </div>
              </div>

              {/* Progress Bar */}
              {converting && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Converting...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {!convertedVideoUrl ? (
                  <button
                    onClick={convertVideo}
                    disabled={converting}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {converting ? "Converting..." : "Convert Video"}
                  </button>
                ) : (
                  <button
                    onClick={downloadVideo}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Download Converted Video
                  </button>
                )}
                <button
                  onClick={resetConverter}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Video Preview */}
            {convertedVideoUrl && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Converted Video Preview
                </h3>
                <video
                  src={convertedVideoUrl}
                  controls
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {/* Info */}
            <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">
                About this tool:
              </h3>
              <ul className="text-sm text-purple-200 space-y-1">
                <li>• All conversion happens in your browser - no files are uploaded</li>
                <li>• Supports AVI, MP4, MOV, WebM, MKV, and more</li>
                <li>• Uses H.264 video codec and AAC audio codec for MP4</li>
                <li>• Conversion time depends on video size and your device</li>
                <li>• Large files may take several minutes to process</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
