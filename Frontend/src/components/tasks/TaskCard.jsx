import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiClock, FiCheck, FiSquare, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const TaskCard = ({ task, onStartTimer, onToggleCompletion, onToggleSubtask, onAddSubtask, onEdit, onDelete }) => {
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

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
      case 'Physical':
        return 'text-blue-600';
      case 'Mental':
        return 'text-green-600';
      case 'Spiritual':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    
    onAddSubtask(task.id, newSubtaskTitle);
    setNewSubtaskTitle('');
    setShowAddSubtask(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
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
              
              onClick={() => onToggleCompletion(task.id)}
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
                <span className="text-sm text-green-500">Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
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
                    autoFocus
                  />
                  <div className="flex">
                    <button 
                      className="px-3 py-2 bg-[#5D4EFF] text-white text-sm hover:bg-[#4A2BAF]"
                      onClick={handleAddSubtask}
                    >
                      Add
                    </button>
                    <button 
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                      onClick={() => setShowAddSubtask(false)}
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
                        onClick={() => onToggleSubtask(task.id, subtask.id)}
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
                  Category: {task.category}
                </span>
                <span className="text-sm text-gray-500">
                  Time spent: {task.timeSpent.formatted? task.timeSpent.formatted:'0h 0m'}
                </span>
                { (
                  <span className="text-sm text-gray-500">
                    Estimated: {`${task.estimated_time.hours} hours ${task.estimated_time.minutes} minutes`}
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
                  className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
                >
                  <FiClock className="mr-2" />
                  Start Timer
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