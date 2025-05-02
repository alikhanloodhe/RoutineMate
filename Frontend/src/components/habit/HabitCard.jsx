// components/habit/HabitCard.jsx
import React, { useState, useEffect } from 'react';
import CustomCheckbox from '../ui/CustomCheckbox';

const HabitCard = ({ habit, onToggleComplete, onViewDetails, onEditHabit, currentStreak, completedToday }) => {
  // Local state to track completion status for immediate UI feedback
  const [isCompleted, setIsCompleted] = useState(completedToday);
  
  // Update local state when prop changes (coming from the backend)
  useEffect(() => {
    setIsCompleted(completedToday);
  }, [completedToday]);
  
  // Handler for checkbox click with better state management
  const handleToggleClick = (e) => {
    e.stopPropagation();
    
    // Toggle the completion status locally first for immediate feedback
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    
    // Call the parent handler to update the backend
    onToggleComplete(habit.id, newCompletedState);
  };
  
  return (
    <div 
      className={`
        p-4 flex items-center justify-between 
        transition-all duration-300
        ${isCompleted 
          ? 'bg-green-50 border-l-4 border-green-500' 
          : 'hover:bg-gray-50 border-l-4 border-transparent'}
      `}
    >
      <div className="flex items-center flex-1">
        <div className="mr-4">
          <CustomCheckbox 
            id={`habit-${habit.id}`}
            checked={isCompleted} 
            onChange={handleToggleClick} 
            size="lg" 
          />
        </div>
        
        <div className="flex-1" onClick={onViewDetails}>
          <h3 className={`
            font-medium text-lg 
            transition-all duration-300
            ${isCompleted 
              ? 'text-green-800 line-through decoration-2 decoration-green-600' 
              : 'text-gray-800'}
          `}>
            {habit.title}
          </h3>
          
          <div className={`
            flex flex-wrap items-center mt-1 text-sm text-gray-600
            ${isCompleted ? 'opacity-70' : 'opacity-100'}
          `}>
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              habit.frequency === 'daily' ? 'bg-blue-500' : 
              habit.frequency === 'weekly' ? 'bg-purple-500' : 'bg-orange-500'
            }`}></span>
            <span className="mr-4">
              {habit.frequency === 'daily' ? 'Daily' : 
              habit.frequency === 'weekly' ? 'Weekly' : 'Custom'}
            </span>
            
            {currentStreak > 0 && (
              <span className="flex items-center text-orange-700 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                {currentStreak} day{currentStreak !== 1 ? 's' : ''}
              </span>
            )}
            
            {habit.reminder_time && (
              <span className="text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {new Date(`2000-01-01T${habit.reminder_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditHabit();
          }}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          aria-label="Edit habit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="ml-2 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          aria-label="View habit details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HabitCard;