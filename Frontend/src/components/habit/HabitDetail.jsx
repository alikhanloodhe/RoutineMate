/* eslint-disable no-unused-vars */
// components/habit/HabitDetail.jsx
import React from 'react';
import CalendarView from './CalendarView';
import StreakStats from './StreakStats';
import EditDeleteControls from './EditDeleteControls';
import { motion } from 'framer-motion';

const HabitDetail = ({ 
  habit, 
  trackingData = [],
  streakData,
  completionData,
  onEdit, 
  onDelete, 
  onBack
}) => {
  if (!habit) return null;
  
  // Format the frequency display
  const frequencyDisplay = {
    'daily': 'Daily',
    'weekly': 'Weekly',
    'custom': habit.customDays ? `Custom (${habit.customDays.join(', ')})` : 'Custom'
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-[#4A2BAF] mb-6 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Habits
        </button>
      
        {/* Habit Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-[#4A2BAF]/10 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4A2BAF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1C1C1C]">{habit.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                    {frequencyDisplay[habit.frequency]}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Started: {formatDate(habit.start_date)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={onEdit} 
                className="px-4 py-2 text-[#4A2BAF] border border-[#4A2BAF] rounded-lg hover:bg-[#4A2BAF]/5 transition-colors duration-200"
              >
                Edit Habit
              </button>
              <button 
                onClick={onDelete} 
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                Delete Habit
              </button>
            </div>
          </div>
          
          {habit.description && (
            <p className="text-gray-600 mb-6">{habit.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4A2BAF] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="text-sm text-gray-500">Start Date</div>
                <div className="font-medium">{formatDate(habit.start_date)}</div>
              </div>
            </div>
            
            {habit.reminder_time && (
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4A2BAF] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">Reminder</div>
                  <div className="font-medium">
                    {new Date(`2000-01-01T${habit.reminder_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4A2BAF] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <div className="text-sm text-gray-500">Streak</div>
                <div className="font-medium">{streakData.current} days (Best: {streakData.best})</div>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4A2BAF] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <div className="text-sm text-gray-500">Goal Type</div>
                <div className="font-medium">
                  {habit.goal_type === 'lifelong' ? 'Lifelong Habit' : `${habit.total_target_days} Days`}
                </div>
              </div>
            </div>
          </div>
          
          {habit.why_reason && (
            <div className="mt-6 bg-[#4A2BAF]/5 p-5 rounded-lg border-l-4 border-[#4A2BAF]">
              <h4 className="font-medium text-[#1C1C1C] mb-2">Why This Habit Matters</h4>
              <p className="text-gray-700">{habit.why_reason}</p>
            </div>
          )}
        </div>
      </motion.div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1C1C1C] mb-6">Progress Calendar</h2>
        <CalendarView habit={habit} trackingData={trackingData} />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1C1C1C] mb-6">Stats Overview</h2>
        <StreakStats 
          currentStreak={streakData.current}
          bestStreak={streakData.best}
          totalCompletions={completionData.completions}
          totalDays={completionData.totalDays}
        />
      </div>
    </div>
  );
};

export default HabitDetail;