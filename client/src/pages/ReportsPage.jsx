import React, { useState } from 'react';
import PDFReportModal from '../components/PDFReportModal';
import { FileText, Download, Calendar, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('daily');

  return (
    <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      <div class="gov-card p-6 border-l-4 border-l-blue-500">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <FileText class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">Executive Municipal Reports & PDF Export</h2>
            <p class="text-xs text-slate-400">Generate certified governance reports with AI recommendations and budget math</p>
          </div>
        </div>
      </div>

      {/* PDF Export Banner Component */}
      <PDFReportModal />

      {/* Report Type Selector */}
      <div class="gov-card p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <Calendar class="w-4 h-4 text-blue-400" /> Select Report Scope
          </h3>
          <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['daily', 'weekly', 'monthly'].map(type => (
              <button 
                key={type}
                onClick={() => setReportType(type)}
                class={`px-3 py-1 text-xs font-bold capitalize rounded-md transition ${reportType === type ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                {type} Report
              </button>
            ))}
          </div>
        </div>

        {/* Report Content Preview Box */}
        <div class="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-sm text-white uppercase tracking-wider">{reportType} Municipal Intelligence Summary</span>
            <span class="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck class="w-4 h-4" /> Ready for Signature
            </span>
          </div>

          <div class="space-y-2 text-xs text-slate-300">
            <p>• <strong>Grievances Handled:</strong> 1,524 total tickets evaluated across 20 municipal wards.</p>
            <p>• <strong>Primary Bottleneck:</strong> Ward 18 (Road Damage) & Ward 7 (Flash Flood Risk).</p>
            <p>• <strong>AI Recommended Budget Shift:</strong> Reallocating +₹25 Lakhs to Roads Department will reduce turnaround times by 22%.</p>
            <p>• <strong>Resource Gap:</strong> Deployment of +3 Engineers recommended for Road Maintenance in Ward 18.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
