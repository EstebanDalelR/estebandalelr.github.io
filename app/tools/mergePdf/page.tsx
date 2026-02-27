"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | File[]) => {
    const pdfFiles = Array.from(newFiles).filter(
      (f) => f.type === "application/pdf"
    );
    if (pdfFiles.length === 0) {
      setError("Please select PDF files only.");
      return;
    }
    setFiles((prev) => [...prev, ...pdfFiles]);
    setMergedUrl(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedUrl(null);
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= files.length) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    setFiles(newFiles);
    setMergedUrl(null);
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }

    setMerging(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
    } catch (err) {
      console.error("Merge error:", err);
      setError("Failed to merge PDFs. Make sure all files are valid PDFs.");
    } finally {
      setMerging(false);
    }
  };

  const downloadMerged = () => {
    if (!mergedUrl) return;
    const link = document.createElement("a");
    link.href = mergedUrl;
    link.download = "merged.pdf";
    link.click();
  };

  const reset = () => {
    setFiles([]);
    setMergedUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Merge PDF</h1>
          <p className="text-gray-300">
            Combine multiple PDF files into a single document
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-4 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-800/50 mb-6"
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
            Click to add PDFs or drag and drop
          </p>
          <p className="text-sm text-gray-500">
            Add multiple PDF files to merge them into one
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Files to Merge ({files.length})
            </h2>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-purple-400 font-mono text-sm font-bold shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-white truncate">{file.name}</span>
                    <span className="text-gray-400 text-sm shrink-0">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveFile(index, -1);
                      }}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-white disabled:opacity-30 p-1"
                      title="Move up"
                    >
                      &uarr;
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveFile(index, 1);
                      }}
                      disabled={index === files.length - 1}
                      className="text-gray-400 hover:text-white disabled:opacity-30 p-1"
                      title="Move down"
                    >
                      &darr;
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-red-400 hover:text-red-300 p-1 ml-2"
                      title="Remove"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              {!mergedUrl ? (
                <button
                  onClick={mergePdfs}
                  disabled={merging || files.length < 2}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {merging ? "Merging..." : "Merge PDFs"}
                </button>
              ) : (
                <button
                  onClick={downloadMerged}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Download Merged PDF
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
        )}

        {/* Info */}
        <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-purple-300 mb-2">
            About this tool:
          </h3>
          <ul className="text-sm text-purple-200 space-y-1">
            <li>• All processing happens in your browser - no files are uploaded</li>
            <li>• Your files never leave your device</li>
            <li>• Drag files to reorder them before merging</li>
            <li>• Supports any standard PDF file</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
