import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlAPI } from '../utils/api';
import { Copy, Check, QrCode, BarChart2, Trash2, Calendar, Zap, ExternalLink, AlertCircle, X, Download, Globe } from 'lucide-react';

const UrlCard = ({ url, onDeleteSuccess }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);

  const handleDownloadQr = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `${url.shortCode}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleFetchQr = async () => {
    setQrModalOpen(true);
    if (qrCode) return; // cache image state locally

    setQrLoading(true);
    try {
      const response = await urlAPI.getQR(url._id);
      setQrCode(response.data.qrCode);
    } catch (err) {
      console.error('Failed to fetch QR code:', err.message);
    } finally {
      setQrLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this short URL?');
    if (!confirmDelete) return;

    setDeleteLoading(true);
    try {
      await urlAPI.delete(url._id);
      onDeleteSuccess(url._id);
    } catch (err) {
      console.error('Failed to delete URL:', err.message);
      alert('Failed to delete URL. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 w-full relative overflow-hidden group animate-fadeInUp">
      {/* 4px Gradient Accent Border on Left */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#4F46E5] to-[#7C3AED]" />

      {/* TOP SECTION: Badges & Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-wrap gap-2">
          {/* Custom Alias Badge */}
          {url.customAlias && (
            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-100 uppercase tracking-wide">
              Custom Alias
            </span>
          )}
          {/* Active vs Expired Status Check */}
          {isExpired ? (
            <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-100 flex items-center gap-1 uppercase tracking-wide">
              <AlertCircle className="h-3 w-3" /> Expired
            </span>
          ) : !url.isActive ? (
            <span className="bg-slate-100 text-slate-650 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Inactive
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide animate-pulse">
              Active
            </span>
          )}
        </div>
        
        {/* Date on Right */}
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-300" />
          {formatDate(url.createdAt)}
        </span>
      </div>

      {/* MIDDLE SECTION: Short URL, Destination, Expiry */}
      <div className="space-y-2">
        {/* Short URL Link */}
        <h3 className="text-xl font-poppins font-bold flex items-center">
          {isExpired ? (
            <span className="text-slate-400 no-underline cursor-not-allowed flex items-center gap-1.5" title="This link has expired">
              {url.shortUrl.replace(/^https?:\/\//i, '')}
            </span>
          ) : (
            <a
              href={url.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gradient-primary hover:brightness-110 font-bold flex items-center gap-1.5 group/link transition-all"
            >
              <span>{url.shortUrl.replace(/^https?:\/\//i, '')}</span>
              <ExternalLink className="h-4.5 w-4.5 text-indigo-500 opacity-60 group-hover/link:opacity-100 transition-opacity" />
            </a>
          )}
        </h3>

        {/* Original Destination Link (Ellipsis Truncated with Tooltip) */}
        <div className="flex items-center text-sm text-slate-500 max-w-full">
          <span className="flex-shrink-0 font-bold mr-1.5">Destination:</span>
          <a
            href={url.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-slate-700 hover:text-[#4F46E5] hover:underline truncate max-w-xs md:max-w-md lg:max-w-lg transition-colors"
            title={url.originalUrl}
          >
            {url.originalUrl}
          </a>
        </div>

        {/* Expiry detail if available */}
        {url.expiresAt && (
          <div className="pt-0.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${isExpired ? 'text-rose-500' : 'text-amber-600'}`}>
              <Calendar className="h-3.5 w-3.5" />
              <span>{isExpired ? 'Expired' : 'Expires'} {formatDate(url.expiresAt)}</span>
            </span>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: Click Count and Action Buttons */}
      <div className="flex items-center justify-between gap-3 mt-1 pt-3.5 border-t border-slate-100 w-full">
        {/* Click stats indicator - Lightning Bolt icon */}
        <div 
          className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all group-hover:scale-102"
          title="Total clicks/visits"
        >
          <Zap className="h-4 w-4 text-[#4F46E5] fill-[#4F46E5]/10 group-hover:animate-pulse" />
          <span>{url.clicks} clicks</span>
        </div>

        {/* Action Buttons Panel with Tooltips */}
        <div className="flex items-center gap-2">
          {/* Copy short link */}
          <button
            onClick={handleCopy}
            className={`p-2 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-center cursor-pointer h-9 w-9 ${
              copied
                ? 'bg-emerald-500 border-transparent text-white shadow-sm shadow-emerald-500/10'
                : 'bg-white border-[#E2E8F0] hover:bg-emerald-50 hover:border-emerald-200 text-slate-400 hover:text-emerald-600'
            }`}
            title="Copy short link"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>

          {/* View QR Code */}
          <button
            onClick={handleFetchQr}
            className="p-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-400 hover:text-blue-600 transition-all duration-200 cursor-pointer h-9 w-9"
            title="View QR Code"
          >
            <QrCode className="h-4 w-4" />
          </button>

          {/* View public stats */}
          <button
            onClick={() => window.open(`/stats/${url.shortCode}`, '_blank')}
            className="p-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-purple-50 hover:border-purple-200 text-slate-400 hover:text-purple-600 transition-all duration-200 cursor-pointer h-9 w-9"
            title="View public statistics"
          >
            <Globe className="h-4 w-4" />
          </button>

          {/* View detailed analytics */}
          <button
            onClick={() => navigate(`/analytics/${url._id}`)}
            className="p-2 px-3 rounded-xl border border-[#E2E8F0] bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-650 font-bold text-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer h-9"
            title="View visitor metrics"
          >
            <BarChart2 className="h-4 w-4 text-slate-400" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          {/* Delete short link */}
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="p-2 rounded-xl border border-rose-100 bg-white hover:bg-rose-50 hover:border-rose-200 text-rose-600 transition-all duration-200 cursor-pointer h-9 w-9 flex items-center justify-center"
            title="Delete link"
          >
            {deleteLoading ? (
              <div className="h-4 w-4 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* QR Code Modal Overlay */}
      {qrModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setQrModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-100 p-6 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-poppins font-bold text-[#1E293B]">QR Code Link</h4>
              <button
                onClick={() => setQrModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center py-4 bg-slate-50 border border-[#E2E8F0] rounded-2xl mb-4 p-4">
              {qrLoading ? (
                <div className="h-44 w-44 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-xl shadow-inner">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4F46E5]/30 border-t-[#4F46E5]"></div>
                </div>
              ) : qrCode ? (
                <div className="border border-[#E2E8F0] p-3 rounded-2xl bg-white shadow-inner">
                  <img src={qrCode} alt="Link QR Code" className="h-44 w-44" />
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center">Failed to load QR code</p>
              )}
              <p className="mt-4 text-xs font-mono text-slate-500 text-center break-all select-all bg-white px-2.5 py-1.5 border border-[#E2E8F0] rounded-lg w-full">
                {url.shortUrl}
              </p>
            </div>
            
            {qrCode && !qrLoading && (
              <button
                onClick={handleDownloadQr}
                className="w-full py-2.5 mb-2 bg-[#4F46E5] hover:bg-[#3f37c9] text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download PNG Image
              </button>
            )}

            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlCard;
