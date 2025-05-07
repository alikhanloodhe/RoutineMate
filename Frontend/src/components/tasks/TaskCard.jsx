import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiClock, FiCheck, FiSquare, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const TaskCard = ({ task, onStartTimer, onComplete, onToggleSubtask, onAddSubtask, onEdit, onDelete, isTimerActive }) => {
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const getPriorityClass = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
    if (!dateStr) return 'No due date';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="p-5">
        <div className="flex items-start">
          <div className="mr-3 mt-1" >
            <div 
              className={`w-5 h-5 rounded-full ${task.completed || task.status === 'completed' ? 'bg-[#5D4EFF]' : 'border-2 border-gray-300'} flex items-center justify-center cursor-pointer`}
              onClick={() => onComplete(task.id)}
            >
              {(task.completed || task.status === 'completed') && <FiCheck className="text-white" size={12} />}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <h2 className={`text-lg font-semibold ${task.completed || task.status === 'completed' ? 'text-gray-400 line-through' : 'text-[#1C1C1C]'}`}>
                {task.title || task.name}
              </h2>
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}>
                  {task.priority} Priority
                </span>
                {task.dueDate && (
                  <span className="text-sm text-green-500">Due: {formatDueDate(task.dueDate)}</span>
                )}
              </div>
            </div>
            <p className={`${task.completed || task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
              {task.description}
            </p>
            
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">
                  {task.subtasks && task.subtasks.length > 0 
                    ? `Subtasks (${completedSubtasks}/${task.subtasks.length})` 
                    : "Subtasks (0)"}
                </div>
                <button 
                  className="text-xs text-[#5D4EFF] hover:text-[#4A2BAF] flex items-center"
                  onClick={() => setShowAddSubtask(true)}
                >
                  <FiPlus className="mr-1" /> Add subtask
                </button>
              </div>
              
              {showAddSubtask && (
                <div className="flex items-center mb-3 rounded border border-gray-200 overflow-hidden">
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
                      className="px-3 py-2 bg-[#5D4EFF] text-white text-sm hover:bg-[#4A2BAF] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                      onClick={handleAddSubtask}
                      disabled={isAddingSubtask || !newSubtaskTitle.trim()}
                    >
                      {isAddingSubtask ? (
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                      ) : null}
                      Add
                    </button>
                    <button 
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                      onClick={() => setShowAddSubtask(false)}
                      disabled={isAddingSubtask}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="space-y-2">
                  {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center">
                      <div 
                        className="cursor-pointer mr-2" 
                        onClick={() => onToggleSubtask(subtask.id)}
                      >
                        {isSubtaskCompleted(subtask) ? (
                          <FiCheck className="text-[#5D4EFF]" />
                        ) : (
                          <FiSquare className="text-gray-400" />
                        )}
                      </div>
                      <span className={`text-sm ${isSubtaskCompleted(subtask) ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {subtask.title || subtask.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-between mt-3">
              <div className="flex items-center space-x-4">
                <span className={`text-sm font-medium ${getCategoryClass(task.category)}`}>
                  {task.category}
                </span>
                <span className="text-sm text-gray-500">
                  Time spent: {formatTimeDisplay(task.timeSpent)}
                </span>
                {task.estimated_time && (
                  <span className="text-sm text-gray-500">
                    Est: {formatTimeDisplay(task.estimated_time)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <button 
                  onClick={() => onEdit(task)}
                  className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
                >
                  <FiEdit2 className="mr-2" />
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(task.id)}
                  className="flex items-center px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
                >
                  <FiTrash2 className="mr-2" />
                  Delete
                </button>
                <button 
                  onClick={() => onStartTimer(task.id)}
                  disabled={isTimerActive}
                  className={`flex items-center px-3 py-1 rounded-md text-sm ${
                    isTimerActive 
                      ? 'bg-[#4A2BAF]/10 text-[#4A2BAF]' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <FiClock className={`mr-2 ${isTimerActive ? 'animate-pulse' : ''}`} />
                  {isTimerActive ? 'Active' : 'Start Timer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard; 