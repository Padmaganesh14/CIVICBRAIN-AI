import React from 'react';
import { ShieldAlert, Send, FileText, X } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function EmergencyAlertBanner() {
  const { emergencyAlert, setEmergencyAlert, setActivePage } = useAppData();

  if (!emergencyAlert) return null;

  return (
    <div class="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 border-y border-red-700 p-4 shadow-2xl animate-pulse">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-red-600/30 text-red-400 border border-red-500/50 flex items-center justify-center flex-shrink-0 animate-bounce">
            <ShieldAlert class="w-7 h-7" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 bg-red-600 text-white text-[10px] font-extrabold rounded uppercase tracking-wider">
                🚨 EMERGENCY DETECTED (100+ Complaints in 2 Hours)
              </span>
              <span class="text-red-200 text-xs font-bold">Ward 7 Incident Bottleneck</span>
            </div>
            <h4 class="text-base font-extrabold text-white mt-0.5">Flash Flood & Severe Drainage Overflow Warning</h4>
            <p class="text-xs text-red-200">System auto-flagged 114 drainage overflow grievances between 07:00 AM and 09:00 AM.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            onClick={() => alert("🚨 SMS & WhatsApp Alert dispatched to District Commissioner & Ward 7 Incident Response Team!")}
            class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-lg shadow-lg flex items-center gap-1.5 transition"
          >
            <Send class="w-3.5 h-3.5" /> Notify Commissioner
          </button>
          
          <button 
            onClick={() => setActivePage('reports')}
            class="px-4 py-2 bg-slate-900 text-red-300 border border-red-500/40 hover:bg-slate-800 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition"
          >
            <FileText class="w-3.5 h-3.5" /> Emergency Report
          </button>

          <button 
            onClick={() => setEmergencyAlert(false)}
            class="p-2 text-red-300 hover:text-white"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
