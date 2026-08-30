'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { api, type ScanData, type RiskData } from '@/lib/api';
import {
  Bug, Shield, Activity, Leaf, AlertTriangle, CheckCircle,
  Droplets, Thermometer, ArrowLeft, Clock, XCircle, Sprout
} from 'lucide-react';

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    MODERATE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-bold border ${colors[level] || colors.MODERATE}`}>
      {level}
    </span>
  );
}

function SeverityBar({ severity }: { severity: number }) {
  const color = severity <= 20 ? '#34d399' : severity <= 50 ? '#fbbf24' : severity <= 75 ? '#f97316' : '#ef4444';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Severity</span>
        <span className="font-bold" style={{ color }}>{severity}%</span>
      </div>
      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${severity}%`, background: color }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>LOW</span><span>MODERATE</span><span>HIGH</span><span>CRITICAL</span>
      </div>
    </div>
  );
}

export default function DiagnosisPage() {
  const params = useParams();
  const { t, language } = useLanguage();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const id = params?.id as string;
        const [scanData, riskData] = await Promise.all([
          api.getScan(id).catch(() => null),
          api.getRisk().catch(() => null),
        ]);
        setScan(scanData);
        setRisk(riskData);
      } catch (err) {
        console.error('Failed to load diagnosis:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="p-6 lg:p-8 text-center py-20">
        <AlertTriangle size={48} className="text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Diagnosis not found</h2>
        <Link href="/scan" className="text-emerald-400 hover:underline">Go to Scan</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link href="/scan" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to Scan
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.diagnosis.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{new Date(scan.scanDate).toLocaleString()}</p>
        </div>
        <RiskBadge level={scan.riskLevel} />
      </div>

      {/* Demo notice */}
      {scan.isDemo && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
          <Leaf size={16} /> {t.diagnosis.demoNotice}
        </div>
      )}

      {/* Disease Card */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-gray-400">{t.diagnosis.disease}</p>
            <p className="text-xl font-bold">{scan.disease}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">{t.diagnosis.confidence}</p>
            <p className="text-xl font-bold text-emerald-400">{Math.round(scan.confidence * 100)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">{t.diagnosis.affectedArea}</p>
            <p className="text-xl font-bold">{Math.round(scan.affectedArea)}%</p>
          </div>
        </div>

        <SeverityBar severity={scan.severity} />

        <div>
          <p className="text-sm text-gray-400 mb-2">{t.diagnosis.explanation}</p>
          <p className="text-sm leading-relaxed">{scan.explanation}</p>
        </div>
      </div>

      {/* Weather Context */}
      {scan.weatherContext && (
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Weather at Time of Scan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Thermometer size={20} className="text-orange-400" />
              <div>
                <p className="text-sm font-semibold">{scan.weatherContext.temperature}°C</p>
                <p className="text-xs text-gray-500">Temperature</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Droplets size={20} className="text-blue-400" />
              <div>
                <p className="text-sm font-semibold">{scan.weatherContext.humidity}%</p>
                <p className="text-xs text-gray-500">Humidity</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Activity size={20} className="text-cyan-400" />
              <div>
                <p className="text-sm font-semibold">{scan.weatherContext.rainProbability}%</p>
                <p className="text-xs text-gray-500">Rain Probability</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sprout size={20} className="text-emerald-400" />
              <div>
                <p className="text-sm font-semibold">{scan.weatherContext.conditions}</p>
                <p className="text-xs text-gray-500">Conditions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Treatment Timing */}
      {risk?.timing && (
        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
          <h3 className="text-sm font-medium text-emerald-400 mb-4 flex items-center gap-2">
            <Clock size={16} /> {t.risk.treatmentTiming}
          </h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-2xl font-bold">{risk.timing.windowDay}</div>
            <div className="text-lg text-emerald-400">{risk.timing.windowTime}</div>
          </div>
          <p className="text-sm text-gray-400">{language === 'hi' ? risk.timing.reasonHi : risk.timing.reason}</p>
        </div>
      )}

      {/* Treatment Plan */}
      {scan.treatment && (
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-6">
          <h3 className="text-lg font-semibold">{t.diagnosis.treatment}</h3>

          {scan.treatment.immediate?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-400 flex items-center gap-2 mb-3">
                <AlertTriangle size={16} /> {t.diagnosis.immediate}
              </h4>
              <ul className="space-y-2">
                {scan.treatment.immediate.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scan.treatment.organic?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-emerald-400 flex items-center gap-2 mb-3">
                <Leaf size={16} /> {t.diagnosis.organic}
              </h4>
              <ul className="space-y-2">
                {scan.treatment.organic.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scan.treatment.chemical?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-amber-400 flex items-center gap-2 mb-3">
                <Bug size={16} /> {t.diagnosis.chemical}
              </h4>
              <ul className="space-y-2">
                {scan.treatment.chemical.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scan.treatment.prevention?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-400 flex items-center gap-2 mb-3">
                <Shield size={16} /> {t.diagnosis.prevention}
              </h4>
              <ul className="space-y-2">
                {scan.treatment.prevention.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle size={16} className="text-blue-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scan.treatment.avoid?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-3">
                <XCircle size={16} /> {t.diagnosis.avoid}
              </h4>
              <ul className="space-y-2">
                {scan.treatment.avoid.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <XCircle size={16} className="text-gray-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/timeline" className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
          <Clock size={16} /> View Timeline
        </Link>
        <Link href="/scan" className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-medium transition-all">
          <Activity size={16} /> New Scan
        </Link>
      </div>
    </div>
  );
}
