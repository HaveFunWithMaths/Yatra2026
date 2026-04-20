import React, { useState } from 'react';

const PaymentScreen = ({ onBack, onSubmit, isUploading }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [fileError, setFileError] = useState('');
    const [requirements, setRequirements] = useState('');
    const [copied, setCopied] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFileError('');

        console.log('[PaymentScreen] File input changed');

        if (selectedFile) {
            console.log('[PaymentScreen] Selected file:', {
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size,
                sizeKB: (selectedFile.size / 1024).toFixed(2) + ' KB'
            });

            // Check file size max 2MB
            if (selectedFile.size > 2 * 1024 * 1024) {
                console.warn('[PaymentScreen] File too large:', selectedFile.size);
                setFileError('File size must be less than 2MB');
                return;
            }
            
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(selectedFile.type)) {
                console.warn('[PaymentScreen] Invalid file type:', selectedFile.type);
                setFileError('Only Images (JPG, PNG) and PDF files are allowed');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('[PaymentScreen] FileReader completed, result length:', reader.result?.length);
                setFile(selectedFile);
                setPreview(reader.result); // base64 string
            };
            reader.onerror = (err) => {
                console.error('[PaymentScreen] FileReader error:', err);
                setFileError('Error reading the file. Please try again.');
            };
            reader.readAsDataURL(selectedFile);
        } else {
            console.log('[PaymentScreen] No file selected');
        }
    };

    const handleUploadClick = () => {
        document.getElementById('payment-upload').click();
    };

    const handleCopyUpi = () => {
        navigator.clipboard.writeText('9840286639@upi');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = () => {
        console.log('[PaymentScreen] Submit clicked, file:', file?.name, 'preview length:', preview?.length);

        if (!file) {
            console.warn('[PaymentScreen] No file to submit');
            setFileError('Please upload the payment screenshot to proceed.');
            return;
        }

        // We prepare the base64 data to pass up to App.jsx
        // reader.result has the format "data:image/jpeg;base64,... data"
        const base64Data = preview.split(',')[1];
        
        console.log('[PaymentScreen] Base64 data extracted, length:', base64Data?.length);

        const paymentData = {
            paymentFile: {
                name: file.name,
                mimeType: file.type,
                data: base64Data
            },
            requirements: requirements
        };

        console.log('[PaymentScreen] Calling onSubmit with paymentData:', {
            paymentFileName: paymentData.paymentFile.name,
            hasRequirements: !!paymentData.requirements
        });

        onSubmit(paymentData);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Payment Details</h3>
            
            <div className="bg-white border p-6 rounded-lg space-y-4 shadow-sm">
                <div>
                    <h4 className="font-semibold text-slate-700 block mb-1">Hard Requirements or concerns</h4>
                    <p className="text-sm text-slate-500 mb-3">Please share any specific requirements or concerns you may have (Optional).</p>
                    <textarea
                        className="w-full form-input resize-none"
                        rows="3"
                        placeholder="Enter your concerns here..."
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                    ></textarea>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg space-y-4">
                <h4 className="font-semibold text-slate-700">Advance Registration fees</h4>
                <div className="space-y-2 text-slate-600">
                    <p className="flex justify-between max-w-xs"><span>Adult:</span> <span className="font-semibold">₹1000</span></p>
                    <p className="flex justify-between max-w-xs"><span>Student (5-18):</span> <span className="font-semibold">₹500</span></p>
                    <p className="flex justify-between max-w-xs"><span>Infant (&lt;5):</span> <span className="font-semibold">Free</span></p>
                </div>
            </div>

            <div className="flex justify-center my-6">
                <div className="p-4 bg-white shadow-sm border rounded-xl inline-block text-center">
                    <img src="assets/QR.jpeg" alt="Payment QR Code" className="w-48 h-48 mx-auto object-cover rounded-lg" />
                    <p className="text-sm text-slate-500 mt-2">Scan to Pay</p>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg space-y-4">
                <h4 className="font-semibold text-slate-700">Bank Account Details</h4>
                <div className="space-y-2 text-slate-600">
                    <p><strong>Account Number:</strong> 20038287650</p>
                    <p><strong>IFSC:</strong> SBIN0001055</p>
                    <p><strong>Account Holder:</strong> BHARAT POKALE</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <p className="text-slate-600"><strong>UPI Id:</strong> <span className="font-mono text-indigo-600 ml-2 text-lg">9840286639@upi</span></p>
                        <button 
                            onClick={handleCopyUpi} 
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 border border-transparent hover:border-indigo-100"
                            title="Copy UPI ID"
                        >
                            {copied ? (
                                <span className="text-green-600 text-sm font-medium flex items-center">
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Copied!
                                </span>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    <span className="text-sm font-medium">Copy</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-lg space-y-4 text-center">
                <h4 className="font-semibold text-slate-700 mb-2">Upload Payment Screenshot</h4>
                
                <input 
                    type="file" 
                    id="payment-upload" 
                    className="hidden" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                />
                
                <button
                    type="button"
                    onClick={handleUploadClick}
                    className="px-6 py-3 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-medium rounded-lg transition-colors inline-block shadow-sm"
                >
                    {file ? 'Change File' : 'Select File'}
                </button>

                {file && (
                    <div className="mt-4 text-sm text-slate-600">
                        Selected: <span className="font-medium">{file.name}</span>
                    </div>
                )}
                
                {fileError && (
                    <p className="text-red-500 text-sm mt-2">{fileError}</p>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t mt-8">
                <button
                    type="button"
                    onClick={onBack}
                    className="btn-secondary flex-1"
                    disabled={isUploading}
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-primary flex-1 flex justify-center items-center"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </>
                    ) : 'Submit Registration'}
                </button>
            </div>
        </div>
    );
};

export default PaymentScreen;
