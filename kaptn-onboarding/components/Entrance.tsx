"use client";

import { motion } from "framer-motion";

interface EntranceProps {
  onBegin: () => void;
}

export default function Entrance({ onBegin }: EntranceProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center space-y-12 max-w-2xl"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="bridge-text text-xl"
        >
          Before you step onto the bridge,
          <br />
          your mindset must be calibrated.
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={onBegin}
          className="bridge-button"
        >
          Begin Calibration
        </motion.button>
      </motion.div>
    </div>
  );
}
