import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Upload, X, AlertCircle, Calculator, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const TradeFormModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    trade_date: new Date().toISOString().slice(0, 10),
    entry_time: '09:30',
    exit_time: '',
    instrument: '',
    side: 'BUY',
    quantity: '',
    entry_price: '',
    exit_price: '',
    stop_loss: '',
    target: '',
    strategy: '',
    setup: '',
    entry_reason: '',
    exit_reason: '',
    notes: '',
    status: 'Open'
  });

  const [screenshotFile, setScreenshotFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeScreenshot, setRemoveScreenshot] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        trade_date: initialData.trade_date || new Date().toISOString().slice(0, 10),
        entry_time: initialData.entry_time || '09:30',
        exit_time: initialData.exit_time || '',
        instrument: initialData.instrument || '',
        side: initialData.side || 'BUY',
        quantity: initialData.quantity || '',
        entry_price: initialData.entry_price || '',
        exit_price: initialData.exit_price !== null && initialData.exit_price !== undefined ? initialData.exit_price : '',
        stop_loss: initialData.stop_loss !== null && initialData.stop_loss !== undefined ? initialData.stop_loss : '',
        target: initialData.target !== null && initialData.target !== undefined ? initialData.target : '',
        strategy: initialData.strategy || '',
        setup: initialData.setup || '',
        entry_reason: initialData.entry_reason || '',
        exit_reason: initialData.exit_reason || '',
        notes: initialData.notes || '',
        status: initialData.status || 'Open'
      });
      setRemoveScreenshot(false);
      setScreenshotFile(null);
      setPreviewUrl(null);
    } else {
      setFormData({
        trade_date: new Date().toISOString().slice(0, 10),
        entry_time: '09:30',
        exit_time: '',
        instrument: '',
        side: 'BUY',
        quantity: '',
        entry_price: '',
        exit_price: '',
        stop_loss: '',
        target: '',
        strategy: '',
        setup: '',
        entry_reason: '',
        exit_reason: '',
        notes: '',
        status: 'Open'
      });
      setScreenshotFile(null);
      setPreviewUrl(null);
      setRemoveScreenshot(false);
    }
    setValidationError('');
  }, [initialData, isOpen]);

  // Live P&L calculation
  const calcPnl = () => {
    const qty = parseFloat(formData.quantity);
    const entry = parseFloat(formData.entry_price);
    const exit = parseFloat(formData.exit_price);
    if (!qty || !entry || !exit || isNaN(qty) || isNaN(entry) || isNaN(exit)) return null;

    if (formData.side === 'BUY') {
      return (exit - entry) * qty;
    } else {
      return (entry - exit) * qty;
    }
  };

  // Live Risk calculation
  const calcRisk = () => {
    const entry = parseFloat(formData.entry_price);
    const sl = parseFloat(formData.stop_loss);
    if (!entry || !sl || isNaN(entry) || isNaN(sl)) return null;

    if (formData.side === 'BUY') {
      return Math.max(0, entry - sl);
    } else {
      return Math.max(0, sl - entry);
    }
  };

  // Live Reward calculation
  const calcReward = () => {
    const entry = parseFloat(formData.entry_price);
    const tgt = parseFloat(formData.target);
    if (!entry || !tgt || isNaN(entry) || isNaN(tgt)) return null;

    if (formData.side === 'BUY') {
      return Math.max(0, tgt - entry);
    } else {
      return Math.max(0, entry - tgt);
    }
  };

  const riskVal = calcRisk();
  const rewardVal = calcReward();
  const rrRatio = riskVal && riskVal > 0 && rewardVal !== null ? (rewardVal / riskVal).toFixed(2) : null;
  const pnlVal = calcPnl();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-set status: If exit price and exit time are present, default to Closed
      if (name === 'exit_price' || name === 'exit_time') {
        const exitP = name === 'exit_price' ? value : updated.exit_price;
        const exitT = name === 'exit_time' ? value : updated.exit_time;
        if (exitP && exitT) {
          updated.status = 'Closed';
        }
      }
      return updated;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setValidationError('Only JPG, PNG, or WEBP images are allowed.');
        return;
      }
      if (file.size > 16 * 1024 * 1024) {
        setValidationError('Screenshot must be smaller than 16MB.');
        return;
      }
      setValidationError('');
      setScreenshotFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemoveScreenshot(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Validations
    if (!formData.instrument.trim()) {
      setValidationError('Instrument name is required (e.g. NIFTY 24000 CE, BTC/USDT).');
      return;
    }
    const qty = parseFloat(formData.quantity);
    if (!qty || qty <= 0) {
      setValidationError('Quantity must be greater than 0.');
      return;
    }
    const entryPrice = parseFloat(formData.entry_price);
    if (!entryPrice || entryPrice <= 0) {
      setValidationError('Entry Price must be greater than 0.');
      return;
    }
    if (formData.status === 'Closed') {
      const exitPrice = parseFloat(formData.exit_price);
      if (!exitPrice || exitPrice <= 0) {
        setValidationError('Exit Price is required for a Closed trade.');
        return;
      }
    }

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') {
        submissionData.append(key, val);
      }
    });

    if (screenshotFile) {
      submissionData.append('screenshot', screenshotFile);
    }
    if (removeScreenshot) {
      submissionData.append('remove_screenshot', 'true');
    }

    onSave(submissionData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Trade Entry' : 'Record New Trade'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {validationError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Live Calculation Preview Banner */}
        <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <Calculator className="w-4 h-4 text-emerald-500" />
            Live Financial Preview
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Estimated Risk</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {riskVal !== null ? `₹${riskVal.toFixed(2)}` : '-'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Estimated Reward</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {rewardVal !== null ? `₹${rewardVal.toFixed(2)}` : '-'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Risk:Reward</span>
              <span className="font-mono font-bold text-emerald-500">
                {rrRatio ? `1 : ${rrRatio}` : '-'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Realized P&L</span>
              <span className={`font-mono font-bold ${pnlVal !== null ? (pnlVal >= 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-400'}`}>
                {pnlVal !== null ? formatCurrency(pnlVal, true) : (formData.status === 'Open' ? 'Active (Open)' : '-')}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Execution Details */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Execution &amp; Instrument
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="trade_date"
                required
                value={formData.trade_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Entry Time */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Entry Time *
              </label>
              <input
                type="text"
                name="entry_time"
                placeholder="09:30"
                required
                value={formData.entry_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Exit Time */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Exit Time (Optional)
              </label>
              <input
                type="text"
                name="exit_time"
                placeholder="11:15"
                value={formData.exit_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Instrument */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Instrument *
              </label>
              <input
                type="text"
                name="instrument"
                placeholder="e.g. NIFTY 24000 CE, BTC/USDT, RELIANCE"
                required
                value={formData.instrument}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 uppercase"
              />
            </div>

            {/* Side */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Side *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, side: 'BUY' }))}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                    formData.side === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, side: 'SELL' }))}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                    formData.side === 'SELL'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Numbers & Targets */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Prices, Quantities &amp; Risk Parameters
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                step="any"
                name="quantity"
                placeholder="50"
                required
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* Entry Price */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Entry Price *
              </label>
              <input
                type="number"
                step="any"
                name="entry_price"
                placeholder="24000.00"
                required
                value={formData.entry_price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* Exit Price */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Exit Price {formData.status === 'Closed' && '*'}
              </label>
              <input
                type="number"
                step="any"
                name="exit_price"
                placeholder="24250.00"
                value={formData.exit_price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* Stop Loss */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Stop Loss (SL)
              </label>
              <input
                type="number"
                step="any"
                name="stop_loss"
                placeholder="23900.00"
                value={formData.stop_loss}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* Target */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target (TP)
              </label>
              <input
                type="number"
                step="any"
                name="target"
                placeholder="24300.00"
                value={formData.target}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Open">Open (Active)</option>
                <option value="Closed">Closed (Realized)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Strategy & Reasons */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Strategy, Setup &amp; Analysis
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Strategy
              </label>
              <input
                type="text"
                name="strategy"
                placeholder="e.g. Breakout, Mean Reversion, Trend Following"
                value={formData.strategy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Setup
              </label>
              <input
                type="text"
                name="setup"
                placeholder="e.g. 15m ORB, Bull Flag, Demand Zone"
                value={formData.setup}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Entry Reason
              </label>
              <textarea
                name="entry_reason"
                rows="2"
                placeholder="What triggered this entry signal?"
                value={formData.entry_reason}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Exit Reason
              </label>
              <textarea
                name="exit_reason"
                rows="2"
                placeholder="Why was the trade closed? Hit TP, SL trailing, or manual exit?"
                value={formData.exit_reason}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Trading Notes &amp; Observations
              </label>
              <textarea
                name="notes"
                rows="2"
                placeholder="Discipline notes, market context, psychological feelings..."
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Screenshot Upload */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Chart Screenshot
          </h4>
          <div className="flex flex-col gap-3">
            {/* Upload drop area */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-emerald-500/50 transition-colors">
              <input
                type="file"
                id="screenshot-upload"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="screenshot-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {screenshotFile ? screenshotFile.name : 'Click to select chart image (PNG, JPG, WEBP up to 16MB)'}
                </span>
              </label>
            </div>

            {/* Preview */}
            {(previewUrl || (initialData?.has_screenshot && !removeScreenshot)) && (
              <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                  {screenshotFile ? `New image selected: ${screenshotFile.name}` : 'Existing chart screenshot attached'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setScreenshotFile(null);
                    setPreviewUrl(null);
                    if (initialData?.has_screenshot) {
                      setRemoveScreenshot(true);
                    }
                  }}
                  className="p-1 rounded text-rose-500 hover:bg-rose-500/10 text-xs font-medium"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Trade' : 'Save Trade'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
