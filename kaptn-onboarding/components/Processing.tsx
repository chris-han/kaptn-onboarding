"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ProcessingProps {
  onComplete: () => void;
}

const protocols = [
  { id: "K", label: "Knowledge protocol: Calibrated", color: "text-bridge-blue" },
  { id: "T", label: "Thesis protocol: Calibrated", color: "text-bridge-purple" },
  { id: "P", label: "Prioritize protocol: Calibrated", color: "text-bridge-gold" },
  { id: "A", label: "Action protocol: Calibrated", color: "text-bridge-red" },
  { id: "N", label: "Navigation protocol: Calibrated", color: "text-bridge-green" },
];

export default function Processing({ onComplete }: ProcessingProps) {
  const [currentProtocol, setCurrentProtocol] = useState(0);

  useEffect(() => {
    if (currentProtocol < protocols.length) {
      const timer = setTimeout(() => {
        setCurrentProtocol(currentProtocol + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentProtocol, onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-8 relative z-10">
      <div className="space-y-6 max-w-2xl w-full">
        {/* KAPTN Logo Animation */}
        <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-8 sm:mb-12">
          {["K", "A", "T", "P", "N"].map((letter, index) => {
            const protocolIndex = protocols.findIndex(p => p.id === letter);
            const isActive = currentProtocol > protocolIndex;

            return (
              <motion.div
                key={letter}
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: isActive ? 1 : 0.3,
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`text-4xl sm:text-5xl font-mono font-bold ${
                  isActive ? protocols[protocolIndex].color : "text-bridge-white/30"
                } ${isActive ? "text-glow" : ""}`}
              >
                {letter}
              </motion.div>
            );
          })}
        </div>

        {/* Protocol Status Messages */}
        <div className="space-y-3">
          {protocols.map((protocol, index) => (
            <motion.div
              key={protocol.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: currentProtocol > index ? 1 : 0,
                x: currentProtocol > index ? 0 : -20,
              }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-4"
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  currentProtocol > index ? protocol.color : "bg-bridge-white/30"
                } ${currentProtocol > index ? "animate-pulse-glow" : ""}`}
              />
              <p className={`bridge-text ${protocol.color}`}>
                {protocol.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
