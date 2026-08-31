"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Landmark, 
  Search, 
  X, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import schemesData from '@/data/schemes.json';

// Define the Scheme type based on our JSON structure
type Scheme = typeof schemesData[0];

export default function SchemesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(schemesData.map(s => s.category));
    return ['All', ...Array.from(cats)];
  }, []);

  // Extract unique states/types
  const stateOptions = useMemo(() => {
    const states = new Set(schemesData.map(s => s.state));
    states.delete('Central'); // Handle Central explicitly
    return ['All', 'Central', 'State-specific', ...Array.from(states)];
  }, []);

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return schemesData.filter(scheme => {
      // 1. Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery || 
        scheme.name.toLowerCase().includes(query) ||
        scheme.shortDescription.toLowerCase().includes(query) ||
        scheme.description.toLowerCase().includes(query) ||
        scheme.tags.some(tag => tag.toLowerCase().includes(query));

      // 2. Category
      const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;

      // 3. State
      let matchesState = true;
      if (selectedState !== 'All') {
        if (selectedState === 'Central') {
          matchesState = scheme.state === 'Central';
        } else if (selectedState === 'State-specific') {
          matchesState = scheme.state !== 'Central';
        } else {
          matchesState = scheme.state === selectedState;
        }
      }

      return matchesSearch && matchesCategory && matchesState;
    });
  }, [searchQuery, selectedCategory, selectedState]);

  // Handle escape key for modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedScheme) {
        setSelectedScheme(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedScheme]);

  return (
    <div className="min-h-screen pb-20 md:pb-8 pt-6 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 border-b border-border pb-6"
      >
        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
          <Landmark className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Government Schemes</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Discover government schemes and financial support available for farmers.
          </p>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search schemes, keywords, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Categories */}
          <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-none hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                  selectedCategory === cat 
                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                    : 'bg-card border-border text-foreground hover:bg-emerald-500/10 hover:border-emerald-500/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* States */}
          <div className="shrink-0 flex gap-2 overflow-x-auto pb-2 scrollbar-none hide-scrollbar">
            {stateOptions.map((stateOption) => (
              <button
                key={stateOption}
                onClick={() => setSelectedState(stateOption)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                  selectedState === stateOption 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'bg-card border-border text-foreground hover:bg-primary/10 hover:border-primary/30'
                }`}
              >
                {stateOption}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      {filteredSchemes.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredSchemes.map((scheme, index) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (index * 0.05) }}
              whileHover={{ y: -4 }}
              className="group bg-card border border-border hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedScheme(scheme)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {scheme.category}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {scheme.state === 'Central' ? 'Central Govt' : scheme.state}
                  </span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {scheme.name}
              </h3>
              
              <p className="text-muted-foreground text-sm flex-1 mb-6 line-clamp-3">
                {scheme.shortDescription}
              </p>

              <div className="space-y-2 mb-6">
                {scheme.benefits.slice(0, 2).map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{benefit}</span>
                  </div>
                ))}
                {scheme.benefits.length > 2 && (
                  <p className="text-xs text-muted-foreground italic ml-6">
                    + {scheme.benefits.length - 2} more benefits
                  </p>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="text-sm">View Details</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 px-4 rounded-2xl border border-dashed border-border bg-card/50"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No schemes found</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Try changing your search terms or adjusting the category and state filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedState('All');
            }}
            className="mt-6 px-6 py-2.5 bg-foreground text-background font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedScheme && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 md:py-12">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedScheme(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border bg-card">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {selectedScheme.category}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {selectedScheme.state === 'Central' ? 'Central Govt' : selectedScheme.state}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground pr-8">
                    {selectedScheme.name}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedScheme(null)}
                  className="absolute top-6 right-6 p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8 flex-1">
                <div>
                  <p className="text-foreground text-sm md:text-base leading-relaxed">
                    {selectedScheme.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-base font-bold flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> 
                    Key Benefits
                  </h4>
                  <ul className="space-y-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/10">
                    {selectedScheme.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-base font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> 
                    Eligibility Criteria
                  </h4>
                  <ul className="space-y-3 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl p-5 border border-blue-500/10">
                    {selectedScheme.eligibility.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-base font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-500" /> 
                    Required Documents
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedScheme.documents.map((doc, i) => (
                      <span key={i} className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm text-foreground">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-card flex flex-col sm:flex-row gap-4 items-center justify-between">
                <p className="text-xs text-muted-foreground flex-1 text-center sm:text-left">
                  Please verify all details on the official website before applying.
                </p>
                <a 
                  href={selectedScheme.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-md shadow-emerald-500/20 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                >
                  Visit Official Website
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global CSS to hide scrollbar if missing in Tailwind */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
