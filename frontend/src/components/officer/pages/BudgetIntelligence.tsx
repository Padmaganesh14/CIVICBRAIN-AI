import type { Page, OfficerWorkspaceData } from '../types'

interface Props {
  data?: OfficerWorkspaceData | null;
  navigate: (p: Page) => void;
}

export default function BudgetIntelligence({ data, navigate }: Props) {
  const department = data?.officer?.department || "Road Department";
  const metrics = data?.metrics;
  const budgetSummary = data?.budgetSummary;
  const fundSummaries = data?.fundSummaries ?? [];

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Budget Intelligence & Corporation Financials</h1>
        <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
          Authoritative budget position for <strong>Coimbatore Corporation (FY 2023-2024)</strong> & operational metrics for <strong>{department}</strong>.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-5 space-y-2" style={{ borderColor: '#E2E8F0' }}>
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Budgeted Receipts (FY 2023-24)</div>
          <div className="text-2xl font-extrabold text-indigo-600">{budgetSummary?.totalReceipts ?? '₹3,018.90 Cr'}</div>
          <div className="text-xs text-slate-400">Source: {budgetSummary?.sourceDocument || 'Cbe_Corp_Budget_23-24_English.pdf'} (Doc Page {budgetSummary?.documentPage || 3})</div>
        </div>

        <div className="rounded-2xl border bg-white p-5 space-y-2" style={{ borderColor: '#E2E8F0' }}>
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Budgeted Expenditure</div>
          <div className="text-2xl font-extrabold text-rose-600">{budgetSummary?.totalExpenditure ?? '₹3,029.07 Cr'}</div>
          <div className="text-xs text-rose-600 font-medium">{budgetSummary?.surplusDeficit ?? '₹10.17 Cr Deficit'}</div>
        </div>

        <div className="rounded-2xl border bg-white p-5 space-y-2" style={{ borderColor: '#E2E8F0' }}>
          <div className="text-xs text-slate-500 font-semibold uppercase">Available Operational Workspace Funds</div>
          <div className="text-2xl font-extrabold text-emerald-600">{metrics?.availableFunds ?? '₹40L'}</div>
          <div className="text-xs text-emerald-600 font-medium">Active Department Grievance Workspace</div>
        </div>
      </div>

      {/* Real Consolidated Fund Table */}
      <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Coimbatore Corporation Consolidated Fund Position (FY 2023-24)</h2>
          <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            Document Page {budgetSummary?.documentPage || 3} Reference
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-600" style={{ borderColor: '#E2E8F0' }}>
                <th className="p-3 font-semibold">Fund Name</th>
                <th className="p-3 font-semibold text-right">Revenue Receipts</th>
                <th className="p-3 font-semibold text-right">Capital Receipts</th>
                <th className="p-3 font-semibold text-right">Total Receipts</th>
                <th className="p-3 font-semibold text-right">Revenue Exp.</th>
                <th className="p-3 font-semibold text-right">Capital Exp.</th>
                <th className="p-3 font-semibold text-right">Total Expenditure</th>
                <th className="p-3 font-semibold text-right">Surplus / (Deficit)</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#F1F5F9' }}>
              {fundSummaries.map((f) => (
                <tr key={f.fundName} className={f.fundName.includes('Overall') ? 'font-bold bg-indigo-50/50' : 'hover:bg-slate-50'}>
                  <td className="p-3 text-slate-900">{f.fundName}</td>
                  <td className="p-3 text-right text-slate-700 font-mono">₹{f.revenueReceipts.toFixed(2)} Cr</td>
                  <td className="p-3 text-right text-slate-700 font-mono">₹{f.capitalReceipts.toFixed(2)} Cr</td>
                  <td className="p-3 text-right text-indigo-600 font-mono font-bold">₹{f.totalReceipts.toFixed(2)} Cr</td>
                  <td className="p-3 text-right text-slate-700 font-mono">₹{f.revenueExpenditure.toFixed(2)} Cr</td>
                  <td className="p-3 text-right text-slate-700 font-mono">₹{f.capitalExpenditure.toFixed(2)} Cr</td>
                  <td className="p-3 text-right text-rose-600 font-mono font-bold">₹{f.totalExpenditure.toFixed(2)} Cr</td>
                  <td className={`p-3 text-right font-mono font-bold ${f.surplusDeficit < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {f.surplusDeficit < 0 ? `(₹${Math.abs(f.surplusDeficit).toFixed(2)} Cr)` : `+₹${f.surplusDeficit.toFixed(2)} Cr`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: '#F1F5F9' }}>
          <span className="text-xs text-slate-500">
            Source: {budgetSummary?.sourceDocument || 'Cbe_Corp_Budget_23-24_English.pdf'} — Section I (Document Page 3)
          </span>
          <button onClick={() => navigate('reports')} className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer">
            Generate Financial Report →
          </button>
        </div>
      </div>
    </div>
  )
}
