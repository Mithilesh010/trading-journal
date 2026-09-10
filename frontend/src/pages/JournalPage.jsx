import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { JournalCard } from '../components/journal/JournalCard';
import { JournalModal } from '../components/journal/JournalModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Plus, BookOpen, Search } from 'lucide-react';

export const JournalPage = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const res = await api.getJournals({ search });
      setJournals(res.journals || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load journal entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJournals();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSave = async (data) => {
    try {
      setIsSubmitting(true);
      if (editingJournal) {
        await api.updateJournal(editingJournal.id, data);
      } else {
        await api.createJournal(data);
      }
      setIsModalOpen(false);
      setEditingJournal(null);
      await fetchJournals();
    } catch (err) {
      alert(err.message || 'Failed to save journal entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;
    try {
      await api.deleteJournal(id);
      await fetchJournals();
    } catch (err) {
      alert(err.message || 'Failed to delete entry.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trader's Psychological Journal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Capture emotional patterns, daily mindset, and the critical lessons that forge mastery.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingJournal(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search journal entries, lessons, or moods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Journal Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving journal entries..." />
      ) : error ? (
        <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
          {error}
        </div>
      ) : journals.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No journal entries yet"
          description="Reflecting on your trades is how good traders become great. Record your first session observation today."
          actionText="Add Journal Entry"
          onAction={() => {
            setEditingJournal(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {journals.map((j) => (
            <JournalCard
              key={j.id}
              journal={j}
              onEdit={(entry) => {
                setEditingJournal(entry);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Journal Modal */}
      <JournalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJournal(null);
        }}
        onSave={handleSave}
        initialData={editingJournal}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
