import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import {
  Wrench,
  LayoutDashboard,
  MessageSquarePlus,
  LogOut,
  DoorOpen,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface AppLayoutProps {
  currentView: 'resident' | 'admin';
  onViewChange: (view: 'resident' | 'admin') => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onViewChange,
  children,
}) => {
  const { user, logout } = useAuth();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check backend health on mount
  useEffect(() => {
    let isMounted = true;
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/tickets`);
        if (isMounted) {
          if (res.ok) setBackendStatus('online');
          else setBackendStatus('offline');
        }
      } catch {
        if (isMounted) setBackendStatus('offline');
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative selection:bg-blue-600 selection:text-white">
      {/* Background Micro-Grid */}
      <div className="fixed inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60 -z-0" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-6">
              <div
                onClick={() => onViewChange('resident')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-md shadow-slate-950/10 group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                    <Wrench className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight text-slate-900 font-mono">
                      FIXFLOW
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200/80">
                      Service Desk
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs: ONLY shown to Admins. Residents see NO tabs so they never suspect admin existence! */}
              {isAdmin && (
                <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => onViewChange('admin')}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      currentView === 'admin'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                    Operations Queue
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewChange('resident')}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      currentView === 'resident'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5 text-blue-600" />
                    Resident View
                  </button>
                </nav>
              )}
            </div>

            {/* Right Side: Health Status + Resident/Staff Room Pill + Sign Out */}
            <div className="flex items-center gap-3">
              {/* Backend Status indicator */}
              <div
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                  backendStatus === 'online'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : backendStatus === 'offline'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    backendStatus === 'online'
                      ? 'bg-emerald-500 animate-pulse'
                      : backendStatus === 'offline'
                      ? 'bg-rose-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="text-[11px]">
                  {backendStatus === 'online' ? 'System Online' : 'Connecting...'}
                </span>
              </div>

              {/* User Identity Pill & Direct Sign Out */}
              {user && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                    {isAdmin ? (
                      <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        <DoorOpen className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 font-mono leading-tight">
                        {user.unit || user.name}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 bg-white transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-md py-6 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 tracking-tight font-mono">FIXFLOW</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Automated AI Maintenance Dispatch
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
