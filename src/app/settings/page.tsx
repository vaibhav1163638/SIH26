'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

import { useLanguage } from '@/components/LanguageProvider';
import { Settings as SettingsIcon, Globe, Bell, Moon, Sun, Monitor, Leaf } from 'lucide-react';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [initialLoad, setInitialLoad] = useState(true);

  // Sync theme from backend on mount
  useEffect(() => {
    api.getLanguage().then((data) => {
      if (data && 'theme' in data) {
        setTheme(data.theme as 'light' | 'dark');
      }
    }).catch(console.error).finally(() => setInitialLoad(false));
  }, []);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    if (newTheme === 'light' || newTheme === 'dark') {
      try {
        await api.updateTheme(newTheme);
      } catch (err) {
        console.error('Failed to update theme:', err);
      }
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.settings.subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* Language */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={20} className="text-primary" />
            <h2 className="text-lg font-semibold">{t.settings.language}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-xl border text-center transition-all ${
                language === 'en'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-emerald-500/30'
              }`}
            >
              <div className="text-lg font-medium mb-1">{t.settings.english}</div>
              <div className="text-xs opacity-60">{t.settings.systemDefault}</div>
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`p-4 rounded-xl border text-center transition-all ${
                language === 'hi'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-emerald-500/30'
              }`}
            >
              <div className="text-lg font-medium mb-1">{t.settings.hindi}</div>
              <div className="text-xs opacity-60">{t.settings.hindi}</div>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={20} className="text-primary" />
            <h2 className="text-lg font-semibold">{t.settings.notifications}</h2>
          </div>
          <div className="space-y-4">
            {[
              { id: 'disease', label: t.settings.diseaseAlerts, desc: t.settings.diseaseAlertsDesc },
              { id: 'weather', label: t.settings.weatherWarnings, desc: t.settings.weatherWarningsDesc },
              { id: 'treatment', label: t.settings.treatmentReminders, desc: t.settings.treatmentRemindersDesc },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon size={20} className="text-primary" />
            <h2 className="text-lg font-semibold">{t.settings.theme}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={
                theme === 'light'
                  ? 'flex flex-col items-center gap-3 p-4 rounded-xl bg-emerald-500/20 border-emerald-500/50 text-primary'
                  : 'flex flex-col items-center gap-3 p-4 rounded-xl bg-card border-border text-muted-foreground'
              }
            >
              <Sun size={24} />
              <span className="text-sm font-medium">{t.settings.light}</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={
                theme === 'dark'
                  ? 'flex flex-col items-center gap-3 p-4 rounded-xl bg-emerald-500/20 border-emerald-500/50 text-primary'
                  : 'flex flex-col items-center gap-3 p-4 rounded-xl bg-card border-border text-muted-foreground'
              }
            >
              <Moon size={24} />
              <span className="text-sm font-medium">{t.settings.dark}</span>
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl ${
                theme === 'system'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-primary'
                  : 'bg-card border-border text-muted-foreground'
              }`}
            >
              <Monitor size={24} />
              <span className="text-sm font-medium">{t.settings.system}</span>
            </button>
          </div>
          {initialLoad ? null : (
            <p className="text-xs text-muted-foreground text-center mt-4">
              {t.settings.currentTheme}: {theme === 'dark' ? t.settings.dark : theme === 'light' ? t.settings.light : t.settings.system}
            </p>
          )}
        </div>
      </div>

      <div className="text-center pb-8">
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card px-4 py-2 rounded-full">
          <Leaf size={12} />
          {t.common.prototypeNotice}
        </span>
      </div>
    </div>
  );
}
