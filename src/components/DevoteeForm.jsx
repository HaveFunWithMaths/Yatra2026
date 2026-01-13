import React, { useState } from 'react';

const DevoteeForm = ({ data, onChange, isAlone, setIsAlone, onNext, onSubmit, errors }) => {
    const [showInfo, setShowInfo] = useState(true);

    const handleInputChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const handleCheckboxChange = (field, value) => {
        const currentValues = data[field] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onChange({ ...data, [field]: newValues });
    };

    const prasadOptions = ['Diabetic', 'North Indian', 'South Indian'];
    const languageOptions = ['Hindi', 'English', 'Telugu'];

    return (
        <div className="animate-fade-in space-y-8">
            {/* Information Header (Collapsible) */}
            <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between text-left group"
                >
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <span className="mr-2 text-2xl">🙏</span>
                        <span>Hare Krishna dear devotees, PAMHO!</span>
                    </h3>
                    <div className={`bg-white/20 p-1 rounded-full transition-transform duration-300 ${showInfo ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                {showInfo && (
                    <div className="p-6 space-y-6 text-slate-700 bg-white animate-slide-down">
                        <p className="font-medium text-indigo-900 bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-start">
                            <svg className="w-5 h-5 mr-2 text-indigo-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Please go through the following points before filling the form.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                <h4 className="font-bold text-slate-900 mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Yatra Dates
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-sm flex justify-between"><span className="text-slate-500">Begins:</span> <span className="font-medium">22nd July (Tue) Evening</span></p>
                                    <p className="text-sm flex justify-between"><span className="text-slate-500">Ends:</span> <span className="font-medium">27th July (Sun) Evening</span></p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                <h4 className="font-bold text-slate-900 mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Charges
                                </h4>
                                <ul className="text-sm space-y-1">
                                    <li className="flex justify-between border-b border-slate-200 pb-1"><span>Adult</span> <span className="font-semibold">₹1000</span></li>
                                    <li className="flex justify-between border-b border-slate-200 py-1"><span>Child (5-12)</span> <span className="font-semibold">₹600</span></li>
                                    <li className="flex justify-between pt-1"><span>Infant (&lt;5)</span> <span className="font-semibold text-green-600">Free</span></li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Criteria
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 list-none text-sm">
                                <li className="flex items-start"><span className="text-indigo-500 mr-2">•</span>Happy to associate with devotees</li>
                                <li className="flex items-start"><span className="text-indigo-500 mr-2">•</span>Eager to participate wholeheartedly</li>
                                <li className="flex items-start md:col-span-2"><span className="text-indigo-500 mr-2">•</span>No blasphemy/criticism of devotees or practices</li>
                            </ul>
                        </div>

                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <h4 className="font-bold text-amber-900 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Process
                            </h4>
                            <ol className="list-decimal ml-5 space-y-1 text-sm text-amber-900/80 marker:text-amber-600 marker:font-semibold">
                                <li>Fill this form for family/friends</li>
                                <li>Committee confirms acceptance</li>
                                <li>Confirmation via token advance</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>

            {/* Personal Details Section */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </span>
                    Personal Details
                </h3>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="form-label">Name <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input pl-10 ${errors.name ? 'border-red-400 focus:ring-red-500' : ''}`}
                                    placeholder="Enter your full name"
                                    value={data.name || ''}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-sm mt-1 flex items-center"><svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.name}</p>}
                        </div>

                        {/* Age Field */}
                        <div>
                            <label className="form-label">Age <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                className={`form-input ${errors.age ? 'border-red-400 focus:ring-red-500' : ''}`}
                                placeholder="Age (5-100)"
                                min="5"
                                max="100"
                                value={data.age || ''}
                                onChange={(e) => handleInputChange('age', e.target.value)}
                            />
                            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                        </div>

                        {/* Gender Dropdown */}
                        <div>
                            <label className="form-label">Gender <span className="text-red-500">*</span></label>
                            <select
                                className={`form-select ${errors.gender ? 'border-red-400 focus:ring-red-500' : ''}`}
                                value={data.gender || ''}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                        </div>

                        {/* Email Field */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="form-label">Email <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    className={`form-input pl-10 ${errors.email ? 'border-red-400 focus:ring-red-500' : ''}`}
                                    placeholder="Enter your email"
                                    value={data.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* WhatsApp Field */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="form-label">WhatsApp Number <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <input
                                    type="tel"
                                    className={`form-input pl-10 ${errors.whatsapp ? 'border-red-400 focus:ring-red-500' : ''}`}
                                    placeholder="10-digit number"
                                    value={data.whatsapp || ''}
                                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                                />
                            </div>
                            {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preferences Section */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                        </svg>
                    </span>
                    Preferences
                </h3>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    {/* Prasad Preference */}
                    <div>
                        <label className="form-label mb-2 block">Prasad Preference <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {prasadOptions.map((option) => (
                                <label
                                    key={option}
                                    className={`flex items-center space-x-3 cursor-pointer p-3 rounded-xl border transition-all duration-200 ${(data.prasadPreference || []).includes(option)
                                            ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${(data.prasadPreference || []).includes(option) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'
                                        }`}>
                                        {(data.prasadPreference || []).includes(option) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={(data.prasadPreference || []).includes(option)}
                                        onChange={() => handleCheckboxChange('prasadPreference', option)}
                                    />
                                    <span className={`${(data.prasadPreference || []).includes(option) ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>
                                        {option}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.prasadPreference && <p className="text-red-500 text-sm mt-1">{errors.prasadPreference}</p>}
                    </div>

                    {/* Language Preference */}
                    <div>
                        <label className="form-label mb-2 block">Languages <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {languageOptions.map((option) => (
                                <label
                                    key={option}
                                    className={`flex items-center space-x-3 cursor-pointer p-3 rounded-xl border transition-all duration-200 ${(data.languages || []).includes(option)
                                            ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${(data.languages || []).includes(option) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'
                                        }`}>
                                        {(data.languages || []).includes(option) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={(data.languages || []).includes(option)}
                                        onChange={() => handleCheckboxChange('languages', option)}
                                    />
                                    <span className={`${(data.languages || []).includes(option) ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>
                                        {option}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.languages && <p className="text-red-500 text-sm mt-1">{errors.languages}</p>}
                    </div>
                </div>
            </div>

            {/* Attendance Format Section */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="bg-amber-100 text-amber-600 p-2 rounded-lg mr-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </span>
                    Who is attending?
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option: Alone */}
                    <div
                        onClick={() => setIsAlone(true)}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${isAlone === true
                                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2'
                                : 'border-slate-200 bg-white hover:border-indigo-300'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-xl mb-4 ${isAlone === true ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            {isAlone === true && <div className="bg-indigo-600 text-white p-1 rounded-full"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
                        </div>
                        <h4 className={`text-lg font-bold mb-1 ${isAlone === true ? 'text-indigo-900' : 'text-slate-900'}`}>Just Me</h4>
                        <p className={`text-sm ${isAlone === true ? 'text-indigo-700' : 'text-slate-500'}`}>I am registering only for myself.</p>
                        <input type="radio" className="hidden" />
                    </div>

                    {/* Option: Group */}
                    <div
                        onClick={() => setIsAlone(false)}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${isAlone === false
                                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2'
                                : 'border-slate-200 bg-white hover:border-indigo-300'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-xl mb-4 ${isAlone === false ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            {isAlone === false && <div className="bg-indigo-600 text-white p-1 rounded-full"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
                        </div>
                        <h4 className={`text-lg font-bold mb-1 ${isAlone === false ? 'text-indigo-900' : 'text-slate-900'}`}>Me & Family/Friends</h4>
                        <p className={`text-sm ${isAlone === false ? 'text-indigo-700' : 'text-slate-500'}`}>I want to add my family members or friends.</p>
                        <input type="radio" className="hidden" />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6">
                {isAlone === true ? (
                    <button
                        type="button"
                        className="btn-primary w-full text-lg py-4 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform transition-all hover:-translate-y-1"
                        onClick={onSubmit}
                    >
                        Submit Registration
                    </button>
                ) : isAlone === false ? (
                    <button
                        type="button"
                        className="btn-primary w-full text-lg py-4 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform transition-all hover:-translate-y-1"
                        onClick={onNext}
                    >
                        Next: Add Guests →
                    </button>
                ) : (
                    <button
                        type="button"
                        className="w-full bg-slate-200 text-slate-400 font-bold py-4 rounded-xl cursor-not-allowed text-lg"
                        disabled
                    >
                        Select an option above to proceed
                    </button>
                )}
            </div>
        </div>
    );
};

export default DevoteeForm;
