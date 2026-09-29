"use client";

import { useEffect, useState } from "react";

const HAIR = "#141414";
const SKIN_SHADE = "#eab08a";

/** Left-side curls as [cx, cy, r]; mirrored for the right side. */
const CURLS: [number, number, number][] = [
  [36, 60, 10], [30, 74, 10], [38, 84, 9], [28, 90, 10], [36, 102, 10],
  [26, 108, 9], [34, 118, 10], [26, 126, 10], [40, 132, 9], [30, 142, 10],
  [44, 146, 9], [28, 156, 10], [46, 158, 9],
];

/**
 * Memoji-style tutor: long curly black hair, pink baseball cap, thick brows, black
 * beard, faint whitish glasses and a white v-neck t-shirt. `mouth` is 0..1 (from the
 * audio analyser); blinking runs on its own timer.
 */
export default function Avatar({ mouth, speaking }: { mouth: number; speaking: boolean }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        schedule();
      }, 2200 + Math.random() * 2800);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const open = Math.min(1, Math.max(0, mouth));
  const eyeRy = blink ? 0.8 : 7.5;

  return (
    <svg viewBox="0 0 160 160" className="h-full w-full" aria-label="Narrator">
      <defs>
        <radialGradient id="av-skin" cx="45%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#ffd9b8" />
          <stop offset="100%" stopColor="#f0b98f" />
        </radialGradient>
        <linearGradient id="av-shirt" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dfe5ee" />
        </linearGradient>
        <linearGradient id="av-cap" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ff8fc6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="av-hair" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2e2e2e" />
          <stop offset="100%" stopColor="#1c1c1c" />
        </linearGradient>
      </defs>

      {/* long curly hair behind the head, falling past the shoulders */}
      <g fill="url(#av-hair)">
        <path d="M36 54 C28 90 26 128 30 160 L58 160 C52 136 46 108 44 80 Z M124 54 C132 90 134 128 130 160 L102 160 C108 136 114 108 116 80 Z" />
        {CURLS.map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} />
            <circle cx={160 - x} cy={y} r={r} />
          </g>
        ))}
      </g>
      {/* ringlet highlights so the curls read against a dark background */}
      <g stroke="#4a4a4a" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.9">
        {CURLS.filter((_, i) => i % 2 === 0).map(([x, y, r], i) => (
          <g key={i}>
            <path d={`M${x - r * 0.5} ${y + r * 0.1} a${r * 0.5} ${r * 0.5} 0 1 1 ${r * 0.5} ${r * 0.45}`} />
            <path d={`M${160 - x + r * 0.5} ${y + r * 0.1} a${r * 0.5} ${r * 0.5} 0 1 0 ${-r * 0.5} ${r * 0.45}`} />
          </g>
        ))}
      </g>

      {/* white v-neck t-shirt */}
      <path d="M24 160 C28 128 50 116 80 116 C110 116 132 128 136 160 Z" fill="url(#av-shirt)" />
      <path d="M66 117 L80 138 L94 117 Z" fill={SKIN_SHADE} />
      <path d="M64 116 L80 140 L96 116" fill="none" stroke="#c7cfdb" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {/* battery pin */}
      <g transform="translate(108 140) rotate(-12)">
        <rect x="-8" y="-5" width="16" height="10" rx="2" fill="#0f172a" />
        <rect x="8" y="-2.5" width="2.5" height="5" rx="1" fill="#0f172a" />
        <rect x="-6" y="-3" width="9" height="6" rx="1" fill="#a3e635" />
      </g>

      {/* neck */}
      <rect x="70" y="104" width="20" height="16" rx="8" fill={SKIN_SHADE} />

      {/* head */}
      <ellipse cx="80" cy="74" rx="41" ry="45" fill="url(#av-skin)" />

      {/* curls framing the face, under the cap */}
      <g fill={HAIR}>
        <circle cx="41" cy="58" r="7" />
        <circle cx="39" cy="70" r="6.5" />
        <circle cx="41" cy="82" r="6" />
        <circle cx="119" cy="58" r="7" />
        <circle cx="121" cy="70" r="6.5" />
        <circle cx="119" cy="82" r="6" />
      </g>

      {/* pink baseball cap: crown, seam, button, brim */}
      <path d="M36 52 C36 26 56 12 80 12 C104 12 124 26 124 52 C112 46 96 44 80 44 C64 44 48 46 36 52 Z" fill="url(#av-cap)" />
      <path d="M80 13 L80 44" stroke="#db2777" strokeWidth="1.5" opacity="0.7" />
      <circle cx="80" cy="13" r="3" fill="#db2777" />
      <path d="M34 54 C48 44 112 44 126 54 C120 60 100 58 80 58 C60 58 40 60 34 54 Z" fill="#f472b6" />
      <path d="M34 54 C48 44 112 44 126 54" fill="none" stroke="#db2777" strokeWidth="1.5" />

      {/* thick brows */}
      <path d="M50 63 Q61 56 72 61" stroke={HAIR} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M88 61 Q99 56 110 63" stroke={HAIR} strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* eyes */}
      <ellipse cx="62" cy="74" rx="7.5" ry={eyeRy} fill="#fff" />
      <ellipse cx="98" cy="74" rx="7.5" ry={eyeRy} fill="#fff" />
      {!blink && (
        <>
          <circle cx="63" cy="75" r="4.5" fill="#2b1d14" />
          <circle cx="99" cy="75" r="4.5" fill="#2b1d14" />
          <circle cx="64.8" cy="72.8" r="1.6" fill="#fff" />
          <circle cx="100.8" cy="72.8" r="1.6" fill="#fff" />
        </>
      )}

      {/* faint whitish glasses */}
      <g fill="#ffffff" fillOpacity="0.12" stroke="#f1f5f9" strokeOpacity="0.75" strokeWidth="2.2">
        <rect x="47" y="64" width="30" height="21" rx="9" />
        <rect x="83" y="64" width="30" height="21" rx="9" />
      </g>
      <path d="M77 73 Q80 70 83 73" fill="none" stroke="#f1f5f9" strokeOpacity="0.75" strokeWidth="2" />
      <path d="M47 71 L40 69 M113 71 L120 69" stroke="#f1f5f9" strokeOpacity="0.6" strokeWidth="2" />
      <path d="M52 67 L57 67" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M88 67 L93 67" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />

      {/* nose */}
      <path d="M80 80 Q76 89 81 91" stroke="#d8946b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* black beard along the jaw, open around the mouth */}
      <path
        d="M40 80 C40 108 58 124 80 124 C102 124 120 108 120 80 C118 92 112 99 104 100 C98 96 90 94 80 94 C70 94 62 96 56 100 C48 99 42 92 40 80 Z"
        fill={HAIR}
      />
      {/* moustache */}
      <path d="M62 97 C68 91 76 92 80 95 C84 92 92 91 98 97 C92 99 86 98 80 97 C74 98 68 99 62 97 Z" fill={HAIR} />

      {/* mouth: smile when idle, opens with the voice */}
      {speaking && open > 0.05 ? (
        <g>
          <ellipse cx="80" cy={103 + open * 2} rx={8 + open * 3} ry={2 + open * 7} fill="#5a1f24" />
          <ellipse cx="80" cy={105 + open * 5} rx={4.5 + open * 2} ry={1 + open * 2.5} fill="#e0707a" />
        </g>
      ) : (
        <path d="M70 102 Q80 109 90 102" stroke="#f4a3a8" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}
