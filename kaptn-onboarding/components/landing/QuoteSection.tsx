"use client";

import { motion } from 'framer-motion';

export default function QuoteSection() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-2xl sm:text-3xl md:text-4xl text-white leading-relaxed font-mono"
          >
            It is the unknown that defines our existence.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-2xl sm:text-3xl md:text-4xl text-white leading-relaxed font-mono"
          >
            We are constantly searching, not just for answers to our questions,
            <br />
            but for new questions.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-base sm:text-lg text-gray-400 italic font-mono pt-4"
          >
            — Captain Benjamin Sisko
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
