import React, { useEffect, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { classifyComplaintAI } from '../services/geminiService';
import { Bot, CheckCircle2, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

const stepsList = [
  "Detecting Department",
  "Detecting Duplicate",
  "Predicting Priority Score",
  "Budget Estimation",
  "Resource Recommendation"
];

export default function AIProcessingModal({ formData, onComplete }) {
  const { addComplaint, setActiveTicket, setActivePage, demoStep, setDemoStep } = useAppData();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < stepsList.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        // Process AI classification
        runAIProcess();
      }
    }, 700);

    return () => clearInterval(interval);
  }, []);

  const runAIProcess = async () => {
    const aiResult = await classifyComplaintAI(
      formData.title,
      formData.description,
      formData.locationStr,
      formData.ward
    );

    const created = addComplaint({
      title: formData.title,
      description: formData.description,
      department: formData.department || aiResult.department,
      departmentConfidence: aiResult.departmentConfidence,
      priority: aiResult.priority,
      priorityConfidence: aiResult.priorityConfidence,
      assignedWard: formData.ward || '18',
      location: formData.locationStr,
      estimatedBudget: aiResult.estimatedBudget,
      estimatedBudgetValue: aiResult.estimatedBudgetValue,
      estimatedResolution: aiResult.estimatedResolution,
      duplicateScore: aiResult.duplicateConfidence,
      possibleDuplicate: "CB-2026-00098: Road Damage Anna Salai",
      explanationReasons: aiResult.explanationReasons
    });

    setActiveTicket(created);
    if (demoStep === 1) setDemoStep(2);
    if (onComplete) onComplete();
    setActivePage('complaint-result');
  };

  return (
    <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="gov-card max-w-md w-full p-6 text-center space-y-6 border-blue-500/50 shadow-2xl">
        
        {/* Animated Bot Header */}
        <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-400 p-0.5 shadow-xl animate-pulse">
          <div class="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-blue-400">
            <Bot class="w-8 h-8 animate-bounce" />
          </div>
        </div>

        <div>
          <h3 class="text-lg font-bold text-white flex items-center justify-center gap-2">
            Analyzing Complaint... <Sparkles class="w-4 h-4 text-amber-400" />
          </h3>
          <p class="text-xs text-slate-400 mt-1">CivicBrain Decision Engine evaluating parameters</p>
        </div>

        {/* 5-Step Animated Checklist */}
        <div class="space-y-3 text-left bg-slate-950 p-4 rounded-xl border border-slate-800">
          {stepsList.map((stepName, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={idx} class="flex items-center gap-3 text-xs font-semibold">
                {isDone ? (
                  <CheckCircle2 class="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 class="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
                ) : (
                  <span class="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0"></span>
                )}
                <span class={isDone ? 'text-emerald-300 font-bold' : isCurrent ? 'text-blue-300 font-bold' : 'text-slate-500'}>
                  {stepName}
                </span>
              </div>
            );
          })}
        </div>

        <p class="text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck class="w-3.5 h-3.5 text-blue-400" /> Powered by Gemini 2.5 Municipal AI
        </p>

      </div>
    </div>
  );
}
