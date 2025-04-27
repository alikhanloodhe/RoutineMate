import React from 'react';

/**
 * Modern Card component with various styling options
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} [props.header] - Card header content
 * @param {React.ReactNode} [props.footer] - Card footer content
 * @param {boolean} [props.hoverable=false] - Whether card should have hover effects
 * @param {boolean} [props.bordered=true] - Whether card should have a border
 * @param {string} [props.shadow='none'] - Shadow size (none, sm, md, lg, card, soft)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.HTMLAttributes} props.rest - Other div attributes
 */
const Card = ({ 
  children, 
  header,
  footer,
  hoverable = false,
  bordered = true,
  shadow = 'none',
  className = '',
  ...rest 
}) => {
  // Base card styles
  const baseStyles = 'rounded-xl overflow-hidden bg-white dark:bg-gray-800 transition-all duration-200';
  
  // Border styles
  const borderStyles = bordered 
    ? 'border border-gray-200 dark:border-gray-700' 
    : '';
  
  // Shadow styles
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    card: 'shadow-md',
    soft: 'shadow-lg',
  };
  
  // Hover effects
  const hoverStyles = hoverable 
    ? 'hover:shadow-lg transform-gpu transition-all duration-300 hover:-translate-y-1' 
    : '';
  
  // Combine all styles
  const cardClasses = `${baseStyles} ${borderStyles} ${shadowStyles[shadow]} ${hoverStyles} ${className}`;

  return (
    <div className={cardClasses} {...rest}>
      {header && (
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          {header}
        </div>
      )}
      
      <div className="p-5">
        {children}
      </div>
      
      {footer && (
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * Card Header component for consistent styling
 */
Card.Header = ({ children, className = '' }) => (
  <div className={`text-lg font-semibold text-gray-800 dark:text-gray-200 ${className}`}>
    {children}
  </div>
);

/**
 * Card Title component for consistent styling
 */
Card.Title = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 ${className}`}>
    {children}
  </h3>
);

/**
 * Card Text component for consistent text styling
 */
Card.Text = ({ children, className = '' }) => (
  <p className={`text-gray-600 dark:text-gray-400 ${className}`}>
    {children}
  </p>
);

export default Card; 