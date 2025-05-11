// components/habit/HabitCard.jsx
import React, { useState, useEffect } from 'react';

const HabitCard = ({ habit, onToggleComplete, onViewDetails, onEditHabit, completedToday }) => {
  // Local state to track completion status for immediate UI feedback
  const [isCompleted, setIsCompleted] = useState(completedToday);
  
  // Update local state when prop changes (coming from the backend)
  useEffect(() => {
    setIsCompleted(completedToday);
  }, [completedToday]);
  
  // Handler for checkbox click with better state management
  const handleToggleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Toggle the completion status locally first for immediate feedback
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    
    // Call the parent handler to update the backend
    onToggleComplete(habit.id, newCompletedState);
  };
  
  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div
      className={`${isCompleted 
        ? 'bg-green-50 border-green-300 border' 
        : 'bg-white border border-gray-200'
      } rounded-lg p-5 hover:shadow-md transition-all duration-200 relative overflow-hidden cursor-pointer`}
      onClick={(e) => onViewDetails()}
    >
      {/* Status indicator bar */}
      {isCompleted && (
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleToggleClick(e);
            }}
            className={`${isCompleted ? 'bg-green-100 p-1 rounded-full' : ''}`}
          >
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => {
                // The actual change is handled by the div onClick above
                e.stopPropagation();
              }}
              className={`mt-1.5 h-4 w-4 rounded ${isCompleted ? 'border-green-500 text-green-600 focus:ring-green-500' : 'border-gray-300 text-[#4A2BAF] focus:ring-[#4A2BAF]'}`}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`font-medium ${isCompleted ? 'text-green-700 line-through decoration-2 decoration-green-500' : 'text-[#1C1C1C]'}`}>
                {habit.title}
              </h3>
              <div className="flex items-center space-x-2">
                {isCompleted && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                    Completed
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditHabit();
                  }}
                  className="text-[#4A2BAF] hover:text-opacity-70"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
            <p className={`text-sm ${isCompleted ? 'text-green-600' : 'text-gray-600'} mt-1`}>{habit.description || 'No description'}</p>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
              <div className="flex items-center text-sm text-gray-500">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  habit.frequency === 'daily' ? 'bg-blue-500' : 'bg-purple-500'
                }`}></span>
                <span>
                  {habit.frequency === 'daily' ? 'Daily' : 'Weekly'}
                </span>
              </div>
              
              {habit.category_name && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {habit.category_name}
                </div>
              )}
              
              {habit.reminder_time && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Reminder: {new Date(`2000-01-01T${habit.reminder_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
            
            {isCompleted && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleClick(e);
                }}
                className="mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Mark as Incomplete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;