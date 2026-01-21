"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<{ x: number; y: number; z: number; opacity: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate stars
    const starCount = 300;
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random(),
      opacity: Math.random() * 0.5 + 0.5
    }));

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (!ctx || !canvas) return;

      // Smooth mouse following
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        // Parallax effect based on mouse position and star depth
        const parallaxX = mouseX * (1 - star.z) * 50;
        const parallaxY = mouseY * (1 - star.z) * 50;

        const x = star.x + parallaxX;
        const y = star.y + parallaxY;

        const size = star.z * 2.5;
        const brightness = star.opacity * (0.5 + star.z * 0.5);

        // Mix of white and warm yellow stars
        const isYellow = star.z > 0.6;
        const starColor = isYellow
          ? `rgba(255, 220, 150, ${brightness})` // Warm yellow
          : `rgba(255, 255, 255, ${brightness})`; // White

        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow for larger stars
        if (star.z > 0.7) {
          const glowColor = isYellow ? '255, 220, 150' : '255, 255, 255';
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
          gradient.addColorStop(0, `rgba(${glowColor}, ${brightness * 0.3})`);
          gradient.addColorStop(1, `rgba(${glowColor}, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
