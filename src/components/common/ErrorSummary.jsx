import React from 'react';
import { ErrorIcon } from './Icons';

const ErrorSummary = ({ errors, fieldLabels }) => {
    const errorList = Object.entries(errors).filter(([_, value]) => value);

    if (errorList.length === 0) return null;

    const scrollToField = (fieldName) => {
        const element = document.querySelector(`[data-field="${fieldName}"]`) ||
            document.querySelector(`[name="${fieldName}"]`) ||
            document.getElementById(`field-${fieldName}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus?.();
        }
    };

    return (
        <div className="error-summary">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <ErrorIcon className="w-5 h-5 text-red-600" />
                </div>
                <h4 className="font-semibold text-red-800">
                    Please fix {errorList.length} {errorList.length === 1 ? 'error' : 'errors'} below
                </h4>
            </div>
            <ul className="ml-10 space-y-1">
                {errorList.map(([field, message]) => (
                    <li key={field}>
                        <button
                            type="button"
                            className="error-summary-item"
                            onClick={() => scrollToField(field)}
                        >
                            <span className="text-red-400 mr-2">•</span>
                            <span className="font-medium mr-1">{fieldLabels[field] || field}:</span>
                            {message}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ErrorSummary;
