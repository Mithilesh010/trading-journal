import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency } from '../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  Percent,
  Scale,
  Award,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics();
      setData(res);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing deep analytics from real trades..." />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
        {error}
      </div>
    );
  }

  const overview = data?.overview || {};
  const hasData = data?.has_data;
  const equityCurve = data?.equity_curve || [];
  const dailyPnl = data?.daily_pnl || [];
  const winLossDist = data?.win_loss_distribution || [];
  const strategyPerf = data?.strategy_performance || [];
  const instrumentPerf = data?.instrument_performance || [];

  const isProfitable = (overview.total_pnl || 0) >= 0;

  if (!hasData) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Insufficient trade data"
        description="Analytics require closed trades with realized P&L to calculate statistical edge, win rates, and curves. Log some trades to unlock insights."
      />
    );
  }

  const PIE_COLORS = ['#10B981', '#F43F5E', '#94A3B8'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Performance Analytics &amp; Edge
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deep quantitative metrics and visualizations generated strictly from your database history.
        </p>
      </div>

      {/* Key Ratios Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Realized P&L"
          value={formatCurrency(overview.total_pnl, true)}
          subtitle={`${overview.closed_trades} closed executions`}
          icon={DollarSign}
          variant={isProfitable ? 'profit' : 'loss'}
        />
        <StatCard
          title="Win Rate"
          value={`${overview.win_rate}%`}
          subtitle={`Loss Rate: ${overview.loss_rate}%`}
          icon={Percent}
          variant={overview.win_rate >= 50 ? 'profit' : 'neutral'}
        />
        <StatCard
          title="Profit Factor"
          value={overview.profit_factor || '0.00'}
          subtitle={`Gross Win: ₹${Number(overview.gross_profit).toLocaleString('en-IN')}`}
          icon={Scale}
          variant="accent"
        />
        <StatCard
          title="Average Win / Loss"
          value={`₹${Number(overview.avg_win).toFixed(0)} / ₹${Number(overview.avg_loss).toFixed(0)}`}
          subtitle="Average win vs average loss"
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="Largest Winning Trade"
          value={formatCurrency(overview.largest_win, true)}
          subtitle="Best single execution"
          icon={ArrowUpRight}
          variant="profit"
        />
        <StatCard
          title="Largest Losing Trade"
          value={formatCurrency(overview.largest_loss, true)}
          subtitle="Max single drawdown"
          icon={ArrowDownRight}
          variant="loss"
        />
        <StatCard
          title="Average P&L per Trade"
          value={formatCurrency(overview.avg_pnl, true)}
          subtitle="Expectancy per setup"
          icon={Award}
          variant={overview.avg_pnl >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          title="Average Risk:Reward"
          value={overview.avg_rr ? `1 : ${overview.avg_rr}` : '-'}
          subtitle="Planned risk-to-reward"
          icon={BarChart3}
          variant="default"
        />
      </div>

      {/* Charts Grid Row 1: Equity Curve & Win vs Loss */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Realized Equity Curve
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Cumulative growth of trading capital over time (₹).
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurve}>
                <defs>
                  <linearGradient id="analyticsEquityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isProfitable ? '#10B981' : '#F43F5E'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isProfitable ? '#10B981' : '#F43F5E'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#FFF' }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'P&L']}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative_pnl"
                  stroke={isProfitable ? '#10B981' : '#F43F5E'}
                  strokeWidth={2.5}
                  fill="url(#analyticsEquityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win vs Loss Distribution (1 col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Win vs Loss Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Breakdown of trade outcomes.
            </p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winLossDist}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {winLossDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#FFF' }}
                  formatter={(val, name, item) => [`${val} trades (₹${Number(item.payload.amount).toLocaleString('en-IN')})`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily P&L Bar Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Daily Realized P&amp;L
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Day-by-day aggregate profitability. Green indicates green days, red indicates red days.
        </p>
        <div className="h-64 w-full">
          {dailyPnl.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPnl}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#FFF' }}
                  formatter={(val, name, item) => [
                    `₹${Number(val).toLocaleString('en-IN')} (${item.payload.trades} trades)`,
                    'Day P&L'
                  ]}
                />
                <Bar dataKey="pnl">
                  {dailyPnl.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#F43F5E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No daily P&L data yet.
            </div>
          )}
        </div>
      </div>

      {/* Strategy & Instrument Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Performance by Strategy
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Which setups deliver the highest statistical expectancy?
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                  <th className="pb-2">Strategy</th>
                  <th className="pb-2 text-center">Trades</th>
                  <th className="pb-2 text-center">Win Rate</th>
                  <th className="pb-2 text-right">Net P&amp;L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {strategyPerf.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">{s.strategy}</td>
                    <td className="py-2.5 text-center text-slate-400">{s.total_trades}</td>
                    <td className="py-2.5 text-center text-emerald-500 font-bold">{s.win_rate}%</td>
                    <td className={`py-2.5 text-right font-bold ${s.total_pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {formatCurrency(s.total_pnl, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instrument Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Performance by Instrument
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Assets delivering your highest alpha.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                  <th className="pb-2">Instrument</th>
                  <th className="pb-2 text-center">Trades</th>
                  <th className="pb-2 text-center">Win Rate</th>
                  <th className="pb-2 text-right">Net P&amp;L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {instrumentPerf.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">{item.instrument}</td>
                    <td className="py-2.5 text-center text-slate-400">{item.total_trades}</td>
                    <td className="py-2.5 text-center text-emerald-500 font-bold">{item.win_rate}%</td>
                    <td className={`py-2.5 text-right font-bold ${item.total_pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {formatCurrency(item.total_pnl, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
