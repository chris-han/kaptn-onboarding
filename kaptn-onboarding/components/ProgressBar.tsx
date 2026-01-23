"use client";

import { motion } from "framer-motion";
import { GamePhase } from "@/types/game";

interface ProgressBarProps {
  phase: GamePhase;
  currentScenarioIndex?: number;
  totalScenarios?: number;
}

// Define milestones with clear labels
const MILESTONES = [
  { phase: "entrance", progress: 0, label: "START" },
  { phase: "brief", progress: 10, label: "BRIEF" },
  { phase: "scenario", progress: 20, label: "K" }, // Will be dynamic based on scenario
  { phase: "oath", progress: 70, label: "OATH" },
  { phase: "waitlist", progress: 80, label: "ACCESS" },
  { phase: "processing", progress: 85, label: "CALIBRATE" },
  { phase: "profile", progress: 92, label: "PROFILE" },
  { phase: "welcome", progress: 100, label: "COMPLETE" },
];

const SCENARIO_LABELS = ["K", "T", "P", "A", "N"];

export default function ProgressBar({
  phase,
  currentScenarioIndex = 0,
  totalScenarios = 5
}: ProgressBarProps) {
  // Calculate current progress
  const calculateProgress = (): number => {
    switch (phase) {
      case "entrance":
        return 0;
      case "brief":
        return 10;
      case "scenario":
        // Scenarios span from 20% to 60% (5 scenarios = 40% / 5 = 8% each)
        return 20 + (currentScenarioIndex * 8);
      case "oath":
        return 70;
      case "waitlist":
        return 80;
      case "processing":
        return 85;
      case "profile":
        return 92;
      case "welcome":
        return 100;
      default:
        return 0;
    }
  };

  // Generate milestone positions including scenarios
  const getMilestones = () => {
    const milestones = [];

    // Start
    milestones.push({ progress: 0, label: "START", isActive: phase === "entrance" });

    // Brief
    milestones.push({ progress: 10, label: "BRIEF", isActive: phase === "brief" });

    // Scenarios (K, T, P, A, N)
    for (let i = 0; i < totalScenarios; i++) {
      milestones.push({
        progress: 20 + (i * 8),
        label: SCENARIO_LABELS[i],
        isActive: phase === "scenario" && currentScenarioIndex === i,
      });
    }

    // Oath
    milestones.push({ progress: 70, label: "OATH", isActive: phase === "oath" });

    // Waitlist
    milestones.push({ progress: 80, label: "ACCESS", isActive: phase === "waitlist" });

    // Processing (no marker - just progress)

    // Profile
    milestones.push({ progress: 92, label: "PROFILE", isActive: phase === "profile" });

    // Complete
    milestones.push({ progress: 100, label: "COMPLETE", isActive: phase === "welcome" });

    return milestones;
  };

  const currentProgress = calculateProgress();
  const milestones = getMilestones();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-bridge-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Progress Bar Container */}
        <div className="relative h-1 bg-bridge-white/10 rounded-full overflow-hidden">
          {/* Animated Progress Fill */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-bridge-green via-bridge-green to-bridge-blue rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 10px rgba(0, 255, 136, 0.5)",
            }}
          />

          {/* Milestones */}
          {milestones.map((milestone, index) => {
            const isPassed = currentProgress >= milestone.progress;
            const isActive = milestone.isActive;

            return (
              <div
                key={`${milestone.label}-${index}`}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${milestone.progress}%` }}
              >
                {/* Milestone Dot */}
                <motion.div
                  className={`w-2 h-2 rounded-full border transition-all duration-300 ${
                    isActive
                      ? "border-bridge-green bg-bridge-green scale-150 shadow-lg shadow-bridge-green/50"
                      : isPassed
                      ? "border-bridge-green bg-bridge-green/50"
                      : "border-bridge-white/30 bg-bridge-white/10"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: isActive ? 1.5 : 1 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Milestone Label */}
                <motion.div
                  className={`absolute -bottom-6 font-mono text-[10px] tracking-wider whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? "text-bridge-green font-bold"
                      : isPassed
                      ? "text-bridge-white/70"
                      : "text-bridge-white/30"
                  }`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ delay: index * 0.05 }}
                >
                  {milestone.label}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Progress Percentage - Right Side */}
        <div className="absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2">
          <motion.div
            className="font-mono text-xs text-bridge-green/70 tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {Math.round(currentProgress)}%
          </motion.div>
        </div>
      </div>
    </div>
  );
}
