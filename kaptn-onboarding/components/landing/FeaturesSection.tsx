"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Mil-spec tactical icons
const CompassIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="5" x2="12" y2="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <polyline points="10.5,4 12,2.5 13.5,4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="5" y1="12" x2="3.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="19" y1="12" x2="20.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const LedgerIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="5" y="5" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="8" y1="7" x2="8" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="11" y1="7" x2="11" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="14" y1="7" x2="14" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="7" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M5 15a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="13" r="1.4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <polyline points="7,16.5 5.5,18 7,19.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17,16.5 18.5,18 17,19.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SonarIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="12" cy="10" r="1.3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 12a4 4 0 0 1 8 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M6 13.5a6 6 0 0 1 12 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 15a8 8 0 0 1 16 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <polyline points="10,17.5 12,19.5 14,17.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function FeaturesSection() {
  const t = useTranslations('landing.features');
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = cardsRef.current;

    cards.forEach((card) => {
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
      key: 'compass',
      IconComponent: CompassIcon,
      color: '#00ff88',
    },
    {
      key: 'ledger',
      IconComponent: LedgerIcon,
      color: '#ff6b35',
    },
    {
      key: 'shield',
      IconComponent: ShieldIcon,
      color: '#9b59b6',
    },
    {
      key: 'sonar',
      IconComponent: SonarIcon,
      color: '#00d4ff',
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
                    className="w-16 h-16 sm:w-20 sm:h-20 opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ color: feature.color }}
                  >
                    <feature.IconComponent />
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
