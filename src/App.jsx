import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DevoteeForm from './components/DevoteeForm';
import FamilyForm from './components/FamilyForm';
import LoadingSpinner from './components/LoadingSpinner';
import SuccessScreen from './components/SuccessScreen';
import PaymentScreen from './components/PaymentScreen';
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
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6Ul1p6jDgWhmBwAUwKYqH-n54Z_xotUZwW00YyyqgiHn_PC5Bj4yqSyCiaSz8ATcZHA/exec';

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
    const [currentPage, setCurrentPage] = useState(1); // 1: Devotee, 2: Family, 3: Payment, 4: Success
    const [isLoading, setIsLoading] = useState(false);

    // Devotee data - load from localStorage on mount
    const [devoteeData, setDevoteeData] = useState(() =>
        loadFromStorage(STORAGE_KEYS.DEVOTEE_DATA, {
            name: '',
            age: '',
            email: '',
            countryCode: '+91',
            whatsapp: '',
            gender: '',
            accommodation: '',
            prasadPreference: '',
            languages: [],
            concerns: ''
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
            relationship: '',
            prasadPreference: '',
            languages: [],
            seating: '',
            chanting: '',
            spiritualStatus: ''
        }])
    );

    // Validation errors
    const [devoteeErrors, setDevoteeErrors] = useState({});
    const [familyErrors, setFamilyErrors] = useState([{}]);

    // Auto-populate state
    const [isAutopopulated, setIsAutopopulated] = useState(() => loadFromStorage('isAutopopulated', false));
    const [existingFamilyMembers, setExistingFamilyMembers] = useState(() => loadFromStorage('existingFamilyMembers', []));
    const [fetchedWhatsapp, setFetchedWhatsapp] = useState('');
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error'

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

    // Persist auto-populate state
    useEffect(() => {
        saveToStorage('isAutopopulated', isAutopopulated);
        saveToStorage('existingFamilyMembers', existingFamilyMembers);
    }, [isAutopopulated, existingFamilyMembers]);

    // Auto-populate effect based on WhatsApp number
    useEffect(() => {
        const whatsapp = devoteeData?.whatsapp;
        if (whatsapp && whatsapp.length === 10 && whatsapp !== fetchedWhatsapp) {
            const fetchData = async () => {
                setIsFetchingData(true);
                try {
                    const url = `${GOOGLE_SCRIPT_URL}?action=getDevotee&whatsapp=${whatsapp}`;
                    const response = await fetch(url);
                    const result = await response.json();
                    console.log('[App] getDevotee result:', result);
                    console.log('[App] family members returned:', result.family?.length, result.family);
                    if (result.success && result.devotee) {
                        setDevoteeData(prev => ({ ...prev, ...result.devotee }));
                        setIsAutopopulated(true);
                        setExistingFamilyMembers(result.family || []);
                        if (isAlone === true) {
                            setIsAlone(false); // Can't be 'Just Me' if already in system with potential family
                        }
                        setDevoteeErrors({}); // clear any errors after pulling real data
                    } else {
                        // Not found or simple test response
                        setIsAutopopulated(false);
                        setExistingFamilyMembers([]);
                    }
                } catch (err) {
                    console.error("Failed to fetch auto-populate data:", err);
                    setIsAutopopulated(false);
                    setExistingFamilyMembers([]);
                } finally {
                    setFetchedWhatsapp(whatsapp);
                    setIsFetchingData(false);
                }
            };
            fetchData();
        } else if (!whatsapp || whatsapp.length < 10) {
            if (isAutopopulated) {
                setIsAutopopulated(false);
                setExistingFamilyMembers([]);
                setFetchedWhatsapp('');
            }
        }
    }, [devoteeData?.whatsapp, fetchedWhatsapp, isAlone]);

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
            case 'accommodation':
                if (!devoteeData.accommodation) {
                    newErrors.accommodation = 'Please select accommodation preference';
                } else {
                    delete newErrors.accommodation;
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

        if (!devoteeData.accommodation) {
            errors.accommodation = 'Please select accommodation preference';
        }

        if (!devoteeData.prasadPreference) {
            errors.prasadPreference = 'Please select a Prasadam Preference';
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
            if (!member.age || isNaN(age) || age < 0 || age > 100) {
                memberErrors.age = 'Age must be between 0 and 100 years';
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
            relationship: '',
            prasadPreference: '',
            languages: [],
            seating: '',
            chanting: '',
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

    // Hybrid Submission logic
    const submitToGoogleSheets = async (data) => {
        setSubmissionStatus('syncing');
        setCurrentPage(4); // Move to success page immediately (Optimistic UI)
        setIsLoading(false); // No need for global spinner if success screen handles it

        try {
            const jsonBody = JSON.stringify(data);
            
            // Background sync
            const requestPromise = fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: jsonBody,
            });

            // We wait for the request to complete in the background to confirm sync
            await requestPromise;

            // Success!
            setSubmissionStatus('success');
            clearFormStorage();
        } catch (error) {
            console.error('[App] Background submission error:', error);
            setSubmissionStatus('error');
        }
    };

    const handleRetry = () => {
        // Re-submit the last attempted payload (this could be improved by storing lastPayload)
        // For simplicity, we just go back to payment page so they can click submit again
        setCurrentPage(3);
        setSubmissionStatus('idle');
    };

    // Handle Next button (Page 1 -> Page 2)
    const handleNext = () => {
        if (validateDevotee()) {
            if (isAlone) {
                setCurrentPage(3);
            } else {
                setCurrentPage(2);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Handle Back button
    const handleBack = () => {
        if (currentPage === 2) {
            setCurrentPage(1);
        } else if (currentPage === 3) {
            setCurrentPage(isAlone ? 1 : 2);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle progress indicator click
    const handleProgressClick = (page) => {
        if (page === 1 && (currentPage === 2 || currentPage === 3)) {
            setCurrentPage(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (page === 2 && currentPage === 3 && !isAlone) {
            setCurrentPage(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Handle Next from Page 1 (Alone) -> goes to payment
    const handleNextToPaymentAlone = () => {
        if (validateDevotee()) {
            setCurrentPage(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Handle Next from Page 2 (With Family) -> goes to payment
    const handleNextToPaymentFamily = () => {
        const devoteeValid = validateDevotee();
        const familyValid = validateFamily();

        if (devoteeValid && familyValid) {
            setCurrentPage(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFinalSubmit = (paymentData) => {
        console.log('[App] handleFinalSubmit called');
        const paymentFile = paymentData?.paymentFile;
        const concerns = paymentData?.concerns || '';

        console.log('[App] paymentFile received:', paymentFile ? {
            name: paymentFile.name,
            mimeType: paymentFile.mimeType,
            dataLength: paymentFile.data?.length
        } : 'null/undefined');

        const ccDigits = (devoteeData.countryCode || '').replace(/\D/g, '');
        const isIndian = ccDigits === '91' || ccDigits === '';
        const finalWhatsapp = isIndian 
            ? devoteeData.whatsapp 
            : `'+${ccDigits}${devoteeData.whatsapp}`;

        if (isAlone) {
            const payload = {
                alone: true,
                devotee: {
                    name: devoteeData.name,
                    age: devoteeData.age,
                    email: devoteeData.email,
                    whatsapp: finalWhatsapp,
                    gender: devoteeData.gender,
                    accommodation: devoteeData.accommodation,
                    prasadPreference: devoteeData.prasadPreference,
                    languages: devoteeData.languages.join(', '),
                    concerns: concerns
                },
                paymentFile: paymentFile
            };
            console.log('[App] Submitting ALONE payload, keys:', Object.keys(payload));
            submitToGoogleSheets(payload);
        } else {
            const payload = {
                alone: false,
                devotee: {
                    name: devoteeData.name,
                    age: devoteeData.age,
                    email: devoteeData.email,
                    whatsapp: finalWhatsapp,
                    gender: devoteeData.gender,
                    accommodation: devoteeData.accommodation,
                    prasadPreference: devoteeData.prasadPreference,
                    languages: devoteeData.languages.join(', '),
                    concerns: concerns
                },
                family: familyMembers.map(member => ({
                    name: member.name,
                    age: member.age,
                    gender: member.gender,
                    relationship: member.relationship || '',
                    prasadPreference: member.prasadPreference || '',
                    languages: (member.languages || []).join(', '),
                    seating: member.seating || '',
                    chanting: member.chanting || '',
                    spiritualStatus: member.spiritualStatus || ''
                })),
                paymentFile: paymentFile
            };
            console.log('[App] Submitting FAMILY payload, keys:', Object.keys(payload), 'familyCount:', payload.family.length);
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
                        {currentPage !== 4 && (
                            <div className="relative">
                                {/* Hero Image */}
                                <div className="h-48 md:h-64 overflow-hidden">
                                    <img
                                        src="/assets/Hampi.jpg"
                                        alt="GNH Yatra"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                </div>

                                {/* Title Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h2 className="text-2xl md:text-3xl font-bold drop-shadow-lg">
                                        Registration Form for GNH Community Yatra:Hampi 2026
                                    </h2>
                                </div>
                            </div>
                        )}

                        {/* Form Content */}
                        <div className="p-6 md:p-8">
                            {/* Progress Indicator - Clickable */}
                            {currentPage !== 4 && (
                                <div className="flex items-center justify-center mb-8">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => handleProgressClick(1)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${currentPage >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'} ${(currentPage === 2 || currentPage === 3) ? 'cursor-pointer hover:bg-indigo-700' : 'cursor-default'}`}
                                            disabled={currentPage === 1}
                                            title={(currentPage === 2 || currentPage === 3) ? 'Go back to your details' : ''}
                                        >
                                            1
                                        </button>
                                        <div className={`w-8 h-1 rounded transition-all duration-300 ${currentPage >= 2 && !isAlone ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                                        <button
                                            onClick={() => handleProgressClick(2)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${(currentPage >= 2 && !isAlone) ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'} ${currentPage === 3 && !isAlone ? 'cursor-pointer hover:bg-indigo-700' : 'cursor-default'} ${isAlone ? 'opacity-50' : ''}`}
                                            disabled={currentPage < 2 || isAlone || currentPage === 2}
                                            title={isAlone ? 'Skipped for alone' : (currentPage === 3 ? 'Go back to family details' : '')}
                                        >
                                            2
                                        </button>
                                        <div className={`w-8 h-1 rounded transition-all duration-300 ${currentPage >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${currentPage >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            3
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
                                        onSubmit={handleNextToPaymentAlone}
                                        errors={devoteeErrors}
                                        onBlur={validateDevoteeField}
                                        isAutopopulated={isAutopopulated}
                                        isFetchingData={isFetchingData}
                                    />
                                </>
                            )}

                            {/* Page 2: Family Form */}
                            {currentPage === 2 && (
                                <FamilyForm
                                    members={familyMembers}
                                    existingMembers={existingFamilyMembers}
                                    onChange={setFamilyMembers}
                                    onAddMember={addFamilyMember}
                                    onRemoveMember={removeFamilyMember}
                                    onBack={handleBack}
                                    onSubmit={handleNextToPaymentFamily}
                                    errors={familyErrors}
                                />
                            )}

                            {/* Page 3: Payment Form */}
                            {currentPage === 3 && (
                                <PaymentScreen
                                    onBack={handleBack}
                                    onSubmit={handleFinalSubmit}
                                    isUploading={isLoading}
                                />
                            )}

                            {/* Page 4: Success */}
                            {currentPage === 4 && (
                                <SuccessScreen 
                                    status={submissionStatus} 
                                    onRetry={handleRetry}
                                />
                            )}
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
