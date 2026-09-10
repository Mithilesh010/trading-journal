import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDateIST } from '../utils/formatters';
import { TradeFormModal } from '../components/trades/TradeFormModal';
import { TradeDetailModal } from '../components/trades/TradeDetailModal';
import {
  TrendingUp,
  Award,
  AlertOctagon,
  Percent,
  DollarSign,
  Scale,
  Activity,
  Plus,
  ArrowRight,
  Eye,
  Edit2,
  Calendar
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

  const navigate = useNavigate();

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
    return <LoadingSpinner text="Fetching real trading statistics..." />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
        <p className="font-semibold">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const equityCurve = data?.equity_curve || [];
  const recentTrades = data?.recent_trades || [];
  const hasData = data?.has_data;

  const totalPnl = metrics.total_pnl || 0;
  const isProfitable = totalPnl >= 0;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Performance Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time calculations computed strictly from your genuine database trades.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTrade(null);
            setIsTradeModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Record New Trade
        </button>
      </div>

      {!hasData ? (
        <EmptyState
          title="No trades yet"
          description="Your personal dashboard is waiting for data. Add your first trade to start tracking real performance, win rate, and equity curve."
          actionText="Add Your First Trade"
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
              title="Total P&L"
              value={formatCurrency(totalPnl, true)}
              subtitle={`${metrics.closed_trades || 0} closed trades`}
              icon={DollarSign}
              variant={isProfitable ? 'profit' : 'loss'}
            />
            <StatCard
              title="Win Rate"
              value={`${metrics.win_rate || 0}%`}
              subtitle={`${metrics.winning_trades || 0} W / ${metrics.losing_trades || 0} L`}
              icon={Percent}
              variant={metrics.win_rate >= 50 ? 'profit' : 'neutral'}
            />
            <StatCard
              title="Profit Factor"
              value={metrics.profit_factor || '0.00'}
              subtitle="Gross Profit / Gross Loss"
              icon={Scale}
              variant="accent"
            />
            <StatCard
              title="Average R:R"
              value={metrics.avg_rr ? `1 : ${metrics.avg_rr}` : '-'}
              subtitle="Reward to Risk Ratio"
              icon={Activity}
              variant="default"
            />
            <StatCard
              title="Total Trades"
              value={metrics.total_trades || 0}
              subtitle={`${metrics.open_trades || 0} Open Active`}
              icon={TrendingUp}
              variant="default"
            />
            <StatCard
              title="Winning Trades"
              value={metrics.winning_trades || 0}
              subtitle="Closed with profit"
              icon={Award}
              variant="profit"
            />
            <StatCard
              title="Losing Trades"
              value={metrics.losing_trades || 0}
              subtitle="Closed with loss"
              icon={AlertOctagon}
              variant="loss"
            />
            <StatCard
              title="Average P&L"
              value={formatCurrency(metrics.avg_pnl, true)}
              subtitle="Per closed trade"
              icon={DollarSign}
              variant={metrics.avg_pnl >= 0 ? 'profit' : 'loss'}
            />
          </div>

          {/* Equity Curve Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cumulative Equity Curve
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Chronological cumulative progression of realized trade returns (₹).
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 self-start sm:self-auto">
                Total: {formatCurrency(totalPnl, true)}
              </span>
            </div>

            <div className="h-72 w-full">
              {equityCurve.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isProfitable ? '#10B981' : '#F43F5E'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isProfitable ? '#10B981' : '#F43F5E'} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      tickLine={false}
                      axisLine={{ stroke: '#374151', opacity: 0.4 }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      tickLine={false}
                      axisLine={{ stroke: '#374151', opacity: 0.4 }}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        borderRadius: '0.75rem',
                        color: '#F9FAFB',
                        fontSize: '12px'
                      }}
                      formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Cumulative P&L']}
                      labelFormatter={(label, items) => {
                        const item = items[0]?.payload;
                        return item ? `${item.date} (${item.instrument || 'Start'})` : label;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative_pnl"
                      stroke={isProfitable ? '#10B981' : '#F43F5E'}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#equityGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Add closed trades with realized P&L to generate equity curve.
                </div>
              )}
            </div>
          </div>

          {/* Recent Trades Section */}
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
                View All Trades
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th scope="col" className="px-4 py-3">Date</th>
                    <th scope="col" className="px-4 py-3">Instrument</th>
                    <th scope="col" className="px-4 py-3">Side</th>
                    <th scope="col" className="px-4 py-3 text-right">Entry</th>
                    <th scope="col" className="px-4 py-3 text-right">Exit</th>
                    <th scope="col" className="px-4 py-3 text-right">Realized P&amp;L</th>
                    <th scope="col" className="px-4 py-3">Strategy</th>
                    <th scope="col" className="px-4 py-3 text-center">Status</th>
                    <th scope="col" className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {recentTrades.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-900 dark:text-white">
                        {formatDateIST(t.trade_date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold font-mono text-slate-900 dark:text-white">
                        {t.instrument}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={t.side === 'BUY' ? 'buy' : 'sell'} size="sm">
                          {t.side}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-xs">
                        ₹{Number(t.entry_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-xs">
                        {t.exit_price ? `₹${Number(t.exit_price).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-xs font-bold">
                        {t.pnl !== null ? (
                          <span className={t.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                            {formatCurrency(t.pnl, true)}
                          </span>
                        ) : (
                          <span className="text-amber-500">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                        {t.strategy || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <Badge variant={t.status === 'Closed' ? 'closed' : 'open'} size="sm">
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingTrade(t)}
                            title="View Details"
                            className="p-1 rounded text-slate-400 hover:text-slate-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTrade(t);
                              setIsTradeModalOpen(true);
                            }}
                            title="Edit Trade"
                            className="p-1 rounded text-slate-400 hover:text-slate-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Trade Entry Modal */}
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
