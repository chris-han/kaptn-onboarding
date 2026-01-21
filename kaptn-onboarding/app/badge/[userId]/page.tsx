"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import StarField from '@/components/landing/StarField';

export default function BadgeDownloadPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [captainName, setCaptainName] = useState<string>("");

  useEffect(() => {
    // Try to get captain name from localStorage or session
    const storedName = localStorage.getItem('captainName');
    if (storedName) {
      setCaptainName(storedName);
    }
  }, []);

  const handleDownload = () => {
    // Trigger download of badge as image
    const badgeElement = document.getElementById('badge-card');
    if (badgeElement) {
      // Use html2canvas or similar library to convert to image
      // For now, we'll use the browser's print functionality
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative">
      <StarField />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Badge Card */}
        <div id="badge-card" className="w-full max-w-md">
          <div className="relative border-4 border-white bg-black/90 p-8">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#ffd700]" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#ffd700]" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#ffd700]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#ffd700]" />

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-mono font-bold text-white mb-2">KAPTN</h1>
              <p className="text-sm font-mono text-white/60 uppercase tracking-wider">
                Enterprise Bridge Command
              </p>
            </div>

            {/* Diamond Badge */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-[#ffd700] bg-black transform rotate-45 flex items-center justify-center">
                  <div className="transform -rotate-45 text-center">
                    <div className="text-4xl font-mono font-bold text-[#ffd700]">K</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Captain Info */}
            <div className="text-center mb-6 space-y-2">
              <h2 className="text-xl font-mono uppercase tracking-wider text-[#ffd700]">
                Bridge Ensignia
              </h2>
              {captainName && (
                <p className="text-lg font-inter text-white/90">
                  Captain <span className="underline">{captainName}</span>
                </p>
              )}
              <p className="text-sm font-mono text-white/40 tracking-widest">
                SN: {userId.toUpperCase()}
              </p>
            </div>

            {/* User ID Display */}
            <div className="border-t border-b border-white/20 py-4 mb-6">
              <div className="text-center">
                <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                  User Identification
                </p>
                <div className="text-white font-mono font-light text-sm tracking-wider">
                  {userId.slice(-8)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-xs font-mono text-white/30 uppercase tracking-wider">
                Navigate the unknown with precision
              </p>
            </div>
          </div>
        </div>

        {/* Download Actions */}
        <div className="mt-8 flex gap-4 print:hidden">
          <button
            onClick={handleDownload}
            className="px-8 py-3 border-2 border-white bg-transparent text-white font-mono text-sm font-bold tracking-wider hover:bg-white hover:text-black transition-all"
          >
            DOWNLOAD / PRINT
          </button>
          <a
            href="/landing"
            className="px-8 py-3 border-2 border-white/30 bg-transparent text-white/70 font-mono text-sm font-bold tracking-wider hover:border-white hover:text-white transition-all"
          >
            BACK TO LANDING
          </a>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
