import { useState, useEffect, useCallback } from 'react'
import type { Page, OfficerWorkspaceData } from '../types'
import { apiFetch } from '@/lib/session'

interface Props {
  data?: OfficerWorkspaceData | null;
  navigate: (p: Page) => void;
}

type ModuleRole = 'OFFICER' | 'FIELD_WORKER' | 'ADMIN';

export default function WorkforceManagement({ data, navigate: _navigate }: Props) {
  const [activeRole, setActiveRole] = useState<ModuleRole>('OFFICER');
  const [demoUsername, setDemoUsername] = useState<string>('officer01');
  const [demoPassword, setDemoPassword] = useState<string>('officer123');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [officers, setOfficers] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [complaintHistory, setComplaintHistory] = useState<any[]>([]);
  const [adminData, setAdminData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [departmentWorkload, setDepartmentWorkload] = useState<any[]>([]);

  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);

  // Status Card Filter State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'PENDING' | 'SLA_RISK'>('ALL');

  // Modals & Action States
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [viewComplaintsModalOpen, setViewComplaintsModalOpen] = useState<boolean>(false);
  const [viewWorkersModalOpen, setViewWorkersModalOpen] = useState<boolean>(false);
  const [complaintSearchQuery, setComplaintSearchQuery] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskLocation, setTaskLocation] = useState<string>('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('WRK-001');

  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Admin Add Modal
  const [addOfficerModal, setAddOfficerModal] = useState<boolean>(false);
  const [newOfficerName, setNewOfficerName] = useState<string>('');
  const [newOfficerDept, setNewOfficerDept] = useState<string>('Water Department');

  const [addWorkerModal, setAddWorkerModal] = useState<boolean>(false);
  const [newWorkerName, setNewWorkerName] = useState<string>('');
  const [newWorkerSkill, setNewWorkerSkill] = useState<string>('Pipeline Repair');

  const fetchWorkforceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/officer/workforce');
      if (!res.ok) throw new Error(`Failed to load workforce module data (${res.status})`);
      const json = await res.json();
      if (json.success && json.data) {
        setOfficers(json.data.officers || []);
        setWorkers(json.data.workers || []);
        setAssignments(json.data.assignments || []);
        setComplaintHistory(json.data.complaintHistory || []);
        setAdminData(json.data.admin || null);
        setMetrics(json.data.metrics || null);
        setDepartmentWorkload(json.data.departmentWorkload || []);

        if (json.data.officers && json.data.officers.length > 0) setSelectedOfficer(json.data.officers[0]);
        if (json.data.workers && json.data.workers.length > 0) setSelectedWorker(json.data.workers[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load workforce module');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkforceData();
  }, [fetchWorkforceData]);

  // Demo Role Switcher Handler
  const handleRoleSwitch = (role: ModuleRole) => {
    setActiveRole(role);
    if (role === 'OFFICER') {
      setDemoUsername('officer01');
      setDemoPassword('officer123');
    } else if (role === 'FIELD_WORKER') {
      setDemoUsername('worker01');
      setDemoPassword('worker123');
    } else {
      setDemoUsername('admin');
      setDemoPassword('admin123');
    }
  };

  // Assign Task to Field Worker
  const handleAssignTask = async () => {
    if (!taskTitle.trim()) return;
    setActionLoading(true);
    try {
      const res = await apiFetch('/api/officer/workforce/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: `TN-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          workerId: selectedWorkerId,
          officerId: selectedOfficer?.officerId || 'OFF-001',
          taskTitle,
          location: taskLocation || 'Zone 1, Ward 12',
          priority: 'HIGH',
        }),
      });
      if (res.ok) {
        setAssignModalOpen(false);
        setTaskTitle('');
        setTaskLocation('');
        fetchWorkforceData();
      }
    } catch (_e) {
    } finally {
      setActionLoading(false);
    }
  };

  // Worker Task Progress Update / Completion
  const handleUpdateTaskStatus = async (assignmentId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await apiFetch('/api/officer/workforce/update-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          status: newStatus,
          notes: resolutionNote || `Task updated to ${newStatus}`,
        }),
      });
      if (res.ok) {
        setResolutionNote('');
        fetchWorkforceData();
      }
    } catch (_e) {
    } finally {
      setActionLoading(false);
    }
  };

  // Add Officer (Admin)
  const handleAddOfficer = async () => {
    if (!newOfficerName.trim()) return;
    setActionLoading(true);
    try {
      const res = await apiFetch('/api/officer/workforce/officer/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOfficerName,
          department: newOfficerDept,
          zone: 'Zone 1',
          ward: 'Ward 10',
        }),
      });
      if (res.ok) {
        setAddOfficerModal(false);
        setNewOfficerName('');
        fetchWorkforceData();
      }
    } catch (_e) {
    } finally {
      setActionLoading(false);
    }
  };

  // Add Worker (Admin)
  const handleAddWorker = async () => {
    if (!newWorkerName.trim()) return;
    setActionLoading(true);
    try {
      const res = await apiFetch('/api/officer/workforce/worker/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkerName,
          skill: newWorkerSkill,
          department: 'Water Department',
          zone: 'Zone 1',
          ward: 'Ward 10',
        }),
      });
      if (res.ok) {
        setAddWorkerModal(false);
        setNewWorkerName('');
        fetchWorkforceData();
      }
    } catch (_e) {
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-xl relative">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              DEMO DATA MODULE
            </span>
            <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Municipal Workforce Management</h1>
          </div>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
            Standalone workforce dispatch, field worker task allocation, and admin workload management.
          </p>
        </div>

        {/* Demo Credentials Role Switcher */}
        <div className="p-2 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Role:</span>
          <button
            onClick={() => handleRoleSwitch('OFFICER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRole === 'OFFICER' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Officer View
          </button>
          <button
            onClick={() => handleRoleSwitch('FIELD_WORKER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRole === 'FIELD_WORKER' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Field Worker View
          </button>
          <button
            onClick={() => handleRoleSwitch('ADMIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRole === 'ADMIN' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Admin View
          </button>
        </div>
      </div>

      {/* Demo Role Login Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">DEMO ROLE AUTHENTICATION:</span>
          <span className="text-slate-300 font-mono">
            Username: <strong className="text-emerald-300">{demoUsername}</strong> | Password: <strong className="text-emerald-300">{demoPassword}</strong>
          </span>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
          Current Active Mode: {activeRole}
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 rounded-2xl border bg-white animate-pulse" style={{ borderColor: '#E2E8F0' }}>
          Loading municipal workforce records &amp; active field assignments…
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 text-xs text-rose-700">{error}</div>
      ) : (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* ROLE VIEW 1: OFFICER VIEW */}
          {/* ========================================================================= */}
          {activeRole === 'OFFICER' && (
            <div className="space-y-6">
              {/* Officers Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Officers List Card */}
                <div className="rounded-2xl border bg-white p-5 space-y-3 shadow-xs" style={{ borderColor: '#E2E8F0' }}>
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#F1F5F9' }}>
                    <h2 className="text-sm font-bold text-slate-900">Municipal Officers ({officers.length})</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">DEMO DATA</span>
                  </div>

                  <div className="space-y-2.5">
                    {officers.map((off: any) => {
                      const isSelected = selectedOfficer?.officerId === off.officerId;
                      return (
                        <div
                          key={off.officerId}
                          onClick={() => setSelectedOfficer(off)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                            isSelected ? 'bg-indigo-50/80 border-indigo-500 ring-1 ring-indigo-500/30' : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-indigo-700">{off.officerId}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              off.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {off.status}
                            </span>
                          </div>
                          <div className="font-bold text-xs text-slate-900">{off.name}</div>
                          <div className="text-[11px] text-slate-500">{off.department} • {off.zone}, {off.ward}</div>
                          <div className="text-[10px] font-bold text-slate-600 pt-1">Active Complaints: {off.activeComplaints}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Officer Detail & Actions */}
                <div className="lg:col-span-2 space-y-5">
                  {selectedOfficer && (
                    <div className="rounded-2xl border bg-white p-6 space-y-5 shadow-xs" style={{ borderColor: '#E2E8F0' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4" style={{ borderColor: '#F1F5F9' }}>
                        <div>
                          <span className="text-xs font-bold font-mono text-indigo-600">{selectedOfficer.officerId} • {selectedOfficer.department}</span>
                          <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedOfficer.name}</h2>
                          <div className="text-xs text-slate-500">📍 {selectedOfficer.zone}, {selectedOfficer.ward} • Demo Contact: {selectedOfficer.phone}</div>
                        </div>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full self-start sm:self-auto ${
                          selectedOfficer.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Status: {selectedOfficer.status}
                        </span>
                      </div>

                      {/* Dynamic Metrics Calculation from MongoDB Assignments */}
                      {(() => {
                        const activeCount = assignments.filter((a: any) =>
                          ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ON_SITE', 'WORK_IN_PROGRESS', 'IN_PROGRESS', 'WORK_STARTED'].includes(a.status)
                        ).length;
                        const completedCount = assignments.filter((a: any) =>
                          ['COMPLETED', 'RESOLVED', 'CLOSED'].includes(a.status)
                        ).length;
                        const pendingCount = assignments.filter((a: any) =>
                          ['UNASSIGNED', 'PENDING', 'AI_PROCESSING', 'UNDER_REVIEW', 'PENDING_APPROVAL'].includes(a.status)
                        ).length;
                        const slaRiskCount = assignments.filter((a: any) =>
                          (a.priority === 'HIGH' || a.priority === 'CRITICAL') && !['COMPLETED', 'RESOLVED', 'CLOSED'].includes(a.status)
                        ).length;

                        const displayList = assignments.filter((asn: any) => {
                          if (statusFilter === 'ACTIVE') {
                            return ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ON_SITE', 'WORK_IN_PROGRESS', 'IN_PROGRESS', 'WORK_STARTED'].includes(asn.status);
                          }
                          if (statusFilter === 'COMPLETED') {
                            return ['COMPLETED', 'RESOLVED', 'CLOSED'].includes(asn.status);
                          }
                          if (statusFilter === 'PENDING') {
                            return ['UNASSIGNED', 'PENDING', 'AI_PROCESSING', 'UNDER_REVIEW', 'PENDING_APPROVAL'].includes(asn.status);
                          }
                          if (statusFilter === 'SLA_RISK') {
                            return (asn.priority === 'HIGH' || asn.priority === 'CRITICAL') && !['COMPLETED', 'RESOLVED', 'CLOSED'].includes(asn.status);
                          }
                          return true;
                        });

                        return (
                          <>
                            {/* Metrics Stats Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div
                                onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                  statusFilter === 'ACTIVE'
                                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/30'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                }`}
                              >
                                <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-between">
                                  <span>Active Complaints</span>
                                  {statusFilter === 'ACTIVE' && <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-extrabold">FILTERED</span>}
                                </div>
                                <div className="text-xl font-extrabold text-indigo-600 mt-1">{activeCount}</div>
                              </div>

                              <div
                                onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                  statusFilter === 'COMPLETED'
                                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                }`}
                              >
                                <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-between">
                                  <span>Completed</span>
                                  {statusFilter === 'COMPLETED' && <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-extrabold">FILTERED</span>}
                                </div>
                                <div className="text-xl font-extrabold text-emerald-600 mt-1">{completedCount}</div>
                              </div>

                              <div
                                onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                  statusFilter === 'PENDING'
                                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/30'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                }`}
                              >
                                <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-between">
                                  <span>Pending</span>
                                  {statusFilter === 'PENDING' && <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-extrabold">FILTERED</span>}
                                </div>
                                <div className="text-xl font-extrabold text-amber-600 mt-1">{pendingCount}</div>
                              </div>

                              <div
                                onClick={() => setStatusFilter(statusFilter === 'SLA_RISK' ? 'ALL' : 'SLA_RISK')}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                  statusFilter === 'SLA_RISK'
                                    ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/30'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                }`}
                              >
                                <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-between">
                                  <span>SLA At Risk</span>
                                  {statusFilter === 'SLA_RISK' && <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-extrabold">FILTERED</span>}
                                </div>
                                <div className="text-xl font-extrabold text-rose-600 mt-1">{slaRiskCount}</div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: '#F1F5F9' }}>
                              <button
                                onClick={() => setAssignModalOpen(true)}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                              >
                                ➕ Assign Complaint / Task
                              </button>
                              <button
                                onClick={() => setViewComplaintsModalOpen(true)}
                                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                              >
                                📋 View Complaints ({complaintHistory.length || assignments.length})
                              </button>
                              <button
                                onClick={() => setViewWorkersModalOpen(true)}
                                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                              >
                                👷 View Assigned Workers ({workers.length})
                              </button>
                              <button className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer">
                                Escalate
                              </button>
                            </div>

                            {/* Assigned Tasks Table */}
                            <div className="space-y-3 pt-3 border-t" style={{ borderColor: '#F1F5F9' }}>
                              <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-900">
                                  {statusFilter === 'ALL'
                                    ? `Active Field Assignments (${displayList.length})`
                                    : statusFilter === 'ACTIVE'
                                    ? `Active Field Complaints (${displayList.length})`
                                    : statusFilter === 'COMPLETED'
                                    ? `Completed Tasks (${displayList.length})`
                                    : statusFilter === 'PENDING'
                                    ? `Pending Complaints (${displayList.length})`
                                    : `SLA At Risk Complaints (${displayList.length})`}
                                </h3>
                                {statusFilter !== 'ALL' && (
                                  <button
                                    onClick={() => setStatusFilter('ALL')}
                                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                                  >
                                    Reset Filter (Show All)
                                  </button>
                                )}
                              </div>

                              <div className="space-y-2">
                                {displayList.length === 0 ? (
                                  <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-300">
                                    No complaints or tasks match the selected filter category ({statusFilter}).
                                  </div>
                                ) : (
                                  displayList.map((asn: any) => (
                                    <div key={asn.assignmentId} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{asn.complaintId || asn.assignmentId}</span>
                                          <span className="font-bold text-slate-900">{asn.taskTitle}</span>
                                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                                            {asn.assignmentMethod === 'MANUAL' ? 'MANUAL ASSIGNED' : 'AUTO ASSIGNED'}
                                          </span>
                                        </div>
                                        {asn.description && (
                                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 italic">{asn.description}</p>
                                        )}
                                        <div className="text-[11px] text-slate-500 mt-1">
                                          Assigned to: <strong className="text-slate-800">{asn.workerName}</strong> ({asn.department}) • 📍 {asn.location}
                                        </div>
                                      </div>
                                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                                        ['COMPLETED', 'RESOLVED', 'CLOSED'].includes(asn.status)
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : ['WORK_STARTED', 'IN_PROGRESS', 'ON_SITE', 'ON_THE_WAY'].includes(asn.status)
                                          ? 'bg-indigo-100 text-indigo-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {asn.status}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ROLE VIEW 2: FIELD WORKER VIEW */}
          {/* ========================================================================= */}
          {activeRole === 'FIELD_WORKER' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Workers List */}
                <div className="rounded-2xl border bg-white p-5 space-y-3 shadow-xs" style={{ borderColor: '#E2E8F0' }}>
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#F1F5F9' }}>
                    <h2 className="text-sm font-bold text-slate-900">Field Workers ({workers.length})</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">DEMO DATA</span>
                  </div>

                  <div className="space-y-2.5">
                    {workers.map((wrk: any) => {
                      const isSelected = selectedWorker?.workerId === wrk.workerId;
                      return (
                        <div
                          key={wrk.workerId}
                          onClick={() => setSelectedWorker(wrk)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                            isSelected ? 'bg-indigo-50/80 border-indigo-500 ring-1 ring-indigo-500/30' : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-indigo-700">{wrk.workerId}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              wrk.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {wrk.status}
                            </span>
                          </div>
                          <div className="font-bold text-xs text-slate-900">{wrk.name}</div>
                          <div className="text-[11px] text-slate-500">{wrk.department} • Skill: {wrk.skill}</div>
                          <div className="text-[10px] text-slate-600 pt-1 font-semibold">
                            Current Tasks: {wrk.currentTasks}/{wrk.maxTasks} • Completed: {wrk.completedTasks}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Worker Task Execution Dashboard */}
                <div className="lg:col-span-2 space-y-5">
                  {selectedWorker && (
                    <div className="rounded-2xl border bg-white p-6 space-y-5 shadow-xs" style={{ borderColor: '#E2E8F0' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4" style={{ borderColor: '#F1F5F9' }}>
                        <div>
                          <span className="text-xs font-bold font-mono text-indigo-600">{selectedWorker.workerId} • Skill: {selectedWorker.skill}</span>
                          <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedWorker.name}</h2>
                          <div className="text-xs text-slate-500">📍 Location: {selectedWorker.location} • Officer: {selectedWorker.assignedOfficer}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                            selectedWorker.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {selectedWorker.status}
                          </span>
                        </div>
                      </div>

                      {/* Equipment List */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Assigned Equipment &amp; Tools</div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedWorker.equipment?.map((eq: string, idx: number) => (
                            <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                              🛠️ {eq}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Today's Tasks Lifecycle List */}
                      <div className="space-y-3 pt-2">
                        <h3 className="text-xs font-bold text-slate-900">Today's Field Tasks ({assignments.length})</h3>
                        <div className="space-y-3">
                          {assignments.map((asn: any) => (
                            <div key={asn.assignmentId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{asn.complaintId || asn.assignmentId}</span>
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                                      {asn.assignmentMethod === 'MANUAL' ? 'MANUAL ASSIGNED' : 'AUTO ASSIGNED'}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-slate-900 text-sm mt-1">{asn.taskTitle}</h4>
                                  {asn.description && (
                                    <p className="text-[11px] text-slate-600 mt-1 italic">{asn.description}</p>
                                  )}
                                  <div className="text-[11px] text-slate-500 mt-1">📍 Location: {asn.location} • SLA Deadline: {asn.slaDeadline}</div>
                                </div>
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                  {asn.priority} PRIORITY
                                </span>
                              </div>

                              {asn.notes && (
                                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700">
                                  <strong>Field Notes:</strong> {asn.notes}
                                </div>
                              )}

                              {/* Action Bar */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                                <span className="text-[11px] font-bold text-indigo-700">Status: {asn.status}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateTaskStatus(asn.assignmentId, 'WORK_STARTED')}
                                    disabled={actionLoading || asn.status === 'WORK_STARTED' || asn.status === 'COMPLETED'}
                                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] cursor-pointer"
                                  >
                                    START TASK
                                  </button>

                                  <button
                                    onClick={() => handleUpdateTaskStatus(asn.assignmentId, 'IN_PROGRESS')}
                                    disabled={actionLoading || asn.status === 'COMPLETED'}
                                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] cursor-pointer"
                                  >
                                    UPDATE PROGRESS
                                  </button>

                                  <button
                                    onClick={() => handleUpdateTaskStatus(asn.assignmentId, 'COMPLETED')}
                                    disabled={actionLoading || asn.status === 'COMPLETED'}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                                  >
                                    COMPLETE TASK ✓
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ROLE VIEW 3: ADMIN VIEW */}
          {/* ========================================================================= */}
          {activeRole === 'ADMIN' && (
            <div className="space-y-6">
              {/* Admin Profile Banner */}
              {adminData && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500 text-white uppercase tracking-wider">
                      DEMO ADMIN
                    </span>
                    <h2 className="text-lg font-bold mt-1">{adminData.name} ({adminData.adminId})</h2>
                    <div className="text-xs text-slate-400">{adminData.department} • Role: ADMIN</div>
                  </div>
                  <div className="flex gap-2 self-stretch sm:self-auto">
                    <button
                      onClick={() => setAddOfficerModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                    >
                      ➕ Add Officer
                    </button>
                    <button
                      onClick={() => setAddWorkerModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      ➕ Add Worker
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Metrics Grid */}
              {metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl border bg-white shadow-xs" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Total Officers</div>
                    <div className="text-xl font-extrabold text-indigo-600 mt-1">{metrics.totalOfficers}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-white shadow-xs" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Available Officers</div>
                    <div className="text-xl font-extrabold text-emerald-600 mt-1">{metrics.availableOfficers}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-white shadow-xs" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Total Field Workers</div>
                    <div className="text-xl font-extrabold text-indigo-600 mt-1">{metrics.totalWorkers}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-white shadow-xs" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Available Workers</div>
                    <div className="text-xl font-extrabold text-emerald-600 mt-1">{metrics.availableWorkers}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-white shadow-xs" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Active Tasks</div>
                    <div className="text-xl font-extrabold text-amber-600 mt-1">{metrics.activeAssignments}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-white shadow-xs" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Completed Tasks</div>
                    <div className="text-xl font-extrabold text-emerald-600 mt-1">{metrics.completedAssignments}</div>
                  </div>
                </div>
              )}

              {/* Department Workload Visualization */}
              <div className="rounded-2xl border bg-white p-5 space-y-4 shadow-xs" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#F1F5F9' }}>
                  <h3 className="text-sm font-bold text-slate-900">Department Workload &amp; Capacity Distribution</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">DEMO WORKLOAD</span>
                </div>

                <div className="space-y-3">
                  {departmentWorkload.map((dw: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{dw.department}</span>
                        <span className="font-bold text-indigo-600">{dw.activeTasks} Active Tasks</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                          Officers: <strong>{dw.officers}</strong>
                        </div>
                        <div className="p-2 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                          Field Workers: <strong>{dw.workers}</strong>
                        </div>
                        <div className="p-2 rounded bg-white border border-slate-200 text-indigo-700 font-bold">
                          Task Load Ratio: {(dw.activeTasks / dw.workers).toFixed(1)} / worker
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ASSIGN TASK MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Assign New Grievance Repair Task</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Task Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Flush T. Nagar Water Feeder Pipeline"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Target Location</label>
                <input
                  type="text"
                  value={taskLocation}
                  onChange={(e) => setTaskLocation(e.target.value)}
                  placeholder="e.g. Ward 12, T. Nagar Node 4"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Assign To Field Worker</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none bg-white font-bold"
                >
                  {workers.map((w: any) => (
                    <option key={w.workerId} value={w.workerId}>
                      {w.name} ({w.department} - {w.skill})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTask}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD OFFICER MODAL */}
      {addOfficerModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Add New Demo Officer</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Officer Name</label>
                <input
                  type="text"
                  value={newOfficerName}
                  onChange={(e) => setNewOfficerName(e.target.value)}
                  placeholder="e.g. Ramesh V"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Department</label>
                <select
                  value={newOfficerDept}
                  onChange={(e) => setNewOfficerDept(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none bg-white font-bold"
                >
                  <option value="Water Department">Water Department</option>
                  <option value="Sanitation Department">Sanitation Department</option>
                  <option value="Road Department">Road Department</option>
                  <option value="Drainage Department">Drainage Department</option>
                  <option value="Electricity Department">Electricity Department</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setAddOfficerModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOfficer}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Save Officer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD WORKER MODAL */}
      {addWorkerModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Add New Demo Field Worker</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Worker Name</label>
                <input
                  type="text"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  placeholder="e.g. Murugan K"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Primary Skill</label>
                <input
                  type="text"
                  value={newWorkerSkill}
                  onChange={(e) => setNewWorkerSkill(e.target.value)}
                  placeholder="e.g. Silt Jetting / Conduit Repair"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setAddWorkerModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWorker}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                Save Worker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW COMPLAINTS HISTORY MODAL */}
      {viewComplaintsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col space-y-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Real Complaint History &amp; Audit Records (MongoDB)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing complaint history for <strong className="text-indigo-700">{selectedOfficer?.department || 'All Municipal Departments'}</strong>
                </p>
              </div>
              <button
                onClick={() => setViewComplaintsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <input
                type="text"
                value={complaintSearchQuery}
                onChange={(e) => setComplaintSearchQuery(e.target.value)}
                placeholder="🔍 Search by Complaint ID, Title, Location, or Worker…"
                className="w-full sm:w-80 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50"
              />
              <div className="text-[11px] font-bold text-slate-500">
                Total Complaints: <strong className="text-indigo-700">{complaintHistory.length}</strong>
              </div>
            </div>

            {/* Complaint List */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {complaintHistory
                .filter((c: any) => {
                  if (!complaintSearchQuery.trim()) return true;
                  const q = complaintSearchQuery.toLowerCase();
                  return (
                    (c.complaintId || '').toLowerCase().includes(q) ||
                    (c.title || '').toLowerCase().includes(q) ||
                    (c.address || '').toLowerCase().includes(q) ||
                    (c.assignedWorkerName || '').toLowerCase().includes(q)
                  );
                })
                .map((comp: any) => (
                  <div key={comp.complaintId || comp._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                          {comp.complaintId}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{comp.title}</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                          {comp.assignmentMethod === 'MANUAL' ? 'MANUAL ASSIGNED' : comp.assignmentMethod === 'AUTOMATIC' ? 'AUTO ASSIGNED' : 'UNASSIGNED'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                          SLA: {comp.slaStatus}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          ['COMPLETED', 'RESOLVED', 'CLOSED'].includes(comp.status)
                            ? 'bg-emerald-100 text-emerald-800'
                            : ['ASSIGNED', 'IN_PROGRESS', 'WORK_STARTED'].includes(comp.status)
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {comp.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-700 italic">{comp.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                      <div>📍 <strong>Location:</strong> {comp.address}</div>
                      <div>🏛️ <strong>Department:</strong> {comp.department}</div>
                      <div>👷 <strong>Assigned Worker:</strong> {comp.assignedWorkerName || 'Unassigned'}</div>
                      <div>🚨 <strong>Priority:</strong> {comp.aiPriority || 'MEDIUM'}</div>
                      <div>📅 <strong>Created:</strong> {comp.createdAt ? new Date(comp.createdAt).toLocaleDateString() : 'Recent'}</div>
                      <div>💰 <strong>Budget:</strong> {comp.budgetStatus === 'ALLOCATED' || comp.approvedBudgetAmount > 0 ? `APPROVED — ₹${comp.approvedBudgetAmount.toLocaleString()}` : 'NOT APPROVED'}</div>
                    </div>

                    {/* Timeline progression */}
                    {comp.decisionHistory && comp.decisionHistory.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Complaint Progression Timeline</div>
                        <div className="flex flex-wrap items-center gap-1 text-[10px]">
                          {comp.decisionHistory.map((step: any, sIdx: number) => (
                            <div key={sIdx} className="flex items-center gap-1">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono font-semibold">
                                {step.action} ({step.timestamp ? new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged'})
                              </span>
                              {sIdx < comp.decisionHistory.length - 1 && <span className="text-slate-400 font-bold">→</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setViewComplaintsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ASSIGNED WORKERS MODAL */}
      {viewWorkersModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] flex flex-col space-y-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Assigned Field Workers &amp; Live Workloads (MongoDB)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Assigned field workers, live capacities, and current assigned tasks</p>
              </div>
              <button
                onClick={() => setViewWorkersModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {workers.map((wrk: any) => {
                const workerTasks = assignments.filter((a: any) => a.workerId === wrk.workerId && a.status !== 'COMPLETED');
                const availableCap = Math.max(0, wrk.maxTasks - workerTasks.length);

                return (
                  <div key={wrk.workerId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                      <div>
                        <span className="font-mono font-bold text-indigo-700 text-xs">{wrk.workerId}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{wrk.name}</h4>
                        <div className="text-[11px] text-slate-500">
                          {wrk.department} • 🛠️ Skill: {wrk.skill} • 📍 Location: {wrk.location}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                          Tasks: <strong className="text-indigo-600">{workerTasks.length}</strong> / {wrk.maxTasks} (Capacity: {availableCap})
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          wrk.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {wrk.status}
                        </span>
                      </div>
                    </div>

                    {/* Worker Current Assignments */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Current Assigned Tasks ({workerTasks.length})</div>
                      {workerTasks.length === 0 ? (
                        <div className="text-[11px] text-slate-500 italic p-2 bg-white rounded border border-slate-200">
                          No active assigned tasks currently. Worker is available.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {workerTasks.map((asn: any) => (
                            <div key={asn.assignmentId} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-indigo-700">{asn.complaintId || asn.assignmentId}</span>
                                  <span className="font-bold text-slate-900">{asn.taskTitle}</span>
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                                    {asn.assignmentMethod === 'MANUAL' ? 'MANUAL ASSIGNED' : 'AUTO ASSIGNED'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500">📍 {asn.location}</div>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                {asn.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setViewWorkersModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close Workers View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
