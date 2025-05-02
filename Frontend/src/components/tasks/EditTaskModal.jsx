import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const EditTaskModal = ({ isOpen, onClose, task, onSave }) => {
  console.log(task);
  const [editedTask, setEditedTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    dueDate: '',
    status: 'pending',
    estimatedHours: '',
    estimatedMinutes: '',
  });
  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title || task.name || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        category: task.category || '',
        dueDate: task.dueDate || '',
        status: task.status ||'pending' ,
        estimatedHours: task.estimated_time.hours,
        estimatedMinutes:task.estimated_time.minutes
      });
    }
  }, [task]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedTask);
  };
  const formatDateForInput = (dateStr) => {
    console.log(dateStr);
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // this is what <input type="date"> expects
  };
  

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF]"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={editedTask.priority}
              onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={editedTask.category}
              onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF]"
            >
              <option value="">Select Category</option>
              <option value="Physical">Physical</option>
              <option value="Mental">Mental</option>
              <option value="Spiritual">Spiritual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date{console.log(formatDateForInput(editedTask.dueDate))}
            </label>
            <input
              type="date"
              value={formatDateForInput(editedTask.dueDate)}
              onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF]"
            />
          </div>

          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="estimatedHours"
                    value={editedTask.estimatedHours}
                    onChange={(e) => setEditedTask({ ...editedTask, estimatedHours: e.target.value })}
                    placeholder="Hours"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                  />
                  <span className="text-gray-500">:</span>
                  <input
                    type="number"
                    name="estimatedMinutes"
                    value={editedTask.estimatedMinutes}
                    onChange={(e) => setEditedTask({ ...editedTask, estimatedMinutes: e.target.value })}
                    placeholder="Minutes"
                    min="0"
                    max="59"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                  />
                </div>
              </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-[#5D4EFF] rounded-md hover:bg-[#4A2BAF]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditTaskModal; 