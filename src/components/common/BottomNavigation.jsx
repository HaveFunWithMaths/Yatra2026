import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bed, Wallet } from 'lucide-react';

export default function BottomNavigation({ currentSearchTerm }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAccommodation = location.pathname.toLowerCase().includes('/accommodation');
  const isPayments = location.pathname.toLowerCase().includes('/payments');

  const handleTabClick = (path) => {
    const qParam = currentSearchTerm ? `?q=${encodeURIComponent(currentSearchTerm)}` : '';
    navigate(`${path}${qParam}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-50 print:hidden">
      <div className="max-w-2xl mx-auto flex items-center justify-around py-2.5 px-6">
        <button
          onClick={() => handleTabClick('/accommodation')}
          className={`flex flex-col items-center gap-1 py-1 px-6 rounded-xl transition-all duration-300 ${isAccommodation
              ? 'text-indigo-600 font-extrabold scale-105 bg-indigo-50/80'
              : 'text-slate-400 hover:text-slate-700 font-semibold'
            }`}
        >
          <Bed className={`w-5 h-5 transition-transform ${isAccommodation ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-wider uppercase">Accommodation</span>
        </button>

        <button
          onClick={() => handleTabClick('/payments')}
          className={`flex flex-col items-center gap-1 py-1 px-6 rounded-xl transition-all duration-300 ${isPayments
              ? 'text-indigo-600 font-extrabold scale-105 bg-indigo-50/80'
              : 'text-slate-400 hover:text-slate-700 font-semibold'
            }`}
        >
          <Wallet className={`w-5 h-5 transition-transform ${isPayments ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-wider uppercase">Payments</span>
        </button>
      </div>
    </div>
  );
}
