import React from 'react';

/**
 * Badge component for displaying status, tags, and other indicators
 * 
 * @param {Object} props
 * @param {string} [props.color='primary'] - Badge color (primary, secondary, success, warning, danger)
 * @param {string} [props.size='md'] - Badge size (sm, md, lg)
 * @param {boolean} [props.rounded=true] - Whether badge should have fully rounded corners
 * @param {boolean} [props.bordered=false] - Whether badge should have a border
 * @param {React.ReactNode} [props.icon] - Icon component to show on the left
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ReactNode} props.children - Badge content
 * @param {React.HTMLAttributes} props.rest - Other span attributes
 */
const Badge = ({ 
  color = 'primary', 
  size = 'md', 
  rounded = true,
  bordered = false,
  icon = null,
  className = '', 
  children,
  ...rest 
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center font-medium';
  
  // Color variations with dark mode support
  const colorStyles = {
    primary: `bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400 ${bordered ? 'border border-blue-400/30 dark:border-blue-700' : ''}`,
    secondary: `bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400 ${bordered ? 'border border-gray-300 dark:border-gray-600' : ''}`,
    success: `bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400 ${bordered ? 'border border-green-400/30 dark:border-green-700' : ''}`,
    warning: `bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400 ${bordered ? 'border border-yellow-400/30 dark:border-yellow-700' : ''}`,
    danger: `bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400 ${bordered ? 'border border-red-400/30 dark:border-red-700' : ''}`,
    // Aliases
    blue: `bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400 ${bordered ? 'border border-blue-400/30 dark:border-blue-700' : ''}`,
    gray: `bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400 ${bordered ? 'border border-gray-300 dark:border-gray-600' : ''}`,
    green: `bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400 ${bordered ? 'border border-green-400/30 dark:border-green-700' : ''}`,
    yellow: `bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400 ${bordered ? 'border border-yellow-400/30 dark:border-yellow-700' : ''}`,
    red: `bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400 ${bordered ? 'border border-red-400/30 dark:border-red-700' : ''}`,
    indigo: `bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-400 ${bordered ? 'border border-indigo-400/30 dark:border-indigo-700' : ''}`,
  };
  
  // Size variations
  const sizeStyles = {
    sm: icon ? 'px-2 py-0.5 text-xs' : 'px-2 py-0.5 text-xs',
    md: icon ? 'px-2.5 py-0.5 text-sm' : 'px-2.5 py-0.5 text-sm',
    lg: icon ? 'px-3 py-1 text-sm' : 'px-3 py-1 text-sm',
  };
  
  // Rounded styles
  const roundedStyles = rounded ? 'rounded-full' : 'rounded';
  
  // Combine all styles
  const badgeClasses = `${baseStyles} ${colorStyles[color] || colorStyles.primary} ${sizeStyles[size]} ${roundedStyles} ${className}`;
  
  return (
    <span className={badgeClasses} {...rest}>
      {icon && (
        <span className="mr-1 -ml-0.5">{icon}</span>
      )}
      {children}
    </span>
  );
};

export default Badge; 