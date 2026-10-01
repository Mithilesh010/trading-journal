import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDateTimeIST } from '../utils/formatters';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  KeyRound,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Percent,
  Award,
  AlertOctagon,
  Activity
} from 'lucide-react';

const MARKETS = ['Indian Market', 'Crypto Market', 'Commodity Market', 'Forex Market'];

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getProfile();
      setProfileData(res);
      setName(res.user.name || '');
      setPhone(res.user.phone || '');
    } catch (err) {
      setError(err.message || 'Failed to fetch profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    const payload = { name, phone };
    if (newPassword) {
      if (!currentPassword) {
        setError('Current password is required to set a new password.');
        setIsSubmitting(false);
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        setIsSubmitting(false);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('New passwords do not match.');
        setIsSubmitting(false);
        return;
      }
      payload.current_password = currentPassword;
      payload.new_password = newPassword;
      payload.confirm_new_password = confirmNewPassword;
    }

    try {
      const res = await api.updateProfile(payload);
      setMessage('Profile updated successfully.');
      updateUser(res.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      fetchProfile();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving account information..." />;
  }

  const stats = profileData?.stats || {};
  const marketSummaries = profileData?.market_summaries || {};

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Trader Profile &amp; Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal account credentials and view your overall trading journey.
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-1 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 text-2xl font-bold font-mono">
            {profileData?.user?.name?.slice(0, 2).toUpperCase() || 'TR'}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {profileData?.user?.name}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {profileData?.user?.email}
            </p>
            {profileData?.user?.phone && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5" />
                {profileData?.user?.phone}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>Joined: {formatDateTimeIST(profileData?.user?.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Account Type: Standard Trader</span>
            </div>
          </div>
        </div>

        {/* Quick Overall Stats Summary */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Overall Execution Summary
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Trades</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {stats.total_trades || 0}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Win Rate</span>
              <div className="text-xl font-bold font-mono text-emerald-500">
                {stats.win_rate || 0}%
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">TP Hit</span>
              <div className="text-xl font-bold font-mono text-emerald-500">
                {stats.tp_hits || 0}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">SL Hit</span>
              <div className="text-xl font-bold font-mono text-rose-500">
                {stats.sl_hits || 0}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Average R:R across all markets:</span>
            <span className="font-mono font-bold text-emerald-500 text-sm">
              {stats.avg_rr ? `1 : ${stats.avg_rr}` : 'Not available'}
            </span>
          </div>
        </div>
      </div>

      {/* Market Summaries (Separated by Indian, Crypto, Commodity, Forex) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Market-wise Performance Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Performance separated by your traded markets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MARKETS.map((m) => {
            const summary = marketSummaries[m] || {};
            return (
              <div
                key={m}
                className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    {m}
                  </h5>
                  <span className="text-[11px] font-mono text-slate-400">
                    {summary.total_trades || 0} trades
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Win Rate:</span>
                    <span className="font-mono font-bold text-emerald-500">
                      {summary.win_rate != null ? `${summary.win_rate}%` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">TP Hit:</span>
                    <span className="font-mono font-semibold text-emerald-500">
                      {summary.tp_hits || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SL Hit:</span>
                    <span className="font-mono font-semibold text-rose-500">
                      {summary.sl_hits || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg R:R:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {summary.avg_rr ? `1:${summary.avg_rr}` : '-'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Update Account Information
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Permanent Identifier)
              </label>
              <input
                type="email"
                disabled
                value={profileData?.user?.email || ''}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Email is used to maintain your unique multi-user database scoping and cannot be changed.
              </span>
            </div>
          </div>

          {/* Change Password Sub-Section */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <KeyRound className="w-4 h-4 text-emerald-500" />
              Change Password (Leave blank to keep existing password)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required if changing"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
