import React from 'react';
import { useAppData } from '../context/AppDataContext';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';
import WardRankingsWidget from '../components/WardRankingsWidget';
import DepartmentScorecard from '../components/DepartmentScorecard';
import TimelineMap from '../components/TimelineMap';
import { 
  Building2, AlertTriangle, CheckCircle2, DollarSign, TrendingUp, 
  MapPin, ShieldAlert, Sparkles, PieChart as PieChartIcon, BarChart2 
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export default function OfficialDashboard() {
  const { complaints, budgetAllocations, triggerEmergency, setActivePage } = useAppData();

  const totalComplaints = 1524;
  const highPriority = 238;
  const resolvedCount = 981;
  const totalBudgetLakhs = budgetAllocations.reduce((sum, d) => sum + d.allocatedBudgetLakhs, 0);

  // Pie Chart Data for Complaints by Dept
  const pieData = {
    labels: ['Roads', 'Water', 'Drainage', 'Garbage', 'Electricity'],
    datasets: [
      {
        data: [534, 320, 280, 210, 180],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'],
        borderColor: '#0F172A',
        borderWidth: 2
      }
    ]
  };

  // Line Graph Data for Trends over Time
  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
    datasets: [
      {
        label: 'Daily Grievances',
        data: [120, 150, 180, 210, 240, 290, 340],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Emergency Alert Banner */}
      <EmergencyAlertBanner />

      {/* Official Header & Demo Emergency Trigger Button */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/40">
              OFFICIAL GOVERNANCE PORTAL
            </span>
            <h2 class="text-xl font-extrabold text-white">Executive Decision Intelligence Dashboard</h2>
          </div>
          <p class="text-xs text-slate-400 mt-1">Real-time municipal grievance analytics & automated resource planning</p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            onClick={triggerEmergency}
            class="px-3.5 py-2 bg-red-600/30 text-red-300 hover:bg-red-600 hover:text-white border border-red-500/50 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <ShieldAlert class="w-4 h-4" /> Simulate 🚨 Emergency Alert
          </button>
        </div>
      </div>

      {/* 4 Top Executive KPI Cards */}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div class="gov-card p-5 border-l-4 border-l-blue-500 bg-slate-900/90">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Complaints</span>
            <Building2 class="w-4 h-4 text-blue-400" />
          </div>
          <div class="text-2xl font-extrabold text-white mt-2">{totalComplaints}</div>
          <p class="text-[11px] text-blue-400 mt-1 font-semibold">▲ 12% from last week</p>
        </div>

        <div class="gov-card p-5 border-l-4 border-l-red-500 bg-slate-900/90">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">High / Critical</span>
            <AlertTriangle class="w-4 h-4 text-red-400" />
          </div>
          <div class="text-2xl font-extrabold text-red-400 mt-2">{highPriority}</div>
          <p class="text-[11px] text-red-400/80 mt-1 font-semibold">Requires Immediate Action</p>
        </div>

        <div class="gov-card p-5 border-l-4 border-l-emerald-500 bg-slate-900/90">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 class="w-4 h-4 text-emerald-400" />
          </div>
          <div class="text-2xl font-extrabold text-emerald-400 mt-2">{resolvedCount}</div>
          <p class="text-[11px] text-emerald-400/80 mt-1 font-semibold">92.4% Resolution Rate</p>
        </div>

        <div class="gov-card p-5 border-l-4 border-l-amber-500 bg-slate-900/90">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget Recommended</span>
            <DollarSign class="w-4 h-4 text-amber-400" />
          </div>
          <div class="text-2xl font-extrabold text-amber-400 mt-2">₹{(totalBudgetLakhs / 100).toFixed(2)} Cr</div>
          <p class="text-[11px] text-amber-400/80 mt-1 font-semibold">Weighted AI Allocation</p>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart: Complaints by Dept */}
        <div class="gov-card p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 class="font-bold text-sm text-white flex items-center gap-2">
              <PieChartIcon class="w-4 h-4 text-blue-400" /> Complaints by Department
            </h4>
            <span class="text-[11px] text-slate-400">Roads leads at 35%</span>
          </div>
          <div class="h-64 flex items-center justify-center p-2">
            <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } } }} />
          </div>
        </div>

        {/* Line Graph: Trends Over Time */}
        <div class="gov-card p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 class="font-bold text-sm text-white flex items-center gap-2">
              <BarChart2 class="w-4 h-4 text-emerald-400" /> Complaint Volume Trends Over Time
            </h4>
            <span class="text-[11px] text-emerald-400 font-bold">▲ 14% Next Week Forecast</span>
          </div>
          <div class="h-64 flex items-center justify-center p-2">
            <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } } }} />
          </div>
        </div>

      </div>

      {/* Interactive Timeline Incident Heatmap */}
      <TimelineMap />

      {/* Ward Rankings & Department Scorecard Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WardRankingsWidget />
        <DepartmentScorecard />
      </div>

    </div>
  );
}
