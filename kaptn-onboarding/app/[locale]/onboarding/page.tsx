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
import Welcome from "@/components/Welcome";
import BackgroundAudio from "@/components/BackgroundAudio";
import StarField from "@/components/landing/StarField";
import ProgressBar from "@/components/ProgressBar";

// Utility function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function OnboardingPage() {
  const [phase, setPhase] = useState<GamePhase>("entrance");
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [profile, setProfile] = useState<DecisionProfile | null>(null);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [captainName, setCaptainName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

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

  const handleWaitlistComplete = (name?: string, id?: string) => {
    if (name) {
      setCaptainName(name);
    }
    if (id) {
      setUserId(id);
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
    setPhase("welcome");
  };

  const handleAssumeCommand = async () => {
    // Save profile data to database
    if (userId && profile) {
      try {
        const profileData = {
          userId,
          captainName: captainName || null,
          knowledgePattern: profile.K,
          thesisPattern: profile.T,
          prioritizePattern: profile.P,
          actionPattern: profile.A,
          navigationPattern: profile.N,
          scenarioResponses: responses,
        };

        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });

        const data = await response.json();

        if (data.success) {
          console.log('Profile saved successfully:', data);
        } else {
          console.error('Failed to save profile:', data);
        }

        // Issue badge with serial number
        try {
          console.log('[Badge] Issuing badge for userId:', userId, 'captainName:', captainName);

          const badgeResponse = await fetch('/api/badge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              captainName: captainName || null,
            }),
          });

          const badgeData = await badgeResponse.json();
          console.log('[Badge] Response:', badgeData);

          if (badgeData.success) {
            console.log('[Badge] Badge issued successfully:', badgeData.badge);
          } else {
            console.error('[Badge] Failed to issue badge:', {
              error: badgeData.error,
              message: badgeData.message,
              response: badgeData
            });
            alert(`Badge creation failed: ${badgeData.error || badgeData.message}`);
          }
        } catch (error) {
          console.error('[Badge] Error issuing badge:', error);
          alert(`Badge creation error: ${error}`);
        }
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }

    // Onboarding complete - user stays on the badge screen
  };

  const handleRestart = () => {
    // Reset all state to the very beginning
    setPhase("entrance");
    setCurrentScenarioIndex(0);
    setResponses([]);
    setProfile(null);
    setCaptainName("");
    setUserId("");
    // Trigger reshuffling of quiz options
    setShuffleTrigger(prev => prev + 1);
  };

  return (
    <main className="min-h-screen relative">
      <StarField />
      <BackgroundAudio volume={0.25} />
      <ProgressBar
        phase={phase}
        currentScenarioIndex={currentScenarioIndex}
        totalScenarios={scenarios.length}
      />

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

      {phase === "welcome" && <Welcome onAssumeCommand={handleAssumeCommand} captainName={captainName} />}
    </main>
  );
}
