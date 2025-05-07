import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const EditTaskModal = ({ onClose, task, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Physical',
    dueDate: '',
    status: 'pending',
    estimatedHours: '',
    estimatedMinutes: '',
    subtasks: []
  });
  
  useEffect(() => {
    if (task) {
      // Extract hours and minutes from estimated_time
      let hours = 0;
      let minutes = 0;
      
      if (task.estimated_time) {
        if (typeof task.estimated_time === 'string') {
          // Parse from string format like "2h 30m"
          const hoursMatch = task.estimated_time.match(/(\d+)h/);
          const minutesMatch = task.estimated_time.match(/(\d+)m/);
          hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
          minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
        } else if (typeof task.estimated_time === 'object') {
          // Use object format if available
          hours = task.estimated_time.hours || 0;
          minutes = task.estimated_time.minutes || 0;
        }
      }

      setEditedTask({
        id: task.id || task.task_id,
        title: task.title || task.name || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        category: task.category || 'Physical',
        dueDate: task.dueDate || '',
        status: task.status || (task.completed ? 'completed' : 'pending'),
        estimatedHours: hours,
        estimatedMinutes: minutes,
        subtasks: task.subtasks || []
      });
    }
  }, [task]);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`; // this is what <input type="date"> expects
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editedTask.title.trim()) {
      alert('Task title is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format estimated time
      let estimatedTime = null;
      if (editedTask.estimatedHours || editedTask.estimatedMinutes) {
        const hours = editedTask.estimatedHours || 0;
        const minutes = editedTask.estimatedMinutes || 0;
        estimatedTime = `${hours} hours ${minutes} minutes`;
      }
      
      // Prepare data for backend
      const updatedTask = {
        id: editedTask.id,
        name: editedTask.title,
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        category: editedTask.category,
        dueDate: editedTask.dueDate || null,
        status: editedTask.status,
        estimated_time: estimatedTime,
        subtasks: editedTask.subtasks.map(st => ({
          id: st.id,
          name: st.title || st.name,
          status: st.status || (st.completed ? 'completed' : 'pending'),
          completed: st.status === 'completed' || st.completed
        }))
      };
      
      await onSave(updatedTask);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
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
              disabled={isSubmitting}
            >
              <option value="Physical">Physical</option>
              <option value="Mental">Mental</option>
              <option value="Spiritual">Spiritual</option>
              <option value="Social">Social</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formatDateForInput(editedTask.dueDate)}
              onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF]"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={editedTask.status}
              onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF]"
              disabled={isSubmitting}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-[#5D4EFF] rounded-md hover:bg-[#4A2BAF] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              disabled={isSubmitting || !editedTask.title.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditTaskModal; 