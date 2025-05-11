import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { fetchCategories } from '../../services/categoryService';

const EditTaskModal = ({ onClose, task, onSave }) => {
  const [editedTask, setEditedTask] = useState({
    id: task.id,
    title: task.name || task.title || '',
    description: task.description || '',
    priority: task.priority || 'Medium',
    category: task.category || '',
    category_id: task.category_id || '',
    dueDate: task.due_date || task.dueDate || '',
    status: task.status || 'pending',
    estimatedHours: task.estimated_hours ? getHoursFromEstimated(task.estimated_hours) : '',
    estimatedMinutes: task.estimated_hours ? getMinutesFromEstimated(task.estimated_hours) : '',
    subtasks: task.subtasks || []
  });

  // State for categories
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories when component mounts
  useEffect(() => {
    const getCategories = async () => {
      try {
        setLoadingCategories(true);
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
        
        // If task.category exists but category_id doesn't, try to find matching category ID
        if (editedTask.category && !editedTask.category_id) {
          const matchingCategory = fetchedCategories.find(
            c => c.name.toLowerCase() === editedTask.category.toLowerCase()
          );
          if (matchingCategory) {
            setEditedTask(prev => ({
              ...prev,
              category_id: matchingCategory.id.toString()
            }));
          }
        }
        
        setLoadingCategories(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategoryError('Failed to load categories');
        setLoadingCategories(false);
      }
    };

    getCategories();
  }, [editedTask.category]);

  // Helper functions to extract hours and minutes from estimated time string
  function getHoursFromEstimated(timeString) {
    if (!timeString) return '';
    const match = timeString.match(/(\d+)\s*hours?/i);
    return match ? match[1] : '';
  }

  function getMinutesFromEstimated(timeString) {
    if (!timeString) return '';
    const match = timeString.match(/(\d+)\s*minutes?/i);
    return match ? match[1] : '';
  }

  // Format date for input fields
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    
    // Handle both Date objects and date strings
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    
    if (isNaN(date.getTime())) return ''; // Invalid date
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(c => c.id.toString() === categoryId);
    
    setEditedTask({
      ...editedTask,
      category_id: categoryId,
      category: selectedCategory ? selectedCategory.name : ''
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
        category_id: parseInt(editedTask.category_id, 10) || null,
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl w-full max-w-md my-8"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6">
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
                value={editedTask.category_id}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF]"
                disabled={isSubmitting || loadingCategories}
              >
                {loadingCategories ? (
                  <option>Loading categories...</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
              {categoryError && (
                <p className="text-red-500 text-xs mt-1">{categoryError}</p>
              )}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
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
                  <span className="text-xs text-gray-500 mt-1 block">Hours</span>
                </div>
                <span className="text-gray-500">:</span>
                <div className="flex-1">
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
                  <span className="text-xs text-gray-500 mt-1 block">Minutes</span>
                </div>
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
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditTaskModal; 