import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSession, apiFetch, signOut, getToken } from '@/lib/session'
import type { Page, OfficerWorkspaceData } from './types'

import Dashboard from './pages/Dashboard'
import FundingDiscovery from './pages/FundingDiscovery'
import FundingEligibility from './pages/FundingEligibility'
import Prioritization from './pages/Prioritization'
import GrievanceIntelligence from './pages/GrievanceIntelligence'
import PatternAnalysis from './pages/PatternAnalysis'
import RootCauseAnalysis from './pages/RootCauseAnalysis'
import SolutionRecommendation from './pages/SolutionRecommendation'
import BudgetIntelligence from './pages/BudgetIntelligence'
import MunicipalMap from './pages/MunicipalMap'
import AIAssistant from './pages/AIAssistant'
import Reports from './pages/Reports'
import WorkforceManagement from './pages/WorkforceManagement'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard' as Page, label: 'Dashboard', icon: GridIcon },
      { id: 'grievance' as Page, label: 'Grievance Intelligence', icon: MessageIcon },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { id: 'workforce' as Page, label: 'Workforce Management', icon: UsersIcon },
    ],
  },
  {
    label: 'Funding',
    items: [
      { id: 'funding-discovery' as Page, label: 'Funding Discovery', icon: SearchIcon },
      { id: 'funding-eligibility' as Page, label: 'Eligibility Check', icon: CheckCircleIcon },
      { id: 'budget' as Page, label: 'Budget Intelligence', icon: ChartBarIcon },
    ],
  },
  {
    label: 'Grievances',
    items: [
      { id: 'pattern-analysis' as Page, label: 'Pattern Analysis', icon: PieChartIcon },
      { id: 'root-cause' as Page, label: 'Root Cause Analysis', icon: LayersIcon },
    ],
  },
  {
    label: 'AI Engine',
    items: [
      { id: 'prioritization' as Page, label: 'AI Prioritization', icon: ZapIcon },
      { id: 'solution' as Page, label: 'Recommendations', icon: BulbIcon },
      { id: 'assistant' as Page, label: 'AI Assistant', icon: SparkleIcon },
    ],
  },
  {
    label: 'Spatial',
    items: [
      { id: 'map' as Page, label: 'Municipal Map', icon: MapIcon },
    ],
  },
  {
    label: 'Reports',
    items: [
      { id: 'reports' as Page, label: 'Report Generator', icon: FileIcon },
    ],
  },
]

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 14v-1a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v1" /><circle cx="8" cy="5" r="3" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" />
    </svg>
  )
}
function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" /><path d="M5.5 8L7 9.5L10.5 6" />
    </svg>
  )
}
function ChartBarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 13.5h12M4 13.5V8.5M8 13.5V4.5M12 13.5V7" />
    </svg>
  )
}
function MessageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.5 3.5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-7L3 14.5V12.5h-0.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" />
    </svg>
  )
}
function PieChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 8A6 6 0 1 1 8 2v6h6z" />
    </svg>
  )
}
function LayersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="8 2 2 5.5 8 9 14 5.5 8 2" />
      <polyline points="2 9.5 8 13 14 9.5" />
    </svg>
  )
}
function ZapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8.5 1.5L2.5 9H8.5L7.5 14.5L13.5 7H7.5L8.5 1.5Z" />
    </svg>
  )
}
function BulbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 13h4M8 1.5A4.5 4.5 0 0 0 3.5 6c0 1.8 1.1 3.4 2.5 4.1V11.5h4v-1.4c1.4-.7 2.5-2.3 2.5-4.1A4.5 4.5 0 0 0 8 1.5z" />
    </svg>
  )
}
function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1.5L9.5 6L14 7.5L9.5 9L8 13.5L6.5 9L2 7.5L6.5 6L8 1.5Z" />
    </svg>
  )
}
function MapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="1 3 5.5 1 10.5 3 15 1 15 13 10.5 15 5.5 13 1 15 1 3" />
      <line x1="5.5" y1="1" x2="5.5" y2="13" />
      <line x1="10.5" y1="3" x2="10.5" y2="15" />
    </svg>
  )
}
function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9 2z" />
      <polyline points="9 2 9 6 13 6" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 2a5 5 0 0 0-5 5v3l-1 2h12l-1-2V7a5 5 0 0 0-5-5z" />
      <path d="M7.5 14a1.5 1.5 0 0 0 3 0" />
    </svg>
  )
}
function LogOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11.5L13.5 8 10 4.5M13.5 8H6" />
    </svg>
  )
}

function getInitials(name?: string): string {
  if (!name) return "TN";
  const parts = name.trim().split(" ").filter(Boolean);
  const first = parts[0]?.charAt(0) || "";
  const second = parts[1]?.charAt(0) || "";
  if (first && second) {
    return (first + second).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const pathToPageMap: Record<string, Page> = {
  '/officer': 'dashboard',
  '/officer/': 'dashboard',
  '/officer/workforce': 'workforce',
  '/officer/funding': 'funding-discovery',
  '/officer/eligibility': 'funding-eligibility',
  '/officer/budget': 'budget',
  '/officer/grievances': 'grievance',
  '/officer/patterns': 'pattern-analysis',
  '/officer/root-cause': 'root-cause',
  '/officer/prioritization': 'prioritization',
  '/officer/recommendations': 'solution',
  '/officer/ai-assistant': 'assistant',
  '/officer/map': 'map',
  '/officer/reports': 'reports',
}

const pageToPathMap: Record<Page, string> = {
  'dashboard': '/officer',
  'workforce': '/officer/workforce',
  'funding-discovery': '/officer/funding',
  'funding-eligibility': '/officer/eligibility',
  'budget': '/officer/budget',
  'grievance': '/officer/grievances',
  'pattern-analysis': '/officer/patterns',
  'root-cause': '/officer/root-cause',
  'prioritization': '/officer/prioritization',
  'solution': '/officer/recommendations',
  'assistant': '/officer/ai-assistant',
  'map': '/officer/map',
  'reports': '/officer/reports',
}

export function OfficerPortalShell() {
  const routerNavigate = useNavigate();
  const { user, ready } = useSession();

  const getInitialPage = (): Page => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.replace(/\/$/, '')
      return pathToPageMap[pathname] || 'dashboard'
    }
    return 'dashboard'
  }

  const [page, setPage] = useState<Page>(getInitialPage)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [data, setData] = useState<OfficerWorkspaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Route protection check
  useEffect(() => {
    if (ready && (!getToken() || (user && user.role !== "officer"))) {
      void routerNavigate({ to: '/officer/login', replace: true });
    }
  }, [ready, user, routerNavigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      void routerNavigate({ to: '/officer/login', replace: true });
    }
  };

  const fetchWorkspaceData = async () => {
    const token = getToken();
    if (!token) {
      void routerNavigate({ to: '/officer/login', replace: true });
      return;
    }

    setLoading(true)
    setError('')
    try {
      const res = await apiFetch('/api/officer/dashboard')
      if (res.status === 401 || res.status === 403) {
        await signOut();
        void routerNavigate({ to: '/officer/login', replace: true })
        return
      }
      const json = await res.json()
      if (res.ok && json.success) {
        setData(json.data)
      } else {
        setError(json.message || 'Failed to load officer workspace.')
      }
    } catch {
      setError('Unable to connect to the server. Please check backend status.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchWorkspaceData()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.replace(/\/$/, '')
      const matched = pathToPageMap[pathname]
      if (matched && matched !== page) {
        setPage(matched)
      }
    }
  }, [page])

  const navigateTab = (p: Page) => {
    setPage(p)
    const targetPath = pageToPathMap[p]
    if (targetPath && typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath)
    }
  }

  const displayName = data?.officer?.name || user?.name || "Officer";
  const displayDept = data?.officer?.department || user?.department || "Public Works";
  const municipality = data?.officer?.municipality || `Tamil Nadu Municipal Administration — ${displayDept}`;
  const initials = getInitials(displayName);

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col border-r transition-all duration-300 relative"
        style={{
          width: sidebarOpen ? '240px' : '64px',
          background: '#0F172A',
          borderColor: 'rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M8 1.5l1.2 3.8H13l-3 2.2 1.1 3.5L8 8.9l-3.1 2.1L6 7.5 3 5.3h3.8L8 1.5z" />
            </svg>
          </div>
          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold text-sm leading-tight truncate">CivicFund AI</div>
              <div className="text-xs truncate" style={{ color: '#94A3B8' }}>{displayDept}</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            style={{ marginLeft: sidebarOpen ? 'auto' : undefined }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              {sidebarOpen
                ? <path d="M10 3L6 8l4 5" strokeLinecap="round" strokeLinejoin="round" />
                : <path d="M6 3l4 5-4 5" strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              {sidebarOpen && (
                <div className="px-2 mb-1.5 text-[10px] font-bold tracking-widest uppercase" style={{ color: '#475569' }}>
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = page === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTab(item.id)}
                      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-150 text-left cursor-pointer"
                      style={{
                        background: active ? 'rgba(79,70,229,0.18)' : 'transparent',
                        color: active ? '#818CF8' : '#64748B',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'
                      }}
                      onMouseLeave={(e) => {
                        if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#64748B'
                      }}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 20 }}>
                        <item.icon />
                      </span>
                      {sidebarOpen && (
                        <span className="text-xs font-semibold truncate">{item.label}</span>
                      )}
                      {sidebarOpen && active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#818CF8' }} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer with Explicit Sign Out Button & Menu */}
        <div className="p-3 border-t relative" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {sidebarOpen ? (
            <div className="flex flex-col gap-2">
              <div
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <div
                  className="flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
                  style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white truncate">{displayName}</div>
                  <div className="text-[10px] truncate text-slate-400">{displayDept}</div>
                </div>
              </div>

              {/* Explicit Sign Out Action Button */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#F87171',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                }}
              >
                <LogOutIcon />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              title={`Sign Out (${displayName})`}
              className="w-full flex items-center justify-center py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
            >
              <LogOutIcon />
            </button>
          )}

          {/* Profile Dropdown Popover */}
          {profileMenuOpen && sidebarOpen && (
            <div
              className="absolute bottom-16 left-3 right-3 rounded-2xl border shadow-2xl z-50 p-3 text-xs space-y-2.5 animate-in fade-in"
              style={{ background: '#1E293B', borderColor: 'rgba(255,255,255,0.1)', color: '#E2E8F0' }}
            >
              <div className="border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="font-bold text-white text-xs">{displayName}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{displayDept}</div>
                <div className="text-[10px] text-indigo-400 mt-1 truncate">{municipality}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/15 cursor-pointer transition-colors"
              >
                <LogOutIcon />
                <span>Confirm Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-4 px-6 py-3 border-b"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderColor: '#E2E8F0', flexShrink: 0 }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border max-w-xs" style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                <circle cx="7" cy="7" r="4" /><path d="M12 12L10 10" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search workspace, grievances…"
                className="bg-transparent text-xs outline-none w-full"
                style={{ color: '#475569' }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* AI Status */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: '#EEF2FF' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4F46E5' }} />
              <span className="text-xs font-semibold" style={{ color: '#4F46E5' }}>AI Active</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                style={{ color: '#475569' }}
              >
                <BellIcon />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ background: '#DC2626' }}
                />
              </button>
              {notifOpen && (
                <div
                  className="absolute right-0 top-11 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden"
                  style={{ background: 'white', borderColor: '#E2E8F0' }}
                >
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#E2E8F0' }}>
                    <span className="text-xs font-bold text-slate-900">Workspace Alerts</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold">Live</span>
                  </div>
                  {(data?.recentActivity ?? []).slice(0, 3).map((n, i) => (
                    <div key={i} className="px-4 py-3 border-b hover:bg-slate-50 cursor-pointer transition-colors" style={{ borderColor: '#F1F5F9' }}>
                      <div className="flex items-start gap-3">
                        <div className="text-xs font-mono text-slate-400 pt-0.5">{n.time}</div>
                        <div className="flex-1 min-w-0 text-xs text-slate-700 font-medium leading-relaxed">{n.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Profile Area with Sign Out Action */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <div
                  className="flex items-center justify-center rounded-full text-white text-xs font-bold"
                  style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  {initials}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight text-slate-900">{displayName}</div>
                  <div className="text-[10px] leading-tight text-slate-400">{displayDept}</div>
                </div>
              </button>

              {profileMenuOpen && (
                <div
                  className="absolute right-0 top-11 w-56 rounded-2xl border shadow-2xl z-50 p-2 text-xs space-y-1"
                  style={{ background: 'white', borderColor: '#E2E8F0' }}
                >
                  <div className="px-3 py-2 border-b" style={{ borderColor: '#F1F5F9' }}>
                    <div className="font-bold text-slate-900">{displayName}</div>
                    <div className="text-[10px] text-slate-500">{displayDept}</div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                  >
                    <LogOutIcon />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 text-xs">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading dynamic officer workspace…</span>
            </div>
          ) : error ? (
            <div className="p-8 max-w-lg mx-auto mt-12 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
              <h2 className="text-sm font-bold text-rose-700">Unable to load officer workspace</h2>
              <p className="text-xs text-rose-600">{error}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => void fetchWorkspaceData()}
                  className="px-4 py-2 bg-rose-600 text-white font-semibold text-xs rounded-xl hover:bg-rose-700 cursor-pointer"
                >
                  Retry Loading
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-300 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div key={page} className="h-full">
              {page === 'dashboard' && <Dashboard data={data} navigate={navigateTab} />}
              {page === 'workforce' && <WorkforceManagement data={data} navigate={navigateTab} />}
              {page === 'funding-discovery' && <FundingDiscovery data={data} navigate={navigateTab} />}
              {page === 'funding-eligibility' && <FundingEligibility data={data} navigate={navigateTab} />}
              {page === 'prioritization' && <Prioritization data={data} navigate={navigateTab} />}
              {page === 'grievance' && <GrievanceIntelligence data={data} navigate={navigateTab} />}
              {page === 'pattern-analysis' && <PatternAnalysis data={data} navigate={navigateTab} />}
              {page === 'root-cause' && <RootCauseAnalysis data={data} navigate={navigateTab} />}
              {page === 'solution' && <SolutionRecommendation data={data} navigate={navigateTab} />}
              {page === 'budget' && <BudgetIntelligence data={data} navigate={navigateTab} />}
              {page === 'map' && <MunicipalMap data={data} navigate={navigateTab} />}
              {page === 'assistant' && <AIAssistant data={data} navigate={navigateTab} />}
              {page === 'reports' && <Reports data={data} navigate={navigateTab} />}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
