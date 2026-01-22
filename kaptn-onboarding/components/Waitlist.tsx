"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { bridgeServices } from "@/types/waitlist";

interface WaitlistProps {
  onSkip: (captainName?: string) => void;
}

export default function Waitlist({ onSkip }: WaitlistProps) {
  const t = useTranslations("onboarding.waitlist");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const toggleInterest = (serviceId: string) => {
    setInterests((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          company,
          interests,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setTimeout(() => {
          onSkip(name); // Pass captain name to next phase
        }, 3000);
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Registration failed");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("System error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-2xl"
        >
          <div className="w-16 h-16 mx-auto border-2 border-bridge-green rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-bridge-green rounded-full animate-pulse-glow" />
          </div>
          <h2 className="text-2xl font-mono uppercase">
            {t("title")}
          </h2>
          <p className="bridge-text text-bridge-white/80">
            {t("subtitle")}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-8 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl w-full space-y-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2"
        >
          <h2 className="text-xl sm:text-2xl font-mono uppercase tracking-wider">
            KAPTN Enterprise Bridge
          </h2>
          <p className="text-base sm:text-lg bridge-text">
            Pre-Launch Access
          </p>
          <div className="h-px w-32 bg-bridge-white/30 mx-auto" />
          <p className="bridge-text text-xs sm:text-sm text-bridge-white/70 max-w-2xl mx-auto">
            Four bridge systems. One mission. Navigate your venture from anywhere.
          </p>
        </motion.div>

        {/* Bridge Systems Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-3"
        >
          {bridgeServices.map((service, index) => {
            const isSelected = interests.includes(service.id);
            return (
              <motion.button
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => toggleInterest(service.id)}
                className={`p-3 sm:p-4 border text-left transition-all ${
                  isSelected
                    ? "border-bridge-blue bg-bridge-blue/10"
                    : "border-bridge-white/30 hover:border-bridge-white/50"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-mono font-bold">
                      {service.name}
                    </h3>
                    <div
                      className={`w-5 h-5 border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-bridge-blue bg-bridge-blue"
                          : "border-bridge-white/50"
                      }`}
                    >
                      {isSelected && (
                        <div className="text-bridge-black text-xs">✓</div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-bridge-white/50 uppercase tracking-wide">
                    {service.protocols.join(" • ")} Protocol
                  </p>
                  <p className="text-sm text-bridge-white/70 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Registration Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onSubmit={handleSubmit}
          className="bg-bridge-white/5 border border-bridge-white/20 p-4 sm:p-6 space-y-4 max-w-2xl mx-auto"
        >
          <h3 className="font-mono text-base sm:text-lg uppercase text-center">
            Request Bridge Access
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs sm:text-sm bridge-text mb-1">
                {t("form.name")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-black border border-bridge-white/30 p-2 text-sm text-white font-mono focus:border-bridge-blue focus:outline-none"
                placeholder={t("form.namePlaceholder")}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm bridge-text mb-1">
                {t("form.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black border border-bridge-white/30 p-2 text-sm text-white font-mono focus:border-bridge-blue focus:outline-none"
                placeholder={t("form.emailPlaceholder")}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm bridge-text mb-1">
                {t("form.company")}
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-black border border-bridge-white/30 p-2 text-sm text-white font-mono focus:border-bridge-blue focus:outline-none"
                placeholder={t("form.companyPlaceholder")}
              />
            </div>
          </div>

          <AnimatePresence>
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 border border-bridge-red bg-bridge-red/10 text-sm"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="flex-1 bridge-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("form.submit")}
            </button>
            <button
              type="button"
              onClick={() => onSkip()}
              className="px-6 py-4 border border-bridge-white/30 hover:border-bridge-white/50 transition-all font-mono uppercase tracking-wider text-sm"
            >
              {t("form.skip")}
            </button>
          </div>

          <p className="text-xs text-center text-bridge-white/50 bridge-text">
            Systems launch Q2 2026. Early access priority given to pre-launch registrants.
          </p>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-bridge-white/40 bridge-text"
        >
          "The unknown awaits."
        </motion.div>
      </motion.div>
    </div>
  );
}
