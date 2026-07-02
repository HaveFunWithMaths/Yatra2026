import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { NOTICES, getHotelTab } from '../utils/hotelConfig';
import { findRooms, matchPhoneOrEmail } from '../utils/accommodationUtils';
import { fetchRegistrationData, fetchPaymentsData, fetchAccommodationData } from '../utils/csvCache';
import { Bed, Wallet, Search, RefreshCw, ArrowLeft, Share2, Printer, Phone, Check, AlertTriangle, Info, MapPin, Image, X } from 'lucide-react';

const cleanName = (name) => (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
const isTBD = (val) => (val || '').trim().toUpperCase() === 'TBD';

const highlightMatch = (text, match) => {
  if (!match) return text;
  const parts = text.split(new RegExp(`(${match.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === match.toLowerCase() 
          ? <mark key={i} className="bg-amber-100 text-amber-900 font-semibold p-0.5 rounded">{part}</mark>
          : part
      )}
    </span>
  );
};

function DevoteeDetailsContent() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'accommodation'

  // Loaded data
  const [regRows, setRegRows] = useState([]);
  const [paymentsRows, setPaymentsRows] = useState([]);
  const [accomRows, setAccomRows] = useState([]);

  // Result state
  const [devoteeName, setDevoteeName] = useState('');
  const [paymentResults, setPaymentResults] = useState([]);
  const [roomResults, setRoomResults] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [noRoomsYet, setNoRoomsYet] = useState(false);

  // Suggestions Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch all sheets in parallel on mount
  const loadAllSheets = useCallback(async (force = false) => {
    try {
      const [reg, pay, accom] = await Promise.all([
        fetchRegistrationData(force),
        fetchPaymentsData(force),
        fetchAccommodationData(force),
      ]);
      setRegRows(reg);
      setPaymentsRows(pay);
      setAccomRows(accom);
      return { reg, pay, accom };
    } catch (err) {
      console.error('Details prefetch error:', err);
      setError('Unable to load devotee database. Please try refreshing.');
      return null;
    }
  }, []);

  useEffect(() => {
    loadAllSheets().then((data) => {
      // Check query params after loading data
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get('q');
      const tabParam = params.get('tab');
      if (tabParam === 'accommodation' || tabParam === 'payments') {
        setActiveTab(tabParam);
      }
      if (qParam && data) {
        setSearchTerm(qParam);
        handleSearchWithData(qParam, data.reg, data.pay, data.accom);
      }
    });
  }, [loadAllSheets]);

  // Clean suggestion click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // List of group leaders for Autocomplete suggestions
  const autocompleteList = useMemo(() => {
    let lastDevName = '';
    let lastPhone = '';
    const map = {};

    paymentsRows.forEach(row => {
      const colA = row['Devotee Name']?.trim();
      const colB = row['Number']?.trim();
      if (colA) lastDevName = colA;
      if (colB) lastPhone = colB;
      if (lastDevName) {
        map[lastDevName] = lastPhone || '';
      }
    });

    return Object.entries(map).map(([name, phone]) => ({ name, phone }));
  }, [paymentsRows]);

  // Update autocomplete suggestions based on search text
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term || autocompleteList.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const hasDigits = /\d/.test(term);
    const cleanTermPhone = term.replace(/\D/g, '');

    const matches = autocompleteList.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(term);
      const phoneMatch = hasDigits && cleanTermPhone ? (item.phone || '').replace(/\D/g, '').includes(cleanTermPhone) : false;
      return nameMatch || phoneMatch;
    }).slice(0, 8);

    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    setActiveSuggestionIdx(-1);
  }, [searchTerm, autocompleteList]);

  // Unified lookup function supporting phone, email, devotee name or individual name
  const handleSearchWithData = (searchValue, regData, payData, accomData) => {
    const term = (searchValue || '').trim();
    if (!term) {
      setError('Please enter a name or phone number.');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(false);
    setNotFound(false);
    setNoRoomsYet(false);
    setPaymentResults([]);
    setRoomResults([]);
    setDevoteeName('');

    // Process registration rows (forward-fill devotee leader name & phone)
    let lastRegDevName = '';
    let lastRegPhone = '';
    const processedReg = regData
      .filter(row => row['Individual Name'] && row['Age'])
      .map(row => {
        const colA = row['Devotee Name']?.trim();
        const colB = row['WhatsApp Number']?.trim();
        if (colA) lastRegDevName = colA;
        if (colB) lastRegPhone = colB;
        return {
          ...row,
          _devName: lastRegDevName,
          _phone: lastRegPhone,
        };
      });

    // Process payments rows (forward-fill devotee leader name & phone)
    let lastPayDevName = '';
    let lastPayPhone = '';
    const processedPayments = payData.map(row => {
      const colA = row['Devotee Name']?.trim();
      const colB = row['Number']?.trim();
      if (colA) lastPayDevName = colA;
      if (colB) lastPayPhone = colB;
      return {
        ...row,
        _devName: lastPayDevName,
        _phone: lastPayPhone,
      };
    });

    const searchLower = term.toLowerCase();

    // 1. Try match by phone/email in Registration
    let matchedLeaderName = null;
    for (const row of processedReg) {
      const phone = row._phone || row['WhatsApp Number'] || '';
      const email = row['Email'] || '';
      if (matchPhoneOrEmail(phone, term) || matchPhoneOrEmail(email, term)) {
        matchedLeaderName = row._devName || row['Devotee Name'];
        break;
      }
    }

    // 2. Try match by phone in Payments
    if (!matchedLeaderName) {
      const rowWithPhone = processedPayments.find(row => matchPhoneOrEmail(row._phone, term));
      if (rowWithPhone) {
        matchedLeaderName = rowWithPhone._devName;
      }
    }

    // 3. Try exact Devotee Name (Group Leader) match
    if (!matchedLeaderName) {
      const match = processedReg.find(row => 
        (row._devName || '').toLowerCase() === searchLower || 
        (row['Devotee Name'] || '').toLowerCase() === searchLower
      );
      if (match) {
        matchedLeaderName = match._devName || match['Devotee Name'];
      }
    }

    // 4. Try exact Individual Name match
    if (!matchedLeaderName) {
      const match = processedReg.find(row => 
        (row['Individual Name'] || '').toLowerCase() === searchLower
      );
      if (match) {
        matchedLeaderName = match._devName || match['Devotee Name'];
      }
    }

    // 5. Try partial Devotee Name (Group Leader) match
    if (!matchedLeaderName) {
      const match = processedReg.find(row => 
        (row._devName || '').toLowerCase().includes(searchLower) || 
        (row['Devotee Name'] || '').toLowerCase().includes(searchLower)
      );
      if (match) {
        matchedLeaderName = match._devName || match['Devotee Name'];
      }
    }

    // 6. Try partial Individual Name match
    if (!matchedLeaderName) {
      const match = processedReg.find(row => 
        (row['Individual Name'] || '').toLowerCase().includes(searchLower)
      );
      if (match) {
        matchedLeaderName = match._devName || match['Devotee Name'];
      }
    }

    // If no match found
    if (!matchedLeaderName) {
      setNotFound(true);
      setSearched(true);
      setLoading(false);
      return;
    }

    setDevoteeName(matchedLeaderName);

    // Save search input in localStorage (compatible with other pages)
    localStorage.setItem('gnh_yatra_accom_input', term);

    // Collect all Individual Names within that group
    const groupIndividualNames = [];
    const normLeader = matchedLeaderName.toLowerCase().trim();
    processedReg.forEach(row => {
      const rowLeader = (row._devName || row['Devotee Name'] || '').toLowerCase().trim();
      if (rowLeader === normLeader) {
        const indiv = (row['Individual Name'] || '').trim();
        if (indiv) groupIndividualNames.push(indiv);
      }
    });

    // 1. Process Accommodation Rooms
    const rooms = findRooms(accomData, groupIndividualNames);
    if (rooms.length === 0) {
      setNoRoomsYet(true);
      setRoomResults([]);
    } else {
      setRoomResults(rooms);
    }

    // 2. Process Payments Rows
    const normTarget = cleanName(matchedLeaderName);
    const matchedPayments = processedPayments.filter(row => cleanName(row._devName) === normTarget);
    setPaymentResults(matchedPayments);

    // Update query params in URL
    const url = new URL(window.location);
    url.searchParams.set('q', term);
    window.history.replaceState({}, '', url);

    setSearched(true);
    setLoading(false);
  };

  const handleSearchTrigger = (searchValue) => {
    handleSearchWithData(searchValue, regRows, paymentsRows, accomRows);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showSuggestions) {
        setShowSuggestions(true);
        return;
      }
      setActiveSuggestionIdx(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIdx(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && activeSuggestionIdx >= 0 && activeSuggestionIdx < suggestions.length) {
        const selected = suggestions[activeSuggestionIdx];
        setSearchTerm(selected.name);
        handleSearchTrigger(selected.name);
      } else {
        handleSearchTrigger(searchTerm);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSearched(false);
    setNotFound(false);
    setNoRoomsYet(false);
    setPaymentResults([]);
    setRoomResults([]);
    setDevoteeName('');
    setError('');
    localStorage.removeItem('gnh_yatra_accom_input');

    const url = new URL(window.location);
    url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
  };

  // Sync tab change to URL query params
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    const url = new URL(window.location);
    url.searchParams.set('tab', tabName);
    window.history.replaceState({}, '', url);
  };

  // Share functionality
  const handleShare = async () => {
    const activeTerm = devoteeName || searchTerm;
    const shareUrl = `${window.location.origin}/devotee-details?q=${encodeURIComponent(activeTerm)}&tab=${activeTab}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `GNH Yatra 2026 details`,
          text: `Check out details for ${devoteeName}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share failed', err);
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

  // Payments summary calculations
  const hasTBDPaid = paymentResults.some(row => isTBD(row['1st Installment']) || isTBD(row['Cash']));
  const hasTBDPending = paymentResults.some(row => isTBD(row['Pending']));
  const hasTBDAdvance = paymentResults.some(row => isTBD(row['Advance']));

  const totalPaid = hasTBDPaid ? 'TBD' : paymentResults.reduce((sum, row) => sum + (parseFloat(row['1st Installment']) || 0) + (parseFloat(row['Cash']) || 0), 0);
  const totalPending = hasTBDPending ? 'TBD' : paymentResults.reduce((sum, row) => sum + (parseFloat(row['Pending']) || 0), 0);
  const totalAdvance = hasTBDAdvance ? 'TBD' : paymentResults.reduce((sum, row) => sum + (parseFloat(row['Advance']) || 0), 0);

  // Check if Advance is non-zero for any group member
  const showAdvance = paymentResults.some(row => {
    const val = parseFloat(row['Advance']);
    return !isNaN(val) && val !== 0;
  });

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fdf6ec 0%, #f5f0ff 50%, #ecf0ff 100%)' }}>
      {/* Header */}
      <header className="bg-white/85 backdrop-blur-md shadow-sm sticky top-0 z-40 print:hidden border-b border-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                navigate('/admin'); // Redirect back to Admin
              }}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
              title="Back to Admin"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src="/assets/GNHLogo.png" alt="GNH Logo" className="h-8 w-auto shrink-0" />
            <div>
              <h1 className="text-base md:text-xl font-black text-slate-800 leading-none">
                GNH Yatra 2026
              </h1>
              <p className="text-[10px] md:text-xs font-bold tracking-wider mt-0.5 uppercase text-indigo-600">
                Devotee Details
              </p>
            </div>
          </div>

          <button
            onClick={() => loadAllSheets(true)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 flex items-center gap-1.5 text-xs font-bold"
            title="Refresh Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        
        {/* Search Input Box */}
        <div className="card px-4 py-5 mb-6 animate-slide-up print:hidden bg-white rounded-3xl shadow-sm border border-indigo-50/50">
          <label className="form-label font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 block" htmlFor="details-search-input">
            Devotee Name or Phone Number
          </label>
          <div className="relative flex flex-col sm:flex-row gap-3" ref={suggestionsRef}>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                id="details-search-input"
                type="text"
                className="form-input w-full font-semibold focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                placeholder="e.g. Gopalkrishna Prabhu or 9876543210"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                disabled={loading}
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  onClick={handleReset}
                  className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => handleSearchTrigger(searchTerm)}
              disabled={loading || !searchTerm.trim()}
              className="btn-primary w-full sm:w-auto px-6 py-3 font-bold flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>

            {/* Suggestions list */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-50">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(item.name);
                      handleSearchTrigger(item.name);
                    }}
                    onMouseEnter={() => setActiveSuggestionIdx(index)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between text-xs font-bold transition-colors ${
                      index === activeSuggestionIdx ? 'bg-indigo-50/70 text-indigo-900' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate max-w-[70%]">{highlightMatch(item.name, searchTerm)}</span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
                      <span>📞</span>
                      {highlightMatch(item.phone, searchTerm)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {error && <p className="mt-2 text-xs text-rose-600 font-bold">{error}</p>}
        </div>

        {/* Loading shimmer */}
        {loading && (
          <div className="space-y-6">
            <div className="h-6 bg-slate-200 rounded-lg w-2/3 animate-pulse" />
            <div className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
          </div>
        )}

        {/* Results Screen */}
        {searched && (
          <div className="space-y-6">
            {notFound && (
              <div className="card px-6 py-10 text-center bg-white rounded-3xl border border-indigo-50 shadow-md">
                <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">No devotee record found</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">
                  We couldn't find any registration or payment records matching <span className="font-bold text-slate-700">"{searchTerm}"</span>.
                </p>
                <button onClick={handleReset} className="btn-secondary text-sm">
                  Search Again
                </button>
              </div>
            )}

            {!notFound && (
              <div className="space-y-6 animate-fade-in">
                {/* Result Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-indigo-500 uppercase tracking-widest font-black">Group Details</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">{devoteeName}'s Group</h2>
                  </div>
                  <div className="flex gap-2 print:hidden shrink-0">
                    <button
                      onClick={handleShare}
                      className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 hover:bg-slate-50"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      Share
                    </button>
                    <button 
                      onClick={() => window.print()} 
                      className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 hover:bg-slate-50"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      Print
                    </button>
                  </div>
                </div>

                {/* Combined Tabs Bar */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1.5 print:hidden">
                  <button
                    onClick={() => handleTabChange('payments')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      activeTab === 'payments'
                        ? 'bg-white text-indigo-600 shadow-sm scale-[1.02]'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    Payments
                  </button>
                  <button
                    onClick={() => handleTabChange('accommodation')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      activeTab === 'accommodation'
                        ? 'bg-white text-indigo-600 shadow-sm scale-[1.02]'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Bed className="w-4 h-4" />
                    Accommodation
                  </button>
                </div>

                {/* Tab Content: Payments */}
                {activeTab === 'payments' && (
                  <div className="space-y-6">
                    {/* Summary KPI Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-black mb-1">Total Paid</p>
                        <p className="text-2xl font-black text-slate-800">
                          {totalPaid === 'TBD' ? 'TBD' : '₹' + totalPaid.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">1st Inst + Cash</p>
                      </div>
                      <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-[10px] text-rose-600 uppercase tracking-widest font-black mb-1">Total Pending</p>
                        <p className="text-2xl font-black text-rose-600">
                          {totalPending === 'TBD' ? 'TBD' : '₹' + totalPending.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-rose-400 font-semibold mt-0.5">Balance due</p>
                      </div>
                    </div>

                    {paymentResults.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
                        <p className="text-slate-500 text-sm font-bold">No payments records found for this group.</p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-lg bg-white/95 backdrop-blur-md">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                                <th className="px-4 py-3.5 font-black">
                                  <div className={showAdvance ? "max-w-[100px] sm:max-w-none truncate" : ""}>
                                    Name
                                  </div>
                                </th>
                                <th className="px-4 py-3.5 font-black">Room</th>
                                <th className="px-4 py-3.5 font-black text-right">Paid</th>
                                <th className="px-4 py-3.5 font-black text-right">Pending</th>
                                {showAdvance && <th className="px-4 py-3.5 font-black text-right">Advance</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {paymentResults.map((row, idx) => {
                                const name = row['Individual Name'] || '';
                                const room = row['Room'] || 'Not specified';
                                const instVal = row['1st Installment'];
                                const cashVal = row['Cash'];
                                const pendVal = row['Pending'];
                                const advVal = row['Advance'];

                                const isInstTBD = isTBD(instVal);
                                const isCashTBD = isTBD(cashVal);
                                const isPendTBD = isTBD(pendVal);
                                const isAdvTBD = isTBD(advVal);

                                const inst = isInstTBD ? 0 : parseFloat(instVal) || 0;
                                const cash = isCashTBD ? 0 : parseFloat(cashVal) || 0;
                                const paidAmount = (isInstTBD || isCashTBD) ? 'TBD' : (inst + cash);
                                const pend = isPendTBD ? 0 : parseFloat(pendVal) || 0;
                                const adv = isAdvTBD ? 0 : parseFloat(advVal) || 0;

                                return (
                                  <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                    <td className="px-4 py-3.5 font-extrabold text-slate-800 text-base">
                                      <div className={showAdvance ? "max-w-[100px] sm:max-w-none truncate" : ""}>
                                        {name}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                                        {room}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-extrabold text-emerald-700 text-base">
                                      {paidAmount === 'TBD' ? 'TBD' : '₹' + paidAmount.toLocaleString('en-IN')}
                                    </td>
                                    <td className={`px-4 py-3.5 text-right font-black text-base ${
                                      isPendTBD ? 'text-slate-500' : pend > 0 ? 'text-rose-600' : 'text-emerald-600'
                                    }`}>
                                      {isPendTBD ? 'TBD' : pend > 0 ? '₹' + pend.toLocaleString('en-IN') : '✓ Cleared'}
                                    </td>
                                    {showAdvance && (
                                      <td className="px-4 py-3.5 text-right font-extrabold text-indigo-700 text-base">
                                        {isAdvTBD ? 'TBD' : '₹' + adv.toLocaleString('en-IN')}
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                              {/* Total Pending Row */}
                              <tr className="bg-gradient-to-r from-rose-50 to-rose-100/60 font-bold border-t-2 border-rose-200">
                                <td colSpan="3" className="px-4 py-4 text-right text-rose-900 font-extrabold uppercase tracking-wider text-xs">
                                  Total Pending
                                </td>
                                <td className={`px-4 py-4 text-right font-black text-lg ${
                                  totalPending === 'TBD' ? 'text-slate-600' : totalPending > 0 ? 'text-rose-700' : 'text-emerald-600'
                                }`}>
                                  {totalPending === 'TBD' ? 'TBD' : totalPending > 0 ? '₹' + totalPending.toLocaleString('en-IN') : '✓ All Clear'}
                                </td>
                                {showAdvance && (
                                  <td className="px-4 py-4 text-right font-black text-lg text-indigo-700">
                                    {totalAdvance === 'TBD' ? 'TBD' : '₹' + totalAdvance.toLocaleString('en-IN')}
                                  </td>
                                )}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Yatra Contribution Coverage Details */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                      <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                        This amount covers the entire yatra, starting from your arrival in Hampi until your departure from Hampi.
                      </p>
                      <div className="space-y-2.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">The contribution includes:</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-bold">
                          <li className="flex items-start gap-2">
                            <span className="shrink-0 text-emerald-600">✅</span>
                            <span>3 time Prasadam throughout the yatra</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="shrink-0 text-emerald-600">✅</span>
                            <span>Accommodation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="shrink-0 text-emerald-600">✅</span>
                            <span>Transportation to all holy places</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="shrink-0 text-emerald-600">✅</span>
                            <span>Hall arrangements & expenses</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Accommodation */}
                {activeTab === 'accommodation' && (
                  <div className="space-y-6">
                    {/* Summary Info Header */}
                    {roomResults.length > 0 && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex items-start gap-3 print:hidden">
                        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-indigo-900 text-sm font-bold">
                            Found <span className="font-extrabold text-indigo-700">{roomResults.length}</span> room{roomResults.length !== 1 ? 's' : ''} assigned to your group.
                          </p>
                          <p className="text-xs text-indigo-800/80 mt-0.5">
                            Your registered members are highlighted in indigo on the cards below.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Room Details Map and Photos Link */}
                    <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-50/30 rounded-2xl shadow-sm border border-amber-200/60 p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-slate-800 font-extrabold text-sm">Yatra Hall Location</h4>
                            <a
                              href="https://maps.app.goo.gl/SCp7SALucDA5ELLc9"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-bold inline-flex items-center gap-1 hover:underline mt-1 print:hidden"
                            >
                              Open in Google Maps →
                            </a>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 border-t sm:border-t-0 sm:border-l border-amber-200/40 pt-3 sm:pt-0 sm:pl-4">
                          <Image className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-slate-800 font-extrabold text-sm">Sample Rooms Picture</h4>
                            <button
                              onClick={() => {
                                const firstHotel = roomResults[0]?.room?.hotel;
                                const tabName = getHotelTab(firstHotel);
                                navigate(`/hotel?tab=${encodeURIComponent(tabName)}`);
                              }}
                              disabled={roomResults.length === 0}
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-bold inline-flex items-center gap-1 hover:underline mt-1 print:hidden disabled:opacity-50"
                            >
                              View Sample Photos →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Room Cards */}
                    {noRoomsYet ? (
                      <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-2xl px-6 py-8 text-center relative overflow-hidden">
                        <h3 className="text-lg font-black text-amber-800 mb-1">Room Not Assigned Yet</h3>
                        <p className="text-slate-600 text-xs max-w-sm mx-auto">
                          We'll notify you here once rooms are assigned.
                        </p>
                      </div>
                    ) : roomResults.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
                        <p className="text-slate-500 text-sm font-bold">No rooms data found for this group.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {roomResults.map((result, idx) => (
                          <RoomCard
                            key={`${result.room.hotel}-${result.room.roomNo}-${idx}`}
                            room={result.room}
                            matchedNames={result.matchedNames}
                            index={idx}
                          />
                        ))}
                      </div>
                    )}

                    {/* General Notices */}
                    {NOTICES.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {NOTICES.map((notice, nIdx) => (
                          <p key={nIdx} className="text-center text-xs text-slate-400 font-semibold">
                            {notice}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Important Disclaimer Warning */}
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-center shadow-sm">
                  <p className="text-amber-800 text-xs font-bold leading-relaxed">
                    ⚠️ Details are subject to change. Please verify with organizers.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DevoteeDetails() {
  return (
    <ErrorBoundary>
      <DevoteeDetailsContent />
    </ErrorBoundary>
  );
}
