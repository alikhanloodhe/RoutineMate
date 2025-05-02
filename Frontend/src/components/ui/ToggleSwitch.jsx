import React from 'react';

const ToggleSwitch = ({
  checked = false,
  onChange,
  size = 'md',
  label = '',
  disabled = false,
}) => {
  const sizeClasses = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', thumbOn: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', thumbOn: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', thumbOn: 'translate-x-7' },
  };

  const { track, thumb, thumbOn } = sizeClasses[size] || sizeClasses.md;

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent parent click
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      className="inline-flex items-center space-x-2"
      onClick={handleClick}
    >
      <div className={`relative ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
        <div
          className={`
            ${track} 
            rounded-full 
            transition-colors duration-300 ease-in-out
            ${checked 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-sm' 
              : 'bg-gray-300'}
          `}
        >
          <div
            className={`
              ${thumb} 
              absolute top-0.5 left-0.5
              bg-white rounded-full shadow-sm
              transform transition-transform duration-300 ease-in-out
              ${checked ? thumbOn : ''}
            `}
          >
            {checked && (
              <span className="absolute inset-0 rounded-full animate-pulse-once bg-green-300 opacity-30"></span>
            )}
          </div>
        </div>
      </div>
      {label && <span className="text-sm text-gray-800">{label}</span>}
    </div>
  );
};

export default ToggleSwitch; 