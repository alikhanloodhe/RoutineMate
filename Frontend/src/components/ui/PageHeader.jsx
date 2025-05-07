import React from 'react';

/**
 * PageHeader - A standardized header component for all pages
 * 
 * @param {Object} props
 * @param {string} props.title - The main title of the page
 * @param {string} props.subtitle - Optional subtitle or description
 * @param {React.ReactNode} props.rightContent - Optional content to display on the right side
 * @returns {React.ReactElement}
 */
const PageHeader = ({ title, subtitle, rightContent }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[#1C1C1C] mb-2">{title}</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
        {rightContent && (
          <div className="mt-2 sm:mt-0">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader; 