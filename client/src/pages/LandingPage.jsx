import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, ShieldCheck, Zap, PieChart, Users, ArrowRight, 
  CheckCircle2, Bot, Layers, BarChart3, Lock, Sparkles, MapPin 
} from 'lucide-react';

export default function LandingPage() {
  const { setUserRole, setActivePage } = useAppData();
  const { t } = useLanguage();

  return (
    <div class="min-h-screen bg-gov-dark text-slate-100 flex flex-col">
      
      {/* Hero Section with Animated City Skyline */}
      <section class="relative pt-12 pb-24 px-4 overflow-hidden border-b border-slate-800">
        
        {/* Background Skyline Canvas SVG Graphic */}
        <div class="absolute inset-0 opacity-20 pointer-events-none flex items-end justify-center">
          <svg class="w-full h-80 text-blue-500 fill-current" viewBox="0 0 1200 300">
            <rect x="50" y="80" width="70" height="220" rx="4" />
            <rect x="140" y="40" width="90" height="260" rx="4" />
            <rect x="250" y="120" width="60" height="180" rx="4" />
            <rect x="330" y="20" width="110" height="280" rx="4" />
            <rect x="460" y="90" width="80" height="210" rx="4" />
            <rect x="560" y="50" width="100" height="250" rx="4" />
            <rect x="680" y="140" width="75" height="160" rx="4" />
            <rect x="770" y="30" width="120" height="270" rx="4" />
            <rect x="910" y="100" width="85" height="200" rx="4" />
            <rect x="1010" y="60" width="95" height="240" rx="4" />
          </svg>
        </div>

        <div class="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/50 border border-blue-700/60 rounded-full text-blue-300 text-xs font-bold shadow-lg">
            <Sparkles class="w-3.5 h-3.5 text-amber-400 animate-spin" /> Next-Gen AI Decision Support Engine
          </div>

          <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            CivicBrain <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">AI</span>
          </h1>

          <p class="text-lg sm:text-xl font-medium text-slate-300 max-w-3xl mx-auto">
            {t.tagline}
          </p>

          <p class="text-sm text-slate-400 max-w-2xl mx-auto">
            {t.subtitle} Elevating grievance management into production-ready predictive municipal decision intelligence.
          </p>

          {/* Quick Dual Login Action Buttons */}
          <div class="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => { setUserRole('citizen'); setActivePage('citizen-dashboard'); }}
              class="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold rounded-xl shadow-xl hover:shadow-blue-500/2 shadow-blue-500/10 flex items-center gap-2 transition hover:scale-105"
            >
              <Users class="w-4 h-4" /> {t.loginCitizen} <ArrowRight class="w-4 h-4" />
            </button>

            <button 
              onClick={() => { setUserRole('official'); setActivePage('official-dashboard'); }}
              class="px-6 py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold rounded-xl shadow-xl hover:shadow-amber-500/2 shadow-amber-500/10 flex items-center gap-2 transition hover:scale-105"
            >
              <ShieldCheck class="w-4 h-4" /> {t.loginOfficial} <ArrowRight class="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Live Statistics Counter Cards */}
      <section class="py-12 bg-slate-950/80 border-b border-slate-800">
        <div class="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div class="text-3xl font-extrabold text-white mb-1">1,000+</div>
            <p class="text-xs text-slate-400 font-semibold">Complaints Processed</p>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div class="text-3xl font-extrabold text-emerald-400 mb-1">95.8%</div>
            <p class="text-xs text-slate-400 font-semibold">AI Classification Accuracy</p>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div class="text-3xl font-extrabold text-blue-400 mb-1">30%</div>
            <p class="text-xs text-slate-400 font-semibold">Faster Decision Making</p>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div class="text-3xl font-extrabold text-amber-400 mb-1">AI Budget</div>
            <p class="text-xs text-slate-400 font-semibold">Weighted Metric Optimization</p>
          </div>

        </div>
      </section>

      {/* Architecture & How It Works */}
      <section class="py-16 px-4 max-w-6xl mx-auto space-y-12">
        
        <div class="text-center">
          <h2 class="text-2xl sm:text-3xl font-bold text-white mb-3">System Architecture & Hackathon Workflow</h2>
          <p class="text-xs text-slate-400">Complete decision-intelligence loop connecting citizens directly with executive governance</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div class="gov-card p-6 border-t-4 border-t-blue-500 space-y-3">
            <div class="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</div>
            <h3 class="font-bold text-base text-white">Citizen Complaint Intake</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Citizens log issues via text, voice recognition (Speech-to-Text), or image uploads with automatic Ward location tagging.
            </p>
          </div>

          <div class="gov-card p-6 border-t-4 border-t-indigo-500 space-y-3">
            <div class="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">2</div>
            <h3 class="font-bold text-base text-white">Gemini Decision Engine</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Gemini classifies department, assigns priority confidence, detects duplicates, and generates explainable reasoning.
            </p>
          </div>

          <div class="gov-card p-6 border-t-4 border-t-emerald-500 space-y-3">
            <div class="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">3</div>
            <h3 class="font-bold text-base text-white">Executive Decision Support</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Commissioners view ward heatmaps, run What-If budget simulations, review staff gap analysis, and export signed governance PDFs.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}
