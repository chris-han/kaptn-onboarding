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
    id: "sonar",
    name: "SONAR",
    fullName: "Strategic Operations & Network Analytics Reconnaissance",
    description:
      "Data: unified. Patterns: detected. Cash flow: tracked. Decision confidence: maximized.",
    protocols: ["T", "P"],
  },
] as const;
