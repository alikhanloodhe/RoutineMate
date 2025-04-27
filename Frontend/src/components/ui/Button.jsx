import React from 'react';

/**
 * Modern Button component with various variants, sizes, and animation effects
 * 
 * @param {Object} props
 * @param {string} [props.variant='primary'] - Button variant (primary, secondary, outline, text, success, warning, danger)
 * @param {string} [props.size='md'] - Button size (xs, sm, md, lg, xl)
 * @param {boolean} [props.fullWidth=false] - Whether button should take full width
 * @param {boolean} [props.loading=false] - Show loading spinner
 * @param {boolean} [props.disabled=false] - Disable button
 * @param {string} [props.type='button'] - Button type attribute
 * @param {React.ReactNode} [props.icon] - Icon component to show on the left
 * @param {React.ReactNode} [props.rightIcon] - Icon component to show on the right
 * @param {boolean} [props.iconOnly=false] - Only show icon (no text)
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ButtonHTMLAttributes} props.rest - Other button attributes
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  icon: Icon = null,
  rightIcon: RightIcon = null,
  iconOnly = false,
  children, 
  className = '',
  ...rest 
}) => {
  // Base styling for all buttons
  const baseStyles = 'font-medium rounded-lg focus-ring inline-flex items-center justify-center transition-all duration-200 ease-in-out';
  
  // Size variations
  const sizeStyles = {
    xs: iconOnly ? 'p-1.5 text-xs' : 'px-2.5 py-1 text-xs',
    sm: iconOnly ? 'p-2 text-sm' : 'px-3 py-1.5 text-sm',
    md: iconOnly ? 'p-2.5 text-base' : 'px-4 py-2 text-base',
    lg: iconOnly ? 'p-3 text-lg' : 'px-5 py-2.5 text-lg',
    xl: iconOnly ? 'p-3.5 text-xl' : 'px-6 py-3 text-xl',
  };
  
  // Variant styles with dark mode support
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm',
    secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500 dark:text-gray-100',
    outline: 'border border-blue-500 text-blue-600 hover:bg-blue-50 active:bg-blue-100 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-800 dark:active:bg-gray-700',
    text: 'text-blue-600 hover:bg-blue-50 active:bg-blue-100 hover:shadow-none dark:text-blue-400 dark:hover:bg-gray-800 dark:active:bg-gray-700',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm',
    warning: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm',
    light: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 border border-gray-200 shadow-sm dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:text-gray-100 dark:border-gray-700',
  };
  
  // Disabled and loading styles
  const disabledStyles = 'opacity-70 cursor-not-allowed';
  
  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';
  
  // Icon spacing
  const leftIconClasses = Icon && !iconOnly ? 'mr-2' : '';
  const rightIconClasses = RightIcon && !iconOnly ? 'ml-2' : '';
  
  // Combine all styles
  const buttonClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${disabled || loading ? disabledStyles : ''} ${className}`;
  
  return (
    <button 
      type={type}
      disabled={disabled || loading} 
      className={buttonClasses}
      {...rest}
    >
      {loading && (
        <svg 
          className={`animate-spin h-4 w-4 ${children && !iconOnly ? 'mr-2' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {Icon && <span className={leftIconClasses}>{typeof Icon === 'function' ? <Icon size={iconOnly ? 20 : 16} /> : Icon}</span>}
      {!iconOnly && <span>{children}</span>}
      {RightIcon && <span className={rightIconClasses}>{typeof RightIcon === 'function' ? <RightIcon size={iconOnly ? 20 : 16} /> : RightIcon}</span>}
    </button>
  );
};

export default Button; 