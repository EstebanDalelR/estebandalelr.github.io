"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Color {
  r: number;
  g: number;
  b: number;
}

export default function PaintByNumbers() {
  const [image, setImage] = useState<string | null>(null);
  const [numColors, setNumColors] = useState<number>(8);
  const [processing, setProcessing] = useState(false);
  const [colorPalette, setColorPalette] = useState<Color[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (image) {
      processImage();
    }
  }, [image, numColors]);

  const processImage = async () => {
    if (!image || !canvasRef.current || !originalCanvasRef.current) return;

    setProcessing(true);

    const canvas = canvasRef.current;
    const originalCanvas = originalCanvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const originalCtx = originalCanvas.getContext("2d");

    if (!ctx || !originalCtx) {
      setProcessing(false);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onerror = () => {
      console.error("Failed to load image");
      setProcessing(false);
    };

    img.onload = () => {
      try {
        // Set canvas dimensions
        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / img.width);
        const width = img.width * scale;
        const height = img.height * scale;

        canvas.width = width;
        canvas.height = height;
        originalCanvas.width = width;
        originalCanvas.height = height;

        // Draw original image to original canvas only
        originalCtx.drawImage(img, 0, 0, width, height);

        // Get image data from original canvas
        const imageData = originalCtx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        // Perform color quantization using k-means
        const colors = quantizeColors(pixels, numColors);
        setColorPalette(colors); // Keep original colors for palette display

        // Create paint by numbers version with outlines only
        const paintByNumbersData = createPaintByNumbers(
          pixels,
          colors,
          width,
          height
        );

        // Fill paint-by-numbers canvas with white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        // Draw borders between regions
        drawBorders(ctx, paintByNumbersData.colorMap, width, height);

        // Draw numbers on regions
        drawNumbers(ctx, paintByNumbersData.regions, colors);

        setProcessing(false);
      } catch (error) {
        console.error("Error processing image:", error);
        setProcessing(false);
      }
    };
    img.src = image;
  };

  const quantizeColors = (pixels: Uint8ClampedArray, k: number): Color[] => {
    // Sample pixels for faster processing
    const sampleSize = Math.min(10000, pixels.length / 4);
    const step = Math.floor(pixels.length / 4 / sampleSize);
    const samples: Color[] = [];

    for (let i = 0; i < pixels.length; i += step * 4) {
      samples.push({
        r: pixels[i],
        g: pixels[i + 1],
        b: pixels[i + 2],
      });
    }

    // Initialize centroids randomly
    let centroids: Color[] = [];
    for (let i = 0; i < k; i++) {
      centroids.push(samples[Math.floor(Math.random() * samples.length)]);
    }

    // K-means iterations
    for (let iter = 0; iter < 10; iter++) {
      const clusters: Color[][] = Array.from({ length: k }, () => []);

      // Assign pixels to nearest centroid
      for (const sample of samples) {
        let minDist = Infinity;
        let closestCluster = 0;

        for (let j = 0; j < k; j++) {
          const dist = colorDistance(sample, centroids[j]);
          if (dist < minDist) {
            minDist = dist;
            closestCluster = j;
          }
        }

        clusters[closestCluster].push(sample);
      }

      // Update centroids
      for (let j = 0; j < k; j++) {
        if (clusters[j].length > 0) {
          const avgR =
            clusters[j].reduce((sum, c) => sum + c.r, 0) / clusters[j].length;
          const avgG =
            clusters[j].reduce((sum, c) => sum + c.g, 0) / clusters[j].length;
          const avgB =
            clusters[j].reduce((sum, c) => sum + c.b, 0) / clusters[j].length;
          centroids[j] = { r: avgR, g: avgG, b: avgB };
        }
      }
    }

    return centroids;
  };

  const colorDistance = (c1: Color, c2: Color): number => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2)
    );
  };

  const createPaintByNumbers = (
    pixels: Uint8ClampedArray,
    colors: Color[],
    width: number,
    height: number
  ) => {
    const colorMap = new Uint8Array(width * height);
    const regions: Map<number, { x: number; y: number; count: number }> =
      new Map();

    // Map each pixel to nearest color
    for (let i = 0; i < pixels.length; i += 4) {
      const pixel = { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] };

      let minDist = Infinity;
      let colorIndex = 0;

      for (let j = 0; j < colors.length; j++) {
        const dist = colorDistance(pixel, colors[j]);
        if (dist < minDist) {
          minDist = dist;
          colorIndex = j;
        }
      }

      // Store color index in map
      const pixelIndex = i / 4;
      colorMap[pixelIndex] = colorIndex;

      // Track regions for number placement
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);

      if (!regions.has(colorIndex)) {
        regions.set(colorIndex, { x: 0, y: 0, count: 0 });
      }

      const region = regions.get(colorIndex)!;
      region.x += x;
      region.y += y;
      region.count += 1;
    }

    // Find multiple regions for each color using flood fill sampling
    const detailedRegions = findRegions(colorMap, width, height, colors.length);

    return { colorMap, regions: detailedRegions };
  };

  const findRegions = (
    colorMap: Uint8Array,
    width: number,
    height: number,
    numColors: number
  ) => {
    const visited = new Array(width * height).fill(false);
    const regions: Array<{ colorIndex: number; x: number; y: number }> = [];

    // Sample grid to find region centers
    const sampleStep = Math.max(20, Math.floor(Math.min(width, height) / 20));

    for (let y = 0; y < height; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        const index = y * width + x;
        if (!visited[index]) {
          const colorIndex = colorMap[index];

          // Flood fill to mark this region
          const regionSize = floodFill(
            colorMap,
            visited,
            x,
            y,
            width,
            height,
            colorIndex
          );

          // Only add region if it's significant size
          if (regionSize > 100) {
            regions.push({ colorIndex, x, y });
          }
        }
      }
    }

    return regions;
  };

  const floodFill = (
    colorMap: Uint8Array,
    visited: boolean[],
    startX: number,
    startY: number,
    width: number,
    height: number,
    targetColorIndex: number
  ): number => {
    const stack: Array<{ x: number; y: number }> = [
      { x: startX, y: startY },
    ];
    let size = 0;

    while (stack.length > 0 && size < 10000) {
      const { x, y } = stack.pop()!;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const index = y * width + x;
      if (visited[index]) continue;

      if (colorMap[index] !== targetColorIndex) continue;

      visited[index] = true;
      size++;

      // Add neighbors (4-connected)
      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }

    return size;
  };

  const drawBorders = (
    ctx: CanvasRenderingContext2D,
    colorMap: Uint8Array,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;

    // Draw borders where adjacent pixels have different colors
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const currentColor = colorMap[index];

        // Check right neighbor
        if (x < width - 1) {
          const rightIndex = index + 1;
          if (colorMap[rightIndex] !== currentColor) {
            ctx.beginPath();
            ctx.moveTo(x + 1, y);
            ctx.lineTo(x + 1, y + 1);
            ctx.stroke();
          }
        }

        // Check bottom neighbor
        if (y < height - 1) {
          const bottomIndex = index + width;
          if (colorMap[bottomIndex] !== currentColor) {
            ctx.beginPath();
            ctx.moveTo(x, y + 1);
            ctx.lineTo(x + 1, y + 1);
            ctx.stroke();
          }
        }
      }
    }
  };

  const drawNumbers = (
    ctx: CanvasRenderingContext2D,
    regions: Array<{ colorIndex: number; x: number; y: number }>,
    colors: Color[]
  ) => {
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    regions.forEach((region) => {
      const number = (region.colorIndex + 1).toString();

      // Draw white outline for visibility
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 4;
      ctx.strokeText(number, region.x, region.y);

      // Draw black text
      ctx.fillStyle = "#000000";
      ctx.fillText(number, region.x, region.y);
    });
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "paint-by-numbers.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Paint by Numbers Generator
          </h1>
          <p className="text-gray-600">
            Upload an image and convert it to a paint by numbers artwork
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col items-center gap-4">
            <label className="w-full">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload an image
                </p>
              </div>
            </label>

            {/* Color Control */}
            {image && (
              <div className="w-full max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Colors: {numColors}
                </label>
                <input
                  type="range"
                  min="4"
                  max="12"
                  value={numColors}
                  onChange={(e) => setNumColors(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>4</span>
                  <span>12</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Processing Indicator */}
        {processing && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Processing image...</p>
          </div>
        )}

        {/* Results */}
        {image && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Original
              </h2>
              <canvas
                ref={originalCanvasRef}
                className="w-full border border-gray-200 rounded"
              />
            </div>

            {/* Paint by Numbers */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  Paint by Numbers
                </h2>
                <button
                  onClick={downloadImage}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                >
                  Download
                </button>
              </div>
              <canvas
                ref={canvasRef}
                className="w-full border border-gray-200 rounded mb-4"
              />

              {/* Color Palette */}
              {colorPalette.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Color Palette
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {colorPalette.map((color, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-50 rounded p-2"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded font-bold text-sm border border-gray-300">
                          {index + 1}
                        </div>
                        <div
                          className="w-12 h-8 rounded border border-gray-300"
                          style={{
                            backgroundColor: `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
