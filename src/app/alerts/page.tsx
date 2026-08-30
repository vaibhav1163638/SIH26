'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/components/LanguageProvider';
import { api, type AlertData, type RegionalReportData } from '@/lib/api';
import { Bell, AlertTriangle, Info, MapPin, Leaf, Shield } from 'lucide-react';

const DynamicMap = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-black/40 rounded-2xl border border-white/10 animate-pulse flex items-center justify-center"><div className="w-8 h-8 rounded-full border-b-2 border-emerald-500 animate-spin"></div></div>
});

export default function AlertsPage() {
  const { t, language } = useLanguage();
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [regional, setRegional] = useState<RegionalReportData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAlerts().catch(() => []),
      api.getRegionalDisease().catch(() => []),
    ]).then(([a, r]) => {
      setAlerts(a);
      setRegional(r);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="skeleton h-8 w-48" />
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    );
  }

  const severityIcons: Record<string, { icon: typeof Bell; color: string }> = {
    info: { icon: Info, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    warning: { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    critical: { icon: Shield, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t.alerts.title}</h1>
        <p className="text-gray-400 text-sm mt-1">{t.alerts.subtitle}</p>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell size={40} className="mx-auto mb-3 opacity-30" />
            <p>{t.alerts.noAlerts}</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = severityIcons[alert.severity] || severityIcons.info;
            const Icon = config.icon;
            return (
              <div key={alert._id} className={`p-5 rounded-2xl border ${config.color}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">
                      {language === 'hi' && alert.titleHi ? alert.titleHi : alert.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                      {language === 'hi' && alert.messageHi ? alert.messageHi : alert.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Regional Disease Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t.alerts.regionalMap}</h2>
          <span className="text-xs text-gray-500 bg-white/[0.02] px-3 py-1 rounded-full flex items-center gap-1">
            <Leaf size={12} /> {t.alerts.demoData}
          </span>
        </div>

        <div className="h-[500px]">
          <DynamicMap reports={regional} />
        </div>
      </div>
    </div>
  );
}
