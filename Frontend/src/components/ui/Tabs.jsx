import React from 'react';
import Badge from './Badge';

/**
 * Modern Tabs component with support for icons and badges
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects with { id, label, icon, count } properties
 * @param {string} props.activeTab - ID of the active tab
 * @param {Function} props.onTabChange - Function called when a tab is clicked
 * @param {string} [props.variant='line'] - Tab variant (line, pill, none)
 * @param {string} [props.size='md'] - Tab size (sm, md, lg)
 * @param {boolean} [props.centered=false] - Whether tabs should be centered
 * @param {boolean} [props.fullWidth=false] - Whether tabs should take full width
 * @param {string} [props.className=''] - Additional CSS classes for the tab container
 */
const Tabs = ({ 
  tabs = [], 
  activeTab, 
  onTabChange,
  variant = 'line',
  size = 'md',
  centered = false,
  fullWidth = false,
  className = ''
}) => {
  // Base styles for tabs container
  const containerStyles = `flex ${centered ? 'justify-center' : 'justify-start'} ${fullWidth ? 'w-full' : ''} ${variant === 'pill' ? 'bg-gray-100 dark:bg-gray-800 p-1 rounded-lg' : ''} ${className}`;

  // Size variations
  const sizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Base styles for each tab
  const baseTabStyles = `flex items-center gap-2 font-medium transition-all duration-200 ${sizeStyles[size] || sizeStyles.md} ${fullWidth ? 'flex-1 justify-center text-center' : ''}`;

  // Specific variant styles
  const getTabStyles = (isActive) => {
    switch (variant) {
      case 'pill':
        return isActive
          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm rounded-md px-4 py-2'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-4 py-2';
      case 'none':
        return isActive
          ? 'text-blue-600 dark:text-blue-400 font-semibold px-4 py-2'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-4 py-2';
      case 'line':
      default:
        return isActive
          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 px-4 py-2'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-b-2 border-transparent px-4 py-2';
    }
  };

  return (
    <div className={containerStyles}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${baseTabStyles} ${getTabStyles(tab.id === activeTab)}`}
          onClick={() => onTabChange(tab.id)}
          aria-selected={tab.id === activeTab}
          role="tab"
        >
          {tab.icon && <span className="text-current">{typeof tab.icon === 'function' ? tab.icon() : tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <Badge 
              color={tab.id === activeTab ? 'primary' : 'secondary'} 
              size="sm"
            >
              {tab.count}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs; 