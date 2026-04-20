import React, { useState } from 'react';
import { InputField, SelectField, CheckboxGroup, UserIcon, EmailIcon, PhoneIcon, ChevronDownIcon, InfoIcon, CalendarIcon, CurrencyIcon, CheckCircleIcon, ClipboardIcon, UsersIcon, CheckIcon } from './common';
import { prasadOptions, languageOptions, genderOptions } from '../utils/constants';

const DevoteeForm = ({ data, onChange, isAlone, setIsAlone, onNext, onSubmit, errors, onBlur, isAutopopulated, isFetchingData }) => {
    const [showInfo, setShowInfo] = useState(true);
    const [selectionKey, setSelectionKey] = useState(0);
    const infoId = 'devotee-info-section';

    const handleInputChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const handleFieldBlur = (field) => {
        if (onBlur) {
            onBlur(field);
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            {/* Information Header (Collapsible) */}
            <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between text-left group"
                    aria-expanded={showInfo}
                    aria-controls={infoId}
                >
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <span className="mr-2 text-2xl">🙏</span>
                        <span>Hare Krishna dear devotees, PAMHO!</span>
                    </h3>
                    <div className={`bg-white/20 p-1 rounded-full transition-transform duration-300 ${showInfo ? 'rotate-180' : ''}`}>
                        <ChevronDownIcon className="w-5 h-5 text-white" />
                    </div>
                </button>

                {showInfo && (
                    <div id={infoId} className="p-6 space-y-6 text-slate-700 bg-white animate-slide-down">
                        <p className="font-medium text-indigo-900 bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-start">
                            <InfoIcon className="w-5 h-5 mr-2 text-indigo-600 mt-0.5" />
                            Please go through the following points before filling the form.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                <h4 className="font-bold text-slate-900 mb-2 flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
                                    Yatra Dates
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-sm flex justify-between"><span className="text-slate-500">Begins:</span> <span className="font-medium">2nd July (Thu) Morning</span></p>
                                    <p className="text-sm flex justify-between"><span className="text-slate-500">Ends:</span> <span className="font-medium">5th July (Sun) Evening</span></p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                <h4 className="font-bold text-slate-900 mb-2 flex items-center">
                                    <CurrencyIcon className="w-5 h-5 mr-2 text-indigo-600" />
                                    Advance Registration fees
                                </h4>
                                <ul className="text-sm space-y-1">
                                    <li className="flex justify-between border-b border-slate-200 pb-1"><span>Adult</span> <span className="font-semibold">₹1000</span></li>
                                    <li className="flex justify-between border-b border-slate-200 py-1"><span>Student (5-18)</span> <span className="font-semibold">₹500</span></li>
                                    <li className="flex justify-between pt-1"><span>Infant (&lt;5)</span> <span className="font-semibold text-green-600">Free</span></li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                                <CheckCircleIcon className="w-5 h-5 mr-2 text-indigo-600" />
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
                                <ClipboardIcon className="w-5 h-5 mr-2 text-amber-600" />
                                Process
                            </h4>
                            <ol className="list-decimal ml-5 space-y-1 text-sm text-amber-900/80 marker:text-amber-600 marker:font-semibold">
                                <li>Fill this form for yourself and family/friends</li>
                                <li>Complete the payment for Advance registration</li>
                                <li>Join the Whatsapp Group via link shared in the payment confirmation page</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>

            {/* Personal Details Section */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
                        <UserIcon className="w-6 h-6" />
                    </span>
                    About You
                </h3>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1 relative">
                            <label className="form-label block text-sm font-medium text-slate-700 mb-1">
                                WhatsApp Number <span className="text-red-500">*</span>
                            </label>
                            <div className={`flex rounded-xl shadow-sm border focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 bg-white ${errors.whatsapp ? 'border-red-400' : 'border-slate-200'}`}>
                                <input 
                                    type="text"
                                    className="w-16 md:w-20 pl-3 py-3 bg-slate-50 border-r border-slate-200 text-slate-700 focus:outline-none rounded-l-xl text-sm font-medium"
                                    value={data.countryCode || ''}
                                    placeholder="+91"
                                    onChange={(e) => handleInputChange('countryCode', e.target.value)}
                                />
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <PhoneIcon className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="whatsapp"
                                        inputMode="tel"
                                        placeholder="e.g., 98765 43210"
                                        className="w-full py-3 text-sm pl-10 pr-4 bg-transparent outline-none rounded-r-xl"
                                        value={data.whatsapp || ''}
                                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                                        onBlur={() => handleFieldBlur('whatsapp')}
                                    />
                                </div>
                            </div>
                            {errors.whatsapp && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <svg className="w-4 h-4 mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {errors.whatsapp}
                                </p>
                            )}
                            {isFetchingData && (
                                <div className="absolute right-3 top-[38px]">
                                    <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                                </div>
                            )}
                            {isAutopopulated && (
                                <p className="text-xs text-green-600 font-medium mt-1.5 flex items-center absolute -bottom-5">
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                    Record found and fields autopopulated
                                </p>
                            )}
                        </div>

                        <InputField
                            label="Name"
                            required
                            icon={UserIcon}
                            placeholder="Enter your full name"
                            value={data.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            onBlur={() => handleFieldBlur('name')}
                            error={errors.name}
                            className="col-span-2 md:col-span-1"
                        />

                        <InputField
                            label="Age"
                            name="age"
                            required
                            type="number"
                            inputMode="numeric"
                            placeholder="Your age (5-100)"
                            min="5"
                            max="100"
                            value={data.age || ''}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                            onBlur={() => handleFieldBlur('age')}
                            error={errors.age}
                        />

                        <SelectField
                            label="Gender"
                            required
                            placeholder="Select Gender"
                            options={genderOptions}
                            value={data.gender || ''}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            onBlur={() => handleFieldBlur('gender')}
                            error={errors.gender}
                        />

                        <InputField
                            label="Email"
                            required
                            type="email"
                            icon={EmailIcon}
                            placeholder="Enter your email"
                            value={data.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            onBlur={() => handleFieldBlur('email')}
                            error={errors.email}
                            className="col-span-2 md:col-span-2"
                        />
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
                    Prasadam & Language Preferences
                </h3>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <CheckboxGroup
                        label="Prasadam Preference"
                        required
                        options={prasadOptions}
                        selectedValues={data.prasadPreference || []}
                        onChange={(values) => handleInputChange('prasadPreference', values)}
                        error={errors.prasadPreference}
                    />

                    <CheckboxGroup
                        label="Language you know(Select All)"
                        required
                        options={languageOptions}
                        selectedValues={data.languages || []}
                        onChange={(values) => handleInputChange('languages', values)}
                        error={errors.languages}
                    />
                </div>
            </div>

            {/* Accommodation Section */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                    </span>
                    Accommodation Preference
                </h3>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <p className="text-slate-700 font-medium mb-3">Do you want AC for you and your Family/Friends? <span className="text-red-500">*</span></p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div
                                onClick={() => { handleInputChange('accommodation', 'AC'); handleFieldBlur('accommodation'); }}
                                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${data.accommodation === 'AC' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-1' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <h4 className={`text-base font-bold ${data.accommodation === 'AC' ? 'text-indigo-900' : 'text-slate-800'}`}>AC Room</h4>
                                    </div>
                                    {data.accommodation === 'AC' && (
                                        <div className="bg-indigo-600 text-white p-1 rounded-full"><CheckIcon className="w-4 h-4"/></div>
                                    )}
                                </div>
                            </div>

                            <div
                                onClick={() => { handleInputChange('accommodation', 'Non AC'); handleFieldBlur('accommodation'); }}
                                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${data.accommodation === 'Non AC' ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200 ring-offset-1' : 'border-slate-200 bg-white hover:border-amber-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <h4 className={`text-base font-bold ${data.accommodation === 'Non AC' ? 'text-amber-900' : 'text-slate-800'}`}>Non AC Room</h4>
                                    </div>
                                    {data.accommodation === 'Non AC' && (
                                        <div className="bg-amber-500 text-white p-1 rounded-full"><CheckIcon className="w-4 h-4"/></div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {errors.accommodation && (
                            <p className="text-red-500 text-sm flex items-center mt-2">
                                <svg className="w-4 h-4 mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.accommodation}
                            </p>
                        )}
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-start text-sm text-indigo-800">
                        <InfoIcon className="w-5 h-5 mr-2 text-indigo-600 shrink-0 mt-0.5" />
                        <p>Note: Accommodation costs will increase by around ₹1000 if opted for AC.</p>
                    </div>
                </div>
            </div>

            {/* Attendance Format Section */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="bg-amber-100 text-amber-600 p-2 rounded-lg mr-3">
                        <UsersIcon className="w-6 h-6" />
                    </span>
                    Who's Coming Along?
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option: Alone - Horizontal Layout */}
                    <div
                        onClick={() => { if (!isAutopopulated) { setIsAlone(true); setSelectionKey(k => k + 1); } }}
                        className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${isAutopopulated 
                            ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50' 
                            : 'cursor-pointer hover:shadow-md card-hover ' + (isAlone === true
                                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2 animate-selection'
                                : 'border-slate-200 bg-white hover:border-indigo-300'
                            )}`}
                        key={`alone-${selectionKey}`}
                        title={isAutopopulated ? "Already registered, please update or add family." : undefined}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl shrink-0 ${isAlone === true && !isAutopopulated ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                <UserIcon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className={`text-lg font-bold ${isAlone === true && !isAutopopulated ? 'text-indigo-900' : 'text-slate-900'}`}>Just Me</h4>
                                    {isAlone === true && !isAutopopulated && (
                                        <div className="bg-indigo-600 text-white p-1 rounded-full">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <p className={`text-sm ${isAlone === true && !isAutopopulated ? 'text-indigo-700' : 'text-slate-500'}`}>I am registering only for myself.</p>
                                {isAutopopulated && (
                                    <p className="text-xs text-amber-600 font-semibold mt-1">Not available when updating records</p>
                                )}
                            </div>
                        </div>
                        <input type="radio" className="hidden" />
                    </div>

                    {/* Option: Group - Horizontal Layout */}
                    <div
                        onClick={() => { setIsAlone(false); setSelectionKey(k => k + 1); }}
                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md card-hover ${isAlone === false
                            ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2 animate-selection'
                            : 'border-slate-200 bg-white hover:border-indigo-300'
                            }`}
                        key={`group-${selectionKey}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl shrink-0 ${isAlone === false ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                <UsersIcon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className={`text-lg font-bold ${isAlone === false ? 'text-indigo-900' : 'text-slate-900'}`}>Me & Family/Friends</h4>
                                    {isAlone === false && (
                                        <div className="bg-indigo-600 text-white p-1 rounded-full">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <p className={`text-sm ${isAlone === false ? 'text-indigo-700' : 'text-slate-500'}`}>I want to add my family members or friends.</p>
                            </div>
                        </div>
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
                        Proceed to Payment
                    </button>
                ) : isAlone === false ? (
                    <button
                        type="button"
                        className="btn-primary w-full text-lg py-4 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform transition-all hover:-translate-y-1"
                        onClick={onNext}
                    >
                        Continue to Add Family/Friends →
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
