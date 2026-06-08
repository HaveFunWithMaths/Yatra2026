import React, { useState } from 'react';
import Papa from 'papaparse';
import RoomCard from '../components/RoomCard';

// Public CSV export URLs
const REGISTRATION_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1GIEPXnjsjw7RClGwgOFVOrZemhlqY7jAMl7t2FNkvos/export?format=csv';
const ACCOMMODATION_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1qbw2uXcD4Nezswp6igIXeqB3MrGW_4YRYeamzOggY2A/export?format=csv';

// Devotee columns in the Accommodation sheet (adjust if header names differ)
const DEVOTEE_COLS = ['Devotee1', 'Devotee2', 'Devotee3', 'Devotee4', 'Devotee5', 'Devotee6'];

function normalize(str) {
  return (str || '').trim().toLowerCase();
}

/**
 * Compare phone numbers or emails resiliently (case-insensitive, strips formatting for phones).
 */
function matchPhoneOrEmail(val1, val2) {
  const norm1 = normalize(val1);
  const norm2 = normalize(val2);
  if (norm1 === norm2) return true;

  // Phone number matching: strip non-digits and compare last 10 digits
  const digits1 = norm1.replace(/\D/g, '');
  const digits2 = norm2.replace(/\D/g, '');
  if (digits1.length >= 10 && digits2.length >= 10) {
    return digits1.slice(-10) === digits2.slice(-10);
  }
  return false;
}

/**
 * Parse the Registration CSV (forward-fill merged A/B columns) and
 * return the set of Individual Names belonging to the matching group.
 */
function findGroupNames(rows, input) {
  let lastDevName = '';
  let lastPhone = '';
  let matchedDevoteeName = null;

  // Filter out invalid rows (missing name/age) and forward-fill devotee/phone
  const processed = rows
    .filter(row => row['Individual Name'] && row['Age'])
    .map((row) => {
      const colA = row['Devotee Name']?.trim();
      const colB = row['WhatsApp Number']?.trim();
      if (colA) lastDevName = colA;
      if (colB) lastPhone = colB;
      return {
        ...row,
        _devName: lastDevName,
        _phone: lastPhone,
      };
    });

  // Identify which devotee group the user belongs to
  for (const row of processed) {
    const phone = row._phone || row['WhatsApp Number'] || '';
    const email = row['Email'] || '';
    if (matchPhoneOrEmail(phone, input) || matchPhoneOrEmail(email, input)) {
      matchedDevoteeName = row._devName || row['Devotee Name'];
      break;
    }
  }

  if (!matchedDevoteeName) return null;

  // Collect all Individual Names within that group
  const names = new Set();
  const normDev = normalize(matchedDevoteeName);
  for (const row of processed) {
    const rowDev = normalize(row._devName || row['Devotee Name'] || '');
    if (rowDev === normDev) {
      const indiv = (row['Individual Name'] || '').trim();
      if (indiv) names.add(indiv);
    }
  }

  return { devoteeName: matchedDevoteeName, individualNames: Array.from(names) };
}

/**
 * Parse the Accommodation CSV and return unique room rows that contain
 * at least one of the given names. Also return which of the given names
 * were found (for highlighting).
 * Deduplication: one room entry per unique room row (by index).
 */
function findRooms(accomRows, individualNames) {
  const normNames = individualNames.map(normalize);
  const results = []; // { room, matchedNames }

  for (const row of accomRows) {
    const devoteesInRow = DEVOTEE_COLS.map(col => (row[col] || '').trim()).filter(Boolean);
    const matched = [];

    for (const name of individualNames) {
      const normName = normalize(name);
      if (devoteesInRow.some(d => normalize(d) === normName)) {
        matched.push(name);
      }
    }

    if (matched.length > 0) {
      results.push({
        room: {
          roomNo: (row['Room No'] || row['Room Number'] || row['Room'] || '').toString().trim(),
          hotel: (row['Hotel'] || row['hotel'] || '').trim(),
          acType: (row['AC/Non AC'] || row['AC'] || row['Type'] || '').trim(),
          begin: (row['Check-in'] || row['Check In'] || row['Begin'] || row['From'] || '').trim(),
          end: (row['Check-out'] || row['Check Out'] || row['End'] || row['To'] || '').trim(),
          floor: (row['Floor'] || '').toString().trim(),
          cost: (row['Cost per Room per Day '] || row['Cost per Room per Day'] || row['Cost'] || '').toString().trim(),
          photos: (row['Photos'] || row['Sample Photos'] || '').toString().trim(),
          devotees: devoteesInRow,
        },
        matchedNames: matched,
      });
    }
  }

  return results;
}

export default function Accommodation() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [devoteeName, setDevoteeName] = useState('');
  const [roomResults, setRoomResults] = useState([]); // [{ room, matchedNames }]
  const [notFound, setNotFound] = useState(false);
  const [noRoomsYet, setNoRoomsYet] = useState(false);

  // Auto-lookup on mount if saved
  React.useEffect(() => {
    const saved = localStorage.getItem('gnh_yatra_accom_input');
    if (saved) {
      setInput(saved);
      handleSearch(saved);
    }
  }, []);

  const handleSearch = async (searchValue) => {
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
  };

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
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fdf6ec 0%, #f5f0ff 50%, #ecf0ff 100%)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <img src="/assets/GNHLogo.png" alt="GNH Logo" className="h-9 w-auto" />
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-slate-800 leading-tight truncate">
              GNH Yatra 2026
            </h1>
            <p className="text-xs text-amber-600 font-medium truncate">Accommodation Lookup</p>
          </div>
          <a
            href="/"
            className="ml-auto text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors shrink-0"
          >
            ← Registration
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-10 pb-16">

        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Your Accommodation</h2>
          <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto">
            Enter the phone number or email you used during registration to view your room assignment.
          </p>
        </div>

        {/* Search Card */}
        <div className="card px-6 py-7 mb-6 animate-slide-up">
          <label className="form-label" htmlFor="accom-search-input">
            Phone Number or Email Address
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="accom-search-input"
              type="text"
              className="form-input flex-1"
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
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Results */}
        {searched && (
          <div className="animate-fade-in">

            {/* Not registered */}
            {notFound && (
              <div className="card px-6 py-8 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No registration found</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-5">
                  We couldn't find anyone registered with <span className="font-medium text-slate-700 break-all">{input.trim()}</span>.
                  Please double-check and try again, or contact Akash Prabhu at <a href="tel:9381301587">9381301587</a>
                </p>
                <button onClick={handleReset} className="btn-secondary text-sm">
                  Try Again
                </button>
              </div>
            )}

            {/* Registered but no room yet */}
            {!notFound && noRoomsYet && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Found registration for</p>
                    <h3 className="text-xl font-bold text-slate-800">{devoteeName}</h3>
                  </div>
                  <button onClick={handleReset} className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto">
                    Search Again
                  </button>
                </div>
                <div className="card px-6 py-8 text-center border-l-4 border-l-amber-400">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-amber-700 mb-2">Room Not Assigned Yet</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Your registration is confirmed but your room hasn't been assigned yet.
                    Accommodation details will be updated here soon — please check back later.
                  </p>
                </div>
              </div>
            )}

            {/* Found rooms */}
            {!notFound && roomResults.length > 0 && (
              <div className="space-y-6">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Accommodation for</p>
                    <h3 className="text-xl font-bold text-slate-800">{devoteeName}'s Group</h3>
                  </div>
                  <button onClick={handleReset} className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto">
                    Search Again
                  </button>
                </div>

                {/* Summary badge */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-indigo-800 text-sm font-medium">
                    Found <span className="font-bold">{roomResults.length}</span> room{roomResults.length !== 1 ? 's' : ''} for your group.
                    Your name{roomResults.flatMap(r => r.matchedNames).length > 1 ? 's are' : ' is'} highlighted below.
                  </p>
                </div>

                {/* Yatra Quick Reference Info */}
                <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-bold text-sm">Yatra Hall Location</h4>
                      <p className="text-slate-500 text-xs mt-0.5">Main gathering & prasadam hall</p>
                      <a
                        href="https://maps.app.goo.gl/SCp7SALucDA5ELLc9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold inline-flex items-center gap-1 hover:underline mt-1.5"
                      >
                        Open Hall in Google Maps →
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-bold text-sm">Sample Rooms Picture</h4>
                      <p className="text-slate-500 text-xs mt-0.5">View reference photos of rooms</p>
                      <a
                        href="https://docs.google.com/document/d/10lcnCl56xsLGMz2agLA9dk2ZvyEQNVdEm1R25EK28QE/edit?tab=t.0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold inline-flex items-center gap-1 hover:underline mt-1.5"
                      >
                        View Sample Photos →
                      </a>
                    </div>
                  </div>
                </div>

                {/* Room Cards — one per unique room row */}
                {roomResults.map((result, idx) => (
                  <RoomCard
                    key={idx}
                    room={result.room}
                    matchedNames={result.matchedNames}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-12">
          © 2026 GNH Community · For help regarding Accomodation, contact <strong>Akash Prabhu at <a href="tel:9381301587">9381301587</a></strong>
        </p>
      </main>
    </div>
  );
}
