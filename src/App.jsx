import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DevoteeForm from './components/DevoteeForm';
import FamilyForm from './components/FamilyForm';
import LoadingSpinner from './components/LoadingSpinner';
import SuccessScreen from './components/SuccessScreen';
import { ScrollToTop, ErrorSummary } from './components/common';
import { STORAGE_KEYS, REQUEST_TIMEOUT } from './utils/constants';

// Field labels for error summary scroll-to-field
const FIELD_LABELS = {
    name: 'Name',
    age: 'Age',
    email: 'Email',
    whatsapp: 'WhatsApp Number',
    gender: 'Gender',
    prasadPreference: 'Prasadam Preference',
    languages: 'Language you know'
};

// Replace this with your deployed Google Apps Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVSgyNW5wgETneCsgZBOHWPhc_qiApYb0SUcFcE-KAKIuWSFnHasqgpwfXWdzsrmNGIA/exec';

// Helper to load from localStorage
const loadFromStorage = (key, defaultValue) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
};

// Helper to save to localStorage
const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
};

// Helper to clear form data from localStorage
const clearFormStorage = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.DEVOTEE_DATA);
        localStorage.removeItem(STORAGE_KEYS.FAMILY_MEMBERS);
        localStorage.removeItem(STORAGE_KEYS.IS_ALONE);
    } catch (e) {
        console.warn('Failed to clear localStorage:', e);
    }
};

function App() {
    // Form wizard state
    const [currentPage, setCurrentPage] = useState(1); // 1: Devotee, 2: Family, 3: Success
    const [isLoading, setIsLoading] = useState(false);

    // Devotee data - load from localStorage on mount
    const [devoteeData, setDevoteeData] = useState(() =>
        loadFromStorage(STORAGE_KEYS.DEVOTEE_DATA, {
            name: '',
            age: '',
            email: '',
            whatsapp: '',
            gender: '',
            prasadPreference: [],
            languages: []
        })
    );

    // Alone/Group selection - load from localStorage
    const [isAlone, setIsAlone] = useState(() =>
        loadFromStorage(STORAGE_KEYS.IS_ALONE, null)
    );

    // Family members - load from localStorage
    const [familyMembers, setFamilyMembers] = useState(() =>
        loadFromStorage(STORAGE_KEYS.FAMILY_MEMBERS, [{
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
        }])
    );

    // Validation errors
    const [devoteeErrors, setDevoteeErrors] = useState({});
    const [familyErrors, setFamilyErrors] = useState([{}]);

    // Persist devoteeData to localStorage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.DEVOTEE_DATA, devoteeData);
    }, [devoteeData]);

    // Persist isAlone to localStorage
    useEffect(() => {
        if (isAlone !== null) {
            saveToStorage(STORAGE_KEYS.IS_ALONE, isAlone);
        }
    }, [isAlone]);

    // Persist familyMembers to localStorage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.FAMILY_MEMBERS, familyMembers);
    }, [familyMembers]);

    // Validate a single devotee field (for onBlur)
    const validateDevoteeField = useCallback((field) => {
        const newErrors = { ...devoteeErrors };

        switch (field) {
            case 'name':
                if (!devoteeData.name?.trim()) {
                    newErrors.name = 'Name is required';
                } else {
                    delete newErrors.name;
                }
                break;
            case 'age':
                const age = parseInt(devoteeData.age);
                if (!devoteeData.age || isNaN(age) || age < 5 || age > 100) {
                    newErrors.age = 'Age must be between 5 and 100';
                } else {
                    delete newErrors.age;
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!devoteeData.email || !emailRegex.test(devoteeData.email)) {
                    newErrors.email = 'Please enter a valid email address';
                } else {
                    delete newErrors.email;
                }
                break;
            case 'whatsapp':
                const whatsappRegex = /^\d{10}$/;
                if (!devoteeData.whatsapp || !whatsappRegex.test(devoteeData.whatsapp)) {
                    newErrors.whatsapp = 'Please enter a valid 10-digit WhatsApp number';
                } else {
                    delete newErrors.whatsapp;
                }
                break;
            case 'gender':
                if (!devoteeData.gender) {
                    newErrors.gender = 'Please select your gender';
                } else {
                    delete newErrors.gender;
                }
                break;
            default:
                break;
        }

        setDevoteeErrors(newErrors);
    }, [devoteeData, devoteeErrors]);

    // Validate devotee form
    const validateDevotee = () => {
        const errors = {};

        if (!devoteeData.name?.trim()) {
            errors.name = 'Name is required';
        }

        const age = parseInt(devoteeData.age);
        if (!devoteeData.age || isNaN(age) || age < 5 || age > 100) {
            errors.age = 'Age must be between 5 and 100 years';
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
            errors.prasadPreference = 'Please select at least one Prasadam Preference';
        }

        if (!devoteeData.languages || devoteeData.languages.length === 0) {
            errors.languages = 'Please select at least one Language you know(Select All)';
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
                memberErrors.age = 'Age must be between 1 and 100 years';
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

    // Submit to Google Sheets with timeout
    const submitToGoogleSheets = async (data) => {
        setIsLoading(true);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // With no-cors, we can't read the response, so we assume success
            clearFormStorage();
            setCurrentPage(3);
        } catch (error) {
            if (error.name === 'AbortError') {
                alert('The request took too long. Please check your internet connection and try again.');
            } else {
                console.error('Submission error:', error);
                alert('There was an error submitting your registration. Please try again.');
            }
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

    // Handle progress indicator click
    const handleProgressClick = (page) => {
        if (page === 1 && currentPage === 2) {
            handleBack();
        }
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
                                        src="assets/Yatra.webp"
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
                            {/* Progress Indicator - Clickable */}
                            {currentPage !== 3 && (
                                <div className="flex items-center justify-center mb-8">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => handleProgressClick(1)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${currentPage >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                                                } ${currentPage === 2 ? 'cursor-pointer hover:bg-indigo-700' : 'cursor-default'}`}
                                            disabled={currentPage === 1}
                                            title={currentPage === 2 ? 'Go back to your details' : ''}
                                        >
                                            1
                                        </button>
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
                                <>
                                    {Object.keys(devoteeErrors).length > 0 && (
                                        <ErrorSummary errors={devoteeErrors} fieldLabels={FIELD_LABELS} />
                                    )}
                                    <DevoteeForm
                                        data={devoteeData}
                                        onChange={setDevoteeData}
                                        isAlone={isAlone}
                                        setIsAlone={setIsAlone}
                                        onNext={handleNext}
                                        onSubmit={handleSubmitAlone}
                                        errors={devoteeErrors}
                                        onBlur={validateDevoteeField}
                                    />
                                </>
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

            {/* Scroll to Top Button */}
            <ScrollToTop />
        </div>
    );
}

export default App;
