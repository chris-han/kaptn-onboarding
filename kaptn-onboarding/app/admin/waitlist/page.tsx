'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  interests: string[];
  status: 'ACTIVE' | 'CONVERTED' | 'INACTIVE';
  submittedAt: string;
  invitedAt: string | null;
  invitationExpiresAt: string | null;
  convertedAt: string | null;
  user: {
    id: string;
    logtoId: string | null;
    profile: {
      onboardingCompleted: boolean;
    } | null;
    badge: {
      serialNumber: string;
    } | null;
  };
}

interface Analytics {
  timeSeriesData: Array<{
    date: string;
    submissions: number;
    invitations: number;
    conversions: number;
  }>;
  summary: {
    totalSubmissions: number;
    totalInvitations: number;
    totalConversions: number;
    invitationRate: number;
    conversionRate: number;
    overallConversionRate: number;
    avgTimeToInvite: number;
    avgTimeToConvert: number;
  };
  interestDistribution: Array<{ interest: string; count: number }>;
  statusTrends: Record<string, number>;
}

export default function AdminWaitlistPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CONVERTED' | 'INACTIVE'>('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchWaitlist();
    fetchAnalytics();
  }, [filter, page]);

  const fetchWaitlist = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: filter,
        page: page.toString(),
        limit: '50',
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/waitlist?${params}`);

      if (response.status === 401) {
        router.push('/api/logto/sign-in?redirectTo=/admin/waitlist');
        return;
      }

      const data = await response.json();
      setEntries(data.entries || []);
      setStats(data.stats || {});
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching waitlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics?days=30');

      if (response.status === 401) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const sendInvitation = async (email: string, entryId: string) => {
    try {
      setSending(prev => new Set(prev).add(entryId));

      const response = await fetch('/api/waitlist/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to send invitation: ${error.error}`);
        return;
      }

      alert(`Invitation sent to ${email}`);
      fetchWaitlist(); // Refresh to show updated invitation status
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    } finally {
      setSending(prev => {
        const next = new Set(prev);
        next.delete(entryId);
        return next;
      });
    }
  };

  const sendBulkInvitations = async () => {
    if (selected.size === 0) {
      alert('Please select at least one entry');
      return;
    }

    if (!confirm(`Send invitations to ${selected.size} selected users?`)) {
      return;
    }

    const selectedEntries = entries.filter(e => selected.has(e.id));

    for (const entry of selectedEntries) {
      await sendInvitation(entry.email, entry.id);
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === entries.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(entries.map(e => e.id)));
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-[#00ff88]';
      case 'CONVERTED': return 'text-[#ffd700]';
      case 'INACTIVE': return 'text-gray-500';
      default: return 'text-white';
    }
  };

  const canSendInvitation = (entry: WaitlistEntry) => {
    return entry.status === 'ACTIVE' && !entry.user.logtoId;
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-[#00ff88] pb-6 mb-8">
          <h1 className="text-3xl font-mono text-[#00ff88] mb-2 tracking-wider">
            [ WAITLIST MANAGEMENT ]
          </h1>
          <p className="font-mono text-sm text-gray-400">
            KAPTN BRIDGE ACCESS CONTROL SYSTEM
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-[#00ff88]/30 bg-[#1a1f2e] p-4">
            <div className="text-gray-400 text-xs font-mono mb-1">TOTAL</div>
            <div className="text-2xl font-mono text-white">
              {Object.values(stats).reduce((a, b) => a + b, 0)}
            </div>
          </div>
          <div className="border border-[#00ff88]/30 bg-[#1a1f2e] p-4">
            <div className="text-gray-400 text-xs font-mono mb-1">ACTIVE</div>
            <div className="text-2xl font-mono text-[#00ff88]">
              {stats.ACTIVE || 0}
            </div>
          </div>
          <div className="border border-[#00ff88]/30 bg-[#1a1f2e] p-4">
            <div className="text-gray-400 text-xs font-mono mb-1">CONVERTED</div>
            <div className="text-2xl font-mono text-[#ffd700]">
              {stats.CONVERTED || 0}
            </div>
          </div>
          <div className="border border-[#00ff88]/30 bg-[#1a1f2e] p-4">
            <div className="text-gray-400 text-xs font-mono mb-1">INACTIVE</div>
            <div className="text-2xl font-mono text-gray-500">
              {stats.INACTIVE || 0}
            </div>
          </div>
        </div>

        {/* Analytics Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-6 py-2 bg-transparent border border-[#00ff88]/30 text-[#00ff88] font-mono text-xs hover:border-[#00ff88] transition-colors"
          >
            {showAnalytics ? '▼' : '▶'} ANALYTICS & INSIGHTS
          </button>
        </div>

        {/* Analytics Section */}
        {showAnalytics && analytics && (
          <div className="mb-8 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border border-[#ffd700]/30 bg-[#1a1f2e] p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">INVITATION RATE</div>
                <div className="text-2xl font-mono text-[#ffd700]">
                  {analytics.summary.invitationRate}%
                </div>
                <div className="text-xs font-mono text-gray-500 mt-1">
                  {analytics.summary.totalInvitations} / {analytics.summary.totalSubmissions}
                </div>
              </div>
              <div className="border border-[#ffd700]/30 bg-[#1a1f2e] p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">CONVERSION RATE</div>
                <div className="text-2xl font-mono text-[#ffd700]">
                  {analytics.summary.conversionRate}%
                </div>
                <div className="text-xs font-mono text-gray-500 mt-1">
                  {analytics.summary.totalConversions} / {analytics.summary.totalInvitations}
                </div>
              </div>
              <div className="border border-[#ffd700]/30 bg-[#1a1f2e] p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">AVG TIME TO INVITE</div>
                <div className="text-2xl font-mono text-[#ffd700]">
                  {analytics.summary.avgTimeToInvite.toFixed(1)}d
                </div>
                <div className="text-xs font-mono text-gray-500 mt-1">
                  from submission
                </div>
              </div>
              <div className="border border-[#ffd700]/30 bg-[#1a1f2e] p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">AVG TIME TO CONVERT</div>
                <div className="text-2xl font-mono text-[#ffd700]">
                  {analytics.summary.avgTimeToConvert.toFixed(1)}d
                </div>
                <div className="text-xs font-mono text-gray-500 mt-1">
                  from invitation
                </div>
              </div>
            </div>

            {/* Interest Distribution */}
            <div className="border border-[#00ff88]/30 bg-[#1a1f2e] p-6">
              <h3 className="font-mono text-sm text-[#00ff88] mb-4">SERVICE INTERESTS</h3>
              <div className="space-y-3">
                {analytics.interestDistribution.map((item) => {
                  const total = analytics.summary.totalSubmissions;
                  const percentage = total > 0 ? (item.count / total) * 100 : 0;
                  return (
                    <div key={item.interest}>
                      <div className="flex justify-between mb-1">
                        <span className="font-mono text-xs text-gray-400">{item.interest}</span>
                        <span className="font-mono text-xs text-[#00ff88]">
                          {item.count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#0a0e1a] overflow-hidden">
                        <div
                          className="h-full bg-[#00ff88]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simple Time Series Chart */}
            <div className="border border-[#00ff88]/30 bg-[#1a1f2e] p-6">
              <h3 className="font-mono text-sm text-[#00ff88] mb-4">30-DAY ACTIVITY (Last 7 Days)</h3>
              <div className="flex items-end gap-1 h-32">
                {analytics.timeSeriesData.slice(-7).map((day, index) => {
                  const maxValue = Math.max(
                    ...analytics.timeSeriesData.map(d =>
                      Math.max(d.submissions, d.invitations, d.conversions)
                    )
                  );
                  const submissionHeight = maxValue > 0 ? (day.submissions / maxValue) * 100 : 0;
                  const invitationHeight = maxValue > 0 ? (day.invitations / maxValue) * 100 : 0;
                  const conversionHeight = maxValue > 0 ? (day.conversions / maxValue) * 100 : 0;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-px justify-center items-end h-24">
                        <div
                          className="w-1/3 bg-[#00ff88]"
                          style={{ height: `${submissionHeight}%` }}
                          title={`Submissions: ${day.submissions}`}
                        />
                        <div
                          className="w-1/3 bg-[#ffd700]"
                          style={{ height: `${invitationHeight}%` }}
                          title={`Invitations: ${day.invitations}`}
                        />
                        <div
                          className="w-1/3 bg-[#0066FF]"
                          style={{ height: `${conversionHeight}%` }}
                          title={`Conversions: ${day.conversions}`}
                        />
                      </div>
                      <div className="text-xs font-mono text-gray-500 rotate-45 origin-left whitespace-nowrap">
                        {new Date(day.date).getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4 text-xs font-mono justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#00ff88]" />
                  <span className="text-gray-400">Submissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#ffd700]" />
                  <span className="text-gray-400">Invitations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#0066FF]" />
                  <span className="text-gray-400">Conversions</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="border border-[#00ff88]/30 bg-[#1a1f2e] p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Filter */}
            <div className="flex gap-2">
              {(['ALL', 'ACTIVE', 'CONVERTED', 'INACTIVE'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setFilter(status);
                    setPage(1);
                  }}
                  className={`px-4 py-2 font-mono text-xs border transition-colors ${
                    filter === status
                      ? 'bg-[#00ff88] text-black border-[#00ff88]'
                      : 'bg-transparent text-[#00ff88] border-[#00ff88]/30 hover:border-[#00ff88]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchWaitlist();
                }
              }}
              className="flex-1 px-4 py-2 bg-[#0a0e1a] border border-[#00ff88]/30 text-white font-mono text-sm focus:outline-none focus:border-[#00ff88]"
            />

            <button
              onClick={fetchWaitlist}
              className="px-6 py-2 bg-[#ffd700] text-black font-mono text-xs hover:bg-[#ffed4e] transition-colors"
            >
              SEARCH
            </button>
          </div>

          {/* Bulk Actions */}
          {selected.size > 0 && (
            <div className="flex items-center gap-4 pt-4 border-t border-[#00ff88]/30">
              <span className="font-mono text-sm text-gray-400">
                {selected.size} selected
              </span>
              <button
                onClick={sendBulkInvitations}
                className="px-6 py-2 bg-[#ffd700] text-black font-mono text-xs hover:bg-[#ffed4e] transition-colors"
              >
                SEND INVITATIONS
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="px-6 py-2 bg-transparent text-[#00ff88] border border-[#00ff88]/30 font-mono text-xs hover:border-[#00ff88] transition-colors"
              >
                CLEAR
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="border border-[#00ff88]/30 bg-[#1a1f2e] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#00ff88]/30">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === entries.length && entries.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="p-4 text-left font-mono text-xs text-gray-400">NAME</th>
                <th className="p-4 text-left font-mono text-xs text-gray-400">EMAIL</th>
                <th className="p-4 text-left font-mono text-xs text-gray-400">COMPANY</th>
                <th className="p-4 text-left font-mono text-xs text-gray-400">INTERESTS</th>
                <th className="p-4 text-left font-mono text-xs text-gray-400">STATUS</th>
                <th className="p-4 text-left font-mono text-xs text-gray-400">SUBMITTED</th>
                <th className="p-4 text-left font-mono text-xs text-gray-400">INVITED</th>
                <th className="p-4 text-right font-mono text-xs text-gray-400">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400 font-mono text-sm">
                    LOADING...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400 font-mono text-sm">
                    NO ENTRIES FOUND
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#00ff88]/10 hover:bg-[#00ff88]/5">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.has(entry.id)}
                        onChange={() => toggleSelect(entry.id)}
                        disabled={!canSendInvitation(entry)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-4 font-mono text-sm">{entry.name}</td>
                    <td className="p-4 font-mono text-sm text-gray-400">{entry.email}</td>
                    <td className="p-4 font-mono text-sm text-gray-400">{entry.company || '-'}</td>
                    <td className="p-4 font-mono text-xs text-gray-400">
                      {entry.interests.join(', ')}
                    </td>
                    <td className="p-4">
                      <span className={`font-mono text-xs ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-400">
                      {formatDate(entry.submittedAt)}
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-400">
                      {entry.invitedAt ? (
                        <div>
                          <div>{formatDate(entry.invitedAt)}</div>
                          {entry.invitationExpiresAt && new Date(entry.invitationExpiresAt) < new Date() && (
                            <div className="text-red-500 text-xs">EXPIRED</div>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {canSendInvitation(entry) ? (
                        <button
                          onClick={() => sendInvitation(entry.email, entry.id)}
                          disabled={sending.has(entry.id)}
                          className="px-4 py-1 bg-[#ffd700] text-black font-mono text-xs hover:bg-[#ffed4e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sending.has(entry.id) ? 'SENDING...' : 'INVITE'}
                        </button>
                      ) : entry.user.logtoId ? (
                        <span className="text-xs font-mono text-gray-500">LINKED</span>
                      ) : (
                        <span className="text-xs font-mono text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-transparent border border-[#00ff88]/30 text-[#00ff88] font-mono text-xs hover:border-[#00ff88] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              PREV
            </button>
            <span className="px-4 py-2 font-mono text-sm text-gray-400">
              PAGE {page} OF {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-transparent border border-[#00ff88]/30 text-[#00ff88] font-mono text-xs hover:border-[#00ff88] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              NEXT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
