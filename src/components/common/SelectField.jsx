import React, { useState, useEffect } from 'react';
import { ErrorIcon } from './Icons';

const SelectField = ({
    label,
    value,
    onChange,
    onBlur,
    error,
    required = false,
    options = [],
    placeholder = 'Select an option',
    name,
    className = ''
}) => {
    const [shouldShake, setShouldShake] = useState(false);

    // Trigger shake animation when error appears
    useEffect(() => {
        if (error) {
            setShouldShake(true);
            const timer = setTimeout(() => setShouldShake(false), 500);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className={className} data-field={name || label?.toLowerCase().replace(/\s+/g, '-')}>
            {label && (
                <label className="form-label">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <select
                name={name}
                className={`form-select ${error ? 'border-red-400 focus:ring-red-500' : ''} ${shouldShake ? 'animate-shake' : ''}`}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                    <ErrorIcon className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
};

export default SelectField;
