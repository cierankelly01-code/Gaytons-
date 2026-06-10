import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import toast from 'react-hot-toast';

const PASSWORD_RULES = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleChangePassword(e) {
    e.preventDefault();
    setError('');

    if (!PASSWORD_RULES.test(newPassword)) {
      setError('Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      updateUser({ mustChangePassword: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="font-display text-2xl text-gray-900">Account Settings</h2>

      {user?.mustChangePassword && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-card text-amber-800 text-sm">
          Please change your temporary password before continuing.
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Business Details</h3>
        <div className="space-y-3">
          {[
            { label: 'Business Name', value: user?.businessName },
            { label: 'Contact Name', value: user?.contactName },
            { label: 'Email', value: user?.email },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-xs font-medium text-gray-500 sm:w-36 sm:text-sm">{label}</span>
              <span className="text-sm font-medium text-gray-900 break-all">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          To update your business details, contact orders@gaytonsbakery.co.uk
        </p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Current Password</label>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <p className="text-xs text-gray-400 mt-1">
              Min 8 chars, 1 uppercase, 1 number, 1 special character
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn-primary w-full min-h-[44px]" disabled={saving}>
            {saving ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
