import React from 'react';
import { AlertCircle, ChevronRight, Award, ShieldAlert } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

const wardRankings = [
  { rank: 1, ward: "Ward 18", complaints: 232, status: "Critical Alert", color: "text-red-400 bg-red-500/20 border-red-500/40", budget: "₹75 Lakhs" },
  { rank: 2, ward: "Ward 7", complaints: 198, status: "High Priority", color: "text-amber-400 bg-amber-500/20 border-amber-500/40", budget: "₹42 Lakhs" },
  { rank: 3, ward: "Ward 12", complaints: 165, status: "Moderate Alert", color: "text-amber-400 bg-amber-500/20 border-amber-500/40", budget: "₹28 Lakhs" },
  { rank: 4, ward: "Ward 4", complaints: 142, status: "Active Monitor", color: "text-blue-400 bg-blue-500/20 border-blue-500/40", budget: "₹20 Lakhs" },
  { rank: 5, ward: "Ward 9", complaints: 110, status: "Low Risk", color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40", budget: "₹15 Lakhs" }
];

export default function WardRankingsWidget() {
  const { setActivePage } = useAppData();

  return (
    <div class="gov-card p-5">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div class="flex items-center gap-2">
          <Award class="w-4 h-4 text-amber-400" />
          <h4 class="font-bold text-sm text-white">Municipal Ward Rankings Leaderboard</h4>
        </div>
        <span class="text-[11px] text-slate-400 font-medium">Ranked by Grievance Volume</span>
      </div>

      <div class="space-y-2.5">
        {wardRankings.map((item) => (
          <div 
            key={item.rank}
            onClick={() => setActivePage('heatmap')}
            class="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <span class={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${item.rank === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                {item.rank}
              </span>
              <div>
                <p class="font-bold text-xs text-white group-hover:text-blue-400 transition">{item.ward}</p>
                <p class="text-[11px] text-slate-400">{item.complaints} total complaints logged</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${item.color}`}>
                {item.status}
              </span>
              <ChevronRight class="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
