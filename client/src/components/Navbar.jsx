import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, ShieldAlert, Bot, Globe, Sun, Moon, 
  User, UserCheck, LayoutDashboard, FilePlus, MapPin, 
  PieChart, FileText, Settings, Bell, Zap, Layers, 
  Users, GitMerge, ChevronDown, Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { 
    userRole, setUserRole, 
    activePage, setActivePage, 
    emergencyAlert, triggerEmergency,
    setShowCopilot 
  } = useAppData();

  const { lang, setLang, t, darkMode, setDarkMode } = useLanguage();

  // Navigation Items Config with Status Badges and Subtitles
  const officialNavItems = [
    {
      id: 'official-dashboard',
      label: 'Executive',
      subtitle: 'Governance Overview',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      subtitle: 'Daily Intelligence',
      icon: Zap,
      badge: '6 New',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    {
      id: 'duplicate-detection',
      label: 'Duplicates',
      subtitle: 'AI Merge Engine',
      icon: GitMerge,
      badge: '4 Match',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
    },
    {
      id: 'budget-allocation',
      label: 'Budget Engine',
      subtitle: 'What-If Simulation',
      icon: PieChart,
      badge: '3 Pending',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    {
      id: 'resource-allocation',
      label: 'Resources',
      subtitle: 'Workforce Gap',
      icon: Users,
      badge: '+5 Need',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    },
    {
      id: 'heatmap',
      label: 'GIS Map',
      subtitle: 'Spatial Hotspots',
      icon: MapPin,
      badge: 'Live Map',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40'
    },
    {
      id: 'reports',
      label: 'Reports',
      subtitle: 'PDF Brief Exporter',
      icon: FileText,
      badge: 'Today',
      badgeColor: 'bg-slate-700/50 text-slate-300 border-slate-600'
    }
  ];

  const citizenNavItems = [
    {
      id: 'citizen-dashboard',
      label: 'My Grievances',
      subtitle: 'Ward 18 Status',
      icon: LayoutDashboard,
      badge: 'Active',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    },
    {
      id: 'raise-complaint',
      label: 'Raise Complaint',
      subtitle: 'Voice & Map Intake',
      icon: FilePlus,
      badge: '+ New',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    }
  ];

  const navItems = userRole === 'official' ? officialNavItems : citizenNavItems;

  return (
    <header class="sticky top-0 z-40 bg-[#0B1528]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      
      {/* Top Header Control Bar */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between border-b border-slate-800/50">
        
        {/* Brand & Municipal Seal */}
        <div 
          onClick={() => setActivePage('landing')} 
          class="flex items-center gap-3 cursor-pointer group"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
            <div class="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
              <Building2 class="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-lg text-white tracking-tight">CivicBrain <span class="text-blue-400">AI</span></span>
              <span class="bg-blue-900/60 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-700/50 uppercase tracking-wider">
                CONTROL CENTER
              </span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium">Smart Municipal Decision Intelligence</p>
          </div>
        </div>

        {/* Right Tools: Notifications, Language, Segmented Role Switch, Floating Copilot & Emergency */}
        <div class="flex items-center gap-2.5">
          
          {/* Emergency Alert Indicator / Trigger */}
          <button 
            onClick={() => {
              if (!emergencyAlert) triggerEmergency();
              setActivePage('official-dashboard');
            }}
            class={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg ${
              emergencyAlert 
                ? 'bg-red-600/30 text-red-300 border border-red-500/60 animate-pulse ring-2 ring-red-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-red-400 border border-slate-800'
            }`}
          >
            <ShieldAlert class={`w-4 h-4 ${emergencyAlert ? 'text-red-400 animate-bounce' : ''}`} />
            <span class="hidden sm:inline">
              {emergencyAlert ? '🚨 Emergency Center [1 Alert]' : 'Simulate Emergency'}
            </span>
          </button>

          {/* Floating AI Commissioner Copilot Button */}
          <button 
            onClick={() => setShowCopilot(true)}
            class="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:brightness-110 text-white text-xs font-extrabold rounded-xl shadow-lg ring-2 ring-blue-500/30 flex items-center gap-2 transition hover:scale-105"
          >
            <Bot class="w-4 h-4 text-amber-300 animate-bounce" />
            <span class="hidden md:inline">Ask Copilot</span>
          </button>

          {/* Regional Language Switcher */}
          <div class="relative group">
            <button class="px-2.5 py-1.5 bg-slate-900/90 text-slate-300 hover:text-white rounded-xl border border-slate-800 flex items-center gap-1.5 text-xs font-bold">
              <Globe class="w-3.5 h-3.5 text-blue-400" />
              <span>🌐 {lang}</span>
              <ChevronDown class="w-3 h-3 text-slate-500" />
            </button>
            <div class="absolute right-0 top-full mt-1.5 hidden group-hover:block bg-[#0F172A] border border-slate-800 rounded-xl shadow-2xl py-1.5 w-32 z-50">
              <button onClick={() => setLang('EN')} class="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-300 hover:bg-blue-600/20 hover:text-blue-400 flex items-center gap-2">🌐 English</button>
              <button onClick={() => setLang('TA')} class="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-300 hover:bg-blue-600/20 hover:text-blue-400 flex items-center gap-2">தமிழ் (Tamil)</button>
              <button onClick={() => setLang('HI')} class="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-300 hover:bg-blue-600/20 hover:text-blue-400 flex items-center gap-2">हिंदी (Hindi)</button>
              <button onClick={() => setLang('ML')} class="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-300 hover:bg-blue-600/20 hover:text-blue-400 flex items-center gap-2">മലയാളം (ML)</button>
            </div>
          </div>

          {/* Segmented Control Role Switcher */}
          <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => { setUserRole('citizen'); setActivePage('citizen-dashboard'); }}
              class={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${userRole === 'citizen' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <User class="w-3.5 h-3.5" /> Citizen
            </button>
            <button 
              onClick={() => { setUserRole('official'); setActivePage('official-dashboard'); }}
              class={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${userRole === 'official' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <UserCheck class="w-3.5 h-3.5" /> Official
            </button>
          </div>

        </div>

      </div>

      {/* Enterprise Control Ribbon Navigation Bar */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
        <div class="flex items-center gap-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                class={`group relative px-3.5 py-2 rounded-xl text-left transition-all duration-300 flex items-center gap-3 border ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/60 border-blue-500/60 shadow-lg shadow-blue-500/10 scale-[1.02]'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 hover:-translate-y-1'
                }`}
              >
                {/* Icon Container with subtle scale on hover */}
                <div class={`p-2 rounded-lg transition-transform group-hover:scale-110 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-slate-800 text-slate-400 group-hover:text-blue-400'
                }`}>
                  <Icon class="w-4 h-4" />
                </div>

                {/* Title & Subtitle */}
                <div>
                  <div class="flex items-center gap-2">
                    <span class={`font-extrabold text-xs tracking-tight ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {item.label}
                    </span>
                    <span class={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 group-hover:text-slate-300 font-medium">
                    {item.subtitle}
                  </p>
                </div>

                {/* Active Underline Glow */}
                {isActive && (
                  <div class="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full shadow-glow"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </header>
  );
}
