"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function SubtitleBar({ text }: { text: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-30 flex justify-center px-4 max-sm:pr-36 sm:pr-48">
      <AnimatePresence mode="wait">
        {text && (
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="max-w-2xl rounded-lg bg-black/75 px-4 py-2 text-center text-base leading-snug text-white shadow-lg sm:text-lg"
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
