import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  BarChart3,
  TrendingUp,
  Percent,
  Award,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity
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

const MARKETS = ['All Markets', 'Indian Market', 'Crypto Market', 'Commodity Market', 'Forex Market'];

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [market, setMarket] = useState('All Markets');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics(market === 'All Markets' ? '' : market);
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
  }, [market]);

  if (loading) {
    return <LoadingSpinner text="Computing performance analytics..." />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
        {error}
      </div>
    );
  }

  const overview = data?.overview || {};
  const hasData = data?.has_data;
  const trendChart = data?.trend_chart || [];
  const winLossDist = data?.win_loss_distribution || [];
  const strategyPerf = data?.strategy_performance || [];
  const instrumentPerf = data?.instrument_performance || [];
  const marketPerf = data?.market_performance || [];

  if (!hasData) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Performance Analytics &amp; Edge
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Analyze your execution win rates, TP/SL ratio, and strategic edge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            {MARKETS.map((m) => (
              <button
                key={m}
                onClick={() => setMarket(m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  market === m
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <EmptyState
          icon={BarChart3}
          title={`No trade data found in ${market}`}
          description="Log some trades in this market to calculate Win Rate, TP vs SL hits, and R:R analytics."
        />
      </div>
    );
  }

  const PIE_COLORS = ['#10B981', '#F43F5E'];

  return (
    <div className="space-y-8">
      {/* Header & Market Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Performance Analytics &amp; Edge
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Metrics computed from your saved trades in <span className="font-semibold text-emerald-500">{market}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          {MARKETS.map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                market === m
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Key Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Win Rate"
          value={`${overview.win_rate || 0}%`}
          subtitle={`${overview.tp_hits || 0} TP Hit`}
          icon={Percent}
          variant={overview.win_rate >= 50 ? 'profit' : 'neutral'}
        />
        <StatCard
          title="Total Trades"
          value={overview.total_trades || 0}
          subtitle="Filtered executions"
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="TP Hit"
          value={overview.tp_hits || 0}
          subtitle="Target hit"
          icon={Award}
          variant="profit"
        />
        <StatCard
          title="SL Hit"
          value={overview.sl_hits || 0}
          subtitle="Stop loss hit"
          icon={AlertTriangle}
          variant="loss"
        />
        <StatCard
          title="Average R:R"
          value={overview.avg_rr ? `1 : ${overview.avg_rr}` : '-'}
          subtitle="Reward to Risk Ratio"
          icon={Activity}
          variant="default"
        />
        <StatCard
          title="Long / Short"
          value={`${overview.buy_trades || 0} / ${overview.sell_trades || 0}`}
          subtitle="BUY vs SELL"
          icon={ArrowUpRight}
          variant="neutral"
        />
      </div>

      {/* Visual Analytics Grid: Pie & Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outcome Distribution (Pie) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Outcome Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Proportion of TP Hit vs SL Hit trades.
            </p>
          </div>

          <div className="h-60 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winLossDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {winLossDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    color: '#F9FAFB',
                    fontSize: '12px'
                  }}
                  formatter={(val, name) => [`${val} trades`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-400 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">TP Hit</span>
              <span className="text-base font-bold font-mono text-emerald-500">{overview.tp_hits || 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10">
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block">SL Hit</span>
              <span className="text-base font-bold font-mono text-rose-500">{overview.sl_hits || 0}</span>
            </div>
          </div>
        </div>

        {/* Win Rate Progression Trend (Area) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Win Rate Progression Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cumulative progression of your Win Rate (%) across trades over time.
            </p>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
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
                  fill="url(#analyticsTrendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown by Strategy & Breakdown by Instrument */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edge by Strategy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Win Rate and R:R performance grouped by trading setup/strategy.
              </p>
            </div>
            <span className="text-xs text-slate-400">{strategyPerf.length} Strategies</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="pb-2">Strategy</th>
                  <th className="pb-2 text-center">Trades</th>
                  <th className="pb-2 text-center">TP Hit</th>
                  <th className="pb-2 text-center">SL Hit</th>
                  <th className="pb-2 text-right">Win Rate</th>
                  <th className="pb-2 text-right">Avg R:R</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {strategyPerf.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 font-sans font-medium text-slate-900 dark:text-white">
                      {s.strategy}
                    </td>
                    <td className="py-2.5 text-center">{s.total_trades}</td>
                    <td className="py-2.5 text-center text-emerald-500 font-semibold">{s.tp_hits}</td>
                    <td className="py-2.5 text-center text-rose-500 font-semibold">{s.sl_hits}</td>
                    <td className="py-2.5 text-right font-semibold text-emerald-500">
                      {s.win_rate}%
                    </td>
                    <td className="py-2.5 text-right text-slate-400">
                      {s.avg_rr ? `1:${s.avg_rr}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instrument Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edge by Instrument
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Win Rate performance categorized by traded asset or symbol.
              </p>
            </div>
            <span className="text-xs text-slate-400">{instrumentPerf.length} Instruments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="pb-2">Instrument</th>
                  <th className="pb-2 text-center">Trades</th>
                  <th className="pb-2 text-center">TP Hit</th>
                  <th className="pb-2 text-center">SL Hit</th>
                  <th className="pb-2 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {instrumentPerf.map((inst, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                      {inst.instrument}
                    </td>
                    <td className="py-2.5 text-center">{inst.total_trades}</td>
                    <td className="py-2.5 text-center text-emerald-500 font-semibold">{inst.tp_hits}</td>
                    <td className="py-2.5 text-center text-rose-500 font-semibold">{inst.sl_hits}</td>
                    <td className="py-2.5 text-right font-semibold text-emerald-500">
                      {inst.win_rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Market Performance Overview (All 4 Markets Comparison) */}
      {marketPerf.length > 0 && market === 'All Markets' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Market Comparison Overview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparative execution stats across Indian, Crypto, Commodity, and Forex markets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketPerf.map((m) => (
              <div
                key={m.market_type}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    {m.market_type}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {m.total_trades} trades
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-slate-400">Win Rate</span>
                  <span className="text-lg font-bold font-mono text-emerald-500">
                    {m.win_rate}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono">
                  <span className="text-emerald-500">TP: {m.tp_hits}</span>
                  <span className="text-rose-500 text-right">SL: {m.sl_hits}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
