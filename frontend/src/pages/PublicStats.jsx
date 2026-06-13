import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, BarChart3, Calendar, ExternalLink, MousePointerClick, Clock, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

// Reusable CountUp component for animating clicks
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

  return <span className="tabular-nums font-black">{count}</span>;
};

const PublicStats = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [shortCode]);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/urls/public/${shortCode}`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching public stats:', err.message);
      setError('Stats not found. This link might not exist or has been deleted.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
          <p className="text-indigo-450 font-black mt-1">{payload[0].value} clicks</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F1F5F9] px-4 animate-fadeInUp">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#4F46E5]/30 border-t-[#4F46E5]"></div>
        <p className="mt-4 text-xs text-slate-500 font-bold animate-pulse">Loading public redirection statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] px-4 text-[#1E293B]">
        <div className="max-w-md w-full bg-white border border-[#E2E8F0] shadow-xl rounded-3xl p-8 text-center animate-in fade-in duration-300">
          <div className="mx-auto w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-6">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 font-poppins">Link stats not available</h2>
          <p className="mt-2 text-sm text-[#64748B] max-w-sm mx-auto">{error}</p>
          <button
            onClick={() => navigate('/signup')}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:brightness-105 active:scale-95 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/10 transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" /> Create your own short links
          </button>
        </div>
      </div>
    );
  }

  const { shortUrl, totalClicks, createdAt, lastVisited, dailyTrend, deviceBreakdown, browserBreakdown, osBreakdown } = stats;

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-[#1E293B] relative overflow-hidden">
      {/* Background Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-2xl w-full space-y-6 relative z-10 animate-fadeInUp">
        
        {/* Brand header logo */}
        <div className="flex flex-col items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] flex items-center justify-center font-black text-xl text-white select-none shadow-md transition-transform group-hover:scale-105 duration-200 animate-pulse-glow">
              L
            </div>
            <span className="font-poppins font-extrabold text-2xl tracking-wider text-slate-800">LinkSnip</span>
          </Link>
          <p className="text-[9px] text-[#7C3AED] mt-2.5 uppercase font-bold tracking-widest bg-indigo-50 border border-indigo-100 px-3.5 py-1 rounded-full select-none shadow-sm">
            Public Insights Page
          </p>
        </div>

        {/* Main Stats Card */}
        <div className="bg-white border border-[#E2E8F0] shadow-md rounded-3xl p-6 sm:p-8 space-y-6">
          
          {/* Branded Short Link Header (Gradient Hero style) */}
          <div className="bg-gradient-to-tr from-[#1E1B4B] via-[#4F46E5] to-[#7C3AED] text-white rounded-2xl p-6 text-center sm:text-left relative overflow-hidden shadow-md">
            <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-white/10 rounded-full blur-2xl animate-float pointer-events-none" />
            <span className="bg-white/15 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/15 uppercase tracking-wide">
              Short Link Endpoint
            </span>
            <h1 className="mt-3.5 text-2xl sm:text-3xl font-poppins font-bold tracking-tight break-all text-white">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-1.5 transition-colors font-bold"
              >
                <span>{shortUrl.replace(/^https?:\/\//i, '')}</span>
                <ExternalLink className="h-5 w-5 opacity-80" />
              </a>
            </h1>
            <p className="text-xs text-white/70 mt-2 flex items-center justify-center sm:justify-start gap-1.5 font-semibold">
              <Calendar className="h-3.5 w-3.5" />
              Created {formatDate(createdAt)}
            </p>
          </div>

          {/* Click Count & Last Visit Metrics with anim count-ups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 text-center flex flex-col justify-center group hover:bg-indigo-50/20 transition-colors">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <MousePointerClick className="h-3.5 w-3.5 text-[#4F46E5]" /> Total Clicks
              </p>
              <h2 className="text-3xl font-poppins font-black text-[#4F46E5] tabular-nums">
                <CountUp endValue={totalClicks} />
              </h2>
            </div>
            
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 text-center flex flex-col justify-center group hover:bg-purple-50/20 transition-colors">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#7C3AED]" /> Last Visit
              </p>
              <h3 className="text-sm font-extrabold text-slate-800 truncate">
                {lastVisited ? new Date(lastVisited).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never visited'}
              </h3>
            </div>
          </div>

          {/* Click trend history */}
          <div className="space-y-4 pt-1">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
              <BarChart3 className="h-4.5 w-4.5 text-[#4F46E5]" />
              7-Day Redirections History
            </h3>
            
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="publicChartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="publicEmptyGradient" x1="0" y1="0" x2="0" y2="1">
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
                  <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
                    {dailyTrend.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.clicks > 0 ? 'url(#publicChartGradient)' : 'url(#publicEmptyGradient)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analytics Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 border-t border-slate-100">
            {/* Device Type Breakdown */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex flex-col h-[280px] hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500" />
              <h3 className="text-[10px] font-extrabold text-[#1E293B] border-b border-slate-50 pb-2 mb-2 uppercase tracking-widest">
                Devices
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
                      outerRadius={52}
                      dataKey="value"
                      nameKey="name"
                    >
                      {(deviceBreakdown || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '9px', fontWeight: 700, color: '#64748B' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Browser Breakdown */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex flex-col h-[280px] hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500" />
              <h3 className="text-[10px] font-extrabold text-[#1E293B] border-b border-slate-50 pb-2 mb-2 uppercase tracking-widest">
                Browsers
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
                      outerRadius={52}
                      dataKey="value"
                      nameKey="name"
                    >
                      {(browserBreakdown || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BROWSER_COLORS[index % BROWSER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '9px', fontWeight: 700, color: '#64748B' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* OS Breakdown */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex flex-col h-[280px] hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 to-blue-500" />
              <h3 className="text-[10px] font-extrabold text-[#1E293B] border-b border-slate-50 pb-2 mb-2 uppercase tracking-widest">
                Systems
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
                      outerRadius={52}
                      dataKey="value"
                      nameKey="name"
                    >
                      {(osBreakdown || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={OS_COLORS[index % OS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '9px', fontWeight: 700, color: '#64748B' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* CTA Banner area leading to signup */}
          <div className="pt-4 border-t border-slate-100">
            <Link
              to="/signup"
              className="block w-full py-3.5 text-center bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:brightness-105 active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/10 hover:animate-shimmer transition-all duration-200"
            >
              Shorten & track your own links with LinkSnip ⚡
            </Link>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-400 select-none font-bold uppercase tracking-widest">
          Powered by <span className="font-extrabold text-slate-500">LinkSnip SaaS Engine ⚡</span>
        </div>

      </div>
    </div>
  );
};

export default PublicStats;
