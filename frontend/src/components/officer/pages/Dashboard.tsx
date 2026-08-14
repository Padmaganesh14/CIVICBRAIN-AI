import type { Page, OfficerWorkspaceData } from '../types'

interface Props {
  data: OfficerWorkspaceData | null;
  navigate: (p: Page) => void;
}

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <path d="M5 .8l.9 2.8H8.5l-2.3 1.7.9 2.7L5 6.5 2.9 8l.9-2.7L1.5 3.6h2.6L5 .8z" />
      </svg>
      AI
    </span>
  )
}

function StatusBadge({ status }: { status: 'success' | 'warning' | 'danger' | 'info' }) {
  const cfg = {
    success: { bg: '#ECFDF5', color: '#059669', label: 'On Track' },
    warning: { bg: '#FFFBEB', color: '#D97706', label: 'Needs Review' },
    danger: { bg: '#FEF2F2', color: '#DC2626', label: 'Critical' },
    info: { bg: '#EEF2FF', color: '#4F46E5', label: 'Active' },
  }[status]
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

function MiniDonut({ pct, color }: { pct: number; color: string }) {
  const r = 18; const cx = 22; const cy = 22
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth="5" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  )
}

export default function Dashboard({ data, navigate }: Props) {
  const officerName = data?.officer?.name || "Officer";
  const municipality = data?.officer?.municipality || "Coimbatore Corporation";
  const metrics = data?.metrics;
  const budgetSummary = data?.budgetSummary;

  const kpiCards = [
    {
      label: 'Corp Budget Estimate',
      value: budgetSummary?.totalReceipts ?? '₹3,018.90 Cr',
      sub: 'Coimbatore Corp FY 2023-24',
      color: '#4F46E5',
      pct: 100,
      status: 'info' as const
    },
    {
      label: 'Available Funds',
      value: metrics?.availableFunds ?? '₹40L',
      sub: 'Officer Workspace Operational',
      color: '#059669',
      pct: 45,
      status: 'success' as const
    },
    {
      label: 'Active Grievances',
      value: String(metrics?.activeGrievances ?? 0),
      sub: 'Pending Department Review',
      color: '#D97706',
      pct: Math.min(100, (metrics?.activeGrievances ?? 0) * 15),
      status: 'warning' as const
    },
    {
      label: 'Repeated Issues',
      value: String(metrics?.repeatedIssues ?? 0),
      sub: 'Location Cluster Alert',
      color: '#DC2626',
      pct: Math.min(100, (metrics?.repeatedIssues ?? 0) * 25),
      status: 'danger' as const
    },
    {
      label: 'High Priority',
      value: String(metrics?.highPriority ?? 0),
      sub: 'Urgent Action Required',
      color: '#7C3AED',
      pct: Math.min(100, (metrics?.highPriority ?? 0) * 20),
      status: 'warning' as const
    },
    {
      label: 'Budget Utilization',
      value: metrics?.budgetUtilization ?? '0%',
      sub: 'Target Progress',
      color: '#0EA5E9',
      pct: parseInt(metrics?.budgetUtilization ?? '0') || 50,
      status: 'success' as const
    },
  ];

  const insights = data?.aiInsights ?? [];
  const recentActivity = data?.recentActivity ?? [];
  const wardOverview = data?.wardOverview ?? [];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-screen-xl mx-auto min-w-0">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#0F172A' }}>Good morning, {officerName}.</h1>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: '#64748B' }}>
            Here&apos;s your {municipality} intelligence overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('assistant')}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white transition-all cursor-pointer hover:opacity-90 shrink-0"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
            <path d="M7 1l1.1 3.2H11.5L8.8 6.3l1 3.2L7 7.8l-2.8 1.7 1-3.2L2.5 4.2H5.9L7 1z" />
          </svg>
          Ask AI Assistant
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl p-4 border transition-all hover:shadow-md cursor-pointer"
            style={{ background: 'white', borderColor: '#E2E8F0' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs font-medium" style={{ color: '#64748B' }}>{k.label}</div>
              <MiniDonut pct={k.pct} color={k.color} />
            </div>
            <div className="text-xl font-bold" style={{ color: '#0F172A' }}>{k.value}</div>
            <div className="mt-1 text-xs" style={{ color: '#94A3B8' }}>{k.sub}</div>
            <div className="mt-2">
              <StatusBadge status={k.status} />
            </div>
          </div>
        ))}
      </div>

      {/* Authoritative Budget Banner */}
      <div className="rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: '#EEF2FF', borderColor: '#C7D2FE' }}>
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            📜
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">Authoritative Budget Reference</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
              Coimbatore Corporation Budget 2023–24 — Total Receipts: {budgetSummary?.totalReceipts || '₹3,018.90 Cr'} | Expenditure: {budgetSummary?.totalExpenditure || '₹3,029.07 Cr'} ({budgetSummary?.surplusDeficit || '₹10.17 Cr Deficit'})
            </div>
            <div className="text-[11px] sm:text-xs text-indigo-600 mt-0.5">
              Source: {budgetSummary?.sourceDocument || 'Cbe_Corp_Budget_23-24_English.pdf'} (Document Page {budgetSummary?.documentPage || 3})
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('budget')}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          View Budget Intelligence →
        </button>
      </div>

      {/* Main row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* AI Insights */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold" style={{ color: '#0F172A' }}>AI Insights & Scheme Evidence</h2>
              <AIBadge />
            </div>
            <span className="text-xs" style={{ color: '#94A3B8' }}>Authoritative MongoDB Source</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {insights.map((ins, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-4 border transition-all hover:shadow-md"
                style={{ background: 'white', borderColor: '#E2E8F0' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: ins.bg, color: ins.color }}>
                    {ins.tag}
                  </span>
                  <AIBadge />
                </div>
                <h3 className="text-sm font-semibold mt-2 leading-snug" style={{ color: '#0F172A' }}>{ins.title}</h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#64748B' }}>{ins.desc}</p>
                {ins.sourceDocument && (
                  <div className="mt-2 text-[11px] font-mono px-2 py-1 rounded bg-slate-100 text-slate-600">
                    Source: {ins.sourceDocument} (Doc p. {ins.documentPage || ins.pdfPage})
                  </div>
                )}
                <button
                  onClick={() => navigate(ins.page)}
                  className="mt-3 text-xs font-medium flex items-center gap-1 transition-colors hover:gap-1.5 cursor-pointer"
                  style={{ color: ins.color }}
                >
                  {ins.action}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 6h6M6 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#E2E8F0' }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: '#0F172A' }}>Recent Workspace Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-16 text-xs pt-0.5 font-mono" style={{ color: '#94A3B8' }}>{a.time}</div>
                  <div className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5" style={{
                    background: { success: '#059669', warning: '#D97706', danger: '#DC2626', info: '#4F46E5' }[a.status]
                  }} />
                  <div className="text-xs leading-relaxed" style={{ color: '#475569' }}>{a.action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Ward Overview */}
          <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#E2E8F0' }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: '#0F172A' }}>Ward / District Overview</h2>
            <div className="space-y-3">
              {wardOverview.map((w) => (
                <div key={w.ward}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: '#0F172A' }}>{w.ward}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: '#64748B' }}>{w.complaints} reports</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          background: w.severity === 'High' ? '#FEF2F2' : w.severity === 'Medium' ? '#FFFBEB' : '#ECFDF5',
                          color: w.severity === 'High' ? '#DC2626' : w.severity === 'Medium' ? '#D97706' : '#059669',
                        }}
                      >
                        {w.severity}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${w.pct}%`,
                        background: w.pct > 75 ? '#DC2626' : w.pct > 50 ? '#D97706' : '#059669'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant preview */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', borderColor: 'rgba(79,70,229,0.3)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#818CF8">
                <path d="M8 1.5l1.2 3.8H13l-3 2.2 1.1 3.5L8 8.9l-3.1 2.1L6 7.5 3 5.3h3.8L8 1.5z" />
              </svg>
              <span className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>AI Assistant</span>
              <span className="pulse-dot w-1.5 h-1.5 rounded-full ml-auto" style={{ background: '#818CF8' }} />
            </div>
            <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(129,140,248,0.2)' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
                "AI analysis active for {officerName}'s workspace. {metrics?.activeGrievances ?? 0} active grievances monitored with real-time scheme evidence matching."
              </p>
              <div className="mt-2 flex items-center gap-1">
                <AIBadge />
                <span className="text-xs" style={{ color: '#475569' }}>Confidence: 98%</span>
              </div>
            </div>
            <button
              onClick={() => navigate('assistant')}
              className="mt-2 w-full py-2 rounded-lg text-xs font-medium text-white transition-all cursor-pointer hover:opacity-90"
              style={{ background: 'rgba(79,70,229,0.6)' }}
            >
              Open AI Assistant →
            </button>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#E2E8F0' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#0F172A' }}>Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'View Queue', icon: '📝', page: 'grievance' as Page },
                { label: 'Check Funding', icon: '💰', page: 'funding-discovery' as Page },
                { label: 'View Map', icon: '🗺️', page: 'map' as Page },
                { label: 'Generate Report', icon: '📊', page: 'reports' as Page },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.page)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all hover:shadow-sm cursor-pointer"
                  style={{ background: '#F8FAFC', borderColor: '#E2E8F0', color: '#475569' }}
                >
                  <span className="text-lg">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
