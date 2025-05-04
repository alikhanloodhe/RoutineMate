// components/habit/AddHabitButton.jsx
import React from 'react';

const AddHabitButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className="px-4 py-2 bg-[#4A2BAF] text-white rounded-lg hover:bg-[#3D2291] transition-colors flex items-center space-x-1"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span>Add New Habit</span>
    </button>
  );
};

export default AddHabitButton;