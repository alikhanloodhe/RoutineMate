import React, { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';

const CreateTaskModal = ({ isOpen, onClose, onCreateTask }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    category_id: 1, // Default category ID
    priority_id: 1, // Default priority ID (High)
    dueDate: '',
    status: 'pending',
    estimatedHours: '',
    estimatedMinutes: '',
    subtasks: []
  });
  
  const [newSubtask, setNewSubtask] = useState('');

  // Map priority IDs to labels for display
  const priorityMap = {
    1: 'High',
    2: 'Medium',
    3: 'Low'
  };

  // Map category IDs to labels for display
  const categoryMap = {
    1: 'Physical',
    2: 'Mental',
    3: 'Spiritual',
    4: 'Social'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const newSubtaskObj = {
      id: Date.now(),
      name: newSubtask,
      status: 'pending',
      estimated_time: null
    };
    
    setTaskData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, newSubtaskObj]
    }));
    
    setNewSubtask('');
  };

  const removeSubtask = (id) => {
    setTaskData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== id)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format estimated time as a PostgreSQL interval string
    let estimatedTime = null;
    if (taskData.estimatedHours || taskData.estimatedMinutes) {
      const hours = taskData.estimatedHours || 0;
      const minutes = taskData.estimatedMinutes || 0;
      estimatedTime = `${hours} hours ${minutes} minutes`;
    }
    
    // Create task object from form data
    const newTask = {
      id: Date.now(), // In a real app, this would come from the backend
      title: taskData.name, // For UI display
      name: taskData.name, // For database
      description: taskData.description,
      category_id: parseInt(taskData.category_id),
      priority_id: parseInt(taskData.priority_id),
      status: taskData.status,
      dueDate: taskData.dueDate, // For UI display
      estimated_time: estimatedTime,
      completed: false, // For UI display
      subtasks: taskData.subtasks,
      timeSpent: '0h 0m', // For UI display
      // Add display values for UI
      category: categoryMap[taskData.category_id],
      priority: priorityMap[taskData.priority_id],
      // Add timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    onCreateTask(newTask);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTaskData({
      name: '',
      description: '',
      category_id: 1,
      priority_id: 1,
      dueDate: '',
      status: 'pending',
      estimatedHours: '',
      estimatedMinutes: '',
      subtasks: []
    });
    setNewSubtask('');
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 ">
          <h2 className="text-xl font-semibold text-gray-800">Create New Task</h2>
          <button 
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
              <input
                type="text"
                name="name"
                value={taskData.name}
                onChange={handleChange}
                placeholder="Enter task name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                required
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={taskData.description}
                onChange={handleChange}
                placeholder="What is this task about?"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
              />
            </div>
            
            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category_id"
                  value={taskData.category_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                >
                  <option value="1">Physical</option>
                  <option value="2">Mental</option>
                  <option value="3">Spiritual</option>
                  <option value="4">Social</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority_id"
                  value={taskData.priority_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                >
                  <option value="1">High</option>
                  <option value="2">Medium</option>
                  <option value="3">Low</option>
                </select>
              </div>
            </div>
            
            {/* Due Date and Estimated Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={taskData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="estimatedHours"
                    value={taskData.estimatedHours}
                    onChange={handleChange}
                    placeholder="Hours"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                  />
                  <span className="text-gray-500">:</span>
                  <input
                    type="number"
                    name="estimatedMinutes"
                    value={taskData.estimatedMinutes}
                    onChange={handleChange}
                    placeholder="Minutes"
                    min="0"
                    max="59"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={taskData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            {/* Subtasks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtasks</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                />
                <button
                  type="button"
                  onClick={addSubtask}
                  className="px-3 py-2 bg-[#5D4EFF] text-white rounded-md hover:bg-[#4A2BAF]"
                >
                  <FiPlus />
                </button>
              </div>
              
              {taskData.subtasks.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 border border-gray-200 rounded-md p-2">
                  {taskData.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center justify-between border-b border-gray-100 pb-1 last:border-0">
                      <span className="text-sm text-gray-700">{subtask.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSubtask(subtask.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#5D4EFF] text-white rounded-md hover:bg-[#4A2BAF] transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateTaskModal; 