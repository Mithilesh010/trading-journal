import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import {
  TrendingUp,
  BarChart3,
  BookOpen,
  FileSpreadsheet,
  Shield,
  ArrowRight,
  ExternalLink,
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5" />
              Professional Trading Terminal &amp; Journal
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Trade Smarter. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                Journal Better.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              A high-precision personal trading terminal and analytical journal built for disciplined traders.
              Record executions, calculate real-time P&amp;L and Risk:Reward ratios, capture psychology, and eliminate guesswork.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/auth?mode=signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/auth?mode=login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Login to Terminal
              </Link>
            </div>
          </div>

          {/* Terminal Mockup / Visual Card */}
          <div className="mt-16 max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs font-mono text-slate-500">terminal.trading-terminal.io</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE DATABASE ENGINE
              </div>
            </div>

            {/* Quick Metrics Bar in Preview */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[11px] text-slate-400 uppercase">Win Rate</span>
                <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">68.4%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[11px] text-slate-400 uppercase">Total Realized P&amp;L</span>
                <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">+₹1,42,850.00</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[11px] text-slate-400 uppercase">Profit Factor</span>
                <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">2.45</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[11px] text-slate-400 uppercase">Avg Risk:Reward</span>
                <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">1 : 2.80</div>
              </div>
            </div>

            {/* Preview table snippet */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Instrument</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2 text-right">Entry</th>
                    <th className="pb-2 text-right">Exit</th>
                    <th className="pb-2 text-right">P&amp;L</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2.5">09:30</td>
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">NIFTY 24000 CE</td>
                    <td className="py-2.5 text-emerald-500 font-bold">BUY</td>
                    <td className="py-2.5 text-right">₹180.00</td>
                    <td className="py-2.5 text-right">₹245.00</td>
                    <td className="py-2.5 text-right text-emerald-500 font-bold">+₹16,250.00</td>
                    <td className="py-2.5 text-center"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">Closed</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5">11:15</td>
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">BANKNIFTY 51000 PE</td>
                    <td className="py-2.5 text-rose-500 font-bold">SELL</td>
                    <td className="py-2.5 text-right">₹420.00</td>
                    <td className="py-2.5 text-right">₹310.00</td>
                    <td className="py-2.5 text-right text-emerald-500 font-bold">+₹11,000.00</td>
                    <td className="py-2.5 text-center"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">Closed</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5">14:00</td>
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">BTC/USDT</td>
                    <td className="py-2.5 text-emerald-500 font-bold">BUY</td>
                    <td className="py-2.5 text-right">$64,200.00</td>
                    <td className="py-2.5 text-right">-</td>
                    <td className="py-2.5 text-right text-amber-500 font-semibold">Open</td>
                    <td className="py-2.5 text-center"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Tools Section (TradingView & Delta Exchange) */}
      <section id="tools" className="py-16 bg-slate-100/70 dark:bg-[#0D131F] border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
              Essential Ecosystem
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Integrated External Trading Tools
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Launch institutional-grade charting and premier crypto derivatives platforms directly from your workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* TradingView Card */}
            <a
              href="https://www.tradingview.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xl">
                    TV
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <span>Open Website</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  TradingView
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  The world's leading charting platform and social network for traders and investors. Real-time global market data, technical indicators, and screening tools.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>https://www.tradingview.com</span>
                <span className="text-blue-500 font-semibold">Global Markets</span>
              </div>
            </a>

            {/* Delta Exchange Card */}
            <a
              href="https://www.delta.exchange/"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 font-bold text-xl">
                    Δ
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <span>Open Website</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  Delta Exchange
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Premier cryptocurrency derivatives exchange for trading Bitcoin &amp; Altcoin Futures, Options, and Interest Rate Swaps with institutional liquidity and low fees.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>https://www.delta.exchange</span>
                <span className="text-purple-500 font-semibold">Crypto Derivatives</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Built for Consistent Execution
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Every feature is purpose-built to help you refine your statistical edge and maintain strict emotional discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Real-Time Risk &amp; P&amp;L
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Automatic mathematical formulas compute your realized P&amp;L, stop-loss risk, target reward, and exact Risk:Reward ratio without manual errors.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Psychological Journal
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Record your emotional mindset, session observations, and key takeaways to uncover behavioral leaks and build unshakeable discipline.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Authentic Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Track your actual equity curve, daily performance, win/loss distributions, and strategy profitability powered exclusively by your genuine database records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Excel &amp; PDF Exports
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Generate formatted Microsoft Excel (.xlsx) workbooks and clean landscape PDF reports for 15-day, 1-month, or all-time periods in one click.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Multi-User Data Isolation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Every trade, journal reflection, screenshot, and export is strictly bound to your authenticated identity. No user can ever access another user's data.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Chart Screenshot Storage
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Upload trade execution screenshots directly to the cloud or local storage. Review previous setups visually to continuously hone pattern recognition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-slate-100/60 dark:bg-[#0D131F] border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Designed for Serious Market Participants
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Trading Terminal was created to replace clunky spreadsheets with a fast, modern, and mathematically rigorous environment.
            Whether you are day trading NIFTY &amp; BANKNIFTY options, swing trading Indian equities, or executing algorithmic strategies on crypto derivatives,
            this terminal gives you the clarity you need to master your edge.
          </p>
          <div className="pt-4">
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors"
            >
              Create Your Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
