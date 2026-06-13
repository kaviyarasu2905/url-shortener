import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { urlAPI } from '../utils/api';
import { 
  Link2, 
  ArrowRight, 
  ExternalLink, 
  MousePointer,
  MousePointer2, 
  Calendar, 
  Copy,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon, 
  BarChart3, 
  QrCode, 
  Clock, 
  Upload, 
  Globe, 
  Lightbulb,
  AlertCircle,
  Activity
} from 'lucide-react';

// Reusable CountUp component for premium stats animation
const CountUp = ({ endValue }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(endValue, 10);
    if (isNaN(end) || end === 0) {
      setCount(endValue);
      return;
    }
    const duration = 800; // ms
    const increment = Math.max(1, Math.floor(end / 30));
    const stepTime = Math.abs(Math.floor(duration / 30));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [endValue]);

  return <span className="tabular-nums font-extrabold">{count}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await urlAPI.getAll();
        const data = response.data || [];
        setUrls(data);

        // Stats calculation
        const totalLinks = data.length;
        const totalClicks = data.reduce((sum, url) => sum + (url.clicks || 0), 0);
        const activeLinks = data.filter(url => url.isActive && (!url.expiresAt || new Date() <= new Date(url.expiresAt))).length;
        const newThisMonth = data.filter(url => {
          const created = new Date(url.createdAt);
          const now = new Date();
          return created.getMonth() === now.getMonth() && 
                 created.getFullYear() === now.getFullYear();
        }).length;

        setStats({ totalLinks, totalClicks, activeLinks, newThisMonth });
      } catch (err) {
        console.error('Error fetching URLs for Home:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUrls();
  }, []);

  const recentLinks = [...urls]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const features = [
    {
      icon: LinkIcon,
      gradient: 'from-indigo-500 to-purple-500',
      title: 'Smart URL Shortening',
      description: 'Transform long URLs into clean, memorable short links instantly.'
    },
    {
      icon: BarChart3,
      gradient: 'from-purple-500 to-pink-500',
      title: 'Detailed Analytics',
      description: 'Track clicks, devices, browsers and geographic data in real time.'
    },
    {
      icon: QrCode,
      gradient: 'from-cyan-500 to-blue-500',
      title: 'QR Code Generation',
      description: 'Generate QR codes for any short link instantly and download them.'
    },
    {
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      title: 'Link Expiration',
      description: 'Set expiry dates on links to control access automatically.'
    },
    {
      icon: Upload,
      gradient: 'from-blue-500 to-indigo-550',
      title: 'Bulk CSV Upload',
      description: 'Shorten up to 50 URLs at once by uploading a simple CSV file.'
    },
    {
      icon: Globe,
      gradient: 'from-pink-500 to-rose-550',
      title: 'Public Statistics',
      description: 'Share public stats pages so anyone can view your link performance.'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F1F5F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-650"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-9 pb-12 animate-fadeInUp">
      
      {/* SECTION 1: HERO WELCOME WITH MOVEMENT */}
      <div className="bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#EC4899] bg-[size:200%_200%] bg-gradient-shimmer rounded-3xl p-8 md:p-14 text-white shadow-xl relative overflow-hidden">
        {/* Floating circles */}
        <div className="absolute right-[-40px] top-[-40px] w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute left-1/3 bottom-[-50px] w-56 h-56 bg-purple-550/20 rounded-full blur-2xl animate-float pointer-events-none" style={{ animationDelay: '-3s' }} />
        
        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 shadow-sm animate-fadeInUp">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Welcome back, {user?.name || 'User'}! 👋</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-poppins font-extrabold tracking-tight leading-tight">
            Shorten. Share. Track.
          </h1>
          <p className="text-white/85 text-base md:text-lg max-w-md font-medium leading-relaxed">
            LinkSnip gives you absolute control over your audience endpoints with instant redirects, analytical insights, and bulk CSV uploads.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white hover:bg-slate-50 active:scale-95 text-[#4F46E5] px-7 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/10 transition-all duration-200 cursor-pointer"
            >
              Create Short URL
            </button>
            <button
              onClick={() => navigate('/dashboard?tab=bulk')}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white px-7 py-3.5 rounded-xl font-bold text-sm border border-white/20 backdrop-blur-sm transition-all duration-200 cursor-pointer"
            >
              Bulk Upload CSV
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: STATS ROW WITH ACCENT BORDERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 - Total Links */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Links</span>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <Link2 className="w-5 h-5 text-indigo-650" />
            </div>
          </div>
          <div className="text-3xl font-poppins font-bold text-slate-900">
            <CountUp endValue={stats.totalLinks} />
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <p className="text-xs font-semibold text-slate-400">All time created</p>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+12%</span>
          </div>
        </div>

        {/* Card 2 - Total Clicks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clicks</span>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <MousePointer className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-poppins font-bold text-slate-900">
            <CountUp endValue={stats.totalClicks} />
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <p className="text-xs font-semibold text-slate-400">Across all links</p>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+18%</span>
          </div>
        </div>

        {/* Card 3 - Active Links */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Links</span>
            <div className="w-10 h-10 bg-emerald-55/10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <Activity className="w-5 h-5 text-emerald-650" />
            </div>
          </div>
          <div className="text-3xl font-poppins font-bold text-slate-900">
            <CountUp endValue={stats.activeLinks} />
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <p className="text-xs font-semibold text-slate-400">Currently live</p>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">94% rate</span>
          </div>
        </div>

        {/* Card 4 - New This Month */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">This Month</span>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-3xl font-poppins font-bold text-slate-900">
            <CountUp endValue={stats.newThisMonth} />
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <p className="text-xs font-semibold text-slate-400">New links added</p>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+24%</span>
          </div>
        </div>

      </div>

      {/* RECENT LINKS & PRO TIPS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SECTION: PREMIUM RECENT LINKS */}
        <div className="lg:col-span-2">
          {recentLinks.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4 animate-float">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 font-poppins">No links yet</h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal max-w-xs">
                You haven't shortened any links. Create your first short URL to initialize tracking metrics!
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-5 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-650 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all cursor-pointer"
              >
                Create your first short URL
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              
              {/* Header with solid Gradient background */}
              <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-between px-6 py-4 h-[60px] shadow-sm">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-white" />
                  <h2 className="font-poppins font-bold text-white text-lg">Recent Links</h2>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-sm text-white/95 hover:text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View all →</span>
                </button>
              </div>

              {/* Links List */}
              <div className="divide-y divide-gray-50 bg-white">
                {recentLinks.map((link, index) => {
                  const isExpired = link.expiresAt && new Date() > new Date(link.expiresAt);
                  return (
                    <div
                      key={link._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4.5 hover:bg-indigo-50/30 transition-all duration-200 gap-4"
                    >
                      {/* Left: URL Info with Index Number circle */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                          {index + 1}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={link.shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-655 font-extrabold text-base hover:text-indigo-850 hover:underline truncate"
                            >
                              {link.shortUrl.replace(/^https?:\/\//i, '')}
                            </a>
                            <ExternalLink className="w-3.5 h-3.5 text-indigo-450 flex-shrink-0" />
                          </div>
                          <p className="text-gray-400 text-xs truncate mt-0.5 max-w-[200px]" title={link.originalUrl}>
                            {link.originalUrl}
                          </p>
                        </div>
                      </div>

                      {/* Right: Stats Details */}
                      <div className="flex items-center justify-between sm:justify-end gap-3.5 flex-shrink-0">
                        {/* Status Badge */}
                        {isExpired ? (
                          <span className="bg-rose-105 text-rose-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-205 uppercase tracking-wide">
                            Expired
                          </span>
                        ) : !link.isActive ? (
                          <span className="bg-slate-100 text-slate-650 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                            Inactive
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-green-205 uppercase tracking-wide">
                            Active
                          </span>
                        )}

                        {/* Click Count badge */}
                        <div className="bg-purple-50 rounded-lg px-3 py-1.5 flex items-center gap-1.5 border border-purple-100">
                          <MousePointer2 className="w-3.5 h-3.5 text-purple-650" />
                          <span className="text-sm font-bold text-slate-800 tabular-nums">
                            {link.clicks}
                          </span>
                          <span className="text-[10px] text-slate-405 font-semibold uppercase">clicks</span>
                        </div>

                        {/* Date badge */}
                        <div className="bg-gray-50 rounded-lg px-3 py-1.5 flex items-center gap-1.5 border border-slate-100">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-500">
                            {new Date(link.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {/* Copy Button */}
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(link.shortUrl);
                              setCopiedId(link._id);
                              setTimeout(() => setCopiedId(null), 2000);
                            } catch (err) {
                              console.error('Failed to copy text:', err);
                            }
                          }}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border cursor-pointer group ${
                            copiedId === link._id 
                              ? 'bg-emerald-500 border-transparent text-white'
                              : 'bg-gray-100 border-slate-150 hover:bg-[#4F46E5] hover:border-transparent text-slate-450 hover:text-white'
                          }`}
                          title="Copy short URL"
                        >
                          {copiedId === link._id ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer background gradient details */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-100 py-3.5 px-6 flex items-center justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-center text-sm text-indigo-650 hover:text-purple-650 font-bold transition-colors cursor-pointer"
                >
                  View all {urls.length} links →
                </button>
              </div>

            </div>
          )}
        </div>

        {/* SECTION: PRO TIPS WITH LEFT GRADIENT LINE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
              <h2 className="text-lg font-bold text-slate-800">Pro Tips</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/40 border border-slate-100/50 rounded-2xl relative pl-6 overflow-hidden transition-all duration-300 hover:shadow-sm">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-[#4F46E5] to-[#7C3AED]" />
                <h4 className="text-xs font-bold text-slate-800">Use custom aliases</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Make your short links look branded and trustworthy to increase click-through rates by up to 34%.
                </p>
              </div>
              <div className="p-4 bg-purple-50/40 border border-slate-100/50 rounded-2xl relative pl-6 overflow-hidden transition-all duration-300 hover:shadow-sm">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-purple-500 to-pink-500" />
                <h4 className="text-xs font-bold text-slate-850">Set expiry dates</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Configure limits on temporary links to automatically deactivate them after campaigns or promotions end.
                </p>
              </div>
              <div className="p-4 bg-emerald-50/40 border border-slate-100/50 rounded-2xl relative pl-6 overflow-hidden transition-all duration-300 hover:shadow-sm">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-emerald-500 to-teal-500" />
                <h4 className="text-xs font-bold text-slate-800">Use bulk upload</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Have multiple campaign URLs? Upload a CSV sheet to shorten up to 50 URLs in one click.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: FEATURES GRID WITH HOVER LIFTS */}
      <div className="space-y-6 pt-2">
        <div>
          <h2 className="text-2xl font-poppins font-bold text-slate-800">
            Grow with LinkSnip features
          </h2>
          <p className="text-slate-500 text-sm mt-1">Discover all premium features included in your LinkSnip dashboard plan.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-105 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-start gap-4 group cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                {/* Gradient icon wrapper */}
                <div className="w-12 h-12 bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] rounded-xl flex items-center justify-center shrink-0 text-white shadow-md transition-transform group-hover:scale-105 duration-200">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-655 transition-colors">{feature.title}</h3>
                  <p className="text-xs text-slate-505 leading-relaxed">{feature.description}</p>
                </div>
                <div className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <span className="transition-transform group-hover:translate-x-1 duration-200">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Home;
