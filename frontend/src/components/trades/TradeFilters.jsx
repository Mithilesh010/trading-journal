import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

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
    <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            placeholder="Search instrument, strategy, setup..."
            value={filters.search || ''}
            onChange={handleChange}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Side */}
        <div>
          <select
            name="side"
            value={filters.side || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Sides (BUY/SELL)</option>
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
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Closed">Closed Trades</option>
            <option value="Open">Open Trades</option>
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
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Date To */}
        <div>
          <input
            type="date"
            name="date_to"
            title="Date to"
            value={filters.date_to || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          <span>Real-time database search and filters</span>
        </div>
        <button
          onClick={onReset}
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Filters
        </button>
      </div>
    </div>
  );
};
