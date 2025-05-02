// components/habit/HabitDetail.jsx
import React from 'react';
import CalendarView from './CalendarView';
import StreakStats from './StreakStats';
import EditDeleteControls from './EditDeleteControls';
import Button from '../ui/Button';

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
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" size="sm" onClick={onBack} className="hover:bg-gray-50 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Habits
        </Button>
      </div>
      
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
        <h2 className="text-3xl font-bold mb-3 text-gray-800">{habit.title}</h2>
        {habit.description && (
          <p className="text-gray-600 mb-6 text-lg">{habit.description}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="flex flex-col bg-white/80 p-4 rounded-lg shadow-sm">
            <span className="text-gray-500 text-sm font-medium">Frequency</span>
            <span className="font-semibold text-gray-800 text-lg">{frequencyDisplay[habit.frequency]}</span>
          </div>
          
          <div className="flex flex-col bg-white/80 p-4 rounded-lg shadow-sm">
            <span className="text-gray-500 text-sm font-medium">Start Date</span>
            <span className="font-semibold text-gray-800 text-lg">{formatDate(habit.start_date)}</span>
          </div>
          
          {habit.reminder_time && (
            <div className="flex flex-col bg-white/80 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm font-medium">Reminder Time</span>
              <span className="font-semibold text-gray-800 text-lg">
                {new Date(`2000-01-01T${habit.reminder_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          
          <div className="flex flex-col bg-white/80 p-4 rounded-lg shadow-sm">
            <span className="text-gray-500 text-sm font-medium">Goal Type</span>
            <span className="font-semibold text-gray-800 text-lg">
              {habit.goal_type === 'lifelong' ? 'Lifelong Habit' : `${habit.total_target_days} Days`}
            </span>
          </div>
        </div>
        
        {habit.why_reason && (
          <div className="mt-6 bg-gradient-to-r from-blue-100 to-blue-50 p-5 rounded-lg shadow-sm">
            <h4 className="font-medium text-blue-800 mb-2 text-lg">Why This Habit Matters</h4>
            <p className="text-blue-700">{habit.why_reason}</p>
          </div>
        )}
      </div>
      
      <CalendarView habit={habit} trackingData={trackingData} />
      
      <StreakStats 
        currentStreak={streakData.current}
        bestStreak={streakData.best}
        totalCompletions={completionData.completions}
        totalDays={completionData.totalDays}
      />
      
      <EditDeleteControls onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

export default HabitDetail;