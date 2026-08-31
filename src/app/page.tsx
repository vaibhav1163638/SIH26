"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Leaf,
  Camera,
  Shield,
  Cloud,
  Clock,
  Mic,
  ArrowRight,
  Sprout,
  MapPin,
  Activity,
  Zap,
  CheckCircle,
  Menu,
  X,
  Thermometer,
  Wind,
  Droplets,
  Globe,
  LineChart,
  Target,
  Search,
  Bug,
} from "lucide-react";
import { animate } from "motion";
export default function LandingPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30 overflow-x-hidden">
      {" "}
      {/* NAVBAR */}{" "}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border py-4" : "bg-transparent py-6"}`}
      >
        {" "}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          {" "}
          <Link href="/" className="flex items-center gap-2 group">
            {" "}
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
              {" "}
              <Leaf size={18} className="text-primary" />{" "}
            </div>{" "}
            <span className="font-bold text-xl tracking-tight text-yellow-500">
              CropScan
            </span>{" "}
          </Link>{" "}
          {/* Desktop Nav */}{" "}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {" "}
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>{" "}
            <Link
              href="/scan"
              className="hover:text-foreground transition-colors"
            >
              AI Crop Doctor
            </Link>{" "}
            <Link
              href="/weather"
              className="hover:text-foreground transition-colors"
            >
              Weather
            </Link>{" "}
            <Link
              href="/farm"
              className="hover:text-foreground transition-colors"
            >
              Farm
            </Link>{" "}
            <Link
              href="/assistant"
              className="hover:text-foreground transition-colors"
            >
              Assistant
            </Link>{" "}
          </div>{" "}
          <div className="hidden md:flex items-center gap-4">
            {" "}
            {user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-900/50"
              >
                {" "}
                Open Dashboard{" "}
              </Link>
            ) : (
              <>
                {" "}
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                >
                  {" "}
                  Log in{" "}
                </Link>{" "}
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-900/50"
                >
                  {" "}
                  Get Started{" "}
                </Link>{" "}
              </>
            )}{" "}
          </div>{" "}
          {/* Mobile Menu Toggle */}{" "}
          <button
            className="md:hidden text-muted-foreground p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {" "}
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}{" "}
          </button>{" "}
        </div>{" "}
        {/* Mobile Nav */}{" "}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-muted/10 border-b border-border py-6 px-6 flex flex-col gap-4 shadow-2xl">
            {" "}
            <Link
              href="#how-it-works"
              className="text-muted-foreground font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it works
            </Link>{" "}
            <Link
              href="#features"
              className="text-muted-foreground font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>{" "}
            <hr className="border-border my-2" />{" "}
            {user ? (
              <Link href="/dashboard" className="text-primary font-medium">
                Open Dashboard
              </Link>
            ) : (
              <>
                {" "}
                <Link
                  href="/login"
                  className="text-muted-foreground font-medium"
                >
                  Log in
                </Link>{" "}
                <Link href="/register" className="text-primary font-medium">
                  Get Started
                </Link>{" "}
              </>
            )}{" "}
          </div>
        )}{" "}
      </nav>{" "}
      {/* HERO SECTION */}{" "}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {" "}
        {/* Video Background Layer (z-0) */}{" "}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/cropscan-hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none motion-reduce:hidden z-0"
        >
          {" "}
          <source src="/video/cropscan-hero.mp4" type="video/mp4" />{" "}
        </video>{" "}
        {/* Theme-Aware Overlay Layer (z-10) */}{" "}
        {/* Dark mode: strong dark overlay. Light mode: bright translucent overlay. */}{" "}
        <div className="absolute inset-0 bg-white/75 dark:bg-[#040807]/85 backdrop-blur-[2px] pointer-events-none z-10" />{" "}
        {/* Abstract Background Elements */}{" "}
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none z-10" />{" "}
        <div className="absolute bottom-1/4 -right-64 w-[30rem] h-[30rem] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none z-10" />{" "}
        {/* Content Layer (z-20) */}{" "}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center z-20 py-20 lg:py-0">
          {" "}
          {/* Left Content */}{" "}
          <div className="space-y-8">
            {" "}
            <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
              {" "}
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
              <span>AI-POWERED CROP HEALTH</span>{" "}
            </div>{" "}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
              {" "}
              Your Crop.
              <br /> <span className="text-primary">Diagnosed by AI.</span>{" "}
            </h1>{" "}
            <p className="text-lg md:text-xl text-white max-w-lg font-light leading-relaxed">
              {" "}
              Capture a photo of your crop and let AI detect diseases, identify
              risks, and guide you toward the right treatment — all in your
              language.{" "}
            </p>{" "}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {" "}
              <Link
                href={user ? "/dashboard" : "/login"}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground rounded-full font-semibold text-base transition-all shadow-lg shadow-emerald-900/50"
              >
                {" "}
                Scan Your Crop{" "}
              </Link>{" "}
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-accent border border-border text-muted-foreground rounded-full font-medium text-base transition-all"
              >
                {" "}
                Explore AI Doctor{" "}
              </Link>{" "}
            </div>{" "}
            {/* Trust Indicators */}{" "}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border mt-8">
              {" "}
              <div className="flex items-center space-x-2 text-primary">
                {" "}
                <CheckCircle size={20} /> <span>Disease Detection</span>{" "}
              </div>{" "}
              <div className="flex items-center space-x-2 text-primary">
                {" "}
                <CheckCircle size={20} />{" "}
                <span>Weather‑Aware Diagnosis</span>{" "}
              </div>{" "}
              <div className="flex items-center space-x-2 text-primary">
                {" "}
                <CheckCircle size={20} />{" "}
                <span>Farmer‑Friendly Advice</span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Right Content - Product Visualization */}{" "}
          <div className="relative w-full aspect-square md:aspect-[4/5] max-w-lg mx-auto lg:ml-auto">
            {" "}
            <div className="absolute inset-[-10%] rounded-[40px] overflow-hidden">
              {" "}
              {/* Corner brackets */}{" "}
              <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-emerald-500/50" />{" "}
              <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-emerald-500/50" />{" "}
              <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-emerald-500/50" />{" "}
              <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-emerald-500/50" />{" "}
              {/* Plant Image Mockup */}{" "}
              <div className="absolute inset-12 flex items-center justify-center">
                {" "}
                {/* Simulated Leaf SVG matching photo 2 */}{" "}
                <svg
                  className="w-full h-full text-primary"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {" "}
                  <path
                    d="M50,10 C70,30 85,50 85,70 C85,90 70,95 50,95 C30,95 15,90 15,70 C15,50 30,30 50,10 Z"
                    fill="currentColor"
                    opacity="0.8"
                  />{" "}
                  <line
                    x1="50"
                    y1="15"
                    x2="50"
                    y2="90"
                    stroke="#08120d"
                    strokeWidth="1"
                  />{" "}
                  <line
                    x1="50"
                    y1="40"
                    x2="35"
                    y2="30"
                    stroke="#08120d"
                    strokeWidth="1"
                  />{" "}
                  <line
                    x1="50"
                    y1="50"
                    x2="70"
                    y2="40"
                    stroke="#08120d"
                    strokeWidth="1"
                  />{" "}
                  <line
                    x1="50"
                    y1="65"
                    x2="30"
                    y2="55"
                    stroke="#08120d"
                    strokeWidth="1"
                  />{" "}
                  <line
                    x1="50"
                    y1="75"
                    x2="65"
                    y2="65"
                    stroke="#08120d"
                    strokeWidth="1"
                  />{" "}
                  {/* Disease Spots */}{" "}
                  <circle cx="40" cy="45" r="4" fill="#a77a45" />{" "}
                  <circle cx="65" cy="55" r="3" fill="#a77a45" />{" "}
                  <circle cx="45" cy="65" r="2.5" fill="#a77a45" />{" "}
                </svg>{" "}
              </div>{" "}
              {/* AI Detection Box */}{" "}
              <div className="absolute top-1/3 left-1/4 right-1/4 bottom-1/3 border border-amber-500/80 rounded-sm bg-amber-500/10">
                {" "}
                <div className="absolute -top-7 left-0 bg-card border border-amber-500/50 px-2 py-1 rounded text-[10px] font-mono text-amber-500 flex items-center gap-2">
                  {" "}
                  <span>Late Blight</span> <span>94.2%</span>{" "}
                </div>{" "}
              </div>{" "}
              {/* Scanning Animation line */}{" "}
              <div className="absolute inset-x-12 h-[2px] bg-emerald-300 shadow-[0_0_20px_rgba(16,185,129,1)] animate-scan-line z-10" />{" "}
              {/* Bottom Info Bar */}{" "}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center px-4 font-mono text-[10px] text-primary/60 uppercase tracking-widest">
                {" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  <span>Live inference</span>{" "}
                </div>{" "}
                <span>model: yolov8n-crop-v3</span> <span>18ms/frame</span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* TRUST / PRODUCT STATS */}{" "}
      <section className="border-y border-border bg-muted/10/50 relative z-20">
        {" "}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          {" "}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x divide-border text-center">
            {" "}
            <div className="px-4">
              {" "}
              <p className="text-foreground font-semibold text-lg">
                Real-time
              </p>{" "}
              <p className="text-muted-foreground text-sm mt-1">
                AI crop analysis
              </p>{" "}
            </div>{" "}
            <div className="px-4">
              {" "}
              <p className="text-foreground font-semibold text-lg">
                Weather-aware
              </p>{" "}
              <p className="text-muted-foreground text-sm mt-1">
                Risk intelligence
              </p>{" "}
            </div>{" "}
            <div className="px-4">
              {" "}
              <p className="text-foreground font-semibold text-lg">
                Multi-language
              </p>{" "}
              <p className="text-muted-foreground text-sm mt-1">
                Hindi + English
              </p>{" "}
            </div>{" "}
            <div className="px-4">
              {" "}
              <p className="text-foreground font-semibold text-lg">
                Continuous
              </p>{" "}
              <p className="text-muted-foreground text-sm mt-1">
                Crop health tracking
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* LOCATION & WEATHER PREVIEW */}{" "}

      {/* HOW IT WORKS */}{" "}
      <section id="how-it-works" className="py-24 bg-muted/10">
        {" "}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {" "}
          <div className="text-center max-w-2xl mx-auto mb-16">
            {" "}
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How it works
            </h2>{" "}
            <p className="text-muted-foreground text-lg">
              A seamless workflow designed for the field, requiring zero
              technical knowledge.
            </p>{" "}
          </div>{" "}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {" "}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />{" "}
            {[
              {
                num: "01",
                title: "CAPTURE",
                desc: "Take a clear photo of the affected crop.",
              },
              {
                num: "02",
                title: "ANALYZE",
                desc: "AI processes the image and extracts visual symptoms.",
              },
              {
                num: "03",
                title: "IDENTIFY",
                desc: "Disease and severity are estimated, combined with weather data.",
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {" "}
                <div className="w-24 h-24 rounded-full bg-background border border-emerald-500/20 flex items-center justify-center text-3xl font-light text-primary mb-6 shadow-xl shadow-emerald-900/20">
                  {" "}
                  {step.num}{" "}
                </div>{" "}
                <h3 className="text-xl font-bold text-foreground mb-3 tracking-wide">
                  {step.title}
                </h3>{" "}
                <p className="text-muted-foreground leading-relaxed max-w-xs">
                  {step.desc}
                </p>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}


      {/* FEATURES GRID */}{" "}
      <section id="features" className="py-24 bg-background">
        {" "}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {" "}
          <div className="mb-16">
            {" "}
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              One scan.
              <br />
              <span className="text-muted-foreground">
                Complete crop intelligence.
              </span>
            </h2>{" "}
          </div>{" "}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {" "}
            {[
              {
                icon: Target,
                title: "AI Disease Detection",
                desc: "Identify visible crop diseases from a simple photograph with high-precision computer vision.",
              },
              {
                icon: Activity,
                title: "Disease Severity",
                desc: "Understand exactly how seriously your crop is affected to prioritize action.",
              },
              {
                icon: Shield,
                title: "Disease Risk",
                desc: "Combine crop history and live weather conditions to identify rising invisible risks.",
              },
              {
                icon: Clock,
                title: "Smart Treatment Timing",
                desc: "Know precisely when weather conditions are most suitable for treatment application.",
              },
              {
                line: true,
                icon: LineChart,
                title: "Crop Health Timeline",
                desc: "Track how your crop recovers and changes across continuous scans.",
              },
              {
                icon: Globe,
                title: "Regional Disease Intelligence",
                desc: "Understand disease activity and outbreaks across nearby farms and regions.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-8 rounded-3xl bg-card border border-border hover:border-emerald-500/30 hover:bg-accent transition-all group cursor-default"
              >
                {" "}
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-300">
                  {" "}
                  <f.icon
                    size={20}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />{" "}
                </div>{" "}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {f.title}
                </h3>{" "}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.desc}
                </p>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}



      {/* BOTTOM CTA */}{" "}
      <section className="py-32 relative overflow-hidden">
        {" "}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/20" />{" "}
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          {" "}
          <h2 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
            Give your crop a <br />
            second set of eyes.
          </h2>{" "}
          <p className="text-xl text-muted-foreground font-light mb-10">
            Start monitoring crop health with AI-powered agricultural
            intelligence.
          </p>{" "}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {" "}
            <Link
              href={user ? "/dashboard" : "/register"}
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground rounded-2xl font-semibold text-lg transition-all shadow-xl shadow-emerald-900/50"
            >
              {" "}
              Start Diagnosing{" "}
            </Link>{" "}
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-accent hover:bg-accent/80 border border-border text-foreground rounded-2xl font-semibold text-lg transition-all"
            >
              {" "}
              Explore the Platform{" "}
            </Link>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* FOOTER */}{" "}
      <footer className="border-t border-border py-12 bg-background">
        {" "}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          {" "}
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            {" "}
            <Leaf size={16} className="text-primary" />{" "}
            <span className="font-bold text-lg tracking-tight text-foreground">
              CropScan.ai
            </span>{" "}
          </div>{" "}
          <div className="text-xs text-muted-foreground">
            {" "}
            AI-powered crop health intelligence. © 2026{" "}
          </div>{" "}
        </div>{" "}
      </footer>{" "}
      {/* GLOBAL CSS ANIMATION DEFINITIONS */}{" "}
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes scan { 0% { transform: translateY(-100%); } 50% { transform: translateY(200%); } 100% { transform: translateY(-100%); } } .animate-scan { animation: scan 4s ease-in-out infinite; } @keyframes scan-line { 0% { top: 15%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 85%; opacity: 0; } } .animate-scan-line { animation: scan-line 2.5s ease-in-out infinite alternate; } .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }`,
        }}
      />{" "}
    </div>
  );
}
