// components/ui/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  type = 'button',
  disabled = false
}) => {
  // Define variant styles
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50'
  };

  // Define size styles
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded font-medium transition-colors duration-200
        flex items-center justify-center
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
};

export default Button;