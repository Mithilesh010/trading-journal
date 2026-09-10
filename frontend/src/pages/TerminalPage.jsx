import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { TradeTable } from '../components/trades/TradeTable';
import { TradeFilters } from '../components/trades/TradeFilters';
import { TradeFormModal } from '../components/trades/TradeFormModal';
import { TradeDetailModal } from '../components/trades/TradeDetailModal';
import { ExportModal } from '../components/trades/ExportModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Plus, Download, RefreshCw } from 'lucide-react';

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
      side: '',
      status: '',
      date_from: '',
      date_to: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trading Journal &amp; Terminal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review, edit, and analyze every historical execution in your personal database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Export (Excel/PDF)
          </button>

          <button
            onClick={() => {
              setEditingTrade(null);
              setIsTradeModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Trade
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <TradeFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Main Trade History Table */}
      {loading ? (
        <LoadingSpinner text="Loading trades from database..." />
      ) : error ? (
        <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchTrades}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white"
          >
            Retry
          </button>
        </div>
      ) : (
        <TradeTable
          trades={trades}
          onView={(trade) => setViewingTrade(trade)}
          onEdit={(trade) => {
            setEditingTrade(trade);
            setIsTradeModalOpen(true);
          }}
          onDelete={handleDeleteTrade}
          onAddNew={() => {
            setEditingTrade(null);
            setIsTradeModalOpen(true);
          }}
        />
      )}

      {/* Modals */}
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

      <TradeDetailModal
        isOpen={!!viewingTrade}
        onClose={() => setViewingTrade(null)}
        trade={viewingTrade}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
