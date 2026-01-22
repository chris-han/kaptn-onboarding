"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface EntranceProps {
  onBegin: () => void;
}

export default function Entrance({ onBegin }: EntranceProps) {
  const t = useTranslations("onboarding.entrance");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 py-8 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center space-y-8 max-w-2xl"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="bridge-text text-lg sm:text-xl"
        >
          {t("line1")}
          <br />
          {t("line2")}
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={onBegin}
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
