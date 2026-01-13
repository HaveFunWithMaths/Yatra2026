import React from 'react';
import { ErrorIcon } from './Icons';

const InputField = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    required = false,
    icon: Icon,
    min,
    max,
    className = ''
}) => {
    return (
        <div className={className}>
            {label && (
                <label className="form-label">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <input
                    type={type}
                    className={`form-input ${Icon ? 'pl-10' : ''} ${error ? 'border-red-400 focus:ring-red-500' : ''}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    min={min}
                    max={max}
                />
            </div>
            {error && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                    <ErrorIcon className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
};

export default InputField;
