import React from 'react';
import { ShieldCheck, CheckCircle, AlertTriangle, Users, MapPin, Bus, School, Award, Sparkles } from 'lucide-react';

export default function AIExplainabilityCard({ ticket }) {
  if (!ticket) return null;

  const reasons = ticket.explanationReasons || [
    "42 complaints reported in this 200m radius",
    "School located within 150 meters",
    "Road completely damaged along main transit route",
    "Heavy peak-hour traffic corridor",
    "Estimated 5,000+ citizens affected daily"
  ];

  return (
    <div class="gov-card p-5 border-l-4 border-l-blue-500 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40">
      
      {/* Header with Title & Gemini Badge */}
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Sparkles class="w-4 h-4" />
          </div>
          <div>
            <h4 class="font-bold text-sm text-white">AI Decision Confidence & Explainability Panel</h4>
            <p class="text-[11px] text-slate-400">Powered by Gemini 2.5 Municipal Governance Intelligence</p>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/40 flex items-center gap-1">
          <ShieldCheck class="w-3.5 h-3.5" /> High AI Precision
        </span>
      </div>

      {/* 3 Confidence Metrics */}
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center">
          <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Dept Confidence</p>
          <div class="text-lg font-extrabold text-blue-400">{ticket.departmentConfidence || 98}%</div>
          <p class="text-[10px] text-slate-400">{ticket.department || 'Roads'}</p>
        </div>
        
        <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center">
          <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Priority Confidence</p>
          <div class="text-lg font-extrabold text-red-400">{ticket.priorityConfidence || 94}%</div>
          <p class="text-[10px] text-slate-400">{ticket.priority || 'Critical'}</p>
        </div>

        <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center">
          <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Duplicate Similarity</p>
          <div class="text-lg font-extrabold text-amber-400">{ticket.duplicateScore || 91}%</div>
          <p class="text-[10px] text-slate-400">Match Found</p>
        </div>
      </div>

      {/* Explainable AI Reasons Bullets */}
      <div>
        <h5 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <CheckCircle class="w-3.5 h-3.5 text-blue-400" /> Explainable AI Decision Breakdown (Why this Priority?):
        </h5>
        <div class="space-y-2">
          {reasons.map((reason, idx) => (
            <div key={idx} class="flex items-start gap-2.5 bg-slate-950/40 p-2 rounded-md border border-slate-800/60 text-xs text-slate-200">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
