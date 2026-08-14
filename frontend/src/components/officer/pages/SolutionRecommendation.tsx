import { useState, useEffect, useCallback } from 'react'
import type { Page, OfficerWorkspaceData } from '../types'
import { apiFetch } from '@/lib/session'

interface Props {
  data?: OfficerWorkspaceData | null;
  navigate: (p: Page) => void;
}

export default function SolutionRecommendation({ data, navigate }: Props) {
  const department = data?.officer?.department || "Water Supply Department";

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [solutions, setSolutions] = useState<any[]>([]);

  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/officer/solution-recommendations');
      if (!res.ok) throw new Error(`Failed to load solution recommendations (${res.status})`);
      const json = await res.json();
      if (json.success && json.data?.solutions) {
        setSolutions(json.data.solutions);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load solution recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  const defaultSolutions = [
    {
      title: `High-Density Polyethylene Drainage & Conduit Pipeline System`,
      cost: '₹8.01 Cr (Annual Allocation)',
      duration: '14 Days',
      impact: 'High',
      desc: `Replace corroded arterial concrete section with non-corrosive HDPE conduit pipes to eliminate recurring contamination and blockages in ${department} sectors.`,
      schemes: ['Pillur-III Water Scheme', 'AMRUT 24x7 Water Supply'],
    },
    {
      title: 'Automated Micro-Tunneling Desilting & Sump Pump Installation',
      cost: '₹4.2 Lakhs',
      duration: '5 Days',
      impact: 'Medium',
      desc: 'Immediate short-term clearing and automated float-switch sump pump setup to manage active monsoon waterlogging and pressure drops.',
      schemes: ['State Urban Infrastructure Development Fund'],
    },
  ];

  const displayList = solutions.length > 0 ? solutions : defaultSolutions;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-screen-xl min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Solution Recommendations</h1>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
            Scalable engineering &amp; administrative solutions matched to <strong>{department}</strong> budget schemes.
          </p>
        </div>
        <button
          onClick={fetchSolutions}
          className="px-3.5 py-1.5 rounded-xl border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
          style={{ borderColor: '#E2E8F0' }}
        >
          🔄 Refresh Recommendations
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 rounded-2xl border bg-white animate-pulse" style={{ borderColor: '#E2E8F0' }}>
          Retrieving scalable solution interventions and budget scheme matches…
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>
      ) : (
        <div className="space-y-4">
          {displayList.map((s, idx) => (
            <div key={s.id || idx} className="rounded-2xl border bg-white p-6 space-y-4 shadow-xs" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">Option {idx + 1}</span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{s.title}</h2>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-base font-extrabold text-indigo-600">{s.cost}</div>
                  <div className="text-xs text-slate-500">Est. Duration: {s.duration}</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t text-xs gap-3" style={{ borderColor: '#F1F5F9' }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-500 font-medium">Matched Coimbatore Budget Schemes:</span>
                  {s.schemes?.map((sc: string, i: number) => (
                    <span key={i} className="font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                      💰 {sc}
                    </span>
                  ))}
                  {s.pdfPage ? <span className="text-[11px] text-slate-400">(PDF Page {s.pdfPage})</span> : null}
                </div>
                <button
                  onClick={() => navigate('budget')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer hover:opacity-90 transition-all self-stretch sm:self-auto text-center"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  Approve Solution &amp; View Budget →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
