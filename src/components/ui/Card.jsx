import React from 'react';

// WHY: Unified clean surface container card layout to wrap data modules uniformly.
export const Card = ({ children, title, subtitle, className = '', ...props }) => {
    return (
        <div
            className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-4 ${className}`}
            {...props}
        >
            {/* WHY: Render structural headers dynamically only if title parameters are specified */}
            {(title || subtitle) && (
                <div className="mb-5 border-b border-gray-100 pb-3">
                    {title && <h3 className="text-xl font-semibold text-gray-900 m-0">{title}</h3>}
                    {subtitle && <p className="text-sm text-gray-500 mt-1 m-0">{subtitle}</p>}
                </div>
            )}
            <div className="text-gray-700">{children}</div>
        </div>
    );
};