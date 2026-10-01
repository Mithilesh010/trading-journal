import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { AlertCircle } from 'lucide-react';

const COMMON_MOODS = [
  'Disciplined',
  'Calm & Focused',
  'Confident',
  'Patient',
  'Anxious',
  'FOMO',
  'Frustrated',
  'Hesitant',
  'Overconfident'
];

const MARKETS = [
  'Indian Equities (NSE/BSE)',
  'NIFTY / BANKNIFTY Options',
  'Crypto / Derivatives',
  'Forex / Currencies',
  'Commodities (MCX/Gold)',
  'US Equities'
];

export const JournalModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    journal_date: new Date().toISOString().slice(0, 10),
    market: 'NIFTY / BANKNIFTY Options',
    mood: 'Disciplined',
    notes: '',
    lesson: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        journal_date: initialData.journal_date || new Date().toISOString().slice(0, 10),
        market: initialData.market || 'NIFTY / BANKNIFTY Options',
        mood: initialData.mood || 'Disciplined',
        notes: initialData.notes || '',
        lesson: initialData.lesson || ''
      });
    } else {
      setFormData({
        title: '',
        journal_date: new Date().toISOString().slice(0, 10),
        market: 'NIFTY / BANKNIFTY Options',
        mood: 'Disciplined',
        notes: '',
        lesson: ''
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!formData.journal_date) {
      setError('Date is required.');
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Trading Journal Entry' : 'New Journal Reflection'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title / Daily Theme *
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Clean breakout follow-through on Expiry Day"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Journal Date *
            </label>
            <input
              type="date"
              name="journal_date"
              required
              value={formData.journal_date}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Market
            </label>
            <input
              type="text"
              name="market"
              list="markets-list"
              placeholder="Select or type market..."
              value={formData.market}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            />
            <datalist id="markets-list">
              {MARKETS.map(m => <option key={m} value={m} />)}
            </datalist>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Psychological Mood / Mindset
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_MOODS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, mood: m }))}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                    formData.mood === m
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              type="text"
              name="mood"
              placeholder="Or type custom mood..."
              value={formData.mood}
              onChange={handleChange}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Session Observations &amp; Emotional Notes
            </label>
            <textarea
              name="notes"
              rows="3"
              placeholder="What went well? How was your patience? Did you follow your risk rules?"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
              Key Lesson Learned / Action Item
            </label>
            <textarea
              name="lesson"
              rows="2"
              placeholder="Single most important lesson from today that makes you a sharper trader tomorrow..."
              value={formData.lesson}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Journal' : 'Save Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
