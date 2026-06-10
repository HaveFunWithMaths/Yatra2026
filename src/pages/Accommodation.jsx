import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import RoomCard from '../components/RoomCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { NOTICES } from '../utils/hotelConfig';
import { findGroupNames, findRooms } from '../utils/accommodationUtils';

// Public CSV export URLs
const REGISTRATION_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1GIEPXnjsjw7RClGwgOFVOrZemhlqY7jAMl7t2FNkvos/export?format=csv';
const ACCOMMODATION_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1qbw2uXcD4Nezswp6igIXeqB3MrGW_4YRYeamzOggY2A/export?format=csv';

function AccommodationContent() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [devoteeName, setDevoteeName] = useState('');
  const [roomResults, setRoomResults] = useState([]); // [{ room, matchedNames }]
  const [notFound, setNotFound] = useState(false);
  const [noRoomsYet, setNoRoomsYet] = useState(false);

  const handleSearch = useCallback(async (searchValue) => {
    const term = (typeof searchValue === 'string' ? searchValue : input).trim();
    if (!term) {
      setError('Please enter your phone number or email address.');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(false);
    setNotFound(false);
    setNoRoomsYet(false);
    setRoomResults([]);
    setDevoteeName('');

    try {
      // Fetch both sheets in parallel
      const [regText, accomText] = await Promise.all([
        fetch(REGISTRATION_CSV_URL).then(r => r.text()),
        fetch(ACCOMMODATION_CSV_URL).then(r => r.text()),
      ]);

      const regParsed = Papa.parse(regText, { header: true, skipEmptyLines: true });
      const accomParsed = Papa.parse(accomText, { header: true, skipEmptyLines: true });

      const regRows = regParsed.data;
      const accomRows = accomParsed.data;

      // Step 1: Find group
      const groupResult = findGroupNames(regRows, term);
      if (!groupResult) {
        setNotFound(true);
        setSearched(true);
        setLoading(false);
        return;
      }

      setDevoteeName(groupResult.devoteeName);
      
      // Save valid lookup in localStorage
      localStorage.setItem('gnh_yatra_accom_input', term);

      // Step 2: Find rooms
      const rooms = findRooms(accomRows, groupResult.individualNames);

      if (rooms.length === 0) {
        setNoRoomsYet(true);
        setRoomResults([]);
      } else {
        setRoomResults(rooms);
      }

      setSearched(true);
    } catch (err) {
      console.error('Accommodation lookup error:', err);
      setError('Something went wrong while fetching data. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, [input]);

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
  }, [handleSearch]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleReset = () => {
    setInput('');
    setSearched(false);
    setNotFound(false);
    setNoRoomsYet(false);
    setRoomResults([]);
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
          title: 'GNH Yatra 2026 Accommodation',
          text: `Check out the GNH Yatra 2026 Accommodation details for ${devoteeName}`,
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
            <p className="text-[10px] md:text-xs text-amber-600 font-bold tracking-wider mt-0.5 uppercase">Accommodation Lookup</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-0 sm:px-4 pt-4 sm:pt-10 pb-16 print:pt-4">

        {/* Hero Section */}
        <div className="text-center mb-4 sm:mb-8 animate-fade-in print:hidden">
          <h2 className="text-2xl sm:text-2xl md:text-3xl font-black text-slate-800 mb-2">Your Accommodation</h2>
          <p className="text-slate-500 text-sm md:text-sm max-w-sm mx-auto leading-relaxed">
            Enter the phone number or email you used during registration to view your room assignment.
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
              onClick={() => handleSearch()}
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
            
            {/* Shimmer Card Box */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 space-y-6">
              <div className="w-full h-24 bg-slate-100 rounded-2xl skeleton-shimmer"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-10 bg-slate-100 rounded-xl skeleton-shimmer"></div>
                <div className="h-10 bg-slate-100 rounded-xl skeleton-shimmer"></div>
                <div className="h-10 bg-slate-100 rounded-xl skeleton-shimmer"></div>
              </div>
              <div className="h-14 bg-slate-50/50 rounded-xl skeleton-shimmer"></div>
              <div className="space-y-3">
                <div className="w-32 h-4 bg-slate-200 rounded-md skeleton-shimmer"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="h-10 bg-slate-100 rounded-xl skeleton-shimmer"></div>
                  <div className="h-10 bg-slate-100 rounded-xl skeleton-shimmer"></div>
                </div>
              </div>
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
                  We couldn't find anyone registered with <span className="font-bold text-slate-700 break-all">{input.trim()}</span>.
                  Please double-check and try again, or contact Akash Prabhu at <a href="tel:9381301587" className="font-bold text-indigo-600 hover:underline">9381301587</a>
                </p>
                <button onClick={handleReset} className="btn-secondary text-sm">
                  Try Again
                </button>
              </div>
            )}

            {/* Registered but no room yet */}
            {!notFound && noRoomsYet && (
              <div className="space-y-4 mx-2 sm:mx-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Found registration for</p>
                    <h3 className="text-2xl font-black text-slate-800 leading-tight">{devoteeName}</h3>
                  </div>
                  <button onClick={handleReset} className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto print:hidden">
                    Search Again
                  </button>
                </div>
                
                {/* Custom animated warm gradient "not assigned" box */}
                <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 border-l-4 border-amber-500 rounded-2xl px-6 py-8 text-center shadow-md shadow-amber-500/5 relative overflow-hidden">
                  <div className="absolute top-2 right-2 flex items-center justify-center text-amber-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-28 h-28 transform rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="relative">
                    <div className="w-14 h-14 bg-amber-100/80 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-600 animate-pulse-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-black text-amber-800 mb-2">Room Not Assigned Yet</h3>
                    <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                      We'll notify this page once rooms are assigned
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Found rooms */}
            {!notFound && roomResults.length > 0 && (
              <div className="space-y-6">
                {/* Result Header */}
                <div className="flex flex-col gap-3 mx-2 sm:mx-0">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Accommodation for</p>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">{devoteeName}'s Group</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 print:hidden">
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
                    <button
                      onClick={() => window.print()}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:bg-slate-50"
                    >
                      <span>🖨️</span>
                      Print / PDF
                    </button>
                    <button onClick={handleReset} className="btn-secondary text-xs py-1.5 px-3">
                      Search Again
                    </button>
                  </div>
                </div>

                {/* Summary badge */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3.5 flex items-start gap-3 mx-2 sm:mx-0 print:hidden">
                  <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-indigo-900 text-xs font-bold leading-normal">
                      Found <span className="font-extrabold text-indigo-700">{roomResults.length}</span> room{roomResults.length !== 1 ? 's' : ''} for your group.
                    </p>
                    <p className="text-[11px] text-indigo-800/80 font-medium mt-0.5">
                      Your registered members are highlighted in indigo.
                    </p>
                  </div>
                </div>

                {/* Yatra Quick Reference Info Box - Warm gold gradient decoration */}
                <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-50/30 rounded-2xl shadow-md border border-amber-200/60 p-5 space-y-4 mx-2 sm:mx-0 print:border-slate-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-emerald-200/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5.5 h-5.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-extrabold text-sm">Yatra Hall Location</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Main gathering & prasadam hall</p>
                        <a
                          href="https://maps.app.goo.gl/SCp7SALucDA5ELLc9"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-bold inline-flex items-center gap-1 hover:underline mt-1.5 print:hidden"
                        >
                          Open Hall in Google Maps →
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 border-t sm:border-t-0 sm:border-l border-amber-200/40 pt-3 sm:pt-0 sm:pl-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-purple-200/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5.5 h-5.5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-extrabold text-sm">Sample Rooms Picture</h4>
                        <p className="text-slate-500 text-xs mt-0.5">View reference photos of rooms</p>
                        <a
                          href="https://docs.google.com/document/d/10lcnCl56xsLGMz2agLA9dk2ZvyEQNVdEm1R25EK28QE/edit?tab=t.0"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-bold inline-flex items-center gap-1 hover:underline mt-1.5 print:hidden"
                        >
                          View Sample Photos →
                        </a>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Room Cards — one per unique room row */}
                {roomResults.map((result, idx) => (
                  <RoomCard
                    key={`${result.room.hotel}-${result.room.roomNo}-${idx}`}
                    room={result.room}
                    matchedNames={result.matchedNames}
                    index={idx}
                  />
                ))}

                {/* General notices — shown below room cards, no icon */}
                {NOTICES.length > 0 && (
                  <div className="space-y-1.5 mx-2 sm:mx-0">
                    {NOTICES.map((notice, nIdx) => (
                      <p key={nIdx} className="text-center text-xs text-slate-400 font-medium">
                        {notice}
                      </p>
                    ))}
                  </div>
                )}

                {/* Important Warning Notice */}
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-center shadow-sm mx-2 sm:mx-0 print:border-slate-300 animate-fade-in">
                  <p className="text-amber-800 text-sm font-black leading-relaxed">
                    ⚠️ These details may change. Please recheck this site before checking in.
                  </p>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-slate-400 text-xs mt-12 print:mt-6">
          <p>© 2026 GNH Community · For help regarding Accommodation, contact <strong className="text-slate-500 font-bold">Akash Prabhu at <a href="tel:9381301587" className="hover:underline">9381301587</a></strong></p>
        </footer>
      </main>
    </div>
  );
}

// Wrap inside ErrorBoundary
export default function Accommodation() {
  return (
    <ErrorBoundary>
      <AccommodationContent />
    </ErrorBoundary>
  );
}
