"use client";
import { useState, useEffect } from "react";

export default function TextDiff() {
  const [text1, setText1] = useState("");
  const [splitText1, setSplitText1] = useState<string[]>([]);
  const [text2, setText2] = useState("");
  const [splitText2, setSplitText2] = useState<string[]>([]);

  const [diffLines, setDiffLines] = useState<Set<number>>(new Set());

  const calculateDiff = () => {
    // go row per row checking diff
    const rows1 = text1.split("\n");
    const rows2 = text2.split("\n");
    setSplitText1(rows1);
    setSplitText2(rows2);
    const differentLines = new Set<number>();

    for (let i = 0; i < Math.max(rows1.length, rows2.length); i++) {
      if (rows1[i] !== rows2[i]) {
        differentLines.add(i);
      }
    }
    setDiffLines(differentLines);
  };

  // Real-time diff calculation
  useEffect(() => {
    calculateDiff();
  }, [text1, text2]);

  const handleText1Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText1(e.target.value);
  };
  const handleText2Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText2(e.target.value);
  };

  const renderTextWithHighlighting = (text: string, isText1: boolean) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      const isDifferent = diffLines.has(index);
      return (
        <div
          key={index}
          className={`font-mono whitespace-pre-wrap flex ${
            isDifferent ? "bg-red-200" : ""
          }`}
        >
          <span className="text-gray-500 pr-2 select-none min-w-[3rem] text-right">
            {index + 1}
          </span>
          <span className="flex-1">{line || " "}</span>
        </div>
      );
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h1>Text Diff</h1>

      <div className="flex flex-row gap-4 w-full">
        <textarea
          value={text1}
          rows={10}
          cols={50}
          onChange={handleText1Change}
          className="border-2 border-gray-300 rounded-md p-2 font-mono w-1/2"
          placeholder="Enter first text here..."
        />
        <textarea
          value={text2}
          rows={10}
          cols={50}
          onChange={handleText2Change}
          className="border-2 border-gray-300 rounded-md p-2 font-mono w-1/2"
          placeholder="Enter second text here..."
        />
      </div>
      <div className="flex flex-row gap-4">
        <span> lines: {splitText1.length}</span>
        <span> diff lines: {diffLines.size}</span>
        <span> lines: {splitText2.length}</span>
      </div>
      <div className="flex flex-row gap-4 w-full justify-between">
        <div className="border-2 border-gray-300 rounded-md p-2 overflow-auto w-1/2">
          {renderTextWithHighlighting(text1, true)}
        </div>
        <div className="border-2 border-gray-300 rounded-md p-2 overflow-auto w-1/2">
          {renderTextWithHighlighting(text2, false)}
        </div>
      </div>
    </div>
  );
}
