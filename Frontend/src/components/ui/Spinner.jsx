import React from 'react';

/**
 * Modern Spinner component for loading states
 * 
 * @param {Object} props
 * @param {string} [props.size='md'] - Spinner size (xs, sm, md, lg, xl)
 * @param {string} [props.color='primary'] - Spinner color (primary, secondary, white)
 * @param {boolean} [props.centered=false] - Whether spinner should be centered in its container
 * @param {string} [props.label] - Optional text to display under the spinner
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.HTMLAttributes} props.rest - Other div attributes
 */
const Spinner = ({ 
  size = 'md', 
  color = 'primary',
  centered = false,
  label,
  className = '',
  ...rest 
}) => {
  // Size variations
  const sizeStyles = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-10 w-10 border-3',
    xl: 'h-12 w-12 border-3'
  };
  
  // Color variations
  const colorStyles = {
    primary: 'border-blue-600 border-b-transparent dark:border-blue-500 dark:border-b-transparent',
    secondary: 'border-gray-600 border-b-transparent dark:border-gray-400 dark:border-b-transparent',
    white: 'border-white border-b-transparent',
  };
  
  // Center styles
  const centerStyles = centered ? 'mx-auto' : '';
  
  // Combine all styles
  const spinnerStyles = `inline-block rounded-full animate-spin ${sizeStyles[size] || sizeStyles.md} ${colorStyles[color] || colorStyles.primary} ${centerStyles} ${className}`;
  
  // If there's a label, wrap the spinner in a container
  if (label) {
    return (
      <div className={`flex flex-col items-center ${centered ? 'mx-auto' : ''}`} {...rest}>
        <div className={spinnerStyles} />
        <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
    );
  }
  
  // Otherwise, just return the spinner
  return <div className={spinnerStyles} {...rest} />;
};

export default Spinner; 