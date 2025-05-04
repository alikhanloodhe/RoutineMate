// components/habit/HabitForm.jsx
import React, { useState, useEffect } from 'react';
import FrequencySelector from './FrequencySelector';
import DatePicker from './DatePicker';
import ReminderTimePicker from './ReminderTimePicker';

const HabitForm = ({ habit, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    reminder_time: '',
    why_reason: '',
    start_date: new Date().toISOString().split('T')[0],
    goal_type: 'lifelong',
    total_target_days: '',
    // Fields to track UI state only (not sent to backend)
    customDays: []
  });

  // Initialize form with habit data if editing
  useEffect(() => {
    if (habit) {
      setFormData({
        ...habit,
        // Add UI-only fields that aren't in the backend data
        customDays: habit.customDays || [],
        // Ensure these fields exist even if they're null in the habit data
        description: habit.description || '',
        reminder_time: habit.reminder_time || '',
        why_reason: habit.why_reason || '',
        total_target_days: habit.total_target_days || ''
      });
    }
  }, [habit]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFrequencyChange = (frequency, customDays = []) => {
    setFormData(prev => ({ 
      ...prev, 
      frequency,
      customDays: frequency === 'custom' ? customDays : []
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for backend
    const submitData = {
      // Include the ID if editing an existing habit
      ...(habit?.id && { id: habit.id }),
      
      title: formData.title,
      description: formData.description,
      frequency: formData.frequency,
      reminder_time: formData.reminder_time,
      why_reason: formData.why_reason,
      start_date: formData.start_date,
      goal_type: formData.goal_type,
      
      // Only include total_target_days if goal_type is 'fixed'
      total_target_days: formData.goal_type === 'fixed' 
        ? parseInt(formData.total_target_days, 10) 
        : null
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-[#1C1C1C] mb-2">
          {habit ? 'Update Your Habit' : 'Create a New Habit'}
        </h3>
        <p className="text-gray-600">
          Build consistency by tracking habits that align with your goals
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#4A2BAF]/5 p-5 rounded-lg border-l-4 border-[#4A2BAF] mb-6">
          <div>
            <label htmlFor="title" className="block font-semibold text-gray-800 mb-2">Habit Title*</label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter Your Habit Title"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF] focus:border-[#4A2BAF] transition-colors"
            />
           
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="description" className="block font-semibold text-gray-800 mb-2">Description</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add details about what this habit entails"
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF] focus:border-[#4A2BAF] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="why-reason" className="block font-semibold text-gray-800 mb-2">Your Why</label>
            <textarea
              id="why-reason"
              value={formData.why_reason || ''}
              onChange={(e) => handleChange('why_reason', e.target.value)}
              placeholder="Why is this habit important to you? How will it benefit your life?"
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF] focus:border-[#4A2BAF] transition-colors"
            />
            <p className="text-sm text-gray-500 mt-1">Understanding your motivation makes habits more likely to stick</p>
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Habit Schedule</h4>
          
          <FrequencySelector 
            value={formData.frequency} 
            onChange={handleFrequencyChange} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <DatePicker
              id="start-date"
              label="Start Date"
              value={formData.start_date}
              onChange={(value) => handleChange('start_date', value)}
            />
            
            <ReminderTimePicker
              id="reminder-time"
              label="Reminder Time (optional)"
              value={formData.reminder_time}
              onChange={(value) => handleChange('reminder_time', value)}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Habit Goal</h4>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:border-[#4A2BAF] hover:bg-[#4A2BAF]/5" onClick={() => handleChange('goal_type', 'lifelong')}>
              <input
                type="radio"
                value="lifelong"
                checked={formData.goal_type === 'lifelong'}
                onChange={() => {}}
                className="mr-3 h-5 w-5 text-[#4A2BAF]"
              />
              <div>
                <div className="font-medium">Lifelong Habit</div>
                <div className="text-sm text-gray-500">For habits you want to maintain indefinitely</div>
              </div>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:border-[#4A2BAF] hover:bg-[#4A2BAF]/5" onClick={() => handleChange('goal_type', 'fixed')}>
              <input
                type="radio"
                value="fixed"
                checked={formData.goal_type === 'fixed'}
                onChange={() => {}}
                className="mr-3 h-5 w-5 text-[#4A2BAF]"
              />
              <div>
                <div className="font-medium">Fixed Duration</div>
                <div className="text-sm text-gray-500">For challenges or temporary habits</div>
              </div>
            </label>
          </div>

          {formData.goal_type === 'fixed' && (
            <div className="mt-4">
              <label htmlFor="target-days" className="block font-medium mb-2">For how many days?</label>
              <input
                id="target-days"
                type="number"
                min="1"
                value={formData.total_target_days || ''}
                onChange={(e) => handleChange('total_target_days', e.target.value)}
                placeholder="e.g., 30 days, 60 days, 90 days"
                className="w-full md:w-1/3 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF] focus:border-[#4A2BAF] transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-5 border-t flex justify-between">
        <button 
          type="button"
          onClick={() => onSubmit(null)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        
        <button 
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
        >
          {habit ? 'Save Changes' : 'Create Habit'}
        </button>
      </div>
    </form>
  );
};

export default HabitForm;