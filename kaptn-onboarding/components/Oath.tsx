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
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-12 max-w-3xl"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl bridge-text"
        >
          The Captain's Oath
        </motion.h2>

        <div className="space-y-4">
          {captainsOath.map((line, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + index * 0.3 }}
              onAnimationComplete={() => {
                if (index === captainsOath.length - 1) {
                  setTimeout(() => setShowButton(true), 500);
                }
              }}
              className={`bridge-text ${
                line === "" ? "h-4" : "text-lg leading-relaxed"
              }`}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {showButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
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
