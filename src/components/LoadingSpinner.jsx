import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4 animate-fade-in">
                {/* Lotus-inspired loader */}
                <div className="relative w-20 h-20">
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 lotus-loader-ring">
                        <svg viewBox="0 0 80 80" className="w-full h-full">
                            <circle
                                cx="40"
                                cy="40"
                                r="35"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="3"
                                strokeDasharray="60 200"
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Center Om symbol */}
                    <div className="absolute inset-0 flex items-center justify-center lotus-loader">
                        <span className="text-3xl text-indigo-600">🙏</span>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-slate-700 font-semibold text-lg">Submitting your seva...</p>
                    <p className="text-indigo-500 text-sm mt-1">Hare Krishna 🙏</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
