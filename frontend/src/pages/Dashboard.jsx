import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { urlAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import UrlCard from '../components/UrlCard';
import Settings from './Settings';
import BulkUpload from '../components/BulkUpload';
import { Link2, Plus, Sparkles, Calendar, Globe, AlertCircle, Copy, Check, ExternalLink, Download, MousePointer, Activity, ArrowUpDown, Clock, Search } from 'lucide-react';

const Dashboard = ({ searchQuery, setSearchQuery }) => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successLink, setSuccessLink] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('newest');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [focusedField, setFocusedField] = useState('');

  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
    newThisMonth: 0
  });

  const inputRef = useRef(null);

  const activeTab = searchParams.get('tab') === 'bulk' ? 'bulk' : (searchParams.get('tab') === 'qr' ? 'qr' : (searchParams.get('tab') === 'links' ? 'links' : 'short'));
  const showSettings = searchParams.get('tab') === 'settings';

  // Form State
  const [formData, setFormData] = useState({
    originalUrl: '',
    customAlias: '',
    expiresAt: ''
  });
  const [alsoCreateQr, setAlsoCreateQr] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [copied, setCopied] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  useEffect(() => {
    fetchUrls();
    // Live update current time every second
    const timeTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeTimer);
  }, []);

  useEffect(() => {
    if (searchParams.get('focus') === 'true' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchParams]);

  useEffect(() => {
    const totalLinks = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
    const activeLinks = urls.filter(url => url.isActive).length;
    const newThisMonth = urls.filter(url => {
      const created = new Date(url.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && 
             created.getFullYear() === now.getFullYear();
    }).length;
    setStats({ totalLinks, totalClicks, activeLinks, newThisMonth });
  }, [urls]);

  const fetchUrls = async () => {
    setLoading(true);
    try {
      const response = await urlAPI.getAll();
      setUrls(response.data);
    } catch (err) {
      console.error('Error fetching URLs:', err.message);
      setError('Failed to load your shortened links.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
    setError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.originalUrl.trim()) {
      errors.originalUrl = 'Original URL is required';
    } else {
      const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;
      if (!urlPattern.test(formData.originalUrl)) {
        errors.originalUrl = 'Please enter a valid destination URL (e.g. google.com)';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    setError('');
    setSuccessLink(null);

    try {
      const response = await urlAPI.create(formData);
      let linkData = response.data;
      
      if (activeTab === 'qr' || alsoCreateQr) {
        try {
          const qrResponse = await urlAPI.getQR(linkData._id);
          linkData.qrCode = qrResponse.data.qrCode;
        } catch (qrErr) {
          console.error('Error pre-fetching QR Code:', qrErr);
        }
      }

      setSuccessLink(linkData);
      showToast(
        activeTab === 'qr' ? 'QR Code created successfully!' : 'Link shortened successfully!', 
        'success'
      );

      setFormData({
        originalUrl: '',
        customAlias: '',
        expiresAt: ''
      });
      setAlsoCreateQr(false);

      const updatedResponse = await urlAPI.getAll();
      setUrls(updatedResponse.data);
    } catch (err) {
      console.error('Error creating short URL:', err.message);
      let errMsg = 'Failed to create short URL. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteSuccess = (deletedId) => {
    setUrls(urls.filter((url) => url._id !== deletedId));
    if (successLink && successLink._id === deletedId) {
      setSuccessLink(null);
    }
    showToast('Link deleted successfully!', 'success');
  };

  const handleCopySuccessLink = async () => {
    if (!successLink) return;
    try {
      await navigator.clipboard.writeText(successLink.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err.message);
    }
  };

  const handleDownloadSuccessQr = () => {
    if (!successLink || !successLink.qrCode) return;
    const link = document.createElement('a');
    link.href = successLink.qrCode;
    link.download = `${successLink.shortCode}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTabChange = (tab) => {
    if (tab === 'bulk') {
      setSearchParams({ tab: 'bulk' });
    } else if (tab === 'qr') {
      setSearchParams({ tab: 'qr' });
    } else if (tab === 'links') {
      setSearchParams({ tab: 'links' });
    } else {
      setSearchParams({});
    }
    setError('');
    setSuccessLink(null);
  };

  const linksRemaining = Math.max(0, 50 - urls.length);

  // Real-time filtering
  const filteredUrls = urls.filter((url) => {
    const query = (searchQuery || '').toLowerCase().trim();
    if (!query) return true;
    return (
      url.originalUrl.toLowerCase().includes(query) ||
      url.shortUrl.toLowerCase().includes(query) ||
      (url.customAlias && url.customAlias.toLowerCase().includes(query))
    );
  });

  // Sorting logic
  const sortedUrls = [...filteredUrls].sort((a, b) => {
    if (sortBy === 'clicks') {
      return (b.clicks || 0) - (a.clicks || 0);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const formattedDateTime = currentTime.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  if (showSettings) {
    return <Settings urls={urls} onAllUrlsDeleted={() => setUrls([])} />;
  }

  const isOriginalActive = focusedField === 'originalUrl' || formData.originalUrl;
  const isAliasActive = focusedField === 'customAlias' || formData.customAlias;

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-12 animate-fadeInUp">
      
      {/* Page Header and Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E8F0] pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-slate-800 tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          {/* Live updating date and time */}
          <p className="text-sm font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
            <span className="tabular-nums">{formattedDateTime}</span>
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-100 self-start sm:self-auto shadow-inner">
          <button
            onClick={() => handleTabChange('short')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              (activeTab === 'short' || activeTab === 'links')
                ? 'bg-white text-slate-850 shadow-sm border border-white/10'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Short Link
          </button>
          <button
            onClick={() => handleTabChange('qr')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-white text-slate-850 shadow-sm border border-white/10'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => handleTabChange('bulk')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'bulk'
                ? 'bg-white text-slate-850 shadow-sm border border-white/10'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Bulk Upload
          </button>
        </div>
      </div>

      {/* STATISTICS COUNTERS GRID WITH GRADIENT TOP BORDERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1 - Total Links */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-105 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Total Links
            </span>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <Link2 className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="text-3xl font-poppins font-bold text-slate-900 tabular-nums">{stats.totalLinks}</div>
          <p className="text-xs font-semibold text-slate-400 mt-1.5">All time created</p>
        </div>

        {/* Card 2 - Total Clicks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-105 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Total Clicks
            </span>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <MousePointer className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-poppins font-bold text-slate-900 tabular-nums">{stats.totalClicks}</div>
          <p className="text-xs font-semibold text-slate-400 mt-1.5">Across all links</p>
        </div>

        {/* Card 3 - Active Links */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-105 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Active Links
            </span>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-poppins font-bold text-slate-900 tabular-nums">{stats.activeLinks}</div>
          <p className="text-xs font-semibold text-slate-400 mt-1.5">Currently active</p>
        </div>

        {/* Card 4 - New This Month */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-105 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              This Month
            </span>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-3xl font-poppins font-bold text-slate-900 tabular-nums">{stats.newThisMonth}</div>
          <p className="text-xs font-semibold text-slate-400 mt-1.5">New links added</p>
        </div>

      </div>

      {/* QUICK CREATE CARD OR BULK UPLOAD */}
      {activeTab === 'bulk' ? (
        <BulkUpload onUploadSuccess={fetchUrls} />
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
          {/* Gradient header line accent */}
          <div className="h-[4px] bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]"></div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-[#E2E8F0]/60 pb-5 mb-6 gap-3">
              <div>
                <h2 className="text-lg font-poppins font-bold text-[#1E293B] flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#4F46E5] animate-pulse" />
                  Quick Create: {activeTab === 'qr' ? 'QR Code Link' : 'Short URL Link'}
                </h2>
                <p className="text-xs text-[#64748B] mt-1 font-semibold">
                  You can create <span className="font-bold text-[#4F46E5]">{linksRemaining}</span> more links this month.
                </p>
              </div>
              <div className="text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-[#64748B] font-bold self-start md:self-auto shadow-inner">
                Domain Base: <span className="font-mono text-slate-800 font-bold">localhost:5000</span>
              </div>
            </div>

            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3.5 rounded-xl flex items-start space-x-2 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Long URL Input with Floating Label */}
                <div className="md:col-span-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Globe className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="originalUrl"
                    id="originalUrl"
                    ref={inputRef}
                    value={formData.originalUrl}
                    onFocus={() => setFocusedField('originalUrl')}
                    onBlur={() => setFocusedField('')}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 pt-6 pb-2 border rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] text-sm transition-all ${
                      formErrors.originalUrl ? 'border-rose-300 ring-rose-250' : 'border-slate-200'
                    }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="originalUrl"
                    className={`absolute left-10 pointer-events-none transition-all duration-200 ${
                      isOriginalActive
                        ? 'text-[10px] font-bold text-indigo-600 top-2'
                        : 'text-sm text-slate-400 top-1/2 -translate-y-1/2'
                    }`}
                  >
                    Destination URL *
                  </label>
                  {formErrors.originalUrl && (
                    <p className="text-xs text-rose-600 font-semibold mt-1 px-1">{formErrors.originalUrl}</p>
                  )}
                </div>

                {/* Custom Alias Input with Floating Label */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-sm font-extrabold text-indigo-500 font-mono">/</span>
                  </div>
                  <input
                    type="text"
                    name="customAlias"
                    id="customAlias"
                    value={formData.customAlias}
                    onFocus={() => setFocusedField('customAlias')}
                    onBlur={() => setFocusedField('')}
                    onChange={handleChange}
                    placeholder=" "
                    className="block w-full pl-8 pr-3 pt-6 pb-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] text-sm transition-all"
                  />
                  <label
                    htmlFor="customAlias"
                    className={`absolute left-8 pointer-events-none transition-all duration-200 ${
                      isAliasActive
                        ? 'text-[10px] font-bold text-indigo-600 top-2'
                        : 'text-sm text-slate-400 top-1/2 -translate-y-1/2'
                    }`}
                  >
                    Custom Alias (Optional)
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-4 border-t border-slate-100">
                {/* Expiry Date Input */}
                <div className="relative w-full sm:max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    name="expiresAt"
                    id="expiresAt"
                    value={formData.expiresAt}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] text-sm text-[#1E293B] font-bold transition-all"
                  />
                </div>

                {/* Checkbox */}
                {(activeTab === 'short' || activeTab === 'links') && (
                  <div className="flex items-center py-2">
                    <label className="flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="alsoCreateQr"
                        checked={alsoCreateQr}
                        onChange={(e) => setAlsoCreateQr(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#4F46E5] relative"></div>
                      <span className="ml-2.5 text-xs font-bold text-[#64748B] cursor-pointer">
                        Also create a QR Code for this link
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:brightness-105 active:scale-95 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/10 hover:animate-shimmer transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  {submitLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4.5 w-4.5 stroke-[2.5px]" />
                      <span>{activeTab === 'qr' ? 'Create QR Code' : 'Shorten Link'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Success Creation Card Block with Anim Checkmark */}
            {successLink && (
              <div className="mt-6 p-5 bg-emerald-50 border border-emerald-250 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 animate-fadeInUp">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 animate-bounce">
                      <Check className="h-4.5 w-4.5 stroke-[3px]" />
                    </div>
                    <p className="text-[10px] font-extrabold text-emerald-850 uppercase tracking-widest">
                      {successLink.qrCode ? 'Short URL & QR Code Generated!' : 'Redirection active!'}
                    </p>
                  </div>
                  
                  <div className="bg-white px-4 py-2.5 rounded-xl border border-emerald-100 shadow-sm w-fit">
                    <a
                      href={successLink.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4F46E5] hover:text-[#7C3AED] font-extrabold text-base flex items-center gap-1.5 group w-fit transition-colors"
                    >
                      <span>{successLink.shortUrl.replace(/^https?:\/\//i, '')}</span>
                      <ExternalLink className="h-4 w-4 text-[#7C3AED] opacity-60 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                  
                  {successLink.qrCode && (
                    <div className="mt-3.5 flex items-center gap-4 bg-white p-3 border border-emerald-150 rounded-2xl w-fit shadow-sm">
                      <img src={successLink.qrCode} alt="Link QR Code" className="h-20 w-20" />
                      <button
                        onClick={handleDownloadSuccessQr}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-150 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5 text-slate-500" /> Download PNG
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleCopySuccessLink}
                  className={`w-full sm:w-auto px-5 py-2.5 border rounded-xl text-xs font-bold transition-all duration-250 flex items-center justify-center gap-2 cursor-pointer h-10 ${
                    copied
                      ? 'bg-[#4F46E5] text-white border-transparent shadow-md shadow-indigo-500/10'
                      : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100/50'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied URL!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Short URL</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL LIST HEADER */}
      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">
              {searchQuery ? 'Search results' : 'Your Links Log'}
            </h2>
            <span className="text-[10px] font-bold text-[#4F46E5] bg-indigo-55 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {filteredUrls.length} {filteredUrls.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Local Search Input aligned directly with list */}
            <div className="relative group w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-[#4F46E5] transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder="Filter links log..."
                className="block w-full pl-9 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
              />
            </div>

            {/* Sorting panel */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#E2E8F0] text-slate-700 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-4 focus:ring-slate-100 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="clicks">Most Clicks</option>
              </select>
            </div>
          </div>
        </div>

        {/* URL List Rendering */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#4F46E5]/30 border-t-[#4F46E5]"></div>
            <p className="mt-4 text-xs text-slate-550 font-bold animate-pulse">Loading links...</p>
          </div>
        ) : sortedUrls.length === 0 ? (
          <div className="bg-white border border-dashed border-[#E2E8F0] rounded-2xl p-12 text-center shadow-inner">
            <div className="mx-auto w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Link2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              {searchQuery ? 'No matching shortcuts found' : 'Dashboard is clean'}
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto font-medium">
              {searchQuery 
                ? 'Check spelling or query custom alias parameters.' 
                : 'Shorten a long URL inside the quick build card to initialize tracking indicators!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedUrls.map((url) => (
              <UrlCard
                key={url._id}
                url={url}
                onDeleteSuccess={handleDeleteSuccess}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 transition-all duration-300 transform translate-y-0 ${
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

export default Dashboard;
