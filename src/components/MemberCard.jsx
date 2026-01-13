import React, { useState } from 'react';
import { InputField, SelectField, ConfirmDialog, CheckboxGroup } from './common';
import { prasadOptions, languageOptions, seatingOptions, chantingOptions, genderOptions } from '../utils/constants';

const MemberCard = ({ member, index, onChange, onRemove, errors = {} }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

    const handleRemoveClick = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmRemove = () => {
        setShowConfirmDialog(false);
        onRemove(index);
    };

    return (
        <>
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
                        onClick={handleRemoveClick}
                    >
                        Remove
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Name"
                        required
                        placeholder="Full name"
                        value={member.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        error={errors.name}
                    />

                    <InputField
                        label="Age"
                        required
                        type="number"
                        placeholder="Age"
                        min="1"
                        max="100"
                        value={member.age || ''}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        error={errors.age}
                    />

                    <SelectField
                        label="Gender"
                        required
                        placeholder="Select Gender"
                        options={genderOptions}
                        value={member.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        error={errors.gender}
                    />

                    <InputField
                        label="Phone Number"
                        type="tel"
                        placeholder="Phone number"
                        value={member.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                </div>

                {/* Prasadam Preference */}
                <div className="mt-4">
                    <CheckboxGroup
                        label="Prasadam Preference"
                        options={prasadOptions}
                        selectedValues={member.prasadPreference || []}
                        onChange={(values) => handleInputChange('prasadPreference', values)}
                    />
                </div>

                {/* Language */}
                <div className="mt-4">
                    <CheckboxGroup
                        label="Language you know(Select All)"
                        options={languageOptions}
                        selectedValues={member.languages || []}
                        onChange={(values) => handleInputChange('languages', values)}
                    />
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

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showConfirmDialog}
                title="Remove Member"
                message={`Are you sure you want to remove ${member.name || 'this member'}? This action cannot be undone.`}
                onConfirm={handleConfirmRemove}
                onCancel={() => setShowConfirmDialog(false)}
            />
        </>
    );
};

export default MemberCard;
