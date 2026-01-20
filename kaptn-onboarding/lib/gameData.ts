import { Scenario } from "@/types/game";

export const scenarios: Scenario[] = [
  {
    id: "K",
    title: "Unknown Signal",
    visual: "Radar screen with an unidentified signal",
    context: `Your venture is stable. Growing 15% quarter over quarter.
Then: an unexpected signal appears in your market space.

A competitor just raised $50M.
Their product overlaps 60% with yours.
Public launch in 90 days.`,
    question: "Your immediate response:",
    options: [
      {
        id: "SCAN",
        label: "SCAN",
        description:
          "Initiate deep analysis. Who are they? What do they know that I don't?",
        pattern: "ACTIVE_EXPLORER",
      },
      {
        id: "IGNORE",
        label: "IGNORE",
        description: "Hold course. We have our own trajectory.",
        pattern: "SELECTIVE_SCANNER",
      },
      {
        id: "REDIRECT",
        label: "REDIRECT",
        description:
          "This changes nothing about our mission. Eyes forward.",
        pattern: "MISSION_FILTER",
      },
    ],
  },
  {
    id: "T",
    title: "Conflicting Data",
    visual: "Two data streams showing contradictory trends",
    context: `Your sales data shows strong conversion.
Your customer interviews reveal deep friction.

Data says: keep pushing current approach.
Customers say: something fundamental is wrong.

These signals cannot both be right.`,
    question: "How do you resolve this?",
    options: [
      {
        id: "UPDATE_MODEL",
        label: "UPDATE MODEL",
        description:
          "The model is incomplete. I need to rebuild my understanding.",
        pattern: "RAPID_UPDATER",
      },
      {
        id: "TRUST_DATA",
        label: "TRUST DATA",
        description: "Qualitative feedback is noisy. The numbers don't lie.",
        pattern: "DATA_ANCHOR",
      },
      {
        id: "HOLD_PARADOX",
        label: "HOLD PARADOX",
        description:
          "Both can be true. I need more time to understand the structure.",
        pattern: "COMPLEXITY_HOLDER",
      },
    ],
  },
  {
    id: "P",
    title: "Multiple Vectors",
    visual: "Three pathways diverging from current position",
    context: `Three opportunities, equal potential:

Path A: New market segment (high uncertainty, high upside)
Path B: Deepen current customer base (predictable, steady growth)
Path C: Strategic partnership (medium risk, accelerated timeline)

Resources allow only ONE path for the next 6 months.`,
    question: "You choose:",
    options: [
      {
        id: "COMMIT_TO_ONE",
        label: "COMMIT TO ONE",
        description: "Select the critical path. Full focus.",
        pattern: "FOCUSED_NAVIGATOR",
      },
      {
        id: "PARALLEL_EXPLORATION",
        label: "PARALLEL EXPLORATION",
        description: "Split resources. Test all three at smaller scale.",
        pattern: "PARALLEL_PROCESSOR",
      },
      {
        id: "DEFER_DECISION",
        label: "DEFER DECISION",
        description: "Not enough information. Run experiments first.",
        pattern: "DELIBERATE_STRATEGIST",
      },
    ],
  },
  {
    id: "A",
    title: "Mission Ready",
    visual: "Countdown timer, systems armed",
    context: `Your strategy is clear.
The plan is validated.
The team is aligned.

But: you notice a small inconsistency in the financial model.
It won't change the decision, but it's... there.

Launch is scheduled for tomorrow.`,
    question: "You:",
    options: [
      {
        id: "LAUNCH_NOW",
        label: "LAUNCH NOW",
        description:
          "Execute. The inconsistency is below significance threshold.",
        pattern: "MOMENTUM_DRIVER",
      },
      {
        id: "PAUSE",
        label: "PAUSE",
        description: "Fix the inconsistency first. Even if small.",
        pattern: "COMPLETENESS_SEEKER",
      },
      {
        id: "LAUNCH_WITH_FLAG",
        label: "LAUNCH WITH FLAG",
        description:
          "Proceed, but mark the item for immediate post-launch review.",
        pattern: "PROGRESSIVE_BUILDER",
      },
    ],
  },
  {
    id: "N",
    title: "Course Deviation",
    visual: "Navigation system showing drift from original trajectory",
    context: `Six months after launch, you review the journey.

The outcome is positive: 40% growth.
But: you achieved it through a completely different approach than originally planned.

Your original thesis was about product-market fit.
Reality showed it was actually about distribution channel.`,
    question: "Your response:",
    options: [
      {
        id: "RECALIBRATE",
        label: "RECALIBRATE",
        description: "Update the model. This is new knowledge.",
        pattern: "QUICK_RECALIBRATOR",
      },
      {
        id: "QUESTION_SUCCESS",
        label: "QUESTION SUCCESS",
        description:
          "Success through wrong reasons is concerning. Dig deeper.",
        pattern: "DEEP_QUESTIONER",
      },
      {
        id: "CLAIM_ADAPTATION",
        label: "CLAIM ADAPTATION",
        description:
          "This proves our navigation ability. The goal matters, not the path.",
        pattern: "ADAPTIVE_CLAIMER",
      },
    ],
  },
];

export const protocolDescriptions = {
  K: {
    ACTIVE_EXPLORER:
      "When unknown signals appear, you tend to engage immediately and comprehensively. You view uncertainty as an invitation to expand your knowledge space.",
    SELECTIVE_SCANNER:
      "When unknown signals appear, you tend to filter through your mission lens. You maintain focus by distinguishing signal from noise.",
    MISSION_FILTER:
      "When unknown signals appear, you tend to evaluate them against core objectives. Your direction provides the filtering mechanism.",
  },
  T: {
    RAPID_UPDATER:
      "When models conflict, you tend to embrace the discomfort and rebuild. You treat cognitive models as living tools, not fixed truths.",
    DATA_ANCHOR:
      "When models conflict, you tend to trust quantitative evidence. You believe structure emerges from data, not interpretation.",
    COMPLEXITY_HOLDER:
      "When models conflict, you tend to resist premature resolution. You're comfortable holding tension until deeper patterns emerge.",
  },
  P: {
    FOCUSED_NAVIGATOR:
      "When paths diverge, you tend to commit decisively. You believe depth beats breadth when resources are constrained.",
    PARALLEL_PROCESSOR:
      "When paths diverge, you tend to maintain optionality. You view portfolio approaches as risk management at the strategic level.",
    DELIBERATE_STRATEGIST:
      "When paths diverge, you tend to gather more information. You treat premature commitment as the greater risk.",
  },
  A: {
    MOMENTUM_DRIVER:
      "When mission is ready, you tend to prioritize velocity. You believe execution creates its own clarity and that motion reveals what planning cannot.",
    COMPLETENESS_SEEKER:
      "When mission is ready, you tend to ensure integrity first. You view small inconsistencies as potential systemic indicators.",
    PROGRESSIVE_BUILDER:
      "When mission is ready, you tend to balance momentum with awareness. You execute while maintaining observability.",
  },
  N: {
    QUICK_RECALIBRATOR:
      "When drift occurs, you tend to update rapidly. You treat deviation as new information, not failure.",
    DEEP_QUESTIONER:
      "When drift occurs, you tend to investigate causality. You distinguish between lucky outcomes and sustainable models.",
    ADAPTIVE_CLAIMER:
      "When drift occurs, you tend to focus on results achieved. You view path flexibility as a strength, not a weakness.",
  },
};

export const captainsOath = [
  "I will not seek certainty.",
  "I will seek clarity.",
  "",
  "I will not seek comfort.",
  "I will seek direction.",
  "",
  "I will not seek answers.",
  "I will seek better questions.",
  "",
  "I will let reality challenge my mind,",
  "my mind challenge my models,",
  "and my models challenge my actions.",
  "",
  "This is how a Captain grows.",
];

export const siskoQuote = {
  text: [
    "It is the unknown that defines our existence.",
    "",
    "We are constantly searching, not just for answers to our questions,",
    "but for new questions.",
  ],
  author: "— Captain Benjamin Sisko",
};
