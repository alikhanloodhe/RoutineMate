// components/habit/HabitList.jsx
import React, { useEffect } from 'react';
import HabitCard from './HabitCard';

const HabitList = ({ 
  habits,
  onToggleComplete, 
  onViewDetails,
  onEditHabit,
  completionStatus, 
  streaks 
}) => {
  // Add debug logging for completionStatus
  useEffect(() => {
    console.log('HabitList received completionStatus:', completionStatus);
    // Log individual habit completion status
    habits.forEach(habit => {
      console.log(`Habit ${habit.id} (${habit.title}) completion status:`, completionStatus[habit.id]);
    });
  }, [habits, completionStatus]);

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl shadow-sm">
        <div className="flex justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No habits to show</h3>
        <p className="text-gray-500 mb-1">Start building your routine by adding your first habit</p>
        <p className="text-gray-500">Click the "Add New Habit" button to get started!</p>
      </div>
    );
  }
  
  // Handle toggle complete properly
  const handleToggleComplete = (habitId, completed) => {
    console.log(`HabitList: toggling habit ${habitId} to ${completed}`);
    // Make sure this doesn't also trigger view details
    onToggleComplete(habitId, completed);
  };
  
  return (
    <div className="space-y-4">
      {habits.map(habit => {
        // Get the completion status for this habit
        const isCompleted = completionStatus[habit.id] || false;
        console.log(`Rendering habit ${habit.id} (${habit.title}) with completion ${isCompleted}`);
        
        return (
          <div key={habit.id}>
            <HabitCard
              habit={habit}
              onToggleComplete={handleToggleComplete}
              onViewDetails={() => onViewDetails(habit.id)}
              onEditHabit={() => onEditHabit(habit.id)}
              currentStreak={streaks[habit.id] || 0}
              completedToday={isCompleted}
            />
          </div>
        );
      })}
    </div>
  );
};

export default HabitList;