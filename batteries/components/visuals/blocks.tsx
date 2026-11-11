"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { getCourse } from "@batteries/lib/courses";
import { C, Label, RECAP_CARD_CLASS, RecapLink, Stage } from "./primitives";

/** Building blocks shared by the newer courses' visuals (polymers, electromobility, materials analysis). */

export function Title({ children, y = 44, size = 18 }: { children: ReactNode; y?: number; size?: number }) {
  return (
    <Label x={300} y={y} size={size} weight={700}>
      {children}
    </Label>
  );
}

/** A rounded card with a coloured title and dim body lines, sliding in when shown. */
export function Card({
  x,
  y,
  w,
  h,
  title,
  lines = [],
  color = C.accent,
  show = true,
  delay = 0,
  size = 13,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines?: string[];
  color?: string;
  show?: boolean;
  delay?: number;
  size?: number;
}) {
  return (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }} transition={{ delay: show ? delay : 0, duration: 0.4 }}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill="#111a2c" stroke={color} strokeOpacity={0.7} />
      <Label x={x + w / 2} y={y + 24} size={size + 2} weight={700} color={color}>
        {title}
      </Label>
      {lines.map((l, i) => (
        <Label key={i} x={x + w / 2} y={y + 46 + i * (size + 5)} size={size} color={C.dim}>
          {l}
        </Label>
      ))}
    </motion.g>
  );
}

export type Bar = { label: string; value: number; color?: string; note?: string };

/** Horizontal bars that grow when shown. */
export function Bars({
  items,
  x = 170,
  y = 90,
  w = 340,
  gap = 46,
  max,
  show = true,
  format = (v: number) => `${v}`,
}: {
  items: Bar[];
  x?: number;
  y?: number;
  w?: number;
  gap?: number;
  max?: number;
  show?: boolean;
  format?: (v: number) => string;
}) {
  const top = max ?? Math.max(...items.map((b) => b.value));
  return (
    <g>
      {items.map((b, i) => {
        const len = (b.value / top) * w;
        const yy = y + i * gap;
        return (
          <g key={b.label}>
            <Label x={x - 12} y={yy + 18} anchor="end" size={14}>
              {b.label}
            </Label>
            <motion.rect
              x={x}
              y={yy}
              height={26}
              rx={6}
              fill={b.color ?? C.accent}
              opacity={0.85}
              initial={false}
              animate={{ width: show ? Math.max(len, 2) : 0 }}
              transition={{ duration: 0.8, delay: show ? i * 0.08 : 0 }}
            />
            <Label x={x + len + 8} y={yy + 18} anchor="start" size={13} weight={700}>
              {format(b.value)}
            </Label>
            {b.note && (
              <Label x={x + len + 8} y={yy + 34} anchor="start" size={11} color={C.dim}>
                {b.note}
              </Label>
            )}
          </g>
        );
      })}
    </g>
  );
}

export type Event = { year: number; label: string; sub?: string; color?: string };

/** A horizontal timeline with labelled ticks alternating above and below the line. */
export function Timeline({
  events,
  from,
  to,
  y = 230,
  x0 = 50,
  x1 = 550,
  show = true,
  even = false,
}: {
  events: Event[];
  from: number;
  to: number;
  /** Space events evenly by index instead of by year (for crowded decades). */
  even?: boolean;
  y?: number;
  x0?: number;
  x1?: number;
  show?: boolean;
}) {
  const sx = (v: number) => x0 + ((v - from) / (to - from)) * (x1 - x0);
  return (
    <g>
      <motion.line
        x1={x0}
        x2={x1}
        y1={y}
        y2={y}
        stroke={C.dim}
        strokeWidth={2}
        initial={false}
        animate={{ pathLength: show ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      />
      {events.map((e, i) => {
        const up = i % 2 === 0;
        const x = even ? x0 + (i * (x1 - x0)) / Math.max(events.length - 1, 1) : sx(e.year);
        const color = e.color ?? C.accent;
        return (
          <motion.g key={`${e.year}-${e.label}`} initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ delay: show ? 0.3 + i * 0.12 : 0 }}>
            <line x1={x} x2={x} y1={y} y2={up ? y - 52 : y + 52} stroke={color} strokeWidth={1.5} strokeDasharray="3 3" />
            <circle cx={x} cy={y} r={6} fill={color} />
            <Label x={x} y={up ? y - 80 : y + 72} size={14} weight={800} color={color}>
              {e.year}
            </Label>
            <Label x={x} y={up ? y - 62 : y + 90} size={13}>
              {e.label}
            </Label>
            {e.sub && (
              <Label x={x} y={up ? y - 98 : y + 106} size={11} color={C.dim}>
                {e.sub}
              </Label>
            )}
          </motion.g>
        );
      })}
    </g>
  );
}

/** A simple text table; the first row is the header. */
export function Table({
  x,
  y,
  cols,
  rows,
  rowH = 34,
  show = true,
  highlight,
  size = 13,
}: {
  x: number;
  y: number;
  /** Column widths. */
  cols: number[];
  rows: string[][];
  rowH?: number;
  show?: boolean;
  /** Row index (in `rows`, header is 0) drawn in the accent colour. */
  highlight?: number;
  size?: number;
}) {
  const total = cols.reduce((a, b) => a + b, 0);
  return (
    <g>
      {rows.map((r, i) => {
        let cx = x;
        const yy = y + i * rowH;
        return (
          <motion.g key={i} initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ delay: show ? i * 0.08 : 0 }}>
            <rect
              x={x}
              y={yy}
              width={total}
              height={rowH - 4}
              rx={6}
              fill={i === 0 ? "#16233a" : i === highlight ? "#123033" : "#111a2c"}
              stroke={i === highlight ? C.accent : "none"}
            />
            {r.map((cell, j) => {
              const w = cols[j];
              const tx = cx + w / 2;
              cx += w;
              return (
                <Label key={j} x={tx} y={yy + rowH / 2 + 3} size={size} weight={i === 0 || j === 0 ? 700 : 500} color={i === 0 ? C.accent : C.ink}>
                  {cell}
                </Label>
              );
            })}
          </motion.g>
        );
      })}
    </g>
  );
}

/** Recap: numbered cards that jump back to their chapter, plus a closing takeaway. */
export function RecapGrid({
  courseId,
  cards,
  show,
  takeaway,
}: {
  courseId: string;
  cards: { t: string; id: string; k: string[] }[];
  show: boolean;
  takeaway: { title: string; lines: string[] };
}) {
  const { chapters } = getCourse(courseId).narration;
  const titleOf = (id: string) => chapters.find((c) => c.id === id)?.title ?? id;
  const perRow = cards.length > 6 ? 4 : 3;
  const cw = (560 - (perRow - 1) * 12) / perRow;
  return (
    <Stage label="Recap">
      <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }}>
        <Label x={300} y={22} size={12} color={C.dim}>
          Click a topic to jump back to it
        </Label>
      </motion.g>
      {cards.map((c, i) => {
        const x = 20 + (i % perRow) * (cw + 12);
        const y = 34 + Math.floor(i / perRow) * 92;
        return (
          <motion.g key={c.id} initial={false} animate={{ opacity: show ? 1 : 0, y: show ? 0 : 12 }} transition={{ delay: show ? i * 0.07 : 0, duration: 0.4 }}>
            <RecapLink href={`#${c.id}`} title={titleOf(c.id)}>
              <rect x={x} y={y} width={cw} height={80} rx={10} fill="#111a2c" stroke={C.grid} className={RECAP_CARD_CLASS} />
              <circle cx={x + 18} cy={y + 20} r={11} fill={C.accent} />
              <Label x={x + 18} y={y + 24} size={12} color="#0b1220" weight={800}>
                {i + 1}
              </Label>
              <Label x={x + 36} y={y + 25} size={13} weight={700} anchor="start">
                {c.t}
              </Label>
              {c.k.map((line, j) => (
                <Label key={j} x={x + cw / 2} y={y + 50 + j * 16} size={12} color={C.dim}>
                  {line}
                </Label>
              ))}
            </RecapLink>
          </motion.g>
        );
      })}
      <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ delay: show ? 0.7 : 0, duration: 0.5 }}>
        <rect x={40} y={318} width={520} height={110} rx={16} fill="#0b1220" stroke={C.accent} strokeWidth={2} />
        <Label x={300} y={350} size={18} weight={800} color={C.accent}>
          {takeaway.title}
        </Label>
        {takeaway.lines.map((l, i) => (
          <Label key={i} x={300} y={378 + i * 20} size={14}>
            {l}
          </Label>
        ))}
      </motion.g>
    </Stage>
  );
}
