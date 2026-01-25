"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";


interface WelcomeProps {
  onAssumeCommand: () => void;
  captainName?: string;
}

export default function Welcome({ onAssumeCommand, captainName }: WelcomeProps) {
  const t = useTranslations("onboarding.welcome");
  const [assumingCommand, setAssumingCommand] = useState(false);
  const [commandPhase, setCommandPhase] = useState<"bell" | "bridge" | "conn" | "badge" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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
            // Save captain name to localStorage for badge download page
            if (captainName) {
              localStorage.setItem('captainName', captainName);
            }
          }
        })
        .catch(error => console.error('Error fetching user ID:', error));
    }
  }, [commandPhase, userId, captainName]);

  const handleDownloadBadge = async () => {
    setDownloading(true);

    try {
      const serialNumber = userId?.slice(-8) || 'TEMP0000';

      // Create canvas directly
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size (340px width, increased height for QR code)
      canvas.width = 680; // 2x for retina
      canvas.height = 1000; // 2x for retina (increased for QR code)
      ctx.scale(2, 2);

      // Background
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, 340, 500);

      // Badge card background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(20, 20, 300, 460);

      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 300, 460);

      // Corner accents
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(20, 44);
      ctx.lineTo(20, 20);
      ctx.lineTo(44, 20);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(296, 20);
      ctx.lineTo(320, 20);
      ctx.lineTo(320, 44);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(20, 456);
      ctx.lineTo(20, 480);
      ctx.lineTo(44, 480);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(296, 480);
      ctx.lineTo(320, 480);
      ctx.lineTo(320, 456);
      ctx.stroke();

      // Title "KAPTN"
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('KAPTN', 170, 60);

      // Subtitle "Bridge System"
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px monospace';
      ctx.fillText('BRIDGE SYSTEM', 170, 80);

      // Load and draw badge SVG
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // Draw SVG at 120x120 size
          ctx.drawImage(img, 110, 100, 120, 120);
          resolve();
        };
        img.onerror = reject;
        img.src = '/kaptn-badge.svg';
      });

      // Serial number on badge (positioned at 65% from badge top)
      ctx.fillStyle = '#ffffff';
      ctx.font = '300 11px monospace'; // Smaller font to fit badge
      const snChars = serialNumber.toLowerCase().split('');
      const badgeCenterX = 110 + 63; // Badge x + half width
      const badgeY = 100 + (120 * 0.73); // 65% from badge top
      const charWidth = 7; // Character width including spacing
      let snX = badgeCenterX - (snChars.length * charWidth) / 2; // Center on badge
      for (const char of snChars) {
        ctx.fillText(char, snX, badgeY);
        snX += charWidth;
      }

      // "Bridge Ensignia"
      ctx.fillStyle = '#ffd700';
      ctx.font = '16px monospace';
      ctx.fillText('BRIDGE ENSIGNIA', 170, 250);

      // Captain name if present
      if (captainName) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '14px sans-serif';
        ctx.fillText(`Captain ${captainName}`, 170, 275);
      }

      // Serial number label (simulating letter-spacing)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '12px monospace';
      const snLabel = `SN: ${serialNumber.toUpperCase()}`;
      const labelChars = snLabel.split('');
      let labelX = 170 - (labelChars.length * 4.5);
      for (const char of labelChars) {
        ctx.fillText(char, labelX, captainName ? 295 : 275);
        labelX += 9; // 3px letter-spacing simulation
      }

      // Generate and draw QR code - points to userinfo page with userId
      const currentLocale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en';
      const qrUrl = typeof window !== 'undefined' ? `${window.location.origin}/${currentLocale}/userinfo/${userId}` : '';

      // Create temp container for QR code
      const tempQRContainer = document.createElement('div');
      tempQRContainer.style.position = 'absolute';
      tempQRContainer.style.left = '-9999px';
      document.body.appendChild(tempQRContainer);

      // Render QR code using React
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempQRContainer);

      await new Promise<void>((resolve) => {
        root.render(
          <QRCodeSVG
            value={qrUrl}
            size={90}
            level="M"
            fgColor="#ffffff"
            bgColor="transparent"
          />
        );
        // Wait for render
        setTimeout(() => resolve(), 100);
      });

      // Get the rendered SVG and convert to image
      const qrSVG = tempQRContainer.querySelector('svg');
      if (qrSVG) {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(qrSVG);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const qrURL = URL.createObjectURL(svgBlob);

        const qrImage = new Image();
        await new Promise<void>((resolve, reject) => {
          qrImage.onload = () => {
            // QR code position and styling
            const qrX = 125;
            const qrY = captainName ? 310 : 290;
            const qrSize = 90;

            // Draw background and border for QR code
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);

            // Corner brackets (gold)
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1;
            // Top-left
            ctx.beginPath();
            ctx.moveTo(qrX - 2, qrY + 6);
            ctx.lineTo(qrX - 2, qrY - 2);
            ctx.lineTo(qrX + 6, qrY - 2);
            ctx.stroke();
            // Top-right
            ctx.beginPath();
            ctx.moveTo(qrX + qrSize - 4, qrY - 2);
            ctx.lineTo(qrX + qrSize + 2, qrY - 2);
            ctx.lineTo(qrX + qrSize + 2, qrY + 6);
            ctx.stroke();
            // Bottom-left
            ctx.beginPath();
            ctx.moveTo(qrX - 2, qrY + qrSize - 4);
            ctx.lineTo(qrX - 2, qrY + qrSize + 2);
            ctx.lineTo(qrX + 6, qrY + qrSize + 2);
            ctx.stroke();
            // Bottom-right
            ctx.beginPath();
            ctx.moveTo(qrX + qrSize - 4, qrY + qrSize + 2);
            ctx.lineTo(qrX + qrSize + 2, qrY + qrSize + 2);
            ctx.lineTo(qrX + qrSize + 2, qrY + qrSize - 4);
            ctx.stroke();

            // Draw QR code
            ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

            URL.revokeObjectURL(qrURL);
            resolve();
          };
          qrImage.onerror = reject;
          qrImage.src = qrURL;
        });
      }

      // Cleanup
      root.unmount();
      document.body.removeChild(tempQRContainer);

      // Update footer position to accommodate QR code
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, captainName ? 420 : 400);
      ctx.lineTo(300, captainName ? 420 : 400);
      ctx.stroke();

      // Footer text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '10px monospace';
      ctx.fillText('NAVIGATE THE UNKNOWN WITH PRECISION', 170, captainName ? 445 : 425);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `KAPTN-Badge-${serialNumber.toUpperCase()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
        setDownloading(false);
      }, 'image/png');
    } catch (error) {
      console.error('Error generating badge:', error);
      setDownloading(false);
    }
  };

  const handleAssumeCommand = () => {
    setAssumingCommand(true);
    setCommandPhase("bell");

    // Call parent's onAssumeCommand to save profile data
    onAssumeCommand();

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
    // Go back to the landing page
    window.location.href = '/landing';
  };

  if (assumingCommand) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-8 bg-bridge-black relative z-10">
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
                {t("ceremony.captainOnBridge")}
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
                {t("ceremony.youHaveConn")}
              </h2>
            </motion.div>
          )}

          {commandPhase === "badge" && (
            <motion.div
              key="badge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-center space-y-4 sm:space-y-6"
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
                    width={180}
                    height={180}
                    className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]"
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
                className="space-y-2"
              >
                <h3 className="text-xl sm:text-2xl font-mono uppercase tracking-widest text-bridge-gold">
                  {t("ceremony.ensigniaIssuedTo")}
                </h3>
                {captainName && (
                  <p className="text-base sm:text-lg font-inter text-white/90">
                    {t("ceremony.captain")} <span className="underline">{captainName}</span>
                  </p>
                )}
                {userId && (
                  <p className="text-xs sm:text-sm font-mono text-white/40 tracking-widest mt-1">
                    {t("ceremony.serialNumber")} {userId.slice(-8).toUpperCase()}
                  </p>
                )}
              </motion.div>

              {/* Download Badge Button */}
              {userId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                  className="mt-6 flex flex-col items-center"
                >
                  <button
                    onClick={handleDownloadBadge}
                    disabled={downloading}
                    className="bridge-button"
                  >
                    {downloading ? t("ceremony.downloading") || "DOWNLOADING..." : t("ceremony.downloadBadge") || "DOWNLOAD BADGE"}
                  </button>
                </motion.div>
              )}



              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0, duration: 0.6 }}
                className="flex gap-3 justify-center mt-4"
              >
                <button
                  onClick={handleReplay}
                  className="bridge-button"
                >
                  {t("ceremony.replayCeremony")}
                </button>
                <button
                  onClick={handleRestartFlow}
                  className="bridge-button"
                >
                  {t("ceremony.restart")}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-8 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center space-y-6 max-w-3xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-4"
        >
          <h1 className="text-2xl sm:text-3xl font-mono uppercase tracking-wider">
            {t("title")}
          </h1>

          <div className="space-y-3 bridge-text text-base sm:text-lg leading-relaxed">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {t("line1")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              {t("line2")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              {t("line3")}
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
            className="space-y-2 text-bridge-white/70 text-sm sm:text-base"
          >
            <p className="bridge-text">{t("line4")}</p>
            <p className="bridge-text">{t("line5")}</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          className="space-y-4"
        >
          <div className="flex justify-center space-x-8 bridge-text text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-bridge-green rounded-full animate-pulse-glow" />
              <span>{t("systemsStatus")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-bridge-green rounded-full animate-pulse-glow" />
              <span>{t("readyStatus")}</span>
            </div>
          </div>

          <button onClick={handleAssumeCommand} className="bridge-button">
            {t("button")}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
