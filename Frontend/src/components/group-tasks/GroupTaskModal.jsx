import React, { useState, useEffect } from 'react';
import { X, Plus, Trash, Check, User } from 'lucide-react';
import UserSelector from '../users/UserSelector';

const GroupTaskModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  taskToEdit = null,
  priorities = [],
  statuses = [], 
  friends = []
}) => {
  // Task state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [status, setStatus] = useState('1'); // Default to "To Do"
  const [assignees, setAssignees] = useState([]);
  const [errors, setErrors] = useState({});

  // If taskToEdit is provided, populate the form with its data
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setDueDate(taskToEdit.dueDate || '');
      setPriority(taskToEdit.priorityId?.toString() || '');
      setTags(taskToEdit.tags || []);
      setSubtasks(taskToEdit.subtasks || []);
      setStatus(taskToEdit.statusId?.toString() || '1');
      setAssignees(taskToEdit.assignees || []);
    } else {
      // Reset form when creating a new task
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('');
      setTag('');
      setTags([]);
      setSubtasks([]);
      setSubtaskTitle('');
      setStatus('1');
      setAssignees([]);
      setErrors({});
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tag.trim() !== '' && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (subtaskTitle.trim() !== '') {
      const newSubtask = {
        id: Date.now(), // Temporary ID
        title: subtaskTitle.trim(),
        is_completed: false
      };
      setSubtasks([...subtasks, newSubtask]);
      setSubtaskTitle('');
    }
  };

  const handleRemoveSubtask = (subtaskId) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
  };

  const toggleSubtaskCompletion = (subtaskId) => {
    setSubtasks(subtasks.map(subtask => 
      subtask.id === subtaskId 
        ? { ...subtask, is_completed: !subtask.is_completed } 
        : subtask
    ));
  };

  const handleAssigneeChange = (assigneeIds) => {
    setAssignees(assigneeIds);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = {};
    if (!title.trim()) validationErrors.title = 'Title is required';
    if (!priority) validationErrors.priority = 'Priority is required';
    if (!status) validationErrors.status = 'Status is required';
    if (assignees.length === 0) validationErrors.assignees = 'At least one assignee is required';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Clear any existing errors
    setErrors({});
    
    const taskData = {
      id: taskToEdit?.id,
      title,
      description,
      dueDate,
      priorityId: parseInt(priority),
      statusId: parseInt(status),
      tags,
      assignees,
      subtasks
    };
    
    // Call the onSave function passed from parent component
    onSave(taskData);
    
    // Close modal
    onClose();
  };

  const modalTitle = taskToEdit ? 'Edit Group Task' : 'Add New Group Task';
  const submitButtonText = taskToEdit ? 'Update Task' : 'Add Task';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{modalTitle}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Task Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Title*
            </label>
            {errors.title && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-1">{errors.title}</p>
            )}
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          {/* Task Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows="3"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority*
              </label>
              {errors.priority && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">{errors.priority}</p>
              )}
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Priority</option>
                {priorities.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status*
              </label>
              {errors.status && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">{errors.status}</p>
              )}
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Status</option>
                {statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignees */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignees*
            </label>
            {errors.assignees && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-1">{errors.assignees}</p>
            )}
            <UserSelector 
              users={friends}
              selectedUsers={assignees}
              onSelectionChange={handleAssigneeChange}
              title="Select Task Assignees"
            />
          </div>
          
          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags/Categories
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full flex items-center"
                >
                  {tag}
                  <button 
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 border-l-0 rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {/* Subtasks */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subtasks
            </label>
            <div className="space-y-2 mb-2">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={subtask.is_completed}
                    onChange={() => toggleSubtaskCompletion(subtask.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => {
                      const updatedSubtasks = [...subtasks];
                      const subtaskIndex = updatedSubtasks.findIndex(s => s.id === subtask.id);
                      updatedSubtasks[subtaskIndex].title = e.target.value;
                      setSubtasks(updatedSubtasks);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add subtask"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 border-l-0 rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupTaskModal; 