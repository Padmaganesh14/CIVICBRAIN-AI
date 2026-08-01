import React from 'react';
import TimelineMap from '../components/TimelineMap';
import WardRankingsWidget from '../components/WardRankingsWidget';
import { MapPin, ShieldAlert, Layers } from 'lucide-react';

export default function HeatMapPage() {
  return (
    <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      <div class="gov-card p-6 border-l-4 border-l-red-500">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
            <MapPin class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">Municipal Ward Incident Heatmap</h2>
            <p class="text-xs text-slate-400">Google Maps style visual spatial density markers categorized by critical severity</p>
          </div>
        </div>
      </div>

      <TimelineMap />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 gov-card p-5 space-y-3">
          <h3 class="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShieldAlert class="w-4 h-4 text-red-400" /> Hotspot Marker Legend
          </h3>

          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="bg-slate-950 p-3 rounded-lg border border-red-500/30">
              <span class="w-3 h-3 rounded-full bg-red-500 inline-block mb-1"></span>
              <p class="text-xs font-bold text-red-400">🔴 Critical (&gt;200 Grievances)</p>
              <p class="text-[10px] text-slate-400">Ward 18 & Ward 7</p>
            </div>

            <div class="bg-slate-950 p-3 rounded-lg border border-amber-500/30">
              <span class="w-3 h-3 rounded-full bg-amber-500 inline-block mb-1"></span>
              <p class="text-xs font-bold text-amber-400">🟠 Medium (100-200 Grievances)</p>
              <p class="text-[10px] text-slate-400">Ward 12 & Ward 4</p>
            </div>

            <div class="bg-slate-950 p-3 rounded-lg border border-emerald-500/30">
              <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block mb-1"></span>
              <p class="text-xs font-bold text-emerald-400">🟢 Low (&lt;100 Grievances)</p>
              <p class="text-[10px] text-slate-400">Ward 9 & Ward 2</p>
            </div>
          </div>
        </div>

        <WardRankingsWidget />
      </div>

    </div>
  );
}
