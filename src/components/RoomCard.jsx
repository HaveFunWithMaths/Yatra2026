import React from 'react';
import { resolveHotelConfig } from '../utils/hotelConfig';

/**
 * RoomCard
 * Props:
 *   room        - { roomNo, hotel, acType, begin, end, devotees: string[] }
 *   matchedNames - string[] of the names that were found in this room (to highlight)
 *   index        - number for staggered animation delay
 */
export default function RoomCard({ room, matchedNames, index = 0 }) {
  const { roomNo, hotel, acType, begin, end, devotees, floor, cost, roomType, extraBed, daysRented } = room;
  const hasRoomNo = roomNo && roomNo.toString().trim() !== '';

  // Normalized matched set for quick lookup
  const matchedSet = new Set((matchedNames || []).map(n => n.trim().toLowerCase()));

  const acLabel = acType?.trim() || 'Not specified';

  // Resolve mapLink and distance via the imported central config
  const hotelDetails = resolveHotelConfig(hotel);
  const mapLink = hotelDetails?.mapLink || null;
  const distance = hotelDetails?.distance || null;

  const getFloorSuffix = (floorNum) => {
    const n = parseInt(floorNum);
    if (isNaN(n)) return '';
    if (n === 1) return 'st';
    if (n === 2) return 'nd';
    if (n === 3) return 'rd';
    return 'th';
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-amber-100/70 overflow-hidden animate-fade-in hover:shadow-xl transition-all duration-300 relative print:shadow-none print:border-slate-300"
      style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
    >
      {/* Premium Card Header */}
      {hasRoomNo ? (
        <div className="relative pt-8 pb-7 px-6 text-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/20 overflow-hidden">
          {/* Subtle gold grid pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Centered Brass/Gold plaque for room number */}
          <div className="relative inline-flex flex-col items-center justify-center bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-600 px-7 py-3.5 rounded-2xl shadow-xl border border-yellow-200/50 transform hover:scale-105 transition-transform duration-300 min-w-[120px]">
            <span className="text-[10px] text-amber-950 font-extrabold uppercase tracking-widest leading-none mb-1">Room</span>
            <span className="text-3xl font-black text-amber-950 leading-none filter drop-shadow-sm">{roomNo}</span>
          </div>

          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 backdrop-blur-md border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
              {acLabel}
            </span>
          </div>
          
          {/* Wave Curve Divider */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] transform rotate-180">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[12px] fill-white">
              <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
            </svg>
          </div>
        </div>
      ) : (
        <div className="relative pt-8 pb-7 px-6 text-center bg-gradient-to-br from-amber-900 via-orange-950 to-amber-900 border-b border-amber-500/20 overflow-hidden">
          {/* Subtle gold grid pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Status Plaque */}
          <div className="relative inline-flex flex-col items-center justify-center bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 px-6 py-3 rounded-2xl shadow-xl border border-slate-600/50 min-w-[150px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Status</span>
            <span className="text-sm font-bold text-white leading-none">To be assigned</span>
          </div>

          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-amber-200 backdrop-blur-md border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              {acLabel}
            </span>
          </div>
          
          {/* Wave Curve Divider */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] transform rotate-180">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[12px] fill-white">
              <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
            </svg>
          </div>
        </div>
      )}

      {/* Hotel & Dates Info Grid */}
      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5 print:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Hotel</p>
            <p className="text-slate-800 font-bold text-sm truncate">{hotel || 'Not specified'}</p>
            {distance && (
              <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                <span>{distance} from Hall</span>
              </p>
            )}
            
            {/* Explicit Map Button under hotel */}
            {mapLink && (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 text-xs font-bold rounded-lg border border-indigo-100 transition-colors duration-200 print:hidden"
              >
                <span>📍 Open in Maps</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5 print:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Check-In</p>
            <p className="text-slate-800 font-bold text-sm whitespace-pre-line leading-snug">{begin || '—'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5 print:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Check-Out</p>
            <p className="text-slate-800 font-bold text-sm whitespace-pre-line leading-snug">{end || '—'}</p>
          </div>
        </div>
      </div>

      {/* Additional details: Floor, Cost, Room Type, Extra Bed, Days Rented, Bathroom */}
      <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 border-b border-slate-100 bg-slate-50/40 text-slate-700">
        {/* Floor */}
        {floor ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 print:bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-none">Floor</p>
              <p className="text-slate-800 font-bold text-xs mt-0.5">
                {floor}{/^\d+$/.test(floor.trim()) ? getFloorSuffix(floor.trim()) : ''} Floor
              </p>
            </div>
          </div>
        ) : null}

        {/* Room Type */}
        {roomType ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 print:bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-none">Room Type</p>
              <p className="text-slate-800 font-bold text-xs capitalize mt-0.5">{roomType}</p>
            </div>
          </div>
        ) : null}

        {/* Bathroom */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center shrink-0 print:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-none">Bathroom</p>
            <p className="text-slate-800 font-bold text-xs mt-0.5">Western</p>
          </div>
        </div>

        {/* Cost per Day */}
        {cost ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 print:bg-slate-100">
              <span className="text-emerald-600 font-extrabold text-xs">₹</span>
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-none">Cost per Day</p>
              <p className="text-slate-800 font-bold text-xs mt-0.5">
                ₹{isNaN(cost) ? cost : Number(cost).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ) : null}

        {/* Days Rented */}
        {daysRented ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 print:bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-none">Days Rented</p>
              <p className="text-slate-800 font-bold text-xs mt-0.5">
                {daysRented} Day{parseInt(daysRented) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ) : null}

        {/* Extra Bed */}
        {extraBed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 print:bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-none">Extra Bed</p>
              <p className="text-slate-800 font-bold text-xs capitalize mt-0.5">{extraBed}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Roommates */}
      <div className="px-6 py-5">
        <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3 leading-none">
          Your Roommates · {devotees.filter(Boolean).length} People
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {devotees.filter(d => d && d.trim() !== '').map((name, rIdx) => {
            const isYou = matchedSet.has(name.trim().toLowerCase());
            return (
              <div
                key={rIdx}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 ${isYou
                  ? 'bg-indigo-50/70 border-2 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-50/80 border border-slate-100 hover:bg-slate-100/50'
                }`}
              >
                {/* Initials with a gorgeous gradient avatar circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-sm ${isYou
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600'
                }`}>
                  {name.trim().charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${isYou ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {name.trim()}
                  </p>
                </div>
                {isYou && (
                  <span className="flex items-center gap-0.5 text-[10px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 shadow-sm">
                    <span>✓</span>
                    <span>You</span>
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
