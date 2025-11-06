"use client";
import { useState, useRef } from "react";
import ImageTracer from "imagetracerjs";

export default function EmbroideryTracer() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [colorSvg, setColorSvg] = useState<string | null>(null);
  const [monochromesvg, setMonochromeSvg] = useState<string | null>(null);
  const [lineSvg, setLineSvg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setUploadedImage(imageDataUrl);
        processImage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const processImage = (imageDataUrl: string) => {
    setIsProcessing(true);
    setColorSvg(null);
    setMonochromeSvg(null);
    setLineSvg(null);

    // Process for color trace
    const colorOptions = {
      ltres: 0.01,
      qtres: 1,
      pathomit: 8,
      colorsampling: 1,
      numberofcolors: 16,
      mincolorratio: 0.02,
      colorquantcycles: 3,
      scale: 1,
      strokewidth: 1,
      blurradius: 0,
      blurdelta: 20,
    };

    // Process for monochrome trace
    const monochromeOptions = {
      ltres: 0.01,
      qtres: 1,
      pathomit: 8,
      colorsampling: 0,
      numberofcolors: 2,
      mincolorratio: 0.02,
      colorquantcycles: 3,
      scale: 1,
      strokewidth: 1,
      blurradius: 0,
      blurdelta: 20,
    };

    // Process for line art (edges only)
    const lineOptions = {
      ltres: 0.01,
      qtres: 1,
      pathomit: 8,
      colorsampling: 0,
      numberofcolors: 2,
      mincolorratio: 0,
      colorquantcycles: 3,
      scale: 1,
      strokewidth: 2,
      linefilter: true,
      blurradius: 2,
      blurdelta: 20,
    };

    let colorDone = false;
    let monochromeDone = false;
    let lineDone = false;

    const checkComplete = () => {
      if (colorDone && monochromeDone && lineDone) {
        setIsProcessing(false);
      }
    };

    try {
      // Generate color SVG with callback
      ImageTracer.imageToSVG(
        imageDataUrl,
        (svgString: string) => {
          setColorSvg(svgString);
          colorDone = true;
          checkComplete();
        },
        colorOptions
      );

      // Generate monochrome SVG with callback
      ImageTracer.imageToSVG(
        imageDataUrl,
        (svgString: string) => {
          setMonochromeSvg(svgString);
          monochromeDone = true;
          checkComplete();
        },
        monochromeOptions
      );

      // Generate line art SVG with callback
      ImageTracer.imageToSVG(
        imageDataUrl,
        (svgString: string) => {
          setLineSvg(svgString);
          lineDone = true;
          checkComplete();
        },
        lineOptions
      );
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Error processing image. Please try a different image.");
      setIsProcessing(false);
    }
  };

  const downloadSvg = (svgString: string, filename: string) => {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setColorSvg(null);
    setMonochromeSvg(null);
    setLineSvg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-4 gap-6">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-2">
          Embroidery Trace Generator
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Upload an image to generate traced SVG paths for embroidery - color, monochrome, and line art
        </p>

        {/* Upload Area */}
        {!uploadedImage && (
          <div
            className={`border-4 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <svg
                className="w-16 h-16 text-gray-400"
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
              <div>
                <p className="text-xl font-semibold text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex flex-col items-center gap-4 p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
            <p className="text-lg font-semibold text-gray-700">
              Processing image...
            </p>
          </div>
        )}

        {/* Results */}
        {uploadedImage && !isProcessing && (
          <div className="flex flex-col gap-6">
            {/* Original Image */}
            <div className="border-2 border-gray-300 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">Original Image</h2>
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Upload New Image
                </button>
              </div>
              <div className="bg-white p-4 rounded flex justify-center">
                <img
                  src={uploadedImage}
                  alt="Original"
                  className="max-w-full max-h-96 object-contain"
                />
              </div>
            </div>

            {/* Color Trace */}
            {colorSvg && (
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold">Color Trace</h2>
                  <button
                    onClick={() => downloadSvg(colorSvg, "embroidery-color.svg")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Download Color SVG
                  </button>
                </div>
                <div className="bg-white p-4 rounded flex justify-center">
                  <div
                    dangerouslySetInnerHTML={{ __html: colorSvg }}
                    className="max-w-full"
                  />
                </div>
              </div>
            )}

            {/* Monochrome Trace */}
            {monochromesvg && (
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold">Monochrome Trace</h2>
                  <button
                    onClick={() =>
                      downloadSvg(monochromesvg, "embroidery-monochrome.svg")
                    }
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Download Monochrome SVG
                  </button>
                </div>
                <div className="bg-white p-4 rounded flex justify-center">
                  <div
                    dangerouslySetInnerHTML={{ __html: monochromesvg }}
                    className="max-w-full"
                  />
                </div>
              </div>
            )}

            {/* Line Art Trace */}
            {lineSvg && (
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold">Line Art (Outlines Only)</h2>
                  <button
                    onClick={() =>
                      downloadSvg(lineSvg, "embroidery-lines.svg")
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Download Line Art SVG
                  </button>
                </div>
                <div className="bg-white p-4 rounded flex justify-center">
                  <div
                    dangerouslySetInnerHTML={{ __html: lineSvg }}
                    className="max-w-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="w-full max-w-6xl mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-2">How to use:</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Upload an image by clicking or dragging it into the upload area</li>
          <li>
            The image will be automatically processed to create three versions: color, monochrome, and line art
          </li>
          <li>
            Color trace preserves the original colors (great for colorful
            embroidery designs)
          </li>
          <li>
            Monochrome trace converts to black and white (perfect for single-color
            embroidery)
          </li>
          <li>
            Line art shows only the outlines and edges (ideal for outline stitching)
          </li>
          <li>Download the SVG files to use with your embroidery software</li>
          <li>
            SVG files can be scaled to any size without losing quality
          </li>
        </ul>
      </div>
    </div>
  );
}
