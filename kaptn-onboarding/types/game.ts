export type ProtocolType = "K" | "T" | "P" | "A" | "N";

export interface ScenarioOption {
  id: string;
  label: string;
  description: string;
  pattern: string;
}

export interface Scenario {
  id: ProtocolType;
  title: string;
  visual: string;
  context: string;
  question: string;
  options: ScenarioOption[];
}

export interface UserResponse {
  protocol: ProtocolType;
  selectedOption: string;
  timestamp: number;
}

export interface DecisionProfile {
  K: "ACTIVE_EXPLORER" | "SELECTIVE_SCANNER" | "MISSION_FILTER";
  T: "RAPID_UPDATER" | "DATA_ANCHOR" | "COMPLEXITY_HOLDER";
  P: "FOCUSED_NAVIGATOR" | "PARALLEL_PROCESSOR" | "DELIBERATE_STRATEGIST";
  A: "MOMENTUM_DRIVER" | "COMPLETENESS_SEEKER" | "PROGRESSIVE_BUILDER";
  N: "QUICK_RECALIBRATOR" | "DEEP_QUESTIONER" | "ADAPTIVE_CLAIMER";
}

export interface ProfileDescription {
  mode: string;
  description: string;
}

export type GamePhase =
  | "entrance"
  | "brief"
  | "scenario"
  | "oath"
  | "waitlist"
  | "processing"
  | "profile"
  | "welcome";
