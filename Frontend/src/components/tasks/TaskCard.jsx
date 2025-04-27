// src/components/tasks/TaskCard.jsx
import React, { useState } from 'react';
import { Clock, Tag, CheckSquare, MoreVertical, Plus } from 'lucide-react';

const TaskCard = ({ 
  task, 
  onUpdateTask, 
  onDeleteTask, 
  // onAddSubtask,
  // onUpdateSubtask
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const dueDate = new Date(task.dueDate);
  const date = dueDate.toLocaleDateString();     // e.g., "4/25/2025"
  const time = dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
  const priorityClasses = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-amber-100 text-amber-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    'To Do': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800'
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    onUpdateTask(task.id, { ...task, status: newStatus });
    setShowMenu(false);
  };

  // Handle adding a new subtask
  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim() !== '') {
      const updatedSubtasks = [
        ...task.subtasks,
        { title: newSubtaskTitle.trim(), completed: false }
      ];
      onUpdateTask(task.id, { ...task, subtasks: updatedSubtasks });
      setNewSubtaskTitle('');
      setShowSubtaskInput(false);
      // If subtasks were hidden, show them after adding
      if (!showSubtasks) {
        setShowSubtasks(true);
      }
    }
  };

  // Handle subtask completion toggle
  const handleSubtaskToggle = (index) => {
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[index].completed = !updatedSubtasks[index].completed;
    onUpdateTask(task.id, { ...task, subtasks: updatedSubtasks });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-auto">
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
                    onClick={() => {
                      setShowMenu(false);
                      onUpdateTask(task.id, task, true); // true flag indicates edit mode
                    }}
                  >
                    Edit Task
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                    role="menuitem"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this task?")) {
                        onDeleteTask(task.id);
                      }
                      setShowMenu(false);
                    }}
                  >
                    Delete Task
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="px-4 py-1 text-xs text-gray-500">Change Status:</div>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                    role="menuitem"
                    disabled={task.status === 'To Do'}
                    onClick={() => handleStatusChange('To Do')}
                  >
                    To Do
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                    role="menuitem"
                    disabled={task.status === 'In Progress'}
                    onClick={() => handleStatusChange('In Progress')}
                  >
                    In Progress
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                    role="menuitem"
                    disabled={task.status === 'Completed'}
                    onClick={() => handleStatusChange('Completed')}
                  >
                    Completed
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
            <p className='text-red-500'>{date} {time}</p>
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
                    onChange={() => handleSubtaskToggle(index)}
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

        {showSubtaskInput && (
          <div className="border-t border-gray-100 mt-3 pt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Enter subtask title"
                className="flex-1 text-sm px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubtask();
                  }
                }}
              />
              <button
                onClick={handleAddSubtask}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => setShowSubtaskInput(false)}
                className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex justify-between items-center">
        <button 
          onClick={() => setShowSubtaskInput(true)}
          className="text-xs flex items-center text-gray-600 hover:text-gray-900"
        >
          <Plus size={14} className="mr-1" />
          Add Subtask
        </button>
        
        <span className={`text-xs px-2 py-1 rounded ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;