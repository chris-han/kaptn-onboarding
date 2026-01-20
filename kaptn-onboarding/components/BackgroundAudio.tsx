"use client";

import { useEffect, useRef, useState } from "react";

interface BackgroundAudioProps {
  enabled?: boolean;
  volume?: number;
}

export default function BackgroundAudio({
  enabled = true,
  volume = 0.3
}: BackgroundAudioProps) {
  const wavesRef = useRef<HTMLAudioElement | null>(null);
  const seagullsRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== "undefined" && enabled) {
      wavesRef.current = new Audio("/sounds/ocean-waves.mp3");
      seagullsRef.current = new Audio("/sounds/seagulls.mp3");

      if (wavesRef.current) {
        wavesRef.current.loop = true;
        wavesRef.current.volume = volume;
      }

      if (seagullsRef.current) {
        seagullsRef.current.loop = true;
        seagullsRef.current.volume = volume * 0.6;
      }

      const playAudio = async () => {
        try {
          if (wavesRef.current) await wavesRef.current.play();
          if (seagullsRef.current) await seagullsRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.log("Audio autoplay blocked. User interaction required.");
        }
      };

      const handleUserInteraction = () => {
        if (!isPlaying) {
          playAudio();
          document.removeEventListener("click", handleUserInteraction);
          document.removeEventListener("keydown", handleUserInteraction);
        }
      };

      document.addEventListener("click", handleUserInteraction);
      document.addEventListener("keydown", handleUserInteraction);

      playAudio();

      return () => {
        if (wavesRef.current) {
          wavesRef.current.pause();
          wavesRef.current = null;
        }
        if (seagullsRef.current) {
          seagullsRef.current.pause();
          seagullsRef.current = null;
        }
        document.removeEventListener("click", handleUserInteraction);
        document.removeEventListener("keydown", handleUserInteraction);
      };
    }
  }, [enabled, volume]);

  const toggleAudio = () => {
    if (!wavesRef.current || !seagullsRef.current) return;

    if (isPlaying) {
      wavesRef.current.pause();
      seagullsRef.current.pause();
      setIsPlaying(false);
    } else {
      wavesRef.current.play();
      seagullsRef.current.play();
      setIsPlaying(true);
    }
  };

  if (!isMounted || !enabled) return null;

  return (
    <button
      onClick={toggleAudio}
      className="fixed bottom-6 right-6 z-50 p-3 border border-bridge-white/30 hover:border-bridge-white bg-bridge-black/80 hover:bg-bridge-black transition-all duration-300"
      aria-label={isPlaying ? "Mute ambient sounds" : "Play ambient sounds"}
      title={isPlaying ? "Mute ambient sounds" : "Play ambient sounds"}
    >
      {isPlaying ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-bridge-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-bridge-white/50"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
          />
        </svg>
      )}
    </button>
  );
}
