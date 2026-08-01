import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { Users, HardHat, AlertCircle, CheckCircle2, PlusCircle } from 'lucide-react';

export default function ResourceAllocation() {
  const { departments } = useAppData();

  return (
    <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div class="gov-card p-6 border-l-4 border-l-blue-500">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">AI Resource & Workforce Allocation Engine</h2>
            <p class="text-xs text-slate-400">Suggest manpower, engineering teams, and heavy equipment deployment based on complaint severity</p>
          </div>
        </div>
      </div>

      {/* Resource Cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => {
          const needsExtra = dept.recommendedEngineers > 0;

          return (
            <div 
              key={dept.name} 
              class={`gov-card p-5 border-l-4 ${needsExtra ? 'border-l-amber-500' : 'border-l-emerald-500'} space-y-4`}
            >
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div class="flex items-center gap-2">
                  <HardHat class="w-5 h-5 text-blue-400" />
                  <h3 class="font-extrabold text-base text-white">{dept.name} Department</h3>
                </div>
                <span class={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${needsExtra ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                  {needsExtra ? `Needs +${dept.recommendedEngineers} Staff` : 'Adequate Personnel'}
                </span>
              </div>

              <div class="grid grid-cols-3 gap-3 text-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <p class="text-[10px] text-slate-400 uppercase font-semibold">Total Need</p>
                  <p class="text-lg font-extrabold text-white mt-0.5">{dept.needEngineers} Engineers</p>
                </div>

                <div>
                  <p class="text-[10px] text-slate-400 uppercase font-semibold">Current Active</p>
                  <p class="text-lg font-extrabold text-blue-400 mt-0.5">{dept.currentEngineers} Active</p>
                </div>

                <div>
                  <p class="text-[10px] text-slate-400 uppercase font-semibold">AI Recommendation</p>
                  <p class={`text-lg font-extrabold mt-0.5 ${needsExtra ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {needsExtra ? `+${dept.recommendedEngineers} Deploy` : 'No Extra'}
                  </p>
                </div>
              </div>

              <div class="text-xs text-slate-300 space-y-1">
                <p><strong>Primary Equipment Deployment:</strong> {dept.name === 'Roads' ? 'Asphalt Layer & Heavy Paver' : dept.name === 'Water' ? 'High-Pressure Leak Detection Van' : 'Mechanical De-Silting Pumps'}</p>
                <p class="text-slate-400">Target Resolution Window: {dept.avgDays} days average turnaround</p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
