import React, { useState } from 'react';
import { InputField, SelectField, CheckboxGroup, UserIcon, EmailIcon, PhoneIcon, ChevronDownIcon, InfoIcon, CalendarIcon, CurrencyIcon, CheckCircleIcon, ClipboardIcon, UsersIcon, CheckIcon } from './common';
import { prasadOptions, languageOptions, genderOptions } from '../utils/constants';

const DevoteeForm = ({ data, onChange, isAlone, setIsAlone, onNext, onSubmit, errors, onBlur }) => {
    const [showInfo, setShowInfo] = useState(true);
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
                                    <p className="text-sm flex justify-between"><span className="text-slate-500">Begins:</span> <span className="font-medium">22nd July (Tue) Evening</span></p>
                                    <p className="text-sm flex justify-between"><span className="text-slate-500">Ends:</span> <span className="font-medium">27th July (Sun) Evening</span></p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                <h4 className="font-bold text-slate-900 mb-2 flex items-center">
                                    <CurrencyIcon className="w-5 h-5 mr-2 text-indigo-600" />
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
                        <UserIcon className="w-6 h-6" />
                    </span>
                    Personal Details
                </h3>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            required
                            type="number"
                            placeholder="Age (5-100)"
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
                            className="col-span-2 md:col-span-1"
                        />

                        <InputField
                            label="WhatsApp Number"
                            required
                            type="tel"
                            icon={PhoneIcon}
                            placeholder="10-digit number"
                            value={data.whatsapp || ''}
                            onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                            onBlur={() => handleFieldBlur('whatsapp')}
                            error={errors.whatsapp}
                            className="col-span-2 md:col-span-1"
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
                    Preferences
                </h3>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <CheckboxGroup
                        label="Prasad Preference"
                        required
                        options={prasadOptions}
                        selectedValues={data.prasadPreference || []}
                        onChange={(values) => handleInputChange('prasadPreference', values)}
                        error={errors.prasadPreference}
                    />

                    <CheckboxGroup
                        label="Languages"
                        required
                        options={languageOptions}
                        selectedValues={data.languages || []}
                        onChange={(values) => handleInputChange('languages', values)}
                        error={errors.languages}
                    />
                </div>
            </div>

            {/* Attendance Format Section */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="bg-amber-100 text-amber-600 p-2 rounded-lg mr-3">
                        <UsersIcon className="w-6 h-6" />
                    </span>
                    Who is attending?
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option: Alone - Horizontal Layout */}
                    <div
                        onClick={() => setIsAlone(true)}
                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${isAlone === true
                            ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2'
                            : 'border-slate-200 bg-white hover:border-indigo-300'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl shrink-0 ${isAlone === true ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                <UserIcon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className={`text-lg font-bold ${isAlone === true ? 'text-indigo-900' : 'text-slate-900'}`}>Just Me</h4>
                                    {isAlone === true && (
                                        <div className="bg-indigo-600 text-white p-1 rounded-full">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <p className={`text-sm ${isAlone === true ? 'text-indigo-700' : 'text-slate-500'}`}>I am registering only for myself.</p>
                            </div>
                        </div>
                        <input type="radio" className="hidden" />
                    </div>

                    {/* Option: Group - Horizontal Layout */}
                    <div
                        onClick={() => setIsAlone(false)}
                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${isAlone === false
                            ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2'
                            : 'border-slate-200 bg-white hover:border-indigo-300'
                            }`}
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
