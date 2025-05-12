import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Tag, AlertCircle } from 'lucide-react';
import { fetchCategories } from '../../services/categoryService';

const RoutineForm = ({ 
  isEdit = false,
  initialValues = null, 
  onSubmit, 
  onCancel,
  isSubmitting = false
}) => {
  // Form states mapped to backend schema
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState([]);
  const [priorityId, setPriorityId] = useState('');
  const [status, setStatus] = useState('pending');
  
  // State for dynamic categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Validation states
  const [errors, setErrors] = useState({});
  // Additional state for time conflict validation
  const [timeConflict, setTimeConflict] = useState(false);

  // Priorities and days - based on backend schema
  const priorities = [
    { id: 1, name: "HIGH" },
    { id: 2, name: "MEDIUM" },
    { id: 3, name: "LOW" }
  ];
  
  const daysOfWeek = [
    { id: 1, name: "Mon" },
    { id: 2, name: "Tue" },
    { id: 3, name: "Wed" },
    { id: 4, name: "Thu" },
    { id: 5, name: "Fri" },
    { id: 6, name: "Sat" },
    { id: 7, name: "Sun" }
  ];

  // Fetch categories from backend
  useEffect(() => {
    const getCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  // If editing, populate form with routine data
  useEffect(() => {
    if (initialValues) {
      console.log("Initializing form with values:", initialValues);
      setTitle(initialValues.title || '');
      
      // Handle category_id correctly
      const categoryIdValue = initialValues.category_id || 
                             (initialValues.category && categories.find(c => c.name === initialValues.category)?.id) || 
                             '';
      setCategoryId(String(categoryIdValue));
      
      // Set times
      setStartTime(initialValues.start_time || initialValues.startTime || '08:00');
      setEndTime(initialValues.end_time || initialValues.endTime || '09:00');
      
      // Set days
      const daysArray = initialValues.days || initialValues.daysOfWeek || [];
      setSelectedDays(Array.isArray(daysArray) ? daysArray : []);
      
      // Handle priority_id correctly
      const priorityIdValue = initialValues.priority_id || 
                             (initialValues.priority && priorities.find(p => p.name === initialValues.priority)?.id) || 
                             '';
      setPriorityId(String(priorityIdValue));
      
      // Set status
      setStatus(initialValues.status || 'pending');
    }
  // Only run on initial mount and when initialValues or initialValues.id changes  
  }, [initialValues?.id, initialValues?.routine_id, isEdit, categories]);

  // Validate routine details
  const validateRoutineDetails = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!categoryId) newErrors.categoryId = 'Category is required';
    if (!startTime) newErrors.startTime = 'Start time is required';
    if (!endTime) newErrors.endTime = 'End time is required';
    if (selectedDays.length === 0) newErrors.selectedDays = 'At least one day must be selected';
    if (!priorityId) newErrors.priorityId = 'Priority is required';
    
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      if (start >= end) {
        newErrors.endTime = 'End time must be after start time';
      } else {
        // Check for short duration (less than 30 minutes)
        const durationMinutes = (end - start) / (1000 * 60);
        if (durationMinutes < 30) {
          newErrors.shortDuration = 'Short routines (<30 min) will display differently in the schedule view';
        }
      }
    }
    
    if (timeConflict) {
      newErrors.timeConflict = 'This time slot conflicts with another routine';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 || 
           (Object.keys(newErrors).length === 1 && newErrors.shortDuration);
  };

  // Toggle day selection
  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Select all weekdays
  const selectWeekdays = () => {
    setSelectedDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  };
  
  // Select weekends
  const selectWeekends = () => {
    setSelectedDays(["Sat", "Sun"]);
  };
  
  // Select all days
  const selectAllDays = () => {
    setSelectedDays(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prevent submission if already submitting
    if (isSubmitting) return;
    
    if (validateRoutineDetails()) {
      // Compile all data to match backend schema
      const routineData = {
        title,
        category_id: parseInt(categoryId, 10) || categoryId,
        start_time: startTime,
        end_time: endTime,
        days: selectedDays,
        priority_id: parseInt(priorityId, 10) || priorityId,
        status,
        // For compatibility with the frontend while in transition
        startTime: startTime,
        endTime: endTime,
        daysOfWeek: selectedDays,
        category: categories.find(c => c.id === parseInt(categoryId, 10))?.name || categoryId,
        priority: priorities.find(p => p.id === parseInt(priorityId, 10))?.name || priorityId,
        active: true, // Always active for UI display purposes
      };
      
      // Add ID if we're editing an existing routine
      if (initialValues) {
        routineData.id = initialValues.id;
        routineData.routine_id = initialValues.routine_id;
        
        // Preserve completion data if it exists
        if (initialValues.completionData) {
          routineData.completionData = initialValues.completionData;
        }
      }
      
      console.log("Submitting routine data:", routineData);
      
      // Call onSubmit with routine data
      onSubmit(routineData);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Routine Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your routine title"
            className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
            autoFocus
            disabled={isSubmitting}
          />
          {errors.title && (
            <div className="flex items-center text-red-500 text-sm mt-1">
              <AlertCircle size={16} className="mr-1" />
              <span>{errors.title}</span>
            </div>
          )}
        </div>
        
        {/* Category and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`w-full border ${errors.categoryId ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
                disabled={loading || isSubmitting}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <Tag size={18} />
              </div>
            </div>
            {errors.categoryId && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle size={16} className="mr-1" />
                <span>{errors.categoryId}</span>
              </div>
            )}
            {loading && (
              <div className="text-sm text-gray-500 mt-1">Loading categories...</div>
            )}
            {error && (
              <div className="text-sm text-red-500 mt-1">{error}</div>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriorityId(p.id.toString())}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    priorityId === p.id.toString() || priorityId === p.id
                      ? 'bg-[#4A2BAF] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            {errors.priorityId && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle size={16} className="mr-1" />
                <span>{errors.priorityId}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Start Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                step="60"
                className={`w-full border ${errors.startTime ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Clock size={18} />
              </div>
            </div>
            {errors.startTime && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle size={16} className="mr-1" />
                <span>{errors.startTime}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              End Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                step="60"
                className={`w-full border ${errors.endTime ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Clock size={18} />
              </div>
            </div>
            {errors.endTime && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle size={16} className="mr-1" />
                <span>{errors.endTime}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Short Duration Warning */}
        {errors.shortDuration && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
            <div className="flex items-center text-amber-600 text-sm">
              <AlertCircle size={18} className="mr-2" />
              <span>{errors.shortDuration}</span>
            </div>
          </div>
        )}
        
        {/* Time Conflict Warning */}
        {errors.timeConflict && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle size={18} className="mr-2" />
              <span>{errors.timeConflict}</span>
            </div>
          </div>
        )}
        
        {/* Status - Only visible when editing */}
        {isEdit && (
          <div>
            <label className="block text-gray-700 font-medium mb-2">Status</label>
            <div className="flex gap-3">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#4A2BAF]"
                  name="status"
                  value="pending"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                />
                <span className="ml-2">Pending</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#4A2BAF]"
                  name="status"
                  value="completed"
                  checked={status === 'completed'}
                  onChange={() => setStatus('completed')}
                />
                <span className="ml-2">Completed</span>
              </label>
            </div>
          </div>
        )}
        
        {/* Days of Week */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Days <span className="text-red-500">*</span>
          </label>
          
          <div className="mb-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={selectWeekdays}
              className="py-1 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Weekdays
            </button>
            <button
              type="button"
              onClick={selectWeekends}
              className="py-1 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Weekends
            </button>
            <button
              type="button"
              onClick={selectAllDays}
              className="py-1 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              All Days
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {daysOfWeek.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => handleDayToggle(day.name)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  selectedDays.includes(day.name)
                    ? 'bg-[#4A2BAF] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day.name[0]}
              </button>
            ))}
          </div>
          
          {errors.selectedDays && (
            <div className="flex items-center text-red-500 text-sm mt-2">
              <AlertCircle size={16} className="mr-1" />
              <span>{errors.selectedDays}</span>
            </div>
          )}
        </div>
        
        {/* Form Buttons - Update to handle isSubmitting state */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-2 bg-[#4A2BAF] text-white rounded-md hover:bg-[#3A1C9F] transition-colors flex items-center justify-center gap-2 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{isEdit ? 'Update Routine' : 'Create Routine'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoutineForm; 