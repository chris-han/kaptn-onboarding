"use client";

import { useParams, usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Locale } from '@/i18n/config';
import { setLocaleCookie } from '@/lib/locale';

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'zh', label: '中', name: '中文' },
  { code: 'ja', label: '日', name: '日本語' },
  { code: 'ko', label: '한', name: '한국어' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = (params?.locale as Locale) || 'en';
  const currentLang = languages.find(lang => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (code: string) => {
    // Set the locale cookie to persist the user's language preference
    // This cookie is read by next-intl middleware for locale detection
    setLocaleCookie(code);

    // Remove the current locale from the pathname and add the new one
    // pathname is like "/en/landing" or "/landing"
    const segments = pathname.split('/').filter(Boolean);

    // Check if first segment is a locale
    const firstSegment = segments[0];
    const isLocaleInPath = ['en', 'zh', 'ja', 'ko'].includes(firstSegment);

    let newPathname;
    if (isLocaleInPath) {
      // Replace the locale: /en/landing -> /zh/landing
      segments[0] = code;
      newPathname = '/' + segments.join('/');
    } else {
      // Add the locale: /landing -> /zh/landing
      newPathname = `/${code}/${segments.join('/')}`;
    }

    router.push(newPathname);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#1a2332]/50 border border-[#00ff88]/30 text-[#00ff88] font-mono text-sm backdrop-blur-sm hover:bg-[#1a2332]/70 hover:border-[#00ff88]/60 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xs opacity-70">LANG:</span>
        <span className="font-bold">{currentLang.label}</span>
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="text-[#00ff88]"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-[#0a0e1a] border border-[#00ff88]/30 backdrop-blur-md overflow-hidden z-50"
          >
            {languages.map((lang, index) => (
              <motion.button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-3 text-left font-mono text-sm flex justify-between items-center transition-colors ${
                  lang.code === currentLocale
                    ? 'bg-[#00ff88]/20 text-[#00ff88]'
                    : 'text-gray-400 hover:bg-[#1a2332]/50 hover:text-[#00ff88]'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <span>{lang.name}</span>
                <span className="text-xs opacity-70">{lang.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
