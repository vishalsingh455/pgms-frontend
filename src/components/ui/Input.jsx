import React from 'react';

// WHY: Encapsulates form tracking blocks, red semantic layout errors, and focus states.
export const Input = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    name,
    error,
    required = false,
    ...props
}) => {
    return (
        <div className="mb-4 flex flex-col w-full">
            {label && (
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-600">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className={`w-full px-3 py-2.5 border rounded-md text-sm outline-none bg-white transition-colors duration-150 focus:ring-2 focus:ring-offset-1 
          ${error
                        ? 'border-red-600 focus:border-red-600 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                {...props}
            />
            {/* WHY: Render visual warning messages immediately below the box layer boundary line if error caught */}
            {error && <span className="text-red-600 text-xs mt-1 font-medium">{error}</span>}
        </div>
    );
};