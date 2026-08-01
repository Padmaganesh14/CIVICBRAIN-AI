import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { User, MapPin, FilePlus, Search, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function CitizenDashboard() {
  const { complaints, setActivePage, setActiveTicket } = useAppData();
  const { t } = useLanguage();

  return (
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Greeting Card */}
      <div class="gov-card p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border-l-4 border-l-blue-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-extrabold text-xl shadow-lg">
            V
          </div>
          <div>
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              {t.hello} <span class="text-xs px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 font-semibold border border-blue-700/50">Verified Citizen</span>
            </h2>
            <p class="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <MapPin class="w-3.5 h-3.5 text-red-400" /> {t.ward} • Metro Zone 4
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setActivePage('raise-complaint')}
            class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition"
          >
            <FilePlus class="w-4 h-4" /> {t.raiseComplaint}
          </button>
          
          <button 
            onClick={() => setActivePage('citizen-dashboard')}
            class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <Search class="w-4 h-4" /> {t.trackComplaint}
          </button>
        </div>

      </div>

      {/* Active Complaints List */}
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-base text-white flex items-center gap-2">
            <Clock class="w-4 h-4 text-blue-400" /> Active Citizen Complaints ({complaints.length})
          </h3>
          <span class="text-xs text-slate-400 font-medium">Auto-updated in real-time</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((item) => (
            <div 
              key={item.id}
              onClick={() => { setActiveTicket(item); setActivePage('complaint-result'); }}
              class="gov-card p-5 border-l-4 border-l-amber-500 hover:border-blue-500 transition cursor-pointer group space-y-3"
            >
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <span class="font-mono text-xs text-slate-400 font-bold">{item.id}</span>
                <span class={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                  item.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {item.priority} Priority ({item.priorityConfidence || 94}%)
                </span>
              </div>

              <div>
                <h4 class="font-bold text-sm text-white group-hover:text-blue-400 transition">{item.title}</h4>
                <p class="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
              </div>

              <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                <div>
                  <span class="text-slate-400 block">Department</span>
                  <strong class="text-blue-400">{item.department}</strong>
                </div>
                <div>
                  <span class="text-slate-400 block">Status</span>
                  <strong class="text-emerald-400">{item.status}</strong>
                </div>
                <div>
                  <span class="text-slate-400 block">Est. Resolution</span>
                  <strong class="text-slate-200">{item.estimatedResolution || '2 Days'}</strong>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
