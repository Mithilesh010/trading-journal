import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { TradeTable } from '../components/trades/TradeTable';
import { TradeFilters } from '../components/trades/TradeFilters';
import { TradeFormModal } from '../components/trades/TradeFormModal';
import { TradeDetailModal } from '../components/trades/TradeDetailModal';
import { ExportModal } from '../components/trades/ExportModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Plus, Download, RefreshCw, BarChart2 } from 'lucide-react';

const MARKETS = ['All Markets', 'Indian Market', 'Crypto Market', 'Commodity Market', 'Forex Market'];

export const TerminalPage = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [viewingTrade, setViewingTrade] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    market_type: '',
    side: '',
    status: '',
    date_from: '',
    date_to: ''
  });

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getTrades(filters);
      setTrades(res.trades || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch trades.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrades();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchTrades]);

  const handleSaveTrade = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingTrade) {
        await api.updateTrade(editingTrade.id, formData);
      } else {
        await api.createTrade(formData);
      }
      setIsTradeModalOpen(false);
      setEditingTrade(null);
      await fetchTrades();
    } catch (err) {
      alert(err.message || 'Failed to save trade.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrade = async (tradeId) => {
    try {
      await api.deleteTrade(tradeId);
      await fetchTrades();
    } catch (err) {
      alert(err.message || 'Failed to delete trade.');
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      market_type: '',
      side: '',
      status: '',
      date_from: '',
      date_to: ''
    });
  };

  const selectedMarket = filters.market_type || 'All Markets';

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trading Terminal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review, filter, edit, and export every historical trade execution in your personal database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchTrades()}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Trades"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Export Journal
          </button>

          <button
            onClick={() => {
              setEditingTrade(null);
              setIsTradeModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Record Trade
          </button>
        </div>
      </div>

      {/* Market Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
        {MARKETS.map((marketName) => {
          const isActive =
            (marketName === 'All Markets' && !filters.market_type) ||
            filters.market_type === marketName;
          return (
            <button
              key={marketName}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  market_type: marketName === 'All Markets' ? '' : marketName,
                }))
              }
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {marketName}
            </button>
          );
        })}
      </div>

      {/* Filter Controls */}
      <TradeFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
          {error}
        </div>
      )}

      {/* Trades Table */}
      {loading ? (
        <LoadingSpinner text="Loading verified trades..." />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{trades.length}</strong> trade{trades.length !== 1 ? 's' : ''} in <strong className="text-emerald-500">{selectedMarket}</strong>
            </span>
          </div>

          <TradeTable
            trades={trades}
            onView={(t) => setViewingTrade(t)}
            onEdit={(t) => {
              setEditingTrade(t);
              setIsTradeModalOpen(true);
            }}
            onDelete={handleDeleteTrade}
            onAddNew={() => {
              setEditingTrade(null);
              setIsTradeModalOpen(true);
            }}
          />
        </div>
      )}

      {/* Record/Edit Trade Modal */}
      <TradeFormModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false);
          setEditingTrade(null);
        }}
        onSave={handleSaveTrade}
        initialData={editingTrade}
        isSubmitting={isSubmitting}
      />

      {/* View Trade Detail Modal */}
      <TradeDetailModal
        isOpen={!!viewingTrade}
        onClose={() => setViewingTrade(null)}
        trade={viewingTrade}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
