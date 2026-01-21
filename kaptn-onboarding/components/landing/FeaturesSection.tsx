"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FeaturesSection() {
  const t = useTranslations('landing.features');
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = cardsRef.current;

    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 100,
          rotationX: -30,
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            end: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const features = [
    {
      key: 'profile',
      icon: '⟨ ⊗ ⟩',
      color: '#00ff88',
    },
    {
      key: 'navigation',
      icon: '⟨ ◈ ⟩',
      color: '#4a90e2',
    },
    {
      key: 'intelligence',
      icon: '⟨ ◉ ⟩',
      color: '#ff6b35',
    },
    {
      key: 'communication',
      icon: '⟨ ⊕ ⟩',
      color: '#00ff88',
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at center, #00ff88 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4 px-4 py-1 border border-[#00ff88]/30 bg-[#00ff88]/5"
          >
            <span className="text-[#00ff88] font-mono text-xs tracking-[0.3em]">
              {t('subtitle')}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            {t('title')}
          </motion.h2>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.key}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full border border-[#00ff88]/20 bg-[#0a0e1a]/80 backdrop-blur-sm p-6 sm:p-8 overflow-hidden transition-all duration-500 hover:border-[#00ff88]/60">
                {/* Animated Background */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${feature.color}10, transparent 70%)`,
                  }}
                />

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ borderColor: feature.color }}
                />

                {/* Icon */}
                <div className="relative mb-6">
                  <div
                    className="text-5xl sm:text-6xl font-mono opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 font-mono tracking-wider">
                    {t(`items.${feature.key}.title`)}
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                    {t(`items.${feature.key}.description`)}
                  </p>
                </div>

                {/* Hover Line Effect */}
                <div
                  className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                  style={{ backgroundColor: feature.color }}
                />
              </div>

              {/* Glitch Effect on Hover */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100">
                <div
                  className="absolute inset-0 mix-blend-screen animate-glitch"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${feature.color}20 50%, transparent 100%)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes glitch {
          0%, 100% {
            transform: translate(0);
          }
          25% {
            transform: translate(-2px, 2px);
          }
          50% {
            transform: translate(2px, -2px);
          }
          75% {
            transform: translate(-2px, -2px);
          }
        }

        .animate-glitch {
          animation: glitch 0.3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
