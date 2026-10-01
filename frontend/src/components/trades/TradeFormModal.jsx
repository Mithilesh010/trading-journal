import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { AlertCircle, Target, ShieldAlert } from 'lucide-react';

const MARKET_TYPES = ['Indian Market', 'Crypto Market', 'Commodity Market', 'Forex Market'];

export const TradeFormModal = ({ isOpen, onClose, onSave, initialData = null, isSubmitting = false }) => {
  const blankForm = {
    trade_date: new Date().toISOString().slice(0, 10),
    entry_time: '09:30',
    exit_time: '',
    market_type: 'Indian Market',
    instrument: '',
    side: 'BUY',
    quantity: '',
    lot_size: '',
    lots: '',
    strategy: '',
    notes: '',
    rr: '1:2',
    status: 'TP Hit',
  };

  const [formData, setFormData] = useState(blankForm);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setFormData({
        ...blankForm,
        ...initialData,
        trade_date: initialData.trade_date ? initialData.trade_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        entry_time: initialData.entry_time || '09:30',
        exit_time: initialData.exit_time || '',
        market_type: initialData.market_type || 'Indian Market',
        instrument: initialData.instrument || '',
        side: (initialData.position || initialData.side || 'BUY').toUpperCase(),
        quantity: initialData.quantity ?? '',
        lot_size: initialData.lot_size ?? '',
        lots: initialData.lots ?? '',
        strategy: initialData.strategy || '',
        notes: initialData.notes || '',
        rr: initialData.rr || '1:2',
        status: (initialData.status === 'SL Hit' || initialData.status === 'Open' || initialData.status === 'loss') ? 'SL Hit' : 'TP Hit',
      });
    } else {
      setFormData(blankForm);
    }
    setValidationError('');
  }, [initialData, isOpen]);

  const isIndian = formData.market_type === 'Indian Market';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMarketChange = (e) => {
    const market_type = e.target.value;
    setFormData((prev) => ({
      ...prev,
      market_type,
      quantity: market_type === 'Indian Market' ? prev.quantity : '',
      lot_size: market_type === 'Indian Market' ? '' : prev.lot_size,
      lots: market_type === 'Indian Market' ? '' : prev.lots,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.trade_date) {
      return setValidationError('Date is required.');
    }
    if (!formData.entry_time) {
      return setValidationError('Entry Time is required.');
    }
    if (!formData.market_type) {
      return setValidationError('Market Type is required.');
    }
    if (!formData.instrument.trim()) {
      return setValidationError('Instrument is required (e.g. NIFTY, BTC, XAUUSD).');
    }
    if (!['BUY', 'SELL'].includes(formData.side)) {
      return setValidationError('Position must be either BUY or SELL.');
    }

    if (isIndian) {
      const q = parseFloat(formData.quantity);
      if (!Number.isFinite(q) || q <= 0) {
        return setValidationError('Quantity must be greater than 0 for Indian Market.');
      }
    } else {
      const ls = parseFloat(formData.lot_size);
      const l = parseFloat(formData.lots);
      if (!Number.isFinite(ls) || ls <= 0) {
        return setValidationError(`Lot Size must be greater than 0 for ${formData.market_type}.`);
      }
      if (!Number.isFinite(l) || l <= 0) {
        return setValidationError(`Lots must be greater than 0 for ${formData.market_type}.`);
      }
    }

    if (!formData.rr.trim()) {
      return setValidationError('R:R is required (e.g. 1:1, 1:1.5, 1:2, 1:3).');
    }

    if (!['TP Hit', 'SL Hit'].includes(formData.status)) {
      return setValidationError('Result / Status must be either TP Hit or SL Hit.');
    }

    const payload = {
      trade_date: formData.trade_date,
      entry_time: formData.entry_time,
      exit_time: formData.exit_time || null,
      market_type: formData.market_type,
      instrument: formData.instrument.trim().toUpperCase(),
      position: formData.side,
      side: formData.side,
      strategy: formData.strategy.trim(),
      notes: formData.notes.trim(),
      rr: formData.rr.trim(),
      status: formData.status,
    };

    if (isIndian) {
      payload.quantity = parseFloat(formData.quantity);
      payload.lot_size = null;
      payload.lots = null;
    } else {
      payload.quantity = null;
      payload.lot_size = parseFloat(formData.lot_size);
      payload.lots = parseFloat(formData.lots);
    }

    onSave(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Trade Entry' : 'New Record Trade'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {validationError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 1. Date, Entry Time, Exit Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="1. Date *">
            <input
              type="date"
              name="trade_date"
              required
              value={formData.trade_date}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>
          <Field label="2. Entry Time *">
            <input
              type="time"
              name="entry_time"
              required
              value={formData.entry_time}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>
          <Field label="3. Exit Time">
            <input
              type="time"
              name="exit_time"
              value={formData.exit_time}
              onChange={handleChange}
              placeholder="HH:MM"
              className={inputClass}
            />
          </Field>
        </div>

        {/* 2. Market Type & Instrument */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="4. Market Type *">
            <select
              name="market_type"
              value={formData.market_type}
              onChange={handleMarketChange}
              className={inputClass}
            >
              {MARKET_TYPES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>

          <Field label="5. Instrument *">
            <input
              type="text"
              name="instrument"
              required
              value={formData.instrument}
              onChange={handleChange}
              placeholder="e.g. NIFTY, BANKNIFTY, BTC, ETH, XAUUSD, XAUT, EURUSD"
              className={`${inputClass} uppercase`}
            />
          </Field>
        </div>

        {/* 3. Position (BUY / SELL only) & Position Size (Dynamic) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="6. Position *">
            <div className="grid grid-cols-2 gap-2 h-[42px]">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, side: 'BUY' }))}
                className={`flex items-center justify-center font-bold text-xs rounded-xl border transition-all ${
                  formData.side === 'BUY'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, side: 'SELL' }))}
                className={`flex items-center justify-center font-bold text-xs rounded-xl border transition-all ${
                  formData.side === 'SELL'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                SELL
              </button>
            </div>
          </Field>

          {isIndian ? (
            <Field label="7. Position Size (Quantity) *" className="sm:col-span-2">
              <input
                type="number"
                step="any"
                min="0.0001"
                name="quantity"
                required
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g. 50, 100"
                className={`${inputClass} font-mono`}
              />
            </Field>
          ) : (
            <>
              <Field label="7a. Lot Size *">
                <input
                  type="number"
                  step="any"
                  min="0.000001"
                  name="lot_size"
                  required
                  value={formData.lot_size}
                  onChange={handleChange}
                  placeholder="e.g. 0.001, 100"
                  className={`${inputClass} font-mono`}
                />
              </Field>
              <Field label="7b. Lots *">
                <input
                  type="number"
                  step="any"
                  min="0.000001"
                  name="lots"
                  required
                  value={formData.lots}
                  onChange={handleChange}
                  placeholder="e.g. 1, 5, 10"
                  className={`${inputClass} font-mono`}
                />
              </Field>
            </>
          )}
        </div>

        {/* 4. Strategy, R:R, Result / Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="8. Strategy (Optional)">
            <input
              type="text"
              name="strategy"
              value={formData.strategy}
              onChange={handleChange}
              placeholder="e.g. Breakout, EMA Pullback"
              className={inputClass}
            />
          </Field>

          <Field label="10. R:R * (Manual)">
            <input
              type="text"
              name="rr"
              required
              value={formData.rr}
              onChange={handleChange}
              placeholder="e.g. 1:1, 1:1.5, 1:2, 1:3"
              className={`${inputClass} font-mono`}
            />
          </Field>

          <Field label="11. Result / Status *">
            <div className="grid grid-cols-2 gap-2 h-[42px]">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, status: 'TP Hit' }))}
                className={`flex items-center justify-center gap-1.5 font-bold text-xs rounded-xl border transition-all ${
                  formData.status === 'TP Hit'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                TP Hit
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, status: 'SL Hit' }))}
                className={`flex items-center justify-center gap-1.5 font-bold text-xs rounded-xl border transition-all ${
                  formData.status === 'SL Hit'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                SL Hit
              </button>
            </div>
          </Field>
        </div>

        {/* 5. Trading Notes */}
        <div>
          <Field label="9. Trading Notes (Free text trade reasoning & reflections)">
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter your complete trade reasoning, market conditions, or reflections here..."
              className={inputClass}
            />
          </Field>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Saving Trade...' : initialData ? 'Update Trade' : 'Save Trade'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const inputClass =
  'w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all';

const Field = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);
