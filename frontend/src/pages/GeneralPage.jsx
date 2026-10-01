import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { formatDateIST } from '../utils/formatters';
import { BookOpen, Search, Layers, FileText, Calendar, Clock, RefreshCw } from 'lucide-react';

const MARKETS = ['All Markets', 'Indian Market', 'Crypto Market', 'Commodity Market', 'Forex Market'];

export const GeneralPage = () => {
  const [trades, setTrades] = useState([]);
  const [market, setMarket] = useState('All Markets');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTrades = () => {
    setLoading(true);
    api.getTrades()
      .then((res) => setTrades(res.trades || []))
      .catch(() => setTrades([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      const marketOk = market === 'All Markets' || (t.market_type || 'Indian Market') === market;
      const q = search.trim().toLowerCase();
      const text = `${t.instrument} ${t.strategy || ''} ${t.notes || ''} ${t.position || t.side || ''} ${t.status || ''} ${t.rr || ''}`.toLowerCase();
      return marketOk && (!q || text.includes(q));
    });
  }, [trades, market, search]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, t) => {
      const key = t.market_type || 'Indian Market';
      (acc[key] ||= []).push(t);
      return acc;
    }, {});
  }, [filtered]);

  if (loading) return <LoadingSpinner text="Loading general trading notes..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">General</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Trading notes, strategies, and execution records automatically synced from your saved trades.
          </p>
        </div>

        <button
          onClick={fetchTrades}
          className="self-start sm:self-auto p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          className="px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        >
          {MARKETS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search instrument, strategy, notes, or R:R..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-center text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-500" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No saved trade notes found</p>
          <p className="text-xs text-slate-400 mt-1">Record a new trade to automatically view its reasoning and notes here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([marketName, items]) => (
            <section key={marketName} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                  {marketName}
                </h3>
                <span className="text-xs text-slate-400">
                  {items.length} trade{items.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((t) => {
                  const isIndian = (t.market_type || 'Indian Market') === 'Indian Market';
                  const pos = (t.position || t.side || 'BUY').toUpperCase();
                  const isTp = t.status === 'TP Hit';

                  return (
                    <article
                      key={t.id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      {/* Top Row: Instrument, Date/Time, Position & Status Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                            {t.instrument}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDateIST(t.trade_date)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {t.entry_time}{t.exit_time ? ` → ${t.exit_time}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Badge variant={pos === 'BUY' ? 'buy' : 'sell'} size="sm">
                            {pos}
                          </Badge>
                          <Badge variant={isTp ? 'tp' : 'sl'} size="sm">
                            {t.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Details Strip: Position Size & R:R */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">
                            {isIndian ? 'Quantity' : 'Lot Size / Lots'}
                          </span>
                          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {isIndian
                              ? (t.quantity != null ? t.quantity : '-')
                              : `${t.lot_size != null ? t.lot_size : '-'} (${t.lots != null ? `${t.lots} lots` : '-'})`}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">R:R</span>
                          <span className="font-mono font-bold text-emerald-500">
                            {t.rr || '-'}
                          </span>
                        </div>
                      </div>

                      {/* Strategy */}
                      {t.strategy && (
                        <div>
                          <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                            <Layers className="w-3 h-3 text-emerald-500" />
                            Strategy
                          </div>
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            {t.strategy}
                          </p>
                        </div>
                      )}

                      {/* Trading Notes */}
                      <div>
                        <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                          <FileText className="w-3 h-3 text-emerald-500" />
                          Trading Notes
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50/50 dark:bg-slate-900/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                          {t.notes || <span className="text-slate-400 italic">No notes added.</span>}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
