import React, { useState } from 'react';
import { Settings, Shield, User as UserIcon, Bell, ChevronRight, Moon, Sun, Lock, Check, Mail, Phone, Globe, Wallet } from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsPageProps {
  user: UserType;
  onUserUpdated: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  user, 
  onUserUpdated, 
  darkMode, 
  setDarkMode 
}) => {
  const [name, setName] = useState<string>(user.name);
  const [walletAddress, setWalletAddress] = useState<string>(user.wallet_address || '');
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [language, setLanguage] = useState<string>(user.language || 'English');
  const [notificationTrades, setNotificationTrades] = useState<boolean>(user.notification_trades ?? true);

  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          wallet_address: walletAddress,
          phone,
          language,
          notification_trades: notificationTrades
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Profile settings successfully updated!');
        onUserUpdated();
        setTimeout(() => setSuccess(null), 4000);
      } else {
        setError(data.error || 'Failed to update profile settings.');
      }
    } catch (err) {
      setError('A connection error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setPasswordSuccess('Password updated successfully! (Local state simulation)');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSuccess(null), 4000);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full text-slate-900 dark:text-white transition-colors font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-black font-heading mb-2">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your trading account preferences, wallet credentials, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 font-bold flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
            <UserIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-base font-extrabold text-slate-900 dark:text-white">Profile Details</span>
          </div>
          
          <form onSubmit={handleProfileSave} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full / Display Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email Address (DISABLED - Cannot be changed) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email Address (Locked)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    disabled 
                    value={user.email}
                    className="w-full bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-xl pl-10 pr-4 py-3 text-sm font-medium opacity-60 cursor-not-allowed text-slate-500" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    value={phone}
                    placeholder="e.g., +880 17XXXXXXXX"
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors"
                  />
                </div>
              </div>

              {/* Language Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Language</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Globe className="w-4 h-4 text-slate-400" />
                  </div>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors"
                  >
                    <option value="English">English</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Arabic">Arabic (العربية)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Crypto Wallet Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">USDT Receiving Wallet Address (TRC-20 / ERC-20)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Wallet className="w-4 h-4 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  value={walletAddress}
                  placeholder="0x... or TRC-20 Address"
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-mono font-semibold outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* Error and Success Alerts */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-500">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{success}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={saving}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-all uppercase tracking-wider flex items-center gap-2 shadow shadow-emerald-500/20 disabled:opacity-55"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Preferences Toggle */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 font-bold flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
            <Settings className="w-5 h-5 text-emerald-500" />
            <span className="text-base font-extrabold text-slate-900 dark:text-white">App Preferences</span>
          </div>
          <div className="p-3 divide-y divide-slate-100 dark:divide-slate-850">
            {/* Theme Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/40 dark:border-slate-800">
                  {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                </div>
                <div>
                  <div className="text-sm font-extrabold">Theme Mode</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Toggle dark or light visual interface style</div>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>

            {/* Trade Alerts Toggle */}
            <button 
              onClick={() => setNotificationTrades(!notificationTrades)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/40 dark:border-slate-800">
                  <Bell className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <div className="text-sm font-extrabold">Real-time Trade Alerts</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Receive notifications on micro-expiry and profit payouts</div>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full p-1 transition-colors ${notificationTrades ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${notificationTrades ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Change Password Security Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 font-bold flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span className="text-base font-extrabold text-slate-900 dark:text-white">Security & Password</span>
          </div>
          
          <form onSubmit={handlePasswordSave} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Current Password</label>
                <input 
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                <input 
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="Min 6 characters"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input 
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {passwordError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-500">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <button 
              type="submit"
              className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-850 dark:hover:bg-slate-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-all uppercase tracking-wider border border-slate-200 dark:border-slate-750"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
