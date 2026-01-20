export interface WaitlistFormData {
  email: string;
  name: string;
  company?: string;
  interests: string[];
}

export interface WaitlistResponse {
  success: boolean;
  message: string;
}

export const bridgeServices = [
  {
    id: "compass",
    name: "COMPASS",
    fullName: "Cognitive Operations & Mission Planning AI Support System",
    description:
      "Real-time decision support. 24/7 mission intelligence. Your business, translated into actionable clarity.",
    protocols: ["K", "T"],
  },
  {
    id: "genesis",
    name: "GENESIS",
    fullName: "Global Entity Network & Establishment System for International Startups",
    description:
      "Launch trajectory: China market. Complete entity formation protocol. From filing to operation clearance.",
    protocols: ["P", "A"],
  },
  {
    id: "ledger",
    name: "LEDGER",
    fullName: "Live Enterprise Data Gateway & Reconciliation",
    description:
      "Financial state: visible. Monthly reconciliation: automated. Growth vectors: identified.",
    protocols: ["K", "N"],
  },
  {
    id: "shield",
    name: "SHIELD",
    fullName: "Strategic Holdings & Income Enforcement for Legal Defense",
    description:
      "Tax exposure: minimized. Compliance status: protected. Deduction optimization: active.",
    protocols: ["P", "N"],
  },
  {
    id: "oracle",
    name: "ORACLE",
    fullName: "Operations Research & Analytics for Critical Leadership Excellence",
    description:
      "Data: unified. Trends: detected. Ad performance: measured. Decision confidence: high.",
    protocols: ["T", "P"],
  },
] as const;
