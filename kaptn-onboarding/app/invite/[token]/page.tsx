'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  const [status, setStatus] = useState<'verifying' | 'valid' | 'invalid' | 'expired'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('Invalid invitation link');
      return;
    }

    // Verify the invitation token
    const verifyInvitation = async () => {
      try {
        const response = await fetch('/api/waitlist/verify-invitation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error?.includes('expired')) {
            setStatus('expired');
            setMessage('This invitation has expired. Please contact support for a new invitation.');
          } else {
            setStatus('invalid');
            setMessage(data.error || 'Invalid invitation');
          }
          return;
        }

        // Token is valid
        setStatus('valid');
        setMessage(`Welcome, ${data.name}! Redirecting to bridge activation...`);

        // Store invitation token in cookie for the callback to use
        document.cookie = `kaptn_invitation_token=${token}; path=/; max-age=600; secure; samesite=lax`;

        // Redirect to Logto sign-in after a brief delay
        setTimeout(() => {
          window.location.href = `/api/logto/sign-in?redirectTo=/onboarding&invitation=${token}`;
        }, 2000);
      } catch (error) {
        console.error('Error verifying invitation:', error);
        setStatus('invalid');
        setMessage('Failed to verify invitation. Please try again.');
      }
    };

    verifyInvitation();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="border border-[#00ff88] bg-[#1a1f2e] p-8">
          {/* Header */}
          <div className="border-b border-[#00ff88] pb-4 mb-6">
            <h1 className="text-2xl font-mono text-[#00ff88] text-center tracking-wider">
              [ BRIDGE ACCESS ]
            </h1>
          </div>

          {/* Status Messages */}
          <div className="space-y-4 text-center">
            {status === 'verifying' && (
              <div className="animate-pulse">
                <p className="font-mono text-sm mb-2">VERIFYING AUTHORIZATION...</p>
                <div className="w-full h-1 bg-[#00ff88]/20 overflow-hidden">
                  <div className="h-full bg-[#00ff88] animate-[loading_1s_ease-in-out_infinite]"></div>
                </div>
              </div>
            )}

            {status === 'valid' && (
              <div>
                <div className="mb-4 text-[#00ff88] text-4xl">✓</div>
                <p className="font-mono text-sm text-[#00ff88]">AUTHORIZATION CONFIRMED</p>
                <p className="font-mono text-xs mt-4 text-gray-400">{message}</p>
              </div>
            )}

            {status === 'expired' && (
              <div>
                <div className="mb-4 text-[#ffd700] text-4xl">⚠</div>
                <p className="font-mono text-sm text-[#ffd700]">AUTHORIZATION EXPIRED</p>
                <p className="font-mono text-xs mt-4 text-gray-400">{message}</p>
                <a
                  href="/landing#contact"
                  className="inline-block mt-6 px-6 py-3 bg-[#ffd700] text-black font-mono text-sm hover:bg-[#ffed4e] transition-colors"
                >
                  CONTACT SUPPORT
                </a>
              </div>
            )}

            {status === 'invalid' && (
              <div>
                <div className="mb-4 text-red-500 text-4xl">✗</div>
                <p className="font-mono text-sm text-red-500">AUTHORIZATION DENIED</p>
                <p className="font-mono text-xs mt-4 text-gray-400">{message}</p>
                <a
                  href="/landing"
                  className="inline-block mt-6 px-6 py-3 bg-[#ffd700] text-black font-mono text-sm hover:bg-[#ffed4e] transition-colors"
                >
                  RETURN TO LANDING
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="font-mono text-xs text-gray-500">
            © 2026 KAPTN SYSTEMS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
}
