import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Link2, QrCode, BarChart3, Settings, Plus, X, LogOut, Upload } from 'lucide-react';
import { urlAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [firstUrlId, setFirstUrlId] = useState(null);

  useEffect(() => {
    const fetchFirstUrl = async () => {
      try {
        const response = await urlAPI.getAll();
        if (response.data && response.data.length > 0) {
          setFirstUrlId(response.data[0]._id);
        }
      } catch (err) {
        console.error('Sidebar error fetching first URL:', err.message);
      }
    };
    fetchFirstUrl();
  }, [location]);

  const handleCreateNewClick = () => {
    navigate('/dashboard?focus=true');
    setIsOpen(false);
  };

  const handleAnalyticsClick = (e) => {
    e.preventDefault();
    if (firstUrlId) {
      navigate(`/analytics/${firstUrlId}`);
    } else {
      alert('Please create a shortened URL first to view analytics.');
    }
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const getInitials = () => {
    if (!user || !user.name) return 'US';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path) => {
    if (path.includes('?')) {
      const [basePath, queryString] = path.split('?');
      if (location.pathname !== basePath) return false;
      const targetParams = new URLSearchParams(queryString);
      const currentParams = new URLSearchParams(location.search);
      for (const [key, val] of targetParams.entries()) {
        if (currentParams.get(key) !== val) return false;
      }
      return true;
    }
    if (path.startsWith('/analytics')) {
      return location.pathname.startsWith('/analytics');
    }
    if (path === '/dashboard') {
      if (location.pathname !== '/dashboard') return false;
      const currentTab = new URLSearchParams(location.search).get('tab');
      return !currentTab || currentTab === 'links' || currentTab === 'short';
    }
    return location.pathname === path;
  };

  const menuItems = [
    {
      name: 'Home',
      icon: Home,
      path: '/home',
      isActive: isActive('/home'),
      activeColor: 'bg-indigo-500/20 text-indigo-400',
    },
    {
      name: 'Links',
      icon: Link2,
      path: '/dashboard',
      isActive: isActive('/dashboard'),
      activeColor: 'bg-purple-500/20 text-purple-400',
    },
    {
      name: 'QR Codes',
      icon: QrCode,
      path: '/dashboard?tab=qr',
      isActive: isActive('/dashboard?tab=qr'),
      activeColor: 'bg-cyan-500/20 text-cyan-400',
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      path: firstUrlId ? `/analytics/${firstUrlId}` : '#',
      onClick: !firstUrlId ? handleAnalyticsClick : undefined,
      isActive: isActive('/analytics'),
      activeColor: 'bg-emerald-500/20 text-emerald-400',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[240px] bg-gradient-to-b from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-slate-200 flex flex-col transition-all duration-300 ease-in-out md:translate-x-0 border-r border-slate-800/80 shadow-2xl sidebar h-screen overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header - Logo and Brand */}
        <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between">
          <Link to="/home" className="flex items-center space-x-3 group" onClick={() => setIsOpen(false)}>
            {/* Glowing gradient logo circle */}
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] flex items-center justify-center font-black text-lg text-white select-none shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200 animate-pulse-glow">
              L
            </div>
            <div className="flex flex-col">
              <span className="font-poppins font-extrabold text-lg tracking-wider text-white">LinkSnip</span>
              <span className="text-[8px] font-extrabold text-[#7C3AED] uppercase tracking-widest mt-[-2px] bg-indigo-500/10 px-1.5 py-0.5 rounded-full border border-indigo-500/20">SAAS V1.0</span>
            </div>
          </Link>
          {/* Close button on mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Buttons Section */}
        <div className="p-4 flex flex-col gap-2.5">
          <button
            onClick={handleCreateNewClick}
            className="w-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:brightness-110 active:scale-95 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/15 hover:animate-shimmer cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.5px]" />
            <span>Create short URL</span>
          </button>
          
          <button
            onClick={() => {
              navigate('/dashboard?tab=bulk');
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-2 rounded-xl border-2 border-indigo-400 text-white font-medium text-sm hover:bg-indigo-600 hover:border-indigo-600 active:scale-95 transition-all duration-200"
            style={{
              background: 'rgba(99, 102, 241, 0.2)'
            }}
          >
            <Upload className="w-4 h-4 text-indigo-300" />
            <span>Bulk Upload</span>
          </button>
        </div>

        {/* Navigation Area - Overflow hidden to completely remove scrollbars */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const linkProps = item.onClick
              ? { onClick: item.onClick, href: '#' }
              : { to: item.path };
            
            const Tag = item.onClick ? 'a' : Link;

            return (
              <Tag
                key={index}
                {...linkProps}
                onClick={item.onClick ? item.onClick : () => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 relative group cursor-pointer ${
                  item.isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                }`}
              >
                {/* Left Active border bar */}
                {item.isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-gradient-to-b from-[#4F46E5] to-[#7C3AED] rounded-r-md" />
                )}
                
                {/* Active Colored Icon Background container */}
                <div className={`p-1.5 rounded-lg transition-colors duration-200 ${
                  item.isActive 
                    ? item.activeColor 
                    : 'bg-transparent text-[#94A3B8] group-hover:text-white'
                }`}>
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="text-sm font-medium">{item.name}</span>
              </Tag>
            );
          })}
        </nav>

        {/* Bottom Section - Preferences & User Info with mt-auto */}
        <div className="p-3 border-t border-white/10 space-y-2 bg-slate-950/20 mt-auto">
          <Link
            to="/dashboard?tab=settings"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${
              isActive('/dashboard?tab=settings')
                ? 'bg-white/10 text-white font-semibold'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${
              isActive('/dashboard?tab=settings')
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-transparent text-[#94A3B8] group-hover:text-white'
            }`}>
              <Settings className="h-4 w-4 shrink-0" />
            </div>
            <span className="text-sm font-medium">Settings</span>
          </Link>

          {/* User profile card block */}
          {user && (
            <div className="flex flex-col gap-3 p-3 mt-1 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-bold text-xs select-none shadow-md">
                    {getInitials()}
                  </div>
                  {/* Online Indicator Green Dot */}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10B981] border-2 border-[#0F172A]"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-rose-455 hover:text-white hover:bg-rose-500/20 active:scale-95 transition-all duration-200 border border-rose-500/25 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
