import React, { useState } from 'react';
import { InputField, SelectField, ConfirmDialog, CheckboxGroup, ChevronDownIcon } from './common';
import { prasadOptions, languageOptions, seatingOptions, chantingOptions, genderOptions } from '../utils/constants';

const MemberCard = ({ member, index, onChange, onRemove, errors = {} }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

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
                {/* Card Header with Collapse Toggle */}
                <div className="flex items-center justify-between mb-5">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center space-x-3 group"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            {index + 1}
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {member.name || `Person ${index + 1}`}
                            </h3>
                            {!isExpanded && member.age && (
                                <p className="text-sm text-slate-500">Age: {member.age} • {member.gender || 'Gender not set'}</p>
                            )}
                        </div>
                        <div className={`ml-2 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDownIcon className="w-5 h-5" />
                        </div>
                    </button>
                    <button
                        type="button"
                        className="btn-danger text-sm"
                        onClick={handleRemoveClick}
                    >
                        Remove
                    </button>
                </div>

                {/* Collapsible Content */}
                <div className={`collapsible-content ${isExpanded ? 'expanded' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Name"
                            name={`member-${index}-name`}
                            required
                            placeholder="Full name"
                            value={member.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            error={errors.name}
                        />

                        <InputField
                            label="Age"
                            name={`member-${index}-age`}
                            required
                            type="number"
                            inputMode="numeric"
                            placeholder="Age (0-100)"
                            min="0"
                            max="100"
                            value={member.age || ''}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                            error={errors.age}
                        />

                        <SelectField
                            label="Gender"
                            name={`member-${index}-gender`}
                            required
                            placeholder="Select Gender"
                            options={genderOptions}
                            value={member.gender || ''}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            error={errors.gender}
                        />

                        <InputField
                            label="Relationship with a devotee"
                            name={`member-${index}-relationship`}
                            placeholder="E.g., Spouse, Friend, Son"
                            value={member.relationship || ''}
                            onChange={(e) => handleInputChange('relationship', e.target.value)}
                        />
                    </div>

                    {/* Prasadam Preference */}
                    <div className="mt-4">
                        <SelectField
                            label="Prasadam Preference"
                            name={`member-${index}-prasad`}
                            placeholder="Select Prasadam Preference"
                            options={prasadOptions}
                            value={member.prasadPreference || ''}
                            onChange={(e) => handleInputChange('prasadPreference', e.target.value)}
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
                        <label className="form-label mb-2 block">Seating Preference (Select chair only if strictly required)</label>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                            {seatingOptions.map((option) => (
                                <label key={option} className="w-full sm:w-auto flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                                    <input
                                        type="radio"
                                        name={`seating-${index}`}
                                        className="form-radio w-4 h-4 text-indigo-600 focus:ring-indigo-500 shrink-0"
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
                        <label className="form-label mb-2 block">Chanting Status (Rounds)</label>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                            {chantingOptions.map((option) => (
                                <label key={option} className="w-full sm:w-auto flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                                    <input
                                        type="radio"
                                        name={`chanting-${index}`}
                                        className="form-radio w-4 h-4 text-indigo-600 focus:ring-indigo-500 shrink-0"
                                        checked={member.chanting === option}
                                        onChange={() => handleInputChange('chanting', option)}
                                    />
                                    <span className="text-sm text-slate-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>



                    {/* Spiritual Status */}
                    <div className="mt-4">
                        <label className="form-label mb-2 block">One line detail about their spiritual status</label>
                        <textarea
                            className="form-input min-h-[80px] resize-none"
                            placeholder="E.g., Attended previous yatra positively, in touch with (devotee name)"
                            value={member.spiritualStatus || ''}
                            onChange={(e) => handleInputChange('spiritualStatus', e.target.value)}
                        />
                    </div>
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
