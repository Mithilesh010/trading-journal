import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDateIST } from '../../utils/formatters';
import { Eye, Edit2, Trash2, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';

export const TradeTable = ({
  trades = [],
  onView,
  onEdit,
  onDelete,
  onAddNew
}) => {
  const [tradeToDelete, setTradeToDelete] = useState(null);

  if (!trades || trades.length === 0) {
    return (
      <EmptyState
        title="No trades found"
        description="No trades recorded yet or none match your current filters. Add your first trade to get started."
        actionText="Add New Trade"
        onAction={onAddNew}
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Date / Time</th>
              <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Instrument</th>
              <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Side</th>
              <th scope="col" className="px-4 py-3.5 whitespace-nowrap text-right">Entry</th>
              <th scope="col" className="px-4 py-3.5 whitespace-nowrap text-right">Exit</th>
              <th scope="col" className="px-4 py-3.5 whitespace-nowrap text-right">Qty</th>
              <th scope="col" className="px-4 py-3.5 whitespace-nowrap text-right">Realized P&amp;L</th>
              <th scope="col" className="px-4 py-3.5 whitespace-nowrap text-center">R:R</th>
              <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Strategy</th>
              <th scope="col" className="px-4 py-3.5 whitespace-nowrap text-center">Status</th>
              <th scope="col" className="px-4 py-3.5 whitespace-nowrap text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {trades.map((trade) => {
              const isWin = trade.pnl !== null && trade.pnl > 0;
              const isLoss = trade.pnl !== null && trade.pnl < 0;

              return (
                <tr
                  key={trade.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Date & Time */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {formatDateIST(trade.trade_date)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {trade.entry_time} {trade.exit_time && `→ ${trade.exit_time}`}
                    </div>
                  </td>

                  {/* Instrument */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900 dark:text-white">
                      {trade.instrument}
                      {trade.has_screenshot && (
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-500" title="Screenshot attached" />
                      )}
                    </div>
                    {trade.setup && (
                      <span className="text-[11px] text-slate-400 block truncate max-w-[120px]">
                        {trade.setup}
                      </span>
                    )}
                  </td>

                  {/* Side */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge variant={trade.side === 'BUY' ? 'buy' : 'sell'} size="sm">
                      {trade.side}
                    </Badge>
                  </td>

                  {/* Entry Price */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-medium">
                    ₹{Number(trade.entry_price).toFixed(2)}
                  </td>

                  {/* Exit Price */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-medium">
                    {trade.exit_price ? `₹${Number(trade.exit_price).toFixed(2)}` : '-'}
                  </td>

                  {/* Quantity */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono text-slate-700 dark:text-slate-300">
                    {trade.quantity}
                  </td>

                  {/* Realized P&L */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-bold">
                    {trade.pnl !== null ? (
                      <span className={isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-slate-400'}>
                        {formatCurrency(trade.pnl, true)}
                      </span>
                    ) : (
                      <span className="text-amber-500/90 text-xs font-normal">Active</span>
                    )}
                  </td>

                  {/* R:R */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-center font-mono text-xs">
                    {trade.rr_ratio ? (
                      <span className="text-emerald-500 font-semibold">1:{trade.rr_ratio}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Strategy */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                    {trade.strategy || '-'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-center">
                    <Badge variant={trade.status === 'Closed' ? 'closed' : 'open'} size="sm">
                      {trade.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onView(trade)}
                        title="View Details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(trade)}
                        title="Edit Trade"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setTradeToDelete(trade)}
                        title="Delete Trade"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!tradeToDelete}
        onClose={() => setTradeToDelete(null)}
        title="Confirm Trade Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Are you sure you want to delete this trade?</p>
              <p className="mt-1 text-xs opacity-90">
                Instrument: <strong>{tradeToDelete?.instrument}</strong> ({tradeToDelete?.side}) on {tradeToDelete?.trade_date}.
                This action cannot be undone and will permanently remove this record from your database.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setTradeToDelete(null)}
              type="button"
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const id = tradeToDelete.id;
                setTradeToDelete(null);
                onDelete(id);
              }}
              type="button"
              className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-500 shadow-sm"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
