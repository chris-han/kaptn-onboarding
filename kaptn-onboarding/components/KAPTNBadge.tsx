"use client";

import { motion } from "framer-motion";

interface KAPTNBadgeProps {
  size?: number;
  animate?: boolean;
}

export default function KAPTNBadge({ size = 200, animate = false }: KAPTNBadgeProps) {
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
            KAPTN
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
            BRIDGE SYSTEM
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

        {/* Four corner stars representing navigation - positioned on circle */}
        <g opacity="0.6">
          {/* Upper left star at ~33, 26 */}
          <path d="M 33 26 L 35 31 L 40 31 L 36 34 L 38 39 L 33 36 L 28 39 L 30 34 L 26 31 L 31 31 Z" fill="#FFD700" />
          {/* Upper right star at ~167, 26 */}
          <path d="M 167 26 L 169 31 L 174 31 L 170 34 L 172 39 L 167 36 L 162 39 L 164 34 L 160 31 L 165 31 Z" fill="#FFD700" />
          {/* Lower left star at ~33, 160 */}
          <path d="M 33 160 L 35 165 L 40 165 L 36 168 L 38 173 L 33 170 L 28 173 L 30 168 L 26 165 L 31 165 Z" fill="#FFD700" />
          {/* Lower right star at ~167, 160 */}
          <path d="M 167 160 L 169 165 L 174 165 L 170 168 L 172 173 L 167 170 L 162 173 L 164 168 L 160 165 L 165 165 Z" fill="#FFD700" />
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
