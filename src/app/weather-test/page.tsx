'use client';

import { useEffect, useState } from 'react';
import { api, type WeatherData, type FarmData } from '@/lib/api';

export default function WeatherTestPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [farm, setFarm] = useState<FarmData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testWeather() {
      try {
        const f = await api.getFarm();
        setFarm(f);
        if (f.location?.coordinates?.lat) {
          const w = await api.getWeather();
          setWeather(w);
        } else {
          setError('Location not set on Farm. Go to Profile to set location.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    }
    testWeather();
  }, []);

  if (loading) return <div className="p-8 text-white">Testing Weather API...</div>;

  const isLive = weather && weather.current?.temperature !== undefined && !error;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 text-white">
      <h1 className="text-2xl font-bold">Weather API Status</h1>
      
      <div className={`p-4 rounded-xl border ${isLive ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          {isLive ? '🟢 LIVE — OpenWeather' : '🔴 FAILED — OpenWeather'}
        </h2>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 text-red-400 rounded-xl border border-red-500/50">
          Error: {error}
        </div>
      )}

      {isLive && weather && (
        <div className="space-y-4 bg-black/40 p-6 rounded-xl border border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Source</p>
              <p className="font-medium">OpenWeather</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Location</p>
              <p className="font-medium">{farm?.location?.village || farm?.location?.district || farm?.location?.state}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Latitude</p>
              <p className="font-medium">{farm?.location?.coordinates?.lat}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Longitude</p>
              <p className="font-medium">{farm?.location?.coordinates?.lng}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Temperature</p>
              <p className="font-medium">{weather.current?.temperature}°C</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Humidity</p>
              <p className="font-medium">{weather.current?.humidity}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Condition</p>
              <p className="font-medium">{weather.current?.conditions}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Last updated</p>
              <p className="font-medium">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
