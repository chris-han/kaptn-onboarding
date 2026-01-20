"use client";

import { motion } from "framer-motion";
import { DecisionProfile } from "@/types/game";
import { protocolDescriptions } from "@/lib/gameData";

interface ProfileProps {
  profile: DecisionProfile;
  onContinue: () => void;
}

const protocolInfo = {
  K: { name: "Knowledge Mode", color: "text-bridge-blue border-bridge-blue" },
  T: { name: "Thesis Mode", color: "text-bridge-purple border-bridge-purple" },
  P: { name: "Priority Mode", color: "text-bridge-gold border-bridge-gold" },
  A: { name: "Action Mode", color: "text-bridge-red border-bridge-red" },
  N: { name: "Navigation Mode", color: "text-bridge-green border-bridge-green" },
};

export default function Profile({ profile, onContinue }: ProfileProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 py-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl w-full space-y-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <h2 className="text-3xl font-mono uppercase tracking-wider">
            Your Bridge Configuration
          </h2>
          <p className="text-sm text-bridge-white/60">
            Decision Style Profile
          </p>
        </motion.div>

        <div className="space-y-6">
          {(Object.keys(profile) as Array<keyof DecisionProfile>).map(
            (protocol, index) => {
              const pattern = profile[protocol];
              const info = protocolInfo[protocol];
              const description = protocolDescriptions[protocol][pattern as keyof typeof protocolDescriptions[typeof protocol]];

              return (
                <motion.div
                  key={protocol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.15 }}
                  className={`border ${info.color} bg-black/40 p-6 space-y-3`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`protocol-indicator ${info.color} flex-shrink-0`}
                    >
                      {protocol}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-mono font-bold ${info.color}`}>
                        {info.name}
                      </h3>
                      <p className="text-xs text-bridge-white/50 uppercase tracking-wide mt-1">
                        {pattern.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-bridge-white/80 leading-relaxed pl-16">
                    {description}
                  </p>
                </motion.div>
              );
            }
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="bg-bridge-white/5 border border-bridge-white/20 p-8 space-y-4"
        >
          <p className="bridge-text text-sm leading-loose text-bridge-white/80">
            This profile is not an evaluation.
            <br />
            It is a snapshot of how you navigate uncertainty right now.
          </p>
          <p className="bridge-text text-sm leading-loose text-bridge-white/80">
            Your patterns will evolve.
            <br />
            The bridge will adapt with you.
          </p>
          <p className="bridge-text text-sm leading-loose text-bridge-white/80">
            What matters is this:
            <br />
            You are aware of your own navigation system.
          </p>
          <p className="bridge-text text-sm leading-loose font-bold">
            That awareness is your first advantage.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="flex justify-center"
        >
          <button onClick={onContinue} className="bridge-button">
            Continue
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
