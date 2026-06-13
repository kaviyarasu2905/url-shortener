import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urlAPI } from '../utils/api';
import { ArrowLeft, ExternalLink, MousePointerClick, Calendar, ShieldAlert, Table, BarChart3, Clock, Globe, Laptop, Smartphone, Tablet, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await urlAPI.getAnalytics(id);
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err.message);
      setError('Failed to fetch analytics data. The URL might not exist or you do not have permission.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm animate-fadeInUp">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#4F46E5]/30 border-t-[#4F46E5]"></div>
        <p className="mt-4 text-xs text-slate-500 font-bold animate-pulse">Synchronizing visitor metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center bg-white border border-[#E2E8F0] rounded-2xl shadow-sm animate-fadeInUp">
        <div className="mx-auto w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-6">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Unable to load analytics</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#3f37c9] text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/10 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
      </div>
    );
  }

  const { originalUrl, shortUrl, totalClicks, lastVisited, recentVisits, dailyTrend, deviceBreakdown, browserBreakdown, osBreakdown, createdAt } = analytics;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111827] text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs font-semibold">
          <p className="text-slate-400 font-bold">{payload[0].payload.date}</p>
          <p className="text-indigo-405 font-black mt-1">{payload[0].value} clicks</p>
        </div>
      );
    }
    return null;
  };

  const DEVICE_COLORS = ['#4F46E5', '#7C3AED', '#10B981'];
  const BROWSER_COLORS = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'];
  const OS_COLORS = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-black fill-white"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111827] text-white p-2.5 rounded-xl border border-slate-800 shadow-xl text-xs font-semibold">
          <p className="text-slate-400 font-bold">{payload[0].name}</p>
          <p className="text-indigo-400 font-black mt-1">{payload[0].value} clicks</p>
        </div>
      );
    }
    return null;
  };

  const getDeviceIcon = (device) => {
    if (!device) return <Laptop className="h-4 w-4 text-slate-400" />;
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-indigo-550" />;
      case 'tablet':
        return <Tablet className="h-4 w-4 text-purple-550" />;
      case 'desktop':
      default:
        return <Laptop className="h-4 w-4 text-slate-500" />;
    }
  };

  const formatDeviceDetails = (visit) => {
    const { device, browser, os } = visit;
    const hasDevice = device && device.toLowerCase() !== 'unknown';
    const hasBrowser = browser && browser.toLowerCase() !== 'unknown';
    const hasOs = os && os.toLowerCase() !== 'unknown';
    
    if (!hasDevice || !hasBrowser || !hasOs) {
      return (
        <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
          <HelpCircle className="h-4 w-4 text-slate-300" /> Unknown Device
        </span>
      );
    }

    const icon = getDeviceIcon(device);
    return (
      <span className="flex items-center gap-2 text-slate-600 font-semibold">
        {icon}
        <span>{device} • {browser} • {os}</span>
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-12 animate-fadeInUp">
      
      {/* BREADCRUMB HEADER */}
      <div className="space-y-1">
        <nav className="flex items-center gap-2 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
          <span className="hover:text-[#4F46E5] cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="text-[#1E293B]">Analytics</span>
        </nav>
      </div>

      {/* HERO HEADER CARD (Full Gradient Background) */}
      <div className="bg-gradient-to-tr from-[#1E1B4B] via-[#4F46E5] to-[#7C3AED] text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute right-[-40px] top-[-40px] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float pointer-events-none" />
        
        {/* Back button top left */}
        <div className="flex items-center justify-between z-10 relative mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl transition-all cursor-pointer backdrop-blur-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
          
          <span className="bg-white/15 text-white text-[10px] font-extrabold px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">
            Link Insights
          </span>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-3xl font-poppins font-bold tracking-tight break-all text-white">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline inline-flex items-center gap-2"
            >
              <span>{shortUrl.replace(/^https?:\/\//i, '')}</span>
              <ExternalLink className="h-5 w-5 opacity-80" />
            </a>
          </h1>
          
          <div className="pt-2">
            <p className="text-[10px] text-white/50 font-extrabold uppercase tracking-widest">Destination URL</p>
            <a 
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-mono text-white/70 truncate hover:text-white transition-colors cursor-pointer block max-w-full"
              title={originalUrl}
            >
              {originalUrl}
            </a>
          </div>

          {/* Stats Row inside header card */}
          <div className="flex flex-wrap gap-6 pt-5 border-t border-white/10 text-xs font-bold text-white/80">
            <div className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-indigo-200" />
              <span>{totalClicks} clicks</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-200" />
              <span>Last Redirect: {lastVisited ? formatDate(lastVisited) : 'Never'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-200" />
              <span>Created {formatDate(createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS METRIC BOXES ROW WITH GRADIENT ICONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Clicks Box */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Clicks</p>
            <h2 className="text-3xl font-poppins font-black text-[#4F46E5] tabular-nums">{totalClicks}</h2>
          </div>
          <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-2xl shadow-md shadow-indigo-500/10 transition-transform group-hover:scale-105">
            <MousePointerClick className="h-6 w-6" />
          </div>
        </div>

        {/* Last Visited Date Box */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Last Redirection</p>
            <h2 className="text-sm font-extrabold text-slate-800">
              {lastVisited ? formatDate(lastVisited).split(',')[0] : 'No redirection yet'}
            </h2>
          </div>
          <div className="p-3 bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-2xl shadow-md shadow-purple-500/10 transition-transform group-hover:scale-105">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Created Date Box */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Created Date</p>
            <h2 className="text-sm font-extrabold text-slate-800">
              {formatDate(createdAt).split(',')[0]}
            </h2>
          </div>
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-500 text-white rounded-2xl shadow-md shadow-cyan-500/10 transition-transform group-hover:scale-105">
            <Calendar className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* DAILY CLICK TREND CHART */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-indigo-500 to-purple-500" />
        <h2 className="text-base font-poppins font-bold text-[#1E293B] mb-6 flex items-center gap-2 border-b border-slate-50 pb-3">
          <BarChart3 className="h-5 w-5 text-[#4F46E5]" />
          Redirections Timeline (Last 7 Days)
        </h2>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="chartBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="emptyBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E2E8F0" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#F1F5F9" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={10}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                dy={8}
                tickFormatter={(date) => {
                  const [, month, day] = date.split('-');
                  return `${month}/${day}`;
                }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                dx={-8}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="clicks" radius={[5, 5, 0, 0]}>
                {dailyTrend.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.clicks > 0 ? 'url(#chartBarGradient)' : 'url(#emptyBarGradient)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ANALYTICS BREAKDOWNS PIE CHARTS WITH GRADIENT TITLE BARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Device Breakdown */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col h-[300px] hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-indigo-500 to-purple-500" />
          <h3 className="text-xs font-bold text-[#1E293B] border-b border-slate-50 pb-2.5 mb-4 uppercase tracking-wider font-sans">
            Device Type
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceBreakdown || []}
                  cx="50%"
                  cy="40%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={62}
                  dataKey="value"
                  nameKey="name"
                >
                  {(deviceBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browser Breakdown */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col h-[300px] hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-purple-500 to-pink-500" />
          <h3 className="text-xs font-bold text-[#1E293B] border-b border-slate-50 pb-2.5 mb-4 uppercase tracking-wider font-sans">
            Browser OS
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={browserBreakdown || []}
                  cx="50%"
                  cy="40%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={62}
                  dataKey="value"
                  nameKey="name"
                >
                  {(browserBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BROWSER_COLORS[index % BROWSER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* OS Breakdown */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col h-[300px] hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-cyan-500 to-blue-500" />
          <h3 className="text-xs font-bold text-[#1E293B] border-b border-slate-50 pb-2.5 mb-4 uppercase tracking-wider font-sans">
            Operating System
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={osBreakdown || []}
                  cx="50%"
                  cy="40%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={62}
                  dataKey="value"
                  nameKey="name"
                >
                  {(osBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={OS_COLORS[index % OS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* STRIPED VISITOR LOGS TABLE */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-indigo-500 to-purple-500" />
        <h2 className="text-base font-poppins font-bold text-[#1E293B] mb-5 flex items-center gap-2 border-b border-slate-50 pb-3">
          <Table className="h-5 w-5 text-[#4F46E5]" />
          Recent Visitors Log
        </h2>

        {recentVisits.length === 0 ? (
          <p className="text-xs text-[#64748B] py-10 text-center bg-[#F8FAFC] border border-dashed border-[#E2E8F0] rounded-xl font-semibold">
            No redirection logs recorded for this link yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] shadow-inner">
            <table className="min-w-full divide-y divide-[#E2E8F0] text-left text-sm text-[#1E293B]">
              <thead className="bg-[#F8FAFC] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Clock className="h-3.5 w-3.5 text-slate-405" /> Date & Time
                    </span>
                  </th>
                  <th className="px-6 py-4">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Globe className="h-3.5 w-3.5 text-slate-405" /> IP Address
                    </span>
                  </th>
                  <th className="px-6 py-4">
                    <span className="font-bold">Device Context</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] bg-white">
                {recentVisits.map((visit, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors even:bg-slate-50/45">
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-[#1E293B] tabular-nums">
                      {formatDate(visit.timestamp)}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-indigo-650">
                      {visit.ip}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                      {formatDeviceDetails(visit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
