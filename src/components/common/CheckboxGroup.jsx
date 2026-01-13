import React from 'react';
import { CheckIcon } from './Icons';

const CheckboxGroup = ({
    label,
    options = [],
    selectedValues = [],
    onChange,
    error,
    required = false,
    columns = 3,
    className = ''
}) => {
    const handleToggle = (option) => {
        const newValues = selectedValues.includes(option)
            ? selectedValues.filter(v => v !== option)
            : [...selectedValues, option];
        onChange(newValues);
    };

    return (
        <div className={className}>
            {label && (
                <label className="form-label mb-2 block">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className={`flex flex-wrap gap-3`}>
                {options.map((option) => {
                    const isSelected = selectedValues.includes(option);
                    return (
                        <label
                            key={option}
                            className={`flex-1 flex items-center justify-center space-x-3 cursor-pointer p-3 rounded-xl border transition-all duration-200 ${isSelected
                                ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                }`}
                        >
                            <div
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'
                                    }`}
                            >
                                {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isSelected}
                                onChange={() => handleToggle(option)}
                            />
                            <span className={isSelected ? 'text-indigo-900 font-medium' : 'text-slate-700'}>
                                {option}
                            </span>
                        </label>
                    );
                })}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default CheckboxGroup;
