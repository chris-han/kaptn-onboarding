"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useTranslations } from 'next-intl';

interface HeroSectionProps {
  onCTAClick: () => void;
}

export default function HeroSection({ onCTAClick }: HeroSectionProps) {
  const t = useTranslations('landing.hero');
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!titleRef.current || !gridRef.current) return;

    const timeline = gsap.timeline();

    // Animate title characters
    const titleText = titleRef.current.textContent || '';
    titleRef.current.innerHTML = titleText
      .split('')
      .map((char) => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
      .join('');

    timeline
      .from(titleRef.current.children, {
        opacity: 0,
        y: 100,
        rotationX: -90,
        stagger: 0.03,
        duration: 0.8,
        ease: 'power4.out',
      })
      .from(
        gridRef.current,
        {
          opacity: 0,
          scale: 1.2,
          duration: 1.5,
          ease: 'power2.out',
        },
        '-=0.5'
      );

    // Floating animation for grid
    gsap.to(gridRef.current, {
      y: -20,
      duration: 3,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }, []);

  const stats = [
    { value: '12,847', label: t('stats.captains') },
    { value: '1.2M+', label: t('stats.protocols') },
    { value: '99.98%', label: t('stats.uptime') },
  ];

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
      {/* Holographic Grid Overlay */}
      <div
        ref={gridRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(0deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(1000px) rotateX(60deg)',
          transformOrigin: 'center center',
        }}
      />

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="scanline" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-block mb-8"
        >
          <div className="px-6 py-2 border border-[#00ff88]/50 bg-[#00ff88]/5 backdrop-blur-sm">
            <span className="text-[#00ff88] font-mono text-xs sm:text-sm tracking-[0.3em]">
              {t('badge')}
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 text-white tracking-tight whitespace-nowrap"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            textShadow: '0 0 40px rgba(0, 255, 136, 0.3)',
          }}
        >
          {t('title')}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-xl sm:text-2xl md:text-3xl text-[#00ff88] font-mono mb-4"
        >
          {t('subtitle')}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-gray-400 text-sm sm:text-base md:text-lg max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          {t('description')}
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={onCTAClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative px-8 sm:px-12 py-4 sm:py-5 bg-transparent border-2 border-white text-white font-mono text-sm sm:text-base font-bold tracking-[0.2em] overflow-hidden transition-all hover:text-black"
        >
          <span className="relative z-10">{t('cta')}</span>
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            style={{ originX: 0 }}
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-white animate-pulse" />
          </div>
        </motion.button>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mt-16 sm:mt-24 grid grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
              className="border border-[#00ff88]/20 bg-[#0a0e1a]/50 backdrop-blur-sm p-4 sm:p-6"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#00ff88] font-mono mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-mono tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }

        .scanline {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(0, 255, 136, 0.5),
            transparent
          );
          animation: scan 4s linear infinite;
        }
      `}</style>
    </section>
  );
}
