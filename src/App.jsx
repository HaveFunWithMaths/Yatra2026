import React, { useState } from 'react';
import Header from './components/Header';
import DevoteeForm from './components/DevoteeForm';
import FamilyForm from './components/FamilyForm';
import LoadingSpinner from './components/LoadingSpinner';
import SuccessScreen from './components/SuccessScreen';

// Replace this with your deployed Google Apps Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVSgyNW5wgETneCsgZBOHWPhc_qiApYb0SUcFcE-KAKIuWSFnHasqgpwfXWdzsrmNGIA/exec';

function App() {
    // Form wizard state
    const [currentPage, setCurrentPage] = useState(1); // 1: Devotee, 2: Family, 3: Success
    const [isLoading, setIsLoading] = useState(false);

    // Devotee data
    const [devoteeData, setDevoteeData] = useState({
        name: '',
        age: '',
        email: '',
        whatsapp: '',
        gender: '',
        prasadPreference: [],
        languages: []
    });

    // Alone/Group selection
    const [isAlone, setIsAlone] = useState(null);

    // Family members
    const [familyMembers, setFamilyMembers] = useState([{
        name: '',
        age: '',
        gender: '',
        phone: '',
        prasadPreference: [],
        languages: [],
        seating: '',
        chanting: '',
        inclination: '',
        spiritualStatus: ''
    }]);

    // Validation errors
    const [devoteeErrors, setDevoteeErrors] = useState({});
    const [familyErrors, setFamilyErrors] = useState([{}]);

    // Validate devotee form
    const validateDevotee = () => {
        const errors = {};

        if (!devoteeData.name?.trim()) {
            errors.name = 'Name is required';
        }

        const age = parseInt(devoteeData.age);
        if (!devoteeData.age || isNaN(age) || age < 5 || age > 100) {
            errors.age = 'Age must be between 5 and 100';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!devoteeData.email || !emailRegex.test(devoteeData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        const whatsappRegex = /^\d{10}$/;
        if (!devoteeData.whatsapp || !whatsappRegex.test(devoteeData.whatsapp)) {
            errors.whatsapp = 'Please enter a valid 10-digit WhatsApp number';
        }

        if (!devoteeData.gender) {
            errors.gender = 'Please select your gender';
        }

        if (!devoteeData.prasadPreference || devoteeData.prasadPreference.length === 0) {
            errors.prasadPreference = 'Please select at least one prasad preference';
        }

        if (!devoteeData.languages || devoteeData.languages.length === 0) {
            errors.languages = 'Please select at least one language';
        }

        setDevoteeErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate family members
    const validateFamily = () => {
        const errors = familyMembers.map(member => {
            const memberErrors = {};

            if (!member.name?.trim()) {
                memberErrors.name = 'Name is required';
            }

            const age = parseInt(member.age);
            if (!member.age || isNaN(age) || age < 1 || age > 100) {
                memberErrors.age = 'Valid age is required';
            }

            if (!member.gender) {
                memberErrors.gender = 'Gender is required';
            }

            return memberErrors;
        });

        setFamilyErrors(errors);
        return errors.every(e => Object.keys(e).length === 0);
    };

    // Add new family member
    const addFamilyMember = () => {
        setFamilyMembers([...familyMembers, {
            name: '',
            age: '',
            gender: '',
            phone: '',
            prasadPreference: [],
            languages: [],
            seating: '',
            chanting: '',
            inclination: '',
            spiritualStatus: ''
        }]);
        setFamilyErrors([...familyErrors, {}]);
    };

    // Remove family member
    const removeFamilyMember = (index) => {
        if (familyMembers.length > 1) {
            const newMembers = familyMembers.filter((_, i) => i !== index);
            const newErrors = familyErrors.filter((_, i) => i !== index);
            setFamilyMembers(newMembers);
            setFamilyErrors(newErrors);
        }
    };

    // Submit to Google Sheets
    const submitToGoogleSheets = async (data) => {
        setIsLoading(true);

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            // With no-cors, we can't read the response, so we assume success
            setCurrentPage(3);
        } catch (error) {
            console.error('Submission error:', error);
            alert('There was an error submitting your registration. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Next button (Page 1 -> Page 2)
    const handleNext = () => {
        if (validateDevotee()) {
            setCurrentPage(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Handle Back button (Page 2 -> Page 1)
    const handleBack = () => {
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle Submit from Page 1 (Alone)
    const handleSubmitAlone = () => {
        if (validateDevotee()) {
            const payload = {
                alone: true,
                devotee: {
                    name: devoteeData.name,
                    age: devoteeData.age,
                    email: devoteeData.email,
                    whatsapp: devoteeData.whatsapp,
                    gender: devoteeData.gender,
                    prasadPreference: devoteeData.prasadPreference.join(', '),
                    languages: devoteeData.languages.join(', ')
                }
            };
            submitToGoogleSheets(payload);
        }
    };

    // Handle Submit from Page 2 (With Family)
    const handleSubmitWithFamily = () => {
        const devoteeValid = validateDevotee();
        const familyValid = validateFamily();

        if (devoteeValid && familyValid) {
            const payload = {
                alone: false,
                devotee: {
                    name: devoteeData.name,
                    age: devoteeData.age,
                    email: devoteeData.email,
                    whatsapp: devoteeData.whatsapp,
                    gender: devoteeData.gender,
                    prasadPreference: devoteeData.prasadPreference.join(', '),
                    languages: devoteeData.languages.join(', ')
                },
                family: familyMembers.map(member => ({
                    name: member.name,
                    age: member.age,
                    gender: member.gender,
                    phone: member.phone || '',
                    prasadPreference: (member.prasadPreference || []).join(', '),
                    languages: (member.languages || []).join(', '),
                    seating: member.seating || '',
                    chanting: member.chanting || '',
                    inclination: member.inclination || '',
                    spiritualStatus: member.spiritualStatus || ''
                }))
            };
            submitToGoogleSheets(payload);
        }
    };

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <Header />

            {/* Loading Overlay */}
            {isLoading && <LoadingSpinner />}

            {/* Main Content */}
            <main className="pt-24 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Form Card */}
                    <div className="card">
                        {/* Form Header */}
                        {currentPage !== 3 && (
                            <div className="relative">
                                {/* Hero Image */}
                                <div className="h-48 md:h-64 overflow-hidden">
                                    <img
                                        src="/assets/Yatra.webp"
                                        alt="GNH Yatra"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                </div>

                                {/* Title Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h2 className="text-2xl md:text-3xl font-bold drop-shadow-lg">
                                        Request Form for GNH Community Yatra 2026
                                    </h2>
                                </div>
                            </div>
                        )}

                        {/* Form Content */}
                        <div className="p-6 md:p-8">
                            {/* Progress Indicator */}
                            {currentPage !== 3 && (
                                <div className="flex items-center justify-center mb-8">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${currentPage >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                            1
                                        </div>
                                        <div className={`w-16 h-1 rounded transition-all duration-300 ${currentPage >= 2 ? 'bg-indigo-600' : 'bg-slate-200'
                                            }`}></div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${currentPage >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                            2
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Page 1: Devotee Form */}
                            {currentPage === 1 && (
                                <DevoteeForm
                                    data={devoteeData}
                                    onChange={setDevoteeData}
                                    isAlone={isAlone}
                                    setIsAlone={setIsAlone}
                                    onNext={handleNext}
                                    onSubmit={handleSubmitAlone}
                                    errors={devoteeErrors}
                                />
                            )}

                            {/* Page 2: Family Form */}
                            {currentPage === 2 && (
                                <FamilyForm
                                    members={familyMembers}
                                    onChange={setFamilyMembers}
                                    onAddMember={addFamilyMember}
                                    onRemoveMember={removeFamilyMember}
                                    onBack={handleBack}
                                    onSubmit={handleSubmitWithFamily}
                                    errors={familyErrors}
                                />
                            )}

                            {/* Page 3: Success */}
                            {currentPage === 3 && <SuccessScreen />}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 text-slate-500 text-sm">
                        <p>© 2026 GNH Community. All rights reserved.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
