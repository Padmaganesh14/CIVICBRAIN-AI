import React from 'react';
import { useAppData } from '../context/AppDataContext';
import AIExplainabilityCard from '../components/AIExplainabilityCard';
import { CheckCircle2, Ticket, Clock, ShieldCheck, MapPin, ArrowRight, Share2, Printer } from 'lucide-react';

export default function ComplaintResult() {
  const { activeTicket, setActivePage } = useAppData();

  if (!activeTicket) return null;

  return (
    <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Success Ticket Card */}
      <div class="gov-card p-6 border-l-4 border-l-emerald-500 bg-gradient-to-br from-slate-900 to-emerald-950/20">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <CheckCircle2 class="w-8 h-8" />
            </div>
            <div>
              <span class="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/40">
                Grievance Formally Registered
              </span>
              <h2 class="text-xl font-bold text-white mt-1">{activeTicket.title}</h2>
            </div>
          </div>

          <div class="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ticket Reference ID</p>
            <p class="text-sm font-extrabold text-blue-400 font-mono">{activeTicket.id}</p>
          </div>
        </div>

        {/* 4 Summary Metric Pill Cards */}
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          
          <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <p class="text-[10px] text-slate-400 uppercase font-semibold">Assigned Dept</p>
            <p class="text-sm font-extrabold text-blue-400 mt-1">{activeTicket.department}</p>
          </div>

          <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <p class="text-[10px] text-slate-400 uppercase font-semibold">Predicted Priority</p>
            <p class={`text-sm font-extrabold mt-1 ${activeTicket.priority === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>
              {activeTicket.priority} ({activeTicket.priorityConfidence || 94}%)
            </p>
          </div>

          <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <p class="text-[10px] text-slate-400 uppercase font-semibold">Estimated Budget</p>
            <p class="text-sm font-extrabold text-emerald-400 mt-1">{activeTicket.estimatedBudget || '₹4.8 Lakhs'}</p>
          </div>

          <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <p class="text-[10px] text-slate-400 uppercase font-semibold">Est. Resolution</p>
            <p class="text-sm font-extrabold text-slate-200 mt-1">{activeTicket.estimatedResolution || '2 Days'}</p>
          </div>

        </div>

        {/* AI Confidence & Explainability Component */}
        <AIExplainabilityCard ticket={activeTicket} />

        {/* Track Timeline Action */}
        <div class="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-xs text-slate-400 flex items-center gap-1">
            <MapPin class="w-3.5 h-3.5 text-red-400" /> Location: {activeTicket.location}
          </p>

          <button 
            onClick={() => setActivePage('citizen-dashboard')}
            class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition"
          >
            Track Status Timeline <ArrowRight class="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
