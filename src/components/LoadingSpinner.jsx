import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4 animate-fade-in">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin-slow"></div>
                </div>
                <p className="text-slate-600 font-medium">Submitting your registration...</p>
                <p className="text-slate-400 text-sm">Please wait</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
