import React from 'react';
import { Star, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function DepartmentScorecard() {
  const { departments } = useAppData();

  return (
    <div class="gov-card p-5">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h4 class="font-bold text-sm text-white flex items-center gap-2">
          <Star class="w-4 h-4 text-amber-400 fill-amber-400" /> Department Performance & Satisfaction Scorecards
        </h4>
        <div class="flex items-center gap-1 text-xs text-amber-400 font-extrabold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
          ★ 4.3 / 5 Overall Satisfaction (1,528 Grievances)
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {departments.map((dept) => (
          <div key={dept.name} class="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-sm text-white">{dept.name} Dept</span>
              <span class="text-xs font-bold text-amber-400 flex items-center gap-0.5">
                ★ {dept.satisfaction} / 5
              </span>
            </div>

            <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
              <div>
                <p class="text-[10px] text-slate-400">Avg Resolution</p>
                <p class="text-xs font-bold text-blue-400">{dept.avgDays} days</p>
              </div>
              <div>
                <p class="text-[10px] text-slate-400">Resolved Rate</p>
                <p class="text-xs font-bold text-emerald-400">{dept.resolvedPct}%</p>
              </div>
              <div>
                <p class="text-[10px] text-slate-400">Pending</p>
                <p class="text-xs font-bold text-red-400">{dept.pending}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
