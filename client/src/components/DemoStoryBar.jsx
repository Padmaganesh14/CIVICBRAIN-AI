import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { PlayCircle, CheckCircle2, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';

const steps = [
  {
    step: 1,
    title: "1. Citizen Voice Complaint",
    desc: "Vignesh reports deep pothole near Model School using voice input",
    targetPage: "raise-complaint",
    role: "citizen"
  },
  {
    step: 2,
    title: "2. AI Processing & Result",
    desc: "Gemini classifies, predicts priority (Critical 94%), detects duplicate",
    targetPage: "complaint-result",
    role: "citizen"
  },
  {
    step: 3,
    title: "3. Official Dashboard Alert",
    desc: "Complaint appears live on official dashboard & Ward 18 map glows red",
    targetPage: "official-dashboard",
    role: "official"
  },
  {
    step: 4,
    title: "4. Explainable AI & Budget",
    desc: "XAI explains reasons & recommends +₹25L budget allocation for Roads",
    targetPage: "budget-allocation",
    role: "official"
  },
  {
    step: 5,
    title: "5. Resource Allocation",
    desc: "System recommends +3 Engineers for Road Maintenance in Ward 18",
    targetPage: "resource-allocation",
    role: "official"
  },
  {
    step: 6,
    title: "6. Executive PDF Governance Report",
    desc: "Generate & export signed municipal governance PDF report for Commissioner",
    targetPage: "reports",
    role: "official"
  }
];

export default function DemoStoryBar() {
  const { demoStep, setDemoStep, setActivePage, setUserRole, resetDemo } = useAppData();

  const handleGoToStep = (index) => {
    setDemoStep(index + 1);
    const item = steps[index];
    setUserRole(item.role);
    setActivePage(item.targetPage);
  };

  return (
    <div class="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-800/40 py-2.5 px-4">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        
        {/* Header Title */}
        <div class="flex items-center gap-2 text-xs">
          <span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-extrabold rounded-md border border-amber-500/40 flex items-center gap-1">
            <Sparkles class="w-3 h-3 animate-spin" /> DEMO STORY MODE
          </span>
          <span class="text-slate-300 font-semibold hidden lg:inline">Interactive 7-Min Hackathon Demo Controller:</span>
        </div>

        {/* Step Buttons */}
        <div class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1">
          {steps.map((item, idx) => {
            const isActive = demoStep === idx + 1;
            return (
              <button
                key={item.step}
                onClick={() => handleGoToStep(idx)}
                class={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 scale-105' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                <span>{item.step}. {item.title.split(' ')[1]}</span>
                {isActive && <ChevronRight class="w-3 h-3" />}
              </button>
            );
          })}
        </div>

        {/* Reset Button */}
        <button 
          onClick={resetDemo}
          class="p-1 bg-slate-800 text-slate-400 hover:text-white rounded-md border border-slate-700 text-xs flex items-center gap-1"
          title="Reset Demo"
        >
          <RotateCcw class="w-3 h-3" />
        </button>

      </div>
    </div>
  );
}
