// src/components/tasks/TaskCard.jsx
import React, { useState } from 'react';
import { Clock, Tag, CheckSquare, MoreVertical, Plus } from 'lucide-react';

const TaskCard = ({ task }) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const priorityClasses = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-amber-100 text-amber-800',
    urgent: 'bg-red-100 text-red-800'
  };

  // Function to handle adding new subtask
  const handleAddSubtask = () => {
    // This would be implemented in the parent component
    console.log('Add subtask to task:', task.id);
  };
  const handleChangeStatus = () =>{
    
  }
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu">
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                    role="menuitem"
                  >
                    Edit Task
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                    role="menuitem"
                  >
                    Delete Task
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
        
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex items-center text-xs text-gray-500">
            <Clock size={14} className="mr-1" />
            {task.dueDate}
          </div>
          
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityClasses[task.priority]}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          
          {task.tags.map((tag, index) => (
            <div key={index} className="flex items-center text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
              <Tag size={12} className="mr-1" />
              {tag}
            </div>
          ))}
        </div>
        
        {task.subtasks.length > 0 && (
          <div className="mb-2">
            <button 
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center"
            >
              <CheckSquare size={14} className="mr-1" />
              {task.subtasks.length} Subtasks {showSubtasks ? '(Hide)' : '(Show)'}
            </button>
          </div>
        )}
        
        {showSubtasks && task.subtasks.length > 0 && (
          <div className="border-t border-gray-100 mt-3 pt-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Subtasks</h4>
            <ul className="space-y-2">
              {task.subtasks.map((subtask, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={subtask.completed} 
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                    {subtask.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex justify-between items-center">
        <button 
          onClick={handleAddSubtask}
          className="text-xs flex items-center text-gray-600 hover:text-gray-900"
        >
          <Plus size={14} className="mr-1" />
          Add Subtask
        </button>
        
        <button onClick={handleChangeStatus} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {task.status}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;