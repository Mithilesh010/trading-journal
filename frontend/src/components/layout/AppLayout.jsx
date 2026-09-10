import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Menu, Clock, UserCheck } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard Overview',
  '/terminal': 'Trading Terminal & History',
  '/journal': 'Trading Journal & Reflections',
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Indian Timezone Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Asia/Kolkata (IST)</span>
            </div>

            {/* Current user pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300">
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
