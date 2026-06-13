import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, LogOut, ChevronDown, Settings, LayoutDashboard, Zap } from 'lucide-react';

const Navbar = ({ searchQuery, setSearchQuery, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => 
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowUpgradeModal(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'K';
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 sm:px-6 backdrop-blur-md bg-white/80 border-b border-[#E2E8F0]">
      
      {/* Left Area - Mobile Toggle and Brand */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-[#64748B] hover:text-[#1E293B] p-2 rounded-xl hover:bg-slate-50 transition-colors mr-2 focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5.5 w-5.5" />
        </button>
      </div>

      {/* Center - Premium Search Bar with Gradient Border on Focus */}
      <div className="flex-1 max-w-xl mx-4">
        <div className={`relative group w-full transition-all duration-300 rounded-full p-[1px] ${
          isSearchFocused 
            ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] shadow-lg shadow-indigo-500/5' 
            : 'bg-slate-200'
        }`}>
          <div className="relative flex items-center bg-[#F8FAFC] group-focus-within:bg-white rounded-full w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className={`h-4 w-4 text-[#64748B] transition-all duration-300 ${
                isSearchFocused ? 'text-[#4F46E5] scale-110 rotate-12' : ''
              }`} />
            </div>
            <input
              type="text"
              value={searchQuery || ''}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search short URL or destination link..."
              className="block w-full pl-10 pr-4 py-2 bg-transparent text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none transition-all rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Actions & Profile */}
      <div className="flex items-center space-x-3.5">
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
        >
          <Zap className="w-4 h-4" />
          Upgrade Pro
        </button>

        {/* User Profile Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2.5 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
          >
            {/* User Avatar circle with initial */}
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm select-none shadow-sm">
              {getInitials(user?.name)}
            </div>
            <span className="hidden md:inline text-sm font-bold text-slate-700 truncate max-w-[120px]">
              {user?.name || 'kavi'}
            </span>
            <ChevronDown className={`h-4 w-4 text-[#64748B] hidden md:block transition-transform duration-200 ${
              showDropdown ? 'rotate-180' : ''
            }`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeInUp">
              {/* User Info Header */}
              <div className="px-4 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {user?.name || 'kavi'}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[160px]">
                      {user?.email || 'kavi@linksnip.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {/* Account Preferences */}
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Account Settings</p>
                    <p className="text-xs text-gray-400">Manage your preferences</p>
                  </div>
                </button>

                {/* Dashboard */}
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Dashboard</p>
                    <p className="text-xs text-gray-400">Manage your links</p>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Logout */}
              <div className="py-2">
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Log out</p>
                    <p className="text-xs text-red-400">Sign out of your account</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          onClick={() => setShowUpgradeModal(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '380px',
              position: 'relative',
              boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
              overflow: 'hidden'
            }}
          >
            {/* X Button */}
            <button
              onClick={() => setShowUpgradeModal(false)}
              style={{
                position: 'absolute',
                top: '12px', right: '12px',
                width: '32px', height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(255,255,255,0.25)',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >✕</button>

            {/* Compact Header */}
            <div style={{
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #EC4899)',
              padding: '28px 24px 20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '52px', height: '52px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '26px'
              }}>⚡</div>
              <h2 style={{
                color: 'white', fontSize: '20px',
                fontWeight: '800', margin: '0 0 4px'
              }}>Go Pro for $29/mo</h2>
              <p style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: '13px', margin: 0
              }}>Everything in Free, plus more</p>
            </div>

            {/* Features List - Compact */}
            <div style={{padding: '20px 24px'}}>
              
              {/* Pro Features */}
              <div style={{
                background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <p style={{
                  fontSize: '11px', fontWeight: '700',
                  color: '#4F46E5', letterSpacing: '1px',
                  textTransform: 'uppercase',
                  margin: '0 0 12px'
                }}>✨ Pro Features</p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px'
                }}>
                  {[
                    '⚡ Unlimited links',
                    '📊 Advanced analytics',
                    '🌐 Custom domains',
                    '🎯 Priority support',
                    '📱 Device tracking',
                    '📁 Bulk CSV upload'
                  ].map(f => (
                    <div key={f} style={{
                      fontSize: '12px',
                      color: '#4B5563',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Plan Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '12px',
                fontSize: '12px',
                color: '#10B981'
              }}>
                <span>✓</span>
                <span>Currently on Free Plan (50 links/mo)</span>
              </div>

              {/* CTA Button */}
              <button style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                letterSpacing: '0.3px'
              }}>
                🚀 Upgrade to Pro Now
              </button>

              {/* Footer note */}
              <p style={{
                textAlign: 'center',
                fontSize: '11px',
                color: '#9CA3AF',
                margin: '10px 0 0'
              }}>
                🔒 Cancel anytime • 7-day free trial
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
