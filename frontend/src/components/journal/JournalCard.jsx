import React from 'react';
import { formatDateIST } from '../../utils/formatters';
import { Calendar, Tag, Lightbulb, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../common/Badge';

export const JournalCard = ({ journal, onEdit, onDelete }) => {
  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
              {journal.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                {formatDateIST(journal.journal_date)}
              </span>
              {journal.market && (
                <>
                  <span>•</span>
                  <span>{journal.market}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(journal)}
              title="Edit Entry"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(journal.id)}
              title="Delete Entry"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mood Badge */}
        {journal.mood && (
          <div className="mb-3">
            <Badge variant="neutral" size="sm">
              Mood: {journal.mood}
            </Badge>
          </div>
        )}

        {/* Notes */}
        {journal.notes && (
          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mb-3">
            {journal.notes}
          </p>
        )}

        {/* Key Lesson */}
        {journal.lesson && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <span className="font-semibold block mb-0.5">Key Takeaway:</span>
              <span>{journal.lesson}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
