import React from 'react';

const GoalTypeToggle = ({ activeType, onToggle }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm flex mb-6 overflow-hidden">
      <button
        onClick={() => onToggle('personal')}
        className={`flex-1 px-4 py-3 text-center font-medium transition-colors duration-200 ${
          activeType === 'personal'
            ? 'bg-[#4A2BAF] text-white'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Personal Goals
      </button>
      <button
        onClick={() => onToggle('group')}
        className={`flex-1 px-4 py-3 text-center font-medium transition-colors duration-200 ${
          activeType === 'group'
            ? 'bg-[#4A2BAF] text-white'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Group Goals
      </button>
    </div>
  );
};

export default GoalTypeToggle; 