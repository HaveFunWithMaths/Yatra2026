import React from 'react';
import MemberCard from './MemberCard';

const FamilyForm = ({ members, onChange, onAddMember, onRemoveMember, onBack, onSubmit, errors }) => {
    const handleMemberChange = (index, updatedMember) => {
        const newMembers = [...members];
        newMembers[index] = updatedMember;
        onChange(newMembers);
    };

    return (
        <div className="animate-fade-in">
            {/* Guidelines Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-6">
                <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Guidelines for Contacts Section
                </h3>
                <ol className="text-amber-800 space-y-2 ml-6 list-decimal">
                    <li>Please fill all details of friends and relatives who are interested in joining the Yatra.</li>
                    <li>Select all applicable options for Prasadam Preference and languages.</li>
                    <li>Provide accurate information for seating preferences and chanting status.</li>
                </ol>
            </div>

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

            {/* Add Member Button */}
            <button
                type="button"
                className="btn-secondary w-full mt-6 flex items-center justify-center space-x-2"
                onClick={onAddMember}
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Another Member</span>
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
                    Submit All Registrations
                </button>
            </div>
        </div>
    );
};

export default FamilyForm;
