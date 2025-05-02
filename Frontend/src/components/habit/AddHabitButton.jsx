// components/habit/AddHabitButton.jsx
import React from 'react';
import Button from '../ui/Button';

const AddHabitButton = ({ onClick }) => {
  return (
    <Button 
      onClick={onClick} 
      variant="primary" 
      size="md"
      className="flex items-center shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 mr-2" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      Add New Habit
    </Button>
  );
};

export default AddHabitButton;