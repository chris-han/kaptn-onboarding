"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import StarField from '@/components/landing/StarField';
import { QRCodeSVG } from 'qrcode.react';

interface UserInfo {
  id: string;
  name: string | null;
  email: string | null;
  badge: {
    serialNumber: string;
    captainName: string | null;
    issuedAt: string;
  } | null;
  profile: {
    captainName: string | null;
    knowledgePattern: string;
    thesisPattern: string;
    prioritizePattern: string;
    actionPattern: string;
    navigationPattern: string;
    onboardingCompleted: boolean;
    completedAt: string | null;
  } | null;
  waitlistEntry: {
    name: string;
    email: string;
    company: string | null;
    interests: string[];
    submittedAt: string;
  } | null;
}

export default function UserInfoPage() {
  const params = useParams();
  const userId = params.userId as string;
  const locale = params.locale as string;
  const t = useTranslations("onboarding.welcome");

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch(`/api/userinfo/${userId}`);
        if (!response.ok) {
          throw new Error('User not found');
        }
        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user info');
      } finally {
        setLoading(false);
      }
    }

    fetchUserInfo();
  }, [userId]);

  const handleSignup = () => {
    // Redirect to Logto sign-in with userId as state
    window.location.href = `/api/logto/sign-in?state=${userId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] relative">
        <StarField />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <p className="text-white font-mono">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] relative">
        <StarField />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-mono text-white mb-4">User Not Found</h1>
          <p className="text-white/60 font-mono mb-8">{error || 'The user information could not be retrieved.'}</p>
          <a href={`/${locale}/landing`} className="px-6 py-3 border-2 border-white text-white font-mono hover:bg-white hover:text-black transition-all">
            BACK TO LANDING
          </a>
        </div>
      </div>
    );
  }

  const captainName = userInfo.badge?.captainName || userInfo.profile?.captainName || userInfo.waitlistEntry?.name || 'Captain';
  const serialNumber = userInfo.badge?.serialNumber || userId.slice(-8).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative">
      <StarField />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 py-12">
        {/* Badge Display */}
        <div className="w-full max-w-sm mb-8" style={{ maxWidth: '340px' }}>
          <div className="relative border-2 border-white bg-black/90 p-5">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#ffd700]" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#ffd700]" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#ffd700]" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#ffd700]" />

            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-mono font-bold text-white mb-1">KAPTN</h1>
              <p className="text-xs font-mono text-white/60 uppercase tracking-wider">
                Bridge System
              </p>
            </div>

            {/* Badge Image */}
            <div className="flex justify-center mb-4">
              <div className="relative" style={{ width: '120px', height: '120px' }}>
                <img
                  src="/kaptn-badge.svg"
                  alt="KAPTN Bridge Ensignia"
                  width={120}
                  height={120}
                  className="w-[120px] h-[120px]"
                  style={{ display: 'block', maxWidth: '120px', maxHeight: '120px' }}
                />
                {/* Serial Number Overlay */}
                <div
                  className="absolute w-full"
                  style={{ top: '73%', left: 0, right: 0 }}
                >
                  <div className="flex justify-center">
                    <div className="text-white font-mono font-light text-[11px] tracking-wider">
                      {serialNumber.toLowerCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Captain Info */}
            <div className="text-center mb-4 space-y-1">
              <h2 className="text-base font-mono uppercase tracking-wider text-[#ffd700]">
                Bridge Ensignia
              </h2>
              <p className="text-sm font-inter text-white/90">
                Captain <span className="underline">{captainName}</span>
              </p>
              <p className="text-xs font-mono text-white/40 tracking-widest">
                SN: {serialNumber}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="relative p-2 border border-white/30 bg-black/40">
                {/* Corner Brackets */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ffd700]" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#ffd700]" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#ffd700]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#ffd700]" />

                {/* QR Code */}
                <QRCodeSVG
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  size={90}
                  level="M"
                  fgColor="#ffffff"
                  bgColor="transparent"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-white/20 pt-4">
              <p className="text-xs font-mono text-white/30 uppercase tracking-wider">
                Navigate the unknown with precision
              </p>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        {userInfo.profile && (
          <div className="w-full max-w-md mb-8 border-2 border-white/20 bg-black/80 p-6">
            <h2 className="text-xl font-mono text-[#ffd700] mb-4 text-center">Your Command Profile</h2>
            <div className="space-y-3 text-sm font-mono text-white/70">
              <div className="flex justify-between">
                <span>Knowledge:</span>
                <span className="text-white">{userInfo.profile.knowledgePattern.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Thesis:</span>
                <span className="text-white">{userInfo.profile.thesisPattern.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Prioritize:</span>
                <span className="text-white">{userInfo.profile.prioritizePattern.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Action:</span>
                <span className="text-white">{userInfo.profile.actionPattern.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Navigation:</span>
                <span className="text-white">{userInfo.profile.navigationPattern.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Signup Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleSignup}
            className="px-12 py-4 border-2 border-[#ffd700] bg-transparent text-[#ffd700] font-mono text-lg font-bold tracking-wider hover:bg-[#ffd700] hover:text-black transition-all uppercase"
          >
            Create Account
          </button>

          <p className="text-xs font-mono text-white/40 text-center max-w-md">
            Create your KAPTN account to access your personalized bridge system
          </p>
        </div>
      </div>
    </div>
  );
}
