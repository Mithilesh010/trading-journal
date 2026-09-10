import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDateIST } from '../../utils/formatters';
import { api } from '../../services/api';
import { Image, ExternalLink, Calendar, Clock, Target, ShieldAlert, ArrowRight } from 'lucide-react';

export const TradeDetailModal = ({ isOpen, onClose, trade }) => {
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);

  useEffect(() => {
    let active = true;
    if (isOpen && trade && trade.has_screenshot) {
      setLoadingImg(true);
      api.getTradeScreenshotBlobUrl(trade.id)
        .then((url) => {
          if (active) setScreenshotUrl(url);
        })
        .catch(() => {
          if (active) setScreenshotUrl(null);
        })
        .finally(() => {
          if (active) setLoadingImg(false);
        });
    } else {
      setScreenshotUrl(null);
    }
    return () => {
      active = false;
      if (screenshotUrl) {
        URL.revokeObjectURL(screenshotUrl);
      }
    };
  }, [isOpen, trade]);

  if (!trade) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Trade Analysis - ${trade.instrument}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <Badge variant={trade.side === 'BUY' ? 'buy' : 'sell'} size="lg">
              {trade.side}
            </Badge>
            <div>
              <h2 className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {trade.instrument}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateIST(trade.trade_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {trade.entry_time} {trade.exit_time && `→ ${trade.exit_time}`}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wider">
              {trade.status === 'Closed' ? 'Realized P&L' : 'Status'}
            </div>
            {trade.status === 'Closed' && trade.pnl !== null ? (
              <span className={`text-xl font-bold font-mono ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatCurrency(trade.pnl, true)}
              </span>
            ) : (
              <Badge variant="open" size="md">
                Active (Open)
              </Badge>
            )}
          </div>
        </div>

        {/* Execution Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <span className="text-xs text-slate-400 block">Quantity</span>
            <span className="text-base font-semibold font-mono text-slate-800 dark:text-slate-200">
              {trade.quantity}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <span className="text-xs text-slate-400 block">Entry Price</span>
            <span className="text-base font-semibold font-mono text-slate-800 dark:text-slate-200">
              ₹{Number(trade.entry_price).toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <span className="text-xs text-slate-400 block">Exit Price</span>
            <span className="text-base font-semibold font-mono text-slate-800 dark:text-slate-200">
              {trade.exit_price ? `₹${Number(trade.exit_price).toFixed(2)}` : '-'}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <span className="text-xs text-slate-400 block">Risk:Reward</span>
            <span className="text-base font-semibold font-mono text-emerald-500">
              {trade.rr_ratio ? `1 : ${trade.rr_ratio}` : '-'}
            </span>
          </div>
        </div>

        {/* Risk & Target details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <span className="text-xs text-slate-400 block">Stop Loss</span>
            <span className="text-sm font-semibold font-mono text-rose-500">
              {trade.stop_loss ? `₹${Number(trade.stop_loss).toFixed(2)}` : '-'}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <span className="text-xs text-slate-400 block">Target (TP)</span>
            <span className="text-sm font-semibold font-mono text-emerald-500">
              {trade.target ? `₹${Number(trade.target).toFixed(2)}` : '-'}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <span className="text-xs text-slate-400 block">Risk / Unit</span>
            <span className="text-sm font-semibold font-mono text-slate-700 dark:text-slate-300">
              {trade.risk ? `₹${Number(trade.risk).toFixed(2)}` : '-'}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <span className="text-xs text-slate-400 block">Reward / Unit</span>
            <span className="text-sm font-semibold font-mono text-slate-700 dark:text-slate-300">
              {trade.reward ? `₹${Number(trade.reward).toFixed(2)}` : '-'}
            </span>
          </div>
        </div>

        {/* Strategy & Setup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-400 block mb-1">Strategy</span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {trade.strategy || 'Not specified'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-400 block mb-1">Setup</span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {trade.setup || 'Not specified'}
            </p>
          </div>
        </div>

        {/* Reasons & Notes */}
        <div className="space-y-3">
          {trade.entry_reason && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-400 block mb-1">Entry Reason</span>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {trade.entry_reason}
              </p>
            </div>
          )}
          {trade.exit_reason && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-400 block mb-1">Exit Reason</span>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {trade.exit_reason}
              </p>
            </div>
          )}
          {trade.notes && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-400 block mb-1">Trading Notes</span>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {trade.notes}
              </p>
            </div>
          )}
        </div>

        {/* Chart Screenshot Section */}
        {trade.has_screenshot && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Execution Screenshot
            </span>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-black/5 dark:bg-black/30 max-h-[350px] flex items-center justify-center">
              {loadingImg ? (
                <div className="p-8 text-xs text-slate-400">Loading screenshot securely...</div>
              ) : screenshotUrl ? (
                <img
                  src={screenshotUrl}
                  alt={`Screenshot for ${trade.instrument}`}
                  className="w-full h-auto object-contain max-h-[350px]"
                />
              ) : (
                <div className="p-8 text-xs text-slate-400">Unable to load screenshot</div>
              )}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
