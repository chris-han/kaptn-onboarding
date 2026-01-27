"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface QuoteProps {
  onContinue: () => void;
}

export default function Quote({ onContinue }: QuoteProps) {
  const t = useTranslations("onboarding.quote");
  const [showButton, setShowButton] = useState(false);

  const quoteText = t.raw("text") as string[];
  const author = t("author");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-8 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-8 max-w-4xl"
      >
        <div className="space-y-4">
          {quoteText.map((line, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.8 }}
              onAnimationComplete={() => {
                if (index === quoteText.length - 1) {
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
            transition={{ delay: 0.5 + quoteText.length * 0.8 + 0.5 }}
            className="text-xs sm:text-sm text-bridge-white/60 italic mt-6"
          >
            {author}
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
            {t("button")}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
