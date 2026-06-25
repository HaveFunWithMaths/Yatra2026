import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/common/BottomNavigation';
import ErrorBoundary from '../components/ErrorBoundary';

const HOTELS_DATA = {
  'Amrutha Residency': {
    folder: 'AmruthaResidency',
    photos: [
      { filename: '2 Bed AC Rooms.png', caption: '2 Bed AC Rooms' },
      { filename: '2 Bed Non AC Rooms.png', caption: '2 Bed Non AC Rooms' },
      { filename: '3 Bed Rooms (AC will be present in AC room).png', caption: '3 Bed Non AC Rooms (Similarly AC will be present in AC room)' },
      { filename: '4 Bed Room (AC will be present in AC rooms).png', caption: '4 Bed Non AC Rooms (Similarly AC will be present in AC rooms)' },
    ]
  },
  'Brindavan Residency': {
    folder: 'BrindavanResidency',
    photos: [
      { filename: '2 Bed AC room.png', caption: '2 Bed AC room' },
      { filename: '2 Bed Non AC room.jpg', caption: '2 Bed Non AC room' },
    ]
  },
  'Hotel Shivananda': {
    folder: 'HotelShivananda',
    photos: [
      { filename: '2 Bed AC room.jpg', caption: '2 Bed AC room' },
    ]
  }
};

const TAB_OPTIONS = ['Amrutha Residency', 'Brindavan Residency', 'Hotel Shivananda'];

function HotelPageContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Read current active tab from query, fallback to the first tab
  const rawTab = searchParams.get('tab');
  const activeTab = TAB_OPTIONS.includes(rawTab) ? rawTab : 'Amrutha Residency';
  const currentSearchTerm = searchParams.get('q') || '';

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab, q: currentSearchTerm });
  };

  const handleBack = () => {
    if (currentSearchTerm) {
      navigate(`/accommodation?q=${encodeURIComponent(currentSearchTerm)}`);
    } else {
      navigate('/accommodation');
    }
  };

  const hotelInfo = HOTELS_DATA[activeTab];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #fdf6ec 0%, #f5f0ff 50%, #ecf0ff 100%)' }}>
      {/* Header — Room Gallery accent */}
      <header className="bg-white/85 backdrop-blur-md shadow-sm sticky top-0 z-40" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-400" />
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Back button on left */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl border border-slate-200/60 hover:border-indigo-200/55 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>

          {/* Logo & Title */}
          <div className="flex items-center gap-2">
            <img src="/assets/GNHLogo.png" alt="GNH Logo" className="h-7 w-auto shrink-0" />
            <div className="text-left">
              <h1 className="text-sm md:text-base font-black text-slate-800 leading-none">
                GNH Yatra 2026
              </h1>
              <p className="text-[10px] font-black tracking-wider uppercase" style={{ color: '#6366f1' }}>
                Room Photos
              </p>
            </div>
          </div>

          {/* Empty spacer on right for alignment symmetry */}
          <div className="w-[66px] sm:w-[68px]" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 md:pt-10">
        {/* Banner Section */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Room Galleries</h2>
          <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto mt-1 leading-relaxed">
            Browse through reference photos of the assigned rooms across different hotels.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex flex-row bg-white/60 backdrop-blur p-1.5 rounded-xl sm:rounded-2xl border border-indigo-100/50 shadow-md gap-1.5 mb-8">
          {TAB_OPTIONS.map((tabName) => {
            const isActive = activeTab === tabName;
            const words = tabName.split(' ');
            return (
              <button
                key={tabName}
                onClick={() => handleTabChange(tabName)}
                className={`flex-1 py-1.5 sm:py-2 px-2 text-xs min-[360px]:text-sm sm:text-base font-black rounded-lg sm:rounded-xl transition-all duration-300 flex flex-col items-center justify-center leading-tight whitespace-normal text-center ${isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
              >
                <span>{words[0]}</span>
                <span>{words[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        {hotelInfo && hotelInfo.photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
            {hotelInfo.photos.map((photo, index) => {
              const imageSrc = `/assets/Hotel/${hotelInfo.folder}/${photo.filename}`;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-indigo-100/20 transition-all duration-300 transform hover:-translate-y-1 group"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 cursor-pointer">
                    <img
                      src={imageSrc}
                      alt={photo.caption}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/10 transition-colors duration-300 flex items-center justify-center">
                      <span className="bg-slate-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow backdrop-blur-sm">
                        🔍 View Full Screen
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100/50 bg-slate-50/15">
                    <p className="text-slate-800 text-sm font-extrabold text-center uppercase tracking-wide leading-relaxed">
                      {photo.caption}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-indigo-200 p-8 shadow-sm">
            <p className="text-slate-400 font-medium">No room photos available for this hotel yet.</p>
          </div>
        )}
      </main>

      {/* Lightbox / Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-200 shadow-md"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Container */}
          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <img
              src={`/assets/Hotel/${hotelInfo.folder}/${selectedPhoto.filename}`}
              alt={selectedPhoto.caption}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10 animate-scale-up"
            />
            <p className="text-white text-base md:text-lg font-black mt-4 tracking-wide text-center uppercase drop-shadow-md">
              {selectedPhoto.caption}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Nav bar */}
      <BottomNavigation currentSearchTerm={currentSearchTerm} />
    </div>
  );
}

export default function HotelPage() {
  return (
    <ErrorBoundary>
      <HotelPageContent />
    </ErrorBoundary>
  );
}
