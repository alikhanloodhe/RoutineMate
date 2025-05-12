// components/habit/HabitForm.jsx
import React, { useState, useEffect } from 'react';
import FrequencySelector from './FrequencySelector';
import DatePicker from './DatePicker';
import ReminderTimePicker from './ReminderTimePicker';
import axios from 'axios';

const HabitForm = ({ habit, onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    reminder_time: '',
    why_reason: '',
    start_date: new Date().toISOString().split('T')[0],
    goal_type: 'lifelong',
    total_target_days: '',
    category_id: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize form with habit data if editing
  useEffect(() => {
    if (habit) {
      setFormData({
        ...habit,
        // Ensure these fields exist even if they're null in the habit data
        description: habit.description || '',
        reminder_time: habit.reminder_time || '',
        why_reason: habit.why_reason || '',
        total_target_days: habit.total_target_days || '',
        category_id: habit.category_id || ''
      });
    }
  }, [habit]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFrequencyChange = (frequency) => {
    setFormData(prev => ({ 
      ...prev, 
      frequency
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Don't submit if already submitting
    if (isSubmitting) return;
    
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
      category_id: formData.category_id === '' ? null : formData.category_id,
      
      // Only include total_target_days if goal_type is 'fixed'
      total_target_days: formData.goal_type === 'fixed' 
        ? parseInt(formData.total_target_days, 10) || null 
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 mt-1">Understanding your motivation makes habits more likely to stick</p>
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Habit Category</h4>
          <div className="mb-4">
            <label htmlFor="category" className="block font-semibold text-gray-800 mb-2">
              Category
            </label>
            <div className="relative">
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF] focus:border-[#4A2BAF] transition-colors appearance-none"
                disabled={isSubmitting}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Habit Schedule</h4>
          
          <FrequencySelector 
            value={formData.frequency} 
            onChange={handleFrequencyChange}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <DatePicker
              id="start-date"
              label="Start Date"
              value={formData.start_date}
              onChange={(value) => handleChange('start_date', value)}
              disabled={isSubmitting}
            />
            
            <ReminderTimePicker
              id="reminder-time"
              label="Reminder Time (optional)"
              value={formData.reminder_time}
              onChange={(value) => handleChange('reminder_time', value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Habit Goal</h4>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
            <label className={`flex items-center p-3 border rounded-lg ${!isSubmitting ? 'cursor-pointer' : 'opacity-75'} transition-all hover:border-[#4A2BAF] hover:bg-[#4A2BAF]/5`} onClick={() => !isSubmitting && handleChange('goal_type', 'lifelong')}>
              <input
                type="radio"
                value="lifelong"
                checked={formData.goal_type === 'lifelong'}
                onChange={() => {}}
                className="mr-3 h-5 w-5 text-[#4A2BAF]"
                disabled={isSubmitting}
              />
              <div>
                <div className="font-medium">Lifelong Habit</div>
                <div className="text-sm text-gray-500">For habits you want to maintain indefinitely</div>
              </div>
            </label>
            
            <label className={`flex items-center p-3 border rounded-lg ${!isSubmitting ? 'cursor-pointer' : 'opacity-75'} transition-all hover:border-[#4A2BAF] hover:bg-[#4A2BAF]/5`} onClick={() => !isSubmitting && handleChange('goal_type', 'fixed')}>
              <input
                type="radio"
                value="fixed"
                checked={formData.goal_type === 'fixed'}
                onChange={() => {}}
                className="mr-3 h-5 w-5 text-[#4A2BAF]"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-5 border-t flex justify-between">
        <button 
          type="button"
          onClick={() => !isSubmitting && onSubmit(null)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        
        <button 
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 flex items-center justify-center min-w-[120px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {habit ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            habit ? 'Save Changes' : 'Create Habit'
          )}
        </button>
      </div>
    </form>
  );
};

export default HabitForm;