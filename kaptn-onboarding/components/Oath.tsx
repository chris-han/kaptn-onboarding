"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { captainsOath } from "@/lib/gameData";

interface OathProps {
  onAffirm: () => void;
}

export default function Oath({ onAffirm }: OathProps) {
  const [showButton, setShowButton] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-8 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-6 max-w-3xl"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg sm:text-xl bridge-text"
        >
          The Captain's Oath
        </motion.h2>

        <div className="space-y-3">
          {captainsOath.map((line, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.8 + index * 0.15,
                duration: 0.6,
                ease: "easeOut"
              }}
              onAnimationComplete={() => {
                if (index === captainsOath.length - 1) {
                  setTimeout(() => setShowButton(true), 300);
                }
              }}
              className={`bridge-text ${
                line === "" ? "h-3" : "text-base sm:text-lg leading-relaxed"
              }`}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onClick={onAffirm}
            className="bridge-button"
          >
            Affirm
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
