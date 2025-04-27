import React from 'react';

/**
 * Select component for dropdown form fields with dark mode support
 * 
 * @param {Object} props
 * @param {string} props.label - Select label
 * @param {string} props.value - Select value
 * @param {Function} props.onChange - Function to call when value changes
 * @param {Array} props.options - Array of option objects with value and label
 * @param {string} [props.placeholder=''] - Select placeholder
 * @param {boolean} [props.required=false] - Whether the select is required
 * @param {boolean} [props.fullWidth=false] - Whether the select should take full width
 * @param {string} [props.error=''] - Error message to display
 * @param {string} [props.className=''] - Additional CSS classes
 */
const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = '',
  required = false,
  fullWidth = false,
  error = '',
  className = '',
  ...rest 
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`px-4 py-2 border ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
        } rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-gray-100 ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        required={required}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select; 