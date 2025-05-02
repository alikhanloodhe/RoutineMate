// components/habit/HabitDashboard.jsx
import React from 'react';
import DashboardStats from './DashboardStats';
import HabitList from './HabitList';
import AddHabitButton from './AddHabitButton';

const HabitDashboard = ({ 
  habits,
  onAddHabit, 
  onToggleComplete, 
  onViewDetails,
  onEditHabit,
  totalHabits,
  activeStreaks,
  successRate,
  completionStatus,
  streaks
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="text-left w-full sm:w-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Your Habits</h1>
          <p className="text-gray-600">Track and maintain your daily routines</p>
        </div>
        <div>
          <AddHabitButton onClick={onAddHabit} />
        </div>
      </div>
      
      <DashboardStats 
        totalHabits={totalHabits}
        activeStreaks={activeStreaks}
        successRate={successRate}
      />
      
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">All Habits</h2>
          {habits.length > 0 && (
            <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {habits.length} habit{habits.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <HabitList 
          habits={habits}
          onToggleComplete={onToggleComplete}
          onViewDetails={onViewDetails}
          onEditHabit={onEditHabit}
          completionStatus={completionStatus}
          streaks={streaks}
        />
      </div>
    </div>
  );
};

export default HabitDashboard;