import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { Sliders, TrendingDown, Clock, ArrowUpRight, DollarSign, CheckCircle2 } from 'lucide-react';

export default function BudgetSimulator() {
  const { totalPoolBudgetLakhs, setTotalPoolBudgetLakhs, budgetAllocations } = useAppData();

  const roadDept = budgetAllocations.find(d => d.name === 'Roads') || budgetAllocations[0];

  return (
    <div class="gov-card p-6 border-l-4 border-l-emerald-500 bg-gradient-to-br from-slate-900 to-emerald-950/20">
      
      {/* Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
              <Sliders class="w-3.5 h-3.5" /> INNOVATION HIGHLIGHT
            </span>
            <h3 class="text-base font-bold text-white">Smart "What-If" Budget Simulation Engine</h3>
          </div>
          <p class="text-xs text-slate-400 mt-1">Simulate impact of municipal fund reallocations on complaint resolution speeds</p>
        </div>

        {/* Total Pool Slider */}
        <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-[220px]">
          <div class="flex justify-between text-xs font-bold text-slate-300 mb-1">
            <span>Total Budget Pool:</span>
            <span class="text-emerald-400 text-sm">₹{totalPoolBudgetLakhs} Lakhs</span>
          </div>
          <input 
            type="range" 
            min="100" 
            max="400" 
            step="10" 
            value={totalPoolBudgetLakhs}
            onChange={(e) => setTotalPoolBudgetLakhs(Number(e.target.value))}
            class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* Roads Department Simulation Feature Card */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        
        <div class="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <p class="text-xs text-slate-400 font-medium mb-1">Current Budget</p>
          <div class="text-xl font-extrabold text-slate-200">₹{roadDept.currentBudgetLakhs} Lakhs</div>
          <p class="text-[11px] text-slate-400 mt-1">Road Department Baseline</p>
        </div>

        <div class="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/40">
          <p class="text-xs text-emerald-400 font-medium mb-1">AI Recommended</p>
          <div class="text-xl font-extrabold text-emerald-400">₹{roadDept.allocatedBudgetLakhs} Lakhs</div>
          <p class="text-[11px] text-emerald-400/80 mt-1 font-semibold flex items-center gap-1">
            <ArrowUpRight class="w-3 h-3" /> +₹{roadDept.diffLakhs} Lakhs (+{Math.round((roadDept.diffLakhs/(roadDept.currentBudgetLakhs||1))*100)}%)
          </p>
        </div>

        <div class="bg-slate-950/80 p-4 rounded-xl border border-blue-500/40">
          <p class="text-xs text-blue-400 font-medium mb-1">Expected Impact 1</p>
          <div class="text-xl font-extrabold text-blue-400 flex items-center gap-1">
            <TrendingDown class="w-5 h-5 text-blue-400" /> {roadDept.expectedComplaintReduction}% Fewer
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Recurring pothole complaints</p>
        </div>

        <div class="bg-slate-950/80 p-4 rounded-xl border border-indigo-500/40">
          <p class="text-xs text-indigo-400 font-medium mb-1">Expected Impact 2</p>
          <div class="text-xl font-extrabold text-indigo-400 flex items-center gap-1">
            <Clock class="w-5 h-5 text-indigo-400" /> Resolution ↓ {roadDept.expectedResolutionSpeedup}%
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Faster work-order completion</p>
        </div>

      </div>

      {/* Weighted Math Formula Transparency Banner */}
      <div class="bg-slate-950/90 p-4 rounded-xl border border-slate-800 text-xs">
        <div class="font-bold text-slate-300 mb-2 flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-400" /> AI Priority Weighted Metric Formula:
        </div>
        <div class="font-mono bg-slate-900 p-2.5 rounded-md border border-slate-800 text-emerald-300 text-[11px] overflow-x-auto">
          Priority Score = 0.35 × Volume + 0.30 × Severity + 0.20 × Population Impact + 0.10 × Historical Trend + 0.05 × Repair Cost
        </div>
      </div>

    </div>
  );
}
