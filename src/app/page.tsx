'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Leaf, Camera, Shield, Cloud, Clock, Mic, ArrowRight, Sprout,
  MapPin, Activity, Zap, CheckCircle, Menu, X, Thermometer, Wind, Droplets,
  Globe, LineChart, Target, Search, Bug
} from 'lucide-react';

export default function LandingPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#040807] text-gray-100 selection:bg-emerald-500/30 overflow-x-hidden">

      {/* NAVBAR */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#040807]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
              <Leaf size={18} className="text-emerald-400" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">CropScan<span className="text-emerald-400">.ai</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/scan" className="hover:text-white transition-colors">AI Crop Doctor</Link>
            <Link href="/weather" className="hover:text-white transition-colors">Weather</Link>
            <Link href="/farm" className="hover:text-white transition-colors">Farm</Link>
            <Link href="/assistant" className="hover:text-white transition-colors">Assistant</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link href="/dashboard" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-900/50">
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2">
                  Log in
                </Link>
                <Link href="/register" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-900/50">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-gray-300 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#060c0a] border-b border-white/5 py-6 px-6 flex flex-col gap-4 shadow-2xl">
            <Link href="#how-it-works" className="text-gray-300 font-medium" onClick={() => setMobileMenuOpen(false)}>How it works</Link>
            <Link href="#features" className="text-gray-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <hr className="border-white/5 my-2" />
            {user ? (
              <Link href="/dashboard" className="text-emerald-400 font-medium">Open Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 font-medium">Log in</Link>
                <Link href="/register" className="text-emerald-400 font-medium">Get Started</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-64 w-[30rem] h-[30rem] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center z-10 py-20 lg:py-0">

          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI-POWERED CROP HEALTH</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
              Your Crop.<br />
              <span className="text-emerald-400">Diagnosed by AI.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-lg font-light leading-relaxed">
              Capture a photo of your crop and let AI detect diseases, identify risks, and guide you toward the right treatment — all in your language.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href={user ? "/dashboard" : "/login"} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold text-base transition-all shadow-lg shadow-emerald-900/50">
                Scan Your Crop
              </Link>
              <Link href="#features" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-white/5 border border-white/20 text-gray-300 rounded-full font-medium text-base transition-all">
                Explore AI Doctor
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/5 mt-8">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle size={20} />
                <span>Disease Detection</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle size={20} />
                <span>Weather‑Aware Diagnosis</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle size={20} />
                <span>Farmer‑Friendly Advice</span>
              </div>
            </div>
          </div>

          {/* Right Content - Product Visualization */}
          <div className="relative w-full aspect-square md:aspect-[4/5] max-w-lg mx-auto lg:ml-auto">
            {/* Grid Background Mockup */}
            <div className="absolute inset-[-10%] bg-[#08120d] rounded-[40px] border border-white/5 shadow-2xl overflow-hidden" style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>

              {/* Corner brackets */}
              <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-emerald-500/50" />
              <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-emerald-500/50" />
              <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-emerald-500/50" />
              <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-emerald-500/50" />

              {/* Plant Image Mockup */}
              <div className="absolute inset-12 flex items-center justify-center">
                {/* Simulated Leaf SVG matching photo 2 */}
                <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M50,10 C70,30 85,50 85,70 C85,90 70,95 50,95 C30,95 15,90 15,70 C15,50 30,30 50,10 Z" fill="currentColor" opacity="0.8" />
                  <line x1="50" y1="15" x2="50" y2="90" stroke="#08120d" strokeWidth="1" />
                  <line x1="50" y1="40" x2="35" y2="30" stroke="#08120d" strokeWidth="1" />
                  <line x1="50" y1="50" x2="70" y2="40" stroke="#08120d" strokeWidth="1" />
                  <line x1="50" y1="65" x2="30" y2="55" stroke="#08120d" strokeWidth="1" />
                  <line x1="50" y1="75" x2="65" y2="65" stroke="#08120d" strokeWidth="1" />

                  {/* Disease Spots */}
                  <circle cx="40" cy="45" r="4" fill="#a77a45" />
                  <circle cx="65" cy="55" r="3" fill="#a77a45" />
                  <circle cx="45" cy="65" r="2.5" fill="#a77a45" />
                </svg>
              </div>

              {/* AI Detection Box */}
              <div className="absolute top-1/3 left-1/4 right-1/4 bottom-1/3 border border-amber-500/80 rounded-sm bg-amber-500/10">
                <div className="absolute -top-7 left-0 bg-[#0d1613] border border-amber-500/50 px-2 py-1 rounded text-[10px] font-mono text-amber-500 flex items-center gap-2">
                  <span>Late Blight</span>
                  <span>94.2%</span>
                </div>
              </div>

              {/* Scanning Animation line */}
              <div className="absolute inset-x-12 h-[2px] bg-emerald-300 shadow-[0_0_20px_rgba(16,185,129,1)] animate-scan-line z-10" />

              {/* Bottom Info Bar */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center px-4 font-mono text-[10px] text-emerald-500/60 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live inference</span>
                </div>
                <span>model: yolov8n-crop-v3</span>
                <span>18ms/frame</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST / PRODUCT STATS */}
      <section className="border-y border-white/5 bg-[#060c0a]/50 relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x divide-white/5 text-center">
            <div className="px-4">
              <p className="text-white font-semibold text-lg">Real-time</p>
              <p className="text-gray-500 text-sm mt-1">AI crop analysis</p>
            </div>
            <div className="px-4">
              <p className="text-white font-semibold text-lg">Weather-aware</p>
              <p className="text-gray-500 text-sm mt-1">Risk intelligence</p>
            </div>
            <div className="px-4">
              <p className="text-white font-semibold text-lg">Multi-language</p>
              <p className="text-gray-500 text-sm mt-1">Hindi + English</p>
            </div>
            <div className="px-4">
              <p className="text-white font-semibold text-lg">Continuous</p>
              <p className="text-gray-500 text-sm mt-1">Crop health tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION & WEATHER PREVIEW */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-900/20 to-transparent border border-emerald-500/10 rounded-3xl p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Precision agriculture requires precision context.</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Diseases don't exist in a vacuum. By analyzing the exact live weather conditions at your farm's location, the AI provides highly accurate, context-aware risk profiles and treatment timing.
              </p>
            </div>

            {/* Weather Card Mockup */}
            <div className="w-full md:w-[320px] bg-[#0a120f] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Cloud size={64} />
              </div>
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={16} className="text-emerald-400" />
                <span className="text-xs font-semibold text-gray-300 tracking-wider">YOUR FARM</span>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Enable location to see your local weather</p>
                <div className="flex items-end gap-3 mt-4 opacity-50">
                  <span className="text-5xl font-light text-white">--°C</span>
                  <span className="text-gray-400 pb-1">--% humidity</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Rain probability</span>
                  <span className="text-white font-medium">--%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-[#060c0a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
            <p className="text-gray-400 text-lg">A seamless workflow designed for the field, requiring zero technical knowledge.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            {[
              { num: '01', title: 'CAPTURE', desc: 'Take a clear photo of the affected crop.' },
              { num: '02', title: 'ANALYZE', desc: 'AI processes the image and extracts visual symptoms.' },
              { num: '03', title: 'IDENTIFY', desc: 'Disease and severity are estimated, combined with weather data.' },

            ].map((step, i) => (
              <div key={step.num} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-[#040807] border border-emerald-500/20 flex items-center justify-center text-3xl font-light text-emerald-400 mb-6 shadow-xl shadow-emerald-900/20">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTELLIGENCE LAYER */}
      <section id="intelligence" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/5" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">We don't just identify a disease.</h2>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">We understand the exact conditions around your crop to provide holistic agricultural intelligence.</p>
          </div>

          {/* Diagram */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {['CROP IMAGE', 'FARM PROFILE', 'WEATHER', 'HISTORY', 'GROWTH STAGE'].map((item) => (
                <div key={item} className="p-4 bg-white/5 border border-white/10 rounded-xl text-center text-xs font-semibold text-gray-300 tracking-wider">
                  {item}
                </div>
              ))}
            </div>

            <div className="flex justify-center mb-8">
              <div className="w-px h-16 bg-gradient-to-b from-white/20 to-emerald-500" />
            </div>

            <div className="bg-gradient-to-r from-emerald-900/40 via-emerald-800/40 to-emerald-900/40 border border-emerald-500/30 p-6 rounded-2xl text-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <span className="text-lg font-bold text-emerald-400 tracking-widest">CROP HEALTH INTELLIGENCE</span>
            </div>

            <div className="flex justify-center mb-8">
              <div className="w-px h-16 bg-gradient-to-b from-emerald-500 to-white/20" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['DIAGNOSIS', 'RISK', 'TIMING', 'RECOMMENDATION'].map((item) => (
                <div key={item} className="p-4 bg-white/5 border border-white/10 rounded-xl text-center text-sm font-bold text-white">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 bg-[#040807]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">One scan.<br /><span className="text-gray-500">Complete crop intelligence.</span></h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Target, title: 'AI Disease Detection', desc: 'Identify visible crop diseases from a simple photograph with high-precision computer vision.' },
              { icon: Activity, title: 'Disease Severity', desc: 'Understand exactly how seriously your crop is affected to prioritize action.' },
              { icon: Shield, title: 'Disease Risk', desc: 'Combine crop history and live weather conditions to identify rising invisible risks.' },
              { icon: Clock, title: 'Smart Treatment Timing', desc: 'Know precisely when weather conditions are most suitable for treatment application.' },
              { line: true, icon: LineChart, title: 'Crop Health Timeline', desc: 'Track how your crop recovers and changes across continuous scans.' },
              { icon: Globe, title: 'Regional Disease Intelligence', desc: 'Understand disease activity and outbreaks across nearby farms and regions.' }
            ].map((f) => (
              <div key={f.title} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-300">
                  <f.icon size={20} className="text-gray-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CROP HEALTH TIMELINE & WEATHER TIMING */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16">

          {/* Timeline Visual */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-8">Track recovery over time</h3>
            <div className="pl-6 border-l-2 border-white/10 space-y-8 relative">
              <div className="relative">
                <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-[#040807]" />
                <p className="text-xs text-gray-500 font-medium mb-1">SCAN 01</p>
                <p className="text-white font-semibold">Moderate Symptoms</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-[#040807]" />
                <p className="text-xs text-gray-500 font-medium mb-1">SCAN 02</p>
                <p className="text-white font-semibold">Early Symptoms</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#040807]" />
                <p className="text-xs text-emerald-400 font-medium mb-1">ACTION</p>
                <p className="text-white font-semibold">Treatment Applied</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#040807]" />
                <p className="text-xs text-gray-500 font-medium mb-1">SCAN 03</p>
                <p className="text-white font-semibold">Healthy</p>
              </div>
            </div>
          </div>

          {/* Weather visual */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-8">Act when it counts</h3>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between opacity-50">
                <div className="flex items-center gap-4">
                  <Cloud size={24} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">Rain Expected</p>
                    <p className="text-xs text-gray-400">Treatment may wash away</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-500">DELAY</span>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Thermometer size={24} className="text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">Suitable Conditions</p>
                    <p className="text-xs text-emerald-400/80">Low rain, optimal temperature</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400">TREAT NOW</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* REGIONAL INTELLIGENCE MAP */}
      <section className="py-24 bg-[#060c0a] overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">See disease activity beyond your field.</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                View anonymized regional data to understand local outbreak patterns. When a disease starts spreading in your district, you'll know before it reaches your crop.
              </p>
              <ul className="space-y-4">
                {['Anonymous aggregated data', 'District-level alerts', 'Preventative planning'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle size={18} className="text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mockup Map */}
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-[#0d1512]">
              {/* Fake grid pattern */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

              {/* Mock map markers */}
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-500 rounded-full"></div>

              <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-75"></div>
              <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-amber-500 rounded-full"></div>

              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-500 rounded-full"></div>

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex justify-between items-center">
                <span className="text-sm font-semibold text-white">Regional Analysis</span>
                <span className="text-xs text-red-400 font-bold px-2 py-1 rounded bg-red-500/20">Elevated Outbreak Risk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FARMER FIRST / VOICE */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <Mic size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Technology that speaks your language.</h2>
          <p className="text-xl text-gray-400 font-light mb-12">
            Ask questions, log farm data, and hear recommendations in Hindi or English. Built so farmers don't need technical knowledge to use advanced AI.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm font-bold text-gray-500 tracking-widest uppercase">
            <span>English</span>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-emerald-400">हिन्दी</span>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/20" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">Give your crop a <br />second set of eyes.</h2>
          <p className="text-xl text-gray-400 font-light mb-10">Start monitoring crop health with AI-powered agricultural intelligence.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? "/dashboard" : "/register"} className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-semibold text-lg transition-all shadow-xl shadow-emerald-900/50">
              Start Diagnosing
            </Link>
            <Link href="#features" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-semibold text-lg transition-all">
              Explore the Platform
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 bg-[#040807]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <Leaf size={16} className="text-emerald-400" />
            <span className="font-bold text-lg tracking-tight text-white">CropScan.ai</span>
          </div>

          <div className="text-xs text-gray-600">
            AI-powered crop health intelligence. © 2026
          </div>
        </div>
      </footer>

      {/* GLOBAL CSS ANIMATION DEFINITIONS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(200%); }
          100% { transform: translateY(-100%); }
        }
        .animate-scan {
          animation: scan 4s ease-in-out infinite;
        }
        @keyframes scan-line {
          0% { top: 15%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 85%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2.5s ease-in-out infinite alternate;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
    </div>
  );
}
