import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const MARKETS = ['All Markets', 'Indian Market', 'Crypto Market', 'Commodity Market', 'Forex Market'];

export const TradeFilters = ({
  filters,
  onChange,
  onReset
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            placeholder="Search instrument, strategy, notes..."
            value={filters.search || ''}
            onChange={handleChange}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Market */}
        <div>
          <select
            name="market_type"
            value={filters.market_type || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          >
            {MARKETS.map((m) => (
              <option key={m} value={m === 'All Markets' ? '' : m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Position */}
        <div>
          <select
            name="side"
            value={filters.side || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          >
            <option value="">All Positions (BUY/SELL)</option>
            <option value="BUY">BUY Only</option>
            <option value="SELL">SELL Only</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            name="status"
            value={filters.status || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          >
            <option value="">All Results</option>
            <option value="TP Hit">TP Hit Only</option>
            <option value="SL Hit">SL Hit Only</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <input
            type="date"
            name="date_from"
            title="Date from"
            value={filters.date_from || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-emerald-500" />
          <span>Filter trades by market, position, result, or keyword</span>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Filters
        </button>
      </div>
    </div>
  );
};
