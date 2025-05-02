// components/ui/ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ progress, color = 'blue', height = 'h-2' }) => {
  // Map of color names to tailwind classes
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-600',
    indigo: 'bg-indigo-600',
    orange: 'bg-orange-500'
  };

  // Default to blue if color is not in our map
  const barColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
      <div 
        className={`${barColor} rounded-full ${height} transition-all duration-300`} 
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  );
};

export default ProgressBar;