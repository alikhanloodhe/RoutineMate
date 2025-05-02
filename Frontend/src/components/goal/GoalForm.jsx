import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GoalForm = ({ 
  goal = null, 
  onSubmit, 
  onCancel 
}) => {
  // Form states
  const [step, setStep] = useState(1); // 1: Goal details, 2: Milestones
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [milestones, setMilestones] = useState([]);
  
  // Current milestone being added
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [milestoneReminderDate, setMilestoneReminderDate] = useState('');
  
  // Validation states
  const [errors, setErrors] = useState({});

  // Categories
  const categories = [
    { value: '', label: 'Select a category' },
    { value: 'education', label: 'Education' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'finance', label: 'Finance' },
    { value: 'personal', label: 'Personal' },
    { value: 'project', label: 'Project' },
    { value: 'other', label: 'Other' }
  ];

  // If editing, populate form with goal data
  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setCategory(goal.category || '');
      setStartDate(goal.start_date ? formatDateForInput(goal.start_date) : '');
      setEndDate(goal.end_date ? formatDateForInput(goal.end_date) : '');
      setMilestones(goal.milestones || []);
    }
  }, [goal]);

  // Format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format displayed date (MM/DD/YYYY)
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Validate goal details
  const validateGoalDetails = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!category) newErrors.category = 'Category is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate milestone
  const validateMilestone = () => {
    const newErrors = {};
    
    if (!milestoneTitle.trim()) newErrors.milestoneTitle = 'Milestone title is required';
    if (!milestoneDueDate) newErrors.milestoneDueDate = 'Due date is required';
    
    if (milestoneDueDate && startDate && endDate) {
      const milestone = new Date(milestoneDueDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (milestone < start || milestone > end) {
        newErrors.milestoneDueDate = 'Due date must be within goal dates';
      }
    }
    
    if (milestoneReminderDate && milestoneDueDate) {
      const reminder = new Date(milestoneReminderDate);
      const due = new Date(milestoneDueDate);
      
      if (reminder > due) {
        newErrors.milestoneReminderDate = 'Reminder date must be before due date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Move to next step
  const handleNextStep = () => {
    if (validateGoalDetails()) {
      setStep(2);
    }
  };

  // Add milestone
  const handleAddMilestone = () => {
    if (validateMilestone()) {
      const newMilestone = {
        id: Date.now().toString(), // temporary id
        title: milestoneTitle,
        description: milestoneDescription,
        due_date: milestoneDueDate,
        reminder_date: milestoneReminderDate || null
      };
      
      setMilestones([...milestones, newMilestone]);
      
      // Clear milestone form
      setMilestoneTitle('');
      setMilestoneDescription('');
      setMilestoneDueDate('');
      setMilestoneReminderDate('');
    }
  };

  // Remove milestone
  const handleRemoveMilestone = (id) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  // Submit form
  const handleSubmit = () => {
    // Compile all data
    const goalData = {
      title,
      description,
      category,
      start_date: startDate,
      end_date: endDate,
      goal_type: 'personal',
      milestones,
      // Add additional properties for existing goals
      ...(goal && { goal_id: goal.goal_id }),
      ...(goal && { status: goal.status }),
      ...(goal && { progress: goal.progress }),
      ...(goal && { created_at: goal.created_at })
    };
    
    // Call onSubmit with goal data
    onSubmit(goalData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Form Header */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {goal ? 'Edit Personal Goal' : 'Create Personal Goal'}
      </h2>
      
      {/* Step 1: Goal Details */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Goal Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your goal title"
              className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your goal and what you want to achieve"
              rows="4"
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-md hover:shadow-md transition-shadow flex items-center"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Step 2: Milestones */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Add Milestones</h3>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[#4A2BAF] hover:text-[#3A1C9F] flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Goal Details
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-2">
                Milestone Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                placeholder="Enter milestone title"
                className={`w-full border ${errors.milestoneTitle ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
              />
              {errors.milestoneTitle && <p className="text-red-500 text-sm mt-1">{errors.milestoneTitle}</p>}
            </div>
            
            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                value={milestoneDescription}
                onChange={(e) => setMilestoneDescription(e.target.value)}
                placeholder="Describe this milestone"
                rows="3"
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={milestoneDueDate}
                    onChange={(e) => setMilestoneDueDate(e.target.value)}
                    className={`w-full border ${errors.milestoneDueDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.milestoneDueDate && <p className="text-red-500 text-sm mt-1">{errors.milestoneDueDate}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Reminder Date <span className="text-gray-400 text-sm font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={milestoneReminderDate}
                    onChange={(e) => setMilestoneReminderDate(e.target.value)}
                    className={`w-full border ${errors.milestoneReminderDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.milestoneReminderDate && <p className="text-red-500 text-sm mt-1">{errors.milestoneReminderDate}</p>}
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAddMilestone}
              className="bg-[#4A2BAF] text-white px-4 py-2 rounded-md hover:bg-[#3A1C9F] transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Milestone
            </button>
          </div>
          
          {/* Added Milestones */}
          {milestones.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-3">Added Milestones</h4>
              <div className="space-y-3">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div>
                      <p className="font-medium">{milestone.title}</p>
                      <p className="text-sm text-gray-500">Due: {formatDateForDisplay(milestone.due_date)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(milestone.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-between space-x-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-md hover:shadow-md transition-shadow"
            >
              {goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GoalForm; 