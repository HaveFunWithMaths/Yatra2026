import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import ErrorBoundary from '../components/ErrorBoundary';
import { findGroupNames, matchPhoneOrEmail } from '../utils/accommodationUtils';
import BottomNavigation from '../components/common/BottomNavigation';

// Public CSV export URLs
const REGISTRATION_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1GIEPXnjsjw7RClGwgOFVOrZemhlqY7jAMl7t2FNkvos/export?format=csv';
const ACCOMMODATION_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1KqLzcSY92zccRQdBSHeNWXzll2ryE-Mpn9iWHkDRoHk/export?format=csv';

const cleanName = (name) => (name || '').trim().toLowerCase().replace(/\s+/g, ' ');

function AccountsContent() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [devoteeName, setDevoteeName] = useState('');
  const [accountResults, setAccountResults] = useState([]); // [row]
  const [notFound, setNotFound] = useState(false);

  const handleSearch = useCallback(async (searchValue) => {
    const term = (searchValue || '').trim();
    if (!term) {
      setError('Please enter your phone number or email address.');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(false);
    setNotFound(false);
    setAccountResults([]);
    setDevoteeName('');

    try {
      // Fetch both sheets in parallel
      const [regText, accountsRawText] = await Promise.all([
        fetch(REGISTRATION_CSV_URL).then(r => r.text()),
        fetch(ACCOMMODATION_CSV_URL).then(r => r.text()),
      ]);

      const regParsed = Papa.parse(regText, { header: true, skipEmptyLines: true });
      
      // Clean Accounts CSV by skipping the first line
      const firstNewlineIndex = accountsRawText.indexOf('\n');
      const cleanedAccountsText = firstNewlineIndex !== -1 
        ? accountsRawText.substring(firstNewlineIndex + 1) 
        : accountsRawText;
        
      const accountsParsed = Papa.parse(cleanedAccountsText, { header: true, skipEmptyLines: true });

      const regRows = regParsed.data;
      const accountsRows = accountsParsed.data;

      // 1. Process Accounts rows to forward-fill merged Devotee Name and Number (phone)
      let lastDevName = '';
      let lastPhone = '';
      const processedAccounts = accountsRows.map(row => {
        const colA = row['Devotee Name']?.trim();
        const colB = row['Number']?.trim();
        if (colA) lastDevName = colA;
        if (colB) lastPhone = colB;
        return {
          ...row,
          _devName: lastDevName,
          _phone: lastPhone
        };
      });

      // 2. Try to find the devotee group in registration
      const groupResult = findGroupNames(regRows, term);
      let targetDevoteeName = '';
      let matchedRows = [];

      if (groupResult) {
        targetDevoteeName = groupResult.devoteeName;
        const normTarget = cleanName(targetDevoteeName);
        matchedRows = processedAccounts.filter(row => cleanName(row._devName) === normTarget);
      } else {
        // Fallback: search phone number directly in Accounts sheet
        const rowWithPhone = processedAccounts.find(row => matchPhoneOrEmail(row._phone, term));
        if (rowWithPhone) {
          targetDevoteeName = rowWithPhone._devName;
          const normTarget = cleanName(targetDevoteeName);
          matchedRows = processedAccounts.filter(row => cleanName(row._devName) === normTarget);
        }
      }

      if (matchedRows.length === 0) {
        setNotFound(true);
        setSearched(true);
        setLoading(false);
        return;
      }

      setDevoteeName(targetDevoteeName);
      setAccountResults(matchedRows);
      
      // Save valid lookup in localStorage
      localStorage.setItem('gnh_yatra_accom_input', term);
      setSearched(true);
    } catch (err) {
      console.error('Accounts lookup error:', err);
      setError('Something went wrong while fetching data. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-lookup on mount if saved or via URL query parameter
  useEffect(() => {
    // 1. Check URL query params first
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    if (qParam) {
      setInput(qParam);
      handleSearch(qParam);
      return;
    }

    // 2. Fall back to localStorage
    const saved = localStorage.getItem('gnh_yatra_accom_input');
    if (saved) {
      setInput(saved);
      handleSearch(saved);
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch(input);
  };
  const handleReset = () => {
    setInput('');
    setSearched(false);
    setNotFound(false);
    setAccountResults([]);
    setDevoteeName('');
    setError('');
    localStorage.removeItem('gnh_yatra_accom_input');
    
    // Clear query parameter from browser history
    const url = new URL(window.location);
    url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
  };

  // Web Share API trigger
  const handleShare = async () => {
    const activeTerm = localStorage.getItem('gnh_yatra_accom_input') || input;
    const shareUrl = `${window.location.origin}${window.location.pathname}?q=${encodeURIComponent(activeTerm)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GNH Yatra 2026 Accounts',
          text: `Check out the GNH Yatra 2026 Accounts details for ${devoteeName}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled or failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      } catch (err) {
        console.error('Copy link failed', err);
      }
    }
  };

  // Calculations
  const totalPaid = accountResults.reduce((sum, row) => sum + (parseFloat(row['1st Installment']) || 0), 0);
  const totalPending = accountResults.reduce((sum, row) => sum + (parseFloat(row['Pending']) || 0), 0);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fdf6ec 0%, #f5f0ff 50%, #ecf0ff 100%)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-amber-100 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
          <img src="/assets/GNHLogo.png" alt="GNH Logo" className="h-8 w-auto shrink-0" />
          <div className="text-center">
            <h1 className="text-base md:text-xl font-black text-slate-800 leading-none">
              GNH Yatra 2026
            </h1>
            <p className="text-[10px] md:text-xs text-amber-600 font-bold tracking-wider mt-0.5 uppercase">Accounts Lookup</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-0 sm:px-4 pt-4 sm:pt-10 pb-16 print:pt-4">

        {/* Hero Section */}
        <div className="text-center mb-4 sm:mb-8 animate-fade-in print:hidden">
          <h2 className="text-2xl sm:text-2xl md:text-3xl font-black text-slate-800 mb-2">Your Accounts</h2>
          <p className="text-slate-500 text-sm md:text-sm max-w-sm mx-auto leading-relaxed">
            Enter the phone number or email you used during registration to view your payment details.
          </p>
        </div>

        {/* Search Card */}
        <div className="card mx-2 sm:mx-0 px-3 sm:px-6 py-4 sm:py-7 mb-4 animate-slide-up print:hidden">
          <label className="form-label font-bold text-xs uppercase tracking-wider text-slate-500" htmlFor="accom-search-input">
            Phone Number or Email Address
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="accom-search-input"
              type="text"
              className="form-input flex-1 font-semibold"
              placeholder="e.g. 9876543210 or name@email.com"
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoComplete="off"
              inputMode="text"
            />
            <button
              id="accom-search-btn"
              onClick={() => handleSearch(input)}
              disabled={loading || !input.trim()}
              className="btn-primary whitespace-nowrap flex items-center justify-center gap-2 px-5 py-3 sm:py-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />
                  Searching…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Look Up
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="mt-2.5 text-xs text-red-600 font-bold flex items-center gap-1.5 animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Shimmer Loading Skeleton */}
        {loading && (
          <div className="space-y-6 mx-2 sm:mx-0">
            <div className="flex justify-between items-center mb-1">
              <div className="w-48 h-6 bg-slate-200 rounded-lg skeleton-shimmer"></div>
              <div className="w-24 h-8 bg-slate-200 rounded-lg skeleton-shimmer"></div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 space-y-6">
              <div className="w-full h-24 bg-slate-100 rounded-2xl skeleton-shimmer"></div>
              <div className="h-10 bg-slate-100 rounded-xl skeleton-shimmer"></div>
              <div className="h-14 bg-slate-50/50 rounded-xl skeleton-shimmer"></div>
            </div>
          </div>
        )}

        {/* Results Wrapper */}
        {searched && (
          <div className="animate-fade-in">
            {/* Not registered */}
            {notFound && (
              <div className="card mx-2 sm:mx-0 px-6 py-8 text-center print:border print:border-slate-300">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No registration found</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto mb-5 leading-relaxed">
                  We couldn't find any account record associated with <span className="font-bold text-slate-700 break-all">{input.trim()}</span>.
                  Please double-check and try again, or contact Gopalkrishna Prabhu at <a href="tel:8277487290" className="font-bold text-indigo-600 hover:underline">8277487290</a>
                </p>
                <button onClick={handleReset} className="btn-secondary text-sm">
                  Try Again
                </button>
              </div>
            )}

            {/* Found Accounts */}
            {!notFound && accountResults.length > 0 && (
              <div className="space-y-6">
                {/* Result Header */}
                <div className="flex flex-col gap-3 mx-2 sm:mx-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Account Details for</p>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">{devoteeName}'s Group</h3>
                    </div>
                    <div className="flex gap-2 print:hidden">
                      <button
                        onClick={handleShare}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:bg-slate-50"
                        title="Share link to these details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.316-2.158m0 0a3 3 0 10-4.684-2.484 3 3 0 004.684 2.484zm0 12.484a3 3 0 11-4.684-2.484 3 3 0 014.684 2.484zm0-6.242L8.684 13.26a3 3 0 010-1.018l4.682-2.342" />
                        </svg>
                        Share
                      </button>
                      <button onClick={() => window.print()} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:bg-slate-50">
                        <span>🖨️</span>
                        Print / PDF
                      </button>
                      <button onClick={handleReset} className="btn-secondary text-xs py-1.5 px-3">
                        Search Again
                      </button>
                    </div>
                  </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mx-2 sm:mx-0 print:border print:border-slate-200 print:rounded-2xl print:p-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] text-indigo-600 uppercase tracking-widest font-black">Group Leader</p>
                    <p className="text-lg font-black text-slate-800 mt-1 truncate" title={devoteeName}>{devoteeName}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-black">Total Paid (1st Inst.)</p>
                    <p className="text-lg font-black text-slate-800 mt-1">₹{totalPaid.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] text-rose-600 uppercase tracking-widest font-black">Total Pending</p>
                    <p className="text-lg font-black text-rose-600 mt-1">₹{totalPending.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Accounts Table */}
                <div className="mx-2 sm:mx-0 overflow-hidden rounded-2xl border border-slate-100 shadow-lg bg-white/95 backdrop-blur-md animate-slide-up print:shadow-none print:border-slate-300">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs uppercase tracking-wider">
                          <th className="px-3 sm:px-6 py-4 font-black">Name</th>
                          <th className="px-3 sm:px-6 py-4 font-black">Room</th>
                          <th className="px-3 sm:px-6 py-4 font-black text-right">Paid</th>
                          <th className="px-3 sm:px-6 py-4 font-black text-right">Pending</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {accountResults.map((row, idx) => {
                          const name = row['Individual Name'] || '';
                          const room = row['Room'] || 'Not specified';
                          const inst = parseFloat(row['1st Installment']) || 0;
                          const pend = parseFloat(row['Pending']) || 0;
                          return (
                            <tr key={idx} className="hover:bg-indigo-50/10 transition-colors">
                              <td className="px-3 sm:px-6 py-4 font-bold text-slate-800 text-sm">{name}</td>
                              <td className="px-3 sm:px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-bold ${
                                  room.toLowerCase().includes('non ac')
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200/50'
                                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200/50'
                                }`}>
                                  {room}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-4 text-right font-semibold text-slate-700 text-sm">
                                ₹{inst.toLocaleString('en-IN')}
                              </td>
                              <td className="px-3 sm:px-6 py-4 text-right font-black text-slate-900 text-sm">
                                ₹{pend.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          );
                        })}
                        {/* Total Pending Row - Highlighted */}
                        <tr className="bg-gradient-to-r from-rose-50 to-rose-100/60 font-bold border-t-2 border-rose-300">
                          <td colSpan="3" className="px-3 sm:px-6 py-4 text-right text-rose-900 font-extrabold uppercase tracking-wider text-xs">
                            Total Pending Amount
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-right text-rose-700 font-black text-lg">
                            ₹{totalPending.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Important Disclaimer / Notice */}
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-center shadow-sm mx-2 sm:mx-0 print:border-slate-300">
                  <p className="text-amber-800 text-sm font-black leading-relaxed">
                    ⚠️ These details may change. Please recheck this site before Registering.
                  </p>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-slate-400 text-xs mt-12 print:mt-6 pb-20">
          <p>© 2026 GNH Community · For help/clarification regarding Accounts, contact <strong className="text-slate-500 font-bold">Gopalkrishna Prabhu at <a href="tel:8277487290" className="hover:underline">8277487290</a></strong></p>
        </footer>
      </main>
      <BottomNavigation currentSearchTerm={input} />
    </div>
  );
}

export default function Accounts() {
  return (
    <ErrorBoundary>
      <AccountsContent />
    </ErrorBoundary>
  );
}
