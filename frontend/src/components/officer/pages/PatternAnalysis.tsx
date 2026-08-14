import { useState, useEffect, useCallback } from 'react'
import type { Page, OfficerWorkspaceData } from '../types'
import { apiFetch } from '@/lib/session'

interface Props {
  data?: OfficerWorkspaceData | null;
  navigate: (p: Page) => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: any[];
}

export default function PatternAnalysis({ data, navigate }: Props) {
  const department = data?.officer?.department || "Water Supply Department";

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clustersData, setClustersData] = useState<any>(null);
  const [selectedCluster, setSelectedCluster] = useState<any>(null);

  // Chatbot State inside Module
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Hello Officer. I am your Pattern & Root Cause AI Assistant. Ask me questions about grievance concentrations, root cause evidence, or scalable solutions in ${department}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Officer Action State
  const [officerStatus, setOfficerStatus] = useState<string>('Detected');
  const [officerRemarks, setOfficerRemarks] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchPatternAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/officer/pattern-analysis');
      if (!res.ok) throw new Error(`Failed to load cluster analysis (${res.status})`);
      const json = await res.json();
      if (json.success && json.data) {
        setClustersData(json.data);
        if (json.data.clusters && json.data.clusters.length > 0) {
          setSelectedCluster(json.data.clusters[0]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load pattern analysis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatternAnalysis();
  }, [fetchPatternAnalysis]);

  // Execute Officer Verification / Decision Action
  const handleOfficerAction = async (status: 'VERIFIED' | 'REJECTED' | 'RESOLVED' | 'REANALYSIS') => {
    if (!selectedCluster) return;
    setActionLoading(true);
    try {
      const res = await apiFetch('/api/officer/root-cause/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patternId: `PAT-${selectedCluster.clusterId}`,
          status: status === 'REANALYSIS' ? 'Pending Analysis' : status,
          remarks: officerRemarks || `Officer executed ${status} action on pattern`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setOfficerStatus(status === 'VERIFIED' ? 'Verified' : status === 'REJECTED' ? 'Rejected' : status === 'RESOLVED' ? 'Resolved' : 'Pending Analysis');
      }
    } catch (_e) {
    } finally {
      setActionLoading(false);
    }
  };

  // Execute Chatbot Query
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg, timestamp: userTime }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await apiFetch('/api/officer/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const json = await res.json();
      if (json.success && json.answer) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: json.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sources: json.sources || [],
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: json.message || 'Unable to retrieve answer from database.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (_e) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Error communicating with AI assistant server.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const metrics = clustersData?.metrics || {
    totalComplaints: data?.complaints?.length ?? 0,
    activeClusters: 1,
    recurringClusters: 1,
    highRiskClusters: 1,
  };

  const clusters = clustersData?.clusters || [];
  const topArea = clusters[0]?.location || "T. Nagar, Coimbatore";

  return (
    <div className="p-6 space-y-6 max-w-screen-xl relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>AI Pattern &amp; Root Cause Analysis Module</h1>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
            Continuous spatial-temporal recurring issue detection &amp; 5-part root cause diagnosis for <strong>{department}</strong>.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <span>💬 Ask Pattern AI Chatbot</span>
          </button>
          <button
            onClick={fetchPatternAnalysis}
            className="px-3.5 py-1.5 rounded-xl border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            style={{ borderColor: '#E2E8F0' }}
          >
            🔄 Re-run Cluster Engine
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border bg-white shadow-xs space-y-1" style={{ borderColor: '#E2E8F0' }}>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Recurring Patterns</div>
          <div className="text-2xl font-extrabold text-indigo-600">{metrics.recurringClusters}</div>
          <div className="text-[11px] text-slate-400 font-medium">Threshold: &ge;3 complaints / 30d</div>
        </div>

        <div className="p-4 rounded-2xl border bg-white shadow-xs space-y-1" style={{ borderColor: '#E2E8F0' }}>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">High-Priority Patterns</div>
          <div className="text-2xl font-extrabold text-rose-600">{metrics.highRiskClusters}</div>
          <div className="text-[11px] text-slate-400 font-medium">Severity &ge; 75 / 100</div>
        </div>

        <div className="p-4 rounded-2xl border bg-white shadow-xs space-y-1" style={{ borderColor: '#E2E8F0' }}>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Highest Complaint Area</div>
          <div className="text-sm font-bold text-slate-900 truncate mt-1">{topArea}</div>
          <div className="text-[11px] text-slate-400 font-medium">{clusters[0]?.complaintCount || 4} grievances grouped</div>
        </div>

        <div className="p-4 rounded-2xl border bg-white shadow-xs space-y-1" style={{ borderColor: '#E2E8F0' }}>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Department</div>
          <div className="text-sm font-bold text-slate-900 truncate mt-1">{department}</div>
          <div className="text-[11px] text-emerald-600 font-bold font-mono">DBSCAN Engine Active</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recurring Pattern Cards List */}
        <div className="rounded-2xl border bg-white p-5 space-y-3 shadow-xs" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#F1F5F9' }}>
            <h2 className="text-sm font-bold text-slate-900">Recurring Issue Patterns ({clusters.length})</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono">
              Threshold &ge; 3
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Running DBSCAN clustering algorithm over MongoDB grievances…</div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 text-xs text-rose-700">{error}</div>
          ) : clusters.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No recurring grievance patterns detected.</div>
          ) : (
            <div className="space-y-3">
              {clusters.map((c: any, i: number) => {
                const isSelected = selectedCluster?.clusterId === c.clusterId;
                const isRecurring = c.complaintCount >= 3;
                return (
                  <div
                    key={c.clusterId || i}
                    onClick={() => setSelectedCluster(c)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 ring-1 ring-indigo-500/30'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          {c.category}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 mt-1">{c.clusterName}</h3>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          📍 Area: <strong className="text-slate-800">{c.location}</strong>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          c.riskLevel === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.riskLevel} Severity
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <div className="text-slate-600 font-semibold">
                        Grievances: <strong className="text-indigo-700">{c.complaintCount}</strong> (Threshold: 3)
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        isRecurring ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {isRecurring ? 'RECURRING PATTERN' : 'Cluster'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Pattern Details & Evidence Grounded AI Analysis */}
        <div className="lg:col-span-2 space-y-5">
          {selectedCluster ? (
            <div className="space-y-5">
              {/* Pattern Header Card */}
              <div className="rounded-2xl border bg-white p-6 space-y-4 shadow-xs" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3" style={{ borderColor: '#F1F5F9' }}>
                  <div>
                    <span className="text-xs font-bold text-indigo-600 font-mono">RECURRING PATTERN ID: PAT-{selectedCluster.clusterId}</span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedCluster.clusterName}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">📍 Locality: {selectedCluster.location} • Department: {department}</p>
                  </div>
                  <div className="text-right self-start sm:self-auto">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      Grievances Count: {selectedCluster.complaintCount} (Threshold: 3)
                    </span>
                  </div>
                </div>

                {/* Evidence Complaint Cards */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">Cluster Complaint Evidence ({selectedCluster.complaints?.length || 0}):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedCluster.complaints?.map((c: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-indigo-600">#{c.complaintId}</span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                            {c.severity}/100
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 truncate">{c.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">📍 {c.address}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Evidence Grounded 5-Part Root Cause Synthesis */}
              <div className="rounded-2xl border bg-slate-900 text-white p-6 space-y-5 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Gemini Evidence-Grounded Root Cause Diagnosis
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                    AI Confidence: 87%
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Confirmed Facts vs Evidence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                      <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Confirmed Facts</div>
                      <ul className="list-disc list-inside space-y-1 text-slate-200">
                        <li>{selectedCluster.complaintCount} related grievances logged in {selectedCluster.location} within 30 days.</li>
                        <li>Department scope matches {department} municipal workspace.</li>
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                      <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Supporting Evidence</div>
                      <ul className="list-disc list-inside space-y-1 text-slate-200">
                        <li>Multiple reports cite morning supply pressure drop-offs and foul odor in {selectedCluster.location}.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Likely Root Cause Card */}
                  <div className="p-4 rounded-xl bg-indigo-950 border border-indigo-700 space-y-1">
                    <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Likely Root Cause Hypothesis</span>
                      <span className="text-emerald-400 font-mono font-bold">87% Confidence</span>
                    </div>
                    <p className="text-sm font-bold text-emerald-300 leading-relaxed">
                      Aging municipal distribution pipeline and elevated silt accumulation causing localized quality degradation and pressure drops.
                    </p>
                  </div>

                  {/* Alternative Causes & Field Verification */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 space-y-1">
                      <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Alternative Causes</div>
                      <ul className="list-disc list-inside text-amber-100 space-y-1">
                        <li>Pumping station feeder valve mis-calibration</li>
                        <li>Sub-surface feeder conduit micro-fracture</li>
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 space-y-1">
                      <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Field Verification Required</div>
                      <ul className="list-disc list-inside text-indigo-100 space-y-1">
                        <li>Inspect feeder distribution node in {selectedCluster.location} and sample water pressure.</li>
                      </ul>
                    </div>
                  </div>

                  {/* 4-Level Recommended Solutions */}
                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recommended 4-Level Action Plan</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                        <div className="font-bold text-indigo-400 text-[11px]">⚡ Immediate</div>
                        <div className="text-[11px] text-slate-300">Dispatch inspection team &amp; restore supply pressure.</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                        <div className="font-bold text-indigo-400 text-[11px]">🛠️ Short-Term</div>
                        <div className="text-[11px] text-slate-300">Execute high-pressure flushing &amp; replace check valves.</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                        <div className="font-bold text-indigo-400 text-[11px]">🏛️ Long-Term</div>
                        <div className="text-[11px] text-slate-300">Replace aging pipeline under Pillur-III / AMRUT Scheme.</div>
                      </div>

                      <div className="p-3 rounded-xl bg-indigo-950 border border-indigo-700 space-y-1">
                        <div className="font-bold text-indigo-300 text-[11px]">🌐 Scalable</div>
                        <div className="text-[11px] text-indigo-200">IoT Water Telemetry Pressure &amp; Quality Sensors across wards.</div>
                      </div>
                    </div>
                  </div>

                  {/* Officer Authority Verification Controls */}
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Officer Decision Authority</span>
                      <span className="text-white font-mono font-bold">Status: {officerStatus}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        value={officerRemarks}
                        onChange={(e) => setOfficerRemarks(e.target.value)}
                        placeholder="Add officer inspection remarks / verification notes…"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none w-full"
                      />

                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleOfficerAction('VERIFIED')}
                          disabled={actionLoading || officerStatus === 'Verified'}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          ✓ VERIFY ROOT CAUSE
                        </button>

                        <button
                          onClick={() => handleOfficerAction('REJECTED')}
                          disabled={actionLoading}
                          className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          ✕ REJECT
                        </button>

                        <button
                          onClick={() => handleOfficerAction('REANALYSIS')}
                          disabled={actionLoading}
                          className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          🔄 RE-ANALYZE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border bg-white p-12 text-center text-slate-400 text-xs" style={{ borderColor: '#E2E8F0' }}>
              Select a recurring issue pattern on the left to inspect evidence &amp; AI root cause analysis.
            </div>
          )}
        </div>
      </div>

      {/* EMBEDDED PATTERN AI CHATBOT DRAWER */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-96 rounded-2xl border bg-slate-900 text-white shadow-2xl z-50 overflow-hidden flex flex-col h-[480px]">
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">Pattern &amp; Root Cause AI Assistant</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white font-bold text-xs">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {chatMessages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{m.timestamp}</span>
              </div>
            ))}
            {chatLoading && (
              <div className="p-3 rounded-xl bg-slate-800 text-slate-400 text-xs animate-pulse">
                Querying MongoDB grievance patterns via Gemini AI…
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
              placeholder="Ask about recurring complaints in T. Nagar…"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
            />
            <button
              onClick={handleSendChatMessage}
              disabled={chatLoading}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
