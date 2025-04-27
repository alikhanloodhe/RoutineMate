// src/components/tasks/TaskList.jsx
import React from 'react';
import TaskCard from './TaskCard';

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
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="font-medium text-gray-800 mb-4 flex items-center justify-between">
          <span>To Do</span>
          <span className="bg-gray-200 text-gray-800 text-xs font-medium rounded-full px-2 py-0.5">
            {todoTasks.length}
          </span>
        </h2>
        <div className="space-y-4">
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
            <div className="text-center py-8 text-gray-500 text-sm">
              No tasks to do
            </div>
          )}
        </div>
      </div>

      {/* In Progress Column */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="font-medium text-gray-800 mb-4 flex items-center justify-between">
          <span>In Progress</span>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium rounded-full px-2 py-0.5">
            {inProgressTasks.length}
          </span>
        </h2>
        <div className="space-y-4">
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
            <div className="text-center py-8 text-gray-500 text-sm">
              No tasks in progress
            </div>
          )}
        </div>
      </div>

      {/* Completed Column */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="font-medium text-gray-800 mb-4 flex items-center justify-between">
          <span>Completed</span>
          <span className="bg-green-100 text-green-800 text-xs font-medium rounded-full px-2 py-0.5">
            {completedTasks.length}
          </span>
        </h2>
        <div className="space-y-4">
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
            <div className="text-center py-8 text-gray-500 text-sm">
              No completed tasks
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
