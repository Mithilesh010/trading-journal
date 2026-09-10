import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { FileSpreadsheet, FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const ExportModal = ({ isOpen, onClose }) => {
  const [range, setRange] = useState('all');
  const [format, setFormat] = useState('excel');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setError('');
    setSuccess(false);
    try {
      if (format === 'excel') {
        await api.exportExcel(range);
      } else {
        await api.exportPdf(range);
      }
      setSuccess(true);
      setTimeout(() => {
        setIsExporting(false);
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Export failed. Please try again.');
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Trading Journal"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Export generated successfully! Download started.</span>
          </div>
        )}

        {/* Range Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Select Date Range
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '15days', label: 'Last 15 Days' },
              { id: '1month', label: 'Last 1 Month' },
              { id: 'all', label: 'All Trades' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRange(opt.id)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  range === opt.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Select File Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('excel')}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                format === 'excel'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">Microsoft Excel</div>
                <div className="text-[11px] opacity-70">.xlsx format</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                format === 'pdf'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">PDF Document</div>
                <div className="text-[11px] opacity-70">Landscape report</div>
              </div>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Exports are generated securely from your personal account data only. No other user's trade data can ever be included.
        </p>

        {/* Buttons */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating...' : 'Download Export'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
