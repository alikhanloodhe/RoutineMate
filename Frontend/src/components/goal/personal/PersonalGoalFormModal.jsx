import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PersonalGoalFormModal = ({ isOpen, onClose, onSubmit, goal }) => {
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Physical');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [status, setStatus] = useState('pending');
  const [milestones, setMilestones] = useState([]);
  
  // Milestone temp state
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(null);
  const [reminderAt, setReminderAt] = useState('');

  // Error states
  const [dateErrors, setDateErrors] = useState({ goal: '', milestone: '' });
  
  // Set form values when editing an existing goal
  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setCategory(goal.category || 'Physical');
      setStartDate(goal.start_date || '');
      setEndDate(goal.end_date || '');
      setVisibility(goal.visibility || 'private');
      setStatus(goal.status || 'pending');
      setMilestones(goal.milestones || []);
    } else {
      // Reset form for new goal
      resetForm();
    }
  }, [goal, isOpen]);

  // Reset form to default values
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Physical');
    setStartDate('');
    setEndDate('');
    setVisibility('private');
    setStatus('pending');
    setMilestones([]);
    setDateErrors({ goal: '', milestone: '' });
    resetMilestoneForm();
  };

  // Reset milestone form
  const resetMilestoneForm = () => {
    setMilestoneTitle('');
    setMilestoneDescription('');
    setMilestoneDueDate('');
    setCurrentMilestoneIndex(null);
    setShowMilestoneForm(false);
    setDateErrors(prev => ({ ...prev, milestone: '' }));
  };

  // Open milestone form for new milestone
  const handleAddMilestone = () => {
    resetMilestoneForm();
    setShowMilestoneForm(true);
  };

  // Open milestone form for editing
  const handleEditMilestone = (index) => {
    const milestone = milestones[index];
    setMilestoneTitle(milestone.title);
    setMilestoneDescription(milestone.description);
    setMilestoneDueDate(milestone.due_date);
    setCurrentMilestoneIndex(index);
    setShowMilestoneForm(true);
  };

  // Delete milestone
  const handleDeleteMilestone = (index) => {
    setMilestones(prevMilestones => 
      prevMilestones.filter((_, i) => i !== index)
    );
  };

  // Validate milestone date
  const validateMilestoneDate = (dueDate) => {
    if (!startDate) return true; // Can't validate if no goal start date set
    
    const goalStartDate = new Date(startDate);
    const goalEndDate = endDate ? new Date(endDate) : null;
    const milestoneDueDateTime = new Date(dueDate);
    
    if (milestoneDueDateTime < goalStartDate) {
      setDateErrors(prev => ({ ...prev, milestone: 'Milestone due date cannot be earlier than goal start date' }));
      return false;
    }
    
    if (goalEndDate && milestoneDueDateTime > goalEndDate) {
      setDateErrors(prev => ({ ...prev, milestone: 'Milestone due date cannot be later than goal end date' }));
      return false;
    }
    
    setDateErrors(prev => ({ ...prev, milestone: '' }));
    return true;
  };

  // Validate goal dates
  const validateGoalDates = () => {
    if (!startDate || !endDate) return false;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      setDateErrors(prev => ({ ...prev, goal: 'End date cannot be earlier than start date' }));
      return false;
    }
    
    setDateErrors(prev => ({ ...prev, goal: '' }));
    return true;
  };

  // Handle start date change
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // Validate end date if it exists
    if (endDate) {
      const start = new Date(newStartDate);
      const end = new Date(endDate);
      
      if (end < start) {
        setDateErrors(prev => ({ ...prev, goal: 'End date cannot be earlier than start date' }));
      } else {
        setDateErrors(prev => ({ ...prev, goal: '' }));
      }
    }
  };

  // Handle end date change
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    
    // Validate against start date
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(newEndDate);
      
      if (end < start) {
        setDateErrors(prev => ({ ...prev, goal: 'End date cannot be earlier than start date' }));
      } else {
        setDateErrors(prev => ({ ...prev, goal: '' }));
      }
    }
  };

  // Handle milestone due date change
  const handleMilestoneDateChange = (e) => {
    const newDueDate = e.target.value;
    setMilestoneDueDate(newDueDate);
    validateMilestoneDate(newDueDate);
  };

  // Save milestone
  const handleSaveMilestone = () => {
    if (!milestoneTitle.trim()) {
      alert('Please enter a milestone title');
      return;
    }

    // Validate milestone due date against goal dates
    if (milestoneDueDate && !validateMilestoneDate(milestoneDueDate)) {
      return; // Stop if validation fails
    }

    const newMilestone = {
      id: currentMilestoneIndex !== null ? 
        milestones[currentMilestoneIndex].id : // Keep same ID when editing
        `milestone-${Date.now()}`, // Generate ID for new milestone
      title: milestoneTitle,
      description: milestoneDescription,
      due_date: milestoneDueDate,
      status: 'pending', // New milestones always start as pending
      reminder_at: reminderAt,
      completion_date: null
    };

    if (currentMilestoneIndex !== null) {
      // Update existing milestone
      setMilestones(prevMilestones => 
        prevMilestones.map((m, i) => 
          i === currentMilestoneIndex ? newMilestone : m
        )
      );
    } else {
      // Add new milestone
      setMilestones(prevMilestones => [...prevMilestones, newMilestone]);
    }

    resetMilestoneForm();
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a goal title');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please enter start and end dates');
      return;
    }

    // Validate goal dates
    if (!validateGoalDates()) {
      return; // Stop if validation fails
    }

    const goalData = {
      goal_id: goal?.goal_id, // Only included when editing
      title,
      description,
      category,
      start_date: startDate,
      end_date: endDate,
      // visibility,
      // status: 'active',
      milestones,
      progress: 0, // Initialize progress at 0%
      goal_type: 'personal',
      created_at: goal?.created_at || new Date().toISOString()
    };

    onSubmit(goalData);
    resetForm();
  };

  // Handle close modal
  const handleClose = () => {
    resetForm();
    onClose();
  };
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return ''; // Return empty string if invalid date
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // this is what <input type="date"> expects
  };
  

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {goal ? 'Edit Personal Goal' : 'Create Personal Goal'}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              
              {/* Body - scrollable */}
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  {/* Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Goal Title*
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent"
                      placeholder="Enter goal title"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent min-h-[100px]"
                      placeholder="Describe your goal..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent"
                      >
                        <option value="Physical">Physical</option>
                        <option value="Mental">Mental</option>
                        <option value="Spiritual">Spiritual</option>
                        <option value="Social">Social</option>

                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date*
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(startDate)}
                        onChange={handleStartDateChange}
                        className={`w-full px-3 py-2 border ${dateErrors.goal ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent`}
                        required
                      />
                    </div>
                    
                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date*
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(endDate)}
                        onChange={handleEndDateChange}
                        className={`w-full px-3 py-2 border ${dateErrors.goal ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent`}
                        required
                      />
                      
                      {dateErrors.goal && (
                        <p className="text-red-500 text-xs mt-1">{dateErrors.goal}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Milestones Section */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-medium text-gray-800">Milestones</h4>
                      <button
                        type="button"
                        onClick={handleAddMilestone}
                        className="text-[#4A2BAF] hover:text-[#3D2291] text-sm flex items-center gap-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add Milestone
                      </button>
                    </div>
                    
                    {/* Milestone Form */}
                    {showMilestoneForm && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">
                          {currentMilestoneIndex !== null ? 'Edit Milestone' : 'Add Milestone'}
                        </h5>
                        
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Title*
                          </label>
                          <input
                            type="text"
                            value={milestoneTitle}
                            onChange={(e) => setMilestoneTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent text-sm"
                            placeholder="Enter milestone title"
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={milestoneDescription}
                            onChange={(e) => setMilestoneDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent text-sm"
                            placeholder="Describe this milestone"
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={milestoneDueDate}
                            onChange={handleMilestoneDateChange}
                            className={`w-full px-3 py-2 border ${dateErrors.milestone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent text-sm`}
                          />
                          {dateErrors.milestone && (
                            <p className="text-red-500 text-xs mt-1">{dateErrors.milestone}</p>
                          )}
                        </div>
                         
                        {/* Reminder */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Set Reminder (Optional)
                          </label>
                          <input
                            type="datetime-local"
                            value={reminderAt}
                            onChange={(e) => setReminderAt(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent"
                          />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={resetMilestoneForm}
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveMilestone}
                            className="px-3 py-1.5 bg-[#4A2BAF] text-white text-sm rounded-lg hover:bg-[#3D2291]"
                          >
                            {currentMilestoneIndex !== null ? 'Save Changes' : 'Add Milestone'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Milestones List */}
                    {milestones.length > 0 ? (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {milestones.map((milestone, index) => (
                          <div
                            key={milestone.id || index}
                            className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <h6 className="text-sm font-medium">{milestone.title}</h6>
                              {milestone.due_date && (
                                <p className="text-xs text-gray-500">
                                  Due: {new Date(milestone.due_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditMilestone(index)}
                                className="text-[#4A2BAF] p-1 hover:bg-[#4A2BAF]/5 rounded"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMilestone(index)}
                                className="text-red-500 p-1 hover:bg-red-50 rounded"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No milestones added yet. Break down your goal into smaller steps.
                      </p>
                    )}
                  </div>
                </form>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-lg hover:opacity-90"
                >
                  {goal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PersonalGoalFormModal; 