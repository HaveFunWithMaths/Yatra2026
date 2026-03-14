import React, { useState } from 'react';
import MemberCard from './MemberCard';

const FamilyForm = ({ members, existingMembers, onChange, onAddMember, onRemoveMember, onBack, onSubmit, errors }) => {
    const [addError, setAddError] = useState('');

    const handleMemberChange = (index, updatedMember) => {
        const newMembers = [...members];
        newMembers[index] = updatedMember;
        onChange(newMembers);
        if (addError) setAddError('');
    };

    const handleAddClick = () => {
        // Check if all current members have their mandatory fields filled
        for (let i = 0; i < members.length; i++) {
            const m = members[i];
            if (!m.name?.trim() || !m.age || !m.gender) {
                setAddError(`Please fill the mandatory fields (Name, Age, Gender) for person ${i + 1} before adding another.`);
                return;
            }
        }
        setAddError('');
        onAddMember();
    };

    return (
        <div className="animate-fade-in">
            {/* Guidelines Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-6 card-hover">
                <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Adding Family & Friends
                </h3>
                <ol className="text-amber-800 space-y-2 ml-6 list-decimal">
                    <li>Please fill all details of friends and relatives who are interested in joining the Yatra.</li>
                    <li>Select all applicable options for Prasadam Preference and languages.</li>
                    <li>Provide accurate information for seating preferences and chanting status.</li>
                </ol>
            </div>

            {/* Already Registered Members */}
            {existingMembers && existingMembers.length > 0 && (
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -z-10"></div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        Already Registered Family & Friends
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {existingMembers.map((em, idx) => (
                            <div key={`existing-${idx}`} className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center justify-between">
                                <span className="font-semibold text-slate-700 truncate mr-2" title={em.name}>{em.name}</span>
                                <span className="text-sm bg-slate-200 text-slate-600 py-1 px-2 rounded-md whitespace-nowrap">Age: {em.age}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Member Cards */}
            <div className="space-y-6">
                {members.map((member, index) => (
                    <MemberCard
                        key={index}
                        member={member}
                        index={index}
                        onChange={handleMemberChange}
                        onRemove={onRemoveMember}
                        errors={errors[index] || {}}
                    />
                ))}
            </div>

            {/* Add Member Error */}
            {addError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {addError}
                </div>
            )}

            {/* Add Member Button */}
            <button
                type="button"
                className="btn-secondary w-full mt-6 flex items-center justify-center space-x-2"
                onClick={handleAddClick}
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Another Person</span>
            </button>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-200">
                <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={onBack}
                >
                    ← Back to Your Details
                </button>
                <button
                    type="button"
                    className="btn-primary flex-1 text-lg"
                    onClick={onSubmit}
                >
                    Proceed to Payment
                </button>
            </div>
        </div>
    );
};

export default FamilyForm;
