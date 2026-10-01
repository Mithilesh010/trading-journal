import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatDateIST } from '../../utils/formatters';
import { Calendar, Clock, Target, Layers, FileText } from 'lucide-react';

export const TradeDetailModal = ({ isOpen, onClose, trade }) => {
  if (!trade) return null;
  const isIndian = (trade.market_type || 'Indian Market') === 'Indian Market';
  const pos = (trade.position || trade.side || 'BUY').toUpperCase();
  const isTp = trade.status === 'TP Hit';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Trade Details — ${trade.instrument}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header Card */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <Badge variant={pos === 'BUY' ? 'buy' : 'sell'} size="lg">
              {pos}
            </Badge>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500">
                {trade.market_type || 'Indian Market'}
              </span>
              <h2 className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {trade.instrument}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDateIST(trade.trade_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {trade.entry_time}
                  {trade.exit_time ? ` → ${trade.exit_time}` : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block mb-1">Result / Status</span>
            <Badge variant={isTp ? 'tp' : 'sl'} size="lg">
              {trade.status}
            </Badge>
          </div>
        </div>

        {/* Trade Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isIndian ? (
            <MetricCard label="Quantity" value={trade.quantity != null ? trade.quantity : '-'} />
          ) : (
            <>
              <MetricCard label="Lot Size" value={trade.lot_size != null ? trade.lot_size : '-'} />
              <MetricCard label="Lots" value={trade.lots != null ? trade.lots : '-'} />
            </>
          )}
          <MetricCard label="R:R" value={trade.rr || '-'} accent />
          <MetricCard label="Position" value={pos} />
        </div>

        {/* Strategy Section */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            Strategy
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {trade.strategy || <span className="text-slate-400 italic">No specific strategy noted.</span>}
          </p>
        </div>

        {/* Trading Notes Section */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            Trading Notes
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {trade.notes || <span className="text-slate-400 italic">No trading notes added for this execution.</span>}
          </p>
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

const MetricCard = ({ label, value, accent = false }) => (
  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
    <span className="text-xs text-slate-400 block mb-1">{label}</span>
    <span className={`text-base font-bold font-mono ${accent ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
      {value}
    </span>
  </div>
);
