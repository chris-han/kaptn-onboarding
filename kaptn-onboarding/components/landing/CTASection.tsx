"use client";

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface CTASectionProps {
  onCTAClick: () => void;
}

export default function CTASection({ onCTAClick }: CTASectionProps) {
  const t = useTranslations('landing.cta');

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Holographic Grid Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(0deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.1), transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main CTA Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative border-2 border-white bg-[#0a0e1a]/90 backdrop-blur-md p-8 sm:p-12 md:p-16"
        >
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />

          {/* Content */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              textShadow: '0 0 30px rgba(0, 255, 136, 0.3)',
            }}
          >
            {t('title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-white text-lg sm:text-xl font-mono mb-12"
          >
            {t('subtitle')}
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={onCTAClick}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-10 sm:px-16 py-5 sm:py-6 border-2 border-white bg-transparent text-white font-mono text-base sm:text-lg font-bold tracking-[0.2em] overflow-hidden transition-all hover:bg-white hover:text-black"
          >
            <span className="relative z-10">{t('button')}</span>

            {/* Animated Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
              animate={{
                x: ['-200%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.button>

          {/* Note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-gray-500 text-xs sm:text-sm font-mono"
          >
            › {t('note')}
          </motion.p>

          {/* Pulsing Border Effect */}
          <motion.div
            className="absolute inset-0 border-2 border-white pointer-events-none"
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
