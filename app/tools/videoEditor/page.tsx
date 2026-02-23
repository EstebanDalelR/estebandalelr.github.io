"use client";

import { useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export default function VideoEditor() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [fps, setFps] = useState<number>(2);
  const [format, setFormat] = useState<string>("mp4");
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
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
      console.log("FFmpeg loaded successfully");
    } catch (error) {
      console.error("Error loading FFmpeg:", error);
      alert("Failed to load FFmpeg. Please refresh the page.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      addFiles(Array.from(files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );
      addFiles(imageFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const addFiles = (files: File[]) => {
    const newImages: ImageFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < images.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      setImages(newImages);
    }
  };

  const generateVideo = async () => {
    if (images.length === 0 || !ffmpegRef.current || !ffmpegLoaded) {
      alert("Please add images and wait for FFmpeg to load.");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setVideoUrl(null);

    try {
      const ffmpeg = ffmpegRef.current;

      // Write all images to FFmpeg's virtual file system
      for (let i = 0; i < images.length; i++) {
        const imageData = await fetchFile(images[i].file);
        await ffmpeg.writeFile(`img${i.toString().padStart(4, "0")}.png`, imageData);
      }

      // Prepare FFmpeg command based on format
      let outputFile = "";
      let ffmpegArgs: string[] = [];

      switch (format) {
        case "mp4":
          outputFile = "output.mp4";
          ffmpegArgs = [
            "-framerate", fps.toString(),
            "-pattern_type", "glob",
            "-i", "img*.png",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            outputFile
          ];
          break;
        case "webm":
          outputFile = "output.webm";
          ffmpegArgs = [
            "-framerate", fps.toString(),
            "-pattern_type", "glob",
            "-i", "img*.png",
            "-c:v", "libvpx-vp9",
            "-pix_fmt", "yuva420p",
            outputFile
          ];
          break;
        case "gif":
          outputFile = "output.gif";
          ffmpegArgs = [
            "-framerate", fps.toString(),
            "-pattern_type", "glob",
            "-i", "img*.png",
            "-vf", "scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
            outputFile
          ];
          break;
      }

      // Run FFmpeg
      await ffmpeg.exec(ffmpegArgs);

      // Read the output file
      const data = await ffmpeg.readFile(outputFile);
      const blob = new Blob([data], {
        type: format === "gif" ? "image/gif" : `video/${format}`
      });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);

      // Clean up FFmpeg virtual file system
      for (let i = 0; i < images.length; i++) {
        await ffmpeg.deleteFile(`img${i.toString().padStart(4, "0")}.png`);
      }
      await ffmpeg.deleteFile(outputFile);

      setProcessing(false);
      setProgress(100);
    } catch (error) {
      console.error("Error generating video:", error);
      alert("Failed to generate video. Please try again.");
      setProcessing(false);
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;

    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `stop-motion.${format}`;
    link.click();
  };

  const reset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setProgress(0);
  };

  const frameDuration = (1000 / fps).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-indigo-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Stop Motion Video Editor
          </h1>
          <p className="text-gray-400">
            Upload images to create a stop motion animation with configurable timing
          </p>
          {!ffmpegLoaded && (
            <p className="text-yellow-400 mt-2">Loading video processor...</p>
          )}
        </div>

        {images.length === 0 ? (
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-xl text-gray-300 mb-2">
              Click to upload or drag and drop images
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF - Multiple files supported
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">
                Video Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frames Per Second: {fps} ({frameDuration}ms per frame)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower = slower animation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Output Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="mp4">MP4 (Best compatibility)</option>
                    <option value="webm">WebM (Web optimized)</option>
                    <option value="gif">GIF (Animated image)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Frames
                  </label>
                  <div className="text-3xl font-bold text-purple-400">
                    {images.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Duration: {(images.length / fps).toFixed(1)}s
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Add More Images
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={generateVideo}
                  disabled={processing || !ffmpegLoaded || images.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {processing
                    ? `Generating... ${progress}%`
                    : "Generate Video"}
                </button>
                {videoUrl && (
                  <button
                    onClick={downloadVideo}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Download
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

            {/* Progress Bar */}
            {processing && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-purple-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Video Preview */}
            {videoUrl && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Generated Video Preview
                </h3>
                <div className="bg-black rounded overflow-hidden flex justify-center">
                  {format === "gif" ? (
                    <img
                      src={videoUrl}
                      alt="Generated GIF"
                      className="max-w-full h-auto"
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      loop
                      className="max-w-full h-auto"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Image Grid */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-3">
                Frame Sequence (Drag to reorder)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative group bg-gray-700 rounded-lg overflow-hidden"
                  >
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                      {index + 1}
                    </div>
                    <img
                      src={image.preview}
                      alt={`Frame ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => moveImage(index, "up")}
                        disabled={index === 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveImage(index, "down")}
                        disabled={index === images.length - 1}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">
                Tips for Best Results:
              </h3>
              <ul className="text-sm text-purple-200 space-y-1">
                <li>• Use images with the same dimensions for smooth playback</li>
                <li>• Lower FPS (1-5) for traditional stop motion feel</li>
                <li>• Higher FPS (10-30) for smoother animations</li>
                <li>• MP4 format offers best compatibility across devices</li>
                <li>• WebM format is great for web embedding</li>
                <li>• GIF format works everywhere but has larger file sizes</li>
                <li>• Reorder frames using the arrow buttons in each thumbnail</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
