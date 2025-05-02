import React from 'react';

const Checkbox = ({
  checked = false,
  onChange,
  size = 'md',
  label = '',
  disabled = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const boxSize = sizeClasses[size] || sizeClasses['md'];

  const baseClasses = `
    relative flex items-center justify-center rounded-full transition-all duration-300 ease-in-out
    ${boxSize}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${checked 
      ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-0 shadow-md' 
      : 'bg-white border-2 border-gray-300 hover:border-blue-400 hover:shadow-sm'}
  `;

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(); // Don't pass any arguments
    }
  };

  return (
    <div
      className="inline-flex items-center space-x-2"
      onClick={(e) => {
        e.stopPropagation(); // Prevent parent click
        handleClick();
      }}
    >
      <div className={baseClasses}>
        {checked && (
          <>
            <span className="absolute inset-0 rounded-full animate-pulse-once bg-green-300 opacity-30"></span>
            <svg
              className="w-3/4 h-3/4 text-white transform scale-90 transition-transform duration-200"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
              />
            </svg>
          </>
        )}
      </div>
      {label && <span className="text-sm text-gray-800">{label}</span>}
    </div>
  );
};

export default Checkbox;
