// components/habit/HabitDashboard.jsx
import React from 'react';
import HabitList from './HabitList';
import { motion } from 'framer-motion';

const HabitDashboard = ({ 
  habits,
  onAddHabit, 
  onToggleComplete, 
  onViewDetails,
  onEditHabit,
  totalHabits,
  successRate,
  completionStatus
}) => {
  // Debug wrapper for toggle complete
  const handleToggleComplete = (habitId, completed) => {
    onToggleComplete(habitId, completed);
  };

  return (
    <div>
      {/* Header with Add Button and Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1C1C1C]">Your Habits</h1>
            <p className="text-gray-600 mt-1">Manage your daily routines efficiently</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              {totalHabits} habit{totalHabits !== 1 ? 's' : ''}
            </div>
            <button 
              onClick={onAddHabit} 
              className="px-4 py-2 bg-[#4A2BAF] text-white rounded-lg hover:bg-[#3D2291] transition-colors flex items-center space-x-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New Habit</span>
            </button>
          </div>
        </div>
        
        {/* Progress Overview
        {habits.length > 0 && (
          <div className="w-full">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Success Rate</span>
              <span className="text-sm font-medium text-gray-700">
                {successRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] h-2 rounded-full" 
                style={{ width: `${successRate}%` }}
              ></div>
            </div>
          </div>
        )} */}
      </motion.div>
      
      {/* Habits List */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1C1C1C]">All Habits</h2>
        </div>
        
        <HabitList 
          habits={habits}
          onToggleComplete={handleToggleComplete}
          onViewDetails={onViewDetails}
          onEditHabit={onEditHabit}
          completionStatus={completionStatus}
        />
      </div>
    </div>
  );
};

export default HabitDashboard;