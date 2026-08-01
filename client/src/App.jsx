import React from 'react';
import { useAppData } from './context/AppDataContext';
import Navbar from './components/Navbar';
import DemoStoryBar from './components/DemoStoryBar';
import AICopilotModal from './components/AICopilotModal';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CitizenDashboard from './pages/CitizenDashboard';
import RaiseComplaint from './pages/RaiseComplaint';
import ComplaintResult from './pages/ComplaintResult';
import OfficialDashboard from './pages/OfficialDashboard';
import AIInsights from './pages/AIInsights';
import DuplicateDetection from './pages/DuplicateDetection';
import BudgetAllocation from './pages/BudgetAllocation';
import ResourceAllocation from './pages/ResourceAllocation';
import HeatMapPage from './pages/HeatMapPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { Building2, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const { activePage } = useAppData();

  const renderPage = () => {
    switch (activePage) {
      case 'landing': return <LandingPage />;
      case 'login': return <LoginPage />;
      case 'citizen-dashboard': return <CitizenDashboard />;
      case 'raise-complaint': return <RaiseComplaint />;
      case 'complaint-result': return <ComplaintResult />;
      case 'official-dashboard': return <OfficialDashboard />;
      case 'ai-insights': return <AIInsights />;
      case 'duplicate-detection': return <DuplicateDetection />;
      case 'budget-allocation': return <BudgetAllocation />;
      case 'resource-allocation': return <ResourceAllocation />;
      case 'heatmap': return <HeatMapPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />;
      default: return <LandingPage />;
    }
  };

  return (
    <div class="min-h-screen bg-gov-dark text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Interactive 7-Minute Demo Controller Bar */}
      <DemoStoryBar />

      {/* Main Governance Navbar */}
      <Navbar />

      {/* Main Dynamic View Content */}
      <main class="flex-1">
        {renderPage()}
      </main>

      {/* Floating AI Commissioner Copilot Chatbot */}
      <AICopilotModal />

      {/* Municipal Footer */}
      <footer class="bg-gov-navy border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <Building2 class="w-4 h-4 text-blue-400" />
            <span class="font-bold text-slate-300">CivicBrain AI</span> — Decision Intelligence for Municipal Governance
          </div>
          <p class="text-[11px]">Production-Ready Hackathon Architecture • Powered by Gemini 2.5 AI</p>
        </div>
      </footer>

    </div>
  );
}
