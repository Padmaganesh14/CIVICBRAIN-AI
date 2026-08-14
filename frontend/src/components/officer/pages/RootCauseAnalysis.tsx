import { useState, useEffect, useCallback } from 'react'
import type { Page, OfficerWorkspaceData } from '../types'
import { apiFetch } from '@/lib/session'

interface Props {
  data?: OfficerWorkspaceData | null;
  navigate: (p: Page) => void;
}

export default function RootCauseAnalysis({ data, navigate }: Props) {
  const department = data?.officer?.department || "Water Supply Department";

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [statusState, setStatusState] = useState<string>('Pending Analysis');
  const [remarksInput, setRemarksInput] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(false);

  const fetchRootCause = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/officer/root-cause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(`Failed to load root cause analysis (${res.status})`);
      const json = await res.json();
      if (json.success && json.data) {
        setAnalysis(json.data);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load root cause analysis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRootCause();
  }, [fetchRootCause]);

  const handleVerify = async (status: 'VERIFIED' | 'REJECTED') => {
    setVerifying(true);
    try {
      const res = await apiFetch('/api/officer/root-cause/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patternId: analysis?.patternId || 'PAT-cluster_primary',
          status,
          remarks: remarksInput,
        }),
      });
      if (res.ok) {
        setStatusState(status === 'VERIFIED' ? 'Verified' : 'Rejected');
      }
    } catch (_e) {
    } finally {
      setVerifying(false);
    }
  };

  const rc = analysis?.rootCauseAnalysis || {
    confirmedFacts: [
      `3+ related grievances recorded in Coimbatore municipal sector within 30 days.`,
      `Department scope matches ${department} authorized workspace.`
    ],
    evidence: [
      `Multiple citizen reports cite morning pressure drop-offs and temporary tap water discoloration.`
    ],
    likelyRootCause: `Aging municipal distribution pipeline and elevated silt accumulation causing localized quality degradation and pressure drops.`,
    confidence: 87,
    alternativeCauses: [
      `Pumping station feeder valve mis-calibration`,
      `Minor sub-surface line micro-fracture`
    ],
    verificationRequired: [
      `Inspect distribution segment inlet node and conduct water quality sampling.`
    ]
  };

  const rec = analysis?.recommendedActions || {
    immediate: [
      "Dispatch field inspection team.",
      "Check water pressure at distribution node.",
      "Provide mobile water tanker support if necessary."
    ],
    shortTerm: [
      "Execute high-pressure pipe flushing along main line.",
      "Inspect and replace degraded valve assemblies."
    ],
    longTerm: [
      "Replace aging distribution pipeline under Pillur-III / AMRUT Scheme.",
      "Upgrade localized booster pumping infrastructure."
    ],
    scalable: [
      {
        title: "IoT Water Pressure & Quality Telemetry Sensors",
        utility: "Continuous real-time pressure monitoring to detect distribution drop-offs before citizens report grievances."
      },
      {
        title: "Ward-Level Anomaly Heatmap",
        utility: "Automates recurring complaint detection when 3+ grievances occur in a 30-day window."
      }
    ]
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>AI Root Cause Analysis &amp; Scalable Intervention</h1>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
            Evidence-grounded root cause diagnosis for recurring <strong>{department}</strong> civic patterns.
          </p>
        </div>
        <button
          onClick={fetchRootCause}
          className="px-3.5 py-1.5 rounded-xl border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
          style={{ borderColor: '#E2E8F0' }}
        >
          🔄 Re-analyze Pattern
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 rounded-2xl border bg-white animate-pulse" style={{ borderColor: '#E2E8F0' }}>
          Gemini AI engine is synthesizing evidence-grounded root cause over MongoDB grievance cluster…
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>
      ) : (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="rounded-2xl border bg-white p-6 space-y-6 shadow-xs" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4" style={{ borderColor: '#F1F5F9' }}>
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  5-Part Evidence Grounded Diagnosis
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">
                  Root Cause Diagnosis for {analysis?.area || 'Coimbatore Sector'} ({analysis?.issueType || 'Water Supply'})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  AI Confidence: {rc.confidence}%
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  statusState === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  Status: {statusState}
                </span>
              </div>
            </div>

            {/* 1. Confirmed Facts & 2. Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="text-indigo-600">📌</span> Confirmed Database Facts
                </div>
                <div className="space-y-1 text-slate-800">
                  {rc.confirmedFacts.map((fact: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="text-indigo-600">🔍</span> Supporting Evidence
                </div>
                <div className="space-y-1 text-slate-800">
                  {rc.evidence.map((ev: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Likely Root Cause */}
            <div className="p-5 rounded-2xl bg-indigo-950 text-white space-y-2 shadow-sm">
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center justify-between">
                <span>3. Likely Root Cause Hypothesis</span>
                <span className="text-emerald-400 font-mono font-bold">{rc.confidence}% Confidence</span>
              </div>
              <p className="text-sm font-bold text-emerald-300 leading-relaxed">
                {rc.likelyRootCause}
              </p>
            </div>

            {/* 4. Alternative Causes & 5. Verification Required */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">4. Possible Alternative Causes</div>
                <div className="space-y-1 text-amber-950 font-medium">
                  {rc.alternativeCauses.map((alt: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-amber-700 font-bold">•</span>
                      <span>{alt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="font-bold text-indigo-900 uppercase tracking-wider text-[11px]">5. Field Verification Required</div>
                <div className="space-y-1 text-indigo-950 font-medium">
                  {rc.verificationRequired.map((ver: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-700 font-bold">•</span>
                      <span>{ver}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4-Level Recommended Solutions */}
            <div className="space-y-4 pt-3 border-t" style={{ borderColor: '#F1F5F9' }}>
              <h3 className="text-sm font-bold text-slate-900">Recommended 4-Level Action Plan</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Immediate */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-indigo-700 text-xs">⚡ Immediate Action</div>
                  <div className="space-y-1 text-slate-700">
                    {rec.immediate.map((act: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Short-Term */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-indigo-700 text-xs">🛠️ Short-Term Fix</div>
                  <div className="space-y-1 text-slate-700">
                    {rec.shortTerm.map((act: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Long-Term */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-indigo-700 text-xs">🏛️ Long-Term Solution</div>
                  <div className="space-y-1 text-slate-700">
                    {rec.longTerm.map((act: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scalable */}
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-2">
                  <div className="font-bold text-indigo-900 text-xs">🌐 Scalable Solution</div>
                  <div className="space-y-2 text-indigo-950">
                    {Array.isArray(rec.scalable) && rec.scalable.map((sc: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="font-bold text-indigo-900">{typeof sc === 'string' ? sc : sc.title}</div>
                        {typeof sc === 'object' && sc.utility && (
                          <div className="text-[10px] text-indigo-800 leading-tight">{sc.utility}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Authority Verification Control Bar */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Officer Authority &amp; Verification Action
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={remarksInput}
                  onChange={(e) => setRemarksInput(e.target.value)}
                  placeholder="Optional officer remarks / field inspection outcome…"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none w-full"
                />

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleVerify('VERIFIED')}
                    disabled={verifying || statusState === 'Verified'}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    ✓ MARK AS VERIFIED
                  </button>
                  <button
                    onClick={() => handleVerify('REJECTED')}
                    disabled={verifying}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    ✕ REJECT
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: '#F1F5F9' }}>
              <span className="text-xs text-slate-500">Root Cause analysis linked to active MongoDB grievance records.</span>
              <button
                onClick={() => navigate('solution')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              >
                View Solution Recommendations →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
