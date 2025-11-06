"use client";

import { useState, useRef, useEffect } from "react";

export default function ImageTrace() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(128);
  const [edgeStrength, setEdgeStrength] = useState<number>(1.5);
  const [invert, setInvert] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Process image when parameters change
  useEffect(() => {
    if (image) {
      processImage();
    }
  }, [image, threshold, edgeStrength, invert]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const processImage = () => {
    if (!image || !canvasRef.current) return;

    setProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert to grayscale
      const grayscale = new Uint8ClampedArray(canvas.width * canvas.height);
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        grayscale[i / 4] = gray;
      }

      // Apply Sobel edge detection
      const edges = sobelEdgeDetection(
        grayscale,
        canvas.width,
        canvas.height,
        edgeStrength
      );

      // Apply threshold
      for (let i = 0; i < edges.length; i++) {
        const value = edges[i] > threshold ? 255 : 0;
        const finalValue = invert ? 255 - value : value;
        const idx = i * 4;
        data[idx] = finalValue;
        data[idx + 1] = finalValue;
        data[idx + 2] = finalValue;
        data[idx + 3] = 255;
      }

      // Put processed image back
      ctx.putImageData(imageData, 0, 0);

      // Convert to data URL
      setProcessedImage(canvas.toDataURL("image/png"));
      setProcessing(false);
    };

    img.src = image;
  };

  const sobelEdgeDetection = (
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    strength: number
  ): Uint8ClampedArray => {
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];

    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ];

    const result = new Uint8ClampedArray(width * height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0;
        let gy = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = (y + ky) * width + (x + kx);
            const pixel = pixels[pixelIndex];
            gx += pixel * sobelX[ky + 1][kx + 1];
            gy += pixel * sobelY[ky + 1][kx + 1];
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy) * strength;
        result[y * width + x] = Math.min(255, magnitude);
      }
    }

    return result;
  };

  const downloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "laser-trace.png";
    link.click();
  };

  const resetImage = () => {
    setImage(null);
    setProcessedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Laser Etching Image Tracer
          </h1>
          <p className="text-gray-400">
            Upload an image to convert it to a traced outline perfect for laser etching
          </p>
        </div>

        {!image ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-800/50"
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
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">
                Tracing Controls
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Threshold: {threshold}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower = more details
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Edge Strength: {edgeStrength.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={edgeStrength}
                    onChange={(e) => setEdgeStrength(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Higher = bolder lines
                  </p>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={invert}
                      onChange={(e) => setInvert(e.target.checked)}
                      className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-300">
                      Invert Colors
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={downloadImage}
                  disabled={!processedImage || processing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {processing ? "Processing..." : "Download Traced Image"}
                </button>
                <button
                  onClick={resetImage}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Image Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Original Image
                </h3>
                <div className="bg-white rounded overflow-hidden">
                  <img
                    src={image}
                    alt="Original"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Traced for Laser Etching
                </h3>
                <div className="bg-white rounded overflow-hidden">
                  {processedImage ? (
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      Processing...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-300 mb-2">
                💡 Tips for Best Results:
              </h3>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Use high contrast images for clearer traces</li>
                <li>• Adjust threshold to control detail level</li>
                <li>• Increase edge strength for more pronounced lines</li>
                <li>• Invert colors if your laser etcher requires white lines</li>
                <li>• Download as PNG for direct use with laser software</li>
              </ul>
            </div>
          </div>
        )}

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
