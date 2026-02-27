"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<"range" | "single" | "every">(
    "range"
  );
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);
  const [splitting, setSplitting] = useState(false);
  const [resultUrls, setResultUrls] = useState<
    { url: string; name: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdf = async (pdfFile: File) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const count = pdf.getPageCount();
      setPageCount(count);
      setRangeStart(1);
      setRangeEnd(count);
      setFile(pdfFile);
      setResultUrls([]);
      setError(null);
    } catch {
      setError("Failed to read PDF. Make sure it is a valid PDF file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === "application/pdf") {
      loadPdf(f);
    } else if (f) {
      setError("Please select a PDF file.");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") {
      loadPdf(f);
    } else if (f) {
      setError("Please drop a PDF file.");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const extractPages = async (indices: number[]): Promise<Uint8Array> => {
    if (!file) throw new Error("No file");
    const arrayBuffer = await file.arrayBuffer();
    const srcPdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(srcPdf, indices);
    pages.forEach((page) => newPdf.addPage(page));
    return newPdf.save();
  };

  const splitPdf = async () => {
    if (!file) return;

    setSplitting(true);
    setError(null);
    setResultUrls([]);

    try {
      const baseName = file.name.replace(/\.pdf$/i, "");
      const results: { url: string; name: string }[] = [];

      if (splitMode === "range") {
        if (rangeStart < 1 || rangeEnd > pageCount || rangeStart > rangeEnd) {
          setError(
            `Invalid range. Enter pages between 1 and ${pageCount}.`
          );
          setSplitting(false);
          return;
        }
        const indices = [];
        for (let i = rangeStart - 1; i < rangeEnd; i++) {
          indices.push(i);
        }
        const bytes = await extractPages(indices);
        const blob = new Blob([bytes], { type: "application/pdf" });
        results.push({
          url: URL.createObjectURL(blob),
          name: `${baseName}_pages_${rangeStart}-${rangeEnd}.pdf`,
        });
      } else if (splitMode === "single") {
        // Extract every page as individual PDF
        for (let i = 0; i < pageCount; i++) {
          const bytes = await extractPages([i]);
          const blob = new Blob([bytes], { type: "application/pdf" });
          results.push({
            url: URL.createObjectURL(blob),
            name: `${baseName}_page_${i + 1}.pdf`,
          });
        }
      } else if (splitMode === "every") {
        // Split into chunks: odd pages / even pages
        const oddIndices = [];
        const evenIndices = [];
        for (let i = 0; i < pageCount; i++) {
          if (i % 2 === 0) oddIndices.push(i);
          else evenIndices.push(i);
        }
        if (oddIndices.length > 0) {
          const bytes = await extractPages(oddIndices);
          const blob = new Blob([bytes], { type: "application/pdf" });
          results.push({
            url: URL.createObjectURL(blob),
            name: `${baseName}_odd_pages.pdf`,
          });
        }
        if (evenIndices.length > 0) {
          const bytes = await extractPages(evenIndices);
          const blob = new Blob([bytes], { type: "application/pdf" });
          results.push({
            url: URL.createObjectURL(blob),
            name: `${baseName}_even_pages.pdf`,
          });
        }
      }

      setResultUrls(results);
    } catch (err) {
      console.error("Split error:", err);
      setError("Failed to split PDF. Please try again.");
    } finally {
      setSplitting(false);
    }
  };

  const downloadFile = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
  };

  const downloadAll = () => {
    resultUrls.forEach(({ url, name }) => downloadFile(url, name));
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setResultUrls([]);
    setError(null);
    setSplitMode("range");
    setRangeStart(1);
    setRangeEnd(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-cyan-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Split PDF</h1>
          <p className="text-gray-300">
            Extract pages or split a PDF into separate files
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Drop zone */}
        {!file && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-cyan-500 transition-colors bg-gray-800/50 mb-6"
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-xl text-gray-300 mb-2">
              Click to upload or drag and drop a PDF
            </p>
            <p className="text-sm text-gray-500">Select a PDF file to split</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Split controls */}
        {file && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {file.name}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {pageCount} page{pageCount !== 1 ? "s" : ""} &middot;{" "}
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Change file
                </button>
              </div>

              {/* Split mode */}
              <h3 className="text-lg font-semibold text-white mb-3">
                Split Mode
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => setSplitMode("range")}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    splitMode === "range"
                      ? "border-cyan-500 bg-cyan-900/30"
                      : "border-gray-600 bg-gray-700 hover:border-gray-500"
                  }`}
                >
                  <p className="text-white font-medium">Page Range</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Extract a range of pages
                  </p>
                </button>
                <button
                  onClick={() => setSplitMode("single")}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    splitMode === "single"
                      ? "border-cyan-500 bg-cyan-900/30"
                      : "border-gray-600 bg-gray-700 hover:border-gray-500"
                  }`}
                >
                  <p className="text-white font-medium">Individual Pages</p>
                  <p className="text-gray-400 text-sm mt-1">
                    One PDF per page
                  </p>
                </button>
                <button
                  onClick={() => setSplitMode("every")}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    splitMode === "every"
                      ? "border-cyan-500 bg-cyan-900/30"
                      : "border-gray-600 bg-gray-700 hover:border-gray-500"
                  }`}
                >
                  <p className="text-white font-medium">Odd / Even</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Split odd and even pages
                  </p>
                </button>
              </div>

              {/* Range inputs */}
              {splitMode === "range" && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      From page
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={rangeStart}
                      onChange={(e) =>
                        setRangeStart(
                          Math.max(1, Math.min(pageCount, Number(e.target.value)))
                        )
                      }
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      To page
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={rangeEnd}
                      onChange={(e) =>
                        setRangeEnd(
                          Math.max(1, Math.min(pageCount, Number(e.target.value)))
                        )
                      }
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={splitPdf}
                  disabled={splitting}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {splitting ? "Splitting..." : "Split PDF"}
                </button>
                <button
                  onClick={reset}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Results */}
            {resultUrls.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    Results ({resultUrls.length} file
                    {resultUrls.length !== 1 ? "s" : ""})
                  </h2>
                  {resultUrls.length > 1 && (
                    <button
                      onClick={downloadAll}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      Download All
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {resultUrls.map(({ url, name }) => (
                    <div
                      key={name}
                      className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-3"
                    >
                      <span className="text-white truncate mr-4">{name}</span>
                      <button
                        onClick={() => downloadFile(url, name)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-1 px-4 rounded-lg text-sm transition-colors shrink-0"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-cyan-900/30 border border-cyan-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-cyan-300 mb-2">
                About this tool:
              </h3>
              <ul className="text-sm text-cyan-200 space-y-1">
                <li>
                  • All processing happens in your browser - no files are
                  uploaded
                </li>
                <li>• Your files never leave your device</li>
                <li>• Extract a range, individual pages, or odd/even pages</li>
                <li>• Supports any standard PDF file</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
