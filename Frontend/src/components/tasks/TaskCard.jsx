import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiClock, FiCheck, FiSquare, FiPlus, FiEdit2, FiTrash2, FiCalendar, FiAlertCircle } from 'react-icons/fi';

const TaskCard = ({ task, onStartTimer, onComplete, onToggleSubtask, onAddSubtask, onEdit, onDelete, isTimerActive }) => {
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const getPriorityClass = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryClass = (category) => {
    switch(category?.toLowerCase()) {
      case 'physical':
        return 'text-blue-600';
      case 'mental':
        return 'text-green-600';
      case 'spiritual':
        return 'text-purple-600';
      case 'social':
        return 'text-orange-600';  
      default:
        return 'text-gray-600';
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    
    setIsAddingSubtask(true);
    try {
      await onAddSubtask(newSubtaskTitle);
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
    } catch (error) {
      console.error('Error adding subtask:', error);
    } finally {
      setIsAddingSubtask(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  // Check if a subtask is completed based on its status
  const isSubtaskCompleted = (subtask) => {
    return subtask.status === 'completed' || subtask.completed === true;
  };

  // Count completed subtasks
  const completedSubtasks = task.subtasks ? 
    task.subtasks.filter(st => isSubtaskCompleted(st)).length : 0;

  // Format time spent and estimated time
  const formatTimeDisplay = (timeObj) => {
    if (!timeObj) return '0h 0m';
    
    if (typeof timeObj === 'string') {
      return timeObj;
    }
    
    if (timeObj.formatted) {
      return timeObj.formatted;
    }
    
    const hours = timeObj.hours || 0;
    const minutes = timeObj.minutes || 0;
    return `${hours}h ${minutes}m`;
  };

  // Format due date
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  const isCompleted = task.completed || task.status === 'completed';
  const formattedDueDate = formatDueDate(task.dueDate);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={`border rounded-xl shadow-sm overflow-hidden mb-3 ${
        isTimerActive 
          ? 'border-[#4A2BAF] bg-[#4A2BAF]/5' 
          : isCompleted 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-200 bg-white hover:border-[#4A2BAF]/30'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side with checkbox */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => onComplete(task.id)}
              className="w-5 h-5 flex-shrink-0 transition-all duration-200"
            >
              {isCompleted ? (
                <div className="w-5 h-5 rounded-md bg-[#4A2BAF] flex items-center justify-center text-white">
                  <FiCheck className="w-3 h-3" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-md border border-gray-300 hover:border-[#4A2BAF]"></div>
              )}
            </button>
            
            {/* Title and category */}
            <div>
              <h3 className={`font-medium ${
                isTimerActive 
                  ? 'text-[#4A2BAF]' 
                  : isCompleted 
                  ? 'text-green-700' 
                  : 'text-gray-800'
              }`}>
                {task.title || task.name}
              </h3>
              <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}>
                  {task.category}
                </span>
                <span className="flex items-center">
                  <FiClock className="w-3 h-3 mr-1" />
                  Est: {formatTimeDisplay(task.estimated_time)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Status badge */}
          {isTimerActive && (
            <span className="text-xs px-2 py-1 rounded-full bg-[#4A2BAF] text-white flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
              Active
            </span>
          )}
          
          {/* Action buttons */}
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-gray-400 hover:text-[#4A2BAF] hover:bg-[#4A2BAF]/5 rounded-md transition-colors"
              title="Edit task"
            >
              <FiEdit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete task"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Description if available */}
        {task.description && (
          <div className="mt-2 text-sm text-gray-600">
            {task.description}
          </div>
        )}
        
        {/* Subtasks Section */}
        {task.subtasks && task.subtasks.length > 0 ? (
          <div className="mt-3 mb-1">
            <div className="text-xs font-medium text-gray-500 mb-2 flex justify-between items-center">
              <span>SUBTASKS ({completedSubtasks}/{task.subtasks.length})</span>
              <button 
                onClick={() => setShowAddSubtask(true)}
                className="text-xs text-[#4A2BAF] hover:text-[#3A1C9F]"
              >
                <FiPlus className="inline-block mr-0.5" /> Add
              </button>
            </div>
            <div className="space-y-1.5 bg-gray-50 p-2 rounded-md">
              {task.subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center">
                  <button 
                    onClick={() => onToggleSubtask(subtask.id)}
                    className="mr-2"
                  >
                    {isSubtaskCompleted(subtask) ? (
                      <div className="w-4 h-4 rounded bg-[#4A2BAF] flex items-center justify-center text-white">
                        <FiCheck className="w-2 h-2" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded border border-gray-300 hover:border-[#4A2BAF]"></div>
                    )}
                  </button>
                  <span className={`text-sm ${isSubtaskCompleted(subtask) ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {subtask.title || subtask.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 mb-1">
            <div className="text-xs font-medium text-gray-500 mb-2 flex justify-between items-center">
              <span>SUBTASKS (0/0)</span>
              <button 
                onClick={() => setShowAddSubtask(true)}
                className="text-xs text-[#4A2BAF] hover:text-[#3A1C9F]"
              >
                <FiPlus className="inline-block mr-0.5" /> Add
              </button>
            </div>
          </div>
        )}
        
        {/* Add subtask form */}
        {showAddSubtask && (
          <div className="mt-3 mb-2">
            <div className="flex items-center rounded border border-gray-200 overflow-hidden">
              <input
                type="text"
                className="flex-1 px-3 py-2 text-sm outline-none"
                placeholder="Add new subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAddingSubtask}
                autoFocus
              />
              <div className="flex">
                <button 
                  className="px-3 py-2 bg-[#4A2BAF] text-white text-sm hover:bg-[#3A1C9F] disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={handleAddSubtask}
                  disabled={isAddingSubtask || !newSubtaskTitle.trim()}
                >
                  {isAddingSubtask ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : 'Add'}
                </button>
                <button 
                  className="px-3 py-2 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                  onClick={() => setShowAddSubtask(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer with metadata */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center text-gray-500">
            {/* Time spent info */}
            <div className="flex items-center mr-3">
              <FiClock className="w-3 h-3 mr-1" />
              <span>Spent: {formatTimeDisplay(task.timeSpent)}</span>
            </div>
            
            {/* Due date if available */}
            {formattedDueDate && (
              <div className="flex items-center">
                <FiCalendar className="w-3 h-3 mr-1" />
                <span>Due: {formattedDueDate}</span>
              </div>
            )}
          </div>
          
          {/* Priority indicator */}
          <div className="flex items-center">
            <span className={`px-2 py-0.5 rounded-full ${getPriorityClass(task.priority)}`}>
              {task.priority} Priority
            </span>
          </div>
        </div>
        
        {/* Timer button */}
        <div className="mt-3 flex justify-end">
          <button 
            onClick={() => onStartTimer(task.id)}
            disabled={isTimerActive || isCompleted}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm transition-colors ${
              isTimerActive 
                ? 'bg-[#4A2BAF]/10 text-[#4A2BAF] cursor-default'
                : isCompleted
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-[#4A2BAF] text-white hover:bg-[#3A1C9F]'
            }`}
            title={isCompleted ? "Can't start timer for completed tasks" : "Start timer for this task"}
          >
            <FiClock className={`mr-1.5 ${isTimerActive ? 'animate-pulse' : ''}`} />
            {isTimerActive ? 'Timer Active' : 'Start Timer'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard; 