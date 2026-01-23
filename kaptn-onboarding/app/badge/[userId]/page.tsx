"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import StarField from '@/components/landing/StarField';

export default function BadgeDownloadPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [captainName, setCaptainName] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Try to get captain name from localStorage or session
    const storedName = localStorage.getItem('captainName');
    if (storedName) {
      setCaptainName(storedName);
    }
  }, []);

  const handleDownload = async () => {
    setDownloading(true);

    const badgeElement = document.getElementById('badge-card');
    if (badgeElement) {
      try {
        // Wait a moment for fonts and images to fully load
        await new Promise(resolve => setTimeout(resolve, 100));

        // Use html2canvas to convert the badge to PNG
        const canvas = await html2canvas(badgeElement, {
          backgroundColor: '#0a0e1a',
          scale: 2, // Higher quality
          logging: false,
          useCORS: true, // Enable CORS for images
          allowTaint: true,
          imageTimeout: 0,
          // Add some padding to ensure nothing is cut off
          scrollX: 0,
          scrollY: 0,
          windowWidth: badgeElement.scrollWidth,
          windowHeight: badgeElement.scrollHeight,
        });

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const serialNumber = userId.slice(-8).toUpperCase();
            link.download = `KAPTN-Badge-${serialNumber}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
          setDownloading(false);
        }, 'image/png');
      } catch (error) {
        console.error('Error generating badge image:', error);
        setDownloading(false);
        alert('Failed to download badge. Please try again.');
      }
    }
  };

  const badgeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/badge/${userId}`
    : '';

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative">
      <StarField />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 py-12">
        {/* Badge Card */}
        <div id="badge-card" className="w-full max-w-sm" style={{ maxWidth: '340px' }}>
          <div className="relative border-2 border-white bg-black/90 p-5" style={{ overflow: 'hidden' }}>
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
                  style={{ top: '65%', left: 0, right: 0 }}
                >
                  <div className="flex justify-center">
                    <div className="text-white font-mono font-light text-sm tracking-wider">
                      {userId.slice(-8)}
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
              {captainName && (
                <p className="text-sm font-inter text-white/90">
                  Captain <span className="underline">{captainName}</span>
                </p>
              )}
              <p className="text-xs font-mono text-white/40 tracking-widest">
                SN: {userId.slice(-8).toUpperCase()}
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
                  value={badgeUrl}
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

        {/* Download Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-8 py-3 border-2 border-white bg-transparent text-white font-mono text-sm font-bold tracking-wider hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? 'GENERATING...' : 'DOWNLOAD AS PNG'}
          </button>
          <a
            href="/landing"
            className="px-8 py-3 border-2 border-white/30 bg-transparent text-white/70 font-mono text-sm font-bold tracking-wider hover:border-white hover:text-white transition-all text-center"
          >
            BACK TO LANDING
          </a>
        </div>

        {/* Instructions */}
        <div className="mt-6 max-w-md text-center">
          <p className="text-xs font-mono text-white/40 uppercase tracking-wider">
            Your bridge ensignia • Scan QR code to access • Download to save
          </p>
        </div>
      </div>
    </div>
  );
}
