"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function MissionSection() {
  const t = useTranslations('landing.mission');
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    gsap.fromTo(
      contentRef.current,
      {
        opacity: 0,
        scale: 0.9,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top 70%',
          end: 'top 40%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      {/* Diagonal Background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div
          className="absolute inset-0 transform rotate-12 scale-150"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 50px,
              #00ff88 50px,
              #00ff88 51px
            )`,
          }}
        />
      </div>

      <div ref={contentRef} className="relative z-10 max-w-4xl mx-auto">
        <div className="border-l-4 border-[#00ff88] pl-6 sm:pl-12">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            {t('title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed mb-12"
          >
            {t('content')}
          </motion.p>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="border border-[#00ff88]/30 bg-[#00ff88]/5 p-6 sm:p-8"
          >
            <p className="text-[#00ff88] text-lg sm:text-xl md:text-2xl font-mono mb-4 italic">
              {t('quote')}
            </p>
            <p className="text-gray-500 text-sm font-mono">
              {t('author')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
