'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Types
interface FunnelStage {
  name: string;
  count: number;
  rate: string;
}

interface FunnelData {
  stages: FunnelStage[];
  metrics: {
    totalEntrance: number;
    totalWaitlist: number;
    totalProfiles: number;
    totalBadges: number;
    conversionRates: {
      entranceToWaitlist: string;
      waitlistToProfile: string;
      overall: string;
    };
  };
}

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  interests: string[];
  status: string;
  submittedAt: string;
}

export default function AdminDashboard() {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch funnel data
      const funnelRes = await fetch('/api/admin/funnel');
      const funnel = await funnelRes.json();
      setFunnelData(funnel);

      // Fetch waitlist
      const waitlistRes = await fetch('/api/admin/waitlist?limit=10');
      const waitlist = await waitlistRes.json();
      setWaitlistEntries(waitlist.entries || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-white/60 font-mono">LOADING BRIDGE SYSTEMS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="border-b-2 border-bridge-gold pb-4">
          <h1 className="text-3xl font-bold font-mono text-bridge-gold">KAPTN ADMIN BRIDGE</h1>
          <p className="text-white/60 mt-2 font-mono text-sm">ONBOARDING COMMAND & CONTROL</p>
        </div>
      </div>

      {/* Metrics Overview */}
      {funnelData && (
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-xl font-mono text-white/80 mb-6">MISSION METRICS</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              label="ENTRANCE"
              value={funnelData.metrics.totalEntrance}
              color="#00ff88"
            />
            <MetricCard
              label="WAITLIST"
              value={funnelData.metrics.totalWaitlist}
              color="#ff6b35"
            />
            <MetricCard
              label="PROFILES"
              value={funnelData.metrics.totalProfiles}
              color="#9b59b6"
            />
            <MetricCard
              label="BADGES"
              value={funnelData.metrics.totalBadges}
              color="#FFD700"
            />
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      {funnelData && (
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-xl font-mono text-white/80 mb-6">CONVERSION FUNNEL</h2>
          <div className="space-y-4">
            {funnelData.stages.map((stage, index) => (
              <FunnelStage
                key={stage.name}
                stage={stage}
                index={index}
                total={funnelData.metrics.totalEntrance}
              />
            ))}
          </div>

          {/* Conversion Rates */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-white/20 bg-black/40 p-4">
              <div className="text-xs text-white/40 font-mono mb-1">ENTRANCE → WAITLIST</div>
              <div className="text-2xl font-bold text-bridge-green">
                {funnelData.metrics.conversionRates.entranceToWaitlist}
              </div>
            </div>
            <div className="border border-white/20 bg-black/40 p-4">
              <div className="text-xs text-white/40 font-mono mb-1">WAITLIST → PROFILE</div>
              <div className="text-2xl font-bold text-bridge-green">
                {funnelData.metrics.conversionRates.waitlistToProfile}
              </div>
            </div>
            <div className="border border-white/20 bg-black/40 p-4">
              <div className="text-xs text-white/40 font-mono mb-1">OVERALL CONVERSION</div>
              <div className="text-2xl font-bold text-bridge-gold">
                {funnelData.metrics.conversionRates.overall}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Waitlist Entries */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-mono text-white/80 mb-6">RECENT CAPTAINS</h2>
        <div className="border border-white/20 bg-black/20 overflow-hidden">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="bg-black/60 border-b border-white/20">
                <th className="text-left p-4 text-white/60 font-normal">NAME</th>
                <th className="text-left p-4 text-white/60 font-normal">EMAIL</th>
                <th className="text-left p-4 text-white/60 font-normal">COMPANY</th>
                <th className="text-left p-4 text-white/60 font-normal">INTERESTS</th>
                <th className="text-left p-4 text-white/60 font-normal">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {waitlistEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">{entry.name}</td>
                  <td className="p-4 text-white/60">{entry.email}</td>
                  <td className="p-4 text-white/60">{entry.company || '—'}</td>
                  <td className="p-4 text-white/60">{entry.interests.join(', ')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      entry.status === 'ACTIVE' ? 'bg-bridge-green/20 text-bridge-green' :
                      entry.status === 'CONVERTED' ? 'bg-bridge-gold/20 text-bridge-gold' :
                      'bg-white/10 text-white/40'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/20 bg-black/40 p-6"
    >
      <div className="text-xs text-white/40 font-mono mb-2">{label}</div>
      <div className="text-4xl font-bold font-mono" style={{ color }}>
        {value.toLocaleString()}
      </div>
    </motion.div>
  );
}

// Funnel Stage Component
function FunnelStage({
  stage,
  index,
  total
}: {
  stage: FunnelStage;
  index: number;
  total: number;
}) {
  const colors = ['#00ff88', '#ff6b35', '#9b59b6', '#FFD700'];
  const color = colors[index] || '#ffffff';
  const percentage = total > 0 ? (stage.count / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      <div className="flex items-center gap-4">
        <div className="w-32 text-sm font-mono text-white/60">{stage.name}</div>
        <div className="flex-1">
          <div className="h-12 bg-black/40 border border-white/20 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
              className="h-full"
              style={{ backgroundColor: `${color}40`, borderRight: `2px solid ${color}` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <span className="text-white font-bold font-mono">{stage.count.toLocaleString()}</span>
              <span className="text-white/60 text-sm font-mono">{stage.rate}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
