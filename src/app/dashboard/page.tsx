'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { api, type FarmData, type ScanData, type WeatherData, type RiskData } from '@/lib/api';
import { useSession } from 'next-auth/react';
import {
  Leaf, Thermometer, Droplets, Wind, Camera, Clock, Cloud, Bell,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity, Sprout, MapPin
} from 'lucide-react';

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: 'bg-emerald-500/20 text-primary border-emerald-500/30',
    MODERATE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30 risk-badge-critical',
  };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${colors[level] || colors.MODERATE}`}>
      {level}
    </span>
  );
}

function HealthGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#ef4444';
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [farm, setFarm] = useState<FarmData | null>(null);
  const [scans, setScans] = useState<ScanData[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [risk, setRisk] = useState<RiskData | null>(null);
  const { data: session } = useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(true);
  const [locationRequested, setLocationRequested] = useState(false);

  const [locationDenied, setLocationDenied] = useState(false);
  const [manualState, setManualState] = useState('');
  const [manualDistrict, setManualDistrict] = useState('');

  const initializationStarted = useRef(false);

  const requestLocation = async () => {
    return new Promise<{ latitude: number, longitude: number }>((resolve, reject) => {
      setLocationRequested(true);
      console.log('[GEOLOCATION] permission/request started');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log(`[GEOLOCATION] Browser returned:
latitude: ${position.coords.latitude}
longitude: ${position.coords.longitude}
accuracy: ${position.coords.accuracy}`);

            console.log(`[LOCATION] Sending to server:
latitude: ${position.coords.latitude}
longitude: ${position.coords.longitude}`);

            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.warn('Geolocation denied or failed', error);
            setLocationDenied(true);
            reject(error);
          },
          { timeout: 10000 }
        );
      } else {
        setLocationDenied(true);
        reject(new Error("Geolocation not supported"));
      }
    });
  };

  const submitManualLocation = async () => {
    try {
      await fetch('/api/farm/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'manual',
          state: manualState,
          district: manualDistrict
        })
      });
      const [wData, fData] = await Promise.all([api.getWeather(), api.getFarm()]);
      setWeather(wData);
      setFarm(fData);
    } catch (e) {
      console.error('Failed to save manual location', e);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [farmData, scansData] = await Promise.all([
          api.getFarm().catch(() => null),
          api.getScans().catch(() => []),
        ]);

        let weatherData = null;
        let riskData = null;
        let currentFarm = farmData;

        const hasLocation = currentFarm?.location?.latitude !== undefined && currentFarm?.location?.longitude !== undefined &&
          currentFarm.location.latitude !== null && currentFarm.location.longitude !== null;

        if (!hasLocation && !locationDenied) {
          try {
            const coords = await requestLocation();
            console.log('[FLOW] saving GPS');
            const res = await fetch('/api/farm/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(coords)
            });
            const locationResult = await res.json();

            console.log(`[LOCATION] Location API response:
status: ${res.status}
response:`, locationResult);

            if (locationResult.success && typeof locationResult.location?.latitude === 'number' && typeof locationResult.location?.longitude === 'number') {
              console.log('[FLOW] GPS saved to database');
              console.log('[FARM] location update successful');
              currentFarm = await api.getFarm();
            } else {
              console.error('Backend failed to return valid numeric coordinates:', locationResult);
            }
          } catch (e) {
            console.error('Failed location flow during load:', e);
          }
        }

        const validLoc = currentFarm?.location?.latitude !== undefined && currentFarm?.location?.longitude !== undefined &&
          currentFarm.location.latitude !== null && currentFarm.location.longitude !== null;

        if (validLoc) {
          console.log('[FLOW] requesting weather');
          console.log('[WEATHER] request started');
          const [wData, rData] = await Promise.all([
            api.getWeather().catch(() => null),
            api.getRisk().catch(() => null),
          ]);
          weatherData = wData;
          riskData = rData;
        }

        setFarm(currentFarm);
        setScans(scansData);
        setWeather(weatherData);
        setRisk(riskData);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!initializationStarted.current) {
      initializationStarted.current = true;
      loadData();
    }
  }, []);

  const latestScan = scans.length > 0 ? scans[0] : null;
  const healthScore = latestScan
    ? Math.max(0, Math.round(100 - latestScan.severity - (latestScan.severity > 30 ? 10 : 0)))
    : 72;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="skeleton h-8 w-64 mb-2" />
        <div className="skeleton h-4 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {user?.name || farm?.farmerName || 'Add your farm details'} • {farm?.location?.village || farm?.location?.district || farm?.location?.state || 'Location not set'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/scan" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-medium transition-all">
            <Camera size={16} /> {t.dashboard.scanNow}
          </Link>
        </div>
      </div>

      {/* Location Setup Banner */}
      {farm && !farm.location?.state && !locationDenied && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-2">
              <MapPin /> Let's locate your farm
            </h2>
            <p className="text-emerald-100/70 text-sm max-w-xl">
              Allow location access so we can provide personalized local weather, region-specific disease alerts, and weather-aware crop recommendations.
            </p>
          </div>
          <button
            onClick={requestLocation}
            disabled={locationRequested}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            {locationRequested ? 'Locating...' : 'Allow Location'}
          </button>
        </div>
      )}

      {/* Location Denied Fallback */}
      {locationDenied && farm && !farm.location?.state && (
        <div className="p-6 rounded-2xl bg-amber-900/20 border border-amber-500/30">
          <h2 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> Location access was denied
          </h2>
          <p className="text-amber-200/70 text-sm mb-4">Please enter your location manually to receive regional alerts and weather data.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="State (e.g. Haryana)"
              value={manualState}
              onChange={(e) => setManualState(e.target.value)}
              className="px-4 py-2 bg-black/40 border border-border rounded-xl focus:border-amber-500 outline-none"
            />
            <input
              type="text"
              placeholder="District (e.g. Karnal)"
              value={manualDistrict}
              onChange={(e) => setManualDistrict(e.target.value)}
              className="px-4 py-2 bg-black/40 border border-border rounded-xl focus:border-amber-500 outline-none"
            />
            <button
              onClick={submitManualLocation}
              disabled={!manualState || !manualDistrict}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-foreground font-medium rounded-xl transition-colors"
            >
              Save Location
            </button>
          </div>
        </div>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Health Score */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-4">{t.dashboard.healthScore}</p>
          <HealthGauge score={healthScore} />
        </div>

        {/* Crop Info */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-3">{t.dashboard.growthStage}</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Sprout size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold">{farm?.crop || 'Not set'}</p>
                <p className="text-xs text-muted-foreground">{farm?.cropVariety || ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded-lg bg-card">
                <p className="text-muted-foreground text-xs">{t.dashboard.cropAge}</p>
                <p className="font-semibold">{farm?.cropAge !== undefined ? farm.cropAge : '-'} {t.dashboard.days}</p>
              </div>
              <div className="p-2 rounded-lg bg-card">
                <p className="text-muted-foreground text-xs">{t.dashboard.growthStage}</p>
                <p className="font-semibold capitalize">{farm?.growthStage || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disease Risk */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-3">{t.dashboard.diseaseRisk}</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Current</span>
              <RiskBadge level={risk?.risk?.currentRisk || latestScan?.riskLevel || 'MODERATE'} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">7-Day</span>
              <RiskBadge level={risk?.risk?.sevenDayRisk || 'HIGH'} />
            </div>
            {latestScan && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">{t.dashboard.latestDiagnosis}</p>
                <p className="text-sm font-medium mt-1">{latestScan.disease}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(latestScan.confidence * 100)}% confidence • {latestScan.severity}% severity
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Weather */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-3">{t.dashboard.weatherSummary}</p>
          {weather ? (
            <div className="space-y-3">
              {/* Demo weather notice removed */}
              <div className="flex items-center gap-3">
                <Thermometer size={20} className="text-orange-400" />
                <div>
                  <p className="font-semibold">{weather.current.temperature}°C</p>
                  <p className="text-xs text-muted-foreground">{weather.current.conditions}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Droplets size={14} className="text-blue-400" />
                  <span>{weather.current.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind size={14} className="text-muted-foreground" />
                  <span>{weather.current.windSpeed} km/h</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Weather Risk</span>
                <RiskBadge level={weather.weatherRisk.level} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Unable to load weather data</p>
          )}
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Action */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">{t.dashboard.recommendedAction}</h3>
          {risk?.timing ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    {risk.timing.recommended ? 'Treatment Window Available' : 'Wait for Better Conditions'}
                  </span>
                </div>
                {risk.timing.recommended && (
                  <>
                    <p className="text-lg font-bold">{risk.timing.windowDay} • {risk.timing.windowTime}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === 'hi' ? risk.timing.reasonHi : risk.timing.reason}
                    </p>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'hi' ? risk.risk.recommendationHi : risk.risk.recommendation}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Monitor and follow treatment recommendation.</p>
          )}
        </div>

        {/* Recent Health Trend */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">{t.dashboard.recentTrend}</h3>
          {scans.length > 0 ? (
            <div className="space-y-3">
              {scans.slice(0, 3).reverse().map((scan, i) => (
                <div key={scan._id} className="flex items-center gap-4 p-3 rounded-xl bg-card">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{scan.disease}</p>
                    <p className="text-xs text-muted-foreground">{new Date(scan.scanDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{scan.severity}%</p>
                    <RiskBadge level={scan.riskLevel} />
                  </div>
                </div>
              ))}
              {scans.length >= 2 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  {scans[0].severity < scans[scans.length > 1 ? 1 : 0].severity ? (
                    <>
                      <TrendingDown size={16} className="text-primary" />
                      <span className="text-sm text-primary font-medium">
                        Severity decreased by {Math.abs(Math.round(((scans[1].severity - scans[0].severity) / scans[1].severity) * 100))}% compared to previous scan
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp size={16} className="text-red-400" />
                      <span className="text-sm text-red-400 font-medium">Severity increased — monitor closely</span>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No scans yet. Start your first scan!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">{t.dashboard.quickActions}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/scan', icon: Camera, label: t.dashboard.scanNow, color: 'emerald' },
            { href: '/timeline', icon: Clock, label: t.dashboard.viewTimeline, color: 'blue' },
            { href: '/weather', icon: Cloud, label: t.dashboard.checkWeather, color: 'orange' },
            { href: '/alerts', icon: Bell, label: t.dashboard.viewAlerts, color: 'red' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border hover:border-emerald-500/30 transition-all card-hover text-center"
            >
              <action.icon size={28} className={`text-${action.color}-400`} />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Demo notice */}
      <div className="text-center py-4">
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card px-4 py-2 rounded-full">
          <Leaf size={12} />
          Prototype Demo — SIH 2026 PS 131
        </span>
      </div>
    </div>
  );
}
