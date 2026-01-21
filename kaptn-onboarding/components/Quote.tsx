"use client";

import { motion } from "framer-motion";
import { siskoQuote } from "@/lib/gameData";
import { useState } from "react";

interface QuoteProps {
  onContinue: () => void;
}

export default function Quote({ onContinue }: QuoteProps) {
  const [showButton, setShowButton] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-8 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-8 max-w-4xl"
      >
        <div className="space-y-4">
          {siskoQuote.text.map((line, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.8 }}
              onAnimationComplete={() => {
                if (index === siskoQuote.text.length - 1) {
                  setTimeout(() => setShowButton(true), 1500);
                }
              }}
              className={`${
                line === "" ? "h-3" : "text-lg sm:text-xl bridge-text leading-relaxed"
              }`}
            >
              {line}
            </motion.p>
          ))}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + siskoQuote.text.length * 0.8 + 0.5 }}
            className="text-xs sm:text-sm text-bridge-white/60 italic mt-6"
          >
            {siskoQuote.author}
          </motion.p>
        </div>

        {showButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onClick={onContinue}
            className="bridge-button"
          >
            Proceed
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
