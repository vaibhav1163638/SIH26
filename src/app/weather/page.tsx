'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { api, type WeatherData, type FarmData } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Wind, Eye, Sun, Cloud, CloudRain, Gauge, Leaf } from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const DynamicDiseaseHeatmap = dynamic(() => import('@/components/DiseaseHeatmap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-card border border-border rounded-2xl">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  ),
});

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: 'bg-emerald-500/20 text-primary border-emerald-500/30',
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
  const [farm, setFarm] = useState<FarmData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getWeather(), api.getFarm()])
      .then(([wData, fData]) => {
        setWeather(wData);
        setFarm(fData);
      })
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
    return <div className="p-6 text-center text-muted-foreground">Unable to load weather data</div>;
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
          <h1 className="text-2xl font-bold">Weather Intelligence</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {farm?.location?.village || farm?.location?.district || farm?.location?.state || 'Location not set'}
          </p>
        </div>
        {/* Demo badge removed */}
      </div>

      {/* Current Weather */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/10">
        <h3 className="text-sm text-muted-foreground mb-4">Current Weather</h3>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-6xl font-light">{weather.current.temperature}°</div>
            <div>
              <p className="text-lg text-muted-foreground">{weather.current.conditions}</p>
              <p className="text-sm text-muted-foreground">Feels like {weather.current.feelsLike}°C</p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card">
              <Droplets size={20} className="text-blue-400" />
              <div>
                <p className="text-sm font-semibold">{weather.current.humidity}%</p>
                <p className="text-xs text-muted-foreground">Humidity</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card">
              <CloudRain size={20} className="text-cyan-400" />
              <div>
                <p className="text-sm font-semibold">{weather.current.rainProbability}%</p>
                <p className="text-xs text-muted-foreground">Rain</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card">
              <Wind size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">{weather.current.windSpeed} km/h</p>
                <p className="text-xs text-muted-foreground">{weather.current.windDirection}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card">
              <Sun size={20} className="text-amber-400" />
              <div>
                <p className="text-sm font-semibold">{weather.current.uvIndex}</p>
                <p className="text-xs text-muted-foreground">UV Index</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Risk */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Weather Risk</h3>
          <RiskBadge level={weather.weatherRisk.level} />
        </div>
        <div className="w-full h-3 bg-accent rounded-full mb-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${weather.weatherRisk.score}%`,
              background: weather.weatherRisk.level === 'HIGH' ? '#f97316' : weather.weatherRisk.level === 'MODERATE' ? '#fbbf24' : '#34d399'
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {language === 'hi' ? weather.weatherRisk.reasoningHi : weather.weatherRisk.reasoning}
        </p>
      </div>

      {/* 5-Day Forecast */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-6">5-Day Forecast</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {weather.forecast.map((day) => (
            <div key={day.date} className="p-4 rounded-xl bg-card text-center">
              <p className="text-sm font-medium">{day.dayName}</p>
              <p className="text-xs text-muted-foreground mb-3">{day.date}</p>
              <div className="text-2xl font-bold">{day.high}°</div>
              <div className="text-sm text-muted-foreground">{day.low}°</div>
              <p className="text-xs text-muted-foreground mt-2">{day.conditions}</p>
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

      {/* Regional Crop Disease Risk Heatmap Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="pt-8 border-t border-border mt-8"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Regional Crop Disease Risk</h2>
          <p className="text-muted-foreground mt-1">
            Heatmap of reported crop disease risk around your region.
          </p>
        </div>
        
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg h-[350px] md:h-[450px] lg:h-[500px]">
          <DynamicDiseaseHeatmap 
            centerLat={farm?.location?.latitude || 28.6139} 
            centerLng={farm?.location?.longitude || 77.2090} 
          />
          
          {/* Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] bg-background/95 backdrop-blur px-4 py-3 rounded-xl border border-border shadow-lg">
            <h4 className="text-sm font-semibold mb-2 text-foreground">Disease Risk</h4>
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#22c55e]"></span><span className="text-xs text-foreground">Low</span></div>
              <div className="w-4 h-[1px] bg-border hidden sm:block"></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#eab308]"></span><span className="text-xs text-foreground">Moderate</span></div>
              <div className="w-4 h-[1px] bg-border hidden sm:block"></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f97316]"></span><span className="text-xs text-foreground">Elevated</span></div>
              <div className="w-4 h-[1px] bg-border hidden sm:block"></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span><span className="text-xs text-foreground">High</span></div>
              <div className="w-4 h-[1px] bg-border hidden sm:block"></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#991b1b]"></span><span className="text-xs text-foreground">Severe</span></div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 border-t border-border/50 pt-2">Based on regional conditions</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
