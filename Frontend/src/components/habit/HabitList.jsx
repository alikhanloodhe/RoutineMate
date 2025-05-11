// components/habit/HabitList.jsx
import React from 'react';
import HabitCard from './HabitCard';

const HabitList = ({ 
  habits,
  onToggleComplete, 
  onViewDetails,
  onEditHabit,
  completionStatus
}) => {
  if (habits.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No habits to show</h3>
        <p className="text-gray-500">Start building your routine by adding your first habit</p>
      </div>
    );
  }
  
  // Handle toggle complete
  const handleToggleComplete = (habitId, completed) => {
    onToggleComplete(habitId, completed);
  };
  
  return (
    <div className="space-y-4">
      {habits.map(habit => {
        // Get the completion status for this habit
        const isCompleted = completionStatus[habit.id] || false;
        
        return (
          <div key={habit.id}>
            <HabitCard
              habit={habit}
              onToggleComplete={handleToggleComplete}
              onViewDetails={() => onViewDetails(habit.id)}
              onEditHabit={() => onEditHabit(habit.id)}
              completedToday={isCompleted}
            />
          </div>
        );
      })}
    </div>
  );
};

export default HabitList;