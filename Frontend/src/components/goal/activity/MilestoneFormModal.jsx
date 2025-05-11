import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MilestoneFormModal = ({ isOpen, onClose, onSubmit, milestone = null }) => {
  // excluded status show
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [reminderAt, setReminderAt] = useState('');

  // Set form values when editing an existing milestone
  useEffect(() => {
    if (milestone) {
      setTitle(milestone.title || '');
      setDescription(milestone.description || '');
      setDueDate(milestone.due_date || '');
      setStatus(milestone.status || 'pending');
      setReminderAt(milestone.reminder_at || '');
    } else {
      // Reset form for new milestone
      resetForm();
    }
  }, [milestone, isOpen]);

  // Reset form to default values
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setStatus('pending');
    setReminderAt('');
  };

  // Handle close modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a milestone title');
      return;
    }

    const milestoneData = {
      milestone_id: milestone?.milestone_id, // Only included when editing
      title,
      description,
      due_date: dueDate || null,
      reminder_at: reminderAt || null,
      status,
      completion_date: status === 'completed' ? new Date().toISOString() : null
    };

    onSubmit(milestoneData);
    resetForm();
  };
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return ''; // Return empty string for null/undefined/empty values
    
    console.log(dateStr);
    const d = new Date(dateStr);
    // Check if date is valid
    if (isNaN(d.getTime())) return '';
    
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
            <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {milestone ? 'Edit Milestone' : 'Add Milestone'}
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
                      Milestone Title*
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent"
                      placeholder="Enter milestone title"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent"
                      placeholder="Describe this milestone..."
                      rows="3"
                    />
                  </div>
                  
                  {/* Status */}
          
                  
                  {/* Due Date */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(dueDate)}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent"
                    />
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
                  
                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#4A2BAF] text-white rounded-lg hover:bg-[#3D2291] transition-colors"
                    >
                      {milestone ? 'Save Changes' : 'Add Milestone'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MilestoneFormModal; 