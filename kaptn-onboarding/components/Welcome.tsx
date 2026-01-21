"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface WelcomeProps {
  onAssumeCommand: () => void;
  onRestart: () => void;
  captainName?: string;
}

export default function Welcome({ onAssumeCommand, onRestart, captainName }: WelcomeProps) {
  const [assumingCommand, setAssumingCommand] = useState(false);
  const [commandPhase, setCommandPhase] = useState<"bell" | "bridge" | "conn" | "badge" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Bell sound effect using Web Audio API
  const playBellSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create ship's bell sound (multiple bell strikes)
    const strikeBell = (time: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Bell-like frequency
      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      // Bell envelope (quick attack, sustained decay)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + time);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + time + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.8);

      oscillator.start(audioContext.currentTime + time);
      oscillator.stop(audioContext.currentTime + time + 0.8);
    };

    // Strike bell 8 times (traditional ship's bell pattern for end of watch)
    for (let i = 0; i < 8; i++) {
      strikeBell(i * 0.25);
    }
  };

  // Voice synthesis
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fetch user ID when badge phase is reached
  useEffect(() => {
    if (commandPhase === "badge" && !userId) {
      fetch('/api/user-id')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserId(data.userId);
          }
        })
        .catch(error => console.error('Error fetching user ID:', error));
    }
  }, [commandPhase, userId]);

  const handleAssumeCommand = () => {
    setAssumingCommand(true);
    setCommandPhase("bell");

    // Play bell sound
    playBellSound();

    // After bell (2 seconds), announce "Captain on bridge"
    setTimeout(() => {
      setCommandPhase("bridge");
      speak("Captain on the bridge");
    }, 2000);

    // After announcement (3 seconds), show "You have the conn"
    setTimeout(() => {
      setCommandPhase("conn");
    }, 5000);

    // After conn message (2.5 seconds), present the badge
    setTimeout(() => {
      setCommandPhase("badge");
    }, 7500);
  };

  const handleReplay = () => {
    // Go back to the Welcome screen with "Assume Command" button
    setCommandPhase(null);
    setAssumingCommand(false);
  };

  const handleRestartFlow = () => {
    // Go to the very beginning of onboarding flow (like refresh)
    onRestart();
  };

  if (assumingCommand) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-bridge-black">
        <AnimatePresence mode="wait">
          {commandPhase === "bell" && (
            <motion.div
              key="bell"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto border-4 border-bridge-gold rounded-full flex items-center justify-center">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1, 1]
                  }}
                  transition={{
                    duration: 2,
                    times: [0, 0.2, 0.4, 0.6, 0.8, 1]
                  }}
                  className="text-6xl"
                >
                  🔔
                </motion.div>
              </div>
            </motion.div>
          )}

          {commandPhase === "bridge" && (
            <motion.div
              key="bridge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4"
            >
              <h2 className="text-6xl font-inter font-normal tracking-tight text-white">
                Captain on the Bridge
              </h2>
            </motion.div>
          )}

          {commandPhase === "conn" && (
            <motion.div
              key="conn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
              className="text-center space-y-6"
            >
              <h2 className="text-6xl font-inter font-normal tracking-tight text-white">
                You Have the Conn.
              </h2>
            </motion.div>
          )}

          {commandPhase === "badge" && (
            <motion.div
              key="badge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-center space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center relative"
              >
                <motion.div
                  className="relative"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1.2, type: "spring", stiffness: 100 }}
                >
                  <img
                    src="/kaptn-badge.svg"
                    alt="KAPTN Bridge Ensignia"
                    width={240}
                    height={240}
                  />
                  {/* User ID overlay - positioned under the double diamond */}
                  {userId && (
                    <div
                      className="absolute w-full"
                      style={{ top: '65%', left: 0, right: 0 }}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="flex justify-center"
                      >
                        <div className="text-white font-mono font-light text-lg tracking-wider">
                          {userId.slice(-8)}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="space-y-4"
              >
                <h3 className="text-3xl font-mono uppercase tracking-widest text-bridge-gold">
                  Bridge Ensignia Issued To
                </h3>
                {captainName && (
                  <p className="text-xl font-inter text-white/90">
                    Captain <span className="underline">{captainName}</span>
                  </p>
                )}
                <p className="text-sm font-inter text-white/50 max-w-md mx-auto leading-relaxed">
                  The double-diamond: Navigate the unknown through Knowledge, Action, Priority, Thesis, Navigation.
                </p>
                {/* <p className="text-sm font-mono text-bridge-gold/60 uppercase tracking-wider">
                  Design Thinking • Command Protocol
                </p> */}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="flex gap-4 justify-center mt-8"
              >
                <button
                  onClick={handleReplay}
                  className="bridge-button"
                >
                  Replay Ceremony
                </button>
                <button
                  onClick={handleRestartFlow}
                  className="bridge-button"
                >
                  Restart
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center space-y-12 max-w-3xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-8"
        >
          <h1 className="text-4xl font-mono uppercase tracking-wider">
            Welcome Aboard, Captain
          </h1>

          <div className="space-y-4 bridge-text text-lg leading-loose">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Your bridge is calibrated to your command style.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              Your protocols are online.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              Your trajectory awaits definition.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            className="h-px w-48 bg-bridge-white/30 mx-auto"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="space-y-3 text-bridge-white/70"
          >
            <p className="bridge-text">The unknown is your territory.</p>
            <p className="bridge-text">KAPTN is your bridge system.</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          className="space-y-6"
        >
          <div className="flex justify-center space-x-8 bridge-text text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-bridge-green rounded-full animate-pulse-glow" />
              <span>Systems: GREEN</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-bridge-green rounded-full animate-pulse-glow" />
              <span>Status: READY</span>
            </div>
          </div>

          <button onClick={handleAssumeCommand} className="bridge-button">
            Assume Command
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
