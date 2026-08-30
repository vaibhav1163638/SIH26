'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { api, type WeatherData } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Wind, Eye, Sun, Cloud, CloudRain, Gauge, Leaf } from 'lucide-react';

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    MODERATE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${colors[level] || colors.MODERATE}`}>
      {level}
    </span>
  );
}

export default function WeatherPage() {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWeather()
      .then(setWeather)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  if (!weather) {
    return <div className="p-6 text-center text-gray-500">Unable to load weather data</div>;
  }

  const forecastChartData = weather.forecast.map(day => ({
    name: day.dayName.slice(0, 3),
    high: day.high,
    low: day.low,
    rain: day.rainProbability,
    humidity: day.humidity,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.weather.title}</h1>
          <p className="text-gray-400 text-sm mt-1">Karnal, Haryana</p>
        </div>
        {weather.isDemo && (
          <span className="text-xs text-gray-500 bg-white/[0.02] px-3 py-1 rounded-full flex items-center gap-1">
            <Leaf size={12} /> Demo
          </span>
        )}
      </div>

      {/* Current Weather */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/10">
        <h3 className="text-sm text-gray-400 mb-4">{t.weather.current}</h3>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-6xl font-light">{weather.current.temperature}°</div>
            <div>
              <p className="text-lg text-gray-300">{weather.current.conditions}</p>
              <p className="text-sm text-gray-500">Feels like {weather.current.feelsLike}°C</p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <Droplets size={20} className="text-blue-400" />
              <div>
                <p className="text-sm font-semibold">{weather.current.humidity}%</p>
                <p className="text-xs text-gray-500">{t.weather.humidity}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <CloudRain size={20} className="text-cyan-400" />
              <div>
                <p className="text-sm font-semibold">{weather.current.rainProbability}%</p>
                <p className="text-xs text-gray-500">{t.weather.rain}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <Wind size={20} className="text-gray-400" />
              <div>
                <p className="text-sm font-semibold">{weather.current.windSpeed} km/h</p>
                <p className="text-xs text-gray-500">{weather.current.windDirection}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <Sun size={20} className="text-amber-400" />
              <div>
                <p className="text-sm font-semibold">{weather.current.uvIndex}</p>
                <p className="text-xs text-gray-500">{t.weather.uvIndex}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Risk */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400">{t.weather.weatherRisk}</h3>
          <RiskBadge level={weather.weatherRisk.level} />
        </div>
        <div className="w-full h-3 bg-white/5 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${weather.weatherRisk.score}%`,
              background: weather.weatherRisk.level === 'HIGH' ? '#f97316' : weather.weatherRisk.level === 'MODERATE' ? '#fbbf24' : '#34d399'
            }}
          />
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          {language === 'hi' ? weather.weatherRisk.reasoningHi : weather.weatherRisk.reasoning}
        </p>
      </div>

      {/* 5-Day Forecast */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        <h3 className="text-sm font-medium text-gray-400 mb-6">{t.weather.forecast}</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {weather.forecast.map((day) => (
            <div key={day.date} className="p-4 rounded-xl bg-white/[0.02] text-center">
              <p className="text-sm font-medium">{day.dayName}</p>
              <p className="text-xs text-gray-500 mb-3">{day.date}</p>
              <div className="text-2xl font-bold">{day.high}°</div>
              <div className="text-sm text-gray-500">{day.low}°</div>
              <p className="text-xs text-gray-400 mt-2">{day.conditions}</p>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs">
                <CloudRain size={12} className="text-blue-400" />
                <span className="text-blue-400">{day.rainProbability}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Rain Probability Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#1a2a22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Bar dataKey="rain" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Rain %" />
              <Bar dataKey="humidity" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Humidity %" opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
