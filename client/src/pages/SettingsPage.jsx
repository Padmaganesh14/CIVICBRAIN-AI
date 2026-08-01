import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAppData } from '../context/AppDataContext';
import { Settings, Globe, Moon, Sun, User, LogOut, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { lang, setLang, darkMode, setDarkMode } = useLanguage();
  const { userRole, setUserRole, setActivePage } = useAppData();

  return (
    <div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      <div class="gov-card p-6 border-l-4 border-l-blue-500">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Settings class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">System Settings & Language Preferences</h2>
            <p class="text-xs text-slate-400">Configure portal localization, theme modes, and account roles</p>
          </div>
        </div>
      </div>

      <div class="gov-card p-6 space-y-6">
        
        {/* Language Selection */}
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Globe class="w-4 h-4 text-emerald-400" /> Regional Language (Localization)
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { code: 'EN', name: 'English' },
              { code: 'TA', name: 'தமிழ் (Tamil)' },
              { code: 'HI', name: 'हिंदी (Hindi)' },
              { code: 'ML', name: 'മലയാളം (Malayalam)' }
            ].map(item => (
              <button 
                key={item.code}
                onClick={() => setLang(item.code)}
                class={`p-3 rounded-xl border text-xs font-bold text-left transition ${lang === item.code ? 'bg-blue-600/30 text-blue-400 border-blue-500' : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'}`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dark / Light Theme Toggle */}
        <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <h4 class="font-bold text-sm text-white">Interface Theme Mode</h4>
            <p class="text-xs text-slate-400">Switch between High-Contrast Governance Dark and Light mode</p>
          </div>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            class="px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2"
          >
            {darkMode ? <Moon class="w-4 h-4 text-blue-400" /> : <Sun class="w-4 h-4 text-amber-400" />}
            <span>{darkMode ? 'Dark Theme' : 'Light Theme'}</span>
          </button>
        </div>

        {/* Logout */}
        <div class="pt-4 border-t border-slate-800">
          <button 
            onClick={() => { setUserRole('citizen'); setActivePage('landing'); }}
            class="w-full py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <LogOut class="w-4 h-4" /> Reset Session & Logout
          </button>
        </div>

      </div>

    </div>
  );
}
