"use client";
import { useState, useEffect } from "react";

const TextWithHighlighting = ({
  lines,
  diffLines,
}: {
  lines: string[];
  diffLines: Set<number>;
}) => {
  return (
    <>
      {lines.map((line, index) => {
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
      })}
    </>
  );
};

export default function TextDiff() {
  const [text1, setText1] = useState("");
  const [splitText1, setSplitText1] = useState<string[]>([]);
  const [text2, setText2] = useState("");
  const [splitText2, setSplitText2] = useState<string[]>([]);

  const [diffLines, setDiffLines] = useState<Set<number>>(new Set());

  const calculateDiff = () => {
    // go row per row checking diff
    const differentLines = new Set<number>();

    for (let i = 0; i < Math.max(splitText1.length, splitText2.length); i++) {
      if (splitText1[i] !== splitText2[i]) {
        differentLines.add(i);
      }
    }
    setDiffLines(differentLines);
  };

  // Real-time diff calculation
  useEffect(() => {
    calculateDiff();
  }, [splitText1, splitText2, text1, text2]);

  const handleText1Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText1(newValue);
    setSplitText1(newValue.split("\n"));
  };
  const handleText2Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText2(newValue);
    setSplitText2(newValue.split("\n"));
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h1>Text Diff</h1>

      <div className="flex flex-row gap-4 w-full md:flex-row flex-col">
        <div className="flex flex-col gap-4 w-full ">
          <textarea
            value={text1}
            rows={10}
            cols={50}
            onChange={handleText1Change}
            className="border-2 border-gray-300 rounded-md p-2 font-mono "
            placeholder="Enter first text here..."
          />
          <button
            className="border-2 border-gray-300 rounded-md p-2"
            onClick={() => {
              navigator.clipboard.writeText(text1);
            }}
          >
            Copy
          </button>
        </div>
        <div className="flex flex-col gap-4 w-full ">
          <textarea
            value={text2}
            rows={10}
            cols={50}
            onChange={handleText2Change}
            className="border-2 border-gray-300 rounded-md p-2 font-mono"
            placeholder="Enter second text here..."
          />
          <button
            className="border-2 border-gray-300 rounded-md p-2"
            onClick={() => {
              navigator.clipboard.writeText(text2);
            }}
          >
            Copy
          </button>
        </div>
      </div>

      <div className="flex flex-row gap-4">
        <span> lines: {splitText1.length}</span>
        <span> diff lines: {text1 && text2 ? diffLines.size : 0}</span>
        <span> lines: {splitText2.length}</span>
      </div>
      {text1 && text2 ? (
        <div className="flex flex-row gap-4 w-full justify-between">
          <div className="border-2 border-gray-300 rounded-md p-2 overflow-auto w-1/2">
            <TextWithHighlighting lines={splitText1} diffLines={diffLines} />
          </div>
          <div className="border-2 border-gray-300 rounded-md p-2 overflow-auto w-1/2">
            <TextWithHighlighting lines={splitText2} diffLines={diffLines} />
          </div>
        </div>
      ) : (
        <div>
          <span>Please enter text to see the diff</span>
        </div>
      )}
    </div>
  );
}
