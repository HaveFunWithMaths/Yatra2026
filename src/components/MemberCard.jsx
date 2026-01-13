import React from 'react';

const MemberCard = ({ member, index, onChange, onRemove, errors = {} }) => {
    const handleInputChange = (field, value) => {
        onChange(index, { ...member, [field]: value });
    };

    const handleCheckboxChange = (field, value) => {
        const currentValues = member[field] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onChange(index, { ...member, [field]: newValues });
    };

    const prasadOptions = ['Diabetic', 'North Indian', 'South Indian'];
    const languageOptions = ['Hindi', 'English', 'Telugu'];
    const seatingOptions = ['Needs chair', 'Can sit below'];
    const chantingOptions = ['1+', '4+', '8+', '16'];

    return (
        <div className="member-card animate-fade-in">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">
                        Member {index + 1}
                    </h3>
                </div>
                <button
                    type="button"
                    className="btn-danger text-sm"
                    onClick={() => onRemove(index)}
                >
                    Remove
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                    <label className="form-label">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                        placeholder="Full name"
                        value={member.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Age */}
                <div>
                    <label className="form-label">
                        Age <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        className={`form-input ${errors.age ? 'border-red-400' : ''}`}
                        placeholder="Age"
                        min="1"
                        max="100"
                        value={member.age || ''}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                    />
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                </div>

                {/* Gender */}
                <div>
                    <label className="form-label">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                        className={`form-select ${errors.gender ? 'border-red-400' : ''}`}
                        value={member.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>

                {/* Phone (Optional) */}
                <div>
                    <label className="form-label">
                        Phone Number <span className="text-slate-400 text-xs">(Optional)</span>
                    </label>
                    <input
                        type="tel"
                        className="form-input"
                        placeholder="Phone number"
                        value={member.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                </div>
            </div>

            {/* Prasad Preference */}
            <div className="mt-4">
                <label className="form-label">Prasad Preference</label>
                <div className="flex flex-wrap gap-3">
                    {prasadOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                            <input
                                type="checkbox"
                                className="form-checkbox w-4 h-4"
                                checked={(member.prasadPreference || []).includes(option)}
                                onChange={() => handleCheckboxChange('prasadPreference', option)}
                            />
                            <span className="text-sm text-slate-700">{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Language */}
            <div className="mt-4">
                <label className="form-label">Languages</label>
                <div className="flex flex-wrap gap-3">
                    {languageOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                            <input
                                type="checkbox"
                                className="form-checkbox w-4 h-4"
                                checked={(member.languages || []).includes(option)}
                                onChange={() => handleCheckboxChange('languages', option)}
                            />
                            <span className="text-sm text-slate-700">{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Seating Preference */}
            <div className="mt-4">
                <label className="form-label">Seating Preference</label>
                <div className="flex flex-wrap gap-3">
                    {seatingOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                            <input
                                type="radio"
                                name={`seating-${index}`}
                                className="form-radio w-4 h-4"
                                checked={member.seating === option}
                                onChange={() => handleInputChange('seating', option)}
                            />
                            <span className="text-sm text-slate-700">{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Chanting Status */}
            <div className="mt-4">
                <label className="form-label">Chanting Status (Rounds)</label>
                <div className="flex flex-wrap gap-3">
                    {chantingOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                            <input
                                type="radio"
                                name={`chanting-${index}`}
                                className="form-radio w-4 h-4"
                                checked={member.chanting === option}
                                onChange={() => handleInputChange('chanting', option)}
                            />
                            <span className="text-sm text-slate-700">{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Inclination */}
            <div className="mt-4">
                <label className="form-label">Are they favourably inclined towards Krishna Consciousness?</label>
                <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                        <input
                            type="radio"
                            name={`inclination-${index}`}
                            className="form-radio w-4 h-4"
                            checked={member.inclination === 'Yes'}
                            onChange={() => handleInputChange('inclination', 'Yes')}
                        />
                        <span className="text-sm text-slate-700">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                        <input
                            type="radio"
                            name={`inclination-${index}`}
                            className="form-radio w-4 h-4"
                            checked={member.inclination === 'No'}
                            onChange={() => handleInputChange('inclination', 'No')}
                        />
                        <span className="text-sm text-slate-700">No</span>
                    </label>
                </div>
            </div>

            {/* Spiritual Status */}
            <div className="mt-4">
                <label className="form-label">One line detail about their spiritual status</label>
                <textarea
                    className="form-input min-h-[80px] resize-none"
                    placeholder="E.g., Regular temple visitor, new to KC..."
                    value={member.spiritualStatus || ''}
                    onChange={(e) => handleInputChange('spiritualStatus', e.target.value)}
                />
            </div>
        </div>
    );
};

export default MemberCard;
