// src/components/tasks/TaskList.jsx
import React from 'react';
import TaskCard from './TaskCard';
import { FiClipboard, FiClock, FiCheckCircle } from 'react-icons/fi';

const TaskList = ({ 
  tasks, 
  onUpdateTask, 
  onDeleteTask, 
  onAddSubtask,
  onUpdateSubtask 
}) => {
  // Separate tasks by status
  const todoTasks = tasks.filter(task => task.status === 'To Do');
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
  const completedTasks = tasks.filter(task => task.status === 'Completed');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* To Do Column */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiClipboard className="text-gray-500 dark:text-gray-400" />
              <h2 className="font-medium text-gray-800 dark:text-gray-200">To Do</h2>
            </div>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full px-2 py-0.5">
              {todoTasks.length}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
          {todoTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onAddSubtask={onAddSubtask}
              onUpdateSubtask={onUpdateSubtask}
            />
          ))}
          {todoTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <FiClipboard className="text-gray-500 dark:text-gray-400" />
              </div>
              No tasks to do
            </div>
          )}
        </div>
      </div>

      {/* In Progress Column */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiClock className="text-blue-600 dark:text-blue-400" />
              <h2 className="font-medium text-blue-800 dark:text-blue-300">In Progress</h2>
            </div>
            <span className="bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full px-2 py-0.5">
              {inProgressTasks.length}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
          {inProgressTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onAddSubtask={onAddSubtask}
              onUpdateSubtask={onUpdateSubtask}
            />
          ))}
          {inProgressTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                <FiClock className="text-blue-600 dark:text-blue-400" />
              </div>
              No tasks in progress
            </div>
          )}
        </div>
      </div>

      {/* Completed Column */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-green-600 dark:text-green-400" />
              <h2 className="font-medium text-green-800 dark:text-green-300">Completed</h2>
            </div>
            <span className="bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-300 text-xs font-medium rounded-full px-2 py-0.5">
              {completedTasks.length}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
          {completedTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onAddSubtask={onAddSubtask}
              onUpdateSubtask={onUpdateSubtask}
            />
          ))}
          {completedTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                <FiCheckCircle className="text-green-600 dark:text-green-400" />
              </div>
              No completed tasks
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
