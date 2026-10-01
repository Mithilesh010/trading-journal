import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatDateIST } from '../utils/formatters';
import { TradeFormModal } from '../components/trades/TradeFormModal';
import { TradeDetailModal } from '../components/trades/TradeDetailModal';
import {
  TrendingUp,
  Award,
  AlertOctagon,
  Percent,
  Activity,
  Plus,
  ArrowRight,
  Eye,
  Edit2,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [viewingTrade, setViewingTrade] = useState(null);
  const [submittingTrade, setSubmittingTrade] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveTrade = async (formData) => {
    try {
      setSubmittingTrade(true);
      if (editingTrade) {
        await api.updateTrade(editingTrade.id, formData);
      } else {
        await api.createTrade(formData);
      }
      setIsTradeModalOpen(false);
      setEditingTrade(null);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Error saving trade');
    } finally {
      setSubmittingTrade(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching trading statistics..." />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
        <p className="font-semibold">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const trendChart = data?.trend_chart || [];
  const recentTrades = data?.recent_trades || [];
  const hasData = data?.has_data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Performance Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time trade performance tracking and execution journal.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTrade(null);
            setIsTradeModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Record New Trade
        </button>
      </div>

      {!hasData ? (
        <EmptyState
          title="No trades recorded yet"
          description="Your personal dashboard is ready. Record your first trade to track your Win Rate, R:R, and outcome progression."
          actionText="Record First Trade"
          onAction={() => {
            setEditingTrade(null);
            setIsTradeModalOpen(true);
          }}
        />
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Win Rate"
              value={`${metrics.win_rate || 0}%`}
              subtitle={`${metrics.tp_hits || 0} TP / ${metrics.sl_hits || 0} SL`}
              icon={Percent}
              variant={metrics.win_rate >= 50 ? 'profit' : 'neutral'}
            />
            <StatCard
              title="Total Trades"
              value={metrics.total_trades || 0}
              subtitle="Total logged executions"
              icon={TrendingUp}
              variant="default"
            />
            <StatCard
              title="TP Hit"
              value={metrics.tp_hits || 0}
              subtitle="Target achieved"
              icon={Award}
              variant="profit"
            />
            <StatCard
              title="SL Hit"
              value={metrics.sl_hits || 0}
              subtitle="Stop Loss hit"
              icon={AlertOctagon}
              variant="loss"
            />
            <StatCard
              title="Average R:R"
              value={metrics.avg_rr ? `1 : ${metrics.avg_rr}` : '-'}
              subtitle="Reward to Risk Ratio"
              icon={Activity}
              variant="default"
            />
            <StatCard
              title="Long Trades (BUY)"
              value={metrics.buy_trades || 0}
              subtitle="BUY executions"
              icon={ArrowUpRight}
              variant="profit"
            />
            <StatCard
              title="Short Trades (SELL)"
              value={metrics.sell_trades || 0}
              subtitle="SELL executions"
              icon={ArrowDownRight}
              variant="loss"
            />
            <StatCard
              title="SL Hit Rate"
              value={`${metrics.loss_rate || 0}%`}
              subtitle="SL percentage"
              icon={Target}
              variant="neutral"
            />
          </div>

          {/* Outcome Progression Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cumulative Outcome Progression
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Chronological progression of your cumulative Win Rate (%) across trades.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
                Win Rate: {metrics.win_rate || 0}%
              </span>
            </div>

            <div className="h-72 w-full">
              {trendChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.25} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      tickLine={false}
                      axisLine={{ stroke: '#374151', opacity: 0.3 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      tickLine={false}
                      axisLine={{ stroke: '#374151', opacity: 0.3 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        borderRadius: '0.75rem',
                        color: '#F9FAFB',
                        fontSize: '12px'
                      }}
                      formatter={(val) => [`${val}%`, 'Win Rate']}
                      labelFormatter={(label, items) => {
                        const item = items[0]?.payload;
                        return item ? `${item.date} — ${item.instrument || 'Start'} (${item.status || 'Baseline'})` : label;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="win_rate"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#trendGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Record trades to see outcome progression.
                </div>
              )}
            </div>
          </div>

          {/* Recent Trades Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Trades
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest executions logged into your terminal.
                </p>
              </div>

              <Link
                to="/terminal"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View Terminal
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th scope="col" className="px-4 py-3">Date / Time</th>
                    <th scope="col" className="px-4 py-3">Market</th>
                    <th scope="col" className="px-4 py-3">Instrument</th>
                    <th scope="col" className="px-4 py-3 text-center">Position</th>
                    <th scope="col" className="px-4 py-3 text-right">Qty / Lot Size</th>
                    <th scope="col" className="px-4 py-3 text-right">Lots</th>
                    <th scope="col" className="px-4 py-3">Strategy</th>
                    <th scope="col" className="px-4 py-3 text-center">R:R</th>
                    <th scope="col" className="px-4 py-3 text-center">Status</th>
                    <th scope="col" className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {recentTrades.map((t) => {
                    const isIndian = (t.market_type || 'Indian Market') === 'Indian Market';
                    const pos = (t.position || t.side || 'BUY').toUpperCase();
                    const isTp = t.status === 'TP Hit';

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-900 dark:text-white">
                          <div>{formatDateIST(t.trade_date)}</div>
                          <div className="text-[11px] text-slate-400">{t.entry_time}{t.exit_time ? ` → ${t.exit_time}` : ''}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-emerald-500 font-medium">
                          {t.market_type || 'Indian Market'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-bold font-mono text-slate-900 dark:text-white">
                          {t.instrument}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <Badge variant={pos === 'BUY' ? 'buy' : 'sell'} size="sm">
                            {pos}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-xs">
                          {isIndian ? (t.quantity != null ? t.quantity : '-') : (t.lot_size != null ? t.lot_size : '-')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-xs text-slate-400">
                          {isIndian ? '-' : (t.lots != null ? t.lots : '-')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                          {t.strategy || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center font-mono text-xs font-semibold text-emerald-500">
                          {t.rr || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <Badge variant={isTp ? 'tp' : 'sl'} size="sm">
                            {t.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingTrade(t)}
                              title="View Details"
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingTrade(t);
                                setIsTradeModalOpen(true);
                              }}
                              title="Edit Trade"
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Trade Entry / Edit Modal */}
      <TradeFormModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false);
          setEditingTrade(null);
        }}
        onSave={handleSaveTrade}
        initialData={editingTrade}
        isSubmitting={submittingTrade}
      />

      {/* Trade Detail Modal */}
      <TradeDetailModal
        isOpen={!!viewingTrade}
        onClose={() => setViewingTrade(null)}
        trade={viewingTrade}
      />
    </div>
  );
};
