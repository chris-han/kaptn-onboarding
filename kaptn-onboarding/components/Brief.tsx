"use client";

import { motion } from "framer-motion";

interface BriefProps {
  onContinue: () => void;
}

export default function Brief({ onContinue }: BriefProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-12 max-w-3xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-6"
        >
          <p className="bridge-text text-xl leading-loose">
            This is not a test.
            <br />
            This is a mirror.
          </p>

          <div className="h-px w-32 bg-bridge-white/30 mx-auto" />

          <p className="bridge-text text-base leading-loose text-bridge-white/80">
            You will face five scenarios.
            <br />
            Each scenario reveals how you navigate uncertainty.
            <br />
            There are no wrong answers.
            <br />
            Only patterns.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={onContinue}
          className="bridge-button"
        >
          Initiate Protocol
        </motion.button>
      </motion.div>
    </div>
  );
}
