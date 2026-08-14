import { useState, useEffect, useCallback } from 'react'
import { apiFetch, buildApiUrl } from '../../../lib/session'
import type { Page, OfficerWorkspaceData } from '../types'

interface Props {
  data?: OfficerWorkspaceData | null;
  navigate: (p: Page) => void;
}

export default function GrievanceIntelligence({ data, navigate }: Props) {
  const officerDept = data?.officer?.department || "Road Department";
  const [complaints, setComplaints] = useState<any[]>(data?.complaints ?? []);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/officer/complaints');
      if (!res.ok) {
        throw new Error(`Failed to load grievances (${res.status})`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setComplaints(json.data);
        if (json.data.length > 0) {
          setSelectedComplaint((prev: any) => {
            if (prev) {
              const updated = json.data.find((c: any) => c._id === prev._id || c.complaintId === prev.complaintId);
              if (updated) return updated;
            }
            return json.data[0];
          });
        } else {
          setSelectedComplaint(null);
        }
      } else {
        setComplaints([]);
        setSelectedComplaint(null);
      }
    } catch (err: any) {
      setError(err.message || "Unable to load grievances");
    } finally {
      setLoading(false);
    }
  }, []);

  // Always fetch fresh from the API on mount — never rely on parent data prop for complaint records
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    SUBMITTED: { bg: '#EEF2FF', color: '#4F46E5', label: 'Submitted' },
    AI_PROCESSING: { bg: '#FFFBEB', color: '#D97706', label: 'AI Processing...' },
    AI_PROCESSED: { bg: '#ECFDF5', color: '#059669', label: 'AI Processed' },
    ASSIGNED: { bg: '#EEF2FF', color: '#4F46E5', label: 'Assigned' },
    UNDER_REVIEW: { bg: '#F5F3FF', color: '#7C3AED', label: 'Under Review' },
    IN_PROGRESS: { bg: '#FEF3C7', color: '#B45309', label: 'In Progress' },
    RESOLVED: { bg: '#ECFDF5', color: '#059669', label: 'Resolved' },
    CLOSED: { bg: '#F1F5F9', color: '#475569', label: 'Closed' },
    AI_PROCESSING_FAILED: { bg: '#FEF2F2', color: '#DC2626', label: 'AI Failed' },
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-screen-xl min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Grievance Intelligence</h1>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
            Live MongoDB citizen complaints & n8n AI analysis for <strong>{officerDept}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchComplaints}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border bg-white hover:bg-slate-50 transition-colors cursor-pointer text-slate-700"
            style={{ borderColor: '#E2E8F0' }}
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh Queue'}
          </button>

          <button
            onClick={() => navigate('prioritization')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            View Priority Queue →
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Complaints List */}
        <div className="rounded-2xl border bg-white p-5 space-y-3" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#F1F5F9' }}>
            <h2 className="text-sm font-bold text-slate-900">Active Department Queue ({complaints.length})</h2>
            <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">MongoDB Live</span>
          </div>

          {loading && (
            <div className="p-8 text-center text-xs text-slate-500 space-y-2">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>Loading grievances...</div>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-2">
              <div className="text-xs font-bold text-rose-800">Unable to load grievances</div>
              <p className="text-[11px] text-rose-600">{error}</p>
              <button
                onClick={fetchComplaints}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && complaints.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <div className="text-lg">📭</div>
              <div className="font-semibold text-slate-600">No grievances available for your workspace.</div>
              <div>Submitted citizen complaints assigned to {officerDept} will appear here.</div>
            </div>
          )}

          {!loading && !error && complaints.map((c) => {
            const isSelected = selectedComplaint?._id === c._id || selectedComplaint?.complaintId === c.complaintId;
            const stCfg = statusColors[c.status] || { bg: '#F1F5F9', color: '#475569', label: c.status };

            return (
              <div
                key={c._id || c.complaintId}
                onClick={() => setSelectedComplaint(c)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                  isSelected ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/30' : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-indigo-700 font-bold">#{c.complaintId}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: stCfg.bg, color: stCfg.color }}>
                    {stCfg.label}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">{c.title}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span className="truncate max-w-[170px]">📍 {c.address || c.landmark || 'Location not specified'}</span>
                  {c.aiSeverity != null && (
                    <span className="font-mono font-bold text-slate-700">Sev: {c.aiSeverity}/100</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Selected Complaint Detail & n8n AI Analysis */}
        <div className="lg:col-span-2 space-y-4">
          {selectedComplaint ? (
            <div className="rounded-2xl border bg-white p-6 space-y-5" style={{ borderColor: '#E2E8F0' }}>
              {/* Complaint Header Banner */}
              <div className="flex items-start justify-between border-b pb-4 gap-4" style={{ borderColor: '#F1F5F9' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-indigo-600 font-bold">#{selectedComplaint.complaintId}</span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: (statusColors[selectedComplaint.status] || { bg: '#F1F5F9' }).bg,
                        color: (statusColors[selectedComplaint.status] || { color: '#475569' }).color,
                      }}
                    >
                      {selectedComplaint.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedComplaint.title}</h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <span>🏢 Department: <strong className="text-slate-700">{selectedComplaint.department || 'Not assigned'}</strong></span>
                    <span>·</span>
                    <span>📍 Address: <strong className="text-slate-700">{selectedComplaint.address || 'Not available'}</strong></span>
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    Severity: {selectedComplaint.aiSeverity != null ? `${selectedComplaint.aiSeverity}/100` : 'Not available'}
                  </div>
                  {selectedComplaint.aiPriority && (
                    <div className="text-[11px] font-bold text-indigo-600 mt-1">
                      Priority: {selectedComplaint.aiPriority}
                    </div>
                  )}
                </div>
              </div>

              {/* CITIZEN DESCRIPTION SECTION */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Citizen Description</h3>
                <div className="text-xs text-slate-800 bg-slate-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-slate-100">
                  {selectedComplaint.description && selectedComplaint.description.trim().length > 0
                    ? selectedComplaint.description
                    : "No text description provided by citizen (Document / image attached)."}
                </div>

                {/* Attachments */}
                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 ? (
                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-slate-500 mb-1.5">Submitted Attachments ({selectedComplaint.attachments.length}):</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedComplaint.attachments.map((att: any, idx: number) => (
                        <a
                          key={idx}
                          href={buildApiUrl(att.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-xs font-semibold text-indigo-600 transition-colors"
                          style={{ borderColor: '#E2E8F0' }}
                        >
                          <span>📄</span> {att.originalName || att.filename || `Attachment ${idx + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 text-[11px] text-slate-400">No attachments submitted.</div>
                )}
              </div>

              {/* N8N AI ANALYSIS SECTION */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">n8n AI Analysis & Summarization</h3>
                  </div>

                  {selectedComplaint.status === 'AI_PROCESSING' ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                      AI analysis in progress...
                    </span>
                  ) : selectedComplaint.status === 'AI_PROCESSING_FAILED' ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      AI analysis unavailable
                    </span>
                  ) : (selectedComplaint.aiSummary || selectedComplaint.aiAnalysis?.summary) ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      n8n AI Synthesis Complete
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      AI result not yet available
                    </span>
                  )}
                </div>

                {/* AI Summary */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-indigo-700">AI Summary:</div>
                  <p className="text-xs text-indigo-950 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-indigo-100/50">
                    {selectedComplaint.aiSummary || selectedComplaint.aiAnalysis?.summary || (
                      selectedComplaint.status === 'AI_PROCESSING'
                        ? 'AI workflow is actively processing citizen submission...'
                        : selectedComplaint.status === 'AI_PROCESSING_FAILED'
                        ? 'AI analysis failed during n8n workflow execution.'
                        : 'No AI summary available for this record.'
                    )}
                  </p>
                </div>

                {/* Grid of n8n AI Fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100/50">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Classification</div>
                    <div className="font-bold text-slate-900 mt-0.5 truncate">
                      {selectedComplaint.aiCategory || selectedComplaint.aiAnalysis?.category || selectedComplaint.category || 'Not available'}
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100/50">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">AI Priority</div>
                    <div className="font-bold text-indigo-700 mt-0.5">
                      {selectedComplaint.aiPriority || selectedComplaint.aiAnalysis?.priority || 'Not available'}
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100/50">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">AI Severity</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {selectedComplaint.aiSeverity != null ? `${selectedComplaint.aiSeverity}/100` : 'Not available'}
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100/50">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Assigned Dept</div>
                    <div className="font-bold text-emerald-700 mt-0.5 truncate">
                      {selectedComplaint.aiDepartment || selectedComplaint.aiAnalysis?.department || selectedComplaint.department || 'Not available'}
                    </div>
                  </div>
                </div>

                {/* Additional Recommendation & Reason */}
                {(selectedComplaint.aiAnalysis?.recommendedAction || selectedComplaint.aiAnalysis?.reason) && (
                  <div className="pt-1 text-xs text-indigo-900">
                    <div className="text-[11px] font-bold text-indigo-800">AI Recommendation & Reason:</div>
                    <div className="text-xs text-indigo-950 mt-0.5 bg-white/80 p-2.5 rounded-xl border border-indigo-100/50">
                      <strong>Action:</strong> {selectedComplaint.aiAnalysis?.recommendedAction || 'APPROVAL_REQUIRED'}
                      {selectedComplaint.aiAnalysis?.reason && (
                        <div className="mt-1 text-slate-600 text-[11px]">
                          {Array.isArray(selectedComplaint.aiAnalysis.reason)
                            ? selectedComplaint.aiAnalysis.reason.join('; ')
                            : selectedComplaint.aiAnalysis.reason}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* NEXT PIPELINE STAGE ACTION */}
              <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: '#F1F5F9' }}>
                <div className="text-xs text-slate-500 font-medium">
                  n8n AI Analysis Completed • Ready for Gemini Scheme Eligibility &amp; Fund Audit
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && selectedComplaint?.complaintId) {
                      window.history.pushState({}, '', `/officer/eligibility?complaintId=${selectedComplaint.complaintId}`);
                    }
                    navigate('funding-eligibility');
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer hover:opacity-90 shadow-sm transition-all flex items-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  <span>CHECK SCHEME ELIGIBILITY →</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border bg-white p-12 text-center text-slate-400 text-xs" style={{ borderColor: '#E2E8F0' }}>
              Select a complaint from the active queue to view real citizen description &amp; n8n AI analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
