"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { motion } from "framer-motion";

// Right-edge fade shown only while the formula overflows and is not scrolled to its end.
const FADE = "linear-gradient(to right, #000 calc(100% - 2rem), transparent)";

export default function AnimatedEquation({ tex, className = "" }: { tex: string; className?: string }) {
  const html = useMemo(() => katex.renderToString(tex, { displayMode: true, throwOnError: false }), [tex]);
  const ref = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (el) setFade(el.scrollWidth > el.clientWidth + 1 && el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [html, measure]);

  return (
    <motion.div
      ref={ref}
      key={tex}
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5 }}
      onScroll={measure}
      style={fade ? { maskImage: FADE, WebkitMaskImage: FADE } : undefined}
      className={`overflow-x-auto text-ink ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
