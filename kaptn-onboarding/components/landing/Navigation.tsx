"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import AuthButton from '@/components/AuthButton';

export default function Navigation() {
  const t = useTranslations('landing.nav');
  const { scrollY } = useScroll();

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(10, 14, 26, 0)', 'rgba(10, 14, 26, 0.95)']
  );

  const borderOpacity = useTransform(
    scrollY,
    [0, 100],
    [0, 0.3]
  );

  const navItems = [
    { key: 'features', href: '#features' },
    { key: 'mission', href: '#mission' },
    { key: 'contact', href: '#contact' },
  ];

  return (
    <motion.nav
      style={{ backgroundColor }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
    >
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute bottom-0 left-0 right-0 h-px bg-[#00ff88]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <img
              src="/KAPTN-flag-dark.svg"
              alt="KAPTN.ai"
              className="h-6 sm:h-7 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.key}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-gray-400 hover:text-[#00ff88] font-mono text-sm tracking-wider transition-colors relative group"
              >
                {t(item.key)}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#00ff88] group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>

          {/* Auth & Language Switcher */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <AuthButton variant="ghost" redirectTo="/onboarding" />
            <LanguageSwitcher />
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
