import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API, { authAPI } from '../utils/api';
import { User, Lock, Sliders, AlertTriangle, Check, AlertCircle, Trash2, ShieldAlert } from 'lucide-react';

const Settings = ({ urls, onAllUrlsDeleted }) => {
  const { user, logout, updateUser } = useAuth();

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Form states
  const [profileName, setProfileName] = useState(user?.name || '');
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    defaultExpiry: 'never',
    autoQr: false
  });

  // Loading states
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    setProfileLoading(true);
    try {
      const response = await authAPI.updateProfile({ name: profileName });
      updateUser({ ...user, name: response.data.name });
      showToast('Profile updated!', 'success');
    } catch (err) {
      console.error('Failed to update profile:', err.message);
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('All password fields are required.', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update password:', err.message);
      showToast(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setPreferencesLoading(true);
    setTimeout(() => {
      setPreferencesLoading(false);
      showToast('Link preferences updated successfully!', 'success');
    }, 1000);
  };

  const handleDeleteAllLinks = async () => {
    const confirmDelete = window.confirm('WARNING: Are you sure you want to delete ALL of your shortened links? This cannot be undone.');
    if (!confirmDelete) return;

    setDeleteAllLoading(true);
    try {
      await API.delete('/urls/all');
      if (onAllUrlsDeleted) {
        onAllUrlsDeleted();
      }
      showToast('All links deleted successfully!', 'success');
    } catch (err) {
      console.error('Failed to delete all links:', err.message);
      showToast('Failed to delete all links.', 'error');
    } finally {
      setDeleteAllLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('WARNING: Are you absolutely sure you want to delete your account? All links, analytics, and settings will be permanently destroyed. This action CANNOT be undone.');
    if (!confirmDelete) return;

    setDeleteAccountLoading(true);
    try {
      await authAPI.deleteAccount();
      showToast('Account deleted. Logging out...', 'success');
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (err) {
      console.error('Failed to delete account:', err.message);
      showToast(err.response?.data?.message || 'Failed to delete account.', 'error');
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#333333] animate-in fade-in duration-150">
      <h1 className="text-2xl font-bold text-[#333333] mb-2">Settings</h1>
      
      {/* SECTION 1: Account Preferences */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-[#4F46E5]" />
          Account Preferences
        </h2>
        <p className="text-xs text-slate-500 mb-5">Manage your local shortener config and custom default domains.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Default Base Domain</label>
            <input 
              type="text" 
              value="localhost:5000" 
              disabled 
              className="bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-lg p-2.5 w-full cursor-not-allowed max-w-md"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Link Limits</label>
            <div className="text-sm text-[#333333] font-medium bg-slate-50 border border-slate-100 p-3 rounded-lg max-w-md">
              You have used <span className="font-bold text-[#4F46E5]">{urls?.length || 0}</span> out of your monthly limit of <span className="font-bold text-slate-700">50</span> links.
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Profile Settings */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <User className="h-5 w-5 text-[#4F46E5]" />
          Profile Settings
        </h2>
        <p className="text-xs text-slate-500 mb-5">Update your personal information</p>
        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
            <input 
              type="text" 
              id="fullName"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg p-2.5 w-full focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              id="email"
              value={user?.email || ''} 
              disabled 
              className="bg-slate-50 border border-slate-200 text-slate-400 text-sm rounded-lg p-2.5 w-full cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={profileLoading}
            className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#3f37c9] text-white rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-75 cursor-pointer"
          >
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* SECTION 3: Change Password */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Lock className="h-5 w-5 text-[#4F46E5]" />
          Change Password
        </h2>
        <p className="text-xs text-slate-500 mb-5">Keep your account secure</p>
        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="currentPassword" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
            <input 
              type="password" 
              id="currentPassword"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg p-2.5 w-full focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
            <input 
              type="password" 
              id="newPassword"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg p-2.5 w-full focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg p-2.5 w-full focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#3f37c9] text-white rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-75 cursor-pointer"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* SECTION 4: Link Preferences */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-[#4F46E5]" />
          Link Preferences
        </h2>
        <p className="text-xs text-slate-500 mb-5">Customize your link settings</p>
        <form onSubmit={handleSavePreferences} className="space-y-5 max-w-md">
          <div>
            <label htmlFor="defaultExpiry" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Default Expiry</label>
            <select
              id="defaultExpiry"
              value={preferences.defaultExpiry}
              onChange={(e) => setPreferences({ ...preferences, defaultExpiry: e.target.value })}
              className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg p-2.5 w-full focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none cursor-pointer"
            >
              <option value="never">Never</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={preferences.autoQr}
                onChange={(e) => setPreferences({ ...preferences, autoQr: e.target.checked })}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
              <span className="ml-3 text-sm text-slate-600 font-semibold cursor-pointer">Auto-generate QR code for new links</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={preferencesLoading}
            className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#3f37c9] text-white rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-75 cursor-pointer"
          >
            {preferencesLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>

      {/* SECTION 5: Danger Zone */}
      <div className="bg-white border border-rose-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-rose-600 mb-1 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-rose-600" />
          Danger Zone
        </h2>
        <p className="text-xs text-slate-500 mb-5">Irreversible and destructive actions</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDeleteAllLinks}
            disabled={deleteAllLoading}
            className="px-5 py-2.5 border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            {deleteAllLoading ? 'Deleting...' : 'Delete All My Links'}
          </button>
          
          <button
            onClick={handleDeleteAccount}
            disabled={deleteAccountLoading}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4" />
            {deleteAccountLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success'
            ? 'bg-slate-900 border-emerald-500/25 text-white'
            : 'bg-slate-900 border-rose-500/25 text-white'
        }`}>
          {toast.type === 'success' ? (
            <Check className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Settings;
