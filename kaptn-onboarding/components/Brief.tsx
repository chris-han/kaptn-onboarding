"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface BriefProps {
  onContinue: () => void;
}

export default function Brief({ onContinue }: BriefProps) {
  const t = useTranslations("onboarding.brief");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 py-8 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 max-w-2xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-4"
        >
          <p className="bridge-text text-lg sm:text-xl leading-relaxed">
            {t("line1")}
            <br />
            {t("line2")}
          </p>

          <div className="h-px w-32 bg-bridge-white/30 mx-auto" />

          <p className="bridge-text text-sm sm:text-base leading-relaxed text-bridge-white/80">
            {t("line3")}
            <br />
            {t("line4")}
            <br />
            {t("line5")}
            <br />
            {t("line6")}
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={onContinue}
          className="bridge-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t("button")}
        </motion.button>
      </motion.div>
    </div>
  );
}
