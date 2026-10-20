"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function SubtitleBar({ text }: { text: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+3.5rem)] z-30 flex justify-center px-4 max-sm:pr-24 sm:bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3rem)] sm:pr-48 [@media(max-height:500px)]:pr-28">
      <AnimatePresence mode="wait">
        {text && (
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="max-w-2xl rounded-lg bg-black/75 px-4 py-2 text-center text-sm leading-snug text-white shadow-lg sm:text-lg [@media(max-height:500px)]:py-1 [@media(max-height:500px)]:text-sm"
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
