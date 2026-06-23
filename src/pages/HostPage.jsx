import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

function HostPage() {
  const whatsappNumber = "+917893894239";
  const message = "Hare Krishna Prabhuji\nI want to register for GNH Hampi Yatra";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow pt-20 pb-8 px-4 flex flex-col items-center justify-start sm:justify-center">
        <div className="max-w-xl w-full mx-auto my-auto animate-slide-up">
          {/* Card */}
          <div className="card shadow-2xl border border-white/40 overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl">

            {/* Top Banner Images */}
            <div className="relative">
              <div className="h-40 sm:h-44 md:h-52 overflow-hidden">
                <img
                  src="/assets/Hanuman.jpeg"
                  alt="GNH Yatra Hanuman"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              </div>

              {/* Overlay Badge/Title */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 text-white">
                <span className="bg-amber-500/90 text-amber-950 text-xs font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full backdrop-blur-sm">
                  GNH Community Yatra 2026
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mt-1.5 sm:mt-2 drop-shadow-md">
                  Hampi Yatra Registration
                </h2>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 text-center">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 shadow-inner">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 animate-pulse-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4">
                Hare Krishna! 🙏
              </h3>

              <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                To register for <span className="font-semibold text-slate-800">GNH Hampi Yatra</span>, please contact
                <br />
                <span className="font-bold text-indigo-600">Krishna Kishore Prabhu</span> at{' '}
                <a
                  href={whatsappUrl}
                  className="inline-flex items-center gap-1.5 font-extrabold text-emerald-600 hover:text-emerald-700 underline decoration-2 underline-offset-4 hover:scale-105 transition-transform duration-200"
                  title="Contact via WhatsApp"
                >
                  +91 7893894239
                </a>
              </p>

              {/* Action Button */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a
                  href={whatsappUrl}
                  className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.988 14.113.96 11.5.96 6.068.96 1.643 5.328 1.64 10.757c-.001 1.705.46 3.376 1.334 4.887l-1.012 3.693 3.79-.983zM18.06 14.88c-.356-.177-2.106-1.033-2.438-1.154-.33-.12-.572-.18-.813.178-.24.357-.932 1.154-1.143 1.394-.21.24-.422.268-.778.09-1.397-.698-2.316-1.18-3.238-2.756-.243-.415.243-.385.694-1.282.076-.15.038-.283-.019-.403-.056-.12-.572-1.366-.784-1.875-.206-.493-.432-.423-.593-.432-.153-.007-.328-.009-.504-.009-.176 0-.463.065-.705.325-.24.26-1.168 1.129-1.168 2.753 0 1.624 1.196 3.197 1.357 3.411.16.215 2.35 3.559 5.694 4.992.796.341 1.417.545 1.901.697.8.252 1.528.216 2.104.13.642-.096 2.106-.855 2.402-1.683.296-.827.296-1.537.208-1.684-.088-.148-.326-.237-.682-.416z" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
                <Link
                  to="/commitment"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <span>Commitment Slideshow</span>
                </Link>
              </div>
            </div>

            {/* Footer image banner */}
            <div className="h-32 overflow-hidden border-t border-slate-100">
              <img
                src="/assets/Hampi.jpg"
                alt="Hampi Temple"
                className="w-full h-full object-cover opacity-90"
              />
            </div>

          </div>

          {/* Footer text */}
          <div className="text-center mt-6 text-slate-500 text-xs">
            <p>© 2026 GNH Community. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HostPage;
