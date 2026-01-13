import React from 'react';

const SelectField = ({
    label,
    value,
    onChange,
    onBlur,
    error,
    required = false,
    options = [],
    placeholder = 'Select an option',
    className = ''
}) => {
    return (
        <div className={className}>
            {label && (
                <label className="form-label">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <select
                className={`form-select ${error ? 'border-red-400 focus:ring-red-500' : ''}`}
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
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default SelectField;
