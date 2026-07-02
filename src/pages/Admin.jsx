import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { fetchRegistrationData, fetchPaymentsData, preloadAll } from '../utils/csvCache';
import { matchPhoneOrEmail } from '../utils/accommodationUtils';
import { Search, RefreshCw, Download, FileSpreadsheet, ArrowLeft, X, Check, AlertCircle, Phone, DollarSign, Users, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminContent() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  // Load data
  const loadData = useCallback(async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      // Parallel prefetching using the cache
      const [_, paymentsRows] = await Promise.all([
        fetchRegistrationData(force),
        fetchPaymentsData(force),
      ]);

      // Group payments by Devotee Name (forward-filled)
      let lastDevName = '';
      let lastPhone = '';
      
      const groupsMap = {};

      paymentsRows.forEach(row => {
        const colA = row['Devotee Name']?.trim();
        const colB = row['Number']?.trim();
        if (colA) lastDevName = colA;
        if (colB) lastPhone = colB;

        const groupKey = lastDevName || 'Unknown';
        if (!groupsMap[groupKey]) {
          groupsMap[groupKey] = {
            name: groupKey,
            phone: lastPhone || '',
            rows: [],
          };
        }
        groupsMap[groupKey].rows.push(row);
      });

      const isTBD = (val) => (val || '').trim().toUpperCase() === 'TBD';

      const groupedData = Object.values(groupsMap).map(group => {
        let hasTBDPaid = false;
        let hasTBDPending = false;
        let paidSum = 0;
        let pendingSum = 0;

        group.rows.forEach(row => {
          const paidVal = row['1st Installment'];
          const cashVal = row['Cash'];
          const pendVal = row['Pending'];

          if (isTBD(paidVal) || isTBD(cashVal)) hasTBDPaid = true;
          else paidSum += (parseFloat(paidVal) || 0) + (parseFloat(cashVal) || 0);

          if (isTBD(pendVal)) hasTBDPending = true;
          else pendingSum += parseFloat(pendVal) || 0;
        });

        const paid = hasTBDPaid ? 'TBD' : paidSum;
        const pending = hasTBDPending ? 'TBD' : pendingSum;
        const total = (paid === 'TBD' || pending === 'TBD') ? 'TBD' : (paid + pending);

        return {
          name: group.name,
          phone: group.phone,
          paid,
          pending,
          total,
          memberCount: group.rows.length
        };
      });

      setGroups(groupedData);
    } catch (err) {
      console.error('Admin page load error:', err);
      setError('Failed to fetch devotee yatra data. Please check connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    // Check URL parameters first
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    if (qParam) {
      setSearchTerm(qParam);
      setDebouncedSearch(qParam);
    }
    loadData();
  }, [loadData]);

  // Sync search term with URL
  const updateUrlParam = (value) => {
    const url = new URL(window.location);
    if (value.trim()) {
      url.searchParams.set('q', value.trim());
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url);
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      updateUrlParam(searchTerm);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside suggestions clears them
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

  // Filter groups based on search term
  const filteredGroups = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return groups;

    const hasDigits = /\d/.test(term);
    const cleanTermPhone = term.replace(/\D/g, '');

    return groups.filter(g => {
      const nameMatch = g.name.toLowerCase().includes(term);
      const phoneMatch = hasDigits && cleanTermPhone ? (g.phone || '').replace(/\D/g, '').includes(cleanTermPhone) : false;
      return nameMatch || phoneMatch;
    });
  }, [groups, debouncedSearch]);

  // Sort groups based on sorting state
  const sortedGroups = useMemo(() => {
    if (!sortField) return filteredGroups;

    return [...filteredGroups].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'phone':
          comparison = (a.phone || '').localeCompare(b.phone || '');
          break;
        case 'paid': {
          const valA = a.paid === 'TBD' ? -1 : a.paid;
          const valB = b.paid === 'TBD' ? -1 : b.paid;
          comparison = valA - valB;
          break;
        }
        case 'pending': {
          const valA = a.pending === 'TBD' ? -1 : a.pending;
          const valB = b.pending === 'TBD' ? -1 : b.pending;
          comparison = valA - valB;
          break;
        }
        case 'total': {
          const valA = a.total === 'TBD' ? -1 : a.total;
          const valB = b.total === 'TBD' ? -1 : b.total;
          comparison = valA - valB;
          break;
        }
        case 'status': {
          const getStatusScore = (g) => {
            const isFullyPaid = g.pending === 0;
            const isUnpaid = g.paid === 0;
            const hasTBD = g.pending === 'TBD' || g.paid === 'TBD';
            if (hasTBD) return 0;
            if (isUnpaid) return 1;
            if (isFullyPaid) return 3;
            return 2; // Part Paid
          };
          comparison = getStatusScore(a) - getStatusScore(b);
          break;
        }
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredGroups, sortField, sortDirection]);

  // Update suggestions dropdown
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term || groups.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const hasDigits = /\d/.test(term);
    const cleanTermPhone = term.replace(/\D/g, '');

    const matches = groups.filter(g => {
      const nameMatch = g.name.toLowerCase().includes(term);
      const phoneMatch = hasDigits && cleanTermPhone ? (g.phone || '').replace(/\D/g, '').includes(cleanTermPhone) : false;
      return nameMatch || phoneMatch;
    }).slice(0, 8); // cap at 8 suggestions

    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    setActiveSuggestionIdx(-1);
  }, [searchTerm, groups]);

  // KPI calculations
  const kpis = useMemo(() => {
    let totalGroups = groups.length;
    let totalPaid = 0;
    let totalPending = 0;
    let fullyPaidCount = 0;
    let hasTBDPaid = false;
    let hasTBDPending = false;

    groups.forEach(g => {
      if (g.paid === 'TBD') hasTBDPaid = true;
      else totalPaid += g.paid;

      if (g.pending === 'TBD') hasTBDPending = true;
      else {
        totalPending += g.pending;
        if (g.pending === 0) fullyPaidCount++;
      }
    });

    return {
      totalGroups,
      totalPaid: hasTBDPaid ? 'TBD' : totalPaid,
      totalPending: hasTBDPending ? 'TBD' : totalPending,
      totalAmount: (hasTBDPaid || hasTBDPending) ? 'TBD' : (totalPaid + totalPending),
      fullyPaidCount,
    };
  }, [groups]);

  // Suggestions Keyboard Navigation
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
      if (showSuggestions && activeSuggestionIdx >= 0 && activeSuggestionIdx < suggestions.length) {
        e.preventDefault();
        const selected = suggestions[activeSuggestionIdx];
        setSearchTerm(selected.name);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (sortedGroups.length === 0) return;

    // Headers
    const headers = ['Name', 'Phone', 'Paid', 'Pending', 'Total', 'Members'];
    
    // Rows
    const rows = sortedGroups.map(g => [
      g.name,
      g.phone,
      g.paid,
      g.pending,
      g.total,
      g.memberCount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Yatra_Payments_Admin_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for suggestion matching text highlighting
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

  // Format currency
  const formatCurrency = (val) => {
    if (val === 'TBD') return 'TBD';
    return '₹' + val.toLocaleString('en-IN');
  };

  // Quick Action: navigate user to search page
  const handleQuickView = (group) => {
    navigate(`/devotee-details?q=${encodeURIComponent(group.name)}`);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-75 transition-opacity inline ml-1 shrink-0" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-amber-400 inline ml-1 shrink-0" />
      : <ArrowDown className="w-3.5 h-3.5 text-amber-400 inline ml-1 shrink-0" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-300 hover:text-white"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src="/assets/GNHLogo.png" alt="GNH Logo" className="h-8 w-auto shrink-0" />
            <div>
              <h1 className="text-base md:text-lg font-black tracking-tight leading-none">
                GNH Yatra 2026
              </h1>
              <p className="text-[10px] md:text-xs font-bold tracking-widest text-amber-400 mt-0.5 uppercase">
                Admin Payments Dashboard
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={exportToCSV}
              disabled={sortedGroups.length === 0}
              className="p-2 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors text-slate-950 flex items-center gap-1.5 text-xs font-extrabold disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-6">
        
        {/* Connection/Data Error Summary */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Failed to retrieve latest sheets</p>
              <p className="text-xs text-rose-700/90 mt-0.5 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/80 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Groups</p>
              <p className="text-xl md:text-2xl font-black text-slate-800">{loading ? '...' : kpis.totalGroups}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/80 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Paid</p>
              <p className="text-xl md:text-2xl font-black text-slate-800">{loading ? '...' : formatCurrency(kpis.totalPaid)}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/80 flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Pending</p>
              <p className="text-xl md:text-2xl font-black text-rose-600">{loading ? '...' : formatCurrency(kpis.totalPending)}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/80 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fully Paid Groups</p>
              <p className="text-xl md:text-2xl font-black text-slate-800">
                {loading ? '...' : `${kpis.fullyPaidCount} / ${kpis.totalGroups}`}
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Section */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1" ref={suggestionsRef}>
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 font-bold text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              placeholder="Search devotee group by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Autocomplete suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-50">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(item.name);
                      setShowSuggestions(false);
                    }}
                    onMouseEnter={() => setActiveSuggestionIdx(index)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between text-xs font-bold transition-colors ${
                      index === activeSuggestionIdx ? 'bg-amber-50/70 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate max-w-[70%]">{highlightMatch(item.name, searchTerm)}</span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 font-mono shrink-0">
                      <Phone className="w-3 h-3 text-slate-300" />
                      {highlightMatch(item.phone, searchTerm)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400">
              Showing <span className="text-slate-700 font-extrabold">{sortedGroups.length}</span> of <span className="text-slate-700 font-extrabold">{groups.length}</span>
            </span>
            
            {/* Mobile sort dropdown */}
            <div className="md:hidden flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400">Sort:</span>
              <select
                value={`${sortField || ''}-${sortDirection}`}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val || val === '-') {
                    setSortField(null);
                  } else {
                    const [field, dir] = val.split('-');
                    setSortField(field);
                    setSortDirection(dir);
                  }
                }}
                className="text-xs font-extrabold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
              >
                <option value="-">Default</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="paid-desc">Paid (High to Low)</option>
                <option value="paid-asc">Paid (Low to High)</option>
                <option value="pending-desc">Pending (High to Low)</option>
                <option value="pending-asc">Pending (Low to High)</option>
                <option value="total-desc">Total (High to Low)</option>
                <option value="total-asc">Total (Low to High)</option>
                <option value="status-desc">Status (Paid First)</option>
                <option value="status-asc">Status (Unpaid First)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pull-to-refresh mobile visual indicator & Pull handler */}
        <div className="md:hidden flex justify-center py-1">
          <button 
            onClick={() => loadData(true)} 
            disabled={refreshing || loading}
            className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Pull to Refresh'}
          </button>
        </div>

        {/* Data list - desktop table / mobile cards */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-bold">Loading devotee records...</p>
          </div>
        ) : sortedGroups.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100/80">
            <p className="text-base text-slate-600 font-black mb-1">No Devotees Found</p>
            <p className="text-xs text-slate-400 font-medium">Try clearing your filters or refreshing the data.</p>
          </div>
        ) : (
          <>
            {/* Desktop Full Screen View (table layout) */}
            <div className="hidden md:block bg-white rounded-3xl border border-slate-100/80 shadow-sm overflow-hidden flex-1">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider select-none">
                      <th 
                        className="px-5 py-4 font-black cursor-pointer hover:bg-slate-800 transition-colors group"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Group Leader / Devotee
                          {renderSortIndicator('name')}
                        </div>
                      </th>
                      <th 
                        className="px-5 py-4 font-black cursor-pointer hover:bg-slate-800 transition-colors group"
                        onClick={() => handleSort('phone')}
                      >
                        <div className="flex items-center gap-1">
                          Phone
                          {renderSortIndicator('phone')}
                        </div>
                      </th>
                      <th 
                        className="px-5 py-4 font-black text-right cursor-pointer hover:bg-slate-800 transition-colors group"
                        onClick={() => handleSort('paid')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Paid
                          {renderSortIndicator('paid')}
                        </div>
                      </th>
                      <th 
                        className="px-5 py-4 font-black text-right cursor-pointer hover:bg-slate-800 transition-colors group"
                        onClick={() => handleSort('pending')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Pending
                          {renderSortIndicator('pending')}
                        </div>
                      </th>
                      <th 
                        className="px-5 py-4 font-black text-right cursor-pointer hover:bg-slate-800 transition-colors group"
                        onClick={() => handleSort('total')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Total
                          {renderSortIndicator('total')}
                        </div>
                      </th>
                      <th 
                        className="px-5 py-4 font-black text-center cursor-pointer hover:bg-slate-800 transition-colors group"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Status
                          {renderSortIndicator('status')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                    {sortedGroups.map((g, idx) => {
                      const isFullyPaid = g.pending === 0;
                      const isUnpaid = g.paid === 0;
                      const hasTBD = g.pending === 'TBD' || g.paid === 'TBD';

                      let rowBg = 'bg-white hover:bg-slate-50/50';
                      if (!hasTBD) {
                        if (isFullyPaid) rowBg = 'bg-emerald-50/20 hover:bg-emerald-50/40';
                        else if (!isUnpaid) rowBg = 'bg-amber-50/10 hover:bg-amber-50/25';
                      }

                      return (
                        <tr key={idx} className={`transition-colors ${rowBg}`}>
                          <td className="px-5 py-4">
                            <div>
                              <button
                                onClick={() => handleQuickView(g)}
                                className="text-base font-black text-slate-800 leading-tight hover:text-indigo-600 hover:underline text-left focus:outline-none"
                              >
                                {g.name}
                              </button>
                              <span className="text-[10px] text-slate-400 font-bold bg-slate-100/85 px-1.5 py-0.5 rounded mt-1 block w-fit">
                                {g.memberCount} Group member{g.memberCount > 1 ? 's' : ''}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-600 font-mono text-xs">{g.phone || 'N/A'}</td>
                          <td className="px-5 py-4 text-right text-emerald-700 font-extrabold text-base">
                            {formatCurrency(g.paid)}
                          </td>
                          <td className={`px-5 py-4 text-right font-extrabold text-base ${
                            g.pending === 'TBD' ? 'text-slate-400' : g.pending > 0 ? 'text-rose-600' : 'text-emerald-700'
                          }`}>
                            {g.pending === 'TBD' ? 'TBD' : g.pending > 0 ? formatCurrency(g.pending) : '✓ Cleared'}
                          </td>
                          <td className="px-5 py-4 text-right text-slate-800 font-black text-base">
                            {formatCurrency(g.total)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              hasTBD
                                ? 'bg-slate-100 text-slate-500 border-slate-200'
                                : isFullyPaid
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : isUnpaid
                                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>
                              {hasTBD ? 'TBD' : isFullyPaid ? 'Fully Paid' : isUnpaid ? 'Unpaid' : 'Part Paid'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View (card list layout) */}
            <div className="md:hidden space-y-3">
              {sortedGroups.map((g, idx) => {
                const isFullyPaid = g.pending === 0;
                const isUnpaid = g.paid === 0;
                const hasTBD = g.pending === 'TBD' || g.paid === 'TBD';

                let borderAccent = 'border-slate-100';
                let statusBg = 'bg-slate-100 text-slate-600';
                let statusLabel = 'TBD';

                if (!hasTBD) {
                  if (isFullyPaid) {
                    borderAccent = 'border-emerald-200';
                    statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                    statusLabel = 'Fully Paid';
                  } else if (isUnpaid) {
                    borderAccent = 'border-rose-200';
                    statusBg = 'bg-rose-50 text-rose-800 border-rose-100';
                    statusLabel = 'Unpaid';
                  } else {
                    borderAccent = 'border-amber-200';
                    statusBg = 'bg-amber-50 text-amber-800 border-amber-100';
                    statusLabel = 'Part Paid';
                  }
                }

                return (
                  <div key={idx} className={`bg-white rounded-2xl p-4 shadow-sm border ${borderAccent} space-y-3.5`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button
                          onClick={() => handleQuickView(g)}
                          className="text-base font-black text-slate-800 leading-tight hover:text-indigo-600 hover:underline text-left focus:outline-none"
                        >
                          {g.name}
                        </button>
                        <p className="text-slate-400 text-xs mt-0.5 font-bold flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 shrink-0 text-slate-300" />
                          {g.phone || 'N/A'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusBg}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50/80 rounded-xl text-center">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Paid</p>
                        <p className="text-sm font-extrabold text-emerald-700 mt-0.5">{formatCurrency(g.paid)}</p>
                      </div>
                      <div className="border-x border-slate-200/60">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Pending</p>
                        <p className={`text-sm font-extrabold mt-0.5 ${g.pending > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {g.pending === 'TBD' ? 'TBD' : g.pending > 0 ? formatCurrency(g.pending) : '✓ 0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Total</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">{formatCurrency(g.total)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold">
                        {g.memberCount} member{g.memberCount > 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => handleQuickView(g)}
                        className="text-xs text-indigo-600 font-black flex items-center gap-0.5"
                      >
                        Quick Details &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function Admin() {
  return (
    <ErrorBoundary>
      <AdminContent />
    </ErrorBoundary>
  );
}
