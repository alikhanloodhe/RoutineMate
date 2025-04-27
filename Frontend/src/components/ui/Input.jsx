import React from 'react';

/**
 * Input component for form fields with dark mode support
 * 
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Function to call when input changes
 * @param {string} [props.placeholder=''] - Input placeholder
 * @param {boolean} [props.required=false] - Whether the input is required
 * @param {boolean} [props.fullWidth=false] - Whether the input should take full width
 * @param {string} [props.error=''] - Error message to display
 * @param {string} [props.className=''] - Additional CSS classes
 */
const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
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
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`px-4 py-2 border ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
        } rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-gray-100 ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input; 