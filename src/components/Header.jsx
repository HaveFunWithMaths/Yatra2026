import React from 'react';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-lg shadow-indigo-500/20">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo - Left */}
                <div className="flex-shrink-0">
                    <img
                        src="/assets/GNHLogo.jpeg"
                        alt="GNH Logo"
                        className="h-12 w-12 rounded-full object-cover border-2 border-white/30 shadow-md"
                    />
                </div>

                {/* Title - Center */}
                <div className="flex-grow text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                        GNH Yatra
                    </h1>
                </div>

                {/* Spacer for balance */}
                <div className="flex-shrink-0 w-12"></div>
            </div>
        </header>
    );
};

export default Header;
