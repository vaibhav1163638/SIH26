'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { api, type FarmData } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { User, MapPin, Sprout, Droplets, Calendar, Save, Loader2, CheckCircle, Navigation } from 'lucide-react';

export default function FarmPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;
  
  const [farm, setFarm] = useState<FarmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    api.getFarm()
      .then(setFarm)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!farm) return;
    setSaving(true);
    try {
      const updated = await api.updateFarm(farm);
      setFarm(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    if (!farm) return;
    setFarm({ ...farm, [field]: value });
  };

  const updateLocation = (field: string, value: string | number) => {
    if (!farm) return;
    setFarm({ ...farm, location: { ...farm.location, [field]: value } });
  };

  const handleGetLocation = () => {
    setLocationError('');
    setLocating(true);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        if (res.ok) {
          const data = await res.json();
          const address = data.address || {};
          
          if (!farm) return;
          setFarm(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              location: {
                ...prev.location,
                latitude: lat,
                longitude: lon,
                source: 'gps',
                state: address.state || prev.location.state || '',
                district: address.state_district || address.county || prev.location.district || '',
                village: address.village || address.suburb || address.city || prev.location.village || '',
                country: address.country || 'India'
              }
            };
          });
        }
      } catch (e) {
        console.error('Geocoding failed:', e);
        setLocationError('Failed to get location name. GPS coordinates saved.');
        updateLocation('latitude', lat);
        updateLocation('longitude', lon);
        updateLocation('source', 'gps');
      } finally {
        setLocating(false);
      }
    }, (error) => {
      console.error(error);
      setLocationError('Location permission denied or unavailable. Please enter manually.');
      setLocating(false);
    });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  if (!farm) return null;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.farm.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{t.farm.subtitle}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 rounded-xl text-sm font-medium transition-all"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saving ? t.farm.saving : saved ? 'Saved!' : t.farm.save}
        </button>
      </div>

      {/* Farmer Info */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <User size={20} className="text-emerald-400" />
            <h3 className="font-semibold">Farmer Information</h3>
          </div>
          <button
            onClick={handleGetLocation}
            disabled={locating}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm transition-colors border border-blue-500/20"
          >
            {locating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
            {locating ? 'Locating...' : 'Get GPS Location'}
          </button>
        </div>
        
        {locationError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {locationError}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl flex-1 border border-white/5">
            {user?.image ? (
              <img src={user.image} alt={user.name || 'Profile'} className="w-16 h-16 rounded-full border border-white/10" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <User className="text-emerald-400" size={24} />
              </div>
            )}
            <div>
              <h4 className="font-medium text-lg">{user?.name || farm.farmerName || 'Farmer'}</h4>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1.5">{t.farm.location}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={farm.location.state}
                onChange={(e) => updateLocation('state', e.target.value)}
                placeholder="State"
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none text-sm transition-colors"
              />
              <input
                type="text"
                value={farm.location.district}
                onChange={(e) => updateLocation('district', e.target.value)}
                placeholder="District"
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none text-sm transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Crop Info */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <Sprout size={20} className="text-emerald-400" />
          <h3 className="font-semibold">Crop Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t.farm.crop}</label>
            <input
              type="text"
              value={farm.crop}
              onChange={(e) => updateField('crop', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t.farm.variety}</label>
            <input
              type="text"
              value={farm.cropVariety}
              onChange={(e) => updateField('cropVariety', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t.farm.area}</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={farm.farmArea}
                onChange={(e) => updateField('farmArea', parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none text-sm transition-colors"
              />
              <span className="px-4 py-3 rounded-xl bg-white/[0.03] text-sm text-gray-400">{farm.farmAreaUnit}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t.farm.plantingDate}</label>
            <input
              type="date"
              value={farm.plantingDate ? new Date(farm.plantingDate).toISOString().split('T')[0] : ''}
              onChange={(e) => updateField('plantingDate', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t.farm.growthStage}</label>
            <select
              value={farm.growthStage}
              onChange={(e) => updateField('growthStage', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none text-sm transition-colors"
            >
              <option value="seedling">Seedling</option>
              <option value="vegetative">Vegetative</option>
              <option value="flowering">Flowering</option>
              <option value="fruiting">Fruiting</option>
              <option value="maturity">Maturity</option>
              <option value="harvest">Harvest</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t.farm.irrigation}</label>
            <select
              value={farm.irrigationMethod}
              onChange={(e) => updateField('irrigationMethod', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none text-sm transition-colors"
            >
              <option value="drip">Drip</option>
              <option value="sprinkler">Sprinkler</option>
              <option value="flood">Flood</option>
              <option value="rainfed">Rainfed</option>
              <option value="furrow">Furrow</option>
            </select>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <Calendar size={20} className="text-emerald-400" />
          <h3 className="font-semibold">Disease & Treatment History</h3>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">{t.farm.previousDiseases}</label>
          <div className="flex flex-wrap gap-2">
            {farm.previousDiseases?.map((d, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-sm border border-amber-500/20">
                {d}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">{t.farm.previousTreatments}</label>
          <div className="flex flex-wrap gap-2">
            {farm.previousTreatments?.map((t2, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                {t2}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
