"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRCodeGenerator() {
  const [text, setText] = useState("https://estebandalelr.github.io");
  const [size, setSize] = useState(256);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [text, size, errorCorrection, foregroundColor, backgroundColor]);

  const generateQRCode = async () => {
    if (!text || !canvasRef.current) return;

    try {
      await QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorCorrection,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
      });

      // Generate data URL for download
      const dataUrl = canvasRef.current.toDataURL();
      setQrCodeUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrCodeUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((blob) => {
          resolve(blob!);
        });
      });

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      alert("QR code copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Failed to copy QR code to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            QR Code Generator
          </h1>
          <p className="text-gray-300 text-lg">
            Create custom QR codes with ease. Enter your text or URL below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Text or URL
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter text or URL to encode..."
              />
            </div>

            {/* Size Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Size: {size}px
              </label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Error Correction Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Error Correction Level
              </label>
              <select
                value={errorCorrection}
                onChange={(e) =>
                  setErrorCorrection(e.target.value as "L" | "M" | "Q" | "H")
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Foreground
                </label>
                <input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-full h-10 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Background
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-md p-4">
              <h3 className="text-sm font-semibold text-blue-300 mb-2">
                Tips:
              </h3>
              <ul className="text-xs text-blue-200 space-y-1">
                <li>• Higher error correction allows damaged codes to be read</li>
                <li>• Keep text short for smaller QR codes</li>
                <li>• Ensure good contrast between colors</li>
                <li>• Test your QR code with multiple scanners</li>
              </ul>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>

            <div className="flex justify-center items-center mb-6 bg-gray-700 rounded-lg p-8">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={downloadQRCode}
                disabled={!text}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Download PNG
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!text}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Copy to Clipboard
              </button>
            </div>

            {/* Stats */}
            {text && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Information:
                </h3>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Characters: {text.length}</p>
                  <p>Dimensions: {size}x{size}px</p>
                  <p>Error Correction: {errorCorrection}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            What can you encode?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">URLs</h4>
              <p className="text-sm">
                Websites, social media profiles, online resources
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Contact Info</h4>
              <p className="text-sm">
                vCard format, email addresses, phone numbers
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Plain Text</h4>
              <p className="text-sm">
                Messages, WiFi credentials, any text data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
