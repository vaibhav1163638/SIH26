'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { api, type TimelineData } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Clock, TrendingDown, TrendingUp, Minus, Activity, ArrowDown, ArrowUp, Leaf } from 'lucide-react';

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: 'bg-emerald-500/20 text-primary border-emerald-500/30',
    MODERATE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${colors[level] || colors.MODERATE}`}>
      {level}
    </span>
  );
}

export default function TimelinePage() {
  const { t } = useLanguage();
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTimeline()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const chartData = data?.scans.map((s, i) => ({
    name: `Scan ${s.scanNumber || i + 1}`,
    severity: s.severity,
    confidence: Math.round(s.confidence * 100),
    date: new Date(s.scanDate).toLocaleDateString(),
  })) || [];

  const summary = data?.summary;
  const overallImprovement = summary && summary.initialSeverity > 0
    ? Math.round(((summary.initialSeverity - summary.latestSeverity) / summary.initialSeverity) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Crop Health Timeline</h1>
        <p className="text-muted-foreground text-sm mt-1">Track recovery and disease progression over time</p>
      </div>

      {/* Overall Progress */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground">Total Scans</p>
            <p className="text-2xl font-bold mt-1">{summary.totalScans}</p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground">Initial Severity</p>
            <p className="text-2xl font-bold mt-1">{summary.initialSeverity}%</p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground">Current Severity</p>
            <p className="text-2xl font-bold mt-1">{summary.latestSeverity}%</p>
          </div>
          <div className={`p-5 rounded-2xl border ${overallImprovement > 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <p className="text-xs text-muted-foreground">Overall Progress</p>
            <div className="flex items-center gap-2 mt-1">
              {overallImprovement > 0 ? (
                <ArrowDown size={20} className="text-primary" />
              ) : (
                <ArrowUp size={20} className="text-red-400" />
              )}
              <p className={`text-2xl font-bold ${overallImprovement > 0 ? 'text-primary' : 'text-red-400'}`}>
                {Math.abs(overallImprovement)}%
              </p>
            </div>
            <p className={`text-xs mt-1 ${overallImprovement > 0 ? 'text-primary' : 'text-red-400'}`}>
              {overallImprovement > 0 ? 'Improving' : 'Worsening'}
            </p>
          </div>
        </div>
      )}

      {/* Severity Chart */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-6">Severity Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="severityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#666" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#050D08', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                formatter={(val) => [`${val}%`, 'Severity']}
              />
              <Area type="monotone" dataKey="severity" stroke="#f97316" fill="url(#severityGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scan History */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-6">Scan History</h3>
        <div className="space-y-4">
          {data?.scans.map((scan, i) => {
            const isLast = i === data.scans.length - 1;
            return (
              <div key={scan._id} className="relative">
                {!isLast && (
                  <div className="absolute left-5 top-14 bottom-0 w-0.5 bg-accent" />
                )}
                <div className="flex gap-4">
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                    scan.status === 'IMPROVING' ? 'bg-emerald-500/20 text-primary' :
                    scan.status === 'WORSENING' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-muted-foreground'
                  }`}>
                    {scan.scanNumber || i + 1}
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{scan.disease}</p>
                        <p className="text-xs text-muted-foreground">{new Date(scan.scanDate).toLocaleDateString()}</p>
                      </div>
                      <RiskBadge level={scan.riskLevel} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Severity</p>
                        <p className="font-semibold">{scan.severity}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="font-semibold">{Math.round(scan.confidence * 100)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <div className="flex items-center gap-1">
                          {scan.status === 'IMPROVING' && <TrendingDown size={14} className="text-primary" />}
                          {scan.status === 'WORSENING' && <TrendingUp size={14} className="text-red-400" />}
                          {scan.status === 'STABLE' && <Minus size={14} className="text-muted-foreground" />}
                          <span className={`text-xs font-medium ${
                            scan.status === 'IMPROVING' ? 'text-primary' :
                            scan.status === 'WORSENING' ? 'text-red-400' : 'text-muted-foreground'
                          }`}>
                            {scan.status || 'INITIAL'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {scan.improvementPct !== undefined && scan.improvementPct !== 0 && (
                      <div className={`mt-3 p-2 rounded-lg text-xs ${
                        scan.improvementPct > 0 ? 'bg-emerald-500/10 text-primary' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {scan.improvementPct > 0
                          ? `Severity decreased by ${scan.improvementPct}% compared to previous scan`
                          : `Severity increased by ${Math.abs(scan.improvementPct)}% compared to previous scan`
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Treatment marker between worsening and improving */}
                {scan.status === 'WORSENING' && i < data.scans.length - 1 && data.scans[i + 1]?.status === 'IMPROVING' && (
                  <div className="flex items-center gap-3 ml-14 my-3">
                    <div className="w-8 h-0.5 bg-emerald-500/30" />
                    <span className="text-xs text-primary font-medium bg-emerald-500/10 px-3 py-1 rounded-full">
                      💊 Treatment Applied
                    </span>
                    <div className="flex-1 h-0.5 bg-emerald-500/30" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Treatment Effectiveness */}
      {data && data.scans.length >= 2 && (
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Treatment Effectiveness</h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Before</p>
              <p className="text-3xl font-bold text-orange-400 mt-1">{data.scans[data.scans.length - 2]?.severity || 0}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">After</p>
              <p className="text-3xl font-bold text-primary mt-1">{data.scans[data.scans.length - 1]?.severity || 0}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Change</p>
              <p className={`text-3xl font-bold mt-1 ${
                (data.scans[data.scans.length - 1]?.severity || 0) < (data.scans[data.scans.length - 2]?.severity || 0)
                  ? 'text-primary' : 'text-red-400'
              }`}>
                {(data.scans[data.scans.length - 1]?.severity || 0) - (data.scans[data.scans.length - 2]?.severity || 0)} pts
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
