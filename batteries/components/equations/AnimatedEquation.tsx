"use client";

import { useMemo } from "react";
import katex from "katex";
import { motion } from "framer-motion";

export default function AnimatedEquation({ tex, className = "" }: { tex: string; className?: string }) {
  const html = useMemo(() => katex.renderToString(tex, { displayMode: true, throwOnError: false }), [tex]);
  return (
    <motion.div
      key={tex}
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5 }}
      className={`overflow-x-auto text-ink ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
