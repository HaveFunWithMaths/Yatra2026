import React from 'react';
import { resolveHotelConfig } from '../utils/hotelConfig';

const formatHotelName = (hotelName) => {
  if (!hotelName) return 'Not specified';
  const trimmed = hotelName.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'amrutha') return 'Amrutha Residency';
  if (lower === 'brindavan' || lower === 'vrindavan') return 'Brindavan Residency';
  if (lower === 'shivananda' || lower === 'sivananda') return 'Hotel Shivananda';
  return trimmed;
};

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
      className="bg-white rounded-2xl mx-2 sm:mx-0 shadow-lg border-2 border-indigo-200 overflow-hidden animate-fade-in card-lift print:shadow-none print:border-slate-300"
      style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
    >
      {/* Top accent stripe */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 print:hidden" />
      {/* Redesigned Card Header - Hotel Name Prominent, Room Metadata Stacked on Right */}
      <div className="relative pt-6 pb-5 px-5 sm:px-6 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 border-b border-indigo-100/50">
        <div className="flex flex-row justify-between items-start gap-4">
          {/* Left side: Hotel assigned details */}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-indigo-600 uppercase tracking-widest font-black block mb-0.5 print:text-slate-500">
              Hotel Assigned
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
              {formatHotelName(hotel)}
            </h3>
            {distance && (
              <p className="text-slate-500 text-xs sm:text-sm mt-1 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-indigo-500 shrink-0 print:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-semibold">{distance} from Hall</span>
              </p>
            )}

            {/* Map Link */}
            {mapLink && (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 text-xs font-bold rounded-lg border border-indigo-100 transition-colors duration-200 print:hidden"
              >
                <span>📍 Open Maps</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {/* Right side: Room details stacked one below another */}
          <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
            {hasRoomNo ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm sm:text-base font-black bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm border border-indigo-500/20">
                Room {roomNo}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm sm:text-base font-black bg-amber-50 text-amber-800 border border-amber-200/50">
                Room: TBD
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider border ${acLabel.toLowerCase().includes('non')
                ? 'bg-orange-50/80 text-orange-800 border-orange-200/60'
                : 'bg-cyan-50 text-cyan-800 border-cyan-200/60'
              }`}>
              {acLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Main info grid including: Check-In, Check-Out, Floor, Room Type, Bathroom, Cost, Days Rented, Extra Bed */}
      <div className="px-3 sm:px-5 py-4 grid grid-cols-2 gap-y-4 gap-x-4 border-b border-slate-100 bg-slate-50/40 text-slate-700">
        {/* Check-In */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 print:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider leading-none">Check-In</p>
            <p className="text-slate-800 font-extrabold text-base leading-snug mt-1">{begin || '—'}</p>
          </div>
        </div>

        {/* Check-Out */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 print:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider leading-none">Check-Out</p>
            <p className="text-slate-800 font-extrabold text-base leading-snug mt-1">{end || '—'}</p>
          </div>
        </div>

        {/* Floor */}
        {floor ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 print:bg-slate-100">
              {/* Elevator / Lift Icon matching user's image design (wider & thinner lines) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                {/* Top indicator display box */}
                <rect x="5" y="2" width="14" height="3" rx="0.5" />
                {/* 3 indicator lights */}
                <circle cx="8.5" cy="3.5" r="0.4" fill="currentColor" />
                <circle cx="12" cy="3.5" r="0.4" fill="currentColor" />
                <circle cx="15.5" cy="3.5" r="0.4" fill="currentColor" />
                
                {/* Outer cabin frame */}
                <rect x="3" y="6" width="18" height="16" rx="1" />
                {/* Inner door frame */}
                <rect x="4.5" y="7.5" width="15" height="14.5" />
                {/* Center split line */}
                <line x1="12" y1="7.5" x2="12" y2="22" />
                
                {/* Up Arrow (Left Door) */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 17v-5.5 M6.75 13.5l1.5-1.5 1.5 1.5" />
                {/* Down Arrow (Right Door) */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 11.5v5.5 M14.25 15l1.5 1.5 1.5-1.5" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider leading-none">Floor</p>
              <p className="text-slate-800 font-bold text-base mt-1">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 12V8a4 4 0 014-4h10a4 4 0 014 4v4M3 12v6h18v-6" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider leading-none">Room Type</p>
              <p className="text-slate-800 font-black text-base sm:text-lg capitalize mt-1">{roomType}</p>
            </div>
          </div>
        ) : null}

        {/* Bathroom */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center shrink-0 print:bg-slate-100">
            {/* Water drop icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3C12 3 6 10 6 14a6 6 0 0012 0c0-4-6-11-6-11z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider leading-none">Toilet</p>
            <p className="text-slate-800 font-bold text-base mt-1">Western</p>
          </div>
        </div>

        {/* Extra Bed */}
        {extraBed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 print:bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 10V8a4 4 0 014-4h10a4 4 0 014 4v2M3 10v8h18v-8M12 4v4m0 0H9m3 0h3" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider leading-none">Extra Bed</p>
              <p className="text-slate-800 font-bold text-base capitalize mt-1">{extraBed}</p>
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
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider leading-none">Days Rented</p>
              <p className="text-slate-800 font-bold text-base mt-1">
                {daysRented} Day{parseInt(daysRented) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ) : null}

        {/* Cost per Day */}
        {cost ? (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 print:bg-slate-100">
              <span className="text-emerald-600 font-extrabold text-xl leading-none">₹</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider leading-none">Cost per Day</p>
              <p className="text-slate-800 font-bold text-base mt-1">
                ₹{isNaN(cost) ? cost : Number(cost).toLocaleString('en-IN')}
                {extraBed && extraBed.toString().trim().toLowerCase().startsWith('yes') ? ' (inlcudes extra bed)' : ''}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Roommates */}
      <div className="px-3 sm:px-5 py-4">
        <h4 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-3 leading-none">
          Your Roommates · {devotees.filter(Boolean).length} People
        </h4>
        <div className="grid grid-cols-1 gap-1.5">
          {devotees.filter(d => d && d.trim() !== '').map((name, rIdx) => {
            const isYou = matchedSet.has(name.trim().toLowerCase());
            return (
              <div
                key={rIdx}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-default ${
                  isYou
                    ? 'bg-indigo-100/60'
                    : 'bg-slate-50/80 hover:bg-indigo-50/30 hover:scale-[1.01]'
                }`}
              >
                {/* Avatar circle */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-black shrink-0 shadow-sm ${
                  isYou
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                    : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600'
                }`}>
                  {name.trim().charAt(0).toUpperCase()}
                </div>
                <p className={`text-lg font-bold truncate ${
                  isYou ? 'text-indigo-900' : 'text-slate-700'
                }`}>
                  {name.trim()}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
