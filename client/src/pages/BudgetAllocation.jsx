import React from 'react';
import { useAppData } from '../context/AppDataContext';
import BudgetSimulator from '../components/BudgetSimulator';
import { PieChart, Sliders, DollarSign, ArrowUpRight, TrendingDown, Sparkles } from 'lucide-react';

export default function BudgetAllocation() {
  const { budgetAllocations, totalPoolBudgetLakhs } = useAppData();

  return (
    <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div class="gov-card p-6 border-l-4 border-l-emerald-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
              <PieChart class="w-3.5 h-3.5" /> INNOVATION ENGINE
            </span>
            <h2 class="text-xl font-extrabold text-white">AI Smart Budget Allocation Engine</h2>
          </div>
          <p class="text-xs text-slate-400 mt-1">Weighted metric optimization distributing municipal funds based on grievance severity</p>
        </div>
      </div>

      {/* Smart Budget Simulator Component */}
      <BudgetSimulator />

      {/* Department Allocation Table */}
      <div class="gov-card p-6 space-y-4">
        <h3 class="font-bold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <DollarSign class="w-5 h-5 text-emerald-400" /> Departmental AI Budget Distribution Table
        </h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th class="p-3">Department</th>
                <th class="p-3">Complaints</th>
                <th class="p-3">Severity Score</th>
                <th class="p-3">AI Metric Score</th>
                <th class="p-3">Current Budget</th>
                <th class="p-3">AI Recommended</th>
                <th class="p-3 text-right">Impact Forecast</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              {budgetAllocations.map((item) => (
                <tr key={item.name} class="hover:bg-slate-800/40 transition">
                  <td class="p-3 font-extrabold text-white text-sm">{item.name}</td>
                  <td class="p-3 font-bold text-blue-400">{item.volume}</td>
                  <td class="p-3 font-bold text-amber-400">{item.severityScore} / 100</td>
                  <td class="p-3 font-mono text-emerald-300 font-bold">{item.score}</td>
                  <td class="p-3 text-slate-300 font-semibold">₹{item.currentBudgetLakhs} Lakhs</td>
                  <td class="p-3 font-extrabold text-emerald-400 text-sm">₹{item.allocatedBudgetLakhs} Lakhs</td>
                  <td class="p-3 text-right font-semibold text-blue-300">
                    -{item.expectedComplaintReduction}% Grievances
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
