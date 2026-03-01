"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Tab = "convert" | "bw" | "recolorize" | "split";

const SUGGESTIONS = [
  "Convert a PNG to WebP for up to 30% smaller file sizes",
  "Turn a color portrait into a timeless black & white photo",
  "Give a grayscale image new life with a warm sepia tone",
  "Split a panorama into three printable side-by-side panels",
  "Create a dramatic duotone effect for modern poster design",
  "Convert your logo to JPG for use in email signatures",
  "Split a photo into 9 pieces for an Instagram grid post",
  "Use a cool blue duotone to give photos a cinematic feel",
  "Convert screenshots to PNG for lossless quality",
  "Make a 2x2 split for a multi-frame wall print",
];

const FORMATS = ["png", "jpeg", "webp"] as const;
type Format = (typeof FORMATS)[number];

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export default function ImageConverter() {
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("image");
  const [activeTab, setActiveTab] = useState<Tab>("convert");
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  // Convert state
  const [outputFormat, setOutputFormat] = useState<Format>("png");
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);

  // B&W state
  const [bwUrl, setBwUrl] = useState<string | null>(null);

  // Recolorize state
  const [shadowColor, setShadowColor] = useState("#1a1a2e");
  const [highlightColor, setHighlightColor] = useState("#e8d5b7");
  const [recolorizedUrl, setRecolorizedUrl] = useState<string | null>(null);

  // Split state
  const [splitRows, setSplitRows] = useState(2);
  const [splitCols, setSplitCols] = useState(2);
  const [splitPieces, setSplitPieces] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenCanvas = useRef<HTMLCanvasElement>(null);

  // Idle suggestion ticker
  useEffect(() => {
    if (image) return;
    const interval = setInterval(() => {
      setSuggestionIndex((i) => (i + 1) % SUGGESTIONS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [image]);

  const loadImageOntoCanvas = useCallback(
    (src: string, cb: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) => {
      const img = new Image();
      img.onload = () => {
        const canvas = hiddenCanvas.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        cb(ctx, img.width, img.height);
      };
      img.src = src;
    },
    []
  );

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setImageName(file.name.replace(/\.[^/.]+$/, ""));
      setConvertedUrl(null);
      setBwUrl(null);
      setRecolorizedUrl(null);
      setSplitPieces([]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // ── Convert ──────────────────────────────────────────────────────────────
  const convertImage = () => {
    if (!image) return;
    loadImageOntoCanvas(image, (ctx, w, h) => {
      const canvas = hiddenCanvas.current!;
      const mimeType = outputFormat === "jpeg" ? "image/jpeg" : `image/${outputFormat}`;
      const quality = outputFormat === "jpeg" ? 0.92 : undefined;
      setConvertedUrl(canvas.toDataURL(mimeType, quality));
    });
  };

  // ── Black & White ─────────────────────────────────────────────────────────
  const convertBW = () => {
    if (!image) return;
    loadImageOntoCanvas(image, (ctx, w, h) => {
      const canvas = hiddenCanvas.current!;
      const data = ctx.getImageData(0, 0, w, h);
      const px = data.data;
      for (let i = 0; i < px.length; i += 4) {
        const gray = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
        px[i] = px[i + 1] = px[i + 2] = gray;
      }
      ctx.putImageData(data, 0, 0);
      setBwUrl(canvas.toDataURL("image/png"));
    });
  };

  // ── Recolorize (duotone) ──────────────────────────────────────────────────
  const recolorize = () => {
    if (!image) return;
    const [sr, sg, sb] = hexToRgb(shadowColor);
    const [hr, hg, hb] = hexToRgb(highlightColor);
    loadImageOntoCanvas(image, (ctx, w, h) => {
      const canvas = hiddenCanvas.current!;
      const data = ctx.getImageData(0, 0, w, h);
      const px = data.data;
      for (let i = 0; i < px.length; i += 4) {
        const t = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) / 255;
        px[i] = Math.round(sr + (hr - sr) * t);
        px[i + 1] = Math.round(sg + (hg - sg) * t);
        px[i + 2] = Math.round(sb + (hb - sb) * t);
      }
      ctx.putImageData(data, 0, 0);
      setRecolorizedUrl(canvas.toDataURL("image/png"));
    });
  };

  // ── Split ─────────────────────────────────────────────────────────────────
  const splitImage = () => {
    if (!image) return;
    const img = new Image();
    img.onload = () => {
      const pieceW = Math.floor(img.width / splitCols);
      const pieceH = Math.floor(img.height / splitRows);
      const pieces: string[] = [];
      for (let row = 0; row < splitRows; row++) {
        for (let col = 0; col < splitCols; col++) {
          const c = document.createElement("canvas");
          c.width = pieceW;
          c.height = pieceH;
          c.getContext("2d")!.drawImage(img, col * pieceW, row * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);
          pieces.push(c.toDataURL("image/png"));
        }
      }
      setSplitPieces(pieces);
    };
    img.src = image;
  };

  const downloadAll = () => {
    splitPieces.forEach((url, i) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${imageName}_piece_${i + 1}.png`;
      a.click();
    });
  };

  const downloadSingle = (url: string, suffix: string, ext: string = "png") => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${imageName}_${suffix}.${ext}`;
    a.click();
  };

  const reset = () => {
    setImage(null);
    setConvertedUrl(null);
    setBwUrl(null);
    setRecolorizedUrl(null);
    setSplitPieces([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "convert", label: "Convert Format" },
    { id: "bw", label: "Black & White" },
    { id: "recolorize", label: "Recolorize" },
    { id: "split", label: "Split" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Image Converter</h1>
          <p className="text-slate-300">
            Convert formats, go black &amp; white, recolorize, or split — all in your browser.
          </p>
        </div>

        {/* Idle suggestions */}
        {!image && (
          <div className="bg-purple-800/30 border border-purple-600/40 rounded-xl p-4 mb-6 text-center transition-all">
            <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Idea</p>
            <p className="text-purple-100 text-sm italic transition-all duration-700">
              {SUGGESTIONS[suggestionIndex]}
            </p>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl mb-6 backdrop-blur">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload area */}
        {!image ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 hover:border-purple-500 rounded-xl p-14 text-center cursor-pointer transition-colors bg-slate-800/40"
          >
            <svg className="mx-auto h-14 w-14 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-300 text-lg mb-1">Click or drag & drop an image</p>
            <p className="text-slate-500 text-sm">PNG, JPG, WebP, GIF supported</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image preview strip */}
            <div className="bg-slate-800/60 rounded-xl p-4 flex items-center gap-4">
              <img src={image} alt="source" className="h-20 w-20 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{imageName}</p>
                <p className="text-slate-400 text-sm">Image loaded</p>
              </div>
              <button onClick={reset} className="text-slate-400 hover:text-red-400 transition-colors text-sm">
                ✕ Remove
              </button>
            </div>

            {/* ── CONVERT TAB ── */}
            {activeTab === "convert" && (
              <div className="bg-slate-800/60 rounded-xl p-6 space-y-4">
                <h2 className="text-white font-semibold text-lg">Convert Format</h2>
                <div className="flex items-center gap-4">
                  <label className="text-slate-300 text-sm">Output format:</label>
                  <div className="flex gap-2">
                    {FORMATS.map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => { setOutputFormat(fmt); setConvertedUrl(null); }}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium uppercase transition-all ${
                          outputFormat === fmt
                            ? "bg-purple-600 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {fmt === "jpeg" ? "JPG" : fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={convertImage}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Convert to {outputFormat === "jpeg" ? "JPG" : outputFormat.toUpperCase()}
                </button>
                {convertedUrl && (
                  <div className="space-y-3">
                    <img src={convertedUrl} alt="converted" className="w-full rounded-lg" />
                    <button
                      onClick={() => downloadSingle(convertedUrl, "converted", outputFormat === "jpeg" ? "jpg" : outputFormat)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      Download {outputFormat === "jpeg" ? "JPG" : outputFormat.toUpperCase()}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── B&W TAB ── */}
            {activeTab === "bw" && (
              <div className="bg-slate-800/60 rounded-xl p-6 space-y-4">
                <h2 className="text-white font-semibold text-lg">Black & White</h2>
                <p className="text-slate-400 text-sm">Convert your image to grayscale using luminance-weighted averaging.</p>
                <button
                  onClick={convertBW}
                  className="w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Convert to Black & White
                </button>
                {bwUrl && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Original</p>
                        <img src={image!} alt="original" className="w-full rounded-lg" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Black & White</p>
                        <img src={bwUrl} alt="b&w" className="w-full rounded-lg" />
                      </div>
                    </div>
                    <button
                      onClick={() => downloadSingle(bwUrl, "bw")}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      Download B&W Image
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── RECOLORIZE TAB ── */}
            {activeTab === "recolorize" && (
              <div className="bg-slate-800/60 rounded-xl p-6 space-y-4">
                <h2 className="text-white font-semibold text-lg">Recolorize (Duotone)</h2>
                <p className="text-slate-400 text-sm">
                  Map shadow pixels to one color and highlight pixels to another for a duotone effect.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Shadow color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={shadowColor}
                        onChange={(e) => { setShadowColor(e.target.value); setRecolorizedUrl(null); }}
                        className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-slate-400 text-sm font-mono">{shadowColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Highlight color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={highlightColor}
                        onChange={(e) => { setHighlightColor(e.target.value); setRecolorizedUrl(null); }}
                        className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-slate-400 text-sm font-mono">{highlightColor}</span>
                    </div>
                  </div>
                </div>
                {/* Preset palettes */}
                <div>
                  <p className="text-slate-400 text-xs mb-2">Quick presets:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Sepia", s: "#2c1810", h: "#f5deb3" },
                      { label: "Blueprint", s: "#0a1628", h: "#4a90d9" },
                      { label: "Forest", s: "#0d2c1e", h: "#a8d5a2" },
                      { label: "Sunset", s: "#1a0a2e", h: "#ff6b35" },
                      { label: "Noir", s: "#000000", h: "#ffffff" },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => { setShadowColor(p.s); setHighlightColor(p.h); setRecolorizedUrl(null); }}
                        className="px-3 py-1 text-xs rounded-full text-white font-medium transition-all hover:opacity-90"
                        style={{ background: `linear-gradient(to right, ${p.s}, ${p.h})` }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={recolorize}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Apply Recolorize
                </button>
                {recolorizedUrl && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Original</p>
                        <img src={image!} alt="original" className="w-full rounded-lg" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Recolorized</p>
                        <img src={recolorizedUrl} alt="recolorized" className="w-full rounded-lg" />
                      </div>
                    </div>
                    <button
                      onClick={() => downloadSingle(recolorizedUrl, "duotone")}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      Download Recolorized Image
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── SPLIT TAB ── */}
            {activeTab === "split" && (
              <div className="bg-slate-800/60 rounded-xl p-6 space-y-4">
                <h2 className="text-white font-semibold text-lg">Split Image</h2>
                <p className="text-slate-400 text-sm">Divide your image into a grid of equal pieces.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Rows: {splitRows}</label>
                    <input
                      type="range" min={1} max={6} value={splitRows}
                      onChange={(e) => { setSplitRows(Number(e.target.value)); setSplitPieces([]); }}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Columns: {splitCols}</label>
                    <input
                      type="range" min={1} max={6} value={splitCols}
                      onChange={(e) => { setSplitCols(Number(e.target.value)); setSplitPieces([]); }}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
                <p className="text-slate-500 text-xs">
                  Will produce {splitRows * splitCols} piece{splitRows * splitCols !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={splitImage}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Split Image
                </button>
                {splitPieces.length > 0 && (
                  <div className="space-y-3">
                    <div
                      className="grid gap-2"
                      style={{ gridTemplateColumns: `repeat(${splitCols}, 1fr)` }}
                    >
                      {splitPieces.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt={`piece ${i + 1}`} className="w-full rounded" />
                          <button
                            onClick={() => downloadSingle(url, `piece_${i + 1}`)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded text-white text-xs font-medium"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={downloadAll}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      Download All {splitPieces.length} Pieces
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hidden processing canvas */}
        <canvas ref={hiddenCanvas} className="hidden" />
      </div>
    </div>
  );
}
