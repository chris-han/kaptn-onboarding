"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface KAPTNBadgeProps {
  size?: number;
  animate?: boolean;
}

export default function KAPTNBadge({ size = 200, animate = false }: KAPTNBadgeProps) {
  const t = useTranslations("onboarding.badge");

  return (
    <motion.div
      initial={animate ? { scale: 0, rotate: -180 } : {}}
      animate={animate ? { scale: 1, rotate: 0 } : {}}
      transition={{ duration: 1.2, type: "spring", stiffness: 100 }}
      className="flex items-center justify-center"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle border */}
        <circle
          cx="100"
          cy="100"
          r="95"
          stroke="#FFD700"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />

        {/* Inner circle */}
        <circle
          cx="100"
          cy="100"
          r="85"
          stroke="#FFD700"
          strokeWidth="1"
          fill="none"
          opacity="0.2"
        />

        {/* Double Diamond - Design Thinking Process */}
        {/* First Diamond: Discover -> Define (left) */}
        <path
          d="M 50 100 L 75 70 L 100 100 L 75 130 Z"
          fill="#FFD700"
          stroke="#FFD700"
          strokeWidth="2"
          opacity="0.9"
        />

        {/* Second Diamond: Develop -> Deliver (right) */}
        <path
          d="M 100 100 L 125 70 L 150 100 L 125 130 Z"
          fill="#FFD700"
          stroke="#FFD700"
          strokeWidth="2"
          opacity="0.9"
        />

        {/* Central connecting line */}
        <line
          x1="50"
          y1="100"
          x2="150"
          y2="100"
          stroke="#FFD700"
          strokeWidth="2.5"
          opacity="0.8"
        />

        {/* Top arc - representing journey/voyage */}
        <path
          d="M 60 100 Q 100 50, 140 100"
          stroke="#FFD700"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
          strokeDasharray="3,3"
        />

        {/* Bottom arc - representing foundation */}
        <path
          d="M 60 100 Q 100 150, 140 100"
          stroke="#FFD700"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
          strokeDasharray="3,3"
        />

        {/* KAPTN text curved at top */}
        <path
          id="topCurve"
          d="M 40 100 A 60 60 0 0 1 160 100"
          fill="none"
        />
        <text
          fill="#FFD700"
          fontSize="16"
          fontWeight="bold"
          letterSpacing="4"
          fontFamily="monospace"
        >
          <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
            {t("title")}
          </textPath>
        </text>

        {/* Bridge System text curved at bottom */}
        <path
          id="bottomCurve"
          d="M 160 100 A 60 60 0 0 1 40 100"
          fill="none"
        />
        <text
          fill="#FFD700"
          fontSize="9"
          letterSpacing="2"
          fontFamily="monospace"
          opacity="0.8"
        >
          <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">
            {t("subtitle")}
          </textPath>
        </text>

        {/* Central dot - the captain */}
        <circle
          cx="100"
          cy="100"
          r="4"
          fill="#FFD700"
          opacity="0.9"
        />

        {/* Four corner stars - aligned with text curves on 60-radius circle */}
        <g opacity="0.6">
          {/* Upper left star - aligned with KAPTN curve */}
          <path d="M 58 58 L 60 63 L 65 63 L 61 66 L 63 71 L 58 68 L 53 71 L 55 66 L 51 63 L 56 63 Z" fill="#FFD700" />
          {/* Upper right star - aligned with KAPTN curve */}
          <path d="M 142 58 L 144 63 L 149 63 L 145 66 L 147 71 L 142 68 L 137 71 L 139 66 L 135 63 L 140 63 Z" fill="#FFD700" />
          {/* Lower left star - aligned with BRIDGE SYSTEM curve */}
          <path d="M 58 142 L 60 147 L 65 147 L 61 150 L 63 155 L 58 152 L 53 155 L 55 150 L 51 147 L 56 147 Z" fill="#FFD700" />
          {/* Lower right star - aligned with BRIDGE SYSTEM curve */}
          <path d="M 142 142 L 144 147 L 149 147 L 145 150 L 147 155 L 142 152 L 137 155 L 139 150 L 135 147 L 140 147 Z" fill="#FFD700" />
        </g>

        {/* Outer glow effect */}
        <circle
          cx="100"
          cy="100"
          r="95"
          stroke="#FFD700"
          strokeWidth="1"
          fill="none"
          opacity="0.1"
        />
      </svg>
    </motion.div>
  );
}
