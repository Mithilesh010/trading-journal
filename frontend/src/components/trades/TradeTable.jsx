import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { formatDateIST } from '../../utils/formatters';
import { Eye, Edit2, Trash2, AlertTriangle, FileText } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';

export const TradeTable = ({ trades = [], onView, onEdit, onDelete, onAddNew }) => {
  const [tradeToDelete, setTradeToDelete] = useState(null);

  if (!trades.length) {
    return (
      <EmptyState
        title="No trades found"
        description="No trades recorded yet or none match your current filters."
        actionText="Record New Trade"
        onAction={onAddNew}
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3.5 whitespace-nowrap">Date / Time</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Market</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Instrument</th>
              <th className="px-4 py-3.5 text-center whitespace-nowrap">Position</th>
              <th className="px-4 py-3.5 text-right whitespace-nowrap">Qty / Lot Size</th>
              <th className="px-4 py-3.5 text-right whitespace-nowrap">Lots</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Strategy</th>
              <th className="px-4 py-3.5 text-center whitespace-nowrap">R:R</th>
              <th className="px-4 py-3.5 text-center whitespace-nowrap">Status</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Trading Notes</th>
              <th className="px-4 py-3.5 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {trades.map((t) => {
              const isIndian = (t.market_type || 'Indian Market') === 'Indian Market';
              const pos = (t.position || t.side || 'BUY').toUpperCase();
              const isTp = t.status === 'TP Hit';

              return (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Date / Time */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {formatDateIST(t.trade_date)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {t.entry_time}
                      {t.exit_time ? ` → ${t.exit_time}` : ''}
                    </div>
                  </td>

                  {/* Market */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {t.market_type || 'Indian Market'}
                    </span>
                  </td>

                  {/* Instrument */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-bold font-mono text-slate-900 dark:text-white">
                    {t.instrument}
                  </td>

                  {/* Position */}
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <Badge variant={pos === 'BUY' ? 'buy' : 'sell'} size="sm">
                      {pos}
                    </Badge>
                  </td>

                  {/* Qty / Lot Size */}
                  <td className="px-4 py-3.5 text-right font-mono font-medium whitespace-nowrap">
                    {isIndian ? (
                      <span>{t.quantity != null ? t.quantity : '-'}</span>
                    ) : (
                      <span>{t.lot_size != null ? t.lot_size : '-'}</span>
                    )}
                  </td>

                  {/* Lots */}
                  <td className="px-4 py-3.5 text-right font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {isIndian ? '-' : t.lots != null ? t.lots : '-'}
                  </td>

                  {/* Strategy */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                    {t.strategy || <span className="text-slate-400">-</span>}
                  </td>

                  {/* R:R */}
                  <td className="px-4 py-3.5 text-center font-mono font-semibold text-emerald-500 whitespace-nowrap">
                    {t.rr || '-'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <Badge variant={isTp ? 'tp' : 'sl'} size="sm">
                      {t.status}
                    </Badge>
                  </td>

                  {/* Trading Notes */}
                  <td className="px-4 py-3.5 max-w-[200px] truncate text-xs text-slate-500 dark:text-slate-400" title={t.notes || ''}>
                    {t.notes ? (
                      <span className="truncate block">{t.notes}</span>
                    ) : (
                      <span className="text-slate-400 italic">No notes</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onView(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Trade Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Trade"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setTradeToDelete(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete Trade"
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
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Are you sure you want to delete this trade?</p>
              <p className="mt-1 text-xs text-rose-500/80">
                This will delete the {tradeToDelete?.instrument} ({tradeToDelete?.market_type}) record permanently.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setTradeToDelete(null)}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (tradeToDelete) {
                  await onDelete(tradeToDelete.id);
                  setTradeToDelete(null);
                }
              }}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all"
            >
              Delete Trade
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
