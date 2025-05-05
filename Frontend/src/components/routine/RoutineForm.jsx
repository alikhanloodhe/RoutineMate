import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Tag, AlertCircle } from 'lucide-react';

const RoutineForm = ({ 
  isEdit = false,
  initialValues = null, 
  onSubmit, 
  onCancel 
}) => {
  // Form states mapped to backend schema
  const [title, setTitle] = useState('');
 
  const [categoryId, setCategoryId] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState([]);
  const [priorityId, setPriorityId] = useState('medium');
  const [status, setStatus] = useState('active');
  
  // Validation states
  const [errors, setErrors] = useState({});

  // Categories, priorities and days - based on backend schema
  const categories = [
    { id: "physical", name: "Physical" },
    { id: "mental", name: "Mental" }, 
    { id: "spiritual", name: "Spiritual" }, 
    { id: "social", name: "Social" },
    { id: "work", name: "Work" },
    { id: "education", name: "Education" }
  ];
  
  const priorities = [
    { id: "high", name: "High" },
    { id: "medium", name: "Medium" },
    { id: "low", name: "Low" }
  ];
  
  const statusOptions = [
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" }
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

  // If editing, populate form with routine data
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
  
      setCategoryId(initialValues.category?.toLowerCase() || '');
      setStartTime(initialValues.startTime || '08:00');
      setEndTime(initialValues.endTime || '09:00');
      setSelectedDays(initialValues.daysOfWeek || []);
      setPriorityId(initialValues.priority?.toLowerCase() || 'medium');
      setStatus(initialValues.active ? 'active' : 'inactive');
    }
  }, [initialValues]);

  // Validate routine details
  const validateRoutineDetails = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!categoryId) newErrors.categoryId = 'Category is required';
    if (!startTime) newErrors.startTime = 'Start time is required';
    if (!endTime) newErrors.endTime = 'End time is required';
    if (selectedDays.length === 0) newErrors.selectedDays = 'At least one day must be selected';
    
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      if (start >= end) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    
    if (validateRoutineDetails()) {
      // Compile all data to match backend schema
      const routineData = {
        title,

        category: categories.find(c => c.id === categoryId)?.name || categoryId,
        startTime,
        endTime,
        daysOfWeek: selectedDays,
        priority: priorities.find(p => p.id === priorityId)?.name || priorityId,
        active: status === 'active',
        // Add additional properties for existing routines
        ...(initialValues && { id: initialValues.id }),
        ...(initialValues && { completionData: initialValues.completionData })
      };
      
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
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
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
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriorityId(p.id)}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    priorityId === p.id
                      ? 'bg-[#4A2BAF] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Status */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatus(s.id)}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  status === s.id
                    ? 'bg-[#4A2BAF] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s.name}
              </button>
            ))}
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
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-md bg-[#4A2BAF] text-white hover:bg-[#3A1C9F] font-medium transition-colors"
          >
            {isEdit ? 'Update Routine' : 'Create Routine'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoutineForm; 