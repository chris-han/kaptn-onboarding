"use client";

import { useState, useMemo } from "react";
import { GamePhase, UserResponse, DecisionProfile, ProtocolType, Scenario } from "@/types/game";
import { scenarios as originalScenarios } from "@/lib/gameData";
import Entrance from "@/components/Entrance";
import Brief from "@/components/Brief";
import ScenarioView from "@/components/ScenarioView";
import Oath from "@/components/Oath";
import Waitlist from "@/components/Waitlist";
import Processing from "@/components/Processing";
import Profile from "@/components/Profile";
import Quote from "@/components/Quote";
import Welcome from "@/components/Welcome";
import BackgroundAudio from "@/components/BackgroundAudio";

// Utility function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Home() {
  const [phase, setPhase] = useState<GamePhase>("entrance");
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [profile, setProfile] = useState<DecisionProfile | null>(null);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [captainName, setCaptainName] = useState<string>("");

  // Randomize scenario options on every restart
  const scenarios = useMemo<Scenario[]>(() => {
    return originalScenarios.map(scenario => ({
      ...scenario,
      options: shuffleArray(scenario.options)
    }));
  }, [shuffleTrigger]);

  const handleBegin = () => {
    setPhase("brief");
  };

  const handleStartScenarios = () => {
    setPhase("scenario");
  };

  const handleScenarioResponse = (optionId: string, pattern: string) => {
    const currentScenario = scenarios[currentScenarioIndex];
    
    const newResponse: UserResponse = {
      protocol: currentScenario.id,
      selectedOption: optionId,
      timestamp: Date.now(),
    };

    setResponses([...responses, newResponse]);

    // Move to next scenario or oath
    if (currentScenarioIndex < scenarios.length - 1) {
      setTimeout(() => {
        setCurrentScenarioIndex(currentScenarioIndex + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setPhase("oath");
      }, 300);
    }
  };

  const handleOathAffirm = () => {
    setPhase("waitlist");
  };

  const handleWaitlistComplete = (name?: string) => {
    if (name) {
      setCaptainName(name);
    }
    setPhase("processing");
  };

  const handleProcessingComplete = () => {
    // Generate profile from responses
    const generatedProfile: DecisionProfile = {
      K: "ACTIVE_EXPLORER",
      T: "RAPID_UPDATER",
      P: "FOCUSED_NAVIGATOR",
      A: "MOMENTUM_DRIVER",
      N: "QUICK_RECALIBRATOR",
    };

    // Map actual responses to profile
    responses.forEach((response) => {
      const scenario = scenarios.find((s) => s.id === response.protocol);
      if (scenario) {
        const option = scenario.options.find(
          (o) => o.id === response.selectedOption
        );
        if (option && response.protocol in generatedProfile) {
          (generatedProfile as any)[response.protocol] = option.pattern;
        }
      }
    });

    setProfile(generatedProfile);
    setPhase("profile");
  };

  const handleProfileContinue = () => {
    setPhase("quote");
  };

  const handleQuoteContinue = () => {
    setPhase("welcome");
  };

  const handleAssumeCommand = () => {
    // Save profile data
    const sessionData = {
      profile,
      responses,
      timestamp: Date.now(),
    };

    console.log("Session completed:", sessionData);

    // Here you would typically:
    // 1. Send data to backend API
    // 2. Store in database
    // 3. Redirect to main application

    // Onboarding complete - user stays on the badge screen
  };

  const handleRestart = () => {
    // Reset all state to the very beginning
    setPhase("entrance");
    setCurrentScenarioIndex(0);
    setResponses([]);
    setProfile(null);
    setCaptainName("");
    // Trigger reshuffling of quiz options
    setShuffleTrigger(prev => prev + 1);
  };

  return (
    <main className="min-h-screen">
      <BackgroundAudio volume={0.25} />

      {phase === "entrance" && <Entrance onBegin={handleBegin} />}
      
      {phase === "brief" && <Brief onContinue={handleStartScenarios} />}
      
      {phase === "scenario" && (
        <ScenarioView
          scenario={scenarios[currentScenarioIndex]}
          onSelect={handleScenarioResponse}
        />
      )}
      
      {phase === "oath" && <Oath onAffirm={handleOathAffirm} />}
      
      {phase === "waitlist" && <Waitlist onSkip={handleWaitlistComplete} />}
      
      {phase === "processing" && (
        <Processing onComplete={handleProcessingComplete} />
      )}
      
      {phase === "profile" && profile && (
        <Profile profile={profile} onContinue={handleProfileContinue} />
      )}
      
      {phase === "quote" && <Quote onContinue={handleQuoteContinue} />}
      
      {phase === "welcome" && <Welcome onAssumeCommand={handleAssumeCommand} onRestart={handleRestart} captainName={captainName} />}
    </main>
  );
}
