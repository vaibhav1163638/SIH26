'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { Settings as SettingsIcon, Globe, Bell, Moon, Sun, Monitor, Save, Leaf } from 'lucide-react';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your application preferences</p>
      </div>

      <div className="space-y-6">
        {/* Language */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={20} className="text-emerald-400" />
            <h2 className="text-lg font-semibold">{t.settings.language}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-xl border text-center transition-all ${
                language === 'en'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                  : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-emerald-500/30'
              }`}
            >
              <div className="text-lg font-medium mb-1">English</div>
              <div className="text-xs opacity-60">System Default</div>
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`p-4 rounded-xl border text-center transition-all ${
                language === 'hi'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                  : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-emerald-500/30'
              }`}
            >
              <div className="text-lg font-medium mb-1">हिंदी</div>
              <div className="text-xs opacity-60">Hindi</div>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={20} className="text-emerald-400" />
            <h2 className="text-lg font-semibold">{t.settings.notifications}</h2>
          </div>
          <div className="space-y-4">
            {[
              { id: 'disease', label: 'Disease Alerts', desc: 'Get notified when high risk is detected' },
              { id: 'weather', label: 'Weather Warnings', desc: 'Extreme weather alerts in your region' },
              { id: 'treatment', label: 'Treatment Reminders', desc: 'When it is time to apply treatment' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
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
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon size={20} className="text-emerald-400" />
            <h2 className="text-lg font-semibold">{t.settings.theme}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10 text-gray-400 cursor-not-allowed opacity-50">
              <Sun size={24} />
              <span className="text-sm font-medium">Light</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-white">
              <Moon size={24} />
              <span className="text-sm font-medium">Dark (Demo)</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10 text-gray-400 cursor-not-allowed opacity-50">
              <Monitor size={24} />
              <span className="text-sm font-medium">System</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            Theme switching is locked to Dark Mode for this SIH Prototype Demo
          </p>
        </div>

      </div>

      <div className="text-center pb-8">
        <span className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white/[0.02] px-4 py-2 rounded-full">
          <Leaf size={12} />
          SIH 2026 Prototype — Problem Statement 131
        </span>
      </div>
    </div>
  );
}
