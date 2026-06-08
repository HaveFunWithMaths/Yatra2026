import React from 'react';

/**
 * RoomCard
 * Props:
 *   room        - { roomNo, hotel, acType, begin, end, devotees: string[] }
 *   matchedNames - string[] of the names that were found in this room (to highlight)
 */
export default function RoomCard({ room, matchedNames }) {
  const { roomNo, hotel, acType, begin, end, devotees, floor, cost, roomType, extraBed, daysRented } = room;
  const hasRoomNo = roomNo && roomNo.toString().trim() !== '';

  // Normalised matched set for quick lookup
  const matchedSet = new Set((matchedNames || []).map(n => n.trim().toLowerCase()));

  const isAC = (acType || '').toLowerCase().includes('non') === false && (acType || '').trim() !== '';
  const acLabel = acType?.trim() || 'Not specified';

  // Helper to resolve Google Maps link for the hotel
  const getGMapLink = (hotelName) => {
    if (!hotelName) return null;
    const name = hotelName.toLowerCase();
    if (name.includes('amrutha')) {
      return 'https://maps.app.goo.gl/VHGSHbP9eeJSDBVq7';
    }
    if (name.includes('brindavan') || name.includes('vrindavan')) {
      return 'https://maps.app.goo.gl/kZtu9Z5ZPhjJLTKdA';
    }
    if (name.includes('shivananda') || name.includes('sivananda')) {
      return 'https://maps.app.goo.gl/DqEC39yuJ3Y4P6yi7';
    }
    return null;
  };

  const mapLink = getGMapLink(hotel);

  // Helper to resolve distance from the hall
  const getDistance = (hotelName) => {
    if (!hotelName) return null;
    const name = hotelName.toLowerCase();
    if (name.includes('amrutha')) {
      return '110 meters';
    }
    if (name.includes('brindavan') || name.includes('vrindavan')) {
      return '90 meters';
    }
    if (name.includes('shivananda') || name.includes('sivananda')) {
      return '350 meters';
    }
    return null;
  };

  const distance = getDistance(hotel);

  const getFloorSuffix = (floorNum) => {
    const n = parseInt(floorNum);
    if (isNaN(n)) return '';
    if (n === 1) return 'st';
    if (n === 2) return 'nd';
    if (n === 3) return 'rd';
    return 'th';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden animate-fade-in hover:shadow-xl transition-all duration-300">
      {/* Card Header */}
      <div className={`px-6 py-4 flex items-center justify-between ${hasRoomNo ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Room Number</p>
            {hasRoomNo ? (
              <p className="text-white text-2xl font-bold leading-tight">{roomNo}</p>
            ) : (
              <p className="text-white text-lg font-semibold leading-tight">To be assigned</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${acType?.toLowerCase().includes('non') ? 'bg-white/20 text-white' : 'bg-yellow-300/90 text-yellow-900'}`}>
            {acLabel}
          </span>
        </div>
      </div>

      {/* Not-yet-assigned notice */}
      {!hasRoomNo && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-amber-800 text-sm">
            Room number has not been assigned yet. It will be updated soon — please check back later.
          </p>
        </div>
      )}

      {/* Hotel & Dates */}
      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {mapLink ? (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200"
              title="View on Google Maps"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
          ) : (
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Hotel</p>
            {mapLink ? (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm inline-flex items-center gap-1 hover:underline group transition-all duration-200"
                title="View on Google Maps"
              >
                <span>{hotel || 'Not specified'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <p className="text-slate-800 font-semibold text-sm">{hotel || 'Not specified'}</p>
            )}
            {distance && (
              <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                <span>{distance} from Hall</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Check-In</p>
            <p className="text-slate-800 font-semibold text-sm">{begin || '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Check-Out</p>
            <p className="text-slate-800 font-semibold text-sm">{end || '—'}</p>
          </div>
        </div>
      </div>

      {/* Additional details: Floor, Cost, Room Type, Extra Bed, Days Rented, Bathroom */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 border-b border-slate-100 bg-slate-50/40 text-slate-700 animate-fade-in">
        {/* Floor */}
        {floor ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Floor</p>
              <p className="text-slate-800 font-semibold text-xs leading-tight">
                {floor}{/^\d+$/.test(floor.trim()) ? getFloorSuffix(floor.trim()) : ''} Floor
              </p>
            </div>
          </div>
        ) : null}

        {/* Room Type */}
        {roomType ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Room Type</p>
              <p className="text-slate-800 font-semibold text-xs leading-tight capitalize">{roomType}</p>
            </div>
          </div>
        ) : null}

        {/* Bathroom */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-sky-50 rounded-lg flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Bathroom</p>
            <p className="text-slate-800 font-semibold text-xs leading-tight">Western</p>
          </div>
        </div>

        {/* Cost per Day */}
        {cost ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-emerald-600 font-bold text-xs">₹</span>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Cost per Day</p>
              <p className="text-slate-800 font-semibold text-xs leading-tight">
                ₹{isNaN(cost) ? cost : Number(cost).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ) : null}

        {/* Days Rented */}
        {daysRented ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Days Rented</p>
              <p className="text-slate-800 font-semibold text-xs leading-tight">
                {daysRented} Day{parseInt(daysRented) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ) : null}

        {/* Extra Bed */}
        {extraBed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Extra Bed</p>
              <p className="text-slate-800 font-semibold text-xs leading-tight capitalize">{extraBed}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Roommates */}
      <div className="px-6 py-4">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
          Roommates ({devotees.filter(Boolean).length})
        </p>
        <div className="flex flex-col gap-2">
          {devotees.filter(d => d && d.trim() !== '').map((name, idx) => {
            const isYou = matchedSet.has(name.trim().toLowerCase());
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${isYou
                  ? 'bg-indigo-50 border border-indigo-200'
                  : 'bg-slate-50 border border-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isYou
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-600'
                }`}>
                  {name.trim().charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isYou ? 'text-indigo-800' : 'text-slate-700'}`}>
                    {name.trim()}
                  </p>
                </div>
                {isYou && (
                  <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold shrink-0">
                    You
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
