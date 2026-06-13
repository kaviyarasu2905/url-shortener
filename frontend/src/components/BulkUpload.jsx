import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Papa from 'papaparse';
import { urlAPI } from '../utils/api';
import { UploadCloud, Download, Check, AlertCircle, Copy, X, Trash2, ArrowLeft, Play, CheckCircle2, XCircle, FileText, FileSpreadsheet } from 'lucide-react';

const BulkUpload = ({ onUploadSuccess }) => {
  const [, setSearchParams] = useSearchParams();
  const [step, setStep] = useState(2); // Start at Step 2 (Upload or Paste) since Step 1 is just downloading template
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fileInputRef = useRef(null);

  const isValidUrl = (urlStr) => {
    try {
      new URL(urlStr);
      return true;
    } catch (_) {
      try {
        new URL('http://' + urlStr);
        return true;
      } catch (__) {
        return false;
      }
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "originalUrl,customAlias\n"
      + "https://example.com/very-long-url-1,alias1\n"
      + "https://example.com/very-long-url-2,\n"
      + "https://example.com/very-long-url-3,alias3\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "linksnip_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError('');
        processCSV(file);
      } else {
        setError('Only CSV files are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError('');
        processCSV(file);
      } else {
        setError('Only CSV files are supported.');
      }
    }
  };

  const processCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedRows = results.data.map((row) => {
          const origKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'originalurl') || 'originalUrl';
          const aliasKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'customalias') || 'customAlias';
          
          const originalUrl = (row[origKey] || '').trim();
          const customAlias = (row[aliasKey] || '').trim();
          
          return {
            originalUrl,
            customAlias,
            isValid: isValidUrl(originalUrl)
          };
        }).filter(r => r.originalUrl);

        if (parsedRows.length === 0) {
          setError('No valid rows found in the CSV.');
          setSelectedFile(null);
          return;
        }

        if (parsedRows.length > 50) {
          setError('Maximum 50 URLs allowed per batch. Please truncate your CSV.');
          setSelectedFile(null);
          return;
        }

        setPreviewData(parsedRows);
        setStep(3);
      },
      error: (err) => {
        console.error('CSV Parsing error:', err);
        setError('Failed to parse CSV file: ' + err.message);
        setSelectedFile(null);
      }
    });
  };

  const handleManualSubmit = () => {
    const lines = pasteText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      setError('Please paste at least one URL.');
      return;
    }

    if (lines.length > 50) {
      setError('Maximum 50 URLs allowed per batch. Please remove some lines.');
      return;
    }

    const parsedRows = lines.map(line => {
      const parts = line.split(',');
      const originalUrl = parts[0].trim();
      const customAlias = parts[1] ? parts[1].trim() : '';

      return {
        originalUrl,
        customAlias,
        isValid: isValidUrl(originalUrl)
      };
    });

    setPreviewData(parsedRows);
    setStep(3);
  };

  const handleShortenBulk = async () => {
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        urls: previewData.map(r => ({
          originalUrl: r.originalUrl,
          customAlias: r.customAlias || undefined
        }))
      };

      const response = await urlAPI.createBulk(payload);
      setUploadResults(response.data);
      setStep(4);
      if (onUploadSuccess) {
        onUploadSuccess(); // Refresh Dashboard link list
      }
    } catch (err) {
      console.error('Bulk upload api error:', err);
      let errMsg = 'Failed to shorten URLs. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadResults = () => {
    if (!uploadResults) return;
    const csvRows = [
      ['Original URL', 'Short URL', 'Status', 'Error Message']
    ];
    
    // Success entries
    uploadResults.results.forEach(r => {
      csvRows.push([r.originalUrl, r.shortUrl, 'Success', '']);
    });

    // Failed entries
    uploadResults.errors.forEach(e => {
      csvRows.push([e.originalUrl, '', 'Failed', e.message]);
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "linksnip_bulk_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPasteText('');
    setPreviewData([]);
    setUploadResults(null);
    setError('');
    setStep(2);
  };

  const handleBackToDashboard = () => {
    setSearchParams({});
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Top Banner Accent */}
      <div className="h-1.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]"></div>
      
      <div className="p-6 space-y-6">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-[#E2E8F0]/60 pb-4 gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#1E293B] flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#4F46E5]" />
              Bulk URL Shortening
            </h2>
            <p className="text-xs text-[#64748B] mt-1 font-medium">
              Upload a CSV file or paste links line-by-line to shorten multiple URLs instantly.
            </p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2 transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer shadow-sm"
          >
            <Download className="h-3.5 w-3.5" /> Download CSV Template
          </button>
        </div>

        {/* STEP PROGRESS WIZARD INDICATORS */}
        <div className="flex items-center justify-center max-w-md mx-auto py-2">
          {/* Step 2 Indicator */}
          <div className="flex items-center">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-500/10' : 'bg-slate-100 text-slate-400'
            }`}>
              2
            </div>
            <span className={`ml-2 text-xs font-bold ${step === 2 ? 'text-[#1E293B]' : 'text-slate-400'}`}>Import</span>
          </div>

          <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-[#4F46E5]' : 'bg-slate-100'}`}></div>

          {/* Step 3 Indicator */}
          <div className="flex items-center">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-[#4F46E5] text-white shadow-md' : 'bg-slate-100 text-slate-400'
            }`}>
              3
            </div>
            <span className={`ml-2 text-xs font-bold ${step === 3 ? 'text-[#1E293B]' : 'text-slate-400'}`}>Preview</span>
          </div>

          <div className={`flex-1 h-0.5 mx-4 ${step >= 4 ? 'bg-[#4F46E5]' : 'bg-slate-100'}`}></div>

          {/* Step 4 Indicator */}
          <div className="flex items-center">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 4 ? 'bg-[#4F46E5] text-white shadow-md' : 'bg-slate-100 text-slate-400'
            }`}>
              4
            </div>
            <span className={`ml-2 text-xs font-bold ${step === 4 ? 'text-[#1E293B]' : 'text-slate-400'}`}>Results</span>
          </div>
        </div>

        {/* Server or parsing errors display */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3.5 rounded-xl flex items-start space-x-2 text-xs font-semibold animate-shake">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 2 CONTENT: IMPORT (CSV Upload or Text Paste) */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* CSV File Drag & Drop Zone */}
            <div className="space-y-2.5">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Upload CSV File
              </span>
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center h-64 transition-all cursor-pointer relative ${
                  dragActive 
                    ? 'border-[#4F46E5] bg-indigo-50/10' 
                    : 'border-slate-200 bg-[#F8FAFC] hover:border-slate-300 hover:bg-slate-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <UploadCloud className={`h-11 w-11 mb-3 transition-colors ${dragActive ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
                <p className="text-sm font-bold text-[#1E293B]">Drag & drop your CSV file here</p>
                <p className="text-xs text-[#64748B] mt-1 font-semibold">or click to browse local files</p>
                <div className="mt-4 text-[10px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-150 font-bold uppercase tracking-wider">
                  Maximum 50 URLs per upload
                </div>
              </div>
            </div>

            {/* Paste URLs Textarea */}
            <div className="space-y-2.5 flex flex-col">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Or Paste URLs manually
              </span>
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="https://example.com/url-1,alias1&#10;https://example.com/url-2&#10;https://example.com/url-3,alias3"
                  className="w-full flex-1 min-h-[160px] md:min-h-0 border border-slate-200 rounded-2xl p-4 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-[#4F46E5] placeholder-slate-400 transition-all"
                />
                <button
                  onClick={handleManualSubmit}
                  className="w-full py-2.5 bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-white stroke-none" /> Parse pasted links
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 3 CONTENT: PREVIEW TABLE */}
        {step === 3 && (
          <div className="space-y-5 pt-1 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#1E293B]">Parsed URLs Preview</h3>
              <span className="text-[10px] font-bold text-[#4F46E5] bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {previewData.length} total rows
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] shadow-inner bg-slate-50/20">
              <table className="min-w-full divide-y divide-[#E2E8F0] text-left text-xs text-[#1E293B]">
                <thead className="bg-[#F8FAFC] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">Original URL</th>
                    <th className="px-4 py-3 w-40">Custom Alias</th>
                    <th className="px-4 py-3 w-28 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] bg-white">
                  {previewData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 w-12 text-center text-slate-400 font-bold">{index + 1}</td>
                      <td className="px-4 py-3 truncate max-w-xs md:max-w-md font-mono" title={row.originalUrl}>
                        {row.originalUrl}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {row.customAlias || <span className="text-slate-300 italic text-[10px]">auto-generated</span>}
                      </td>
                      <td className="px-4 py-3 w-28 text-center">
                        {row.isValid ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100 font-bold text-[9px] uppercase tracking-wide">
                            Valid URL
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-100 font-bold text-[9px] uppercase tracking-wide">
                            Invalid URL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 5 && (
                <div className="p-3 bg-slate-50/70 text-center text-[10px] font-extrabold text-slate-400 border-t border-[#E2E8F0] uppercase tracking-wider">
                  and {previewData.length - 5} more URLs...
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4 text-slate-500" /> Clear and Reset
              </button>
              
              <button
                onClick={handleShortenBulk}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:brightness-105 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Shortening URL list...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 stroke-[2.5px]" /> Shorten {previewData.length} URLs
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 CONTENT: RESULTS SCREEN */}
        {step === 4 && uploadResults && (
          <div className="space-y-6 pt-1 animate-in slide-in-from-bottom-2 duration-300">
            
            {/* Result Summary Block */}
            <div className="p-5 bg-indigo-50/30 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="bg-indigo-50 text-[#4F46E5] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-widest">
                  Bulk Process Complete
                </span>
                <h3 className="text-base font-black text-[#1E293B] mt-2">
                  {uploadResults.success} / {uploadResults.total} URLs shortened successfully.
                </h3>
                {uploadResults.failed > 0 && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {uploadResults.failed} entries failed validation checks.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleDownloadResults}
                  className="flex-1 sm:flex-initial px-4 py-2 border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" /> Export CSV Results
                </button>
              </div>
            </div>

            {/* Results Grid Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Detailed Log</h4>
              <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] shadow-inner bg-slate-50/10">
                <table className="min-w-full divide-y divide-[#E2E8F0] text-left text-xs text-[#1E293B]">
                  <thead className="bg-[#F8FAFC] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Original URL</th>
                      <th className="px-4 py-3">Short URL / Error Message</th>
                      <th className="px-4 py-3 w-24 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] bg-white">
                    {/* Successful redirections */}
                    {uploadResults.results.map((r, i) => (
                      <tr key={`success-${i}`} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 truncate max-w-[200px] font-mono" title={r.originalUrl}>
                          {r.originalUrl}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <a
                              href={r.shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#4F46E5] hover:text-[#7C3AED] font-bold hover:underline truncate max-w-xs font-mono"
                            >
                              {r.shortUrl.replace(/^https?:\/\//i, '')}
                            </a>
                            <button
                              onClick={() => handleCopy(r.shortUrl, i)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                copiedIndex === i 
                                  ? 'bg-[#4F46E5] border-[#4F46E5] text-white' 
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              {copiedIndex === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 w-24 text-center">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold text-[9px] uppercase tracking-wider">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Success
                          </span>
                        </td>
                      </tr>
                    ))}

                    {/* Failed URLs */}
                    {uploadResults.errors.map((e, i) => (
                      <tr key={`error-${i}`} className="bg-rose-50/15 hover:bg-rose-50/30">
                        <td className="px-4 py-3 truncate max-w-[200px] font-mono text-slate-400" title={e.originalUrl}>
                          {e.originalUrl}
                        </td>
                        <td className="px-4 py-3 text-rose-600 font-semibold italic text-xs">
                          {e.message}
                        </td>
                        <td className="px-4 py-3 w-24 text-center">
                          <span className="inline-flex items-center gap-1 text-rose-700 font-extrabold text-[9px] uppercase tracking-wider">
                            <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" /> Failed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                Upload More URLs
              </button>
              
              <button
                onClick={handleBackToDashboard}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#4F46E5] hover:bg-[#3f37c9] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default BulkUpload;
