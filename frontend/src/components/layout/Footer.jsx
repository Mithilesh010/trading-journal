import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ExternalLink, ShieldCheck, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F17] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Trading<span className="text-emerald-500">Terminal</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              A high-precision personal trading terminal and journal designed for disciplined traders.
              Track open and closed positions, analyze edge, record psychological reflections, and elevate your trading journey.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Isolated, Private Multi-User Architecture</span>
            </div>
            <div className="pt-2">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  With phone no:{' '}
                  <a
                    href="tel:7408700625"
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    7408700625
                  </a>
                </span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#tools" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  Tools
                </a>
              </li>
              <li>
                <Link to="/auth?mode=login" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Trading Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              External Tools
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://www.tradingview.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  TradingView
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.delta.exchange/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  Delta Exchange
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Prominent Credit */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Trading Terminal. All rights reserved.
          </p>

          <div className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide">
              Designed &amp; Developed by <span className="text-emerald-500 font-bold">Mithilesh Kumar</span>
            </p>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                With phone no:{' '}
                <a
                  href="tel:7408700625"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  7408700625
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
