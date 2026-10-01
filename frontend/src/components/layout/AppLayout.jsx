import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Menu, Clock, UserCheck } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

const PAGE_TITLES = {
  '/dashboard': 'Performance Dashboard',
  '/terminal': 'Trading Terminal',
  '/general': 'General',
  '/analytics': 'Performance Analytics & Edge',
  '/profile': 'Trader Profile & Settings',
};

export const AppLayout = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F17]">
        <LoadingSpinner text="Connecting to Terminal..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=login" replace state={{ from: location }} />;
  }

  const currentTitle = PAGE_TITLES[location.pathname] || 'Trading Terminal';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex relative selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* Subtle Ambient Background Gradients & Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Indian Timezone Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Asia/Kolkata (IST)</span>
            </div>

            {/* Current user pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">{user?.name}</span>
            </div>

            <ThemeToggle />
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
