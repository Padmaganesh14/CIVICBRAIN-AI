import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Layers, CheckCircle2, GitMerge, AlertCircle, ShieldCheck } from 'lucide-react';

export default function DuplicateDetection() {
  const { complaints, mergeDuplicate } = useAppData();
  const [mergedIds, setMergedIds] = useState([]);

  const duplicateItems = [
    {
      id: "CB-2026-00123",
      title: "Road Damage Near School",
      duplicateTitle: "Road Damage Main Road",
      duplicateId: "CB-2026-00098",
      confidence: 94,
      ward: "Ward 18",
      dept: "Roads"
    },
    {
      id: "CB-2026-00120",
      title: "Drainage Overflow 5th Cross",
      duplicateTitle: "Drainage blockage Ward 7",
      duplicateId: "CB-2026-00104",
      confidence: 88,
      ward: "Ward 7",
      dept: "Drainage"
    },
    {
      id: "CB-2026-00122",
      title: "Water Pipeline Leakage Hospital",
      duplicateTitle: "Water leak Ward 7 Main",
      duplicateId: "CB-2026-00085",
      confidence: 78,
      ward: "Ward 7",
      dept: "Water"
    }
  ];

  const handleMerge = (dupId) => {
    mergeDuplicate(dupId);
    setMergedIds(prev => [...prev, dupId]);
  };

  return (
    <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div class="gov-card p-6 border-l-4 border-l-amber-500">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Layers class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">AI Duplicate Complaint Detection & Merge Engine</h2>
            <p class="text-xs text-slate-400">Gemini compares incoming citizen grievances with historical logs to eliminate redundant work orders</p>
          </div>
        </div>
      </div>

      {/* Duplicates Table */}
      <div class="gov-card p-6 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th class="p-3">Primary Complaint</th>
                <th class="p-3">Possible Duplicate Match</th>
                <th class="p-3">Confidence</th>
                <th class="p-3">Ward</th>
                <th class="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              {duplicateItems.map((item) => {
                const isMerged = mergedIds.includes(item.duplicateId);

                return (
                  <tr key={item.id} class="hover:bg-slate-800/40 transition">
                    <td class="p-3 font-semibold text-white">
                      <div>{item.title}</div>
                      <span class="font-mono text-[10px] text-slate-400">{item.id}</span>
                    </td>

                    <td class="p-3 text-slate-300">
                      <div>{item.duplicateTitle}</div>
                      <span class="font-mono text-[10px] text-slate-500">{item.duplicateId}</span>
                    </td>

                    <td class="p-3">
                      <span class="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-extrabold rounded-full border border-amber-500/40 text-[11px]">
                        {item.confidence}% Similarity
                      </span>
                    </td>

                    <td class="p-3 text-slate-300 font-bold">{item.ward}</td>

                    <td class="p-3 text-right">
                      {isMerged ? (
                        <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg border border-emerald-500/40 inline-flex items-center gap-1">
                          <CheckCircle2 class="w-3.5 h-3.5" /> Merged
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleMerge(item.duplicateId)}
                          class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-lg shadow transition flex items-center gap-1 ml-auto text-xs"
                        >
                          <GitMerge class="w-3.5 h-3.5" /> Merge Tickets
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
