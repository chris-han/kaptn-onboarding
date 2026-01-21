"use client";

import { motion } from "framer-motion";
import { Scenario, ScenarioOption } from "@/types/game";

interface ScenarioViewProps {
  scenario: Scenario;
  onSelect: (optionId: string, pattern: string) => void;
}

export default function ScenarioView({
  scenario,
  onSelect,
}: ScenarioViewProps) {
  const protocolColors = {
    K: "border-bridge-blue text-bridge-blue",
    T: "border-bridge-purple text-bridge-purple",
    P: "border-bridge-gold text-bridge-gold",
    A: "border-bridge-red text-bridge-red",
    N: "border-bridge-green text-bridge-green",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-8 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full space-y-4"
      >
        {/* Protocol Indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`protocol-indicator ${protocolColors[scenario.id]}`}
          >
            {scenario.id}
          </div>
          <h2 className="text-xl sm:text-2xl font-mono uppercase tracking-wider">
            {scenario.title}
          </h2>
        </div>

        {/* Visual Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-bridge-white/50 italic"
        >
          {scenario.visual}
        </motion.p>

        {/* Context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bridge-white/5 border border-bridge-white/20 p-4 sm:p-6"
        >
          <pre className="bridge-text text-bridge-white/90 whitespace-pre-wrap">
            {scenario.context}
          </pre>
        </motion.div>

        {/* Question */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bridge-text text-lg text-center"
        >
          {scenario.question}
        </motion.p>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid gap-3"
        >
          {scenario.options.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              onClick={() => onSelect(option.id, option.pattern)}
              className="bridge-option text-left group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 border border-current flex items-center justify-center font-mono text-xs group-hover:bg-current group-hover:text-bridge-black transition-colors">
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-mono text-sm font-bold tracking-wide">
                    {option.label}
                  </p>
                  <p className="text-xs sm:text-sm text-bridge-white/70 leading-snug">
                    {option.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
