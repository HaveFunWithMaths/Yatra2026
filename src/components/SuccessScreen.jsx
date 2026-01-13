import React from 'react';

const SuccessScreen = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-slide-up">
            {/* Success Icon */}
            <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
                    <svg
                        className="w-14 h-14 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            className="animate-checkmark"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                {/* Decorative rings */}
                <div className="absolute inset-0 w-24 h-24 bg-emerald-400/20 rounded-full animate-ping"></div>
            </div>

            {/* Success Message */}
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Registration Successful!
            </h2>

            <p className="text-lg text-slate-600 mb-6 max-w-md">
                Thank you for registering for GNH Community Yatra 2026.
                Your details have been submitted successfully.
            </p>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 max-w-md">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <h4 className="font-semibold text-indigo-800 mb-1">What's Next?</h4>
                        <p className="text-sm text-indigo-700">
                            You will receive a confirmation message on your WhatsApp number with further details about the Yatra.
                        </p>
                    </div>
                </div>
            </div>

            {/* Decorative element */}
            <div className="mt-10 flex items-center space-x-2 text-slate-400">
                <span className="text-2xl">🙏</span>
                <span className="text-sm font-medium">Hare Krishna</span>
                <span className="text-2xl">🙏</span>
            </div>
        </div>
    );
};

export default SuccessScreen;
