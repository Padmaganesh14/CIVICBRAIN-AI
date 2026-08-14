import { useState, useEffect, useCallback } from 'react'
import type { Page, OfficerWorkspaceData } from '../types'
import { apiFetch } from '@/lib/session'

interface Props {
  data?: OfficerWorkspaceData | null;
  navigate: (p: Page) => void;
}

export default function FundingDiscovery({ data, navigate }: Props) {
  const department = data?.officer?.department || "Water Supply Department";
  const [searchFilter, setSearchFilter] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await apiFetch('/api/officer/funding/transactions');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTransactions(json.data);
        }
      }
    } catch (_e) {}
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const allProjects = data?.budgetProjects ?? [];
  const filteredProjects = allProjects.filter((p) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      p.projectName.toLowerCase().includes(q) ||
      (p.schemeName && p.schemeName.toLowerCase().includes(q)) ||
      (p.department && p.department.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q)) ||
      (p.fundingSource && p.fundingSource.toLowerCase().includes(q))
    );
  });

  const totalAllocatedTxns = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const lastTxn = transactions[0] || null;

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Funding Discovery &amp; Scheme Registry</h1>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
            Authoritative project allocations &amp; real-time MongoDB transaction logs for <strong>{department}</strong>.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="px-3 py-1.5 rounded-xl border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
          style={{ borderColor: '#E2E8F0' }}
        >
          🔄 Refresh Fund Balance
        </button>
      </div>

      {/* Live Financial Allocation Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border bg-white shadow-xs" style={{ borderColor: '#E2E8F0' }}>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Projects</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{allProjects.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Budget 2023-24</div>
        </div>

        <div className="p-4 rounded-2xl border bg-white shadow-xs" style={{ borderColor: '#E2E8F0' }}>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Live Utilized Funds</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">₹{(totalAllocatedTxns / 100000).toFixed(2)} L</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{transactions.length} officer allocation(s)</div>
        </div>

        <div className="p-4 rounded-2xl border bg-white shadow-xs" style={{ borderColor: '#E2E8F0' }}>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Allocation</div>
          <div className="text-lg font-bold text-emerald-700 mt-1 truncate">
            {lastTxn ? `₹${(lastTxn.amount / 100000).toFixed(2)}L` : 'No recent txns'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">{lastTxn ? lastTxn.fundName : 'Pillur-III Scheme'}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-white shadow-xs" style={{ borderColor: '#E2E8F0' }}>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MongoDB Fund Status</div>
          <div className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Atomic Mutated</div>
        </div>
      </div>

      {/* Transactions Audit History */}
      {transactions.length > 0 && (
        <div className="rounded-2xl border bg-slate-900 text-white p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live MongoDB Funding Transactions Log ({transactions.length})
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded font-bold">
              Atomic Audit Trail
            </span>
          </div>

          <div className="space-y-2">
            {transactions.slice(0, 3).map((tx: any) => (
              <div key={tx._id || tx.transactionId} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-indigo-400 mr-2">#{tx.transactionId}</span>
                  <span className="font-semibold text-slate-200">{tx.fundName}</span>
                  <div className="text-[11px] text-slate-400">
                    Complaint #{tx.complaintId} • Approved by <strong>{tx.approvedBy}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-emerald-400">₹{tx.amount?.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Prev: ₹{tx.balanceBefore?.toLocaleString()} → New: ₹{tx.balanceAfter?.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="rounded-2xl border p-5 bg-white space-y-4" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border bg-slate-50" style={{ borderColor: '#E2E8F0' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#64748B" strokeWidth="1.5">
              <circle cx="7" cy="7" r="4" /><path d="M12 12L10 10" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by project name, scheme, funding source, or location (e.g. Pillur, TURIP, AMRUT, East Zone)…"
              className="bg-transparent text-sm outline-none w-full text-slate-800"
            />
          </div>
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t" style={{ borderColor: '#F1F5F9' }}>
          <span>Showing {filteredProjects.length} of {allProjects.length} authoritative budget records</span>
          <span className="font-mono text-indigo-600 font-semibold">MongoDB Collection: budgetProjects</span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: '#0F172A' }}>Extracted Budget Schemes ({filteredProjects.length})</h2>
          <button onClick={() => navigate('funding-eligibility')} className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer">
            Check Scheme Verification →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((p) => {
            const costLabel = p.estimatedCost
              ? `₹${p.estimatedCost} ${p.estimatedCostUnit || 'Crore'}`
              : p.allocatedAmount
              ? `₹${p.allocatedAmount} ${p.allocatedAmountUnit || 'Crore'} (Annual Allocation)`
              : p.metricValue
              ? `${p.metricValue.toLocaleString()} ${p.metricUnit || ''}`
              : 'Estimate pending';

            return (
              <div key={p._id || p.projectName} className="rounded-2xl border p-5 bg-white space-y-3" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {p.section || p.department || 'Corporation Project'}
                    </span>
                    <h3 className="text-base font-bold mt-1 text-slate-900">{p.projectName}</h3>
                    {p.schemeName && <div className="text-xs text-indigo-600 font-medium">{p.schemeName}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-slate-900">{costLabel}</div>
                    <div className="text-[10px] text-slate-400 font-mono">FY {p.financialYear}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>

                {p.fundingSource && (
                  <div className="text-xs text-slate-700 font-medium bg-slate-50 p-2 rounded-xl">
                    🏛️ Funding Source: <span className="text-slate-900 font-semibold">{p.fundingSource}</span>
                  </div>
                )}

                {p.remainingAmount != null && (
                  <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    💰 Remaining Balance: ₹{(p.remainingAmount / 10000000).toFixed(2)} Cr (Utilized: ₹{((p.utilizedAmount || 0) / 100000).toFixed(2)}L)
                  </div>
                )}

                {p.location && (
                  <div className="text-xs text-slate-500">
                    📍 Location / Scope: <strong className="text-slate-700">{p.location}</strong>
                  </div>
                )}

                {/* Exact PDF Source Evidence Badge */}
                <div className="pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: '#F1F5F9' }}>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    <span>📄</span> Source: {p.sourceTitle || 'Coimbatore Corp Budget 2023-24'} (Doc p. {p.documentPage || p.pdfPage}, PDF p. {p.pdfPage})
                  </span>
                  <button onClick={() => navigate('funding-eligibility')} className="font-semibold text-indigo-600 hover:underline cursor-pointer">
                    Verify →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
