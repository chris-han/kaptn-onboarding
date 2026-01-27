"use client";

import { useRouter } from 'next/navigation';
import StarField from '@/components/landing/StarField';
import Navigation from '@/components/landing/Navigation';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import QuoteSection from '@/components/landing/QuoteSection';
import MissionSection from '@/components/landing/MissionSection';
import CTASection from '@/components/landing/CTASection';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  const router = useRouter();

  const handleCTAClick = () => {
    // Navigate to the onboarding experience
    router.push('/onboarding');
  };

  return (
    <div className="relative min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden">
      {/* Star Field Background */}
      <StarField />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection onCTAClick={handleCTAClick} />

        <QuoteSection />

        <div id="mission">
          <MissionSection />
        </div>

        <div id="features">
          <FeaturesSection />
        </div>

        <div id="contact">
          <CTASection onCTAClick={handleCTAClick} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#00ff88]/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-xs sm:text-sm font-mono">
              © 2026 KAPTN SYSTEMS. ALL RIGHTS RESERVED.
            </div>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-gray-500 hover:text-[#00ff88] text-xs sm:text-sm font-mono transition-colors"
              >
                PRIVACY
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-[#00ff88] text-xs sm:text-sm font-mono transition-colors"
              >
                TERMS
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-[#00ff88] text-xs sm:text-sm font-mono transition-colors"
              >
                SUPPORT
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
