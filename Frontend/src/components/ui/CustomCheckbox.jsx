import React from 'react';

const CustomCheckbox = ({
  checked = false,
  onChange,
  size = 'md',
  id = '', 
  disabled = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const boxSize = sizeClasses[size] || sizeClasses['md'];
  
  // Handle change with synthetic event
  const handleChange = (e) => {
    e.stopPropagation();
    if (onChange && !disabled) {
      onChange(e);
    }
  };

  return (
    <div className="inline-flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only" // Hide actual checkbox but keep functionality
        key={`${id}-${checked}`} // Force re-render when checked status changes
      />
      <label 
        htmlFor={id}
        className={`
          ${boxSize} 
          flex items-center justify-center 
          rounded-full 
          transition-all duration-200 ease-in-out
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${checked 
            ? 'bg-green-500 text-white shadow-md' 
            : 'bg-white border-2 border-gray-300 hover:border-blue-400 hover:shadow-sm'}
        `}
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
      >
        {checked && (
          <svg
            className="w-3/4 h-3/4 text-white"
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
        )}
      </label>
    </div>
  );
};

export default CustomCheckbox; 