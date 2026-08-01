import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Building2, User, UserCheck, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
  const { setUserRole, setActivePage } = useAppData();
  const [tab, setTab] = useState('citizen');

  const handleLogin = (role) => {
    setUserRole(role);
    if (role === 'citizen') setActivePage('citizen-dashboard');
    else setActivePage('official-dashboard');
  };

  return (
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div class="gov-card max-w-md w-full p-8 border-blue-500/40 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div class="text-center space-y-2">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-400 p-0.5 shadow-lg">
            <div class="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-blue-400 font-extrabold text-lg">
              <Building2 class="w-6 h-6" />
            </div>
          </div>
          <h2 class="text-2xl font-bold text-white">CivicBrain AI Portal Login</h2>
          <p class="text-xs text-slate-400">Firebase Authenticated Governance Access</p>
        </div>

        {/* Role Tabs */}
        <div class="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setTab('citizen')}
            class={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${tab === 'citizen' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <User class="w-3.5 h-3.5" /> Citizen Portal
          </button>
          
          <button 
            onClick={() => setTab('official')}
            class={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${tab === 'official' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <UserCheck class="w-3.5 h-3.5" /> Official Portal
          </button>
        </div>

        {/* Demo Persona Card */}
        {tab === 'citizen' ? (
          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">Demo Persona: Vignesh</span>
              <span class="text-blue-400 font-semibold">Ward 18 Resident</span>
            </div>
            <button 
              onClick={() => handleLogin('citizen')}
              class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              Sign In as Vignesh (Citizen) <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">Demo Persona: Officer Rajesh</span>
              <span class="text-amber-400 font-semibold">Municipal Commissioner</span>
            </div>
            <button 
              onClick={() => handleLogin('official')}
              class="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              Sign In as Officer Rajesh (Official) <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Google Login Simulation */}
        <button 
          onClick={() => handleLogin(tab)}
          class="w-full py-3 bg-slate-950 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
        >
          <span class="w-4 h-4 rounded-full bg-white text-slate-900 font-extrabold flex items-center justify-center text-[10px]">G</span>
          Continue with Google Login
        </button>

      </div>
    </div>
  );
}
