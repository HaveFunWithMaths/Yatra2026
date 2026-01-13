import React from 'react';

const DevoteeForm = ({ data, onChange, isAlone, setIsAlone, onNext, onSubmit, errors }) => {
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
        <div className="animate-fade-in">
            {/* Information Header */}
            <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <span className="mr-2">🙏</span> Hare Krishna dear devotees, PAMHO!
                    </h3>
                </div>

                <div className="p-6 space-y-6 text-slate-700">
                    <p className="font-medium text-indigo-900 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                        Please go through the following points before filling the form.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-2 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Yatra Dates
                            </h4>
                            <p className="text-sm"><span className="font-semibold">Begins:</span> 22nd July (Tuesday) Evening</p>
                            <p className="text-sm"><span className="font-semibold">Ends:</span> 27th July (Sunday) Evening</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-2 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Registration Charges
                            </h4>
                            <ul className="text-sm space-y-1">
                                <li><span className="font-semibold">Adult:</span> ₹1000</li>
                                <li><span className="font-semibold">Child (5-12):</span> ₹600</li>
                                <li><span className="font-semibold">Infant (Below 5):</span> Free</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Criteria for Participation
                        </h4>
                        <ul className="list-disc ml-5 space-y-2 text-sm leading-relaxed">
                            <li>All Yatris should be happy to associate with devotees and have a favourable impression.</li>
                            <li>All Yatris should be eager to participate wholeheartedly in Yatra activities.</li>
                            <li>Yatris should not blaspheme or criticize devotees, or devotional practices (Kirtan, Japa, visits to Holy Places, etc.).</li>
                        </ul>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <h4 className="font-bold text-amber-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Registration Process
                        </h4>
                        <ol className="list-decimal ml-5 space-y-2 text-sm text-amber-900/80">
                            <li>Main points of contact (GNH connected devotees) fill this form for family/friends.</li>
                            <li>Yatra committee will reach out to confirm acceptance of your request.</li>
                            <li>Yatra committee will request confirmation of registration via token advance payment.</li>
                        </ol>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Name Field */}
                <div>
                    <label className="form-label">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        className={`form-input ${errors.name ? 'border-red-400 focus:ring-red-500' : ''}`}
                        placeholder="Enter your full name"
                        value={data.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Age Field */}
                <div>
                    <label className="form-label">
                        Age <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        className={`form-input ${errors.age ? 'border-red-400 focus:ring-red-500' : ''}`}
                        placeholder="Enter your age (5-100)"
                        min="5"
                        max="100"
                        value={data.age || ''}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                    />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>

                {/* Email Field */}
                <div>
                    <label className="form-label">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        className={`form-input ${errors.email ? 'border-red-400 focus:ring-red-500' : ''}`}
                        placeholder="Enter your email address"
                        value={data.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* WhatsApp Field */}
                <div>
                    <label className="form-label">
                        WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        className={`form-input ${errors.whatsapp ? 'border-red-400 focus:ring-red-500' : ''}`}
                        placeholder="Enter 10-digit WhatsApp number"
                        value={data.whatsapp || ''}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    />
                    {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
                </div>

                {/* Gender Dropdown */}
                <div>
                    <label className="form-label">
                        Gender <span className="text-red-500">*</span>
                    </label>
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

                {/* Prasad Preference Checkboxes */}
                <div>
                    <label className="form-label">
                        Prasad Preference <span className="text-red-500">*</span>
                    </label>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        {prasadOptions.map((option) => (
                            <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    checked={(data.prasadPreference || []).includes(option)}
                                    onChange={() => handleCheckboxChange('prasadPreference', option)}
                                />
                                <span className="text-slate-700 group-hover:text-indigo-600 transition-colors">
                                    {option}
                                </span>
                            </label>
                        ))}
                    </div>
                    {errors.prasadPreference && <p className="text-red-500 text-sm mt-1">{errors.prasadPreference}</p>}
                </div>

                {/* Language Checkboxes */}
                <div>
                    <label className="form-label">
                        Languages <span className="text-red-500">*</span>
                    </label>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        {languageOptions.map((option) => (
                            <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    checked={(data.languages || []).includes(option)}
                                    onChange={() => handleCheckboxChange('languages', option)}
                                />
                                <span className="text-slate-700 group-hover:text-indigo-600 transition-colors">
                                    {option}
                                </span>
                            </label>
                        ))}
                    </div>
                    {errors.languages && <p className="text-red-500 text-sm mt-1">{errors.languages}</p>}
                </div>

                {/* Alone/Group Radio */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                    <label className="form-label text-amber-800 mb-4 block">
                        Are you attending the Yatra alone, or would you like to fill the details of interested friends and relatives?
                    </label>
                    <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="attendingAlone"
                                className="form-radio"
                                checked={isAlone === true}
                                onChange={() => setIsAlone(true)}
                            />
                            <span className="text-amber-900 group-hover:text-amber-700 transition-colors font-medium">
                                Yes, I am attending alone
                            </span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="attendingAlone"
                                className="form-radio"
                                checked={isAlone === false}
                                onChange={() => setIsAlone(false)}
                            />
                            <span className="text-amber-900 group-hover:text-amber-700 transition-colors font-medium">
                                No, I want to add friends/relatives
                            </span>
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4">
                    {isAlone === true ? (
                        <button
                            type="button"
                            className="btn-primary w-full text-lg"
                            onClick={onSubmit}
                        >
                            Submit Registration
                        </button>
                    ) : isAlone === false ? (
                        <button
                            type="button"
                            className="btn-primary w-full text-lg"
                            onClick={onNext}
                        >
                            Next: Add Friends & Family →
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn-primary w-full text-lg opacity-50 cursor-not-allowed"
                            disabled
                        >
                            Please select an option above
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DevoteeForm;
